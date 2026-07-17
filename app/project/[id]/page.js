'use client'
import { useEffect, useMemo, useState, use as usePromise } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, Info, BookOpen, Feather, ClipboardCheck, Layers3, Route as RouteIcon, Sparkles, Video } from 'lucide-react'
import LessonView from '@/components/learnmax/LessonView'
import QuizView from '@/components/learnmax/QuizView'
import FlashcardView from '@/components/learnmax/FlashcardView'
import RoadmapView from '@/components/learnmax/RoadmapView'
import RecommendationsView from '@/components/learnmax/RecommendationsView'
import VideosView from '@/components/learnmax/VideosView'
import StoryView from '@/components/learnmax/StoryView'
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

export default function ProjectPage({ params }) {
  const { id } = usePromise(params)
  const [state, setState] = useState({ loading: true, project: null, runs: [], error: '' })
  const [tab, setTab] = useState(null)

  useEffect(() => {
    fetch(`/api/projects/${id}`).then(async r => {
      const d = await r.json()
      if (!r.ok) return setState({ loading: false, error: d.error || 'Failed to load' })
      setState({ loading: false, project: d.project, runs: d.agent_runs || [], error: '' })
    })
  }, [id])

  const p = state.project

  const tabs = useMemo(() => {
    if (!p) return []
    const t = []
    if (p.lesson) t.push({ id: 'lesson', label: 'Lesson', icon: BookOpen })
    if (p.story) t.push({ id: 'story', label: 'Story Mode', icon: Feather })
    if (p.quiz) t.push({ id: 'quiz', label: 'Quiz', icon: ClipboardCheck })
    if (p.flashcards) t.push({ id: 'flashcards', label: 'Flashcards', icon: Layers3 })
    if (p.roadmap) t.push({ id: 'roadmap', label: 'Roadmap', icon: RouteIcon })
    if (p.recommendations) t.push({ id: 'recs', label: 'Recommendations', icon: Sparkles })
    if (p.videos) t.push({ id: 'videos', label: 'Videos', icon: Video })
    return t
  }, [p])

  useEffect(() => { if (!tab && tabs.length) setTab(tabs[0].id) }, [tabs, tab])

  return (
    <div className="min-h-screen relative flex flex-col">
      <Aurora />
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <LearnMaxLogo variant="compact" className="h-9 w-9" />
            <span className="font-bold text-lg tracking-tight">LearnMax<span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">.ai</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">My Learning</Link>
            <UserBadge />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8 pb-24">
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"><ArrowLeft className="h-3 w-3" /> Back to My Learning</Link>
        {state.loading ? (
          <div className="text-center py-20 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        ) : state.error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 text-destructive p-4">{state.error}</div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{p.title}</h1>
              <p className="text-muted-foreground mt-1">{p.learner_level} · {p.available_minutes}m · {p.learning_style}</p>
            </div>

            {state.runs?.length > 0 && <AgentList agents={state.runs} />}

            {p.status === 'failed' && <div className="rounded-xl border border-destructive/40 bg-destructive/10 text-destructive p-3 flex items-start gap-2 text-sm"><Info className="h-4 w-4 mt-0.5" />Generation failed. Partial content may still appear below.</div>}

            {/* Tabs */}
            {tabs.length > 0 && (
              <div className="flex flex-wrap gap-1 p-1 rounded-xl border border-border/60 bg-card/60 backdrop-blur">
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 ${tab === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    {tab === t.id && <motion.span layoutId="tabbg" className="absolute inset-0 rounded-lg bg-background shadow-sm border border-border/60" transition={{ type:'spring', stiffness: 400, damping: 30 }} />}
                    <span className="relative z-10 inline-flex items-center gap-1.5"><t.icon className="h-3.5 w-3.5" />{t.label}</span>
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div key={tab || 'empty'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {tab === 'lesson' && p.lesson && <LessonView lesson={p.lesson} />}
                {tab === 'story' && p.story && <StoryView story={p.story} />}
                {tab === 'quiz' && p.quiz && <QuizView quiz={p.quiz} />}
                {tab === 'flashcards' && p.flashcards && <FlashcardView flashcards={p.flashcards} />}
                {tab === 'roadmap' && p.roadmap && <RoadmapView roadmap={p.roadmap} projectId={p.id} />}
                {tab === 'recs' && p.recommendations && <RecommendationsView recommendations={p.recommendations} />}
                {tab === 'videos' && p.videos && <VideosView videos={p.videos} />}
              </motion.div>
            </AnimatePresence>

            <p className="text-xs text-muted-foreground">Created {new Date(p.created_at).toLocaleString()}</p>
          </motion.div>
        )}
      </main>
      <footer className="border-t border-border/40 py-6"><div className="container text-center text-xs text-muted-foreground">© {new Date().getFullYear()} LearnMax.ai — All rights reserved.</div></footer>
    </div>
  )
}
