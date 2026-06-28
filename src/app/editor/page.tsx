'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTransitionRouter as useRouter } from 'next-view-transitions'

const MOODS = ['Hope', 'Longing', 'Nostalgia', 'Wonder', 'Comfort', 'Healing', 'Melancholy', 'Romance']
const STYLES = ['Poem', 'Letter', 'Reflection', 'Diary Entry', 'Story Fragment', 'Free Verse']
const LENGTHS = ['One Line', 'Short', 'Medium', 'Long']

const EXAMPLE_PROMPTS = [
  "Some people leave quietly.",
  "I never said what I wanted to say.",
  "The rain reminded me of something."
]

const PROGRESS_MESSAGES = [
  "Listening to the silence...",
  "Collecting forgotten memories...",
  "Finding the right metaphor...",
  "Following the feeling...",
  "Waiting for the final sentence..."
]

const glassStyle = {
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.3) 100%)',
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  borderRadius: '24px',
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.02), inset 0 2px 2px rgba(255, 255, 255, 0.6), inset 0 8px 16px rgba(255, 255, 255, 0.25), inset 0 -8px 16px rgba(0, 0, 0, 0.03), inset 0 1px 8px rgba(255, 255, 255, 0.4)',
}

export default function EditorPage() {
  const [thought, setThought] = useState('')
  const [context, setContext] = useState('')
  const [mood, setMood] = useState('Nostalgia')
  const [style, setStyle] = useState('Reflection')
  const [recipient, setRecipient] = useState('')
  const [length, setLength] = useState('Medium')
  const [language, setLanguage] = useState('English')
  
  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [themes, setThemes] = useState('')
  const [avoid, setAvoid] = useState('')
  const [symbolism, setSymbolism] = useState('')
  const [visuals, setVisuals] = useState('')

  const [loading, setLoading] = useState(false)
  const [progressIdx, setProgressIdx] = useState(0)
  const [exampleIdx, setExampleIdx] = useState(0)
  const [error, setError] = useState('')
  const router = useRouter()

  // Read prefilled thought on mount
  useEffect(() => {
    const prefilled = sessionStorage.getItem('prefilledThought')
    if (prefilled) {
      setThought(prefilled)
      sessionStorage.removeItem('prefilledThought')
    }
  }, [])

  // Rotate example placeholder prompts
  useEffect(() => {
    const interval = setInterval(() => {
      setExampleIdx(prev => (prev + 1) % EXAMPLE_PROMPTS.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Rotate progress messages when loading
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setProgressIdx(prev => (prev + 1) % PROGRESS_MESSAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [loading])

  async function handleGenerate() {
    if (!thought.trim()) { setError('Please write down a starting thought.'); return }
    if (!mood) { setError('Please choose a feeling.'); return }
    if (!style) { setError('Please choose how it should be written.'); return }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          thought, 
          context,
          mood, 
          style, 
          recipient,
          length,
          language,
          themes,
          avoid,
          symbolism,
          visuals
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      sessionStorage.setItem('poems', JSON.stringify(data.poems))
      sessionStorage.setItem('meta', JSON.stringify({ 
        thought, 
        mood, 
        style, 
        recipient,
        length,
        language
      }))
      router.push('/results')
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Generation failed'
      setError(errMsg)
      setLoading(false)
    }
  }

  return (
    <main style={{
      width: '100vw',
      minHeight: '100vh',
      position: 'relative',
      fontFamily: 'Inter, sans-serif',
      paddingBottom: 60,
    }}>
      {/* Background (Bright, matching screenshot) */}
      <Image
        src="/hbg.jpg"
        alt="background"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0, filter: 'brightness(0.95)', viewTransitionName: 'bg' }}
        priority
      />

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          animation: 'fadeIn 0.4s ease-out forwards',
        }}>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: 22,
            color: '#1c1410',
            letterSpacing: '0.04em',
            transition: 'opacity 0.5s ease',
            textAlign: 'center',
          }}>
            {PROGRESS_MESSAGES[progressIdx]}
          </p>
        </div>
      )}

      {/* Logo (Top Left, matching screenshot) */}
      <div style={{ position: 'absolute', top: 24, left: 32, zIndex: 10, cursor: 'pointer' }} onClick={() => router.push('/home')} className="click-active">
        <Image
          src="/logo.png"
          alt="Being Basheer"
          width={130}
          height={52}
          style={{ objectFit: 'contain', viewTransitionName: 'logo' }}
          priority
          loading="eager"
        />
      </div>

      {/* Grid Layout matching screenshot */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: 28,
        maxWidth: 1200,
        margin: '0 auto',
        padding: '120px 40px 60px',
        minHeight: 'calc(100vh - 60px)',
      }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Large Card: Start with a thought */}
          <div style={{ ...glassStyle, padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#4d3e38', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block' }}>
                write your thought
              </span>
              {/* Mic Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3d2e24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.65 }}>
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </div>
            
            <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
              <textarea
                value={thought}
                onChange={e => setThought(e.target.value)}
                placeholder="What has been sitting in your mind lately?"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  width: '100%',
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: '#1a1a1a',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
              {!thought && (
                <div 
                  className="prompt-fade"
                  key={exampleIdx}
                  style={{
                    position: 'absolute',
                    top: 36,
                    left: 0,
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    color: 'rgba(0,0,0,0.4)',
                    fontSize: 15,
                    pointerEvents: 'none',
                  }}
                >
                  e.g., &ldquo;{EXAMPLE_PROMPTS[exampleIdx]}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Two Smaller Cards Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Card Left: Tell me a little more */}
            <div style={{ ...glassStyle, padding: '20px 24px', height: 130, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#4d3e38', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                tell me a little more (optional)
              </span>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="What inspired this thought? What memory are you carrying?"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  width: '100%',
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: '#1a1a1a',
                  flex: 1,
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>

            {/* Card Right: Who is this for? */}
            <div style={{ ...glassStyle, padding: '20px 24px', height: 130, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#4d3e38', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                who is this for? (optional)
              </span>
              <input
                type="text"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="e.g., Someone I miss, my younger self"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: 13,
                  color: '#1a1a1a',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>
          </div>

          {/* Submit Button & Errors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', marginTop: 12 }}>
            {error && (
              <p style={{ color: '#871919', fontSize: 13, fontFamily: 'Georgia, serif' }}>{error}</p>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="click-active liquid-glass-button-dark"
              style={{
                padding: '14px 48px',
                fontWeight: 400,
                fontSize: 15,
              }}
            >
              Complete the Feeling
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN — Stack of Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Card 1: What feeling should remain? */}
          <div style={{ ...glassStyle, padding: '18px 22px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4d3e38', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
              what feeling should remain?
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {MOODS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={mood === m ? "click-active liquid-glass-button-dark" : "click-active liquid-glass-button-light"}
                  style={{
                    borderRadius: 999,
                    padding: '5px 12px',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: How should it be written? */}
          <div style={{ ...glassStyle, padding: '18px 22px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4d3e38', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
              how should it be written?
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STYLES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={style === s ? "click-active liquid-glass-button-dark" : "click-active liquid-glass-button-light"}
                  style={{
                    borderRadius: 999,
                    padding: '5px 12px',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Length */}
          <div style={{ ...glassStyle, padding: '18px 22px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4d3e38', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
              length
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {LENGTHS.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLength(l)}
                  className={length === l ? "click-active liquid-glass-button-dark" : "click-active liquid-glass-button-light"}
                  style={{
                    borderRadius: 999,
                    padding: '5px 12px',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Card 4: Language */}
          <div style={{ ...glassStyle, padding: '18px 22px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4d3e38', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
              language
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['English', 'Malayalam', 'Both'].map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={language === lang ? "click-active liquid-glass-button-dark" : "click-active liquid-glass-button-light"}
                  style={{
                    borderRadius: 999,
                    padding: '5px 12px',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Card 5: Advanced settings (themes, avoid, symbolism, visuals) */}
          <div style={{ ...glassStyle, padding: '18px 22px' }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="click-active"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4d3e38',
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignSelf: 'stretch',
                justifyContent: 'space-between',
                width: '100%',
                padding: 0,
              }}
            >
              <span>advanced creativity</span>
              <span>{showAdvanced ? '▼' : '▲'}</span>
            </button>

            {showAdvanced ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16, animation: 'fadeIn 0.3s ease' }}>
                <div>
                  <label style={{ fontSize: 10, color: '#3d2e24', display: 'block', marginBottom: 2 }}>Themes to include</label>
                  <input
                    type="text"
                    value={themes}
                    onChange={e => setThemes(e.target.value)}
                    placeholder="e.g., Use the sea as a metaphor."
                    style={{
                      background: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 4,
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: 11,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: '#3d2e24', display: 'block', marginBottom: 2 }}>Things to avoid</label>
                  <input
                    type="text"
                    value={avoid}
                    onChange={e => setAvoid(e.target.value)}
                    placeholder="e.g., Do not mention love directly."
                    style={{
                      background: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 4,
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: 11,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: '#3d2e24', display: 'block', marginBottom: 2 }}>Hidden symbolism</label>
                  <input
                    type="text"
                    value={symbolism}
                    onChange={e => setSymbolism(e.target.value)}
                    placeholder="e.g., Mention trains indirectly."
                    style={{
                      background: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 4,
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: 11,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: '#3d2e24', display: 'block', marginBottom: 2 }}>Visual imagery</label>
                  <input
                    type="text"
                    value={visuals}
                    onChange={e => setVisuals(e.target.value)}
                    placeholder="e.g., A rainy window, candle glow"
                    style={{
                      background: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 4,
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: 11,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 10, color: '#4d3e38', opacity: 0.6, marginTop: 6 }}>
                Expand to configure metaphors, constraints & symbols.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Footer */}
      <div style={{ position: 'relative', marginTop: -20, textAlign: 'center', zIndex: 10 }}>
        <a
          href="https://linkedin.com/in/aaditajay"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, textDecoration: 'none', letterSpacing: '0.06em' }}
        >
          Contact Developer
        </a>
      </div>
    </main>
  )
}