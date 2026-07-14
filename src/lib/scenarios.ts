import { calculateSizing } from './sizing'
import type { Scenario, SizingConfig } from './types'

interface ScenarioSpec {
  id: string
  label: string
  description: string
  overrides: Partial<SizingConfig>
  latencyScore: number
  recallScore: number
  costScore: number
}

/**
 * Qualitative scores are 1–5 relative guidance (not predictions):
 * latency 1 = fastest, recall 5 = best, cost 5 = most expensive.
 */
const SCENARIO_SPECS: ScenarioSpec[] = [
  {
    id: 'all-disk',
    label: 'Everything on Disk',
    description: 'Vectors, HNSW graph, payload and indexes all served from SSD. Minimal RAM, highest latency.',
    overrides: {
      quantization: 'none',
      originalVectorsPlacement: 'disk',
      hnswPlacement: 'disk',
      payloadPlacement: 'disk',
      payloadIndexPlacement: 'disk',
    },
    latencyScore: 5,
    recallScore: 5,
    costScore: 1,
  },
  {
    id: 'binary-ram',
    label: 'Binary in RAM',
    description: 'Binary-quantized vectors in RAM for traversal; originals, graph and indexes on disk.',
    overrides: {
      quantization: 'binary',
      quantizedVectorsPlacement: 'ram',
      originalVectorsPlacement: 'disk',
      hnswPlacement: 'disk',
      payloadPlacement: 'disk',
      payloadIndexPlacement: 'disk',
    },
    latencyScore: 3,
    recallScore: 4,
    costScore: 2,
  },
  {
    id: 'binary-hnsw',
    label: 'Binary + HNSW',
    description: 'Binary vectors and the HNSW graph in RAM. Disk only touched for rescoring and payload.',
    overrides: {
      quantization: 'binary',
      quantizedVectorsPlacement: 'ram',
      originalVectorsPlacement: 'disk',
      hnswPlacement: 'ram',
      payloadPlacement: 'disk',
      payloadIndexPlacement: 'disk',
    },
    latencyScore: 2,
    recallScore: 4,
    costScore: 3,
  },
  {
    id: 'binary-hnsw-payload-index',
    label: 'Binary + HNSW + Payload Index',
    description: 'Adds in-RAM payload indexes for fast filtered search. Recommended large-scale setup.',
    overrides: {
      quantization: 'binary',
      quantizedVectorsPlacement: 'ram',
      originalVectorsPlacement: 'disk',
      hnswPlacement: 'ram',
      payloadPlacement: 'disk',
      payloadIndexPlacement: 'ram',
    },
    latencyScore: 2,
    recallScore: 4,
    costScore: 3,
  },
  {
    id: 'all-ram',
    label: 'Everything in RAM',
    description: 'Full-precision vectors, graph, payload and indexes all in RAM. Fastest and most expensive.',
    overrides: {
      quantization: 'none',
      originalVectorsPlacement: 'ram',
      hnswPlacement: 'ram',
      payloadPlacement: 'ram',
      payloadIndexPlacement: 'ram',
    },
    latencyScore: 1,
    recallScore: 5,
    costScore: 5,
  },
]

export function buildScenarios(cfg: SizingConfig): Scenario[] {
  return SCENARIO_SPECS.map((spec) => {
    const result = calculateSizing({ ...cfg, ...spec.overrides })
    return {
      id: spec.id,
      label: spec.label,
      description: spec.description,
      ramBytes: result.totalRam,
      diskBytes: result.totalDisk,
      latencyScore: spec.latencyScore,
      recallScore: spec.recallScore,
      costScore: spec.costScore,
    }
  })
}
