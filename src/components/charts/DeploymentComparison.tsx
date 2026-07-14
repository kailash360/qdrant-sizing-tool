import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatBytes } from '../../lib/format'
import type { Scenario } from '../../lib/types'
import { CHART_TOOLTIP_STYLE } from './colors'

interface DeploymentComparisonProps {
  scenarios: Scenario[]
  activeLabel?: string
}

const SCORE_LABELS: Record<number, string> = {
  1: 'Very low',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Very high',
}

export function DeploymentComparison({ scenarios }: DeploymentComparisonProps) {
  const maxRam = Math.max(...scenarios.map((s) => s.ramBytes), 1)
  const maxDisk = Math.max(...scenarios.map((s) => s.diskBytes), 1)

  // Normalize everything to 0–100 so RAM/disk/scores share one axis.
  const data = scenarios.map((s) => ({
    name: s.label,
    RAM: (s.ramBytes / maxRam) * 100,
    Disk: (s.diskBytes / maxDisk) * 100,
    'Est. Latency': s.latencyScore * 20,
    'Est. Recall': s.recallScore * 20,
    'Est. Cost': s.costScore * 20,
    ramBytes: s.ramBytes,
    diskBytes: s.diskBytes,
    latencyScore: s.latencyScore,
    recallScore: s.recallScore,
    costScore: s.costScore,
    description: s.description,
  }))

  return (
    <div className="h-full">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Deployment Comparison
      </h3>
      <p className="mb-2 text-xs text-slate-500">
        Bars are relative (100 = highest across strategies). Latency, recall and cost are
        qualitative guidance, not predictions.
      </p>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fill: '#cbd5e1', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              itemStyle={{ color: '#e2e8f0' }}
              cursor={{ fill: '#33415533' }}
              formatter={(value, name, item) => {
                const row = item.payload as (typeof data)[number]
                switch (name) {
                  case 'RAM':
                    return [formatBytes(row.ramBytes), 'RAM']
                  case 'Disk':
                    return [formatBytes(row.diskBytes), 'Disk']
                  case 'Est. Latency':
                    return [SCORE_LABELS[row.latencyScore], 'Est. latency']
                  case 'Est. Recall':
                    return [SCORE_LABELS[row.recallScore], 'Est. recall']
                  case 'Est. Cost':
                    return [SCORE_LABELS[row.costScore], 'Est. cost']
                  default:
                    return [String(value), String(name)]
                }
              }}
            />
            <Bar dataKey="RAM" fill="#f43f5e" barSize={6} radius={3} isAnimationActive={false} />
            <Bar dataKey="Disk" fill="#38bdf8" barSize={6} radius={3} isAnimationActive={false} />
            <Bar
              dataKey="Est. Latency"
              fill="#facc15"
              barSize={6}
              radius={3}
              isAnimationActive={false}
            />
            <Bar
              dataKey="Est. Recall"
              fill="#34d399"
              barSize={6}
              radius={3}
              isAnimationActive={false}
            />
            <Bar
              dataKey="Est. Cost"
              fill="#a78bfa"
              barSize={6}
              radius={3}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-500" />RAM</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-400" />Disk</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-yellow-400" />Est. latency</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />Est. recall</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-violet-400" />Est. cost</span>
      </div>
    </div>
  )
}
