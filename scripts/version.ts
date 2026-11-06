#!/usr/bin/env bun
/**
 * One product version, mirrored into every workspace manifest.
 *
 * Why one: admin, storefront and backend deploy from the same `main`, are private, are not
 * published, and no runtime reads their version. Per-app versions would mean three tags and
 * three changelogs for one change, with no consumer to justify the split.
 *
 * The number lives in the git tag (`v1.2.3`); package.json only mirrors it so tooling has
 * something to read. Dependents use `workspace:*`, so nothing depends on this value.
 *
 * Usage:
 *   bun run version:check          # exit 1 if manifests disagree (runs in CI)
 *   bun run version:bump 1.2.3     # write 1.2.3 into every manifest
 *   bun run release 1.2.3          # bump, PR, merge, tag and publish (scripts/release.ts)
 */
import { readFileSync, writeFileSync } from "node:fs";

export const MANIFESTS = [
  "package.json",
  "backend/package.json",
  "admin/package.json",
  "storefront/package.json",
  "packages/shared/package.json",
] as const;

export const SEMVER = /^\d+\.\d+\.\d+$/;

type Manifest = { version?: string; name?: string };

function read(path: string): Manifest {
  return JSON.parse(readFileSync(path, "utf8")) as Manifest;
}

function write(path: string, version: string): void {
  const raw = readFileSync(path, "utf8");
  const manifest = JSON.parse(raw) as Manifest;
  manifest.version = version;
  const indent = raw.match(/^(\s+)"/)?.[1] ?? "  ";
  writeFileSync(path, `${JSON.stringify(manifest, null, indent)}\n`);
}

/** Version declared by the root manifest. */
export function currentVersion(): string | undefined {
  return readVersion(MANIFESTS[0]);
}

/** Version declared by a single manifest. */
export function readVersion(path: string): string | undefined {
  return read(path).version;
}

/** Manifest paths whose version disagrees with the root one. */
export function mismatchedManifests(): (typeof MANIFESTS)[number][] {
  const root = currentVersion();
  return MANIFESTS.slice(1).filter((path) => read(path).version !== root);
}

/** Write `version` into every manifest. */
export function setVersion(version: string): void {
  for (const path of MANIFESTS) {
    write(path, version);
  }
}

/** -1 / 0 / 1, comparing major, minor, patch in that order. */
export function compareVersions(a: string, b: string): number {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

if (import.meta.main) {
  const [, , mode, next] = process.argv;

  if (mode === "check") {
    const root = currentVersion();
    const mismatched = mismatchedManifests();
    if (!root || mismatched.length > 0) {
      console.error(
        `version mismatch: ${MANIFESTS[0]} is ${root ?? "missing"}`,
      );
      for (const path of mismatched) {
        console.error(
          `  ${path}: ${JSON.parse(readFileSync(path, "utf8")).version ?? "missing"}`,
        );
      }
      console.error("run: bun run release <x.y.z>");
      process.exit(1);
    }
    console.log(`versions aligned at ${root}`);
  } else if (mode === "bump") {
    if (!next || !SEMVER.test(next)) {
      console.error("usage: bun run version:bump <major.minor.patch>");
      process.exit(1);
    }
    setVersion(next);
    console.log(
      `wrote ${next} to ${MANIFESTS.length} manifests; cut the release with: bun run release ${next}`,
    );
  } else {
    console.error(
      "usage: bun run version:check | bun run version:bump <x.y.z>",
    );
    process.exit(1);
  }
}
