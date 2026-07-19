export const K_CUSTOM = 'hmk_custom_v2'
export const K_SRS = 'hmk_srs_v2'
export const K_SET = 'hmk_settings_v2'
export const K_GRAMMAR = 'hm_grammar'

export function loadJSON<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal
  try {
    const v = localStorage.getItem(key)
    if (v === null) return defaultVal
    return JSON.parse(v) as T
  } catch {
    return defaultVal
  }
}

export function saveJSON<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(val))
}
