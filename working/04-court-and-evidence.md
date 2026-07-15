# Phase 4 — Court Progress and Evidence Summary

## Phase objective

Build the reference’s right-rail court and evidence panels while preserving existing court-decision and full evidence functionality.

## Reference-image observations

The court panel contains a cyan title, a large court-building illustration, divider, four key/value rows, and a status control. The evidence panel contains a four-segment donut, aligned legend with counts, and a full-width outlined action.

## Current implementation findings

Decision/penalty is a small panel and evidence is a checkbox-style list. `attachedFileCount` provides only a total. The current model does not expose hearing facts. Existing decisions must be recorded before an in-court case can advance.

## Identified gaps

- No court summary or hearing metadata.
- No court illustration.
- No evidence category counts or donut.
- No View Evidence action surface.
- Existing decision logic and reference court status must be reconciled.

## Components affected

Court progress panel, court illustration, hearing facts table, court status control, evidence donut, evidence legend, and evidence action.

## Files likely to be changed

- New `src/components/case/CourtProgress.tsx`
- New `src/components/case/EvidenceSummary.tsx`
- `src/pages/CaseDetailPage.tsx`
- `src/lib/types.ts`
- `src/lib/mock.ts`
- `src/components/icons.tsx`
- `src/index.css`

## Global styles affected

Case panel/control primitives only. Chart colors should use existing categorical blues/teals where contrast permits.

## Component-specific styles affected

Court illustration and facts rows; donut ring, centre, legend dots/counts; evidence button.

## Exact implementation tasks

1. Create a scalable SVG court-building illustration using existing code-native SVG conventions.
2. Render court, next hearing, presiding officer, hearing type, and status with safe fallbacks.
3. Keep decision recording in the secondary section; show an inline prompt/link from court progress when a decision is required.
4. Create deterministic evidence category counts from available data without claiming unsupported precision.
5. Render the donut with SVG circles/paths or a conic gradient; prefer SVG if animation and segment accessibility are needed.
6. Provide a visible legend whose counts exactly match the summary helper.
7. Make `View Evidence` focus or reveal the full evidence detail section; do not create a dead button.
8. Ensure zero-total evidence renders an intentional empty state instead of a broken chart.

## Interaction-state requirements

Court status and View Evidence require hover, focus, active, disabled, and loading-ready styles. Status changes must use valid domain transitions. Evidence action restores focus correctly if it opens an overlay.

## Animation requirements

Donut segments may reveal over 500 ms on data change. The evidence action transitions over 160 ms. Court illustration remains static. Reduced motion disables chart sweep.

## Responsive requirements

Right-rail cards match workflow/incident heights at desktop. On tablet they may form a two-column row. On mobile, chart and legend stack without shrinking tap targets.

## Accessibility requirements

Facts should use a semantic description list or table. The chart requires a text alternative and cannot be the only evidence representation. Status control needs a visible/programmatic label.

## Dependencies

Phases 1–3, especially optional data contracts and workspace placement.

## Risks

Derived evidence counts may imply accuracy not present in the model. Court status changes could conflict with stage advancement. SVG illustration detail may appear noisy at small sizes.

## Regression considerations

Preserve the decision prerequisite and the existing evidence checklist/file count. Missing hearing data must not throw. Do not mutate evidence from a summary control.

## Validation steps

1. Test filed, in-court, and resolved cases.
2. Test missing court data and zero evidence.
3. Compare legend totals with displayed counts.
4. Activate View Evidence by mouse and keyboard.
5. Verify decision prerequisite remains enforced.

## Visual acceptance criteria

Court and evidence panels align with their left-column counterparts; the court illustration is visually centred; rows and legend align cleanly; the evidence action spans the panel width.

## Functional acceptance criteria

Court fallbacks are accurate, evidence totals are deterministic, View Evidence reaches real detail content, and decision/advancement rules remain intact.

## Completion checklist

- [ ] Court component built
- [ ] Hearing fallbacks implemented
- [ ] Court SVG integrated
- [ ] Evidence helper built
- [ ] Donut and legend implemented
- [ ] View Evidence wired
- [ ] Empty states tested
- [ ] Decision logic preserved
