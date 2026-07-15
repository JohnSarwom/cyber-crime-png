# Reference-Driven UI Redesign Record

**Project:** RPNGC Cyber Unit Dashboard  
**Record date:** 15 July 2026  
**Scope:** Case Detail workspace, workflow visualization, officer assignment control, Overview welcome hero, responsive behavior, accessibility, and validation

## 1. Purpose

This document records the reference-image-driven UI work completed after the original dashboard implementation. It supplements `docs/IMPLEMENTATION_RECORD.md` and captures the detailed design intent, implementation decisions, source files, interaction behavior, data-model additions, responsive rules, accepted deviations, and validation results.

The work was implemented with the existing React, TypeScript, React Router, Tailwind v4, and CSS architecture. No new UI framework, component library, animation library, or icon dependency was introduced.

## 2. Reference analysis and planning artifacts

The supplied Case Detail reference established a compact dark operational workspace with a focused case header, dominant six-stage workflow, court and evidence right rail, incident summary, navy/cyan hierarchy, highlighted current-stage card, and fading connector.

The audit and phase plans are preserved under `working/`:

- `00-ui-ux-audit.md`
- `01-design-system-foundation.md`
- `02-layout-header-and-shell.md`
- `03-workflow-and-progress.md`
- `04-court-and-evidence.md`
- `05-incident-and-secondary-details.md`
- `06-interactions-responsive-and-accessibility.md`
- `07-visual-quality-assurance.md`
- `implementation-checklist.md`

## 3. Case Detail workspace redesign

### 3.1 Route-scoped focus layout

The Case Detail route now uses a focused operational composition. The global utility bar is hidden only on `/cases/:id` so the primary workspace fits within the target desktop viewport. The navigation rail remains available and the page provides its own Back control. Other routes retain the standard utility bar.

### 3.2 Header and actions

The rebuilt case header includes:

- Accessible Back target.
- Larger condensed case reference with tabular numerals.
- Enlarged stage and priority badges.
- Vertically stacked officer assignment and advancement actions.
- A visible prerequisite message when a court decision is required.
- `aria-describedby` linking a disabled resolution action to its explanation.

The desktop officer/action column is approximately 283 pixels wide.

### 3.3 Primary 2 × 2 workspace

The first-view composition uses four named areas:

| Area | Desktop role |
|---|---|
| Workflow | Wide upper-left operational history |
| Court progress | Narrow upper-right court summary |
| Incident details | Wide lower-left incident context |
| Evidence provided | Narrow lower-right evidence summary |

At the 1368 × 853 comparison viewport, measured geometry was:

- Header: 1,238 × 140 pixels.
- Workflow: 890 × 380 pixels.
- Court progress: 330 × 380 pixels.
- Incident details: 890 × 277 pixels.
- Evidence summary: 330 × 277 pixels.
- Primary workspace starts at y=154 and ends at y=825.
- Secondary information begins at y=849.

The retained 80-pixel navigation rail accounts for the width difference from the full-viewport reference.

## 4. Workflow and current-stage treatment

### 4.1 Rich six-stage history

The compact ordinal strip was replaced with Filed, Evidence, Investigation, Charged, In Court, and Resolved stage columns. Each displays node state, code-native icon, label, timeline-derived date or `Pending`, and milestone text.

The workflow remains a semantic ordered list. The current stage uses `aria-current="step"`, and every stage exposes its state and date through an accessible label.

### 4.2 Progress calculation

Progress is calculated from the entered stage count:

- Filed: 17%
- Evidence: 33%
- Investigation: 50%
- Charged: 67%
- In Court: 83%
- Resolved: 100%

The progress bar exposes semantic values and animates only when motion is allowed.

### 4.3 Connector opacity fade

The connector uses a multistop linear gradient. The completed portion remains crisp cyan-blue. After the current stage, alpha decreases until the line becomes completely transparent before the pending node. This replaces the less accurate darker solid pending segment.

### 4.4 Active-stage gradient, strokes, and glow

The selected card combines:

- Radial blue bloom centered below the icon.
- Subtle vertical surface gradient.
- Bright cyan outer border.
- Quieter inner stroke.
- Inner illumination and restrained outer glow.
- Multiple concentric node rings.
- Localized node bloom and inner circular highlight.

The top of the rectangle is masked with a vertical opacity gradient. It remains transparent through the upper portion, gradually reveals the side strokes, and becomes fully opaque lower down. The node and Current Stage callout remain fully illuminated.

The active date and milestone were reduced to 14 and 13 pixels, with extra horizontal inset, so post-icon text fits comfortably inside the card.

## 5. Branded officer assignment dropdown

The operating system's native `<select>` popup could display a white unbranded menu. It was replaced with `src/components/case/OfficerSelect.tsx`.

The custom picker provides:

- Navy gradient trigger and menu.
- Cyan focus edge and open-state glow.
- Animated chevron.
- Branded opening transition.
- Officer avatar initials.
- Selected-officer gradient, inset indicator, and checkmark.
- Hover and keyboard-focus states.
- Outside-click and Escape dismissal.
- Focus restoration.
- Arrow Up/Down, Home, and End navigation.
- Listbox/option ARIA semantics.

It calls the existing assignment mutation, preserving persistence and behavior.

## 6. Court progress

The court panel now includes a code-native SVG court illustration, court name, next hearing, presiding officer, hearing type, current status, and direct decision-required prompt.

Court fields are optional so existing stored records remain compatible. Missing values render as `TBA`. Demonstration in-court records receive deterministic court data and a 09:30 hearing time.

## 7. Evidence summary

