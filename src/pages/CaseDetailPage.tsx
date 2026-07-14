import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCases } from '../lib/store'
import { DECISIONS, EVIDENCE_TYPES, SECTION_23, STAGES, STAGE_INDEX, nextStage, stageOf } from '../lib/pipeline'
import type { DecisionOutcome } from '../lib/types'
import { fmtDate, fmtDateTime } from '../lib/format'
import { PriorityBadge, StageBadge } from '../components/badges'
import { OFFICERS } from '../lib/pipeline'
import { Check, Chevron, Gavel, Scales } from '../components/icons'

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel p-5">
      <h3 className="display mb-3 text-sm font-bold uppercase tracking-wide text-cyan-glow">{title}</h3>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex gap-3 py-1 text-sm">
      <span className="w-36 flex-shrink-0 font-medium text-ink-400">{label}</span>
      <span className="min-w-0 text-ink-100">{value ?? '—'}</span>
    </div>
  )
}

/** Horizontal pipeline stepper — completed stages carry the ordinal ramp. */
function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center">
      {STAGES.map((s, i) => (
        <li key={s.id} className={`flex items-center ${i < STAGES.length - 1 ? 'flex-1' : ''}`}>
          <div className="flex flex-col items-center gap-1.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold"
              style={
                i <= current
                  ? { background: s.color, borderColor: s.color, color: i < 3 ? '#0b1830' : '#fff' }
                  : { borderColor: 'var(--color-panel-border)', color: 'var(--color-ink-400)' }
              }
            >
              {i < current ? <Check width={13} height={13} /> : i + 1}
            </span>
            <span className={`whitespace-nowrap text-[10px] font-medium ${i <= current ? 'text-ink-200' : 'text-ink-400'}`}>
              {s.short}
            </span>
          </div>
          {i < STAGES.length - 1 && (
            <span
              className="mx-2 mb-5 h-px flex-1"
              style={{ background: i < current ? 'var(--color-stage-4)' : 'var(--color-panel-border)' }}
              aria-hidden
            />
          )}
        </li>
      ))}
    </ol>
  )
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cases, advance, assign, addNote, setDecision } = useCases()
  const [noteText, setNoteText] = useState('')

  const c = cases.find((x) => x.id === id)
  if (!c) {
    return (
      <div className="panel mx-auto max-w-md p-8 text-center">
        <p className="text-sm text-ink-300">Case not found.</p>
        <Link to="/cases" className="btn btn-primary mt-4 px-4 py-2 text-sm">
          Back to cases
        </Link>
      </div>
    )
  }

  const stageIdx = STAGE_INDEX[c.stage]
  const next = nextStage(c.stage)
  const needsDecision = c.stage === 'in_court' && !c.decision

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="mb-2 flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-ink-200">
            <Chevron width={12} height={12} className="rotate-180" /> Back
          </button>
          <h1 className="display tabular text-2xl font-bold tracking-wide text-ink-100">{c.ref}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StageBadge stage={c.stage} />
            <PriorityBadge priority={c.priority} />
            <span className="text-xs text-ink-400">Filed {fmtDate(c.filedAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input w-44"
            value={c.assignedTo ?? ''}
            onChange={(e) => assign(c.id, e.target.value)}
            aria-label="Assign officer"
          >
            <option value="" disabled>
              Assign officer…
            </option>
            {OFFICERS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {next && (
            <button
              className="btn btn-primary px-4 py-2 text-sm disabled:opacity-40"
              disabled={needsDecision}
              title={needsDecision ? 'Record the court decision first' : undefined}
              onClick={() => advance(c.id)}
            >
              Advance to {stageOf(next).short} <Chevron width={14} height={14} />
            </button>
          )}
        </div>
      </header>

      {/* Pipeline */}
      <div className="panel p-5">
        <Stepper current={stageIdx} />
        <p className="mt-3 text-xs text-ink-400">{stageOf(c.stage).description}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 xl:col-span-2">
          <Panel title="Incident">
            <blockquote className="mb-3 rounded-md border-l-2 border-cyan-glow/60 bg-navy-900/50 p-3 text-xs italic text-ink-300">
              {SECTION_23}
            </blockquote>
            <Row label="Nature" value={c.natureSummary} />
            <Row label="Impact on victim" value={c.impactSummary} />
            <Row label="Platform" value={c.platform} />
            <Row label="Province" value={c.province} />
            <Row label="Offender (alias)" value={c.offenderAlias ?? 'Unknown'} />
          </Panel>

          <Panel title="Evidence provided">
            <ul className="space-y-1.5 text-sm">
              {EVIDENCE_TYPES.map((e) => {
                const has = c.evidence.includes(e.id)
                return (
                  <li key={e.id} className={`flex items-center gap-2 ${has ? 'text-ink-100' : 'text-ink-400'}`}>
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded border"
                      style={
                        has
                          ? { background: 'var(--color-cyber-500)', borderColor: 'var(--color-cyber-500)', color: '#fff' }
                          : { borderColor: 'var(--color-panel-border)' }
                      }
                    >
                      {has && <Check width={11} height={11} />}
                    </span>
                    {e.label}
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-xs text-ink-400">
              {c.attachedFileCount} file{c.attachedFileCount === 1 ? '' : 's'} attached to the complaint.
            </p>
          </Panel>

          <Panel title="Timeline">
            <ol className="relative ml-2 space-y-4 border-l border-panel-border pl-5">
              {[...c.timeline].reverse().map((ev, i) => {
                const s = stageOf(ev.stage)
                return (
                  <li key={i} className="relative">
                    <span
                      className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-navy-950"
                      style={{ background: s.color }}
                      aria-hidden
                    />
                    <div className="text-sm font-semibold text-ink-100">{s.label}</div>
                    <div className="text-[11px] text-ink-400">
                      {fmtDateTime(ev.date)}
                      {ev.officer ? ` · ${ev.officer}` : ''}
                    </div>
                    {ev.note && <p className="mt-1 text-xs text-ink-300">{ev.note}</p>}
                  </li>
                )
              })}
            </ol>
          </Panel>

          <Panel title="Case notes">
            {c.notes.length > 0 ? (
              <ul className="mb-3 space-y-3">
                {c.notes.map((n, i) => (
                  <li key={i} className="rounded-lg border border-panel-border bg-navy-900/40 p-3">
                    <div className="text-[11px] text-ink-400">
                      {fmtDateTime(n.date)} · {n.officer}
                    </div>
                    <p className="mt-1 text-sm text-ink-200">{n.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-3 text-xs text-ink-400">No notes yet.</p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (noteText.trim()) {
                  addNote(c.id, noteText.trim())
                  setNoteText('')
                }
              }}
              className="flex gap-2"
            >
              <input
                className="input"
                placeholder="Add an investigation note…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button type="submit" className="btn btn-outline px-4 py-2 text-sm">
                Add
              </button>
            </form>
          </Panel>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Panel title="Parties">
            <Row label="Complainant" value={c.complainant.name} />
            <Row label="Contact" value={<span className="tabular">{c.complainant.contact}</span>} />
            <Row label="Email" value={c.complainant.email} />
            <div className="my-2 border-t border-panel-border" />
            <Row
              label="Victim"
              value={c.victimSameAsComplainant ? `${c.complainant.name} (same as complainant)` : c.victimName}
            />
          </Panel>

          <Panel title="Decision & penalty">
            {c.decision ? (
              <div className="rounded-lg border border-cyan-glow/25 bg-cyber-500/10 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink-100">
                  <Gavel width={16} height={16} className="text-cyan-soft" />
                  {DECISIONS[c.decision].label}
                </div>
                <p className="mt-1 text-xs text-ink-300">{DECISIONS[c.decision].penalty}</p>
              </div>
            ) : c.stage === 'in_court' ? (
              <div>
                <p className="mb-2 text-xs text-ink-400">Record the National Court decision to resolve this case:</p>
                <select
                  className="input"
                  defaultValue=""
                  onChange={(e) => e.target.value && setDecision(c.id, e.target.value as DecisionOutcome)}
                  aria-label="Record decision"
                >
                  <option value="" disabled>
                    Select decision…
                  </option>
                  {(Object.keys(DECISIONS) as DecisionOutcome[]).map((d) => (
                    <option key={d} value={d}>
                      {DECISIONS[d].label} — {DECISIONS[d].penalty}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <ul className="space-y-1.5 text-xs text-ink-400">
                {(Object.keys(DECISIONS) as DecisionOutcome[]).map((d) => (
                  <li key={d} className="flex items-center gap-2">
                    <Scales width={13} height={13} className="flex-shrink-0" />
                    <span>
                      <span className="text-ink-300">{DECISIONS[d].label}</span> → {DECISIONS[d].penalty}
                    </span>
                  </li>
                ))}
                <li className="pt-1 text-[11px]">Courts may also impose fines and ICT restrictions.</li>
              </ul>
            )}
          </Panel>

          <Panel title="Victim remedies">
            <ul className="space-y-1.5 text-sm">
              {[
                { on: c.remedies.contentRemoval, label: 'Order for removal of harmful content' },
                { on: c.remedies.protectionOrder, label: 'Protection order against further harassment' },
              ].map((r) => (
                <li key={r.label} className={`flex items-center gap-2 ${r.on ? 'text-ink-100' : 'text-ink-400'}`}>
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full border"
                    style={
                      r.on
                        ? { background: 'var(--color-status-good)', borderColor: 'var(--color-status-good)', color: '#fff' }
                        : { borderColor: 'var(--color-panel-border)' }
                    }
                  >
                    {r.on && <Check width={11} height={11} />}
                  </span>
                  {r.label}
                </li>
              ))}
            </ul>
            {c.stage !== 'resolved' && (
              <p className="mt-2 text-[11px] text-ink-400">Remedies are recorded when the case resolves.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
