'use client'

import Image from 'next/image'
import { useTransitionRouter as useRouter } from 'next-view-transitions'

export default function Home() {
  const router = useRouter()

  const handleContinue = () => {
    router.push('/home')
  }

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
        <button
          onClick={handleContinue}
          className="click-active liquid-glass-button-transparent"
          style={{
            position: 'absolute', bottom: '23%', right: '13%',
            borderRadius: 999,
            padding: '10px 44px', fontSize: 13,
            fontFamily: 'var(--font-griffiths), Georgia, serif',
            letterSpacing: '0.08em', cursor: 'pointer',
          }}
        >
          continue
        </button>
      </div>
    </main>
  )
}