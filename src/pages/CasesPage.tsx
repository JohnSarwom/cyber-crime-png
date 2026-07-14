import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCases } from '../lib/store'
import { STAGES } from '../lib/pipeline'
import type { CaseStage, Priority } from '../lib/types'
import { fmtDate } from '../lib/format'
import { PriorityBadge, StageBadge } from '../components/badges'
import { Search } from '../components/icons'

const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low']

export default function CasesPage() {
  const { cases } = useCases()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [stage, setStage] = useState<CaseStage | 'all'>('all')
  const [priority, setPriority] = useState<Priority | 'all'>('all')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return cases.filter((c) => {
      if (stage !== 'all' && c.stage !== stage) return false
      if (priority !== 'all' && c.priority !== priority) return false
      if (!needle) return true
      return [c.ref, c.complainant.name, c.platform, c.province, c.assignedTo ?? '']
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
  }, [cases, q, stage, priority])

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-2xl font-bold tracking-wide text-ink-100">Cases</h1>
          <p className="mt-1 text-sm text-ink-400">
            {filtered.length} of {cases.length} complaints
          </p>
        </div>
      </header>

      {/* Filter row — one row, above the content it scopes */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72 max-w-full">
          <Search width={15} height={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className="input pl-9"
            placeholder="Search ref, name, platform, province…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="input w-44" value={stage} onChange={(e) => setStage(e.target.value as CaseStage | 'all')} aria-label="Filter by stage">
          <option value="all">All stages</option>
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select className="input w-40" value={priority} onChange={(e) => setPriority(e.target.value as Priority | 'all')} aria-label="Filter by priority">
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p[0].toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="viz-card overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-panel-border text-[11px] uppercase tracking-wider text-ink-400">
              <th className="px-4 py-3 font-semibold">Ref</th>
              <th className="px-4 py-3 font-semibold">Filed</th>
              <th className="px-4 py-3 font-semibold">Complainant</th>
              <th className="px-4 py-3 font-semibold">Platform</th>
              <th className="px-4 py-3 font-semibold">Province</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">Stage</th>
              <th className="px-4 py-3 font-semibold">Officer</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                tabIndex={0}
                onClick={() => navigate(`/cases/${c.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/cases/${c.id}`)}
                className="cursor-pointer border-b border-panel-border/40 outline-none transition-colors last:border-0 hover:bg-navy-800/40 focus-visible:bg-navy-800/50"
              >
                <td className="tabular px-4 py-3 text-xs font-semibold text-cyan-soft">{c.ref}</td>
                <td className="tabular whitespace-nowrap px-4 py-3 text-xs text-ink-300">{fmtDate(c.filedAt)}</td>
                <td className="px-4 py-3 text-ink-100">{c.complainant.name}</td>
                <td className="px-4 py-3 text-xs text-ink-300">{c.platform}</td>
                <td className="px-4 py-3 text-xs text-ink-300">{c.province}</td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={c.priority} />
                </td>
                <td className="px-4 py-3">
                  <StageBadge stage={c.stage} />
                </td>
                <td className="px-4 py-3 text-xs text-ink-300">{c.assignedTo ?? <span className="text-ink-400">Unassigned</span>}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink-400">
                  No cases match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
