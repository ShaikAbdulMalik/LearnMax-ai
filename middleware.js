import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Landing '/' is public; login/signup/callback are public. Everything else needs a session.
const PROTECTED_PREFIXES = ['/generate', '/dashboard', '/project']

export async function middleware(request) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = '?next=' + encodeURIComponent(pathname + (search || ''))
    return NextResponse.redirect(url)
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/|favicon|.*\\..*).*)'],
}
