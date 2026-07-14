import { useLayoutEffect, useRef, useState } from 'react'
import { ChartTooltip, DataTable, type TooltipState } from './Tooltip'

interface Datum {
  label: string
  value: number
}

const BAR = 18 // ≤ 24px
const ROW = 32
const M = { left: 84, right: 44 }

/** Rounded data-end (4px), square at the baseline. */
function barPath(w: number, h: number) {
  const r = Math.min(4, w)
  return `M0,0 H${w - r} A${r},${r} 0 0 1 ${w},${r} V${h - r} A${r},${r} 0 0 1 ${w - r},${h} H0 Z`
}

/**
 * Horizontal magnitude comparison — one measure, so one hue (series-1),
 * value at the tip, per-bar hover/focus tooltip. Single series → no legend.
 */
export default function BarChart({ data }: { data: Datum[] }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(420)
  const [hover, setHover] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const innerW = Math.max(60, width - M.left - M.right)
  const H = data.length * ROW
  const max = Math.max(...data.map((d) => d.value), 1)

  const tip: TooltipState | null =
    hover !== null
      ? {
          x: M.left + (data[hover].value / max) * innerW,
          y: hover * ROW + ROW / 2,
          title: data[hover].label,
          rows: [
            {
              key: 'var(--color-series-1)',
              value: String(data[hover].value),
              label: data[hover].value === 1 ? 'case' : 'cases',
            },
          ],
        }
      : null

  return (
    <div ref={wrapRef} className="relative">
      <svg width={width} height={H} className="block">
        {data.map((d, i) => {
          const w = (d.value / max) * innerW
          const yTop = i * ROW + (ROW - BAR) / 2
          const hovered = hover === i
          return (
            <g key={d.label} transform={`translate(0,${yTop})`}>
              {/* category label — text token, never the series color */}
              <text x={M.left - 10} y={BAR / 2 + 3.5} textAnchor="end" fontSize="11" fill="var(--color-ink-300)">
                {d.label}
              </text>
              <g transform={`translate(${M.left},0)`}>
                <path
                  d={barPath(Math.max(w, 1), BAR)}
                  fill="var(--color-series-1)"
                  style={{ filter: hovered ? 'brightness(1.2)' : undefined, transition: 'filter 0.1s' }}
                />
              </g>
              {/* value at the tip */}
              <text x={M.left + w + 8} y={BAR / 2 + 3.5} fontSize="11" fontWeight="600" fill="var(--color-ink-100)" className="tabular">
                {d.value}
              </text>
              {/* hit target: the whole row band */}
              <rect
                x={0}
                y={-(ROW - BAR) / 2}
                width={width}
                height={ROW}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${d.label}: ${d.value} cases`}
                className="outline-none focus-visible:stroke-cyan-glow"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              />
            </g>
          )
        })}
        {/* baseline */}
        <line x1={M.left} x2={M.left} y1={0} y2={H} stroke="var(--color-axis)" strokeWidth="1" />
      </svg>

      <ChartTooltip tip={tip} width={width} />

      <DataTable>
        <thead>
          <tr className="text-ink-400">
            <th className="py-1 pr-4 font-medium">Platform</th>
            <th className="py-1 font-medium">Cases</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label} className="border-t border-panel-border/50">
              <td className="py-1 pr-4">{d.label}</td>
              <td className="py-1">{d.value}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}
