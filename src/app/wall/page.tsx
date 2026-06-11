'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTransitionRouter as useRouter } from 'next-view-transitions'
import { createClient } from '@/lib/supabase'

type Poem = {
  id: string
  mood: string
  output_language: string
  form: string | null
  inspiration: string | null
  poem_1: string
  poem_2: string
  poem_3: string
  created_at: string
}

export default function WallPage() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<{ id: string; index: number } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchPoems() {
      const { data, error } = await supabase
        .from('poems')
        .select('id, mood, output_language, form, inspiration, poem_1, poem_2, poem_3, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) setPoems(data)
      setLoading(false)
    }
    fetchPoems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function getPoems(poem: Poem) {
    return [poem.poem_1, poem.poem_2, poem.poem_3].filter(Boolean)
  }

  return (
    <main style={{ width: '100vw', minHeight: '100vh', position: 'relative', fontFamily: 'Inter, sans-serif' }}>

      {/* Background */}
      <Image src="/hbg.jpg" alt="background" fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0, filter: 'brightness(0.3)', viewTransitionName: 'bg' }} priority />

      {/* Logo */}
      <div style={{ position: 'absolute', top: 24, left: 32, zIndex: 10, cursor: 'pointer' }}
        onClick={() => router.push('/home')} className="click-active">
        <Image src="/logo.png" alt="Being Basheer" width={100} height={40} style={{ objectFit: 'contain', viewTransitionName: 'logo' }} priority loading="eager" />
      </div>

      {/* Write button */}
      <button
        onClick={() => router.push('/editor')}
        className="click-active"
        style={{
          position: 'absolute', top: 28, right: 32, zIndex: 10,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.25)', borderRadius: 999,
          padding: '8px 24px', color: 'white', fontSize: 13,
          cursor: 'pointer', letterSpacing: '0.04em',
        }}
      >
        write →
      </button>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, padding: '100px 40px 80px', maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 56, textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-griffiths), Georgia, serif',
            fontStyle: 'italic',
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            the wall
          </p>
          <h1 style={{
            color: 'white',
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 300,
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            lineHeight: 1.3,
          }}>
            words people left behind
          </h1>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, padding: '80px 0' }}>
            gathering poems...
          </div>
        )}

        {/* Empty */}
        {!loading && poems.length === 0 && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, padding: '80px 0' }}>
            <p>no poems yet.</p>
            <p style={{ marginTop: 8, fontSize: 13 }}>be the first to leave one.</p>
          </div>
        )}

        {/* Poem entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {poems.map((poem) => {
            const versions = getPoems(poem)
            const activeIndex = expanded?.id === poem.id ? expanded.index : 0
            const activePoem = versions[activeIndex]

            return (
              <div
                key={poem.id}
                style={{
                  background: expanded?.id === poem.id
                    ? 'rgba(255,255,255,0.10)'
                    : 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  marginBottom: 12,
                }}
              >
                {/* Row header — always visible */}
                <div
                  onClick={() => setExpanded(
                    expanded?.id === poem.id ? null : { id: poem.id, index: 0 }
                  )}
                  style={{
                    padding: '20px 28px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 999, padding: '3px 12px',
                      fontSize: 11, color: 'rgba(255,255,255,0.7)',
                      letterSpacing: '0.06em',
                    }}>
                      {poem.mood}
                    </span>
                    {poem.form && (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>
                        {poem.form}
                      </span>
                    )}
                    {poem.inspiration && (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                        · inspired by {poem.inspiration}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>
                      {formatDate(poem.created_at)}
                    </span>
                    <span style={{
                      color: 'rgba(255,255,255,0.4)', fontSize: 11,
                      transform: expanded?.id === poem.id ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s', display: 'inline-block',
                    }}>▼</span>
                  </div>
                </div>

                {/* Expanded poem */}
                {expanded?.id === poem.id && (
                  <div style={{ padding: '0 28px 28px' }}>

                    {/* Version tabs */}
                    {versions.length > 1 && (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                        {versions.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setExpanded({ id: poem.id, index: i })}
                            className="click-active"
                            style={{
                              background: activeIndex === i ? 'rgba(255,255,255,0.2)' : 'transparent',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: 999, padding: '4px 14px',
                              color: activeIndex === i ? 'white' : 'rgba(255,255,255,0.4)',
                              fontSize: 11, cursor: 'pointer',
                              letterSpacing: '0.06em',
                              transition: 'all 0.15s',
                            }}
                          >
                            version {i + 1}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Poem text */}
                    <p style={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: 15,
                      lineHeight: 2,
                      whiteSpace: 'pre-line',
                      fontWeight: 300,
                      fontFamily: 'Georgia, serif',
                      maxWidth: 600,
                    }}>
                      {activePoem}
                    </p>

                    {/* Copy */}
                    <button
                      onClick={() => navigator.clipboard.writeText(activePoem)}
                      className="click-active"
                      style={{
                        marginTop: 20,
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 999, padding: '6px 18px',
                        color: 'rgba(255,255,255,0.4)', fontSize: 11,
                        cursor: 'pointer', letterSpacing: '0.06em',
                      }}
                    >
                      copy
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '20px 0 32px' }}>
        <a href="https://linkedin.com/in/aaditajay" target="_blank" rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, textDecoration: 'none', letterSpacing: '0.06em' }}>
          Contact Developer
        </a>
      </div>
    </main>
  )
}