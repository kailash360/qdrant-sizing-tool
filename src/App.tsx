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

const REPO_URL = 'https://github.com/kailash360/qdrant-sizing-tool'

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

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
            <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <span>
                <span className="text-rose-400">Qdrant</span> Sizing Tool
              </span>
              <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Open source · Unofficial
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Client-side capacity planning for Qdrant collections — every number is traceable to a
              formula and the official docs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportBar config={config} result={result} warnings={warnings} />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="View source on GitHub"
              title="View source on GitHub"
              className="no-print text-slate-400 transition-colors hover:text-slate-100"
            >
              <GitHubIcon />
            </a>
          </div>
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

      <footer className="space-y-1.5 border-t border-slate-800 px-4 py-4 text-center text-[11px] text-slate-500 sm:px-6">
        <p>
          An open-source community tool — not affiliated with, endorsed by, or provided by the
          official Qdrant team.{' '}
          <a className="text-rose-400 hover:underline" href={REPO_URL} target="_blank" rel="noreferrer">
            Source on GitHub
          </a>
        </p>
        <p>
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
        </p>
      </footer>
    </div>
  )
}
