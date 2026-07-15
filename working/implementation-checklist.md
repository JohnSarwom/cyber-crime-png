# Case Detail Implementation Checklist

## Baseline

- [x] Record current representative case URLs/stages
- [x] Record baseline build result
- [x] Preserve existing user worktree changes
- [x] Confirm 1368 × 853 reference dimensions

## Phase 1 — Foundation

- [x] Case-specific design tokens
- [x] Case panel/control primitives
- [x] Workflow/court/incident icons
- [x] Backward-compatible court data
- [x] Evidence and progress helpers
- [x] Foundation build and regression check

## Phase 2 — Layout and header

- [x] Reference-like header
- [x] Vertical officer/action stack
- [x] 72.5% / 27.5% workspace grid
- [x] Equal top-row and bottom-row alignment
- [x] Route shell behavior decided and verified
- [x] Secondary operations preserved

## Phase 3 — Workflow

- [x] Six rich stages
- [x] Completed/current/future states
- [x] Stage icons, dates, and descriptions
- [x] Current-stage callout and glow
- [x] Semantic progress meter
- [x] All stage variants tested

## Phase 4 — Court and evidence

- [x] Court illustration
- [x] Hearing facts and fallbacks
- [x] Court status/decision relationship
- [x] Evidence donut and legend
- [x] Zero-evidence state
- [x] View Evidence action

## Phase 5 — Incident and secondary details

- [x] Quote treatment
- [x] Five incident cells
- [x] Responsive metadata layout
- [x] Parties retained
- [x] Timeline retained
- [x] Notes retained and labeled
- [x] Decision/remedies retained
- [x] Full evidence retained

## Phase 6 — States, responsiveness, accessibility

- [x] Default/hover/focus/active/disabled states
- [x] Loading-ready states
- [x] Accessible disabled explanations
- [x] Desktop/laptop/tablet/mobile behavior
- [x] No horizontal overflow
- [x] Keyboard operation
- [x] Screen-reader state and labels
- [x] Reduced-motion behavior

## Phase 7 — Final validation

- [x] `npm run build`
- [x] No new console errors
- [x] 1368 × 853 visual comparison
- [x] 1536 px check
- [x] 1280 px check
- [x] 1024 px check
- [x] 768 px check
- [x] 430 px check
- [x] 360 px check
- [x] Assignment works
- [x] Advancement works
- [x] Decision prerequisite works
- [x] Notes persist
- [x] Evidence access works
- [x] Back navigation works
- [x] Other application routes smoke-tested

## Accepted deviations

Document any necessary difference from the reference here, including its reason and validation evidence.

- The existing 80 px global sidebar is retained for application consistency; the route-specific utility bar is hidden so the primary case workspace still fits in the target viewport.
- Evidence category counts conservatively allocate the known attachment total across checked evidence types because the current data model does not store per-category file totals.
