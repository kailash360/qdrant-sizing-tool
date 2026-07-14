import { DOCS } from './docs'
import { formatBytes, formatCount, gibToBytes } from './format'
import type {
  ComponentResult,
  Placement,
  SizingConfig,
  SizingResult,
} from './types'

export const DATATYPE_BYTES: Record<SizingConfig['datatype'], number> = {
  float32: 4,
  float16: 2,
}

/** Bytes per point for internal ID mapping + version tracking (estimate). */
const ID_VERSION_BYTES = 16
/** Bytes per point, per indexed payload field (estimate: key hash + posting entry). */
const PAYLOAD_INDEX_BYTES_PER_FIELD = 16
/** Fraction of data size reserved for segment/collection metadata (estimate). */
const METADATA_FRACTION = 0.01
const METADATA_MIN_BYTES = 32 * 2 ** 20 // 32 MiB
/** Runtime overhead: fraction of RAM-resident data + fixed process baseline. */
const RUNTIME_OVERHEAD_FRACTION = 0.15
const RUNTIME_BASELINE_BYTES = 512 * 2 ** 20 // 512 MiB

export const DEFAULT_CONFIG: SizingConfig = {
  numVectors: 10_000_000,
  dimension: 1536,
  datatype: 'float32',
  payloadBytes: 512,
  replicationFactor: 2,
  shards: 3,
  hnswM: 16,
  efConstruct: 100,
  hnswPlacement: 'ram',
  quantization: 'none',
  originalVectorsPlacement: 'ram',
  quantizedVectorsPlacement: 'ram',
  payloadPlacement: 'disk',
  indexedFields: 1,
  payloadIndexPlacement: 'ram',
  nodeRamGib: 64,
}

function split(bytes: number, placement: Placement): { ram: number; disk: number } {
  // Everything is persisted on disk; RAM placement adds a memory-resident copy.
  return { ram: placement === 'ram' ? bytes : 0, disk: bytes }
}

