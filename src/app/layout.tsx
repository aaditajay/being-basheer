import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ViewTransitions } from 'next-view-transitions'

const ala = localFont({
  src: '../../public/fonts/ala-regular.ttf',
  variable: '--font-ala',
})

const griffiths = localFont({
  src: '../../public/fonts/Griffiths.otf',
  variable: '--font-griffiths',
})

export const metadata: Metadata = {
  title: 'Being Basheer',
  description: 'Find the poet in your thoughts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${ala.variable} ${griffiths.variable}`}>
        <body>{children}</body>
      </html>
    </ViewTransitions>
  )
}