# Phase 5 — Incident Details and Secondary Case Operations

## Phase objective

Rebuild incident details to match the reference and reorganize all non-reference case functions into a clear secondary workspace without removing capabilities.

## Reference-image observations

Incident details use a bordered quotation strip followed by five equal metadata cells separated by vertical dividers. Each cell contains a line icon, muted label, and compact value. The first two cells support multi-line text.

## Current implementation findings

Incident uses generic `Row` components. Timeline, notes, parties, decision, and remedies are displayed as separate stacked panels. This preserves information but creates most of the extra page height.

## Identified gaps

- Incident hierarchy and geometry differ from the reference.
- Metadata cells have no icons or internal dividers.
- Secondary functions compete with summary content.
- Notes input lacks a visible label.
- Existing `Panel`/`Row` abstractions are too generic.

## Components affected

Incident panel, quote, metadata cells, parties, decision, remedies, timeline, evidence details, and case notes.

## Files likely to be changed

- `src/pages/CaseDetailPage.tsx`
- Potential new `src/components/case/IncidentDetails.tsx`
- Potential new `src/components/case/CaseSecondaryDetails.tsx`
- `src/components/icons.tsx`
- `src/index.css`

## Global styles affected

No broad global changes. Reuse Phase 1 case primitives.

## Component-specific styles affected

Incident quote, five-cell grid, cell icons/dividers, secondary navigation, disclosure panels, notes form, and detail rows.

## Exact implementation tasks

1. Extract incident details into a dedicated component.
2. Render the Section 23 quotation in a full-width bordered inset.
3. Render Nature, Impact, Platform, Province, and Offender as five metadata cells with existing/new icons.
4. Use semantic term/value markup where appropriate.
5. Create a secondary-detail area containing parties, evidence details, timeline, notes, decision, and remedies.
6. Choose tabs only if all panels remain discoverable and keyboard semantics are implemented; otherwise use accessible disclosure groups or a below-fold grid.
7. Ensure `View Evidence` targets the evidence detail surface.
8. Add a visible or visually hidden label to the note input and accessible submission feedback.
9. Preserve notes chronological behavior and decision selection.

## Interaction-state requirements

Secondary navigation needs selected, hover, focus, and disabled states. Disclosures need expanded/collapsed state and correct `aria-expanded`. Note submission requires success feedback and prevention of empty submission.

## Animation requirements

Secondary content reveal may use a 180–220 ms opacity/height transition where layout-safe. Reduced motion changes instantly. Do not animate long note lists.

## Responsive requirements

Five cells remain one row at large desktop, become 3+2 or 2+2+1 at laptop/tablet, and become single rows on mobile. Dividers adapt from vertical to horizontal.

## Accessibility requirements

Use semantic quotation and citation treatment, meaningful icon hiding, proper tab/disclosure semantics, labeled note input, status announcements, and logical focus restoration.

## Dependencies

Phases 1–4 and the evidence targeting contract.

## Risks

Tabs can hide information and complicate deep linking. Fixed incident heights can clip long user content. Over-truncation can conceal critical case facts.

## Regression considerations

All existing parties, timeline, notes, decisions, remedies, and evidence values must remain present and actionable. Do not discard `Row` if other pages depend on an equivalent abstraction.

## Validation steps

1. Test short and long incident summaries.
2. Verify every secondary feature by keyboard.
3. Add a note and confirm persistence.
4. Record a decision on an eligible case.
5. Confirm View Evidence lands at the correct surface.

## Visual acceptance criteria

The quote and five metadata cells reproduce the reference’s compact geometry, icon alignment, dividers, and typography without clipping at 1368 × 853.

## Functional acceptance criteria

All original case data and mutations remain available, notes persist, decisions work, and secondary navigation has no dead ends.

## Completion checklist

- [ ] Incident component rebuilt
- [ ] Five metadata cells implemented
- [ ] Responsive dividers implemented
- [ ] Secondary area organized
- [ ] Evidence target connected
- [ ] Notes form labeled and tested
- [ ] Decision/remedies preserved
- [ ] Long-content cases tested
