export type SRSEntry = {
  reps: number
  int: number
  ease: number
  due: number
  lapses: number
}

export type Card = {
  ko: string
  mn: string
  category: string
  lesson: number | 'import'
  ex?: string
}

export type GrammarRule = {
  lesson: number
  title: string
  rule: string
  examples: { ko: string; mn: string }[]
}

const DAY = 86400000

export function cardId(c: Card): string {
  return c.ko + '⁄' + c.mn
}

export function getState(srs: Record<string, SRSEntry>, id: string): SRSEntry {
  return srs[id] || { reps: 0, int: 0, ease: 2.5, due: 0, lapses: 0 }
}

export function grade(
  srs: Record<string, SRSEntry>,
  id: string,
  q: number
): Record<string, SRSEntry> {
  const s = { ...getState(srs, id) }
  if (q >= 3) {
    s.reps++
    s.int =
      s.reps === 1 ? 1 : s.reps === 2 ? 3 : Math.round(s.int * s.ease)
    s.ease = Math.max(1.3, s.ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    s.due = Date.now() + s.int * DAY
  } else {
    s.reps = 0
    s.int = 0
    s.lapses++
    s.due = Date.now() + 10 * 60 * 1000
  }
  return { ...srs, [id]: s }
}

export function isNew(srs: Record<string, SRSEntry>, c: Card): boolean {
  const s = srs[cardId(c)]
  return !s || (s.reps === 0 && !s.lapses)
}

export function isDue(srs: Record<string, SRSEntry>, c: Card): boolean {
  const s = srs[cardId(c)]
  return !s || s.due <= Date.now()
}

export function isDone(srs: Record<string, SRSEntry>, c: Card): boolean {
  const s = srs[cardId(c)]
  return !!(s && s.int >= 21)
}

export function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length
  const dp: number[][] = []
  for (let i = 0; i <= m; i++) {
    dp[i] = [i]
    for (let j = 1; j <= n; j++) dp[i][j] = 0
  }
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

export function normAns(s: string): string {
  return s.trim().replace(/[.!?,。]/g, '').toLowerCase()
}
