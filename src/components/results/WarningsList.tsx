import type { Warning } from '../../lib/types'

interface WarningsListProps {
  warnings: Warning[]
}

export function WarningsList({ warnings }: WarningsListProps) {
  if (warnings.length === 0) {
    return (
      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
        No warnings — this configuration looks reasonable.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {warnings.map((w) => (
        <div
          key={w.id}
          className={`rounded-lg border p-3 ${
            w.severity === 'warning'
              ? 'border-amber-500/40 bg-amber-500/10'
              : 'border-sky-500/30 bg-sky-500/10'
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              w.severity === 'warning' ? 'text-amber-300' : 'text-sky-300'
            }`}
          >
            {w.severity === 'warning' ? '⚠ ' : 'ⓘ '}
            {w.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">{w.body}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
            <span className="font-semibold text-slate-300">Recommendation: </span>
            {w.recommendation}
          </p>
        </div>
      ))}
    </div>
  )
}