The evidence panel now contains a four-category donut, legend, exact category counts, accessible total, and functional View Evidence action.

View Evidence scrolls to and focuses the full evidence panel. Smooth scrolling is disabled under reduced motion.

The existing model stores evidence flags and a total attachment count, not per-category counts. Counts are conservatively and deterministically allocated across checked categories without inventing a larger total.

## 8. Incident and secondary information

Incident details now use a full-width Section 23 quotation and five icon-led cells for Nature, Impact, Platform, Province, and Offender.

All previous case operations remain available below the primary workspace:

- Parties.
- Full evidence checklist.
- Decision and penalty.
- Victim remedies.
- Timeline.
- Investigation notes.

The note form has a programmatic label, prevents empty submission, and announces successful additions through a polite live region.

## 9. Overview welcome hero

The small Overview title strip was replaced with a large welcome banner below the utility bar. It contains:

- Personalized `Welcome back, Inspector L. Waiko` greeting derived from `CURRENT_OFFICER`.
- RPNGC Cyber Operations Command eyebrow.
- Section 23 operational description.
- Command centre online state.
- Live active-case count.
- Live unresolved high/critical count.
- Open Case Workspace action.
- Review Priority Alerts action.
- Code-native shield with concentric rings.
- Cyber Unit wordmark treatment.
- Existing date filters anchored along the bottom.

The visual uses layered navy gradients, cyan illumination, a masked dot field, atmospheric rings, gradient heading text, status pills, and subtle elevation.

Desktop hero height is 316 pixels. It becomes 350 pixels at narrower widths and a content-driven 430–470 pixel mobile layout. The decorative shield is hidden on mobile.

## 10. Design-system additions

Case-specific CSS variables and primitives were added under `.case-detail-page` to avoid changing unrelated pages. They cover surfaces, borders, active glow, radii, transitions, panels, controls, primary actions, metadata, progress, and focus states.

New code-native icons include Court, Flag, People, and Monitor. Existing icons were reused where possible.

## 11. Data and helper additions

### `src/lib/types.ts`

Added optional `CourtDetails` fields for court, next hearing, presiding officer, and hearing type. The property remains optional for backward compatibility with browser-persisted cases.

### `src/lib/caseDetail.ts`

Added helpers for stage state, timeline-derived dates, stage progress, and evidence allocation.

### `src/lib/pipeline.ts`

Added milestone copy for the rich workflow.

### `src/lib/mock.ts`

Added deterministic demonstration court data and normalized hearing times.

## 12. Responsive behavior

Validated widths included 1536, 1368, 1280, 1024, 768, 430, and 360 pixels.

- Two-column case workspace on large desktop.
- Full-width workflow at laptop sizes where six columns would be cramped.
- Paired court/evidence panels where space permits.
- Single-column stacking on narrow screens.
- Horizontally scrollable mobile workflow.
- Incident grid changing from five columns to 3+2, 2+2+1, and one.
- Full-width mobile actions.
- Mobile welcome hero with hidden decorative shield, stacked actions, and scrollable date tabs.

No document-level horizontal overflow was measured across the validation matrix.

## 13. Accessibility and motion

Implemented measures include semantic headings, current-step semantics, text plus color state, semantic progress, chart text alternatives, visible focus, labeled controls, disabled-action explanation, dropdown focus restoration, keyboard listbox navigation, evidence focus management, 44-pixel targets, and reduced-motion behavior.

## 14. Key files

| File | Responsibility |
|---|---|
| `src/pages/CaseDetailPage.tsx` | Rebuilt header, workspace, and secondary operations |
| `src/components/case/CaseWorkflow.tsx` | Rich workflow and progress |
| `src/components/case/CourtProgress.tsx` | Court illustration and facts |
| `src/components/case/EvidenceSummary.tsx` | Evidence donut and navigation |
| `src/components/case/IncidentDetails.tsx` | Statute and incident cells |
| `src/components/case/OfficerSelect.tsx` | Branded officer picker |
| `src/lib/caseDetail.ts` | Workflow and evidence helpers |
| `src/lib/types.ts` | Optional court contract |
| `src/lib/pipeline.ts` | Stage milestones |
| `src/lib/mock.ts` | Demonstration court data |
| `src/components/Layout.tsx` | Route-scoped focus mode |
| `src/components/badges.tsx` | Case badge hooks |
| `src/components/icons.tsx` | Additional icons |
| `src/pages/OverviewPage.tsx` | Operational welcome hero |
| `src/index.css` | Visual system, effects, states, and breakpoints |

## 15. Validation record

Validation performed included:

- Repeated `npm run build` runs.
- TypeScript compilation.
- Vite and worker production builds.
- `git diff --check`.
- Target-route browser inspection.
- Semantic DOM and console inspection.
- Reference-viewport geometry measurement.
- Responsive overflow checks.
- View Evidence focus test.
- Notes-form state test without submitting data.
- Smoke checks for primary application routes.
- Overview hero inspection through the demonstration authentication gate.

The latest recorded production build completed successfully.

## 16. Accepted deviations and future work

- The 80-pixel sidebar remains on Case Detail; the utility bar is hidden on that route.
- Evidence category totals are derived because per-category totals are not yet stored.
- The native officer select was intentionally replaced to guarantee consistent branding.
- Court information remains demonstration data until backend integration.
- The shared crest should eventually become an approved local asset.
- Automated visual regression should be added when stable authenticated fixtures exist.

## 17. Handover status

Case Detail now closely follows the supplied reference while retaining its original management functionality. Overview now provides the requested grand-entry experience. Both are responsive, keyboard-accessible, and integrated with the existing case store and routing architecture.
