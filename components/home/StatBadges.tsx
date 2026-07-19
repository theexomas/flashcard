'use client'

interface StatBadgesProps {
  nNew: number
  nLearn: number
  nDone: number
}

export default function StatBadges({ nNew, nLearn, nDone }: StatBadgesProps) {
  return (
    <div className="stats">
      <div className="stat new">
        <b>{nNew}</b>
        <span>Шинэ</span>
      </div>
      <div className="stat learning">
        <b>{nLearn}</b>
        <span>Сурч буй</span>
      </div>
      <div className="stat done">
        <b>{nDone}</b>
        <span>Сурсан</span>
      </div>
    </div>
  )
}
