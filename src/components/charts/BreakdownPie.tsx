import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatBytes } from '../../lib/format'
import type { ComponentResult } from '../../lib/types'
import { CHART_TOOLTIP_STYLE, COMPONENT_COLORS } from './colors'

interface BreakdownPieProps {
  title: string
  components: ComponentResult[]
  metric: 'ramBytes' | 'diskBytes'
  emptyMessage: string
}

export function BreakdownPie({ title, components, metric, emptyMessage }: BreakdownPieProps) {
  const data = components
    .filter((c) => c[metric] > 0)
    .map((c) => ({ id: c.id, name: c.label, value: c[metric] }))

  const total = data.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className="flex h-full flex-col">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</h3>
      <p className="text-lg font-semibold text-slate-100">{formatBytes(total)}</p>
      {data.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div className="min-h-56 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="52%"
                outerRadius="80%"
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.id} fill={COMPONENT_COLORS[entry.id]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatBytes(Number(value))}
                contentStyle={CHART_TOOLTIP_STYLE}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-slate-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
