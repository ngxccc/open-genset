# Release & Versioning Standards

One product version across the whole monorepo; one way to cut a release, with a hand-run equivalent for the cases the script cannot cover. Both routes produce the same artifacts: the same five manifest versions, the same `CHANGELOG.md` section, the same tag, and the same release notes.

---

## 1. One Product Version

The three apps are not separate products. They deploy from `main`, ship together, and the API contract crosses them — a backend change is what makes an admin feature work. So they share one number:

| Manifest                       | Version |
| :----------------------------- | :------ |
| `package.json` (workspace)     | `1.0.0` |
| `backend/package.json`         | `1.0.0` |
| `admin/package.json`           | `1.0.0` |
| `storefront/package.json`      | `1.0.0` |
| `packages/shared/package.json` | `1.0.0` |

Why not per-app versions:

- Nothing reads these numbers at runtime and no package is published, so a version buys no compatibility guarantee.
- Internal dependencies use `workspace:*`, so no manifest records which sibling version it needs — a per-app number would be documentation no tool verifies.
- One change touching backend + admin would produce two tags and two changelogs for work that reached users at the same moment.

The tag is the version of record: `v1.2.3`. `package.json` mirrors it so tooling has something to read.

---

## 2. Cut a Release

### The default: one command

```bash
git switch main && git pull
bun run release                # infers patch | minor | major from merged PRs
bun run release 1.2.3          # explicit version
bun run release minor          # force a level
```

With no argument the level is inferred from the pull requests merged since the previous tag: one labelled `breaking-change` or titled `…!:` means **major**, any `type:feat` label or `feat:` title means **minor**, everything else means **patch**, and an empty range refuses to release. Titles and labels are read instead of commit subjects, so the answer does not change whether a pull request was squash-merged or rebase-merged. The suggestion prints the pull requests it counted and waits for a `y`; with no terminal (an agent, CI) it stops instead of guessing and prints the exact command to rerun. The release pull request itself is skipped — its merge commit is already inside the tag.

`scripts/release.ts` then runs five steps:

1. Refuses to start on a dirty tree, off `main`, behind `origin/main`, on a version that is not newer than the latest tag, or on a tag/release that already exists.
2. Opens `chore/release-v1.2.3` and asks GitHub's release-notes generator for this version's notes — the same generator behind `gh release create --generate-notes`, so `.github/release.yml` decides the categories.
3. Prepends the notes to `CHANGELOG.md` and writes `1.2.3` into all five manifests.
4. Commits, pushes, opens the PR, waits for its checks, squash-merges.
5. Returns to `main`, verifies the merged manifest says `1.2.3`, then creates the tag and the release from the **same notes body** streamed to `gh` on stdin — so the release page and `CHANGELOG.md` cannot disagree.

Preview without changing anything: `bun run release minor --dry-run`. It needs an authenticated `gh` and about three minutes (one for the pre-commit hook, two waiting on PR checks).

### The same five steps, by hand

Use this when the script fails in a way you do not want to debug mid-release, when you want to read the notes **before** anything is published, when the tag belongs on a commit that is not `main` HEAD (hotfix), or when the environment cannot run the script.

```bash
# 1. Preconditions
git switch main && git pull
bun run version:check                    # must print "versions aligned at X.Y.Z"

# 2. Bump on a branch — main is protected
git switch -c chore/release-v1.2.3
bun run version:bump 1.2.3

# 3. Generate the notes. Do not write them yourself.
gh api --method POST \
  "repos/$(gh repo view --json nameWithOwner --jq .nameWithOwner)/releases/generate-notes" \
  -f tag_name=v1.2.3 \
  -f target_commitish="$(git rev-parse main)" \
  -f previous_tag_name="$(git tag --list 'v*' --sort=-v:refname | head -1)" \
  --jq .body > "${TMPDIR:-/tmp}/release-notes.md"
```

4. Open `CHANGELOG.md` and add, directly under the preamble, a `## 1.2.3 - YYYY-MM-DD` heading and the contents of that notes file. You are pasting generator output, not writing prose — if you find yourself editing the wording, the categories in `.github/release.yml` are wrong.

