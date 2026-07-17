'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Clock, ChevronRight } from 'lucide-react'

export default function HistoryList({ refreshToken, onPick }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch('/api/history').then(r => r.json()).then(d => {
      if (!alive) return
      setItems(d.history || [])
      setLoading(false)
    }).catch(() => setLoading(false))
    return () => { alive = false }
  }, [refreshToken])

  if (loading || items.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="mt-8"
    >
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your recent bundles</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <AnimatePresence>
          {items.map((item) => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              onClick={() => onPick?.(item)}
              className="text-left group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur p-3 hover:border-primary/50 transition-colors"
            >
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{item.topic}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <span>{item.level}</span>
                  <span>·</span>
                  <span>{item.duration}m</span>
                  <span>·</span>
                  <span>{item.outputs.join(' + ')}</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 gap-1">
                <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(item.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
