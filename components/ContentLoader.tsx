'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'

export default function ContentLoader() {
  useEffect(() => {
    useGameStore.getState().fetchContent()
  }, [])
  return null
}
