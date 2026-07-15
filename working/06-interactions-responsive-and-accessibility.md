# Phase 6 — Interaction States, Responsive Behaviour, and Accessibility

## Phase objective

Complete every interactive state, responsive transformation, motion rule, and accessibility requirement across the redesigned workspace.

## Reference-image observations

The reference shows strong selected/current states but does not document hover, keyboard, mobile, or error behavior. These must be inferred without adding excessive movement or decorative effects.

## Current implementation findings

Inputs have focus styling, but generic buttons have limited states. Workflow lacks `aria-current`; disabled advancement relies on a `title`; the note input relies on placeholder text; no case-specific reduced-motion rules exist. The existing detail grid stacks only at the Tailwind `xl` threshold.

## Identified gaps

- Incomplete hover/pressed/disabled/loading states.
- No route-wide reduced-motion behavior.
- No explicit progress or chart accessibility.
- Breakpoints do not match the new composition.
- Mobile workflow behavior is undefined.

## Components affected

All controls, workflow, progress, chart, tabs/disclosures, notes form, badges, responsive grid, and overlays if introduced.

## Files likely to be changed

- `src/index.css`
- Case components created in previous phases
- `src/pages/CaseDetailPage.tsx`

## Global styles affected

Only existing general focus policy if a shared improvement is demonstrably safe. Prefer route-scoped interaction rules.

## Component-specific styles affected

All `:hover`, `:focus-visible`, `:active`, `[disabled]`, `[aria-selected]`, `[aria-expanded]`, loading, and reduced-motion selectors.

## Exact implementation tasks

1. Define states for Back, select, primary/secondary buttons, secondary navigation, disclosures, and evidence action.
2. Add explicit disabled explanation wiring to advancement.
3. Add accessible status announcements for assignment, advancement, decision, and note actions where appropriate.
4. Implement desktop, laptop, tablet, mobile, and small-mobile breakpoints based on usable content width.
5. Choose horizontal snap scrolling or vertical layout for workflow below tablet width and expose overflow clearly.
6. Ensure panels grow with content rather than clip outside the target desktop fidelity mode.
7. Add `prefers-reduced-motion` overrides.
8. Verify chart text alternatives, semantic facts, labels, tab order, and contrast.
9. If any overlay is introduced, implement focus trap, Escape close, focus restoration, and scroll locking.

## Interaction-state requirements

Every interactive control must have default, hover, focus-visible, active, disabled, and applicable selected/expanded/loading states. Pointer cursors appear only on actionable elements.

## Animation requirements

Use 140–180 ms control transitions, 220 ms selection/reveal transitions, and 450–600 ms progress/chart transitions. Avoid infinite animation. Reduced motion removes transforms and sweeps.

## Responsive requirements

Validate at 1536, 1368, 1280, 1024, 768, 430, and 360 px widths. No page-level horizontal overflow is permitted. Touch targets remain at least 44 px.

## Accessibility requirements

WCAG AA contrast, semantic landmarks/headings, visible focus, correct ARIA state, chart alternatives, labeled forms, logical DOM order, keyboard operation, screen-reader announcements, and reduced motion.

## Dependencies

All prior implementation phases.

## Risks

Overusing ARIA can conflict with native semantics. Horizontal workflow scrolling can hide later stages. Compact desktop sizing can reduce touch usability if reused on mobile.

## Regression considerations

Retain the application’s existing sidebar and utility controls at their current breakpoints unless route-scoped behavior was explicitly approved in Phase 2.

## Validation steps

1. Keyboard-only walkthrough.
2. Inspect accessible names and states.
3. Test reduced motion.
4. Check all target widths and both short/long content.
5. Verify focus after overlays, disclosures, and navigation.
6. Inspect contrast and touch dimensions.

## Visual acceptance criteria

Responsive layouts preserve hierarchy, spacing, contrast, and active-state clarity. Focus rings fit the visual language and remain unmistakable.

## Functional acceptance criteria

Every control works by keyboard and pointer; no hidden content becomes unreachable; state changes are announced; reduced motion is honored.

## Completion checklist

- [ ] All control states implemented
- [ ] Disabled explanations accessible
- [ ] Responsive widths verified
- [ ] Mobile workflow resolved
- [ ] No horizontal overflow
- [ ] Keyboard walkthrough passes
- [ ] Reduced motion passes
- [ ] Overlay behavior passes, if applicable
