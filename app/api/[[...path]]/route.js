import { NextResponse } from 'next/server'
import { RequestSchema } from '@/lib/learnmax/schemas'
import { selectAgents } from '@/lib/learnmax/agents'
import { orchestrate } from '@/lib/learnmax/orchestrator'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}
export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }

function badZod(err) {
  return err.issues?.map(i => i.message).join(' ') || 'Invalid input'
}

async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    if (route === '/' && method === 'GET') {
      return cors(NextResponse.json({ message: 'LearnMax.ai API is up' }))
    }
    if (route === '/health' && method === 'GET') {
      return cors(NextResponse.json({
        ok: true,
        hasHF: Boolean(process.env.HF_TOKEN),
        hasGroq: Boolean(process.env.GROQ_API_KEY),
        hasSupabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasYoutube: Boolean(process.env.YOUTUBE_API_KEY),
        hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      }))
    }

    // auth/signup: creates a user with email pre-confirmed (bypasses
    // Supabase confirmation email delivery which is unreliable on free tier).
    // Requires SUPABASE_SERVICE_ROLE_KEY. If not configured, falls back
    // to a hint so the client uses the standard supabase.auth.signUp flow.
    if (route === '/auth/signup' && method === 'POST') {
      const body = await request.json().catch(() => null)
      const email = (body?.email || '').trim().toLowerCase()
      const password = body?.password || ''
      const full_name = (body?.full_name || '').trim()
      if (!email || !password || password.length < 6) {
        return cors(NextResponse.json({ error: 'Email and a password (min 6 chars) are required.' }, { status: 400 }))
      }
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // Service role not configured — tell client to use browser signUp
        return cors(NextResponse.json({ mode: 'client-signup' }))
      }
      const db = admin()
      const { data, error } = await db.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || email.split('@')[0] },
      })
      if (error) {
        const msg = (error.message || '').toLowerCase()
        // If user already exists, that's fine — the client will just try to sign in.
        if (msg.includes('already') || msg.includes('exists') || msg.includes('registered')) {
          return cors(NextResponse.json({ mode: 'already-exists' }))
        }
        return cors(NextResponse.json({ error: error.message }, { status: 400 }))
      }
      return cors(NextResponse.json({ mode: 'confirmed', user_id: data?.user?.id }))
    }

    // orchestrate: fast agent-selection preview (public)
    if (route === '/orchestrate' && method === 'POST') {
      const body = await request.json().catch(() => null)
      const parsed = RequestSchema.safeParse(body)
      if (!parsed.success) return cors(NextResponse.json({ error: badZod(parsed.error) }, { status: 400 }))
      const { agents, executionOrder } = selectAgents(parsed.data.outputs)
      return cors(NextResponse.json({ agents, executionOrder }))
    }

    // generate: create project + run orchestration + persist (auth required)
    if (route === '/generate' && method === 'POST') {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return cors(NextResponse.json({ error: 'Please sign in.', code: 'UNAUTHENTICATED' }, { status: 401 }))

      const body = await request.json().catch(() => null)
      const parsed = RequestSchema.safeParse(body)
      if (!parsed.success) return cors(NextResponse.json({ error: badZod(parsed.error) }, { status: 400 }))
      const req = parsed.data

      const db = admin()
      const { agents } = selectAgents(req.outputs)

      // 1. Create learning_projects row
      const { data: proj, error: projErr } = await db.from('learning_projects').insert({
        user_id: user.id,
        title: req.topic,
        topic: req.topic,
        learning_goal: req.learningGoal || null,
        learner_level: req.level,
        learning_style: req.learningStyle,
        available_minutes: req.duration,
        requested_outputs: req.outputs,
        status: 'generating',
      }).select().single()
      if (projErr) return cors(NextResponse.json({ error: 'Could not create project' }, { status: 500 }))

      // 2. Insert agent_runs (queued)
      const runRows = agents.map(a => ({
        user_id: user.id, project_id: proj.id, agent_type: a.id, agent_name: a.name,
        selection_reason: a.reason, status: 'queued', execution_order: a.execution_order,
      }))
      const { data: insertedRuns } = await db.from('agent_runs').insert(runRows).select()
      const runIdByType = {}
      ;(insertedRuns || []).forEach(r => { runIdByType[r.agent_type] = r.id })

      // 3. Run orchestration; update runs as they progress
      const updateRun = async (agentId, patch) => {
        const id = runIdByType[agentId]
        if (!id) return
        await db.from('agent_runs').update(patch).eq('id', id).catch(() => {})
      }
      let result
      try {
        result = await orchestrate(req, (agentId, patch) => { updateRun(agentId, patch) })
      } catch (e) {
        await db.from('learning_projects').update({ status: 'failed' }).eq('id', proj.id)
        return cors(NextResponse.json({ error: 'Generation failed', project_id: proj.id }, { status: 500 }))
      }

      // 4. Persist outputs
      const patch = { status: 'completed' }
      if (result.lesson) patch.lesson = result.lesson
      if (result.quiz) patch.quiz = result.quiz
      if (result.flashcards) patch.flashcards = result.flashcards
      if (result.roadmap) patch.roadmap = result.roadmap
      if (result.recommendations) patch.recommendations = result.recommendations
      if (result.videos) patch.videos = result.videos
      if (result.story) patch.story = result.story
      await db.from('learning_projects').update(patch).eq('id', proj.id)

      // 5. Load full project + runs for the response
      const { data: full } = await db.from('learning_projects').select('*').eq('id', proj.id).single()
      const { data: runs } = await db.from('agent_runs').select('*').eq('project_id', proj.id).order('execution_order')
      return cors(NextResponse.json({ project: full, agent_runs: runs, source: result.source }))
    }

    // List projects for current user
    if (route === '/projects' && method === 'GET') {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return cors(NextResponse.json({ error: 'Unauthenticated' }, { status: 401 }))
      const { data } = await supabase.from('learning_projects').select('*').order('created_at', { ascending: false })
      return cors(NextResponse.json({ projects: data || [] }))
    }

    // Single project (RLS enforces ownership)
    if (route.startsWith('/projects/') && method === 'GET') {
      const id = route.split('/')[2]
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return cors(NextResponse.json({ error: 'Unauthenticated' }, { status: 401 }))
      const [{ data: project, error }, { data: runs }] = await Promise.all([
        supabase.from('learning_projects').select('*').eq('id', id).single(),
        supabase.from('agent_runs').select('*').eq('project_id', id).order('execution_order'),
      ])
      if (error || !project) return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      return cors(NextResponse.json({ project, agent_runs: runs || [] }))
    }

    // Delete project
    if (route.startsWith('/projects/') && method === 'DELETE') {
      const id = route.split('/')[2]
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return cors(NextResponse.json({ error: 'Unauthenticated' }, { status: 401 }))
      const { error } = await supabase.from('learning_projects').delete().eq('id', id)
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 400 }))
      return cors(NextResponse.json({ ok: true }))
    }

    // Save roadmap step progress
    if (route === '/progress' && method === 'POST') {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return cors(NextResponse.json({ error: 'Unauthenticated' }, { status: 401 }))
      const body = await request.json().catch(() => null)
      const { project_id, roadmap_step_id, status, progress_percent } = body || {}
      if (!project_id || !roadmap_step_id) return cors(NextResponse.json({ error: 'project_id and roadmap_step_id required' }, { status: 400 }))
      const { data, error } = await supabase.from('user_progress').upsert({
        user_id: user.id, project_id, roadmap_step_id,
        status: status || 'in_progress',
        progress_percent: typeof progress_percent === 'number' ? progress_percent : 0,
      }, { onConflict: 'user_id,project_id,roadmap_step_id' }).select().single()
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 400 }))
      return cors(NextResponse.json({ progress: data }))
    }

    // Get progress for a project
    if (route.startsWith('/progress/') && method === 'GET') {
      const id = route.split('/')[2]
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return cors(NextResponse.json({ error: 'Unauthenticated' }, { status: 401 }))
      const { data } = await supabase.from('user_progress').select('*').eq('project_id', id)
      return cors(NextResponse.json({ progress: data || [] }))
    }

    return cors(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error?.message)
    return cors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
