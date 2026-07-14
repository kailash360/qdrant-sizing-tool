import { DOCS } from './docs'
import type { SizingConfig } from './types'

export interface PerformanceNote {
  id: string
  configuration: string
  effect: string
  kind: 'positive' | 'negative' | 'neutral'
  docLabel: string
  docUrl: string
}

/** Qualitative guidance derived from the current configuration (not predictions). */
export function derivePerformanceNotes(cfg: SizingConfig): PerformanceNote[] {
  const notes: PerformanceNote[] = []

  if (cfg.originalVectorsPlacement === 'disk') {
    notes.push({
      id: 'orig-disk',
      configuration: 'Original vectors on SSD',
      effect:
        cfg.quantization === 'none'
          ? 'Higher latency: ANN traversal performs random disk reads for every distance computation.'
          : 'Higher rescoring latency: random disk reads occur only for the final rescoring pass, which is usually acceptable.',
      kind: cfg.quantization === 'none' ? 'negative' : 'neutral',
      docLabel: DOCS.largeScaleSearch.label,
      docUrl: DOCS.largeScaleSearch.url,
    })
  } else {
    notes.push({
      id: 'orig-ram',
      configuration: 'Original vectors in RAM',
      effect: 'Lowest search latency; full-precision distances computed directly from memory.',
      kind: 'positive',
      docLabel: DOCS.storage.label,
      docUrl: DOCS.storage.url,
    })
  }

  if (cfg.quantization === 'binary' && cfg.quantizedVectorsPlacement === 'ram') {
    notes.push({
      id: 'binary-ram',
      configuration: 'Binary vectors in RAM',
      effect: 'Faster ANN traversal with ~32× lower RAM usage for the traversal copy; slight recall loss mitigated by rescoring.',
      kind: 'positive',
      docLabel: DOCS.quantization.label,
      docUrl: DOCS.quantization.url,
    })
  }
  if (cfg.quantization === 'scalar' && cfg.quantizedVectorsPlacement === 'ram') {
    notes.push({
      id: 'scalar-ram',
      configuration: 'Scalar (int8) vectors in RAM',
      effect: 'Faster traversal with 4× lower RAM for the traversal copy and minimal recall impact.',
      kind: 'positive',
      docLabel: DOCS.quantization.label,
      docUrl: DOCS.quantization.url,
    })
  }

  notes.push(
    cfg.hnswPlacement === 'disk'
      ? {
          id: 'hnsw-disk',
          configuration: 'HNSW graph on SSD',
          effect: 'Higher latency: graph traversal incurs disk I/O on each hop; cold searches are notably slower.',
          kind: 'negative',
          docLabel: DOCS.indexing.label,
          docUrl: DOCS.indexing.url,
        }
      : {
          id: 'hnsw-ram',
          configuration: 'HNSW graph in RAM',
          effect: 'Graph hops resolve at memory speed — the recommended placement for latency-sensitive workloads.',
          kind: 'positive',
          docLabel: DOCS.indexing.label,
          docUrl: DOCS.indexing.url,
        },
  )

  notes.push(
    cfg.payloadIndexPlacement === 'disk'
      ? {
          id: 'pidx-disk',
          configuration: 'Payload index on SSD',
          effect: 'Cold filtered searches may incur additional disk I/O before the index pages are cached.',
          kind: 'negative',
          docLabel: DOCS.payloadIndex.label,
          docUrl: DOCS.payloadIndex.url,
        }
      : {
          id: 'pidx-ram',
          configuration: 'Payload index in RAM',
          effect: 'Filtered searches evaluate conditions at memory speed via the extended HNSW graph.',
          kind: 'positive',
          docLabel: DOCS.payloadIndex.label,
          docUrl: DOCS.payloadIndex.url,
        },
  )

  if (cfg.payloadPlacement === 'disk') {
    notes.push({
      id: 'payload-disk',
      configuration: 'Payload on SSD',
      effect: 'Payload retrieval adds disk reads to result assembly; usually fine since it happens only for the top-k results.',
      kind: 'neutral',
      docLabel: DOCS.storage.label,
      docUrl: DOCS.storage.url,
    })
  }

  if (cfg.hnswM >= 32) {
    notes.push({
      id: 'high-m',
      configuration: `High HNSW M (${cfg.hnswM})`,
      effect: 'Better recall and graph connectivity, at the cost of more RAM and longer index build times.',
      kind: 'neutral',
      docLabel: DOCS.indexing.label,
      docUrl: DOCS.indexing.url,
    })
  }

  return notes
}
