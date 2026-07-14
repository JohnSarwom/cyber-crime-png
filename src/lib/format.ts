const DAY = 86_400_000

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const shortFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const timeFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export const fmtDate = (iso: string) => dateFmt.format(new Date(iso))
export const fmtShort = (d: Date) => shortFmt.format(d)
export const fmtDateTime = (iso: string) => timeFmt.format(new Date(iso))

export interface Bucket {
  label: string
  start: number
  end: number
  count: number
}

/**
 * Split [from, to] into equal buckets (daily when the span is a month or less,
 * else weekly) and count items by timestamp.
 */
export function bucketize(times: number[], from: number, to: number): Bucket[] {
  const span = to - from
  const size = span <= 31 * DAY ? DAY : 7 * DAY
  const n = Math.max(2, Math.ceil(span / size))
  const buckets: Bucket[] = Array.from({ length: n }, (_, i) => {
    const start = from + i * size
    return {
      start,
      end: Math.min(start + size, to),
      label: size === DAY ? fmtShort(new Date(start)) : `Wk of ${fmtShort(new Date(start))}`,
      count: 0,
    }
  })
  for (const t of times) {
    if (t < from || t > to) continue
    const idx = Math.min(buckets.length - 1, Math.floor((t - from) / size))
    buckets[idx].count++
  }
  return buckets
}

/** Fixed-count buckets (for sparklines). */
export function bucketizeN(times: number[], from: number, to: number, n: number): number[] {
  const size = (to - from) / n
  const counts = new Array<number>(n).fill(0)
  for (const t of times) {
    if (t < from || t > to) continue
    counts[Math.min(n - 1, Math.floor((t - from) / size))]++
  }
  return counts
}

/** Clean y-axis ticks: 0..max rounded to a nice step. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1]
  const rawStep = max / count
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= rawStep) ?? 10 * mag
  const top = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = 0; v <= top; v += step) ticks.push(v)
  return ticks
}

export const pctChange = (current: number, prior: number): number | null =>
  prior === 0 ? null : Math.round(((current - prior) / prior) * 100)
