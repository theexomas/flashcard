'use client'

import { useGameStore } from '@/store/gameStore'

interface HeaderProps {
  onImport: () => void
  onAccount: () => void
  onAdmin?: () => void
}

export default function Header({ onImport, onAccount, onAdmin }: HeaderProps) {
  const sbUser = useGameStore(s => s.sbUser)

  return (
    <header>
      <div className="logo ko">
        한몽 <em>카드</em>
      </div>
      <div className="hbtns">
        {onAdmin && (
          <button className="icon-btn" onClick={onAdmin} title="Админ">
            🛠️
          </button>
        )}
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
