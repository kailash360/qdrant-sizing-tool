const BINARY_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']

export function formatBytes(bytes: number, decimals = 2): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes === 0) return '0 B'
  const i = Math.min(Math.floor(Math.log2(bytes) / 10), BINARY_UNITS.length - 1)
  const value = bytes / 2 ** (10 * i)
  return `${value.toFixed(i === 0 ? 0 : decimals)} ${BINARY_UNITS[i]}`
}

/** Compact human count, e.g. 400_000_000 -> "400M". */
export function formatCount(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (n >= 1e9) return `${trimZeros((n / 1e9).toFixed(2))}B`
  if (n >= 1e6) return `${trimZeros((n / 1e6).toFixed(2))}M`
  if (n >= 1e3) return `${trimZeros((n / 1e3).toFixed(2))}K`
  return String(n)
}

export function formatInt(n: number): string {
  return n.toLocaleString('en-US')
}

function trimZeros(s: string): string {
  return s.replace(/\.?0+$/, '')
}

export function gibToBytes(gib: number): number {
  return gib * 2 ** 30
}
