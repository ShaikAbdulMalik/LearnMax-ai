'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Route as RouteIcon, Check, Circle, CircleDot } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RoadmapView({ roadmap, projectId }) {
  const [progress, setProgress] = useState({}) // stepId -> status

  useEffect(() => {
    if (!projectId) return
    fetch(`/api/progress/${projectId}`).then(r => r.json()).then(d => {
      const map = {}
      ;(d.progress || []).forEach(p => { map[p.roadmap_step_id] = p.status })
      setProgress(map)
    }).catch(() => {})
  }, [projectId])

  if (!roadmap?.steps?.length) return null

  const setStatus = async (stepId, status) => {
    setProgress(p => ({ ...p, [stepId]: status }))
    if (!projectId) return
    fetch('/api/progress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, roadmap_step_id: stepId, status, progress_percent: status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0 })
    }).catch(() => {})
  }

  const iconFor = (s) => s === 'completed' ? Check : s === 'in_progress' ? CircleDot : Circle

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 md:p-8">
      <div className="flex items-center gap-2 text-[#3b8ad9]">
        <RouteIcon className="h-5 w-5" />
        <span className="text-xs font-mono uppercase tracking-wider">Learning roadmap</span>
      </div>
      <h2 className="text-2xl font-bold mt-1 text-[#0a3663]">{roadmap.title}</h2>
      {roadmap.totalMinutes ? <p className="text-sm text-slate-500 mt-1">~{roadmap.totalMinutes} minutes total</p> : null}

      <ol className="mt-6 relative border-l-2 border-blue-100 ml-4 space-y-6">
        {roadmap.steps.map((step, idx) => {
          const s = progress[step.id] || 'not_started'
          const I = iconFor(s)
          return (
            <motion.li key={step.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="ml-6">
              <span className={`absolute -left-3 flex items-center justify-center h-6 w-6 rounded-full ring-4 ring-white ${s === 'completed' ? 'bg-emerald-500 text-white' : s === 'in_progress' ? 'bg-[#3b8ad9] text-white' : 'bg-slate-200 text-slate-500'}`}>
                <I className="h-3.5 w-3.5" />
              </span>
              <div className="rounded-xl border border-blue-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[#0a3663]">Step {idx + 1}: {step.title}</h4>
                    {step.topics?.length ? <div className="mt-1 flex flex-wrap gap-1">{step.topics.map((t, i) => <span key={i} className="text-[10px] rounded-full bg-white border border-blue-100 px-2 py-0.5 text-slate-600">{t}</span>)}</div> : null}
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{step.estimatedMinutes}m</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {s !== 'in_progress' && <Button size="sm" variant="outline" onClick={() => setStatus(step.id, 'in_progress')}>Start</Button>}
                  {s !== 'completed' && <Button size="sm" onClick={() => setStatus(step.id, 'completed')} className="bg-emerald-600 hover:bg-emerald-700">Mark complete</Button>}
                  {s === 'completed' && <span className="text-xs text-emerald-700 font-medium">✓ Completed</span>}
                </div>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
