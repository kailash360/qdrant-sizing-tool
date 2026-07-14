import type { ComponentResult } from '../../lib/types'

interface FormulaDetailsProps {
  components: ComponentResult[]
}

export function FormulaDetails({ components }: FormulaDetailsProps) {
  return (
    <div className="space-y-4">
      {components.map((c) => (
        <div key={c.id} className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
          <p className="text-sm font-semibold text-slate-100">{c.label}</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Formula
              </p>
              <p className="mt-1 font-mono text-xs text-emerald-300">{c.formula}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                With your values
              </p>
              <p className="mt-1 font-mono text-xs text-slate-200">{c.exampleCalculation}</p>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">{c.explanation}</p>
          <a
            href={c.docUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1.5 inline-block text-xs font-medium text-rose-400 hover:underline"
          >
            {c.docLabel} ↗
          </a>
        </div>
      ))}
    </div>
  )
}
