'use client'

import { useRef, useEffect } from 'react'

interface TypeInputProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled: boolean
  borderColor?: string
}

export default function TypeInput({ value, onChange, onSubmit, disabled, borderColor }: TypeInputProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) ref.current?.focus()
  }, [disabled])

  return (
    <div className="type-wrap">
      <input
        ref={ref}
        className="type-input"
        type="text"
        lang="ko"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="한국어로 써 보세요…"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSubmit() }}
        disabled={disabled}
        style={borderColor ? { borderColor } : undefined}
      />
      <button className="type-submit" onClick={onSubmit} disabled={disabled}>
        확인 →
      </button>
    </div>
  )
}
