'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTransitionRouter as useRouter, Link } from 'next-view-transitions'
import { createClient } from '@/lib/supabase'
import AuthModal from '@/components/auth_modal'

type Poem = { title: string; body: string; note: string }
type Meta = { 
  thought: string; 
  mood: string; 
  style: string; 
  recipient?: string; 
  length: string;
  language?: string;
}

export default function ResultsPage() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [saved, setSaved] = useState(false)
  const [savedIdx, setSavedIdx] = useState<number | null>(null)
  const [savingIdx, setSavingIdx] = useState<number | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [pendingPublic, setPendingPublic] = useState(false)
  const [pendingPoemIdx, setPendingPoemIdx] = useState<number | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const p = sessionStorage.getItem('poems')
    const m = sessionStorage.getItem('meta')
    if (!p || !m) { router.push('/editor'); return }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPoems(JSON.parse(p))
    setMeta(JSON.parse(m))
    router.prefetch('/home')
    router.prefetch('/editor')
    router.prefetch('/wall')
  }, [router])

  async function savePoem(poemText: string, isPublic: boolean, index: number) {
    if (!meta) return
    setSavingIdx(index)
    setPendingPublic(isPublic)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error: dbError } = await supabase.from('poems').insert({
        user_id: user?.id ?? null,
        input_text: meta.thought,
        mood: meta.mood,
        inspiration: null,
        form: meta.style || null,
        output_language: meta.language || 'English',
        poem_1: poemText,
        poem_2: null,
        poem_3: null,
        is_public: isPublic,
        length: meta.length || null,
      })
      if (dbError) throw dbError
      setSavedIdx(index)
      setSaved(true)
      setTimeout(() => {
        router.push('/wall')
      }, 1000)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save poem'
      setError(errMsg)
      setSavingIdx(null)
    }
  }

  async function handleSaveCard(poemText: string, isPublic: boolean, index: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setPendingPublic(isPublic)
      setPendingPoemIdx(index)
      setShowAuth(true)
      return
    }
    await savePoem(poemText, isPublic, index)
  }

  async function handleAuthSuccess() {
    setShowAuth(false)
    if (pendingPoemIdx !== null) {
      const poemText = poems[pendingPoemIdx].body
      await savePoem(poemText, pendingPublic, pendingPoemIdx)
      setPendingPoemIdx(null)
    }
  }

  function handleCopy(poem: Poem) {
    navigator.clipboard.writeText(`${poem.title}\n\n${poem.body}`)
  }

  if (!poems.length) return null

  return (
    <main style={{ width: '100vw', minHeight: '100vh', position: 'relative', fontFamily: 'Inter, sans-serif' }}>
      <Image src="/hbg.jpg" alt="background" fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0, filter: 'brightness(0.35)', viewTransitionName: 'bg' }} priority />

      {/* Logo */}
      <Link href="/home" style={{ position: 'absolute', top: 24, left: 32, zIndex: 10, cursor: 'pointer', display: 'block' }} className="click-active">
        <Image src="/logo.png" alt="Being Basheer" width={100} height={40} style={{ objectFit: 'contain', viewTransitionName: 'logo' }} priority loading="eager" />
      </Link>

      {/* Back */}
      <Link href="/editor"
        className="click-active liquid-glass-button-transparent"
        style={{
          position: 'absolute', top: 28, right: 32, zIndex: 10,
          borderRadius: 999,
          padding: '8px 20px', fontSize: 13, cursor: 'pointer',
          textDecoration: 'none',
          textAlign: 'center',
        }}>
        ← write again
      </Link>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, padding: '100px 40px 80px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Meta */}
        {meta && (
          <p className="fade-in-up" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 32, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            {meta.mood} · {meta.style}{meta.recipient ? ` · for ${meta.recipient}` : ''}{meta.language ? ` · ${meta.language}` : ''}
          </p>
        )}

        {/* Poem cards */}
        <div className="fade-in-up fade-in-up-delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
          {poems.map((poem, i) => (
            <div 
              key={i} 
              className="journal-canvas paper-texture"
              style={{
                padding: '32px 28px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
                border: '1px solid var(--paper-dark)',
              }}
            >
              <span style={{ color: 'var(--sepia-light)', fontSize: 11, letterSpacing: '0.15em', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>0{i + 1}</span>
              <h2 style={{ color: 'var(--ink)', fontSize: 18, fontWeight: 400, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>{poem.title}</h2>
              <div style={{ height: 1, background: 'var(--paper-dark)', opacity: 0.5 }} />
              <p style={{ color: 'var(--ink-light)', fontSize: 15, lineHeight: 1.9, whiteSpace: 'pre-line', fontFamily: 'Georgia, serif', fontWeight: 300, flex: 1 }}>
                {poem.body}
              </p>
              <p style={{ color: 'var(--sepia)', fontSize: 11, fontStyle: 'italic', borderTop: '1px dashed var(--paper-dark)', paddingTop: 12 }}>
                {poem.note}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 'auto', paddingTop: 16 }}>
                <button 
                  onClick={() => handleCopy(poem)}
                  className="click-active"
                  style={{ 
                    background: 'rgba(28,20,16,0.05)', 
                    border: '1px solid var(--paper-dark)', 
                    borderRadius: 999, 
                    padding: '8px 20px', 
                    color: 'var(--sepia)', 
                    fontSize: 12, 
                    cursor: 'pointer', 
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic'
                  }}
                >
                  copy
                </button>
                {saved && savedIdx === i ? (
                  <span style={{ color: 'var(--teal)', fontSize: 12, fontFamily: 'Georgia, serif', fontStyle: 'italic', marginLeft: 8 }}>
                    ✓ saved
                  </span>
                ) : (
                  <>
                    <button 
                      onClick={() => handleSaveCard(poem.body, false, i)}
                      disabled={savingIdx !== null}
                      className="click-active"
                      style={{ 
                        background: 'rgba(28,20,16,0.05)', 
                        border: '1px solid var(--paper-dark)', 
                        borderRadius: 999, 
                        padding: '8px 20px', 
                        color: 'var(--sepia)', 
                        fontSize: 12, 
                        cursor: 'pointer', 
                        fontFamily: 'Georgia, serif',
                        fontStyle: 'italic',
                        opacity: savingIdx !== null ? 0.5 : 1
                      }}
                    >
                      {savingIdx === i && !pendingPublic ? 'saving...' : 'save privately'}
                    </button>
                    <button 
                      onClick={() => handleSaveCard(poem.body, true, i)}
                      disabled={savingIdx !== null}
                      className="click-active"
                      style={{ 
                        background: 'var(--ink)', 
                        border: 'none', 
                        borderRadius: 999, 
                        padding: '8px 20px', 
                        color: 'var(--cream)', 
                        fontSize: 12, 
                        cursor: 'pointer', 
                        fontFamily: 'Georgia, serif',
                        fontStyle: 'italic',
                        opacity: savingIdx !== null ? 0.5 : 1
                      }}
                    >
                      {savingIdx === i && pendingPublic ? 'sharing...' : 'share to wall'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* General Error or redirecting message */}
        {error && (
          <p style={{ color: '#ff6b6b', fontSize: 14, marginTop: 16 }}>Error: {error}</p>
        )}
        {saved && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 16 }}>✓ saved. redirecting to wall...</p>
        )}
      </div>

      {/* Auth modal — only appears when sharing to wall */}
      {showAuth && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => { setShowAuth(false); setPendingPublic(false) }}
        />
      )}

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
        <a href="https://linkedin.com/in/aaditajay" target="_blank" rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, textDecoration: 'none', letterSpacing: '0.06em' }}>
          Contact Developer
        </a>
      </div>
    </main>
  )
}