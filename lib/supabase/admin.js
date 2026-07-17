import { createClient } from '@supabase/supabase-js'

// Service-role client. Server-only. Never import from client components.
let _admin
export function admin() {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return _admin
}
