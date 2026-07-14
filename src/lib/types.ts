export type VectorDatatype = 'float32' | 'float16'

export type Quantization = 'none' | 'binary' | 'scalar'

export type Placement = 'ram' | 'disk'

export interface SizingConfig {
  // Dataset
  numVectors: number
  dimension: number
  datatype: VectorDatatype
  payloadBytes: number
  replicationFactor: number
  shards: number
  // HNSW
  hnswM: number
  efConstruct: number
  hnswPlacement: Placement
  // Quantization
  quantization: Quantization
  originalVectorsPlacement: Placement
  quantizedVectorsPlacement: Placement
  // Payload
  payloadPlacement: Placement
  indexedFields: number
  payloadIndexPlacement: Placement
  // Cluster
  nodeRamGib: number
}

export type ComponentId =
  | 'originalVectors'
  | 'quantizedVectors'
  | 'payload'
  | 'payloadIndex'
  | 'hnswGraph'
  | 'idsVersions'
  | 'metadata'
  | 'runtimeOverhead'

export interface ComponentResult {
  id: ComponentId
  label: string
  /** Bytes for a single replica of the collection. */
  bytes: number
  /** Bytes resident in RAM (single replica). */
  ramBytes: number
  /** Bytes persisted on disk (single replica). */
  diskBytes: number
  placement: Placement | 'ram+disk' | 'n/a'
  formula: string
  /** Formula with the user's actual numbers substituted in. */
  exampleCalculation: string
  explanation: string
  docLabel: string
  docUrl: string
  isEstimate?: boolean
}

export interface SizingResult {
  components: ComponentResult[]
  /** Single replica totals. */
  ramPerReplica: number
  diskPerReplica: number
  /** Cluster-wide totals (× replication factor). */
  totalRam: number
  totalDisk: number
  recommendedNodes: number
  ramPerNode: number
  diskPerNode: number
}

export interface Warning {
  id: string
  severity: 'warning' | 'info'
  title: string
  body: string
  recommendation: string
}

export interface Scenario {
  id: string
  label: string
  description: string
  ramBytes: number
  diskBytes: number
  /** Qualitative 1 (best/lowest) – 5 (worst/highest) scores. */
  latencyScore: number
  recallScore: number
  costScore: number
}
