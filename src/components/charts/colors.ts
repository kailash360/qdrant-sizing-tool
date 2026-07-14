import type { ComponentId } from '../../lib/types'

export const COMPONENT_COLORS: Record<ComponentId, string> = {
  originalVectors: '#f43f5e', // rose
  quantizedVectors: '#fb923c', // orange
  payload: '#38bdf8', // sky
  payloadIndex: '#818cf8', // indigo
  hnswGraph: '#34d399', // emerald
  idsVersions: '#facc15', // yellow
  metadata: '#a78bfa', // violet
  runtimeOverhead: '#94a3b8', // slate
}

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e2e8f0',
} as const
