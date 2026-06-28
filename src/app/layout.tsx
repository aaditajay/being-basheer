import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Inter, Playfair_Display, Noto_Serif_Malayalam } from 'next/font/google'
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

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const malayalam = Noto_Serif_Malayalam({
  subsets: ['malayalam'],
  weight: ['300', '400', '600'],
  variable: '--font-malayalam',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Being Basheer',
  description: 'Find the poet in your thoughts.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${ala.variable} ${griffiths.variable} ${inter.variable} ${playfair.variable} ${malayalam.variable}`}>
        <body className={inter.className}>{children}</body>
      </html>
    </ViewTransitions>
  )
}