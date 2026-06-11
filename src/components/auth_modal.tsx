'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

type Mode = 'signin' | 'signup' | 'otp'

interface AuthModalProps {
  onSuccess: () => void
  onClose: () => void
}

export default function AuthModal({ onSuccess, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  function reset() { setError(''); setOtp('') }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('fill in all fields.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    onSuccess()
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password) { setError('fill in all fields.'); return }
    setLoading(true); setError('')
    const { error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    })
    if (signUpError && !signUpError.message.includes('already registered')) {
      setError(signUpError.message); setLoading(false); return
    }
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email, options: { shouldCreateUser: false },
    })
    setLoading(false)
    if (otpError) { setError(otpError.message); return }
    setMode('otp')
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length < 6) { setError('enter the full code.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    setLoading(false)
    if (error) { setError(error.message); return }
    onSuccess()
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/wall` },
    })
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(20,20,20,0.85)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20,
          padding: '40px 36px', width: 360,
          boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: 14,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Sign in */}
        {mode === 'signin' && <>
          <p style={titleStyle}>sign in to post</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' }}>
            your poem will be shared to the wall after sign in
          </p>
          <GlassInput placeholder="email" value={email} onChange={setEmail} type="email" />
          <GlassInput placeholder="password" value={password} onChange={setPassword} type="password" />
          {error && <p style={errorStyle}>{error}</p>}
          <GlassButton onClick={handleSignIn} loading={loading}>sign in</GlassButton>
          <Divider />
          <GoogleButton onClick={handleGoogle} />
          <p style={switchStyle}>
            New user?{' '}
            <span onClick={() => { setMode('signup'); reset() }} style={linkStyle}>Create Account.</span>
          </p>
        </>}

        {/* Sign up */}
        {mode === 'signup' && <>
          <p style={titleStyle}>create account</p>
          <GlassInput placeholder="your name" value={name} onChange={setName} type="text" />
          <GlassInput placeholder="email" value={email} onChange={setEmail} type="email" />
          <GlassInput placeholder="password" value={password} onChange={setPassword} type="password" />
          {error && <p style={errorStyle}>{error}</p>}
          <GlassButton onClick={handleSignUp} loading={loading}>
            {loading ? 'sending code...' : 'create account'}
          </GlassButton>
          <Divider />
          <GoogleButton onClick={handleGoogle} />
          <p style={switchStyle}>
            Already have an account?{' '}
            <span onClick={() => { setMode('signin'); reset() }} style={linkStyle}>Sign In.</span>
          </p>
        </>}

        {/* OTP */}
        {mode === 'otp' && <>
          <p style={titleStyle}>check your email</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', lineHeight: 1.6 }}>
            we sent a code to<br />
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>{email}</span>
          </p>
          <input
            type="text" inputMode="numeric" maxLength={8}
            placeholder="00000000" value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            style={{
              background: 'rgba(180,180,180,0.18)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999, padding: '14px 20px',
              color: 'white', fontSize: 22, textAlign: 'center',
              outline: 'none', letterSpacing: '0.25em', width: '100%',
            }}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.length < 6}
            style={{
              background: otp.length >= 6 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '13px',
              color: otp.length >= 6 ? '#1a1a1a' : 'white', fontSize: 14,
              cursor: otp.length >= 6 ? 'pointer' : 'not-allowed',
              letterSpacing: '0.04em', transition: 'all 0.2s', opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'verifying...' : 'continue →'}
          </button>
          <button
            onClick={() => { setMode('signup'); reset() }}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer' }}
          >
            ← go back
          </button>
        </>}
      </div>
    </div>
  )
}

const titleStyle: React.CSSProperties = { color: 'white', fontSize: 20, textAlign: 'center', fontWeight: 300, letterSpacing: '0.04em' }
const errorStyle: React.CSSProperties = { color: '#ff6b6b', fontSize: 12, textAlign: 'center' }
const switchStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' }
const linkStyle: React.CSSProperties = { color: '#7dd3c8', cursor: 'pointer', textDecoration: 'underline' }

function GlassInput({ placeholder, value, onChange, type }: { placeholder: string; value: string; onChange: (v: string) => void; type: string }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      style={{ background: 'rgba(180,180,180,0.18)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999, padding: '12px 20px', color: 'white', fontSize: 14, outline: 'none', width: '100%' }} />
  )
}

function GlassButton({ children, onClick, loading }: { children: React.ReactNode; onClick: (e: React.FormEvent) => void; loading?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '13px', color: 'white', fontSize: 14, cursor: 'pointer', letterSpacing: '0.04em', opacity: loading ? 0.6 : 1 }}>
      {children}
    </button>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>OR</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
    </div>
  )
}

function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: '12px', color: 'white', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Sign In with Google
    </button>
  )
}