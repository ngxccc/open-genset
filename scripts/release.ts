#!/usr/bin/env bun
/**
 * Cut a release in one command: bump → changelog → PR → merge → tag → publish.
 *
 * `main` is protected, so the bump cannot be pushed directly; it travels as a PR that
 * contains only the version numbers and the new CHANGELOG.md section. The script waits for
 * that PR's checks, squash-merges it, then creates the tag and the GitHub release.
 *
 * Notes come from GitHub's own release-notes generator (`generate-notes`, the same one behind
 * `gh release create --generate-notes`), so `.github/release.yml` stays the only place that
 * decides categories. We call it once and write the result into both CHANGELOG.md and the
 * release page, which is why the two can never disagree.
 *
 * Usage:
 *   bun run release 1.2.3            # explicit version
 *   bun run release minor            # patch | minor | major, from the latest tag
 *   bun run release minor --dry-run  # validate and print the plan, change nothing
 */
import { readFileSync, writeFileSync } from "node:fs";
import {
  MANIFESTS,
  SEMVER,
  compareVersions,
  currentVersion,
  setVersion,
} from "./version";

const CHANGELOG = "CHANGELOG.md";
const CHECK_TIMEOUT_MS = 45 * 60 * 1000;
const POLL_MS = 15_000;
const NO_CHECKS_GRACE_MS = 5 * 60 * 1000;

