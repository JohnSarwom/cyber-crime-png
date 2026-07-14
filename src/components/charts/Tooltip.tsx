import type { ReactNode } from 'react'

/**
 * Chart tooltip — values lead (strong), labels follow; series identity comes
 * from a short line-key stroke, not a filled box. Positioned inside the
 * chart card, clamped to its bounds, pointer-transparent.
 */
export interface TooltipState {
  x: number
  y: number
  title: string
  rows: { key?: string; label: string; value: string }[]
}

export function ChartTooltip({ tip, width }: { tip: TooltipState | null; width: number }) {
  if (!tip) return null
  const flip = tip.x > width - 150
  return (
    <div
      className="pointer-events-none absolute z-20 min-w-28 rounded-lg border border-panel-border bg-navy-950/95 px-3 py-2 shadow-xl backdrop-blur"
      style={{
        left: flip ? undefined : tip.x + 14,
        right: flip ? width - tip.x + 14 : undefined,
        top: Math.max(4, tip.y - 14),
      }}
    >
      <div className="text-[10px] font-medium text-ink-400">{tip.title}</div>
      {tip.rows.map((r, i) => (
        <div key={i} className="mt-0.5 flex items-center gap-2">
          {r.key && <span className="h-0.5 w-3 rounded" style={{ background: r.key }} aria-hidden />}
          <span className="text-sm font-semibold text-ink-100">{r.value}</span>
          <span className="text-[11px] text-ink-400">{r.label}</span>
        </div>
      ))}
    </div>
  )
}

/** Collapsible table view — every charted value reachable without hover. */
export function DataTable({ children }: { children: ReactNode }) {
  return (
    <details className="mt-3 border-t border-panel-border pt-2">
      <summary className="cursor-pointer select-none text-[11px] font-medium text-ink-400 hover:text-ink-200">
        View data
      </summary>
      <div className="mt-2 max-h-44 overflow-auto">
        <table className="tabular w-full text-left text-[11px] text-ink-300">{children}</table>
      </div>
    </details>
  )
}
