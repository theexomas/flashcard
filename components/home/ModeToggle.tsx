'use client'

interface ModeToggleProps {
  mode: 'mcq' | 'type'
  onChange: (mode: 'mcq' | 'type') => void
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle">
      <button
        className={mode === 'mcq' ? 'active' : ''}
        onClick={() => onChange('mcq')}
      >
        MCQ сонголт
      </button>
      <button
        className={mode === 'type' ? 'active' : ''}
        onClick={() => onChange('type')}
      >
        ✏️ Бичиж хариулах
      </button>
    </div>
  )
}
