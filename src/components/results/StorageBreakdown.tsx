import { useState } from 'react'
import { formatBytes } from '../../lib/format'
import type { ComponentResult } from '../../lib/types'
import { COMPONENT_COLORS } from '../charts/colors'

interface StorageBreakdownProps {
  components: ComponentResult[]
}

function PlacementBadge({ placement }: { placement: ComponentResult['placement'] }) {
  if (placement === 'n/a') {
    return <span className="text-[10px] text-slate-600">—</span>
  }
  const parts = placement === 'ram+disk' ? (['ram', 'disk'] as const) : ([placement] as const)
  return (
    <span className="flex gap-1">
      {parts.map((p) => (
        <span
          key={p}
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
            p === 'ram' ? 'bg-rose-500/15 text-rose-400' : 'bg-sky-500/15 text-sky-400'
          }`}
        >
          {p}
        </span>
      ))}
    </span>
  )
}

function Row({ component }: { component: ComponentResult }) {
  const [open, setOpen] = useState(false)
  const inactive = component.bytes === 0

  return (
    <div className={`border-b border-slate-800 last:border-b-0 ${inactive ? 'opacity-50' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="grid w-full grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 py-2.5 text-left transition-colors hover:bg-slate-800/40"
      >
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: COMPONENT_COLORS[component.id] }}
          aria-hidden
        />
        <span className="text-sm text-slate-200">
          {component.label}
          {component.isEstimate && (
            <span className="ml-1.5 text-[10px] uppercase tracking-wide text-slate-500">est.</span>
          )}
        </span>
        <PlacementBadge placement={component.placement} />
        <span className="w-24 text-right text-sm font-semibold tabular-nums text-slate-100">
          {formatBytes(component.bytes)}
        </span>
        <span
          className={`text-xs text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="mb-3 ml-6 space-y-2 rounded-lg bg-slate-800/50 p-3 text-xs">
          <div>
            <p className="font-semibold uppercase tracking-wide text-slate-500">Formula</p>
            <p className="mt-0.5 font-mono text-slate-200">{component.formula}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-slate-500">Calculation</p>
            <p className="mt-0.5 font-mono text-slate-200">{component.exampleCalculation}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-slate-500">Explanation</p>
            <p className="mt-0.5 leading-relaxed text-slate-300">{component.explanation}</p>
          </div>
          <div className="flex gap-4 text-slate-400">
            <span>
              RAM: <strong className="text-slate-200">{formatBytes(component.ramBytes)}</strong>
            </span>
            <span>
              Disk: <strong className="text-slate-200">{formatBytes(component.diskBytes)}</strong>
            </span>
          </div>
          <a
            href={component.docUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block font-medium text-rose-400 hover:underline"
          >
            {component.docLabel} ↗
          </a>
        </div>
      )}
    </div>
  )
}

export function StorageBreakdown({ components }: StorageBreakdownProps) {
  return (
    <div>
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 border-b border-slate-700 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        <span className="w-2.5" />
        <span>Component</span>
        <span>Placement</span>
        <span className="w-24 text-right">Size / replica</span>
        <span className="w-3" />
      </div>
      {components.map((c) => (
        <Row key={c.id} component={c} />
      ))}
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Sizes are per replica. Rows marked “est.” use heuristics — actual usage depends on data
        distribution, segment layout and Qdrant version. Click any row for its formula and
        documentation reference.
      </p>
    </div>
  )
}
