'use client'

import { useGameStore } from '@/store/gameStore'

interface HeaderProps {
  onImport: () => void
  onAccount: () => void
}

export default function Header({ onImport, onAccount }: HeaderProps) {
  const sbUser = useGameStore(s => s.sbUser)

  return (
    <header>
      <div className="logo ko">
        한몽 <em>카드</em>
      </div>
      <div className="hbtns">
        <button className="icon-btn" onClick={onImport} title="Өөрийн үг оруулах">
          📥
        </button>
        <button
          className="icon-btn"
          onClick={onAccount}
          title="Бүртгэл ба синк"
          style={{ position: 'relative' }}
        >
          👤
          <span
            className={`sync-dot on ${sbUser ? 'ok' : ''}`}
          />
        </button>
      </div>
    </header>
  )
}
