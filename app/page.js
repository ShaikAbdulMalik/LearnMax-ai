'use client'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles, BrainCircuit, BookOpen, ClipboardCheck, Layers3, Route as RouteIcon, Video, ArrowRight, ChevronRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UserBadge from '@/components/learnmax/UserBadge'
import LearnMaxLogo from '@/components/LearnMaxLogo'

function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute -top-40 -left-24 h-[520px] w-[520px] rounded-full bg-violet-500/30 blur-3xl aurora-1" />
      <div className="absolute top-1/3 -right-24 h-[520px] w-[520px] rounded-full bg-fuchsia-500/25 blur-3xl aurora-2" />
      <div className="absolute bottom-0 left-1/3 h-[520px] w-[520px] rounded-full bg-blue-500/25 blur-3xl aurora-3" />
    </div>
  )
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <LearnMaxLogo variant="compact" className="h-9 w-9" />
          <span className="font-bold text-lg tracking-tight">LearnMax<span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">.ai</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#agents" className="hover:text-foreground transition-colors">Agents</a>
          <a href="#topics" className="hover:text-foreground transition-colors">Topics</a>
        </nav>
        <UserBadge />
      </div>
    </header>
  )
}

function StaggerHeadline({ children }) {
  const reduce = useReducedMotion()
  const words = String(children).split(' ')
  return (
    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
      {words.map((w, i) => (
        <motion.span key={i}
          initial={reduce ? false : { opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: 0.05 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block mr-[0.28em]"
        >
          {w === 'minutes' ? <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 bg-clip-text text-transparent">{w}</span> : w}
        </motion.span>
      ))}
    </h1>
  )
}

function Hero() {
  return (
    <section className="relative container pt-16 md:pt-24 pb-24 text-center">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-muted-foreground mb-8">
        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" /></span>
        Multi-agent AI · personalized to how you learn
      </motion.div>
      <StaggerHeadline>Learn any topic in minutes, not months</StaggerHeadline>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Describe a topic. LearnMax dynamically assembles a team of AI agents to generate a lesson, quiz, flashcards, roadmap, recommendations and videos — tailored to your level and style.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }} className="mt-10 flex items-center justify-center gap-3">
        <Link href="/dashboard">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button size="lg" className="gap-2 h-12 px-6 text-base bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-violet-500/10">
              Start learning <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </Link>
        <a href="#agents"><Button size="lg" variant="ghost" className="gap-2 h-12 px-6 text-base text-muted-foreground hover:text-foreground">See the agents</Button></a>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }} className="mt-16 relative max-w-4xl mx-auto">
        <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-blue-500/30 blur-2xl rounded-3xl" />
        <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" /><span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" /><span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
            <span className="ml-3 text-xs text-muted-foreground font-mono">learnmax.ai / generate</span>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-4 text-left">
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Request</div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-3 font-mono text-xs leading-relaxed">
                <div><span className="text-muted-foreground">topic:</span> “Java inheritance”</div>
                <div><span className="text-muted-foreground">level:</span> beginner</div>
                <div><span className="text-muted-foreground">outputs:</span> lesson · quiz · roadmap</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Agents assembled</div>
              {[{ n:'Planner', c:'from-violet-500 to-fuchsia-500' },{ n:'Tutor', c:'from-fuchsia-500 to-pink-500' },{ n:'Quiz', c:'from-blue-500 to-cyan-500' },{ n:'Roadmap', c:'from-emerald-500 to-teal-500' }].map((a, i) => (
                <motion.div key={a.n} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.12 }} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 p-2.5">
                  <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${a.c}`} />
                  <span className="text-sm font-medium">{a.n} Agent</span>
                  <span className="ml-auto text-[10px] font-mono uppercase text-emerald-500">completed</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function TopicsMarquee() {
  const TOPICS = ['Java inheritance','SQL joins','Machine learning basics','React hooks','Kubernetes pods','Financial ratios','Cognitive biases','Photosynthesis','Fourier transforms','Git rebase','REST vs GraphQL','Recursion','Big-O notation','Options pricing','CRISPR']
  const row = [...TOPICS, ...TOPICS]
  return (
    <section id="topics" className="py-16 border-y border-border/40 bg-muted/20">
      <div className="container text-center mb-6"><p className="text-sm text-muted-foreground">Learn anything — from CS to finance to biology</p></div>
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track flex gap-3 w-max">
          {row.map((t, i) => (<div key={i} className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border/60 bg-background/60 backdrop-blur px-4 py-2 text-sm"><Sparkles className="h-3.5 w-3.5 text-violet-500" />{t}</div>))}
        </div>
      </div>
    </section>
  )
}

const AGENTS = [
  { name:'Planner Agent', desc:'Designs the learning structure and objectives.', icon: BrainCircuit, tint:'from-violet-500 to-fuchsia-500' },
  { name:'Tutor Agent', desc:'Delivers the personalized lesson with examples.', icon: BookOpen, tint:'from-fuchsia-500 to-pink-500' },
  { name:'Quiz Agent', desc:'Generates a 5-question mixed-format quiz.', icon: ClipboardCheck, tint:'from-blue-500 to-cyan-500' },
  { name:'Flashcard Agent', desc:'Produces 5 concise revision flashcards.', icon: Layers3, tint:'from-emerald-500 to-teal-500' },
  { name:'Roadmap Agent', desc:'Builds a step-by-step learning roadmap.', icon: RouteIcon, tint:'from-amber-500 to-orange-500' },
  { name:'Recommendation Agent', desc:'Suggests what to learn next.', icon: Sparkles, tint:'from-purple-500 to-indigo-500' },
  { name:'Video Agent', desc:'Finds relevant YouTube tutorials.', icon: Video, tint:'from-red-500 to-rose-500' },
]

function AgentsShowcase() {
  return (
    <section id="agents" className="container py-24">
      <div className="text-center mb-14">
        <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl md:text-5xl font-bold tracking-tight">
          7 specialists, <span className="text-shimmer">orchestrated on demand</span>
        </motion.h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Only the agents your request needs will run — nothing more, nothing less.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AGENTS.map((a, i) => (
          <motion.div key={a.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }} whileHover={{ y: -6 }} className="group relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-5 overflow-hidden">
            <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${a.tint} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`} />
            <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${a.tint} flex items-center justify-center shadow-lg mb-4`}><a.icon className="h-5 w-5 text-white" /></div>
            <h3 className="font-semibold">{a.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{a.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="container pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-blue-500/15 p-10 md:p-16 text-center">
        <div className="absolute inset-0 bg-dots opacity-40" />
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to learn something new?</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Sign up in 10 seconds. Type a topic. Get your bundle in under a minute.</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/login?mode=signup"><motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block"><Button size="lg" className="gap-2 h-12 px-6 bg-foreground text-background hover:bg-foreground/90">Create free account <ChevronRight className="h-4 w-4" /></Button></motion.div></Link>
            <Link href="/login"><Button size="lg" variant="outline" className="h-12 px-6">Sign in</Button></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div>© {new Date().getFullYear()} LearnMax.ai — All rights reserved.</div>
        <div>Built with Next.js · Supabase · Hugging Face · Framer Motion</div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="min-h-screen relative">
      <Aurora />
      <Nav />
      <Hero />
      <TopicsMarquee />
      <AgentsShowcase />
      <CTA />
      <Footer />
    </div>
  )
}
