import { formatBytes } from './format'
import type { SizingConfig, SizingResult, Warning } from './types'

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportJson(cfg: SizingConfig, result: SizingResult, warnings: Warning[]) {
  const payload = {
    tool: 'qdrant-sizing-tool',
    generatedAt: new Date().toISOString(),
    configuration: cfg,
    results: {
      totalRamBytes: result.totalRam,
      totalDiskBytes: result.totalDisk,
      ramPerReplicaBytes: result.ramPerReplica,
      diskPerReplicaBytes: result.diskPerReplica,
      recommendedNodes: result.recommendedNodes,
      ramPerNodeBytes: result.ramPerNode,
      diskPerNodeBytes: result.diskPerNode,
      components: result.components.map((c) => ({
        id: c.id,
        label: c.label,
        bytes: c.bytes,
        ramBytes: c.ramBytes,
        diskBytes: c.diskBytes,
        placement: c.placement,
        formula: c.formula,
      })),
    },
    warnings: warnings.map((w) => ({ title: w.title, body: w.body, recommendation: w.recommendation })),
  }
  download('qdrant-sizing.json', JSON.stringify(payload, null, 2), 'application/json')
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function exportCsv(cfg: SizingConfig, result: SizingResult) {
  const rows: string[][] = [
    ['Section', 'Item', 'Value'],
    ['Config', 'Number of vectors', String(cfg.numVectors)],
    ['Config', 'Dimension', String(cfg.dimension)],
    ['Config', 'Datatype', cfg.datatype],
    ['Config', 'Avg payload size (bytes)', String(cfg.payloadBytes)],
    ['Config', 'Replication factor', String(cfg.replicationFactor)],
    ['Config', 'Shards', String(cfg.shards)],
    ['Config', 'HNSW M', String(cfg.hnswM)],
    ['Config', 'ef_construct', String(cfg.efConstruct)],
    ['Config', 'HNSW placement', cfg.hnswPlacement],
    ['Config', 'Quantization', cfg.quantization],
    ['Config', 'Original vectors placement', cfg.originalVectorsPlacement],
    ['Config', 'Quantized vectors placement', cfg.quantizedVectorsPlacement],
    ['Config', 'Payload placement', cfg.payloadPlacement],
    ['Config', 'Indexed payload fields', String(cfg.indexedFields)],
    ['Config', 'Payload index placement', cfg.payloadIndexPlacement],
    ['Config', 'Node RAM budget (GiB)', String(cfg.nodeRamGib)],
    ...result.components.map((c) => [
      'Component',
      c.label,
      `${formatBytes(c.bytes)} (RAM ${formatBytes(c.ramBytes)}, disk ${formatBytes(c.diskBytes)})`,
    ]),
    ['Totals', 'Total RAM (× replication)', formatBytes(result.totalRam)],
    ['Totals', 'Total disk (× replication)', formatBytes(result.totalDisk)],
    ['Totals', 'Recommended nodes', String(result.recommendedNodes)],
    ['Totals', 'RAM per node', formatBytes(result.ramPerNode)],
    ['Totals', 'Disk per node', formatBytes(result.diskPerNode)],
  ]
  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n')
  download('qdrant-sizing.csv', csv, 'text/csv')
}

/** PDF export via the browser's print dialog (print stylesheet renders a report layout). */
export function exportPdf() {
  window.print()
}

export async function copyShareUrl(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}
