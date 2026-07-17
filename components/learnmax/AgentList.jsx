'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Check, X, CircleDashed, SkipForward, BrainCircuit, BookOpen, ClipboardCheck, Layers3, Route as RouteIcon, Sparkles, Video, Feather } from 'lucide-react'

const STYLE = {
  planner:        { icon: BrainCircuit,    tint: 'from-violet-500 to-fuchsia-500' },
  tutor:          { icon: BookOpen,        tint: 'from-fuchsia-500 to-pink-500' },
  quiz:           { icon: ClipboardCheck,  tint: 'from-blue-500 to-cyan-500' },
  flashcard:      { icon: Layers3,         tint: 'from-emerald-500 to-teal-500' },
  roadmap:        { icon: RouteIcon,       tint: 'from-amber-500 to-orange-500' },
  recommendation: { icon: Sparkles,        tint: 'from-purple-500 to-indigo-500' },
  video:          { icon: Video,           tint: 'from-red-500 to-rose-500' },
  story:          { icon: Feather,         tint: 'from-sky-500 to-blue-600' },
}

function Pill({ status }) {
  const map = {
    queued:    { icon: CircleDashed, label: 'Queued',    cls: 'text-muted-foreground bg-muted' },
    running:   { icon: Loader2,      label: 'Running',   cls: 'text-violet-600 dark:text-violet-300 bg-violet-500/10', spin: true },
    completed: { icon: Check,        label: 'Completed', cls: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10' },
    failed:    { icon: X,            label: 'Failed',    cls: 'text-destructive bg-destructive/10' },
    skipped:   { icon: SkipForward,  label: 'Skipped',   cls: 'text-muted-foreground bg-muted' },
  }
  const s = map[status] || map.queued
  const I = s.icon
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}><I className={`h-3 w-3 ${s.spin ? 'animate-spin' : ''}`} />{s.label}</span>
}

export default function AgentList({ agents }) {
  if (!agents?.length) return null
  const order = agents.map(a => (a.agent_name || a.name || '').split(' ')[0]).join(' → ')
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent activity timeline</h3>
        <span className="text-xs text-muted-foreground font-mono">{order}</span>
      </div>
      <motion.div className="grid md:grid-cols-2 gap-3" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}>
        <AnimatePresence>
          {agents.map((a) => {
            const type = a.agent_type || a.id
            const name = a.agent_name || a.name
            const reason = a.selection_reason || a.reason
            const style = STYLE[type] || STYLE.planner
            const I = style.icon
            const ms = a.execution_time_ms
            return (
              <motion.div key={type} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }} layout>
                <div className={`glow-border rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-4 h-full transition-shadow ${a.status === 'running' ? 'shadow-lg shadow-violet-500/10' : ''}`} data-active={a.status === 'running' ? 'true' : 'false'}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${style.tint} flex items-center justify-center shadow-md shrink-0`}><I className="h-5 w-5 text-white" /></div>
                      <div>
                        <h4 className="font-semibold leading-tight">{name}</h4>
                        {reason && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{reason}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Pill status={a.status} />
                      {typeof ms === 'number' && ms > 0 && <span className="text-[10px] text-muted-foreground font-mono">{(ms/1000).toFixed(1)}s</span>}
                    </div>
                  </div>
                  {a.error_message && <p className="text-xs mt-2 text-destructive">{a.error_message}</p>}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
