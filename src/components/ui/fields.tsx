import { useEffect, useId, useRef, useState } from 'react'
import type { Placement } from '../../lib/types'
import { InfoTooltip } from './InfoTooltip'

interface LabelRowProps {
  label: string
  htmlFor?: string
  tooltip?: React.ReactNode
  docLabel?: string
  docUrl?: string
}

export function LabelRow({ label, htmlFor, tooltip, docLabel, docUrl }: LabelRowProps) {
  return (
    <div className="mb-1 flex items-center gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-slate-300">
        {label}
      </label>
      {tooltip && (
        <InfoTooltip docLabel={docLabel} docUrl={docUrl}>
          {tooltip}
        </InfoTooltip>
      )}
    </div>
  )
}

interface NumberFieldProps extends Omit<LabelRowProps, 'htmlFor'> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  suffix?: string
}

function formatWithCommas(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  return digits === '' ? '' : Number(digits).toLocaleString('en-US')
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  suffix,
  tooltip,
  docLabel,
  docUrl,
}: NumberFieldProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  // Local text state (comma-formatted) so the user can clear the field while typing.
  const [text, setText] = useState(() => value.toLocaleString('en-US'))

  useEffect(() => {
    // Snap to the canonical comma-formatted representation unless the user is
    // mid-edit with an empty field.
    setText((prev) => (prev === '' ? prev : value.toLocaleString('en-US')))
  }, [value])

  const commit = (digits: string) => {
    const parsed = Number(digits)
    if (digits === '' || !Number.isFinite(parsed)) return
    let next = parsed
    if (min !== undefined) next = Math.max(min, next)
    if (max !== undefined) next = Math.min(max, next)
    onChange(next)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    // Count digits left of the cursor, then restore the cursor after the same
    // digit in the re-formatted string so commas don't make the caret jump.
    const digitsBeforeCursor = input.value
      .slice(0, input.selectionStart ?? input.value.length)
      .replace(/\D/g, '').length

    const formatted = formatWithCommas(input.value)
    setText(formatted)
    commit(input.value.replace(/\D/g, ''))

    requestAnimationFrame(() => {
      const el = inputRef.current
      if (!el) return
      let pos = 0
      let seen = 0
      while (pos < formatted.length && seen < digitsBeforeCursor) {
        if (/\d/.test(formatted[pos])) seen++
        pos++
      }
      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <div>
      <LabelRow label={label} htmlFor={id} tooltip={tooltip} docLabel={docLabel} docUrl={docUrl} />
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={text}
          onChange={handleChange}
          onBlur={() => setText(value.toLocaleString('en-US'))}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm tabular-nums text-slate-100 outline-none transition-colors focus:border-rose-400"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

interface SelectFieldProps<T extends string> extends Omit<LabelRowProps, 'htmlFor'> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  tooltip,
  docLabel,
  docUrl,
}: SelectFieldProps<T>) {
  const id = useId()
  return (
    <div>
      <LabelRow label={label} htmlFor={id} tooltip={tooltip} docLabel={docLabel} docUrl={docUrl} />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 outline-none transition-colors focus:border-rose-400"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface PlacementToggleProps extends Omit<LabelRowProps, 'htmlFor'> {
  value: Placement
  onChange: (value: Placement) => void
  disabled?: boolean
}

export function PlacementToggle({
  label,
  value,
  onChange,
  disabled,
  tooltip,
  docLabel,
  docUrl,
}: PlacementToggleProps) {
  return (
    <div className={disabled ? 'opacity-40' : ''}>
      <LabelRow label={label} tooltip={tooltip} docLabel={docLabel} docUrl={docUrl} />
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-700 bg-slate-800 p-1">
        {(['ram', 'disk'] as const).map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option)}
            className={`rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
              value === option
                ? option === 'ram'
                  ? 'bg-rose-500/90 text-white'
                  : 'bg-sky-500/90 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {option === 'ram' ? 'RAM' : 'Disk'}
          </button>
        ))}
      </div>
    </div>
  )
}
