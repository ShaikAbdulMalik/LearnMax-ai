'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Wand2, BookOpen } from 'lucide-react'

const LEVELS = [{v:'beginner',label:'Beginner'},{v:'intermediate',label:'Intermediate'},{v:'advanced',label:'Advanced'}]
const DURATIONS = [15, 30, 60]
const STYLES = [{v:'concise',label:'Concise notes'},{v:'examples',label:'Examples'},{v:'practice',label:'Practice'},{v:'step-by-step',label:'Step-by-step'}]
const OUTPUTS = [
  { v:'lesson', label:'Lesson' },
  { v:'quiz', label:'Quiz' },
  { v:'flashcards', label:'Flashcards' },
  { v:'roadmap', label:'Roadmap' },
  { v:'recommendations', label:'Recommendations' },
  { v:'videos', label:'Videos' },
  { v:'story', label: '📖 Story Mode' },
]
const STORY_STYLES = [
  { v:'adventure', label:'Adventure' },{ v:'mystery', label:'Mystery' },{ v:'sci-fi', label:'Sci-Fi' },
  { v:'fantasy', label:'Fantasy' },{ v:'detective', label:'Detective' },{ v:'historical', label:'Historical' },
  { v:'classroom', label:'Classroom' },{ v:'real-world', label:'Real World' },{ v:'corporate', label:'Corporate' },
]

function Chip({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50'}`}>{children}</button>
}

export default function RequestForm({ onSubmit, submitting, initialTopic = '', initialLevel = '' }) {
  const [topic, setTopic] = useState(initialTopic || 'Java inheritance')
  const [level, setLevel] = useState(['beginner','intermediate','advanced'].includes(initialLevel) ? initialLevel : 'beginner')
  const [duration, setDuration] = useState(30)
  const [learningStyle, setLearningStyle] = useState('examples')
  const [learningGoal, setLearningGoal] = useState('')
  const [outputs, setOutputs] = useState(['lesson','quiz','flashcards'])
  const [storyStyle, setStoryStyle] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('learnmax_story_style') : null) || 'adventure')
  const [errors, setErrors] = useState({})

  const toggle = (v) => setOutputs(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])
  const showStoryStyle = outputs.includes('story')

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!topic || topic.trim().length < 2) errs.topic = 'Topic must contain at least two characters.'
    if (!outputs.length) errs.outputs = 'Select at least one output.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    if (showStoryStyle && typeof window !== 'undefined') localStorage.setItem('learnmax_story_style', storyStyle)
    onSubmit({ topic: topic.trim(), level, duration, learningStyle, learningGoal: learningGoal.trim(), outputs, storyStyle })
  }

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={submit} className="space-y-6" noValidate>
          <div>
            <Label htmlFor="topic" className="mb-2 block">Topic</Label>
            <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. SQL joins" />
            {errors.topic && <p className="mt-1 text-xs text-destructive">{errors.topic}</p>}
          </div>
          <div>
            <Label htmlFor="goal" className="mb-2 block">Learning goal (optional)</Label>
            <Input id="goal" value={learningGoal} onChange={(e) => setLearningGoal(e.target.value)} placeholder="e.g. pass a certification, build a project" />
          </div>
          <div><Label className="mb-2 block">Knowledge level</Label><div className="flex flex-wrap gap-2">{LEVELS.map(l => <Chip key={l.v} active={level === l.v} onClick={() => setLevel(l.v)}>{l.label}</Chip>)}</div></div>
          <div><Label className="mb-2 block">Duration</Label><div className="flex flex-wrap gap-2">{DURATIONS.map(d => <Chip key={d} active={duration === d} onClick={() => setDuration(d)}>{d} minutes</Chip>)}</div></div>
          <div><Label className="mb-2 block">Learning style</Label><div className="flex flex-wrap gap-2">{STYLES.map(s => <Chip key={s.v} active={learningStyle === s.v} onClick={() => setLearningStyle(s.v)}>{s.label}</Chip>)}</div></div>
          <div>
            <Label className="mb-2 block">Requested outputs</Label>
            <div className="grid sm:grid-cols-3 gap-2">
              {OUTPUTS.map(o => (
                <label key={o.v} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${outputs.includes(o.v) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                  <Checkbox checked={outputs.includes(o.v)} onCheckedChange={() => toggle(o.v)} aria-label={o.label} />
                  <span className="text-sm font-medium">{o.label}</span>
                </label>
              ))}
            </div>
            {errors.outputs && <p className="mt-1 text-xs text-destructive">{errors.outputs}</p>}
          </div>

          <AnimatePresence>
            {showStoryStyle && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="rounded-xl border border-blue-500/40 bg-blue-500/5 p-4">
                  <Label className="mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300"><BookOpen className="h-4 w-4" /> Story style</Label>
                  <div className="flex flex-wrap gap-2">{STORY_STYLES.map(s => <Chip key={s.v} active={storyStyle === s.v} onClick={() => setStoryStyle(s.v)}>{s.label}</Chip>)}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" disabled={submitting} size="lg" className="gap-2 w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</> : <><Wand2 className="h-4 w-4" />Generate learning bundle</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
