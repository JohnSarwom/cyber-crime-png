# RPNGC Cyber Unit Dashboard — Implementation Record

**Project:** Cyber Harassment Case Management Dashboard  
**Organisation:** Royal Papua New Guinea Constabulary (RPNGC), Cyber Unit  
**Legislative context:** Section 23, Cybercrime Act 2016  
**Record date:** 15 July 2026  
**Local application:** `http://127.0.0.1:5175/`

## 1. Purpose of this record

This document records the design, development, and refinement work completed on the internal RPNGC Cyber Unit dashboard. It describes the current user experience, page functionality, data behavior, architectural decisions, validation performed, and known limitations so that future developers and stakeholders can understand the state of the application without reconstructing the work from screenshots or conversation history.

The application is an officer-facing operational dashboard for reviewing, assigning, investigating, progressing, analysing, and reporting cyber-harassment complaints.

## 2. Executive summary

The original dashboard was expanded into a complete multi-page internal portal with a consistent dark navy and cyan visual system. The work included:

- Recreating and refining the supplied dashboard design.
- Reducing the sidebar width to give operational content greater prominence.
- Standardising spacing, card geometry, table padding, controls, and responsive behavior.
- Implementing previously missing Reports, Analytics, Alerts, Users, Profile, and Settings pages.
- Making case filters, assignments, workflow progression, notes, reports, exports, and page-level controls functional.
- Adding branded dropdowns and scrollbars.
- Adding a global top utility navigation bar with case search, priority notifications, and a profile menu.
- Reorganising the Overview page around Quick Actions and two full-width summary tables.
- Supporting custom reporting date ranges in addition to standard periods.
- Restricting export actions to the Reports and Analytics areas rather than the Overview page.

## 3. Design direction and references

### 3.1 Primary dashboard reference

The supplied RPNGC Cyber Unit Overview image established the core design language:

- Deep navy application background.
- Cyan and blue interactive accents.
- Rounded operational cards with subtle borders.
- Compact data-dense charts and status indicators.
- RPNGC crest and restricted-access visual cues.
- Condensed display typography for headings and metrics.

### 3.2 SCPNG intranet reference

The project at `C:\Users\IT_UNIT\Desktop\Coding\scpng-intranet` was used as a layout reference for:

- A narrow, vertically scrolling sidebar.
- A prominent rounded top utility bar.
- A wide global search field.
- Compact notification and profile actions.
- Responsive conversion of navigation for smaller screens.

The RPNGC dashboard retains its own navy/cyan branding rather than copying the SCPNG burgundy palette.

## 4. Application structure and routes

All routes share the same application shell, sidebar, global search bar, notification access, and profile menu.

| Route | Page | Status |
|---|---|---|
| `/` | Overview | Implemented |
| `/cases` | Case register | Implemented |
| `/cases/:id` | Case detail and workflow | Implemented |
| `/reports` | Operational reporting | Implemented |
| `/analytics` | Investigative analytics | Implemented |
| `/alerts` | Alert management | Implemented |
| `/users` | Users and roles | Implemented |
| `/profile` | Current officer profile | Implemented |
| `/settings` | System settings | Implemented |

Unknown routes redirect safely to Overview.

## 5. Global application shell

### 5.1 Sidebar

The sidebar was redesigned as an 80-pixel-wide navigation rail to maximise content width. It includes the RPNGC crest and links to Overview, Cases, Reports, Analytics, Alerts, Users, Settings, Profile, and Logout.

The active page uses a cyan highlight, inset accent, and stronger contrast. The navigation list scrolls independently when required. Its branded scrollbar remains visually hidden until the sidebar is hovered.

The earlier sidebar Reset and decorative shield actions were removed. Logout now occupies the fixed lower action area.

### 5.2 Global top utility bar

A sticky top bar was introduced across every route. It provides global case search, priority notification access, current officer identity, Profile, Settings, and Logout.

