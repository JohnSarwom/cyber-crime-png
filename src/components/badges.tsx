import type { CaseStage, Priority } from '../lib/types'
import { stageOf } from '../lib/pipeline'
import { Alert, ArrowDown, ArrowUp, Minus } from './icons'

/**
 * Stage badge — identity comes from the ordinal-ramp dot beside the text;
 * the text itself stays in ink tokens.
 */
export function StageBadge({ stage }: { stage: CaseStage }) {
  const s = stageOf(stage)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-panel-border bg-navy-900/60 px-2.5 py-1 text-[11px] font-medium text-ink-200">
      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden />
      {s.label}
    </span>
  )
}

/** Priority badge — reserved status colors, always icon + label. */
const PRIORITY: Record<
  Priority,
  { label: string; color: string; Icon: typeof Alert }
> = {
  critical: { label: 'Critical', color: 'var(--color-status-critical)', Icon: Alert },
  high: { label: 'High', color: 'var(--color-status-serious)', Icon: ArrowUp },
  medium: { label: 'Medium', color: 'var(--color-status-warning)', Icon: Minus },
  low: { label: 'Low', color: 'var(--color-status-good)', Icon: ArrowDown },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const p = PRIORITY[priority]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-panel-border bg-navy-900/60 px-2.5 py-1 text-[11px] font-medium text-ink-200">
      <p.Icon width={12} height={12} style={{ color: p.color }} aria-hidden />
      {p.label}
    </span>
  )
}
