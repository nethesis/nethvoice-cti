# Group Calls in Call History — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In Call History, collapse the CDR legs of one logical call (same `linkedid`) into a single parent row that can be expanded to reveal its other interactions, across the Personal / Switchboard / Groups views.

**Architecture:** Grouping happens in the **nethcti-middleware** `GetFilteredHistory` handler (which already holds the full filtered result set and paginates in Go), inserted between artifact filtering and pagination. It adds `interactions[]` + `interactionsCount` to each parent row; rows are untyped `map[string]interface{}` so the fields flow to the frontend unchanged. The **nethvoice-cti** frontend renders a caret toggle + stacked-layers icon on parent rows and splices the interactions in as sibling rows when expanded.

**Tech Stack:** Go (gin) middleware with `go test`; Next.js/React/TypeScript frontend (no unit-test runner — verified via `next build`).

## Global Constraints

- Feature is built off baseline; it does NOT depend on #7360 (answered-elsewhere / queue filter). Parent selection uses plain `disposition == "ANSWERED"`.
- Middleware Go files: license header `Copyright (C) 2026 Nethesis S.r.l.` / `SPDX-License-Identifier: GPL-3.0-or-later` already present in edited files — do not duplicate.
- Frontend copy strings go through `react-i18next` `t(...)`; add keys to `en`, `it`, `es` translation files.
- Commit messages: Conventional Commits, type `feat`. End body with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Worktree: `/home/tommaso/Documents/git/nethvoice/feat_group_calls/` (`nethcti-middleware` on branch `feat_group_calls`, `nethvoice-cti` on branch `feat_group_calls`).

---

### Task 1: Middleware — collapse rows by linkedid

**Files:**
- Modify: `nethcti-middleware/methods/history.go` (add functions; wire into `GetFilteredHistory` at line 102)
- Test: `nethcti-middleware/methods/history_test.go` (add test)

**Interfaces:**
- Produces: `collapseHistoryRowsByLinkedid(rows []map[string]interface{}) []map[string]interface{}` — one parent row per `linkedid`, parent = first `disposition=="ANSWERED"` leg else first leg, gaining `interactions` (`[]map[string]interface{}`, other legs, `time ASC`) when the group has >1 leg, and `interactionsCount` (int, total legs). Empty-linkedid rows pass through as their own group with `interactionsCount=1`. First-occurrence order preserved.
- Consumes: existing `getHistoryRowString` (`history.go:415`), `paginateHistoryRows` (`history.go:491`).

- [ ] **Step 1: Write the failing test**

Add to `nethcti-middleware/methods/history_test.go`:

