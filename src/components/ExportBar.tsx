import { useState } from 'react'
import { copyShareUrl, exportCsv, exportJson, exportPdf } from '../lib/export'
import { shareableUrl } from '../lib/url'
import type { SizingConfig, SizingResult, Warning } from '../lib/types'

interface ExportBarProps {
  config: SizingConfig
  result: SizingResult
  warnings: Warning[]
}

const BUTTON_CLASS =
  'rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-rose-400 hover:text-rose-400'

export function ExportBar({ config, result, warnings }: ExportBarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const ok = await copyShareUrl(shareableUrl(config))
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <button type="button" className={BUTTON_CLASS} onClick={exportPdf}>
        PDF report
      </button>
      <button
        type="button"
        className={BUTTON_CLASS}
        onClick={() => exportJson(config, result, warnings)}
      >
        JSON config
      </button>
      <button type="button" className={BUTTON_CLASS} onClick={() => exportCsv(config, result)}>
        CSV summary
      </button>
      <button type="button" className={BUTTON_CLASS} onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy share URL'}
      </button>
    </div>
  )
}
