import { useLayoutEffect, useRef, useState } from 'react'
import { STAGES } from '../../lib/pipeline'
import type { CaseStage } from '../../lib/types'
import { ChartTooltip, type TooltipState } from './Tooltip'

const BAR_H = 26
const GAP = 2 // surface gap between touching segments

/**
 * Pipeline distribution: one horizontal stacked bar in the ordinal blue ramp
 * with 2px surface gaps; legend below carries every label + count + share
 * (the always-present identity channel). Inline counts only where they fit;
 * interior segments that don't fit rely on legend + tooltip.
 */
export default function StageBar({ counts }: { counts: Record<CaseStage, number> }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(320)
  const [hover, setHover] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const total = STAGES.reduce((s, st) => s + counts[st.id], 0)
  const gaps = GAP * (STAGES.filter((s) => counts[s.id] > 0).length - 1)
  const usable = Math.max(40, width - Math.max(0, gaps))

  // Light ramp steps (1–3) need dark ink for inline labels; dark steps use white.
  const inkFor = (idx: number) => (idx < 3 ? '#0b1830' : '#ffffff')

  let cursor = 0
  const segments = STAGES.map((s, idx) => {
    const count = counts[s.id]
    const w = total > 0 ? (count / total) * usable : 0
    const seg = { ...s, idx, count, x: cursor, w }
    if (count > 0) cursor += w + GAP
    return seg
  })

  const hovered = hover !== null ? segments[hover] : null
  const tip: TooltipState | null = hovered
    ? {
        x: hovered.x + hovered.w / 2,
        y: BAR_H / 2,
        title: hovered.label,
        rows: [
          {
            key: hovered.color,
            value: String(hovered.count),
            label: total > 0 ? `${Math.round((hovered.count / total) * 100)}% of cases` : '',
          },
        ],
      }
    : null

  return (
    <div ref={wrapRef} className="relative">
      <svg width={width} height={BAR_H} className="block">
        <defs>
          <clipPath id="stagebar-round">
            <rect x="0" y="0" width={width} height={BAR_H} rx="5" />
          </clipPath>
        </defs>
        <g clipPath="url(#stagebar-round)">
          {segments.map(
            (s) =>
              s.count > 0 && (
                <g key={s.id}>
                  <rect
                    x={s.x}
                    y={0}
                    width={Math.max(s.w, 1)}
                    height={BAR_H}
                    fill={s.color}
                    style={{ filter: hover === s.idx ? 'brightness(1.15)' : undefined, transition: 'filter 0.1s' }}
                  />
                  {/* inline count only when it fits comfortably */}
                  {s.w >= 34 && (
                    <text
                      x={s.x + s.w / 2}
                      y={BAR_H / 2 + 3.5}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill={inkFor(s.idx)}
                      className="tabular"
                    >
                      {s.count}
                    </text>
                  )}
                </g>
              ),
          )}
        </g>
        {/* hit targets on top (bigger than the mark: full height + gap) */}
        {segments.map(
          (s) =>
            s.count > 0 && (
              <rect
                key={`hit-${s.id}`}
                x={s.x - GAP / 2}
                y={0}
                width={s.w + GAP}
                height={BAR_H}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${s.label}: ${s.count} cases`}
                className="outline-none focus-visible:stroke-cyan-glow"
                onPointerEnter={() => setHover(s.idx)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(s.idx)}
                onBlur={() => setHover(null)}
              />
            ),
        )}
      </svg>

      <ChartTooltip tip={tip} width={width} />

      {/* Legend — swatch mirrors the mark (rect); text in ink tokens */}
      <ul className="mt-4 space-y-1.5">
        {segments.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ background: s.color }} aria-hidden />
            <span className="flex-1 text-ink-300">{s.label}</span>
            <span className="tabular font-semibold text-ink-100">{s.count}</span>
            <span className="tabular w-9 text-right text-ink-400">
              {total > 0 ? `${Math.round((s.count / total) * 100)}%` : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
