# Phase 2 — Page Composition, Header, and Shell

## Phase objective

Recompose the case-detail route into the reference’s compact 2 × 2 operational workspace and rebuild the case header/action stack while preserving global navigation.

## Reference-image observations

The case reference and badges occupy the upper left. A 283 px officer select and advancement button are stacked at upper right. The content below is a 72.5% / 27.5% grid. The entire primary composition fits inside 853 px.

## Current implementation findings

`CaseDetailPage` uses `space-y-5`, a wrapping header, a full-width 118 px pipeline, and a separate `xl:grid-cols-3` section. `Layout` renders an 80 px sidebar plus a 66 px sticky utility bar on every route. Case content starts at y=84.

## Identified gaps

- Header actions are horizontal and undersized.
- Primary panels are not in a shared grid.
- Utility bar creates a major fidelity conflict.
- Secondary panels force the page beyond the target viewport.
- Case-specific breakpoints depend on generic Tailwind `xl` behavior.

## Components affected

Route wrapper, header, back control, case identity, badges, assignee select, primary action, primary workspace grid, and secondary-detail region.

## Files likely to be changed

- `src/pages/CaseDetailPage.tsx`
- `src/components/Layout.tsx`
- `src/App.tsx` only if route metadata is required
- `src/index.css`

## Global styles affected

Only a route-aware shell hook may be added globally. Existing utility bar behavior on all non-detail routes must remain unchanged.

## Component-specific styles affected

`.case-detail-page`, `.case-detail-header`, `.case-detail-identity`, `.case-detail-actions`, `.case-workspace-grid`, and `.case-secondary-details`.

## Exact implementation tasks

1. Replace utility-driven page composition with named semantic classes.
2. Create a header grid with flexible identity content and a 280–285 px action column.
3. Increase case-reference typography to approximately 34 px and badge/control scale to match the reference.
4. Place the workflow, court, incident, and evidence components in named CSS grid areas.
5. Use a large-desktop column ratio around `minmax(0, 2.7fr) minmax(320px, 1fr)`.
6. Target top panels around 380 px and bottom panels around 277 px at the reference viewport, using min-height rather than brittle content clipping.
7. Put parties, decision, remedies, timeline, notes, and full evidence detail in a secondary region below the summary or behind an accessible secondary navigation control.
8. Implement a route-scoped focus treatment for the utility bar only if visual measurement confirms the reference cannot be met while it remains visible. Preserve sidebar navigation and provide the visible Back control.
9. Do not use absolute positioning for the primary grid.

## Interaction-state requirements

Back, select, and action controls require complete hover/focus/pressed states. Disabled advancement must expose a persistent prerequisite message through `aria-describedby`, not only `title`.

## Animation requirements

Header controls may transition border/background over 140–180 ms. The page layout itself should not animate on initial load.

## Responsive requirements

- ≥1180 px usable width: two columns and reference-like action stack.
- 980–1179 px: retain columns only if the right rail remains at least 300 px.
- 700–979 px: stack top-level panels, optionally pair court/evidence in landscape.
- <700 px: one column and full-width controls.

## Accessibility requirements

Use a single page `<h1>`, semantic header/main sections, logical DOM order, a 44 px Back target, visible select label, and no CSS reordering that changes reading order.

## Dependencies

Phase 1 primitives and tokens.

## Risks

Route-aware shell behavior could affect navigation consistency. Fixed panel heights could clip localized or user-generated content. Moving functionality could make it less discoverable.

## Regression considerations

Preserve `/cases/:id`, browser Back behavior, search/navigation on other routes, and all secondary case functions. Test long references, officer names, and incident content.

## Validation steps

1. Measure the route at 1368 × 853.
2. Confirm no horizontal overflow.
3. Inspect keyboard order from Back through secondary details.
4. Verify all global navigation on non-detail routes.
5. Test long and missing values.

## Visual acceptance criteria

At the target viewport, the case header and four primary grid areas match the reference’s proportions within roughly 2%; the action stack is approximately 283 px wide; gaps remain 14–20 px.

## Functional acceptance criteria

Back navigation, officer assignment, advancement, and access to all existing secondary case features remain functional.

## Completion checklist

- [ ] Header composition implemented
- [ ] Primary 2 × 2 grid implemented
- [ ] Shell decision validated visually
- [ ] Secondary features preserved
- [ ] Desktop target measured
- [ ] Tablet/mobile stacking verified
- [ ] Keyboard order verified
