'use client'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import RequestForm from '@/components/learnmax/RequestForm'
import AgentList from '@/components/learnmax/AgentList'
import UserBadge from '@/components/learnmax/UserBadge'
import LearnMaxLogo from '@/components/LearnMaxLogo'

function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[900px] rounded-full bg-violet-500/15 blur-3xl aurora-1" />
      <div className="absolute top-1/2 -right-32 h-[420px] w-[520px] rounded-full bg-blue-500/15 blur-3xl aurora-2" />
    </div>
  )
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <LearnMaxLogo variant="compact" className="h-9 w-9" />
          <span className="font-bold text-lg tracking-tight">LearnMax<span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">.ai</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> My Learning</Link>
          <UserBadge />
        </div>
      </div>
    </header>
  )
}

function Inner() {
  const router = useRouter()
  const search = useSearchParams()
  const prefilledTopic = search.get('topic') || ''
  const prefilledLevel = search.get('level') || ''
  const [submitting, setSubmitting] = useState(false)
  const [liveAgents, setLiveAgents] = useState([])
  const [error, setError] = useState('')

  const handleSubmit = async (payload) => {
    setSubmitting(true); setError(''); setLiveAgents([])
    try {
      const oRes = await fetch('/api/orchestrate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const oData = await oRes.json()
      if (!oRes.ok) throw new Error(oData?.error || 'Failed to orchestrate')
      setLiveAgents(oData.agents.map((a, i) => ({ ...a, status: i === 0 ? 'running' : 'queued' })))
      const gRes = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const gData = await gRes.json()
      if (gRes.status === 401) { router.replace('/login?next=/generate'); return }
      if (!gRes.ok) throw new Error(gData?.error || 'Generation failed')
      router.push(`/project/${gData.project.id}`)
    } catch (e) { setError(e?.message || 'Something went wrong') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      <Aurora />
      <TopBar />
      <main className="container pb-24 pt-10 flex-1">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live · Hugging Face + Supabase
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Generate your learning bundle</h1>
            <p className="text-muted-foreground mt-2">Tell us what to learn. LearnMax orchestrates only the required agents.</p>
          </motion.div>

          <RequestForm onSubmit={handleSubmit} submitting={submitting} initialTopic={prefilledTopic} initialLevel={prefilledLevel} />

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive p-4 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" /><div className="text-sm">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {submitting && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
              <AgentList agents={liveAgents} />
              <div className="rounded-2xl border border-border/60 p-5 bg-card/60 backdrop-blur overflow-hidden">
                <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-violet-500 to-transparent animate-beam" />
                </div>
                <p className="text-xs text-muted-foreground mt-3">Agents are working. This typically takes 20–60 seconds. You'll be taken to your saved project when done.</p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <footer className="border-t border-border/40 py-6"><div className="container text-center text-xs text-muted-foreground">© {new Date().getFullYear()} LearnMax.ai — All rights reserved.</div></footer>
    </div>
  )
}

export default function GeneratePage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>}><Inner /></Suspense>
}
