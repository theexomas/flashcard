import type { Metadata } from 'next'
import './globals.css'
import ContentLoader from '@/components/ContentLoader'

export const metadata: Metadata = {
  title: '한몽 카드 · Солонгос үг сурах',
  description: 'SM-2 spaced repetition Korean flashcards for Mongolian speakers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&family=Noto+Sans:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ContentLoader />
        {children}
      </body>
    </html>
  )
}