```go
func TestCollapseHistoryRowsByLinkedid(t *testing.T) {
	rows := []map[string]interface{}{
		{"linkedid": "L1", "uniqueid": "u1a", "time": float64(300), "disposition": "NO ANSWER", "dst": "121"},
		{"linkedid": "L1", "uniqueid": "u1b", "time": float64(310), "disposition": "ANSWERED", "dst": "120"},
		{"linkedid": "L1", "uniqueid": "u1c", "time": float64(305), "disposition": "NO ANSWER", "dst": "122"},
		{"linkedid": "", "uniqueid": "u2", "time": float64(200), "disposition": "ANSWERED", "dst": "450"},
		{"linkedid": "L3", "uniqueid": "u3", "time": float64(100), "disposition": "NO ANSWER", "dst": "453"},
	}

	got := collapseHistoryRowsByLinkedid(rows)

	if len(got) != 3 {
		t.Fatalf("expected 3 parent rows, got %d", len(got))
	}
	// Order preserved: L1 group first (first-occurrence index 0), then standalone, then L3.
	if got[0]["linkedid"] != "L1" || got[1]["uniqueid"] != "u2" || got[2]["linkedid"] != "L3" {
		t.Fatalf("order not preserved: %+v", got)
	}
	// Parent of L1 is the ANSWERED leg.
	if got[0]["uniqueid"] != "u1b" {
		t.Fatalf("expected ANSWERED leg u1b as parent, got %v", got[0]["uniqueid"])
	}
	if got[0]["interactionsCount"] != 3 {
		t.Fatalf("expected interactionsCount 3, got %v", got[0]["interactionsCount"])
	}
	children, ok := got[0]["interactions"].([]map[string]interface{})
	if !ok || len(children) != 2 {
		t.Fatalf("expected 2 interaction children, got %v", got[0]["interactions"])
	}
	// Children exclude the parent and are ordered by ascending time (u1a@300, u1c@305).
	if children[0]["uniqueid"] != "u1a" || children[1]["uniqueid"] != "u1c" {
		t.Fatalf("children wrong/unsorted: %+v", children)
	}
	// Standalone (empty linkedid) and single-leg group have count 1 and no interactions.
	if got[1]["interactionsCount"] != 1 {
		t.Fatalf("standalone count should be 1, got %v", got[1]["interactionsCount"])
	}
	if _, has := got[2]["interactions"]; has {
		t.Fatalf("single-leg group must not have interactions")
	}
	if got[2]["interactionsCount"] != 1 {
		t.Fatalf("single-leg count should be 1, got %v", got[2]["interactionsCount"])
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethcti-middleware && go test ./methods/ -run TestCollapseHistoryRowsByLinkedid`
Expected: FAIL — `undefined: collapseHistoryRowsByLinkedid`.

- [ ] **Step 3: Add `"sort"` to the import block**

In `nethcti-middleware/methods/history.go`, the import block (lines 8-24) currently lists `encoding/json`, `fmt`, `io`, `net/http`, `net/url`, `strconv`, `strings`, `time`. Add `"sort"` (keep alphabetical grouping in the std block):

```go
	"net/url"
	"sort"
	"strconv"
```

- [ ] **Step 4: Add the collapse functions**

Append to `nethcti-middleware/methods/history.go` (e.g. after `paginateHistoryRows`, before end of file):

```go
// collapseHistoryRowsByLinkedid groups the (already filtered) history rows by
// linkedid into one parent row per logical call. The parent is the first leg with
// disposition "ANSWERED", or the first leg if none answered. The parent keeps its
// group's first-occurrence position and gains an "interactions" slice (the group's
// other legs, ordered by ascending time) plus an "interactionsCount" (total legs).
// Rows with an empty linkedid are each their own group and are never merged.
func collapseHistoryRowsByLinkedid(rows []map[string]interface{}) []map[string]interface{} {
	type slot struct {
		key        string                 // linkedid group key; "" for a standalone row
		standalone map[string]interface{} // set when the row has no linkedid
	}
	legsByID := make(map[string][]map[string]interface{})
	slots := make([]slot, 0, len(rows))

	for _, row := range rows {
		linkedID := getHistoryRowString(row, "linkedid")
		if linkedID == "" {
			slots = append(slots, slot{standalone: row})
			continue
		}
		if _, seen := legsByID[linkedID]; !seen {
			slots = append(slots, slot{key: linkedID})
		}
		legsByID[linkedID] = append(legsByID[linkedID], row)
	}

	result := make([]map[string]interface{}, 0, len(slots))
	for _, s := range slots {
		if s.standalone != nil {
			s.standalone["interactionsCount"] = 1
			result = append(result, s.standalone)
			continue
		}
		legs := legsByID[s.key]
		parentIdx := selectParentLegIndex(legs)
		parent := legs[parentIdx]
		if len(legs) > 1 {
			children := make([]map[string]interface{}, 0, len(legs)-1)
			for i, leg := range legs {
				if i == parentIdx {
					continue
				}
				children = append(children, leg)
			}
			sortLegsByTimeAsc(children)
			parent["interactions"] = children
		}
		parent["interactionsCount"] = len(legs)
		result = append(result, parent)
	}
	return result
}

// selectParentLegIndex returns the index of the first ANSWERED leg, or 0.
func selectParentLegIndex(legs []map[string]interface{}) int {
	for i, leg := range legs {
		if getHistoryRowString(leg, "disposition") == "ANSWERED" {
			return i
		}
	}
	return 0
}

// sortLegsByTimeAsc sorts legs ascending by the numeric "time" field (UNIX ts).
func sortLegsByTimeAsc(legs []map[string]interface{}) {
	sort.SliceStable(legs, func(i, j int) bool {
		return historyRowTime(legs[i]) < historyRowTime(legs[j])
	})
}

// historyRowTime reads the numeric "time" field regardless of its JSON type.
func historyRowTime(row map[string]interface{}) float64 {
	switch v := row["time"].(type) {
	case float64:
		return v
	case int:
		return float64(v)
	case json.Number:
		f, _ := v.Float64()
		return f
	case string:
		f, _ := strconv.ParseFloat(v, 64)
		return f
	default:
		return 0
	}
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethcti-middleware && go test ./methods/ -run TestCollapseHistoryRowsByLinkedid`
Expected: PASS.