Global search matches case reference, complainant name, platform, province, and assigned officer. Up to six live results appear in a branded suggestion panel. Selecting a result opens the corresponding case detail page, and pressing Enter opens the first result.

The notification panel is derived from unresolved high and critical priority cases and provides direct links to those cases and the full Alerts page.

### 5.3 Responsive navigation

At tablet and mobile widths, the vertical sidebar becomes a compact horizontal navigation strip, navigation can scroll horizontally, the utility bar reduces spacing, officer text is hidden while the avatar remains available, and search/notification/profile overlays adapt to the viewport.

## 6. Page-by-page implementation

### 6.1 Overview

The Overview page contains date-period controls for 7, 30, and 90 days plus All; KPI cards for new complaints, active investigations, charges filed, and resolved cases; a filing trend chart; Quick Actions; a high-risk shortcut; and two consolidated full-width operational tables.

Quick Actions replaced the previous Complaints by Status card and includes New Complaint, Search Cases, Generate Report, System Alerts, and High-Risk Review.

The lower four cards were consolidated into two separate table rows:

1. **Category & Risk** — category totals/shares and risk totals/shares.
2. **Province & Case Ageing** — province distribution and case-age brackets.

The Overview Export Report button was removed. Exporting belongs to Reports and Analytics, where filtering and report context are available.

### 6.2 Cases

The Cases register provides search across case reference, complainant, platform, and province; stage and priority filters; a contextual Reset Filters button; result count; branded controls; a padded and horizontally accessible table; direct case-detail navigation; and an empty state.

The filter toolbar, table container, and page boundary were given consistent spacing so content no longer sits against viewport or card edges.

### 6.3 Case detail

The Case Detail page includes back navigation, case metadata, officer assignment, workflow progression, incident and Section 23 context, party information, evidence, timeline, investigation notes, court-decision recording, and victim remedies.

The workflow covers Filed, Evidence, Investigation, Charged, In Court, and Resolved. Panels, page edges, headings, and actions were standardised to the application spacing system. The officer assignment control is constrained and branded rather than stretching across the page.

### 6.4 Reports

Reports was built as a dedicated operational reporting workspace rather than redirecting to Overview. It supports Operational Summary, Evidence Readiness, Prosecution Status, and Victim Remedies contexts.

Standard periods include Last 30 Days, Last 90 Days, and All Records. A **Custom date range** option reveals branded From/To inputs. The inclusive range recalculates complaints filed, evidence readiness, active workload, prosecution, high-risk matters, the filing chart, pipeline distribution, evidence coverage, platform distribution, decisions/remedies, province rankings, and exported records.

Invalid or incomplete ranges produce validation feedback and disable export. Reports can be printed or exported as CSV. The CSV includes reference, filing date, complainant, platform, province, priority, stage, evidence totals, attachments, officer, decision, and remedy status.

### 6.5 Analytics

Analytics was implemented as a live investigative-intelligence workspace with platform filtering; 30-, 60-, and 90-day periods plus All; complaint velocity; high-risk share; assignment coverage; evidence density; resolution rate; volume trend; platform-by-priority matrix; investigation funnel; province risk analysis; officer workload; and CSV export.

Metrics are derived from the current case store and selected filters.

### 6.6 Alerts

Alerts includes active, critical, high-risk, and evidence-related totals; search; severity filtering; Active/Reviewed/All tabs; selectable alert feed; detailed alert panel; mark-visible-as-reviewed; acknowledgement and dismissal controls; and related-case links.

### 6.7 Users & Roles

Users & Roles includes user KPIs; search by name, email, role, or unit; role/status filters; an authorised personnel table; role editing; account selection; live case workload totals; permissions; suspend/reactivate; password-reset feedback; and an Add Authorised User modal.

Roles represented are Administrator, Supervisor, Investigator, Analyst, and Read Only.

### 6.8 Profile

