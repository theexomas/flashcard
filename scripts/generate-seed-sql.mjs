// One-off tool: generates SQL INSERT statements for `cards` and `grammar_rules`
// from the current lib/data.ts content, so the Supabase tables can be seeded
// with the exact content already shipped in the app. Run:
//   node scripts/generate-seed-sql.mjs > seed.sql
// then paste seed.sql into the Supabase SQL editor.

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(__dirname, '..', 'lib', 'data.ts'), 'utf8')

function extractArrayLiteral(text, marker) {
  const start = text.indexOf(marker)
  if (start < 0) throw new Error(`marker not found: ${marker}`)
  const eq = text.indexOf('=', start)
  const bracketStart = text.indexOf('[', eq)
  let depth = 0
  for (let i = bracketStart; i < text.length; i++) {
    if (text[i] === '[') depth++
    else if (text[i] === ']') {
      depth--
      if (depth === 0) return text.slice(bracketStart, i + 1)
    }
  }
  throw new Error(`unterminated array for marker: ${marker}`)
}

const rawBuiltinLiteral = extractArrayLiteral(src, 'const RAW_BUILTIN')
const rawGrammarLiteral = extractArrayLiteral(src, 'const BUILTIN_GRAMMAR')

// eslint-disable-next-line no-new-func
const RAW_BUILTIN = new Function(`return ${rawBuiltinLiteral}`)()
// eslint-disable-next-line no-new-func
const BUILTIN_GRAMMAR = new Function(`return ${rawGrammarLiteral}`)()

function sqlStr(v) {
  if (v === null || v === undefined) return 'NULL'
  return `'${String(v).replace(/'/g, "''")}'`
}

function sqlJson(v) {
  return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`
}

const cardRows = RAW_BUILTIN.map(([ko, mn, category, lesson, ex]) =>
  `(${sqlStr(ko)}, ${sqlStr(mn)}, ${sqlStr(category)}, ${lesson}, ${sqlStr(ex)})`
)

const grammarRows = BUILTIN_GRAMMAR.map(g =>
  `(${g.lesson}, ${sqlStr(g.title)}, ${sqlStr(g.rule)}, ${sqlJson(g.examples ?? [])})`
)

console.log('-- Generated from lib/data.ts — run once in the Supabase SQL editor')
console.log(
  `insert into public.cards (ko, mn, category, lesson, ex) values\n${cardRows.join(',\n')};\n`
)
console.log(
  `insert into public.grammar_rules (lesson, title, rule, examples) values\n${grammarRows.join(',\n')};\n`
)
