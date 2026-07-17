'use client'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Mail, Lock, ArrowLeft, AlertCircle, Sparkles, Shield, Zap, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import LearnMaxLogo from '@/components/LearnMaxLogo'

function LoginInner() {
  const params = useSearchParams()
  const router = useRouter()
  const initialMode = params.get('mode') === 'signup' ? 'signup' : 'signin'
  const next = params.get('next') || '/dashboard'
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(''); const [notice, setNotice] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => { if (data.user) window.location.href = next })
  }, [next, router])

  const submit = async (e) => {
    e.preventDefault(); setError(''); setNotice(''); setSubmitting(true)
    const supabase = createClient()
    try {
      if (mode === 'signup') {
        // Prefer server-side signup (auto-confirms email via service-role key)
        // so users can sign in immediately without waiting for confirmation emails.
        let serverMode = null
        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name: name }),
          })
          const j = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(j?.error || 'Signup failed')
          serverMode = j.mode
        } catch (serverErr) {
          // Network / server error — surface it
          throw serverErr
        }

        if (serverMode === 'confirmed' || serverMode === 'already-exists') {
          // User exists & is confirmed — sign them in.
          const { error: siErr } = await supabase.auth.signInWithPassword({ email, password })
          if (siErr) {
            if (serverMode === 'already-exists') throw new Error('This email is already registered. Please sign in.')
            throw siErr
          }
          window.location.href = next
          return
        }

        // Fallback: service-role key not configured — use standard client signUp.
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name || email.split('@')[0] } } })
        if (error) throw error
        if (data.session) { window.location.href = next; return }
        // Try auto-signin (works when email confirmation is disabled in Supabase).
        const { error: siErr } = await supabase.auth.signInWithPassword({ email, password })
        if (!siErr) { window.location.href = next; return }
        setNotice('Account created. Please check your email to verify, then sign in.'); setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = next
      }
    } catch (e) { setError(e?.message || 'Authentication failed.') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute -top-32 -left-24 h-[520px] w-[520px] rounded-full bg-violet-500/25 blur-3xl aurora-1" />
        <div className="absolute top-1/3 -right-24 h-[520px] w-[520px] rounded-full bg-fuchsia-500/20 blur-3xl aurora-2" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl aurora-3" />
      </div>
      <header className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <LearnMaxLogo variant="compact" className="h-9 w-9" />
          <span className="font-bold text-lg tracking-tight">LearnMax<span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">.ai</span></span>
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link>
      </header>
      <main className="flex-1 container flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="hidden md:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground mb-4"><Sparkles className="h-3.5 w-3.5 text-violet-500" />Personalized AI learning</div>
            <h2 className="text-4xl font-bold tracking-tight leading-tight">Your <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 bg-clip-text text-transparent">personal AI tutor</span>, one sign-in away.</h2>
            <p className="mt-4 text-muted-foreground">A single email + password unlocks a dynamic multi-agent pipeline that adapts every lesson, quiz, flashcard, roadmap, recommendation and video to how you learn.</p>
            <ul className="mt-8 space-y-3 text-sm">
              {[{ icon: Zap, text: 'Lessons generated in under a minute' },{ icon: CheckCircle2, text: 'Zod-validated content — no hallucinated garbage' },{ icon: Shield, text: 'Your bundles are saved securely to your account' }].map((f, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shrink-0 mt-0.5"><f.icon className="h-4 w-4" /></div>
                  <span className="text-foreground/90">{f.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-blue-500/20 blur-2xl rounded-3xl -z-10" />
            <div className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-2xl p-8">
              <div className="flex flex-col items-center mb-4"><LearnMaxLogo variant="compact" className="h-14 w-14" /></div>
              <h1 className="text-center text-2xl font-bold tracking-tight">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
              <p className="text-center text-sm text-muted-foreground mt-1">{mode === 'signin' ? 'Sign in to continue learning' : 'Start learning smarter, in minutes'}</p>
              <div className="mt-6 grid grid-cols-2 p-1 rounded-xl border border-border/60 bg-muted/40">
                {['signin','signup'].map((m) => (
                  <button key={m} onClick={() => { setMode(m); setError('') }} className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${mode === m ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    {mode === m && <motion.span layoutId="authtab" className="absolute inset-0 rounded-lg bg-background shadow border border-border/60" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                    <span className="relative z-10">{m === 'signin' ? 'Sign in' : 'Sign up'}</span>
                  </button>
                ))}
              </div>
              {error && <div className="mt-4 text-xs rounded-lg border border-destructive/40 bg-destructive/10 text-destructive p-3 flex items-start gap-2"><AlertCircle className="h-4 w-4 mt-0.5" /><span>{error}</span></div>}
              {notice && <div className="mt-4 text-xs rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 p-3">{notice}</div>}
              <form onSubmit={submit} className="mt-4 space-y-3">
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="mt-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" /></div>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="pl-9" /></div>
                </div>
                <Button type="submit" disabled={submitting} className="w-full h-11 gap-2 bg-foreground text-background hover:bg-foreground/90">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}{mode === 'signin' ? 'Sign in' : 'Create account'}
                </Button>
              </form>
              <p className="mt-4 text-center text-xs text-muted-foreground">{mode === 'signin' ? "Don't have an account? " : 'Already have one? '}<button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-primary hover:underline font-medium">{mode === 'signin' ? 'Sign up' : 'Sign in'}</button></p>
            </div>
          </motion.div>
        </div>
      </main>
      <footer className="border-t border-border/40 py-4"><div className="container text-center text-xs text-muted-foreground">© {new Date().getFullYear()} LearnMax.ai — All rights reserved.</div></footer>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>}><LoginInner /></Suspense>
}
