'use client'

import Image from 'next/image'
import { Link } from 'next-view-transitions'

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', fontFamily: 'Inter, sans-serif', background: '#000' }}>

      {/* Background */}
      <Image
        src="/bbg.jpg"
        alt="Basheer"
        fill
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          filter: 'brightness(0.9)',
          zIndex: 0,
          viewTransitionName: 'bg',
        }}
        priority
      />

      {/* Splash Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
      }}>
        {/* Logo */}
        <div style={{ position: 'absolute', bottom: '31%', left: '17%' }}>
          <Image
            src="/logo.png"
            alt="Being Basheer"
            width={220}
            height={88}
            style={{ objectFit: 'contain', viewTransitionName: 'logo' }}
            priority
            loading="eager"
          />
        </div>

        {/* Continue button */}
        <Link
          href="/home"
          className="click-active liquid-glass-button-transparent"
          style={{
            position: 'absolute', bottom: '23%', right: '13%',
            borderRadius: 999,
            padding: '10px 44px', fontSize: 13,
            fontFamily: 'var(--font-griffiths), Georgia, serif',
            letterSpacing: '0.08em', cursor: 'pointer',
            textAlign: 'center',
            display: 'inline-block',
            textDecoration: 'none',
          }}
        >
          continue
        </Link>
      </div>
    </main>
  )
}