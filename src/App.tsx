import { useMemo } from 'react'
import { ExportBar } from './components/ExportBar'
import { InputPanel } from './components/InputPanel'
import { BreakdownPie } from './components/charts/BreakdownPie'
import { DeploymentComparison } from './components/charts/DeploymentComparison'
import { FormulaDetails } from './components/results/FormulaDetails'
import { PerformanceEstimate } from './components/results/PerformanceEstimate'
import { StorageBreakdown } from './components/results/StorageBreakdown'
import { StorageSummary } from './components/results/StorageSummary'
import { WarningsList } from './components/results/WarningsList'
import { ExpandableCard } from './components/ui/Card'
import { useSizingConfig } from './hooks/useSizingConfig'
import { derivePerformanceNotes } from './lib/performance'
import { buildScenarios } from './lib/scenarios'
import { calculateSizing } from './lib/sizing'
import { deriveWarnings } from './lib/warnings'

export default function App() {
  const { config, update, reset } = useSizingConfig()

  const result = useMemo(() => calculateSizing(config), [config])
  const warnings = useMemo(() => deriveWarnings(config, result), [config, result])
  const scenarios = useMemo(() => buildScenarios(config), [config])
  const performanceNotes = useMemo(() => derivePerformanceNotes(config), [config])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-rose-400">Qdrant</span> Sizing Tool
            </h1>
            <p className="text-xs text-slate-400">
              Client-side capacity planning for Qdrant collections — every number is traceable to a
              formula and the official docs.
            </p>
          </div>
          <ExportBar config={config} result={result} warnings={warnings} />
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)_minmax(0,1fr)]">
        {/* Panel 1: Inputs */}
        <aside className="no-print lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
          <InputPanel config={config} onChange={update} onReset={reset} />
        </aside>

        {/* Panel 2: Visualization */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Visualization
          </h2>
          <div className="print-card grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:grid-cols-2">
            <BreakdownPie
              title="Storage Composition (Disk)"
              components={result.components}
              metric="diskBytes"
              emptyMessage="Nothing stored on disk."
            />
            <BreakdownPie
              title="RAM Usage"
              components={result.components}
              metric="ramBytes"
              emptyMessage="Nothing resident in RAM."
            />
          </div>
          <div className="print-card rounded-xl border border-slate-800 bg-slate-900 p-4">
            <DeploymentComparison scenarios={scenarios} />
          </div>
          <div className="print-card rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Performance Summary
            </h3>
            <div className="mt-2">
              <PerformanceEstimate notes={performanceNotes} />
            </div>
          </div>
        </section>

        {/* Panel 3: Results */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Results
          </h2>
          <ExpandableCard title="Storage Summary" subtitle="Totals across all replicas">
            <StorageSummary config={config} result={result} />
          </ExpandableCard>
          <ExpandableCard
            title="Storage Breakdown"
            subtitle="Every component, expandable with formulas"
          >
            <StorageBreakdown components={result.components} />
          </ExpandableCard>
          <ExpandableCard
            title="Warnings & Recommendations"
            subtitle={`${warnings.length} item(s) for this configuration`}
          >
            <WarningsList warnings={warnings} />
          </ExpandableCard>
          <ExpandableCard
            title="Formula Details"
            subtitle="Formulas with your values substituted"
            defaultOpen={false}
          >
            <FormulaDetails components={result.components} />
          </ExpandableCard>
        </section>
      </main>

      <footer className="border-t border-slate-800 px-4 py-4 text-center text-[11px] text-slate-500 sm:px-6">
        Estimates only — validate with a proof-of-concept before production sizing. All calculations
        run locally in your browser; no data leaves this page. References:{' '}
        <a
          className="text-rose-400 hover:underline"
          href="https://qdrant.tech/documentation/guides/capacity-planning/"
          target="_blank"
          rel="noreferrer"
        >
          Capacity Planning
        </a>
        {' · '}
        <a
          className="text-rose-400 hover:underline"
          href="https://qdrant.tech/documentation/tutorials-operations/large-scale-search/"
          target="_blank"
          rel="noreferrer"
        >
          Large-Scale Search
        </a>
        {' · '}
        <a
          className="text-rose-400 hover:underline"
          href="https://qdrant.tech/documentation/concepts/indexing/"
          target="_blank"
          rel="noreferrer"
        >
          Indexing
        </a>
      </footer>
    </div>
  )
}
