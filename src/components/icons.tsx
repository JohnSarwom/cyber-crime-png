import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps): IconProps => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

export const ShieldLock = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

export const Grid = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
)

export const Folder = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
)

export const Search = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4-4" />
  </svg>
)

export const Scales = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v16M7 20h10M5 8h14M5 8l-2.5 5a3 3 0 005 0L5 8zM19 8l-2.5 5a3 3 0 005 0L19 8z" />
    <circle cx="12" cy="4.5" r="1" />
  </svg>
)

export const Gavel = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M13 6l5 5M8 11l5-5M11 8l6 6M3 21l7-7" />
    <path d="M14 21h7" />
  </svg>
)

export const User = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0114 0" />
  </svg>
)

export const Clock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)

export const Alert = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l9 16H3l9-16z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
)

export const Check = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12.5l5 5L20 7" />
  </svg>
)

export const Chevron = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)

export const ArrowUp = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
)

export const ArrowDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
)

export const Doc = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 3h7l4 4v14H7V3z" />
    <path d="M14 3v4h4M10 12h5M10 16h5" />
  </svg>
)

export const Minus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
)

export const Reports = (p: IconProps) => <svg {...base(p)}><path d="M5 20V11M12 20V4M19 20v-7" /></svg>
export const Analytics = (p: IconProps) => <svg {...base(p)}><path d="M12 3v9l7.8 3.5A8.5 8.5 0 1 1 12 3z" /><path d="M15 3.7A8.5 8.5 0 0 1 20.3 9H15z" /></svg>
export const Bell = (p: IconProps) => <svg {...base(p)}><path d="M5 17h14l-2-3v-4a5 5 0 0 0-10 0v4l-2 3zM10 20h4" /></svg>
export const Users = (p: IconProps) => <svg {...base(p)}><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5" /></svg>
export const Settings = (p: IconProps) => <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19 13.5l2 1.2-2 3.5-2.1-1a8 8 0 0 1-2.6 1.5L14 21h-4l-.3-2.3a8 8 0 0 1-2.6-1.5l-2.1 1-2-3.5 2-1.2a8 8 0 0 1 0-3L3 9.3 5 5.8l2.1 1a8 8 0 0 1 2.6-1.5L10 3h4l.3 2.3a8 8 0 0 1 2.6 1.5l2.1-1 2 3.5-2 1.2a8 8 0 0 1 0 3z" /></svg>
export const Refresh = (p: IconProps) => <svg {...base(p)}><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6.1 8A7 7 0 0 1 18 6l2 2M17.9 16A7 7 0 0 1 6 18l-2-2" /></svg>
export const Download = (p: IconProps) => <svg {...base(p)}><path d="M12 3v12M8 11l4 4 4-4M5 19h14" /></svg>
export const Calendar = (p: IconProps) => <svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>
export const MapPin = (p: IconProps) => <svg {...base(p)}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="2.5" /></svg>
export const Plus = (p: IconProps) => <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