- [ ] **Step 6: Wire collapse into the handler**

In `nethcti-middleware/methods/history.go`, replace line 102:

```go
	c.JSON(http.StatusOK, paginateHistoryRows(filteredRows, req.PageNum, req.PageSize))
```

with:

```go
	collapsedRows := collapseHistoryRowsByLinkedid(filteredRows)
	c.JSON(http.StatusOK, paginateHistoryRows(collapsedRows, req.PageNum, req.PageSize))
```

- [ ] **Step 7: Build + full test run**

Run: `cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethcti-middleware && go build ./... && go test ./methods/`
Expected: build OK, all tests PASS.

- [ ] **Step 8: Commit**

```bash
cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethcti-middleware
git add methods/history.go methods/history_test.go
git commit -m "feat(history): collapse call history legs by linkedid into interactions

Group the filtered history rows by linkedid before pagination: one parent
row per logical call (the ANSWERED leg, else the first), carrying the other
legs as an interactions[] array and interactionsCount. Enables expandable
group-call rows in the CTI history.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Frontend — extend the row type

**Files:**
- Modify: `nethvoice-cti/lib/history.ts` (`CallTypes` interface)

**Interfaces:**
- Produces: `CallTypes.interactions?: CallTypes[]`, `CallTypes.interactionsCount?: number`.

- [ ] **Step 1: Add the fields**

In `nethvoice-cti/lib/history.ts`, inside the `CallTypes` interface (currently ending with `voicemail_message_id?: string`), add:

```ts
  interactions?: CallTypes[]
  interactionsCount?: number
```

- [ ] **Step 2: Verify typecheck**

Run: `cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti && npx tsc --noEmit`
Expected: no new errors from this change. (If deps missing, run `npm ci` first.)

- [ ] **Step 3: Commit**

```bash
cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti
git add lib/history.ts
git commit -m "feat(history): add interactions fields to CallTypes

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Frontend — expansion state + splice interaction rows

**Files:**
- Modify: `nethvoice-cti/components/history/calls/Calls.tsx`

**Interfaces:**
- Consumes: `displayRows` (existing `useMemo`, `Calls.tsx:604-843`), the `<Table data={...}>` invocation (`Calls.tsx:1077-1096`).
- Produces: `expandedRows: Set<string>` state, `toggleExpanded(linkedid: string)`, `rowsWithInteractions` memo (used as `<Table data>`). Interaction rows carry `isInteractionRow: true`, `parentLinkedid`, `_interactionIndex`.

- [ ] **Step 1: Add expansion state + toggle (near the other useState hooks, ~Calls.tsx:73-85)**

```tsx
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleExpanded = (linkedid: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(linkedid)) {
        next.delete(linkedid)
      } else {
        next.add(linkedid)
      }
      return next
    })
  }
```

- [ ] **Step 2: Reset expansion when the page or filters change (add an effect after the state)**

