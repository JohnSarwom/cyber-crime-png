export const FONT_OPTIONS = [
  { name: 'Inter', family: "'Inter', sans-serif", use: 'Best all-purpose dashboard font' },
  { name: 'Roboto', family: "'Roboto', sans-serif", use: 'Reliable for data-heavy and Android-style interfaces' },
  { name: 'Manrope', family: "'Manrope', sans-serif", use: 'Modern, premium-looking dashboards' },
  { name: 'DM Sans', family: "'DM Sans', sans-serif", use: 'Friendly and slightly softer appearance' },
  { name: 'IBM Plex Sans', family: "'IBM Plex Sans', sans-serif", use: 'Technical, institutional, or cybersecurity systems' },
  { name: 'Public Sans', family: "'Public Sans', sans-serif", use: 'Government and public-service dashboards' },
  { name: 'Source Sans 3', family: "'Source Sans 3', sans-serif", use: 'Professional enterprise applications' },
] as const

export type FontName = (typeof FONT_OPTIONS)[number]['name']

const FONT_STORAGE_KEY = 'rpngc-dashboard-font'

export function getSavedFont(): FontName {
  const saved = localStorage.getItem(FONT_STORAGE_KEY)
  return FONT_OPTIONS.some((font) => font.name === saved) ? saved as FontName : 'Inter'
}

export function applyFont(fontName: FontName) {
  const font = FONT_OPTIONS.find((option) => option.name === fontName) ?? FONT_OPTIONS[0]
  document.documentElement.style.setProperty('--font-ui', font.family)
  localStorage.setItem(FONT_STORAGE_KEY, font.name)
}
