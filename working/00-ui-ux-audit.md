# Case Detail UI/UX Audit

## Executive summary

The 1368 × 853 reference presents the case-detail route as a compact operational workspace. The six-stage case workflow is the primary visual element, with court status and evidence in a narrow right rail and incident details beneath the workflow. The current route contains the correct case-management functionality, but it is a generic stacked record page measuring about 1,183 px high at the target viewport. The implementation must change the hierarchy without removing assignment, advancement, court decision, evidence, timeline, notes, parties, or remedies functionality.

## Reference composition

- Outer frame inset: approximately 12 px.
- Main header: approximately 145 px high.
- Content: two columns at roughly 72.5% / 27.5% with a 20 px gap.
- Top row: workflow and court panels, approximately 380 px high.
- Bottom row: incident and evidence panels, approximately 277 px high.
- Page palette: `#000818` through `#051a34`, cyan `#12c8ff`, action blue `#086bd5`, critical red `#ef334a`.
- Panel borders: 1 px translucent cool blue; radii approximately 10–12 px.
- Depth: quiet inner highlights and localized active-stage bloom rather than strong shadows.

## Current implementation

Primary files:

- `src/pages/CaseDetailPage.tsx`
- `src/index.css`
- `src/lib/pipeline.ts`
- `src/lib/types.ts`
- `src/lib/store.tsx`
- `src/lib/mock.ts`
- `src/components/badges.tsx`
- `src/components/icons.tsx`
- `src/components/Layout.tsx`

Current measured geometry at 1366 × 853:

- Page content: 1,276 × 1,099 px.
- Whole document: 1,183 px high.
- Workflow: 1,220 × 118 px.
- Incident: 808 × 281 px.
- Evidence: 808 × 199 px.
- Right-side panels: 396 px wide.

## Key gaps

1. The workflow is an ordinal strip rather than a dated, icon-led case history.
2. No visual or semantic progress meter exists.
3. Court progress is absent; only decision/penalty logic exists.
4. Evidence is a checklist instead of a summary chart and legend.
5. Incident fields are vertical rows rather than five compact metadata cells.
6. Primary content does not fit within the target desktop viewport.
7. Type is smaller and less authoritative than the reference.
8. The active workflow stage lacks the highlighted column and double-ring glow.
9. Secondary panels compete with primary operational information.
10. The global utility bar consumes vertical space not shown in the reference.

## Data implications

The existing model does not contain court name, hearing date, presiding officer, hearing type, evidence category counts, or explicit future milestone dates. New fields must be optional and backward-compatible because cases are persisted under `rpngc-cases-v1`. Missing values must render as `TBA` or `Pending`; fabricated dates must not be introduced.

## Accessibility baseline

- Workflow remains an ordered list and receives `aria-current="step"`.
- Progress uses a native `<progress>` element or correct progressbar ARIA.
- Chart values are available as text.
- Every select and input has a programmatic label.
- State is never communicated by color alone.
- Focus-visible styling and 44 px touch targets are mandatory.
- Motion respects `prefers-reduced-motion`.

## Acceptance baseline

At 1368 × 853, the header plus four primary panels should closely match the reference composition, avoid horizontal overflow, and keep primary case information in the first viewport. All existing case mutations and secondary information must remain available. Large-desktop fidelity must not compromise readable tablet and mobile layouts.
