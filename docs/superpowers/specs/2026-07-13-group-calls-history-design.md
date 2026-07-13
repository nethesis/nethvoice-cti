# Group calls in Call History — Design

**Date:** 2026-07-13
**Type:** feature (`feat`)
**Tracking:** new issue on `NethServer/dev`, **sub-issue of #7133**. Design reference: Figma "History: Group calls" (file `Hn93CDQ1ZO78uljAl98Huh`, node `1055:22787`) / PdR-to-design #7371.
**Repos:** nethcti-server (main work), nethvoice-cti (UI), nethcti-middleware (passthrough check). No ns8-nethvoice code change.

## Problem

In Call History a single logical call often produces several CDR legs sharing one `linkedid` (a group/queue call ringing multiple members, transfers, consultation legs). Today these appear as separate rows (or, for switchboard, are re-derived from transcripts). Users want one **parent row per call** that can be **expanded** to reveal all its interactions — matching the Figma design.

## Goal / Scope

- Applies to **all three history views**: Personal (`user`), Switchboard, Groups.
- A call with more than one interaction shows:
  - a circular green **caret toggle** on the left of the row,
  - a **stacked-layers icon** next to the destination name with tooltip _"This call has multiple interactions"_,
  - on expand, indented **sub-rows**, one per interaction (Date, Destination, Duration, Outcome).
- Grouping key: **`linkedid`**. Parent = the **ANSWERED** leg (who picked up); if none answered, the existing representative leg. Children = all legs of that `linkedid`, ordered by `calldate ASC`.

## Approach (decided)

**Backend grouping, children inline.** cti-server collapses to one parent row per `linkedid`, paginates by parent row, and includes the interaction legs inline. Frontend only renders expansion. This keeps pagination and counts correct and behaves uniformly across the three views. (Frontend-only grouping was rejected: a call's legs can straddle page boundaries → broken groups and inconsistent counts.)

## Section 1 — Data contract (nethcti-server)

The three history query functions in `plugins/dbconn/plugins/dbconn_history.js` (`getHistoryCallInterval`, `getHistorySwitchCallInterval`, `getHistoryGroupsCallInterval`) today return flat CDR legs, SQL-grouped by `uniqueid,linkedid,disposition`. Change:

- **Collapse by `linkedid`** → one parent row per logical call. Parent = ANSWERED leg (fallback: existing representative leg / `effectiveDisposition` from #7360).
- Each parent carries `interactions: [...]` inline = all legs of the same `linkedid`, ordered `calldate ASC`, each leg with the fields already used to render a row (time/date, src/dst + cnam/company, duration, billsec, disposition/`effectiveDisposition`, channel, recordingfile).
- Each parent carries `interactionsCount` (int) → gates the caret + stacked icon (render only when `> 1`).
- Pagination `offset/limit` now counts **parent rows** (distinct linkedid), not legs.
- Existing `WHERE` clauses preserved: satellite Stasis exclusion, disposition logic, the #7360 answered-elsewhere derivation, and the queue filter (#7360 WIP `queue` param).

Row contract: current parent fields **+** `interactions[]` **+** `interactionsCount`. Backward compatible — a consumer ignoring `interactions` still sees a valid parent row.

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
- `interactionsCount == 1` → no caret/icon; normal row (today's behavior).
- No ANSWERED leg (all-missed group ring) → parent = representative leg; outcome stays missed / answered-elsewhere (integrates with #7360 `effectiveDisposition`).
- Recording/Play on the leg holding `recordingfile`.
- Must respect the queue filter (#7360 WIP) and content filter `WHERE` clauses.
- Ordering: page ordered by parent `calldate`; children always `calldate ASC`.

**Testing**
- Backend: run grouping query against the live nethvoice5 DB (April 201/202/203 multi-leg calls) and verify `interactions[]` / `interactionsCount`.
- Middleware: verify `/history/calls` passes `interactions[]` through without flattening.
- Frontend: build + deploy to nethvoice5 via `~/Documents/nethesis/nethvoice-cti/deploy.sh` (REPO_DIR=this worktree), visually verify expansion on all three views.

**Open points**
1. **Switchboard transcript-grouping reconciliation.** `Calls.tsx` (~646) currently rebuilds switchboard rows from transcripts for clean parties. With backend linkedid grouping, sub-rows come from `interactions[]`. Decide whether the transcript-grouping stays (for clean party names) or is subsumed by the backend grouping. Resolve during implementation.
2. **Middleware flattening.** Confirm `nethcti-middleware` `/history/calls` enrichment does not drop/flatten `interactions[]`; patch if it does.
3. Parent-leg party names for switchboard may still need transcript-derived clean parties (relates to open point 1).
