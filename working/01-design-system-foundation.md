# Phase 1 — Design System Foundation and Data Contracts

## Phase objective

Establish reusable case-workspace tokens, component primitives, icon support, and backward-compatible data contracts before changing the page layout.

## Reference-image observations

The reference consistently repeats deep navy surfaces, translucent blue strokes, 10–12 px radii, cyan uppercase headings, blue control gradients, muted blue-gray metadata, and localized active-state glows. Stage illustrations share a large thin-line icon treatment.

## Current implementation findings

`src/index.css` already defines a compatible navy/cyan palette, generic `.panel`, `.input`, and `.btn` rules, and an SVG icon system exists in `src/components/icons.tsx`. `CaseRecord` lacks hearing data and evidence counts. Stored records may predate any new fields.

## Identified gaps

- No case-detail-specific surface, border, glow, spacing, or transition tokens.
- Generic controls lack complete hover, pressed, disabled, and focus-visible states.
- Missing workflow icons for evidence, investigation, court building, and resolved flag.
- Missing optional court/hearing data contract.
- No normalized evidence-summary function.

## Components affected

Case detail panels, badges, controls, workflow nodes, progress meter, court panel, evidence chart, incident cells, and secondary-detail containers.

## Files likely to be changed

- `src/index.css`
- `src/lib/types.ts`
- `src/lib/mock.ts`
- `src/lib/pipeline.ts`
- `src/components/icons.tsx`
- Potential new `src/lib/caseDetail.ts`

## Global styles affected

Add narrowly named `--case-*` tokens and `.case-*` primitives. Do not alter the visual behavior of `.dashboard-panel`, reports, analytics, or generic `.panel` consumers.

## Component-specific styles affected

Define base styling for `.case-panel`, `.case-panel__title`, `.case-control`, `.case-primary-action`, `.case-meta-cell`, `.case-progress`, and `.case-workflow-node`.

## Exact implementation tasks

1. Add route-scoped tokens for surfaces, borders, active borders, glow, text levels, radii, and transition timings.
2. Create reusable case panel and control primitives with 1 px borders and subtle inner highlights.
3. Extend icons using the existing `IconProps`/`base()` approach; do not add an icon package.
4. Add optional `court` data to `CaseRecord`: court name, next hearing ISO value, presiding officer, hearing type, and status if needed.
5. Represent evidence summary through a deterministic helper derived from `evidence` and `attachedFileCount`; do not require every stored record to contain new counts.
6. Add helper functions for stage milestone date, stage state, and progress percentage.
7. Seed representative court data for in-court records while preserving deterministic mock generation.
8. Ensure all readers tolerate records already stored without the new fields.

## Interaction-state requirements

Controls need default, hover, focus-visible, active, disabled, and loading-compatible styling. State badges must include icon/text in addition to color.

## Animation requirements

Create reusable 140 ms and 220 ms transition tokens. Do not add continuous ambient animation.

## Responsive requirements

Tokens must not encode fixed desktop dimensions. Component primitives must allow width and layout overrides at route-specific breakpoints.

## Accessibility requirements

Maintain at least AA text contrast, minimum 44 px interactive heights, visible focus indicators, and hidden decorative SVGs where an adjacent label carries meaning.

## Dependencies

None beyond existing React, TypeScript, Tailwind v4, and CSS.

## Risks

Changing required fields can break persisted records. Broad changes to `.btn` or `.panel` can regress other pages. New SVGs may have inconsistent optical weight.

## Regression considerations

Run existing pages after token introduction. Confirm old localStorage cases render. Keep new styles under `.case-detail-page` or `.case-*` names.

## Validation steps

1. Run TypeScript/build validation.
2. Load a stored case and a regenerated mock case.
3. Inspect Overview, Cases, Reports, and Analytics for style changes.
4. Verify computed control heights and focus rings.

## Visual acceptance criteria

Case primitives reproduce the reference palette, 10–12 px radii, restrained borders, and localized cyan focus/glow without changing unrelated pages.

## Functional acceptance criteria

All existing records load; assignment, advancement, notes, and decisions retain their current contracts.

## Completion checklist

- [ ] Case tokens added
- [ ] Reusable primitives added
- [ ] Missing icons added
- [ ] Optional data contract added safely
- [ ] Derived helpers covered
- [ ] Build passes
- [ ] Unrelated pages visually unchanged