```bash
# 5. Commit and open the PR
git add CHANGELOG.md package.json backend/package.json admin/package.json storefront/package.json packages/shared/package.json
git commit -m "chore(release): v1.2.3"
git push -u origin chore/release-v1.2.3
gh pr create --base main --title "chore(release): v1.2.3" --body "Version bump only."

# 6. Merge, then tag that exact commit and publish with the notes file
gh pr merge <number> --squash
git switch main && git pull
gh release create v1.2.3 --title v1.2.3 \
  --notes-file "${TMPDIR:-/tmp}/release-notes.md" \
  --target "$(git rev-parse HEAD)"
```

If `main` has moved since the PR merged, target the merge commit instead: `--target "$(git log --grep='chore(release): v1.2.3' --format=%H -1)"`. The tag must point at a commit whose manifests say `1.2.3`.

`main` requires a pull request, which is why a release is a PR at all; squash or rebase, since merge commits are disabled by the ruleset. The bump PR touches the root `package.json`, which is in every deploy workflow's path filter, so a release redeploys all three apps — one version, one moment.

### When it stops part-way

| Where it stopped                 | What is missing              | Do this                                                                                           |
| :------------------------------- | :--------------------------- | :------------------------------------------------------------------------------------------------ |
| Preconditions                    | nothing                      | nothing; the tree is untouched                                                                    |
| Before the bump commit exists    | the commit, PR, tag, release | check `CHANGELOG.md` for an existing `## 1.2.3` section so you do not paste twice, then steps 2–6 |
| Commit exists, branch not pushed | PR, tag, release             | `git push -u origin chore/release-v1.2.3`, open the PR (step 5), then step 6                      |
| PR open, checks failed           | merge, tag, release          | fix on the branch, push, `gh pr merge <n> --squash`, then step 6                                  |
| PR merged                        | tag, release                 | step 6                                                                                            |

### Undo a release

A release is bookkeeping around an already-deployed commit, so undoing it does **not** roll back the deploy — revert the commit for that.

```bash
gh release delete v1.2.3 --yes         # release page
git push origin --delete v1.2.3        # remote tag
git tag -d v1.2.3                      # local tag
```

Then revert the bump commit so the manifests stop claiming `1.2.3`. Never delete a tag and leave the manifests bumped: CI passes, but the repo now claims a version no release ever had.

---

## 3. CHANGELOG.md

`CHANGELOG.md` is generated at release time and committed by the release PR. It exists because notes that live only under `/releases` are invisible offline, invisible to a grep, and invisible to an agent reading the repo.

It was seeded from `v1.0.0` so history is not empty. Do not invent its content: every section is generator output, whichever route cut the release. `scripts/release.test.ts` guards the two failures that would corrupt it — computing the wrong next version, and putting the new section below the old one or duplicating the preamble.

The file is listed in `.prettierignore`. It is generated from the release body, so letting the pre-commit hook reformat it (bullets `*` → `-`, blank lines around headings) would make `CHANGELOG.md` and the release page differ by more than the heading the script adds.

---

## 4. Rules and CI

- Never bump one manifest by hand. `setVersion` in `scripts/version.ts` is the only writer, and `bun run version:bump` only writes manifests — it does not touch the changelog, commit, or tag.
- Never tag a commit whose manifests disagree. CI's `Version Consistency` job runs `bun scripts/version.ts check` on every PR and fails first.
- Never hand-write release notes or a changelog section. Change the categories in `.github/release.yml` instead. Categories match `type:*` labels, which `.github/workflows/pr-type-label.yml` derives from the pull request title (`feat:`, `fix(scope):`, `chore!:`, …) and keeps to exactly one per pull request — so the notes say _what_ changed, not _where_. `area:*` labels come from `.github/labeler.yml` and describe files; the notes do not use them. `dependencies` and `github_actions` are excluded, so dependency bumps stay out. A title with no conventional prefix keeps whatever labels it already has and lands in **Other Changes**.
- The semantic level is a judgement call, not a promise: `major` for a contract break admin and storefront must ship with, `minor` for new capability, `patch` for fixes. Nothing enforces it, because nothing consumes it.
- A tag without a release page is invisible to everyone except `git`; a release without a tag is not a release. Do both, or neither.

`Shared & Tooling Quality Gate` type-checks `packages/shared` and `scripts/` and runs both test suites, so a broken release script fails on the PR that breaks it rather than at release time.

`release-please` is deliberately absent: it opened a standing release PR on every push to `main`, re-running the full quality gate each time, and guessed the semantic level from commit messages — wrong whenever a `fix:` was really a feature. It also competed with the bump script over `package.json`. `bun run release` produces the same changelog and notes on demand, with the version chosen rather than guessed.
