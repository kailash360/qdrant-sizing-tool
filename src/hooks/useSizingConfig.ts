import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_CONFIG } from '../lib/sizing'
import { configFromSearchParams, configToSearchParams } from '../lib/url'
import type { SizingConfig } from '../lib/types'

/**
 * Sizing configuration state, initialized from (and mirrored to) the URL query
 * string so any state is shareable as a link.
 */
export function useSizingConfig() {
  const [config, setConfig] = useState<SizingConfig>(() =>
    configFromSearchParams(new URLSearchParams(window.location.search)),
  )
  const debounceRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      const query = configToSearchParams(config).toString()
      window.history.replaceState(null, '', `${window.location.pathname}?${query}`)
    }, 300)
    return () => window.clearTimeout(debounceRef.current)
  }, [config])

  const update = useCallback((patch: Partial<SizingConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }))
  }, [])

  const reset = useCallback(() => {
    setConfig(DEFAULT_CONFIG)
    window.history.replaceState(null, '', window.location.pathname)
  }, [])

  return { config, update, reset }
}
