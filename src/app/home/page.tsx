'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useTransitionRouter as useRouter } from 'next-view-transitions'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import AuthModal from '@/components/auth_modal'

const REFLECTION_PROMPTS = [
  "What stayed with you today?",
  "If today became a memory, what would you remember most?",
  "Who crossed your mind unexpectedly?",
  "What feeling have you been carrying without naming?",
  "What conversation keeps replaying in your head?"
]

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isEntering, setIsEntering] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showReflector, setShowReflector] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Reflection Companion State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [inputText, setInputText] = useState('')
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsEntering(false)
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto scroll in reflection chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize Reflection Companion
  const startReflection = () => {
    const randomPrompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)]
    setMessages([{ role: 'assistant', content: randomPrompt }])
    setShowReflector(true)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || loadingQuestion) return

    const userText = inputText.trim()
    const updatedMessages = [...messages, { role: 'user', content: userText } as const]
    setMessages(updatedMessages)
    setInputText('')

    const userMsgCount = updatedMessages.filter(m => m.role === 'user').length

    if (userMsgCount >= 3) {
      setLoadingQuestion(true)
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: "I think there is a story hidden in what you just shared." }
        ])
        setLoadingQuestion(false)
      }, 1000)
      return
    }

    setLoadingQuestion(true)
    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })
      const data = await res.json()
      if (res.ok && data.question) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.question }])
      } else {
        throw new Error(data.error || 'Failed to fetch question')
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "What else comes to mind when you think about that?" }])
    } finally {
      setLoadingQuestion(false)
    }
  }

  const portToEditor = () => {
    const userResponses = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n')

    sessionStorage.setItem('prefilledThought', userResponses)
    router.push('/editor')
  }

  const avatarUrl = user?.user_metadata?.avatar_url
  const initials = (user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()

  return (
    <main style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>

      {/* ── BACKGROUND ── */}
      <Image
        src="/hbg.jpg"
        alt="background"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0, filter: 'brightness(0.45)', viewTransitionName: 'bg' }}
        priority
      />

      {/* ── CONTENT CONTAINER ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        opacity: isEntering ? 0 : 1,
        transition: 'opacity 0.6s ease-out',
      }}>
        {/* ── PROFILE SIGN IN/OUT (Top Right, styled like screenshot) ── */}
        <div style={{ position: 'absolute', top: 28, right: 32, zIndex: 20 }}>
          <button
            onClick={async () => {
              if (user) {
                await supabase.auth.signOut()
                setUser(null)
              } else {
                setShowAuth(true)
              }
            }}
            className="liquid-glass-button-light"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 500,
            }}
            title={user ? "Sign out" : "Sign in"}
          >
            {user ? (
              avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </button>
        </div>

        {/* ── CENTRAL BRANDING & INVITATIONS ── */}
        {!showReflector ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', padding: '0 24px' }}>
            {/* Logo */}
            <div style={{ marginBottom: 40 }}>
              <Image src="/logo.png" alt="Being Basheer" width={220} height={88} style={{ objectFit: 'contain', viewTransitionName: 'logo' }} priority loading="eager" />
            </div>

            {/* Invitation links */}
            <div style={{ display: 'flex', gap: 20, zIndex: 10, marginBottom: 56 }}>
              <button 
                onClick={() => router.push('/editor')} 
                className="click-active liquid-glass-button-transparent"
                style={{
                  borderRadius: '9999px',
                  padding: '14px 44px',
                  fontFamily: 'var(--font-griffiths), Georgia, serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                continue a thought
              </button>
              <button 
                onClick={() => router.push('/wall')} 
                className="click-active liquid-glass-button-transparent"
                style={{
                  borderRadius: '9999px',
                  padding: '14px 44px',
                  fontFamily: 'var(--font-griffiths), Georgia, serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                read the wall
              </button>
            </div>

            {/* Quote */}
            <div style={{ maxWidth: 620 }}>
              <p style={{
                fontFamily: 'var(--font-malayalam), serif',
                fontSize: 22,
                color: 'white',
                marginBottom: 12,
                letterSpacing: '0.02em',
                textShadow: '0 2px 12px rgba(0,0,0,0.4)',
              }}>
                &ldquo;ഞാൻ തന്നെയാണ് പൂവ്, ഞാൻ തന്നെയാണ് തോട്ടവും.&rdquo;
              </p>
              <p style={{
                fontFamily: 'Griffiths, Georgia, serif',
                fontStyle: 'italic',
                fontSize: 18,
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 2px 12px rgba(0,0,0,0.4)',
              }}>
                &ldquo;I myself am the flower, and I myself am the garden.&rdquo;
              </p>
            </div>

            {/* Companion Link */}
            <div style={{ marginTop: 32 }}>
              <span onClick={startReflection} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontStyle: 'italic', fontFamily: 'Georgia, serif', borderBottom: '1px dashed rgba(255,255,255,0.3)', paddingBottom: 2 }}>
                reflect with a companion
              </span>
            </div>
          </div>
        ) : (
          /* ── REFLECTION COMPANION NOTEBOOK SHEET ── */
          <div 
            className="journal-canvas paper-texture"
            style={{
              width: '90%',
              maxWidth: 500,
              height: '80vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '36px 32px 28px',
              animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              zIndex: 100
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, borderBottom: '1px solid var(--paper-dark)', paddingBottom: 16 }}>
              <div>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: 'var(--sepia)' }}>Companion</p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 300, color: 'var(--ink)' }}>Reflective Dialogue</h2>
              </div>
              <button 
                onClick={() => setShowReflector(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--ink-light)', fontSize: 18, cursor: 'pointer', opacity: 0.6 }}
              >
                ✕
              </button>
            </div>

            {/* Message Area */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, paddingRight: 8, marginBottom: 20 }}>
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.role === 'user' ? 'var(--paper)' : 'transparent',
                    border: msg.role === 'user' ? '1px solid var(--paper-dark)' : 'none',
                    borderRadius: 16,
                    padding: msg.role === 'user' ? '12px 18px' : '0',
                    fontFamily: msg.role === 'user' ? 'sans-serif' : 'Georgia, serif',
                    fontStyle: msg.role === 'user' ? 'normal' : 'italic',
                    fontSize: msg.role === 'user' ? 14 : 17,
                    lineHeight: 1.6,
                    color: 'var(--ink-light)',
                    animation: 'fadeInUp 0.4s ease forwards',
                  }}
                >
                  {msg.content}
                </div>
              ))}
              {loadingQuestion && (
                <div style={{ fontStyle: 'italic', color: 'var(--sepia-light)', fontSize: 14, fontFamily: 'Georgia, serif' }}>
                  Gently thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input & Footer actions */}
            {messages[messages.length - 1]?.content === "I think there is a story hidden in what you just shared." ? (
              <button
                onClick={portToEditor}
                style={{
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  border: 'none',
                  borderRadius: 999,
                  padding: '14px 0',
                  width: '100%',
                  fontFamily: 'Georgia, serif',
                  fontSize: 16,
                  fontStyle: 'italic',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(28,20,16,0.15)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Continue This Thought
              </button>
            ) : (
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Type your response..."
                  className="notebook-input"
                  style={{ flex: 1, padding: '12px 0', fontSize: 15 }}
                  disabled={loadingQuestion}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || loadingQuestion}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--sepia)',
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: 15,
                    cursor: inputText.trim() ? 'pointer' : 'default',
                    opacity: inputText.trim() ? 1 : 0.4,
                  }}
                >
                  Reply
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          zIndex: 10,
          textAlign: 'center',
        }}>
          <a
            href="https://linkedin.com/in/aaditajay"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: 11,
              textDecoration: 'none',
              letterSpacing: '0.06em',
            }}
          >
            Contact Developer
          </a>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onSuccess={() => {
            setShowAuth(false)
            supabase.auth.getUser().then(({ data }) => setUser(data.user))
          }}
          onClose={() => setShowAuth(false)}
        />
      )}

    </main>
  )
}