```tsx
  useEffect(() => {
    setExpandedRows(new Set())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, callType, callDirection, sortBy, contentFilter, dateBegin, dateEnd, filterText])
```

- [ ] **Step 3: Add the memo that splices interactions after each expanded parent (immediately after the `displayRows` useMemo, ~Calls.tsx:843)**

```tsx
  const rowsWithInteractions = useMemo(() => {
    if (!expandedRows.size) {
      return displayRows
    }
    const out: any[] = []
    displayRows.forEach((row: any) => {
      out.push(row)
      if (
        row?.interactionsCount > 1 &&
        expandedRows.has(row?.linkedid) &&
        Array.isArray(row?.interactions)
      ) {
        row.interactions.forEach((leg: any, i: number) => {
          out.push({
            ...leg,
            isInteractionRow: true,
            parentLinkedid: row.linkedid,
            _interactionIndex: i,
          })
        })
      }
    })
    return out
  }, [displayRows, expandedRows])
```

- [ ] **Step 4: Feed the memo to the table**

In the `<Table ... />` invocation (`Calls.tsx:1077-1096`), change the `data` prop from:

```tsx
  data={!historyError && isHistoryLoaded ? displayRows : []}
```

to:

```tsx
  data={!historyError && isHistoryLoaded ? rowsWithInteractions : []}
```

- [ ] **Step 5: Make row keys unique for interaction rows**

In the `rowKey`/`generateUniqueKey` function (`Calls.tsx:1010-1012`), ensure interaction rows get a distinct key. Replace the body with:

```tsx
    const suffix = call?.isInteractionRow ? `-int-${call?._interactionIndex}` : ''
    return `call-${call?.uniqueid}-${call?.time}-${index}${suffix}`
```

- [ ] **Step 6: Verify build**

Run: `cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti && npm run build`
Expected: build succeeds (warnings ok, no errors). Nothing visually changes yet (no caret rendered until Task 4), but expanded set is wired.

- [ ] **Step 7: Commit**

```bash
cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti
git add components/history/calls/Calls.tsx
git commit -m "feat(history): expansion state and interaction sub-rows in Calls

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Frontend — caret toggle column

**Files:**
- Modify: `nethvoice-cti/components/history/calls/Calls.tsx` (icon imports + `columns` array)

**Interfaces:**
- Consumes: `expandedRows`, `toggleExpanded` (Task 3); the `columns` array (`Calls.tsx:846-1007`); `FontAwesomeIcon` (already imported).

- [ ] **Step 1: Import caret icons**

In the FontAwesome icon import (`Calls.tsx:4-12`), add `faChevronDown, faChevronUp` to the `@fortawesome/free-solid-svg-icons` import list.

- [ ] **Step 2: Add the caret column as the FIRST entry of the `columns` array (before the Date column at `Calls.tsx:847`)**

```tsx
    {
      header: '',
      cell: (call: any) => {
        if (call?.isInteractionRow || !(call?.interactionsCount > 1)) {
          return null
        }
        const isOpen = expandedRows.has(call?.linkedid)
        return (
          <button
            type='button'
            aria-label={isOpen ? 'Collapse interactions' : 'Expand interactions'}
            onClick={(e) => {
              e.stopPropagation()
              toggleExpanded(call?.linkedid)
            }}
            className='flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400'
          >
            <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className='h-3 w-3' />
          </button>
        )
      },
      className: 'px-4 py-3.5 w-0',
    },
```

- [ ] **Step 3: Verify build**

Run: `cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti && npm run build`
Expected: build succeeds. Parent rows with `interactionsCount > 1` now show a green circular caret that toggles the sub-rows.

- [ ] **Step 4: Commit**

```bash
cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti
git add components/history/calls/Calls.tsx
git commit -m "feat(history): caret toggle for group-call rows

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Frontend — stacked-layers icon + tooltip on the destination

**Files:**
- Modify: `nethvoice-cti/components/history/calls/Calls.tsx` (Destination column cell + icon import)

