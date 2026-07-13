# Group calls in Call History — Design

**Date:** 2026-07-13
**Type:** feature (`feat`)
**Tracking:** new issue on `NethServer/dev`, **sub-issue of #7133**. Design reference: Figma "History: Group calls" (file `Hn93CDQ1ZO78uljAl98Huh`, node `1055:22787`) / PdR-to-design #7371.
**Repos:** nethcti-middleware (grouping — main work), nethvoice-cti (UI). No nethcti-server change, no ns8-nethvoice change.

## Problem

In Call History a single logical call often produces several CDR legs sharing one `linkedid` (a group/queue call ringing multiple members, transfers, consultation legs). Today these appear as separate rows (or, for switchboard, are re-derived from transcripts). Users want one **parent row per call** that can be **expanded** to reveal all its interactions — matching the Figma design.

## Goal / Scope

- Applies to **all three history views**: Personal (`user`), Switchboard, Groups.
- A call with more than one interaction shows:
  - a circular green **caret toggle** on the left of the row,
  - a **stacked-layers icon** next to the destination name with tooltip _"This call has multiple interactions"_,
  - on expand, indented **sub-rows**, one per interaction (Date, Destination, Duration, Outcome).
- Grouping key: **`linkedid`**. Parent = the **ANSWERED** leg (who picked up); if none answered, the existing representative leg. Children = all legs of that `linkedid`, ordered by `calldate ASC`.

## Approach (decided — revised during planning)

**Grouping in the nethcti-middleware, children inline.** Discovery during planning: the frontend history goes through the middleware `/history/calls` (`GetFilteredHistory`), which fetches the **full** interval result set from cti-server (no offset/limit forwarded), then enriches, filters by artifact, and **paginates in Go**. cti-server's own SQL pagination/count is not used on this path. Rows are handled as untyped `map[string]interface{}` end-to-end, so a new nested `interactions[]` passes through to the frontend unchanged.

Therefore the collapse-by-`linkedid` is done in the **middleware**, inserted between artifact filtering and pagination. This is lower-effort and more correct than rewriting cti-server's three SQL queries (which group by `uniqueid,linkedid,disposition` with a separate count query): the middleware already holds the complete filtered set, so collapse-then-paginate is natural and pagination-by-parent falls out for free, uniformly across Personal/Switchboard/Groups (all route through `/history/calls`).

Trade-off: grouping lives in the middleware, not cti-server. Direct legacy `/historycall/interval` consumers (e.g. a possible nethlink use) do NOT get grouping — but the CTI frontend uses only `/history/calls`, so this feature is covered.

Note: this feature is built off baseline (ns8/main); it does NOT depend on #7360 (answered-elsewhere / queue filter), which is unmerged on branch `fix_calls_mark`. Parent selection uses plain `disposition == "ANSWERED"`.

## Section 1 — Data contract (nethcti-middleware)

`methods/history.go` `GetFilteredHistory` flow becomes: `fetchLegacyHistoryFromV1` → `enrichLocalChannelArtifactRows` → `filterHistoryRowsByArtifact` → **`collapseHistoryRowsByLinkedid`** (NEW) → `paginateHistoryRows`.

`collapseHistoryRowsByLinkedid(rows []map[string]interface{}) []map[string]interface{}`:
- Groups the (already filtered) rows by `linkedid`, preserving first-occurrence order (input is sorted by `time desc` from cti-server, so parent order follows the sort).
- **Parent** = the leg with `disposition == "ANSWERED"` (first such in the group); if none, the first leg of the group (representative). The parent keeps its own position = the group's first-occurrence index.
- Parent gains `interactions`: `[]map[string]interface{}` = the legs of that `linkedid` **excluding the parent leg** (so the expanded view doesn't repeat the parent, per the mockups), ordered by `time ASC`; and `interactionsCount` (int) = total number of legs (including the parent) — the caret/icon gate is `interactionsCount > 1`.
- A `linkedid` with a single leg (or empty `linkedid`) → `interactionsCount = 1`, no `interactions` key (frontend gates caret/icon on `> 1`).
- Rows with empty `linkedid` are each their own group (never merged).

Row contract to the frontend: existing parent fields **+** `interactions[]` **+** `interactionsCount`. Backward compatible — a consumer ignoring `interactions` still sees a valid parent row. `paginateHistoryRows` now paginates the collapsed (parent) rows; `count` = number of parents.

## Section 2 — Frontend (nethvoice-cti)

`components/history/calls/Calls.tsx` + row/cell components:

- New left column: circular green caret toggle, rendered **only** when `interactionsCount > 1`; otherwise an empty cell (alignment unchanged).
- Stacked-layers icon + `CustomThemedTooltip` "This call has multiple interactions" next to the destination name when `interactionsCount > 1`.
- Local expansion state in `Calls.tsx`: `expandedRows: Set<linkedid>`, toggled on caret click; reset on page/filter change.
- On expand, render `call.interactions` as indented sub-rows (Date, Destination(+number), Duration, Outcome), reusing existing cell components (`CallDetails`/`CallSource`, outcome/`CallStatus`), no caret/icon on sub-rows.
- Play/recording action shown on whichever leg (parent or child) has `recordingfile`, not duplicated.
- i18n key `History.This call has multiple interactions` (en, it, + es if present).
- Types: extend the history row type in `lib/history.ts` with `interactions?` and `interactionsCount?`.

## Section 3 — Edge cases, testing, open points

**Edge cases**
- `interactionsCount <= 1` → no caret/icon; normal row (today's behavior).
- No ANSWERED leg (all-missed group ring) → parent = first/representative leg; outcome stays missed.
- Empty `linkedid` → row is its own group, never merged.
- Recording/Play on the leg holding `recordingfile` (parent or child).
- Collapse runs AFTER artifact filtering (filtered-out legs never appear as children) and BEFORE pagination (paginate parents).
- Ordering: parents in `time desc` order (input order preserved); children always `time ASC`.

**Testing**
- Middleware: Go table-driven unit tests for `collapseHistoryRowsByLinkedid` (`methods/history_test.go`) — multi-leg group picks ANSWERED parent + nests all legs; single-leg untouched; empty-linkedid never merged; order preserved. `go test ./methods/...`.
- End-to-end: `go build`, deploy middleware to nethvoice5; verify `/history/calls` returns `interactions[]`/`interactionsCount`.
- Frontend: `next build` (typecheck/lint — no unit-test runner in this repo), then deploy to nethvoice5 via `~/Documents/nethesis/nethvoice-cti/deploy.sh` (REPO_DIR=this worktree), visually verify expansion on all three views against the Figma mockups.

**Open points (resolved during planning)**
1. **Middleware flattening** — RESOLVED: rows are untyped `map[string]interface{}` end-to-end; `interactions[]`/`interactionsCount` pass through unchanged. No passthrough change needed.
2. **Switchboard transcript-grouping** — `Calls.tsx` (~646) rebuilds switchboard rows from transcripts for clean party names. This stays as-is; the collapse in the middleware operates on the raw legs before that frontend step. On the switchboard view the interaction sub-rows come from `interactions[]` (raw legs); the transcript-based clean-party rows remain the switchboard parent display. Re-verify visually on the switchboard view during testing; refine only if the two interact badly.
3. **#7360 independence** — this feature does not depend on answered-elsewhere / queue filter (unmerged on `fix_calls_mark`). Parent selection uses plain `disposition == "ANSWERED"`.
