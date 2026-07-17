'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronLeft, ChevronRight, Users, Sparkles, Volume2, Trophy, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StoryView({ story }) {
  const [chapterIdx, setChapterIdx] = useState(0)
  const [narrationOpen, setNarrationOpen] = useState(false)
  if (!story) return null
  const chapters = story.chapters || []
  const current = chapters[chapterIdx]
  const total = chapters.length
  const progress = total ? Math.round(((chapterIdx + 1) / total) * 100) : 0

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-500">
          <BookOpen className="h-5 w-5" />
          <span className="text-xs font-mono uppercase tracking-wider">Story mode</span>
          {story.style && <span className="text-[10px] uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-600 px-2 py-0.5">{story.style}</span>}
        </div>
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" /> ~{story.estimatedReadingMinutes || 5} min</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold mt-2">{story.title}</h2>

      {/* Characters */}
      {story.characters?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {story.characters.map((c, i) => (
            <div key={i} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground">— {c.role}</span>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-6 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Chapter {chapterIdx + 1} of {total}</span>
        <span>{progress}%</span>
      </div>

      {/* Chapter card */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.article
            key={current.number}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-6 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent p-5"
          >
            <div className="text-xs font-mono uppercase tracking-wider text-blue-500">Chapter {current.number}</div>
            <h3 className="text-xl font-bold mt-1">{current.title}</h3>
            <p className="mt-3 text-foreground/90 leading-relaxed whitespace-pre-wrap">{current.content}</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                <div className="text-[10px] uppercase tracking-wider text-blue-600 mb-1">Concept</div>
                <div className="text-sm font-medium">{current.concept}</div>
              </div>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <div className="text-[10px] uppercase tracking-wider text-emerald-600 mb-1">Takeaway</div>
                <div className="text-sm font-medium">{current.takeaway}</div>
              </div>
            </div>
          </motion.article>
        )}
      </AnimatePresence>

      {/* Nav */}
      <div className="mt-5 flex items-center justify-between">
        <Button variant="outline" size="sm" disabled={chapterIdx === 0} onClick={() => setChapterIdx(i => Math.max(0, i - 1))} className="gap-1">
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <div className="flex gap-1">
          {chapters.map((_, i) => (
            <button key={i} onClick={() => setChapterIdx(i)} className={`h-2 w-2 rounded-full transition-colors ${i === chapterIdx ? 'bg-blue-500' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'}`} />
          ))}
        </div>
        <Button size="sm" disabled={chapterIdx >= total - 1} onClick={() => setChapterIdx(i => Math.min(total - 1, i + 1))} className="gap-1">
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Narration */}
      {story.narration && (
        <div className="mt-6">
          <Button variant="outline" size="sm" onClick={() => setNarrationOpen(o => !o)} className="gap-2">
            <Volume2 className="h-3.5 w-3.5" /> {narrationOpen ? 'Hide narration' : 'Show narration (audiobook-style)'}
          </Button>
          <AnimatePresence>
            {narrationOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 rounded-lg border border-border/60 bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {story.narration}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Memory reinforcement */}
      {(story.reflectionQuestions?.length || story.recap?.length || story.challengeQuestion) && (
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {story.reflectionQuestions?.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-blue-500" /><h4 className="font-semibold text-sm">Reflect</h4></div>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-foreground/90">{story.reflectionQuestions.map((q, i) => <li key={i}>{q}</li>)}</ol>
            </div>
          )}
          {story.recap?.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 mb-2"><BookOpen className="h-4 w-4 text-blue-500" /><h4 className="font-semibold text-sm">Quick recap</h4></div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">{story.recap.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
          {story.challengeQuestion && (
            <div className="md:col-span-2 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 mb-1"><Trophy className="h-4 w-4 text-amber-500" /><h4 className="font-semibold text-sm">Challenge</h4></div>
              <p className="text-sm">{story.challengeQuestion}</p>
            </div>
          )}
        </div>
      )}

      {story.moral && <p className="mt-6 text-center text-sm italic text-muted-foreground">“{story.moral}”</p>}
    </div>
  )
}
