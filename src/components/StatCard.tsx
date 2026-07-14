import { ArrowDown, ArrowUp } from './icons'

interface StatCardProps {
  label: string
  value: number
  /** % change vs the prior equal-length period; null = prior period had no data. */
  deltaPct: number | null
  deltaLabel: string
  /** Whether an increase is a good thing (colors the delta). */
  upIsGood: boolean
  /** Optional 12-point trend, oldest→newest. */
  spark?: number[]
}

const fmt = new Intl.NumberFormat('en')

function Sparkline({ points }: { points: number[] }) {
  const W = 96
  const H = 30
  const PAD = 4
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const range = max - min || 1
  const step = (W - PAD * 2) / (points.length - 1)
  const xy = points.map((v, i) => [
    PAD + i * step,
    PAD + (H - PAD * 2) * (1 - (v - min) / range),
  ])
  const d = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lx, ly] = xy[xy.length - 1]

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden className="flex-shrink-0">
      {/* de-emphasis hue for history … */}
      <path d={d} fill="none" stroke="var(--color-stage-5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* … accent + surface ring on the current period */}
      <circle cx={lx} cy={ly} r="5.5" fill="var(--color-viz-surface)" />
      <circle cx={lx} cy={ly} r="4" fill="var(--color-series-1)" />
    </svg>
  )
}

export default function StatCard({ label, value, deltaPct, deltaLabel, upIsGood, spark }: StatCardProps) {
  const up = deltaPct !== null && deltaPct > 0
  const flat = deltaPct === null || deltaPct === 0
  const good = !flat && up === upIsGood

  return (
    <div className="viz-card flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-ink-400">{label}</div>
        <div className="mt-1 text-3xl font-semibold text-ink-100">{fmt.format(value)}</div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-ink-400">
          {!flat &&
            (up ? (
              <ArrowUp width={12} height={12} style={{ color: good ? 'var(--color-status-good)' : 'var(--color-status-critical)' }} />
            ) : (
              <ArrowDown width={12} height={12} style={{ color: good ? 'var(--color-status-good)' : 'var(--color-status-critical)' }} />
            ))}
          <span
            className="font-semibold"
            style={flat ? undefined : { color: good ? 'var(--color-status-good)' : 'var(--color-status-critical)' }}
          >
            {deltaPct === null ? '—' : `${deltaPct > 0 ? '+' : ''}${deltaPct}%`}
          </span>
          <span>{deltaLabel}</span>
        </div>
      </div>
      {spark && spark.length > 1 && <Sparkline points={spark} />}
    </div>
  )
}
