'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default function LessonView({ lesson }) {
  if (!lesson) return null
  return (
    <Card className="border-border/60">
      <CardContent className="p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="h-5 w-5" />
          <span className="text-xs font-mono uppercase tracking-wider">Lesson</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold">{lesson.title}</h2>

        {lesson.learningObjectives?.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Learning objectives</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
              {lesson.learningObjectives.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>
        )}

        {lesson.introduction && (
          <div>
            <h3 className="font-semibold mb-2">Introduction</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{lesson.introduction}</p>
          </div>
        )}

        {lesson.explanation && (
          <div>
            <h3 className="font-semibold mb-2">Main explanation</h3>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{lesson.explanation}</p>
          </div>
        )}

        {lesson.examples?.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Examples</h3>
            <ul className="space-y-2">
              {lesson.examples.map((ex, i) => (
                <li key={i} className="rounded-md bg-muted/60 px-3 py-2 text-sm font-mono">{ex}</li>
              ))}
            </ul>
          </div>
        )}

        {lesson.practiceActivity && (
          <div>
            <h3 className="font-semibold mb-2">Practice activity</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{lesson.practiceActivity}</p>
          </div>
        )}

        {lesson.summary?.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Summary</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
              {lesson.summary.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
