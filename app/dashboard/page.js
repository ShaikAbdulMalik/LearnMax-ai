'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Search, Trash2, ArrowRight, BookOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UserBadge from '@/components/learnmax/UserBadge'
import LearnMaxLogo from '@/components/LearnMaxLogo'

function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[900px] rounded-full bg-violet-500/15 blur-3xl aurora-1" />
      <div className="absolute bottom-0 -right-24 h-[420px] w-[520px] rounded-full bg-fuchsia-500/15 blur-3xl aurora-2" />
    </div>
  )
}

export default function Dashboard() {
  const [projects, setProjects] = useState(null)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [confirmId, setConfirmId] = useState(null)

  const load = () => fetch('/api/projects').then(r => r.json()).then(d => setProjects(d.projects || []))
  useEffect(() => { load() }, [])

  const del = async (id) => { await fetch(`/api/projects/${id}`, { method: 'DELETE' }); setConfirmId(null); load() }

  const filtered = (projects || []).filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (q && !p.title.toLowerCase().includes(q.toLowerCase()) && !p.topic.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen relative flex flex-col">
      <Aurora />
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <LearnMaxLogo variant="compact" className="h-9 w-9" />
            <span className="font-bold text-lg tracking-tight">LearnMax<span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">.ai</span></span>
          </Link>
          <UserBadge />
        </div>
      </header>
      <main className="flex-1 container py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
            <p className="text-muted-foreground mt-1">Your saved learning bundles</p>
          </div>
          <Link href="/generate"><Button className="gap-2 bg-foreground text-background hover:bg-foreground/90"><Plus className="h-4 w-4" /> New bundle</Button></Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by title or topic" className="pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-sm">
            <option value="all">All statuses</option><option value="completed">Completed</option><option value="generating">Generating</option><option value="failed">Failed</option>
          </select>
        </div>

        {projects === null ? (
          <div className="text-center py-20 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-12 text-center">
            <BookOpen className="h-10 w-10 text-violet-500 mx-auto mb-3" />
            <h3 className="font-semibold">{projects.length === 0 ? 'No bundles yet' : 'No matching bundles'}</h3>
            <p className="text-sm text-muted-foreground mt-1">{projects.length === 0 ? 'Create your first personalized learning bundle.' : 'Try adjusting your search or filter.'}</p>
            {projects.length === 0 && <Link href="/generate"><Button className="mt-4 bg-foreground text-background hover:bg-foreground/90">Create your first bundle</Button></Link>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-5 flex flex-col hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{p.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.topic}</p>
                  </div>
                  <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : p.status === 'generating' ? 'bg-violet-500/10 text-violet-600' : 'bg-destructive/10 text-destructive'}`}>{p.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{p.learner_level}</span>
                  {(p.requested_outputs || []).map((o, idx) => <span key={idx} className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{o}</span>)}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</div>
                <div className="mt-4 pt-3 border-t border-border/60 flex gap-2">
                  <Link href={`/project/${p.id}`} className="flex-1"><Button size="sm" className="w-full gap-1 bg-foreground text-background hover:bg-foreground/90">Open <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
                  <Button size="sm" variant="outline" onClick={() => setConfirmId(p.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {confirmId && (
          <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setConfirmId(null)}>
            <div className="bg-card border border-border/60 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold">Delete bundle?</h3>
              <p className="text-sm text-muted-foreground mt-1">This can't be undone.</p>
              <div className="mt-4 flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
                <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => del(confirmId)}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="border-t border-border/40 py-6"><div className="container text-center text-xs text-muted-foreground">© {new Date().getFullYear()} LearnMax.ai — All rights reserved.</div></footer>
    </div>
  )
}
