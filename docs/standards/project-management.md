# Project Management Standards

Single source of truth for how work is tracked across issues, labels, and GitHub Projects.
Package-level `issue-tracker.md` files cover CLI usage and label taxonomy; this file covers **policy**.

---

## 1. Source of Truth Map

| Concern        | Source of truth                          | Do not duplicate in                   |
| :------------- | :--------------------------------------- | :------------------------------------ |
| Workflow state | Project `Status` field (Backlog → Done)  | labels, issue body                    |
| Priority       | label `priority:p0/p1/p2`                | Projects `Priority` field, issue body |
| Parent / child | native sub-issues                        | issue body (`Parent: #...`)           |
| Blockers       | native issue dependencies (`blocked_by`) | issue body (`Blocked by: ...`)        |
| Work type      | label `type:*`                           | issue body                            |
| Area           | label `area:*`                           | issue body                            |

The Projects `Priority` field was removed. Project fields are invisible to `gh issue list`, issue search,
notifications, and issue pages, so a field cannot be the source of truth for priority.

---

## 2. Status Workflow

`Status` lives on the project item, not on the issue. One item, one status.

| Status        | Entry criteria                                                                                                                              | WIP limit |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------ | :-------- |
| `Backlog`     | Not scheduled. Default for every new item.                                                                                                  | —         |
| `Ready`       | All `blocked_by` issues closed **and** acceptance checklist present **and** estimate ≤ 3 days **and** the modules to change are identified. | 5         |
| `In progress` | A branch is open.                                                                                                                           | 2         |
| `In review`   | A pull request is open.                                                                                                                     | —         |
| `Done`        | PR merged, **or** issue closed as `completed`.                                                                                              | —         |

Rules:

- `Ready` is verifiable, not a feeling. "Will do in 1–2 weeks" is not a criterion.
- An item closed as `not planned` (superseded, out of scope) is **not** `Done`. Remove it from the project.
- Moving to `In review` happens when the PR is opened; moving to `Done` happens when it merges.
- If `Ready` exceeds 5 items, demote the least urgent ones to `Backlog` instead of keeping a second backlog.

---

## 3. Priority

Priority is a property of the **issue**, expressed only as a label.

- `priority:p0` — Drop everything. Production down, data loss, active security incident.
- `priority:p1` — On the critical path: it blocks other open work. Keep at most 5.
- `priority:p2` — Normal. Default for everything else.

Rules:

- Priority is assigned to **leaf tasks only**. Epics and features carry no priority; their importance is
  derived from how many tasks they block.
- `p1` selection is mechanical, not vibes: rank leaf tasks by transitive blocker fan-out and take the top
  five on the critical path.
- `p0` is expected to be empty most of the time. An always-non-empty `p0` means the definition is being ignored.
- Do not recreate the Projects `Priority` field. Use `label:` filters instead:

```bash
gh issue list --state open --label priority:p1
gh project item-list 3 --owner ngxccc --query "label:priority:p1"
```

---

## 4. Native Relationships

Parent/child and blocker links are **native GitHub relationships**, never body text.

```bash
gh issue edit 173 --parent 167
gh issue edit 173 --add-blocked-by 170,185
gh issue view 173 --json parent,subIssues,blockedBy,blocking
```

- Write relationships through the issue sidebar or the CLI flags above.
- Never add `Parent:` or `Blocked by:` lines to an issue body. They drift out of sync with the native graph
  and have already produced incorrect backlog data.

---

## 5. Project Views

Project #3 keeps a maximum of three views; every view must have a filter and a distinct purpose.

| View                  | Layout                     | Filter                               | Purpose                           |
| :-------------------- | :------------------------- | :----------------------------------- | :-------------------------------- |
| `🧭 Plan`             | Table + **Show hierarchy** | `is:open`                            | Full backlog, epic → task nesting |
| `🎯 Focus`            | Board                      | `is:open status:Ready,"In progress"` | What is being worked on now       |
| `🐛 Bugs & Tech Debt` | Table                      | `is:open label:type:fix,tech-debt`   | Defect and debt queue             |

Rules:

- Hierarchy view works only in the **Table** layout. Board and Roadmap never nest sub-issues.
- Do not create a view whose filter can never match (e.g. assignee filter with no assignees, roadmap with no dates).
- A view that shows every item unfiltered duplicates `Plan` and should be deleted.

---

## 6. Issue Templates

- **Feature / Epic** — `.github/ISSUE_TEMPLATE/feature_request.yml`
- **Task / Sub-Issue / Tech Debt** — `.github/ISSUE_TEMPLATE/task.yml`
- **Bug Report** — `.github/ISSUE_TEMPLATE/bug_report.yml`

Templates must not ask for parent or blocker numbers. Those are set natively after creation.
