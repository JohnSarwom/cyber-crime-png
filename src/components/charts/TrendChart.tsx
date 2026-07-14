import { useLayoutEffect, useRef, useState } from 'react'
import type { Bucket } from '../../lib/format'
import { niceTicks } from '../../lib/format'
import { ChartTooltip, DataTable, type TooltipState } from './Tooltip'

const H = 220
const M = { top: 14, right: 52, bottom: 24, left: 36 }

/**
 * Complaints-over-time line: 2px line, 10% area wash, crosshair snapped to the
 * nearest bucket, end-dot with surface ring, endpoint direct label.
 * Single series — the card title names it, so no legend.
 */
export default function TrendChart({ buckets }: { buckets: Bucket[] }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(560)
  const [hover, setHover] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const innerW = Math.max(80, width - M.left - M.right)
  const innerH = H - M.top - M.bottom
  const max = Math.max(...buckets.map((b) => b.count), 1)
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1]

  const x = (i: number) => M.left + (buckets.length === 1 ? innerW / 2 : (innerW * i) / (buckets.length - 1))
  const y = (v: number) => M.top + innerH * (1 - v / top)

  const line = buckets.map((b, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(b.count).toFixed(1)}`).join(' ')
  const area = `${line} L${x(buckets.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`

  const snap = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = clientX - rect.left
    const i = Math.round(((px - M.left) / innerW) * (buckets.length - 1))
    setHover(Math.max(0, Math.min(buckets.length - 1, i)))
  }

  const last = buckets.length - 1
  const tip: TooltipState | null =
    hover !== null
      ? {
          x: x(hover),
          y: y(buckets[hover].count),
          title: buckets[hover].label,
          rows: [
            {
              key: 'var(--color-series-1)',
              value: String(buckets[hover].count),
              label: buckets[hover].count === 1 ? 'complaint' : 'complaints',
            },
          ],
        }
      : null

  return (
    <div ref={wrapRef} className="relative">
      <svg
        width={width}
        height={H}
        role="application"
        aria-label="Complaints filed over time. Use arrow keys to inspect values."
        tabIndex={0}
        className="block cursor-crosshair outline-none focus-visible:ring-2 focus-visible:ring-cyan-glow/60"
        onPointerMove={(e) => snap(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onFocus={() => setHover(last)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? last) - 1))
          if (e.key === 'ArrowRight') setHover((h) => Math.min(last, (h ?? last) + 1))
        }}
      >
        {/* gridlines + y ticks */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={M.left + innerW} y1={y(t)} y2={y(t)} stroke={t === 0 ? 'var(--color-axis)' : 'var(--color-grid)'} strokeWidth="1" />
            <text x={M.left - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="var(--color-ink-400)" className="tabular">
              {t}
            </text>
          </g>
        ))}

        {/* x labels: first / middle / last only */}
        {[0, Math.floor(last / 2), last]
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((i) => (
            <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === last ? 'end' : 'middle'} fontSize="10" fill="var(--color-ink-400)">
              {buckets[i].label}
            </text>
          ))}

        {/* area wash + line */}
        <path d={area} fill="var(--color-series-1)" opacity="0.1" />
        <path d={line} fill="none" stroke="var(--color-series-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* crosshair */}
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={M.top + innerH} stroke="var(--color-ink-400)" strokeWidth="1" opacity="0.55" />
        )}
        {hover !== null && (
          <>
            <circle cx={x(hover)} cy={y(buckets[hover].count)} r="6" fill="var(--color-viz-surface)" />
            <circle cx={x(hover)} cy={y(buckets[hover].count)} r="4" fill="var(--color-series-1)" />
          </>
        )}

        {/* end-dot with surface ring + endpoint direct label */}
        <circle cx={x(last)} cy={y(buckets[last].count)} r="6" fill="var(--color-viz-surface)" />
        <circle cx={x(last)} cy={y(buckets[last].count)} r="4" fill="var(--color-series-1)" />
        <text x={x(last) + 10} y={y(buckets[last].count) + 4} fontSize="11" fontWeight="600" fill="var(--color-ink-100)" className="tabular">
          {buckets[last].count}
        </text>
      </svg>

      <ChartTooltip tip={tip} width={width} />

      <DataTable>
        <thead>
          <tr className="text-ink-400">
            <th className="py-1 pr-4 font-medium">Period</th>
            <th className="py-1 font-medium">Complaints</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((b) => (
            <tr key={b.start} className="border-t border-panel-border/50">
              <td className="py-1 pr-4">{b.label}</td>
              <td className="py-1">{b.count}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}
