# Phase 3 — Workflow and Case Progress

## Phase objective

Replace the compact ordinal strip with a rich six-stage workflow containing state nodes, icons, dates, milestone descriptions, an active-stage callout, and semantic progress.

## Reference-image observations

Six equally distributed columns sit on one continuous blue track. Completed nodes contain checks, the current node has a double-ring glow, and future nodes are empty. Each stage has a label, large icon, date or `Pending`, and short description. The current stage sits inside a bordered blue-highlight column. A progress row below shows label, fill bar, and percentage.

## Current implementation findings

`Stepper` renders 28 px nodes with ordinal numbers and 10 px labels. It has no icons, dates, milestone copy, current-stage label, progress meter, or `aria-current`. The stage description is shown once below the list.

## Identified gaps

- Workflow height and information density are far below the reference.
- Stage colors currently use a light-to-dark ordinal ramp that makes early completed nodes nearly white.
- Current stage is not visually dominant.
- No explicit completed/current/pending language for assistive technology.
- Progress is not represented.

## Components affected

Workflow panel, stage node, stage icon, active callout, connecting track, milestone metadata, and progress component.

## Files likely to be changed

- `src/pages/CaseDetailPage.tsx` or new `src/components/case/CaseWorkflow.tsx`
- `src/lib/pipeline.ts`
- `src/components/icons.tsx`
- `src/index.css`

## Global styles affected

Only reusable case-workflow tokens from Phase 1. Do not alter analytics pipeline chart colors globally unless intentionally shared.

## Component-specific styles affected

`.case-workflow`, `.case-workflow__track`, `.case-workflow__step`, state modifiers, icon/date/copy styles, `.case-current-label`, and `.case-progress`.

## Exact implementation tasks

1. Extract workflow into a focused component.
2. Derive each step state from `STAGE_INDEX`.
3. Resolve dates from timeline events; use `Pending` when no event exists.
4. Provide concise milestone text per stage, aligned with the reference.
5. Map existing/new SVG icons to all six stages.
6. Render a single track behind nodes with completed and remaining segments.
7. Add check icons to completed and current nodes; keep future nodes empty.
8. Add an active-stage background column and `Current Stage` callout.
9. Compute progress deterministically. Stage-only fallback should map stages consistently; if timeline-derived fractional progress is unavailable, document the chosen mapping.
10. Render progress using semantic progress markup and a visible percentage.
11. Preserve labels without ellipsis at desktop target.

## Interaction-state requirements

Workflow nodes are informational unless a future requirement explicitly permits navigation. Do not imply clickability with pointer cursors. If tooltips are added for compact breakpoints, make them accessible to focus and touch.

## Animation requirements

On advancement, animate the progress fill over 450–600 ms and transition the new active node over 220 ms. Avoid infinite pulsing. Reduced motion uses immediate updates.

## Responsive requirements

Desktop displays all six stages. Laptop can reduce icon and copy scale. Tablet uses horizontal snap scrolling with visible overflow affordance or a vertical workflow. Mobile must not compress six stages into unreadable columns.

## Accessibility requirements

Use `<ol>`, `aria-current="step"`, accessible state/date text, hidden decorative track, semantic progress values, and sufficient contrast for future steps.

## Dependencies

Phase 1 icons/helpers and Phase 2 workspace grid.

## Risks

Long stage descriptions may overflow. Timeline entries may be absent or duplicated. Animation can misrepresent completion if advancement fails.

## Regression considerations

Advancement must still call the existing store mutation. Resolved cases must render without a next-stage button. Decision prerequisites for in-court cases remain enforced.

## Validation steps

1. Inspect all six possible current stages.
2. Validate cases with missing timeline data.
3. Advance a case and confirm date/state/progress update.
4. Test keyboard and screen-reader representation.
5. Compare node and track alignment at the target viewport.

## Visual acceptance criteria

All six nodes align on one track; the current stage has the reference-like double ring and highlighted column; icons, dates, descriptions, and progress row fit without clipping.

## Functional acceptance criteria

State derivation is correct for every stage, advancement updates immediately, and no workflow element falsely appears interactive.

## Completion checklist

- [ ] Rich stage model rendered
- [ ] Timeline dates resolved safely
- [ ] Six icons integrated
- [ ] Current-stage callout implemented
- [ ] Semantic progress implemented
- [ ] Advancement transition verified
- [ ] All stage variants tested
- [ ] Mobile workflow verified
