'use client'

interface CatSelectProps {
  categories: string[]
  value: string
  onChange: (cat: string) => void
}

export default function CatSelect({ categories, value, onChange }: CatSelectProps) {
  return (
    <select
      className="cat"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">Бүх ангилал</option>
      {categories.map(c => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  )
}
