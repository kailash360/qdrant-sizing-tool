import { useId, useState } from 'react'

interface InfoTooltipProps {
  children: React.ReactNode
  docLabel?: string
  docUrl?: string
}

export function InfoTooltip({ children, docLabel, docUrl }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-label="More information"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-500 text-[10px] font-semibold text-slate-400 transition-colors hover:border-rose-400 hover:text-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-800 p-3 text-xs leading-relaxed text-slate-200 shadow-xl"
        >
          {children}
          {docUrl && (
            <a
              href={docUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block font-medium text-rose-400 hover:underline"
              onMouseDown={(e) => e.preventDefault()}
            >
              {docLabel ?? 'Documentation'} ↗
            </a>
          )}
        </span>
      )}
    </span>
  )
}