**Interfaces:**
- Consumes: the Destination column (`Calls.tsx:881-894`, renders `<CallDestination .../>`); `CustomThemedTooltip` (already imported, `Calls.tsx:38`); `useTranslation` `t` (already in component).

- [ ] **Step 1: Import the stacked-layers icon**

In the `@fortawesome/free-solid-svg-icons` import list (`Calls.tsx:4-12`), add `faLayerGroup`.

- [ ] **Step 2: Wrap the Destination cell to append the icon + tooltip**

In the Destination column object (`Calls.tsx:881-894`), replace its `cell` so the existing `<CallDestination .../>` is wrapped and the icon is appended for parent group rows. Keep the exact props currently passed to `CallDestination`:

```tsx
      cell: (call: any) => (
        <div className='flex items-center gap-2'>
          <CallDestination
            call={call}
            callType={callType}
            operators={operatorsStore?.operators}
            mainextension={authStore?.mainextension}
            name={call?.dst_cnam || call?.dst_ccompany || call?.dst}
            openDrawerHistory={openDrawerHistory}
          />
          {!call?.isInteractionRow && call?.interactionsCount > 1 && (
            <>
              <FontAwesomeIcon
                icon={faLayerGroup}
                data-tooltip-id={`tooltip-interactions-${call?.linkedid}`}
                data-tooltip-content={t('History.This call has multiple interactions') || ''}
                className='h-4 w-4 text-iconIndigo dark:text-iconIndigoDark'
                aria-hidden='true'
              />
              <CustomThemedTooltip id={`tooltip-interactions-${call?.linkedid}`} place='top' />
            </>
          )}
        </div>
      ),
```

> NOTE: match the `CallDestination` props to the ones already present in the current Destination cell (copy them verbatim from `Calls.tsx:881-894`); the block above shows the standard prop set — adjust names only if the current code differs.

- [ ] **Step 3: Verify build**

Run: `cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti && npm run build`
Expected: build succeeds. Parent group rows show the stacked-layers icon with hover tooltip next to the destination name.

- [ ] **Step 4: Commit**

```bash
cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti
git add components/history/calls/Calls.tsx
git commit -m "feat(history): multiple-interactions icon on group-call rows

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Frontend — sub-row styling + blank Source on children

**Files:**
- Modify: `nethvoice-cti/components/history/calls/Calls.tsx` (`<Table getRowClassName>` + Source column cell)

**Interfaces:**
- Consumes: `<Table>` `getRowClassName` prop (`Table.tsx:38`); the Source column (`Calls.tsx:852-867`).

- [ ] **Step 1: Style interaction rows via `getRowClassName` on the Table**

In the `<Table ... />` invocation (`Calls.tsx:1077-1096`), add the prop:

```tsx
  getRowClassName={(row: any) =>
    row?.isInteractionRow ? 'bg-gray-50 dark:bg-gray-900/40' : ''
  }
```

- [ ] **Step 2: Blank the Source cell for interaction rows (per the mockup, children show Date/Destination/Duration/Outcome only)**

In the Source column (`Calls.tsx:852-867`), wrap its `cell` to return `null` for interaction rows. Keep the current `<CallSource .../>` props verbatim:

```tsx
      cell: (call: any) =>
        call?.isInteractionRow ? null : (
          <CallSource
            call={call}
            callType={callType}
            operators={operatorsStore?.operators}
            mainextension={authStore?.mainextension}
            name={call?.cnam || call?.ccompany || call?.src || call?.cnum}
            openDrawerHistory={openDrawerHistory}
          />
        ),
```

> NOTE: copy the exact `CallSource` props from the current Source cell (`Calls.tsx:852-867`); only the `isInteractionRow ? null :` wrapper is new.

- [ ] **Step 3: Verify build**

Run: `cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti && npm run build`
Expected: build succeeds. Expanded sub-rows have a subtle background and an empty Source cell.

- [ ] **Step 4: Commit**

```bash
cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti
git add components/history/calls/Calls.tsx
git commit -m "feat(history): style interaction sub-rows

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Frontend — i18n keys

