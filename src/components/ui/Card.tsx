import { useState } from 'react'

interface CardProps {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function ExpandableCard({ title, subtitle, defaultOpen = true, children }: CardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="print-card overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-800/60"
        aria-expanded={open}
      >
        <span>
          <span className="block text-sm font-semibold text-slate-100">{title}</span>
          {subtitle && <span className="block text-xs text-slate-400">{subtitle}</span>}
        </span>
        <span
          className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && <div className="border-t border-slate-800 px-4 py-4">{children}</div>}
    </section>
  )
}
