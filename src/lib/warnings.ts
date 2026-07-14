import type { SizingConfig, SizingResult, Warning } from './types'
import { formatBytes, gibToBytes } from './format'

export function deriveWarnings(cfg: SizingConfig, result: SizingResult): Warning[] {
  const warnings: Warning[] = []

  if (cfg.originalVectorsPlacement === 'disk' && cfg.quantization === 'none') {
    warnings.push({
      id: 'vectors-on-disk-no-quant',
      severity: 'warning',
      title: 'Original vectors on SSD without quantization',
      body: 'ANN traversal will repeatedly fetch full-precision vectors from disk, leading to significantly higher latency.',
      recommendation: 'Enable Binary Quantization and keep the quantized copy in RAM for fast traversal.',
    })
  }

  if (cfg.payloadIndexPlacement === 'disk') {
    warnings.push({
      id: 'payload-index-on-disk',
      severity: 'warning',
      title: 'Payload index on disk',
      body: 'Cold filtered queries may experience additional disk I/O latency.',
      recommendation: 'Consider keeping frequently accessed payload indexes in RAM.',
    })
  }

  if (cfg.hnswPlacement === 'disk') {
    warnings.push({
      id: 'hnsw-on-disk',
      severity: 'warning',
      title: 'HNSW graph on disk',
      body: 'HNSW traversal may require disk I/O on every hop through the graph.',
      recommendation: 'Recommended only when RAM is severely constrained. Keep the graph in RAM if possible.',
    })
  }

  if (cfg.quantization !== 'none' && cfg.quantizedVectorsPlacement === 'disk') {
    warnings.push({
      id: 'quantized-on-disk',
      severity: 'warning',
      title: 'Quantized vectors on disk',
      body: 'Quantized vectors exist to speed up ANN traversal from RAM. Placing them on disk largely defeats their purpose.',
      recommendation: 'Keep quantized vectors in RAM — they are small (especially with binary quantization).',
    })
  }

  if (cfg.replicationFactor < 2) {
    warnings.push({
      id: 'no-replication',
      severity: 'info',
      title: 'Replication factor of 1',
      body: 'A single replica means node failure causes data unavailability and potential data loss.',
      recommendation: 'Use a replication factor of at least 2 for production deployments.',
    })
  }

  if (result.ramPerNode > gibToBytes(cfg.nodeRamGib) * 0.85) {
    warnings.push({
      id: 'node-ram-headroom',
      severity: 'info',
      title: 'Little RAM headroom per node',
      body: `Estimated ${formatBytes(result.ramPerNode)} of RAM per node against a ${cfg.nodeRamGib} GiB node budget leaves under 15% headroom.`,
      recommendation: 'Add nodes, use larger nodes, or move components to disk to leave room for spikes and rebalancing.',
    })
  }

  if (cfg.shards < result.recommendedNodes) {
    warnings.push({
      id: 'fewer-shards-than-nodes',
      severity: 'info',
      title: 'Fewer shards than recommended nodes',
      body: `With ${cfg.shards} shard(s) and ${result.recommendedNodes} recommended node(s), some nodes cannot hold data for this collection.`,
      recommendation: 'Set the shard count to at least the number of nodes (Qdrant recommends a multiple of the node count).',
    })
  }

  if (cfg.quantization === 'binary' && cfg.dimension < 512) {
    warnings.push({
      id: 'binary-low-dim',
      severity: 'info',
      title: 'Binary quantization with low-dimensional vectors',
      body: 'Binary quantization works best for high-dimensional vectors (≥ 512, ideally 1024+). Accuracy loss can be significant at lower dimensionality.',
      recommendation: 'Consider scalar quantization instead, or validate recall with your dataset.',
    })
  }

  return warnings
}
