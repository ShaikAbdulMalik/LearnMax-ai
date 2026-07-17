'use client'
import { useRouter } from 'next/navigation'
import { Sparkles, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RecommendationsView({ recommendations }) {
  const router = useRouter()
  const items = recommendations?.recommendations || []
  if (!items.length) return null

  const learnNext = (rec) => {
    const q = new URLSearchParams({ topic: rec.topic, level: rec.difficulty || 'intermediate' })
    router.push('/generate?' + q.toString())
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 md:p-8">
      <div className="flex items-center gap-2 text-[#3b8ad9]">
        <Sparkles className="h-5 w-5" />
        <span className="text-xs font-mono uppercase tracking-wider">Recommended next</span>
      </div>
      <h2 className="text-2xl font-bold mt-1 text-[#0a3663]">What to learn next</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-3">
        {items.map((r, i) => (
          <div key={i} className="rounded-xl border border-blue-100 bg-slate-50 p-4 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-[#0a3663]">{r.topic}</h3>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">{r.difficulty}</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">{r.description}</p>
            <p className="text-xs text-slate-500 mt-2"><span className="font-medium text-slate-700">Why:</span> {r.reason}</p>
            <div className="mt-auto pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {r.estimatedMinutes}m</span>
              <Button size="sm" onClick={() => learnNext(r)} className="gap-1 bg-gradient-to-r from-[#0a3663] to-[#3b8ad9] hover:opacity-90">
                Learn next <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