function fail(message: string): never {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

function step(message: string): void {
  console.log(`\n▸ ${message}`);
}

type RunOptions = { capture?: boolean; allowFailure?: boolean; input?: string };

function run(cmd: string[], options: RunOptions = {}): string {
  const { capture = false, allowFailure = false, input } = options;
  const proc = Bun.spawnSync({
    cmd,
    stdin: input ? new TextEncoder().encode(input) : "inherit",
    stdout: capture ? "pipe" : "inherit",
    stderr: capture ? "pipe" : "inherit",
  });
  const output = capture ? (proc.stdout?.toString() ?? "").trim() : "";
  if (proc.exitCode !== 0 && !allowFailure) {
    if (capture) console.error(proc.stderr?.toString().trim());
    fail(`command failed (${proc.exitCode}): ${cmd.join(" ")}`);
  }
  return output;
}

function latestTag(): string | null {
  const tags = run(["git", "tag", "--list", "v*", "--sort=-v:refname"], {
    capture: true,
  })
    .split("\n")
    .filter(Boolean);
  return tags[0] ?? null;
}

/**
 * Accepts `1.2.3` or `patch|minor|major` (relative to `latest`, the newest tag).
 * `latest` is injected so this can be tested without a git history.
 */
export function resolveTarget(
  input: string,
  latest: string | null = latestTag(),
): string {
  if (SEMVER.test(input)) return input;

  if (input === "patch" || input === "minor" || input === "major") {
    const base = latest?.replace(/^v/, "") ?? currentVersion() ?? "0.0.0";
    const [major, minor, patch] = base.split(".").map(Number);
    if (input === "major") return `${major + 1}.0.0`;
    if (input === "minor") return `${major}.${minor + 1}.0`;
    return `${major}.${minor}.${patch + 1}`;
  }

  fail(
    `not a version or bump type: ${input}\nusage: bun run release <x.y.z|major|minor|patch>`,
  );
}

function assertReady(target: string): void {
  if (run(["git", "status", "--porcelain"], { capture: true }) !== "") {
    fail("working tree is dirty — commit or stash before releasing");
  }

  const branch = run(["git", "rev-parse", "--abbrev-ref", "HEAD"], {
    capture: true,
  });
  if (branch !== "main") {
    fail(`release from main, not from ${branch}`);
  }

  run(["git", "fetch", "origin", "main", "--quiet"]);
  const head = run(["git", "rev-parse", "HEAD"], { capture: true });
  const remote = run(["git", "rev-parse", "origin/main"], { capture: true });
  if (head !== remote) {
    fail("local main is not origin/main — pull first");
  }

  const latest = latestTag()?.replace(/^v/, "");
  const reference = latest ?? currentVersion();
  if (reference && compareVersions(target, reference) <= 0) {
    fail(`v${target} is not newer than v${reference}`);
  }

  if (run(["git", "tag", "--list", `v${target}`], { capture: true })) {
    fail(`tag v${target} already exists`);
  }
  const existing = Bun.spawnSync({
    cmd: ["gh", "release", "view", `v${target}`],
    stdout: "ignore",
    stderr: "ignore",
  });
  if (existing.exitCode === 0) {
    fail(`release v${target} already exists`);
  }
}

function repoSlug(): string {
  return run(
    ["gh", "repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"],
    {
      capture: true,
    },
  );
}

/** Notes for the release we are about to cut, from GitHub's generator. */
function generateNotes(target: string, head: string): string {
  const previous = latestTag();
  const fields = [
    "-f",
    `tag_name=v${target}`,
    "-f",
    `target_commitish=${head}`,
    ...(previous ? ["-f", `previous_tag_name=${previous}`] : []),
  ];
  return run(
    [
      "gh",
      "api",
      "--method",
      "POST",
      `repos/${repoSlug()}/releases/generate-notes`,
      ...fields,
      "--jq",
      ".body",
    ],
    { capture: true },
  );
}

function seedChangelog(path: string = CHANGELOG): void {
  const header = [
    "# Changelog",
    "",
    "Generated at release time from merged pull requests, by `bun run release`.",
    "Do not edit by hand; the sections come from the same generator as the GitHub release.",
    "",
  ].join("\n");

  const previous = latestTag();
  if (!previous) {
    createOnly(path, header);
    return;
  }

  const body = run(
    ["gh", "release", "view", previous, "--json", "body", "--jq", ".body"],
    { capture: true, allowFailure: true },
  );
  const date = run(
    ["git", "log", "-1", "--format=%ad", "--date=short", previous],
    { capture: true },
  );
  createOnly(path, `${header}\n## ${previous} - ${date}\n\n${body}\n`);
}

/** Create the file only if it does not exist, without a check-then-write race. */
function createOnly(path: string, content: string): void {
  try {
    writeFileSync(path, content, { flag: "wx" });
  } catch (error) {
    if ((error as { code?: string }).code !== "EEXIST") throw error;
  }
}

/** Put the newest version directly under the preamble. */
export function prependChangelog(
  target: string,
  body: string,
  path: string = CHANGELOG,
): void {
  seedChangelog(path);
  const date = new Date().toISOString().slice(0, 10);
  const heading = `## ${target} - ${date}\n\n${body}\n`;
  const existing = readFileSync(path, "utf8");

  // Insert after the preamble so the newest version sits first.
  const preambleEnd = existing.indexOf("\n## ");
  const updated =
    preambleEnd === -1
      ? `${existing.trimEnd()}\n\n${heading}`
      : `${existing.slice(0, preambleEnd).trimEnd()}\n\n${heading}${existing.slice(preambleEnd + 1)}`;
  writeFileSync(path, updated);
}

type Check = { name: string; bucket: string };

function waitForChecks(pr: number): void {
  const startedAt = Date.now();
  const deadline = startedAt + CHECK_TIMEOUT_MS;
  let announced = false;

  while (Date.now() < deadline) {
    const raw = run(
      ["gh", "pr", "checks", String(pr), "--json", "name,bucket"],
      {
        capture: true,
        allowFailure: true,
      },
    );

    let checks: Check[] = [];
    try {
      checks = JSON.parse(raw) as Check[];
    } catch {
      checks = [];
    }

    if (checks.length > 0) {
      if (!announced) {
        console.log(`  ${checks.length} checks reported; waiting…`);
        announced = true;
      }
      const failed = checks.filter(
        (check) => check.bucket === "fail" || check.bucket === "cancel",
      );
      if (failed.length > 0) {
        fail(
          `checks failed: ${failed.map((check) => check.name).join(", ")}\nbranch and PR left in place for inspection`,
        );
      }
      const pending = checks.filter(
        (check) => check.bucket !== "pass" && check.bucket !== "skipping",
      );
      if (pending.length === 0) return;
    } else if (Date.now() - startedAt > NO_CHECKS_GRACE_MS) {
      fail("no checks were reported on the PR after five minutes");
    }

    Bun.sleepSync(POLL_MS);
  }

  fail("timed out waiting for checks");
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const input = args.find((arg) => !arg.startsWith("--"));

  if (!input) {
    fail("usage: bun run release <x.y.z|major|minor|patch> [--dry-run]");
  }

  const target = resolveTarget(input);
  const branch = `chore/release-v${target}`;
  const head = run(["git", "rev-parse", "HEAD"], { capture: true });

  step(`Release v${target}${dryRun ? " (dry run)" : ""}`);
  assertReady(target);
  console.log(
    `  from ${head.slice(0, 7)} on main, previous tag ${latestTag() ?? "none"}`,
  );

  if (dryRun) {
    console.log(`
  Plan:
    1. branch ${branch}
    2. generate notes, prepend ${CHANGELOG}
    3. write ${target} into ${MANIFESTS.length} manifests
    4. commit chore(release): v${target} and push
    5. open PR against main, wait for checks
    6. squash-merge, return to main
    7. gh release create v${target} with the same notes
  `);
    process.exit(0);
  }

  step(`Branch ${branch}`);
  run(["git", "switch", "-c", branch]);

  step("Generate release notes");
  const notes = generateNotes(target, head);
  if (!notes.trim()) fail("release notes came back empty");
  prependChangelog(target, notes);

  step(`Write ${target} into ${MANIFESTS.length} manifests`);
  setVersion(target);

  step(`Commit and push`);
  run(["git", "add", ...MANIFESTS, CHANGELOG]);
  run(["git", "commit", "-m", `chore(release): v${target}`]);
  run(["git", "push", "-u", "origin", branch]);

  step("Open pull request");
  const url = run(
    [
      "gh",
      "pr",
      "create",
      "--base",
      "main",
      "--head",
      branch,
      "--title",
      `chore(release): v${target}`,
      "--body",
      `Version bump to v${target} plus the ${CHANGELOG} entry for it.\n\nNotes are generated from merged PRs, so this PR is bookkeeping only.`,
    ],
    { capture: true },
  );
  const prNumber = Number(url.match(/\/pull\/(\d+)/)?.[1]);
  if (!prNumber) fail(`could not read PR number from: ${url}`);
  console.log(`  ${url}`);

  step("Wait for checks");
  waitForChecks(prNumber);

  step("Merge");
  run(["gh", "pr", "merge", String(prNumber), "--squash"]);

  step("Return to main");
  run(["git", "switch", "main"]);
  run(["git", "pull", "--ff-only", "--quiet"]);
  run(["git", "push", "origin", "--delete", branch], { allowFailure: true });
  run(["git", "branch", "-D", branch], { allowFailure: true });

  const releaseSha = run(["git", "rev-parse", "HEAD"], { capture: true });
  const shipped = JSON.parse(readFileSync(MANIFESTS[0], "utf8")).version;
  if (shipped !== target) {
    fail(
      `main declares ${shipped}, expected ${target} — the merge did not land`,
    );
  }

  step(`Publish v${target}`);
  run(
    [
      "gh",
      "release",
      "create",
      `v${target}`,
      "--title",
      `v${target}`,
      "--notes-file",
      "-",
      "--target",
      releaseSha,
    ],
    { input: notes },
  );

  console.log(`\n✔ v${target} released from ${releaseSha.slice(0, 7)}`);
  console.log(`  https://github.com/${repoSlug()}/releases/tag/v${target}`);
}
