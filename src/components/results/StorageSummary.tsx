import { formatBytes } from '../../lib/format'
import type { SizingConfig, SizingResult } from '../../lib/types'

interface StorageSummaryProps {
  config: SizingConfig
  result: SizingResult
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg bg-slate-800/60 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-50">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </div>
  )
}

export function StorageSummary({ config, result }: StorageSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat
        label="Total RAM"
        value={formatBytes(result.totalRam)}
        hint={`${formatBytes(result.ramPerReplica)} per replica`}
      />
      <Stat
        label="Total Disk"
        value={formatBytes(result.totalDisk)}
        hint={`${formatBytes(result.diskPerReplica)} per replica`}
      />
      <Stat
        label="Replication"
        value={`× ${config.replicationFactor}`}
        hint={`${config.shards} shard(s)`}
      />
      <Stat
        label="Recommended Nodes"
        value={String(result.recommendedNodes)}
        hint={`~${formatBytes(result.ramPerNode)} RAM · ${formatBytes(result.diskPerNode)} disk each`}
      />
    </div>
  )
}