export function calculateSizing(cfg: SizingConfig): SizingResult {
  const n = Math.max(0, cfg.numVectors)
  const d = Math.max(0, cfg.dimension)
  const dtBytes = DATATYPE_BYTES[cfg.datatype]
  const nFmt = formatCount(n)

  const components: ComponentResult[] = []

  // --- Original vectors ---
  const originalBytes = n * d * dtBytes
  {
    const { ram, disk } = split(originalBytes, cfg.originalVectorsPlacement)
    components.push({
      id: 'originalVectors',
      label: 'Original vectors',
      bytes: originalBytes,
      ramBytes: ram,
      diskBytes: disk,
      placement: cfg.originalVectorsPlacement,
      formula: 'N × dimension × datatype size',
      exampleCalculation: `${nFmt} × ${d} × ${dtBytes} B = ${formatBytes(originalBytes)}`,
      explanation:
        'Every point stores its full-precision vector. This is usually the largest component. ' +
        'With quantization enabled, original vectors are still kept for rescoring and can be moved to disk.',
      docLabel: DOCS.capacityPlanning.label,
      docUrl: DOCS.capacityPlanning.url,
    })
  }

  // --- Quantized vectors ---
  let quantizedBytes = 0
  if (cfg.quantization === 'binary') {
    quantizedBytes = (n * d) / 8
  } else if (cfg.quantization === 'scalar') {
    quantizedBytes = n * d // int8 = 1 byte per dimension
  }
  {
    const { ram, disk } =
      cfg.quantization === 'none'
        ? { ram: 0, disk: 0 }
        : split(quantizedBytes, cfg.quantizedVectorsPlacement)
    components.push({
      id: 'quantizedVectors',
      label: 'Quantized vectors',
      bytes: quantizedBytes,
      ramBytes: ram,
      diskBytes: disk,
      placement: cfg.quantization === 'none' ? 'n/a' : cfg.quantizedVectorsPlacement,
      formula:
        cfg.quantization === 'binary'
          ? 'N × dimension ÷ 8 (1 bit per dimension)'
          : cfg.quantization === 'scalar'
            ? 'N × dimension × 1 byte (int8 per dimension)'
            : 'Not enabled',
      exampleCalculation:
        cfg.quantization === 'none'
          ? 'Quantization disabled — no compressed copy stored.'
          : cfg.quantization === 'binary'
            ? `${nFmt} × ${d} ÷ 8 = ${formatBytes(quantizedBytes)}`
            : `${nFmt} × ${d} × 1 B = ${formatBytes(quantizedBytes)}`,
      explanation:
        'Quantization stores a compressed representation of each vector used during ANN traversal. ' +
        'Binary quantization uses 1 bit per dimension (32× smaller than float32); scalar quantization uses 1 byte per dimension (4× smaller). ' +
        'Original vectors are consulted later for rescoring.',
      docLabel: DOCS.quantization.label,
      docUrl: DOCS.quantization.url,
    })
  }

  // --- Payload ---
  const payloadBytes = n * Math.max(0, cfg.payloadBytes)
  {
    const { ram, disk } = split(payloadBytes, cfg.payloadPlacement)
    components.push({
      id: 'payload',
      label: 'Payload',
      bytes: payloadBytes,
      ramBytes: ram,
      diskBytes: disk,
      placement: cfg.payloadPlacement,
      formula: 'N × average payload size',
      exampleCalculation: `${nFmt} × ${formatBytes(cfg.payloadBytes)} = ${formatBytes(payloadBytes)}`,
      explanation:
        'JSON payload attached to each point. Payload can be stored in memory for fastest access, ' +
        'or on disk (RocksDB / mmap) which is recommended for large payloads that are rarely filtered on.',
      docLabel: DOCS.storage.label,
      docUrl: DOCS.storage.url,
    })
  }

  // --- Payload index ---
  const payloadIndexBytes = n * Math.max(0, cfg.indexedFields) * PAYLOAD_INDEX_BYTES_PER_FIELD
  {
    const { ram, disk } = split(payloadIndexBytes, cfg.payloadIndexPlacement)
    components.push({
      id: 'payloadIndex',
      label: 'Payload index',
      bytes: payloadIndexBytes,
      ramBytes: ram,
      diskBytes: disk,
      placement: cfg.payloadIndexPlacement,
      formula: `N × indexed fields × ~${PAYLOAD_INDEX_BYTES_PER_FIELD} B per entry (estimate)`,
      exampleCalculation: `${nFmt} × ${cfg.indexedFields} × ${PAYLOAD_INDEX_BYTES_PER_FIELD} B = ${formatBytes(payloadIndexBytes)}`,
      explanation:
        'Payload indexes accelerate metadata filtering by extending the HNSW graph during filtered search. ' +
        'Actual size depends on field types and value cardinality; this estimate assumes ~16 bytes per point per indexed field.',
      docLabel: DOCS.payloadIndex.label,
      docUrl: DOCS.payloadIndex.url,
      isEstimate: true,
    })
  }

  // --- HNSW graph ---
  const hnswBytes = n * (2 * cfg.hnswM) * 4
  {
    const { ram, disk } = split(hnswBytes, cfg.hnswPlacement)
    components.push({
      id: 'hnswGraph',
      label: 'HNSW graph',
      bytes: hnswBytes,
      ramBytes: ram,
      diskBytes: disk,
      placement: cfg.hnswPlacement,
      formula: 'N × (2 × M × 4 bytes)',
      exampleCalculation: `${nFmt} × (2 × ${cfg.hnswM} × 4 B) = ${formatBytes(hnswBytes)}`,
      explanation:
        'Each HNSW connection stores a 4-byte point ID. Level 0 stores approximately 2×M neighbors per point. ' +
        'Upper layers are exponentially sparser and contribute relatively little additional storage.',
      docLabel: DOCS.largeScaleSearch.label,
      docUrl: DOCS.largeScaleSearch.url,
    })
  }

  // --- IDs & versions ---
  const idsBytes = n * ID_VERSION_BYTES
  components.push({
    id: 'idsVersions',
    label: 'IDs & versions',
    bytes: idsBytes,
    ramBytes: idsBytes,
    diskBytes: idsBytes,
    placement: 'ram+disk',
    formula: `N × ~${ID_VERSION_BYTES} B (point ID + version, estimate)`,
    exampleCalculation: `${nFmt} × ${ID_VERSION_BYTES} B = ${formatBytes(idsBytes)}`,
    explanation:
      'Qdrant keeps an ID tracker mapping external point IDs to internal offsets, plus a version per point for ' +
      'update ordering. This mapping is held in RAM and persisted to disk. UUID keys roughly double this figure.',
    docLabel: DOCS.storage.label,
    docUrl: DOCS.storage.url,
    isEstimate: true,
  })

  // --- Metadata ---
  const dataFootprint = originalBytes + quantizedBytes + payloadBytes + hnswBytes
  const metadataBytes = Math.max(METADATA_MIN_BYTES, dataFootprint * METADATA_FRACTION)
  components.push({
    id: 'metadata',
    label: 'Metadata',
    bytes: metadataBytes,
    ramBytes: metadataBytes,
    diskBytes: metadataBytes,
    placement: 'ram+disk',
    formula: `max(32 MiB, ${METADATA_FRACTION * 100}% of data footprint) (estimate)`,
    exampleCalculation: `max(32 MiB, 1% × ${formatBytes(dataFootprint)}) = ${formatBytes(metadataBytes)}`,
    explanation:
      'Collection and segment metadata: schema definitions, segment manifests, WAL bookkeeping, and deleted-point ' +
      'bitmasks. Small relative to data, but present in both RAM and on disk.',
    docLabel: DOCS.storage.label,
    docUrl: DOCS.storage.url,
    isEstimate: true,
  })

  // --- Runtime overhead ---
  const ramSubtotal = components.reduce((acc, c) => acc + c.ramBytes, 0)
  const runtimeBytes = ramSubtotal * RUNTIME_OVERHEAD_FRACTION + RUNTIME_BASELINE_BYTES
  components.push({
    id: 'runtimeOverhead',
    label: 'Runtime overhead',
    bytes: runtimeBytes,
    ramBytes: runtimeBytes,
    diskBytes: 0,
    placement: 'ram',
    formula: `${RUNTIME_OVERHEAD_FRACTION * 100}% of RAM-resident data + 512 MiB baseline (estimate)`,
    exampleCalculation: `15% × ${formatBytes(ramSubtotal)} + 512 MiB = ${formatBytes(runtimeBytes)}`,
    explanation:
      'Search buffers, indexing scratch space, allocator fragmentation, and OS page cache headroom. ' +
      "Qdrant's capacity planning guidance recommends leaving significant headroom above raw data size.",
    docLabel: DOCS.capacityPlanning.label,
    docUrl: DOCS.capacityPlanning.url,
    isEstimate: true,
  })

  const ramPerReplica = components.reduce((acc, c) => acc + c.ramBytes, 0)
  const diskPerReplica = components.reduce((acc, c) => acc + c.diskBytes, 0)

  const replication = Math.max(1, cfg.replicationFactor)
  const totalRam = ramPerReplica * replication
  const totalDisk = diskPerReplica * replication

  const nodeRamBytes = gibToBytes(Math.max(1, cfg.nodeRamGib))
  const recommendedNodes = Math.max(
    replication,
    Math.ceil(totalRam / nodeRamBytes),
    1,
  )

  return {
    components,
    ramPerReplica,
    diskPerReplica,
    totalRam,
    totalDisk,
    recommendedNodes,
    ramPerNode: totalRam / recommendedNodes,
    diskPerNode: totalDisk / recommendedNodes,
  }
}
