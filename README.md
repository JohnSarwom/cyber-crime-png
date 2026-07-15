# RPNGC Cyber Unit — Case Management Dashboard

> See [docs/IMPLEMENTATION_RECORD.md](docs/IMPLEMENTATION_RECORD.md) for the detailed
> design, functionality, architecture, validation, limitations, and handover record.

Internal (officer-facing) dashboard for managing cyber harassment complaints under
**Section 23 of the Cybercrime Act 2016** (Papua New Guinea). Companion to the public
reporting portal in `../cyber-security-reporting`.

## What it does

- **Overview** — date-scoped KPIs (new / active / charged / resolved with deltas vs the
  prior period), complaints-over-time trend, case-pipeline distribution, platform
  breakdown, recent filings. All charts carry tooltips, keyboard access and a table view.
- **Cases** — searchable, filterable queue of all complaints (stage, priority, province,
  platform, assigned officer).
- **Case detail** — the document's process flow as a live pipeline stepper
  (Filed → Evidence Review → Investigation → Charges Filed → Court → Resolved), the
  complaint's parties/incident/evidence, timeline, investigation notes, court decision
  recording (misdemeanour ≤7y / serious harm ≤10y / death → life), and victim remedies.

Data is a deterministic mock dataset (seeded) persisted to `localStorage` — the stand-in
for the future submissions API shared with the public portal. "Reset demo data" in the
sidebar regenerates it.

## Tech

Vite · React 18 · TypeScript · Tailwind CSS v4 · React Router. Charts are hand-rolled SVG
following a validated dark-surface palette (categorical, ordinal pipeline ramp, and status
colors checked for CVD separation and contrast against the navy chart surface).

## Getting started

```bash
npm install
npm run dev      # http://localhost:5175
npm run build    # type-check + production build
```

## Roadmap

- Shared submissions API with the public portal (issue case references, receive evidence).
- Authentication / role-based access for officers.
- Real analytics (province mapping, response-time SLAs) once live data exists.
