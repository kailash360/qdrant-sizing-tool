import { DEFAULT_CONFIG } from './sizing'
import type { Placement, Quantization, SizingConfig, VectorDatatype } from './types'

type ParamSpec<K extends keyof SizingConfig> = {
  key: string
  parse: (raw: string) => SizingConfig[K] | undefined
  serialize: (value: SizingConfig[K]) => string
}

function intParam(min: number, max: number) {
  return {
    parse: (raw: string) => {
      const v = Number.parseInt(raw, 10)
      return Number.isFinite(v) && v >= min && v <= max ? v : undefined
    },
    serialize: (v: number) => String(v),
  }
}

function enumParam<T extends string>(allowed: readonly T[]) {
  return {
    parse: (raw: string) => (allowed.includes(raw as T) ? (raw as T) : undefined),
    serialize: (v: T) => v,
  }
}

const placement = enumParam<Placement>(['ram', 'disk'])

const PARAMS: { [K in keyof SizingConfig]: ParamSpec<K> } = {
  numVectors: { key: 'n', ...intParam(1, 1e13) },
  dimension: { key: 'dim', ...intParam(1, 65536) },
  datatype: { key: 'dtype', ...enumParam<VectorDatatype>(['float32', 'float16']) },
  payloadBytes: { key: 'payload', ...intParam(0, 1e9) },
  replicationFactor: { key: 'rf', ...intParam(1, 100) },
  shards: { key: 'shards', ...intParam(1, 10000) },
  hnswM: { key: 'm', ...intParam(0, 4096) },
  efConstruct: { key: 'ef', ...intParam(1, 100000) },
  hnswPlacement: { key: 'hnsw_loc', ...placement },
  quantization: { key: 'quant', ...enumParam<Quantization>(['none', 'binary', 'scalar']) },
  originalVectorsPlacement: { key: 'orig_loc', ...placement },
  quantizedVectorsPlacement: { key: 'quant_loc', ...placement },
  payloadPlacement: { key: 'payload_loc', ...placement },
  indexedFields: { key: 'idx_fields', ...intParam(0, 1000) },
  payloadIndexPlacement: { key: 'pidx_loc', ...placement },
  nodeRamGib: { key: 'node_ram', ...intParam(1, 100000) },
}

export function configToSearchParams(cfg: SizingConfig): URLSearchParams {
  const params = new URLSearchParams()
  for (const field of Object.keys(PARAMS) as (keyof SizingConfig)[]) {
    const spec = PARAMS[field]
    params.set(spec.key, spec.serialize(cfg[field] as never))
  }
  return params
}

export function configFromSearchParams(params: URLSearchParams): SizingConfig {
  const cfg: SizingConfig = { ...DEFAULT_CONFIG }
  for (const field of Object.keys(PARAMS) as (keyof SizingConfig)[]) {
    const spec = PARAMS[field]
    const raw = params.get(spec.key)
    if (raw === null) continue
    const parsed = spec.parse(raw)
    if (parsed !== undefined) {
      cfg[field] = parsed as never
    }
  }
  return cfg
}

export function shareableUrl(cfg: SizingConfig): string {
  const url = new URL(window.location.href)
  url.search = configToSearchParams(cfg).toString()
  return url.toString()
}