Profile was converted from a static sidebar item into a working route. It includes officer identity, status, rank, badge ID, unit, duty station, active workload, high-risk assigned matters, resolved cases, officer-authored notes, editable contact/unit fields, assigned-case links, notification preferences, MFA/session status, and password-reset feedback.

Editable profile fields persist in browser storage.

### 6.9 Settings

Settings contains General, Case Workflow, Notifications, Security, and Data & Retention sections. Configurable values include system identity, timezone, support email, default priority, case-age threshold, automatic assignment preference, alert preferences, MFA, session timeout, login limit, audit logging, retention, attachment size, export watermarking, and backups.

Settings can be saved locally or restored to defaults.

## 7. Visual and UX improvements

### 7.1 Spacing and layout

- Standard page padding was applied throughout.
- Card-to-card spacing was normalised.
- Tables were moved away from viewport edges.
- Case Detail sections received consistent internal padding.
- Overview charts and cards were aligned to a common grid.
- Lower Overview summaries now use full-width table rows.

### 7.2 Controls

- Native dropdowns were restyled to match the navy/cyan theme.
- Focus states use cyan borders and soft focus rings.
- Buttons use consistent sizes, radius, contrast, and feedback.
- Disabled controls are visually distinct.
- Date inputs use a dark color scheme and branded calendar indicators.

### 7.3 Scrollbars

- The main scrollbar uses a narrow cyan-to-blue gradient.
- The sidebar scrollbar becomes visible on hover.
- Wide tables remain usable through horizontal overflow.

### 7.4 Iconography

The interface uses a shared code-native icon system for navigation, status, actions, workflow, dates, locations, notifications, users, and security. Decorative shield icons that did not provide functional value were removed from Overview and the sidebar.

## 8. Data model and application state

### 8.1 Case data

The current application uses a deterministic demonstration dataset. Each case includes reference, filing date, stage, priority, platform, province, complainant/victim data, offender alias, incident/impact summaries, evidence, attachment count, assigned officer, legal decision, remedies, timeline, and notes.

### 8.2 Case workflow state

The shared React case store supports officer assignment, stage advancement, notes, decision recording, and demonstration-data regeneration. Case changes persist under `rpngc-cases-v1`.

### 8.3 Browser storage

| Storage key | Purpose |
|---|---|
| `rpngc-cases-v1` | Case records and workflow updates |
| `rpngc-profile-v1` | Editable officer profile fields |
| `rpngc-settings-v1` | System settings |

## 9. Persistence and simulation boundaries

Persisted locally:

- Case changes.
- Officer profile fields.
- System settings.

In-memory state that resets on reload:

- Alert acknowledgement and dismissal.
- User additions, role changes, and suspension state.
- Profile notification toggles.

Simulated pending backend integration:

- Authentication and logout (Logout currently returns to Overview).
- Password-reset and user-invitation delivery.
- Browser/email notification delivery.
- Automatic assignment and backups.
- Audit-log storage.
- Real-time updates.

## 10. Accessibility considerations

Implemented measures include semantic navigation landmarks, labels for search/filter controls, descriptive button text, text plus color for status, keyboard focus states, Enter-key global search, accessible empty states, an accessible Overview trend description, and native date/select/button/link/table/details elements.

Future work should include a complete keyboard audit, screen-reader testing, reduced-motion review, and formal contrast verification.

## 11. Responsive behavior

Responsive work includes KPI layouts collapsing from four columns to two and one; report/analytics panels stacking; horizontal mobile navigation; compact utility actions; full-width forms; scrollable tables/filter rows; stacked case-detail actions; and mobile-friendly settings tabs and custom dates.

## 12. Key source files

