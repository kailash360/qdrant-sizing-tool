import type { PerformanceNote } from '../../lib/performance'

interface PerformanceEstimateProps {
  notes: PerformanceNote[]
}

const KIND_STYLE: Record<PerformanceNote['kind'], string> = {
  positive: 'bg-emerald-400',
  negative: 'bg-amber-400',
  neutral: 'bg-slate-400',
}

export function PerformanceEstimate({ notes }: PerformanceEstimateProps) {
  return (
    <div>
      <div className="divide-y divide-slate-800">
        {notes.map((note) => (
          <div key={note.id} className="flex items-start gap-3 py-2.5">
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${KIND_STYLE[note.kind]}`}
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium text-slate-200">{note.configuration}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                {note.effect}{' '}
                <a
                  href={note.docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="whitespace-nowrap font-medium text-rose-400 hover:underline"
                >
                  {note.docLabel} ↗
                </a>
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        These are qualitative guidance consistent with Qdrant's documentation on storage placement
        — not latency or QPS predictions.
      </p>
    </div>
  )
}
