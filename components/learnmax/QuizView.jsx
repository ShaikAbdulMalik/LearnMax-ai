'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardCheck, Eye, EyeOff } from 'lucide-react'

export default function QuizView({ quiz }) {
  const [revealed, setRevealed] = useState({})
  if (!quiz?.questions?.length) return null

  const toggle = (i) => setRevealed(prev => ({ ...prev, [i]: !prev[i] }))

  return (
    <Card className="border-border/60">
      <CardContent className="p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-2 text-primary">
          <ClipboardCheck className="h-5 w-5" />
          <span className="text-xs font-mono uppercase tracking-wider">Quiz</span>
        </div>
        <h2 className="text-2xl font-bold">Test your understanding</h2>
        <div className="space-y-4">
          {quiz.questions.map((q, i) => (
            <div key={i} className="rounded-lg border border-border/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-sm"><span className="text-muted-foreground">Q{i + 1}.</span> {q.question}</p>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">{q.type}</span>
              </div>
              {q.options?.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {q.options.map((op, j) => (
                    <li key={j} className="text-sm text-foreground/90 pl-3 border-l-2 border-border">{op}</li>
                  ))}
                </ul>
              )}
              <div className="mt-3">
                <Button size="sm" variant="ghost" onClick={() => toggle(i)} className="gap-1 h-8">
                  {revealed[i] ? <><EyeOff className="h-3.5 w-3.5" />Hide answer</> : <><Eye className="h-3.5 w-3.5" />Show answer</>}
                </Button>
                {revealed[i] && (
                  <div className="mt-2 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 p-3 text-sm">
                    <p><span className="font-semibold">Answer:</span> {q.answer}</p>
                    {q.explanation && <p className="mt-1 text-xs opacity-90">{q.explanation}</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