**Files:**
- Modify: `nethvoice-cti/public/locales/en/translation.json`
- Modify: `nethvoice-cti/public/locales/it/translation.json`
- Modify: `nethvoice-cti/public/locales/es/translation.json`

**Interfaces:**
- Consumes: the `t('History.This call has multiple interactions')` key referenced in Task 5.

- [ ] **Step 1: Add the key under the `History` object in each locale**

`en`:
```json
    "This call has multiple interactions": "This call has multiple interactions",
```
`it`:
```json
    "This call has multiple interactions": "Questa chiamata ha più interazioni",
```
`es`:
```json
    "This call has multiple interactions": "Esta llamada tiene múltiples interacciones",
```

(Insert each next to the existing `History.*` keys, e.g. after `"Queue"`, preserving JSON validity.)

- [ ] **Step 2: Verify build**

Run: `cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti && npm run build`
Expected: build succeeds; the tooltip text resolves in en/it/es.

- [ ] **Step 3: Commit**

```bash
cd /home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti
git add public/locales/en/translation.json public/locales/it/translation.json public/locales/es/translation.json
git commit -m "feat(history): i18n for multiple-interactions tooltip

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: End-to-end verification on nethvoice5

**Files:** none (deploy + manual verification)

- [ ] **Step 1: Deploy the middleware to nethvoice5**

Build and deploy the middleware image/binary from `feat_group_calls/nethcti-middleware` to nethvoice5 (there is no dedicated deploy.sh for the middleware; build `go build ./...`, then podman-cp/commit the binary into the `nethcti-middleware` container and restart, mirroring the cti-server deploy pattern — confirm the exact steps with the maintainer before running against the shared box).

- [ ] **Step 2: Deploy the frontend to nethvoice5**

Run:
```bash
cd /home/tommaso/Documents/nethesis/nethvoice-cti
REPO_DIR=/home/tommaso/Documents/git/nethvoice/feat_group_calls/nethvoice-cti MODULE_ID=nethvoice5 ./deploy.sh
```
Expected: `[7/8] Deployment completed`.

- [ ] **Step 3: Verify the API returns interactions**

With a middleware JWT (`POST /api/login`), GET `/api/historycall/interval/...` via the frontend path `/history/calls` (or inspect the browser network tab). Confirm parent rows carry `interactionsCount` and, when `> 1`, an `interactions` array.

- [ ] **Step 4: Visual verification against the Figma mockups**

In the CTI history, on each Call type (Personal, Switchboard, Groups): a multi-interaction call shows the stacked-layers icon + tooltip and the green caret; clicking the caret reveals the interaction sub-rows (Date, Destination, Duration, Outcome), collapsing on second click. Use the April 201/202/203 data (set the date range) or place a fresh queue call.

---

## Self-Review

**Spec coverage:** Section 1 (data contract) → Task 1. Section 2 (frontend: caret, icon+tooltip, expansion state, sub-rows, i18n, types) → Tasks 2-7. Section 3 testing → Tasks 1 (Go tests), 8 (e2e). Edge cases (count<=1, no-ANSWERED, empty linkedid, collapse after filter/before paginate, ordering) → Task 1 code + test. All covered.

**Placeholder scan:** No TBD/TODO. Task 5/6 include a NOTE to copy exact existing `CallSource`/`CallDestination` props verbatim (the current cells' prop set) rather than a placeholder — the standard prop set is shown; this is a real instruction, not a gap.

**Type consistency:** `interactions`/`interactionsCount` used consistently (Go writes them; TS `CallTypes` declares them; Calls.tsx reads them). `isInteractionRow`/`parentLinkedid`/`_interactionIndex` are internal frontend-only markers, defined in Task 3 and consumed in Tasks 4-6. `collapseHistoryRowsByLinkedid`/`selectParentLegIndex`/`sortLegsByTimeAsc`/`historyRowTime` names consistent across Task 1.
