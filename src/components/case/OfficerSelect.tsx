import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Check, Chevron, User } from '../icons'

interface OfficerSelectProps {
  value?: string
  options: readonly string[]
  onChange: (officer: string) => void
}

export function OfficerSelect({ value, options, onChange }: OfficerSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (!open) return
    const selectedIndex = Math.max(0, options.indexOf(value ?? ''))
    optionRefs.current[selectedIndex]?.focus()
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [open, options, value])

  function select(officer: string) {
    onChange(officer)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    const next = event.key === 'ArrowDown' ? Math.min(options.length - 1, index + 1)
      : event.key === 'ArrowUp' ? Math.max(0, index - 1)
        : event.key === 'Home' ? 0
          : event.key === 'End' ? options.length - 1
            : index
    if (next !== index) {
      event.preventDefault()
      optionRefs.current[next]?.focus()
    }
  }

  return (
    <div className={`officer-select${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="case-control officer-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="case-officer-options"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
          }
        }}
      >
        <span className="officer-select__identity"><User width={18} height={18} aria-hidden="true" /><span>{value || 'Assign officer…'}</span></span>
        <Chevron width={18} height={18} aria-hidden="true" />
      </button>
      {open && <div id="case-officer-options" className="officer-select__menu" role="listbox" aria-label="Assigned officer">
        <span className="officer-select__eyebrow">Assign case officer</span>
        {options.map((officer, index) => {
          const selected = officer === value
          return <button
            key={officer}
            ref={(element) => { optionRefs.current[index] = element }}
            type="button"
            role="option"
            aria-selected={selected}
            className={`officer-select__option${selected ? ' is-selected' : ''}`}
            onClick={() => select(officer)}
            onKeyDown={(event) => navigate(event, index)}
          ><span className="officer-select__avatar">{officer.split(' ').slice(-2).map((part) => part[0]).join('')}</span><span>{officer}</span>{selected && <Check width={16} height={16} aria-hidden="true" />}</button>
        })}
      </div>}
    </div>
  )
}