| File | Responsibility |
|---|---|
| `src/App.tsx` | Application routes |
| `src/components/Layout.tsx` | Sidebar, utility bar, global search, notifications, profile menu |
| `src/components/icons.tsx` | Shared icon library |
| `src/components/badges.tsx` | Stage and priority badges |
| `src/index.css` | Global design system and responsive styling |
| `src/lib/store.tsx` | Shared case state and persistence |
| `src/lib/types.ts` | Case, stage, priority, timeline, and note types |
| `src/lib/pipeline.ts` | Workflow stages, officers, and evidence definitions |
| `src/lib/mock.ts` | Demonstration-case generation |
| `src/pages/OverviewPage.tsx` | Overview and Quick Actions |
| `src/pages/CasesPage.tsx` | Case search, filtering, and register |
| `src/pages/CaseDetailPage.tsx` | Case workflow and investigation detail |
| `src/pages/ReportsPage.tsx` | Date-scoped reports, printing, and export |
| `src/pages/AnalyticsPage.tsx` | Analytics and export |
| `src/pages/AlertsPage.tsx` | Alert management |
| `src/pages/UsersPage.tsx` | Users, roles, permissions, and account actions |
| `src/pages/ProfilePage.tsx` | Current officer profile and workload |
| `src/pages/SettingsPage.tsx` | System configuration |

## 13. Local development and validation

```bash
npm install
npm run dev
npm run build
npm run preview
```

The development server uses port `5175` in the current environment.

Validation repeatedly performed during implementation:

- TypeScript project compilation.
- Vite production build.
- Worker build step.
- `git diff --check` for whitespace errors.
- Local HTTP route checks for newly introduced pages.

The latest recorded production build completed successfully.

## 14. Known limitations and recommended next work

### 14.1 Backend and identity

The highest-priority next phase is replacing demonstration storage with authenticated services: approved RPNGC SSO, role-based enforcement, server-side users/permissions, a shared public-submission API, evidence storage, and immutable audit history.

### 14.2 Functional gaps

- New Complaint currently opens the case register; a dedicated entry form is still required.
- Report-type selection identifies context, but all panels remain visible instead of switching layouts.
- Overview periods use demonstration scaling for headline values rather than filtering the case store.
- Overview summary tables currently use demonstration values.
- Alerts and Users require durable persistence.
- Notifications require a real event/messaging service.
- Logout requires a real authenticated session.
- The RPNGC crest uses a remote URL and should become an approved local asset.

### 14.3 Quality assurance

Recommended additions include unit tests for date ranges and filters, workflow integration tests, end-to-end tests, visual regression testing, formal accessibility testing, and a security review.

## 15. Chronological change record

1. Recreated and enhanced the supplied RPNGC Overview interface.
2. Audited spacing, sidebar proportions, icons, cards, and responsiveness.
3. Reduced the sidebar based on the SCPNG layout reference.
4. Added sidebar scrolling and branded global scrollbar behavior.
5. Corrected Cases padding, table spacing, and filter layout.
6. Branded dropdown controls and added Reset Filters.
7. Built and routed Reports.
8. Built and routed Analytics.
9. Removed non-functional decorative shield actions.
10. Replaced sidebar Reset/shield items with Logout.
11. Moved Profile into primary navigation.
12. Corrected Case Detail spacing and action sizing.
13. Built Alerts and connected alert actions.
14. Built Users & Roles and access-management interactions.
15. Built Profile with live officer workload.
16. Built Settings with saved configuration and restoration.
17. Replaced Overview status breakdown with Quick Actions.
18. Consolidated four lower cards into two operational tables.
19. Stacked the two tables into separate full-width rows.
20. Added custom report dates with validation and recalculation.
21. Added the global utility bar with live search, notifications, and profile menu.
22. Removed Overview export so exports remain in reporting workflows.

## 16. Handover status

The application is a strong interactive prototype. Navigation, page architecture, responsive design, case workflow, local persistence, reporting calculations, custom dates, CSV generation, and operational UI are functional. It is ready for stakeholder review and the next engineering phase: authentication, backend integration, durable data services, automated testing, and deployment hardening.
