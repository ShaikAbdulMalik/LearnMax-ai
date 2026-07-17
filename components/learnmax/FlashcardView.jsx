'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Layers } from 'lucide-react'
import { motion } from 'framer-motion'

function FlashCard({ front, back }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setFlipped(v => !v)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped(v => !v) } }}
      className="relative w-full h-40 [perspective:1000px] group focus:outline-none focus:ring-2 focus:ring-ring rounded-xl"
      aria-label={`Flashcard. ${flipped ? 'Showing back.' : 'Showing front.'} Press to flip.`}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/40 p-5 flex items-center justify-center text-center [backface-visibility:hidden]">
          <p className="font-semibold">{front}</p>
        </div>
        <div className="absolute inset-0 rounded-xl border border-primary/40 bg-primary/5 p-5 flex items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <p className="text-sm">{back}</p>
        </div>
      </motion.div>
    </button>
  )
}

export default function FlashcardView({ flashcards }) {
  if (!flashcards?.flashcards?.length) return null
  return (
    <Card className="border-border/60">
      <CardContent className="p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-2 text-primary">
          <Layers className="h-5 w-5" />
          <span className="text-xs font-mono uppercase tracking-wider">Flashcards</span>
        </div>
        <p className="text-sm text-muted-foreground">Click a card to flip. Use for quick spaced revision.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {flashcards.flashcards.map((f, i) => (
            <FlashCard key={i} front={f.front} back={f.back} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
