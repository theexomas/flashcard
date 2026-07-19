'use client'

import type { GrammarRule } from '@/store/gameStore'

interface GrammarCardProps {
  rule: GrammarRule
}

export default function GrammarCard({ rule }: GrammarCardProps) {
  return (
    <div className="grammar-card">
      <div className="g-lesson">Хичээл {rule.lesson}</div>
      <div className="g-title">{rule.title}</div>
      <div className="g-rule">{rule.rule}</div>
      <div className="g-examples">
        {rule.examples.map((ex, i) => (
          <div key={i} className="g-ex">
            <span className="ko">{ex.ko}</span>
            <span className="mn">{ex.mn}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
