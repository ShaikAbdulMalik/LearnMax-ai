'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Loader2, LayoutDashboard, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function UserBadge() {
  const [user, setUser] = useState(undefined)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null))
    return () => sub.subscription.unsubscribe()
  }, [])

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (user === undefined) {
    return <div className="h-8 w-8 rounded-full border bg-muted/40 flex items-center justify-center"><Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /></div>
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login"><Button size="sm" variant="ghost">Sign in</Button></Link>
        <Link href="/login?mode=signup"><Button size="sm" className="bg-gradient-to-r from-[#0a3663] to-[#3b8ad9] hover:opacity-90">Sign up</Button></Link>
      </div>
    )
  }

  const name = user.user_metadata?.full_name || user.email || 'User'
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 rounded-full border border-blue-200/60 bg-white pl-1 pr-3 py-1 hover:border-[#3b8ad9]/60 transition-colors">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#0a3663] to-[#3b8ad9] flex items-center justify-center text-[10px] font-semibold text-white">{initials}</div>
        <span className="text-xs font-medium max-w-[120px] truncate">{name}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="absolute right-0 mt-2 w-56 rounded-xl border border-blue-100 bg-white shadow-xl overflow-hidden z-50">
            <div className="px-3 py-2 border-b border-blue-100">
              <div className="text-xs text-muted-foreground">Signed in as</div>
              <div className="text-sm font-medium truncate">{user.email}</div>
            </div>
            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"><LayoutDashboard className="h-3.5 w-3.5" /> My Learning</Link>
            <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
