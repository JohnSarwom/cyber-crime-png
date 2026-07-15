# Phase 7 — Visual QA, Functional Regression, and Final Refinement

## Phase objective

Compare the complete implementation against the reference, refine visible mismatches, and validate the entire application before handoff.

## Reference-image observations

Fidelity depends on exact panel proportions, one-pixel track/node alignment, compact typography, restrained border brightness, current-stage glow, chart/legend alignment, and balanced negative space.

## Current implementation findings

The pre-change baseline has no application errors but emits two React Router future-flag warnings. The worktree already contains user changes; unrelated files must remain untouched. The original route is about 330 px taller than the target viewport.

## Identified gaps

Final gaps will be determined through rendered overlay or side-by-side comparison. Compilation alone is not sufficient.

## Components affected

Whole page plus every primary and secondary component.

## Files likely to be changed

Only files already touched by Phases 1–6, and only for evidence-based refinement.

## Global styles affected

No new global surface should be introduced during QA. Refinements should remain route-scoped.

## Component-specific styles affected

Spacing, dimensions, type scale, line height, border opacity, gradient stops, glow radius, icon alignment, chart geometry, and responsive rules.

## Exact implementation tasks

1. Build the project and eliminate new errors/warnings.
2. Capture the route at 1368 × 853 with a representative in-court critical case.
3. Compare against the reference section by section.
4. Measure header, grid columns, panel heights, gaps, control sizes, workflow nodes, and progress geometry.
5. Refine mismatches iteratively and revalidate after each material change.
6. Test all case stages, priorities, missing data, long values, zero evidence, and resolved cases.
7. Verify assignment, advancement, decision, notes, evidence access, Back navigation, and persistence.
8. Inspect console output and all primary routes for regressions.
9. Review the page as one composition at desktop, tablet, and mobile.
10. Update `implementation-checklist.md` with evidence and any accepted deviations.

## Interaction-state requirements

Exercise and visually inspect every state specified in Phase 6, including loading/disabled simulations where practical.

## Animation requirements

Confirm motion is smooth, short, interruption-safe, and absent under reduced motion. No layout shift should occur after initial render.

## Responsive requirements

Run the full viewport matrix and verify content prioritization, panel stacking, workflow behavior, chart layout, and secondary navigation.

## Accessibility requirements

Repeat keyboard traversal, semantics inspection, accessible-name verification, contrast review, and focus restoration checks.

## Dependencies

Completed Phases 1–6 and the original reference image.

## Risks

Late global tweaks may create regressions. Overfitting to one case or viewport can damage real content behavior. Screenshot comparison can mask interaction defects.

## Regression considerations

Preserve all user-owned worktree changes. Do not address the pre-existing Router warnings unless necessary for the case-detail work. Avoid unrelated cleanup.

## Validation steps

- `npm run build`
- Visual comparison at 1368 × 853
- Viewport matrix
- Console inspection
- Keyboard-only walkthrough
- Mutation/persistence tests
- Smoke test all application routes

## Visual acceptance criteria

The final page matches the reference’s composition, hierarchy, palette, borders, glow, typography, icons, and density as closely as the existing shell and real data permit. Deviations are documented.

## Functional acceptance criteria

Build succeeds, no new console errors appear, all original case operations work, data persists, and unrelated routes remain usable.

## Completion checklist

- [ ] Production build passes
- [ ] Reference comparison completed
- [ ] Desktop refinement completed
- [ ] Responsive matrix completed
- [ ] Accessibility pass completed
- [ ] Functional regression completed
- [ ] Console checked
- [ ] Accepted deviations documented
