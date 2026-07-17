import { selectAgents } from './agents'
import { hfChat } from './huggingface'
import { safeParseWithSchema } from './json-parser'
import {
  PLANNER_SYSTEM, TUTOR_SYSTEM, QUIZ_SYSTEM, FLASHCARD_SYSTEM,
  ROADMAP_SYSTEM, RECOMMENDATION_SYSTEM, STORY_SYSTEM, REPAIR_SYSTEM, buildContext,
} from './prompts'
import {
  PlannerSchema, TutorSchema, QuizSchema, FlashcardSchema,
  RoadmapSchema, RecommendationSchema, StorySchema,
} from './schemas'
import { fallbackFor } from './demo-fallback'
import { searchYoutubeVideos } from './youtube'

async function runAgentWithSchema({ system, user, schema, maxTokens = 1200, temperature = 0.5 }) {
  const first = await hfChat({ system, user, maxTokens, temperature })
  let parsed = safeParseWithSchema(first, schema)
  if (parsed.ok) return { ok: true, data: parsed.data }
  const repairUser = `The previous response was invalid. Return ONLY valid JSON matching the schema.\n\nPrevious: ${first}\n\nOriginal request:\n${user}`
  const second = await hfChat({ system: REPAIR_SYSTEM + '\n\n' + system, user: repairUser, maxTokens, temperature: 0.2 })
  parsed = safeParseWithSchema(second, schema)
  return parsed.ok ? { ok: true, data: parsed.data } : { ok: false }
}

export function isConfigMissing() {
  const hasGroq = Boolean(process.env.GROQ_API_KEY)
  const hasHF = Boolean(process.env.HF_TOKEN && process.env.HF_MODEL)
  return !hasGroq && !hasHF
}

export async function orchestrate(input, onAgentUpdate = () => {}) {
  const { topic, level, duration, learningStyle, learningGoal, outputs, storyStyle } = input
  const wantsLesson = outputs.includes('lesson')
  const wantsStory = outputs.includes('story')
  const wantsQuiz = outputs.includes('quiz')
  const wantsFlash = outputs.includes('flashcards')
  const wantsRoadmap = outputs.includes('roadmap')
  const wantsRecs = outputs.includes('recommendations')
  const wantsVideos = outputs.includes('videos')

  const ctx = buildContext({ topic, level, duration, learningStyle, learningGoal })
  const fb = fallbackFor(topic)
  const result = { source: 'hugging-face' }
  let anyFallback = false
  const missing = isConfigMissing()
  const time = () => Date.now()
  let plan = null, lesson = null

  if (wantsLesson || wantsQuiz || wantsRoadmap || wantsStory) {
    const t0 = time(); onAgentUpdate('planner', { status: 'running' })
    if (missing) onAgentUpdate('planner', { status: 'skipped', execution_time_ms: 0 })
    else {
      try {
        const r = await runAgentWithSchema({ system: PLANNER_SYSTEM, user: `${ctx}\n\nProduce the plan JSON now.`, schema: PlannerSchema, maxTokens: 700 })
        if (!r.ok) throw new Error('planner-invalid')
        plan = r.data
        onAgentUpdate('planner', { status: 'completed', execution_time_ms: time() - t0 })
      } catch { anyFallback = true; onAgentUpdate('planner', { status: 'failed', execution_time_ms: time() - t0, error_message: 'Planner produced invalid output.' }) }
    }
  }

  if (wantsLesson || wantsQuiz || wantsFlash || wantsStory) {
    const t0 = time(); onAgentUpdate('tutor', { status: 'running' })
    if (missing) { onAgentUpdate('tutor', { status: 'skipped', execution_time_ms: 0 }); lesson = fb.lesson; anyFallback = true }
    else {
      try {
        const planText = plan ? `Plan: ${plan.title}. Objectives: ${plan.learningObjectives.join('; ')}` : ''
        const r = await runAgentWithSchema({ system: TUTOR_SYSTEM, user: `${ctx}\n\n${planText}\n\nProduce the lesson JSON now.`, schema: TutorSchema, maxTokens: 1400 })
        if (!r.ok) throw new Error('tutor-invalid')
        lesson = { title: plan?.title || topic, learningObjectives: plan?.learningObjectives || [], ...r.data }
        onAgentUpdate('tutor', { status: 'completed', execution_time_ms: time() - t0 })
      } catch { anyFallback = true; lesson = fb.lesson; onAgentUpdate('tutor', { status: 'failed', execution_time_ms: time() - t0, error_message: 'Tutor produced invalid output.' }) }
    }
    if (wantsLesson) result.lesson = lesson
  }

  const lessonContext = lesson
    ? `Lesson context: title=${lesson.title}; objectives=${(lesson.learningObjectives||[]).join('; ')}; explanation=${(lesson.explanation||'').slice(0, 400)}`
    : ctx

  const tasks = []

  // Story Narrator (sequential-ish: depends on lesson, but can run in parallel with others once lesson exists)
  if (wantsStory) {
    const t0 = time(); onAgentUpdate('story', { status: 'running' })
    tasks.push((async () => {
      if (missing) { result.story = fb.story; anyFallback = true; onAgentUpdate('story', { status: 'skipped', execution_time_ms: 0 }); return }
      try {
        const style = storyStyle || 'adventure'
        const lessonBlob = lesson ? `LESSON JSON:\n${JSON.stringify({ title: lesson.title, introduction: lesson.introduction, explanation: lesson.explanation, examples: lesson.examples, summary: lesson.summary }).slice(0, 3000)}` : ''
        const user = `${ctx}\n\nStory style: ${style}\n\n${lessonBlob}\n\nProduce the story JSON now (3-6 chapters, exactly 3 reflection questions, exactly 3 recap points, 1 challenge question).`
        const r = await runAgentWithSchema({ system: STORY_SYSTEM, user, schema: StorySchema, maxTokens: 2200, temperature: 0.7 })
        if (!r.ok) throw new Error('story-invalid')
        result.story = r.data
        onAgentUpdate('story', { status: 'completed', execution_time_ms: time() - t0 })
      } catch { anyFallback = true; result.story = fb.story; onAgentUpdate('story', { status: 'failed', execution_time_ms: time() - t0, error_message: 'Story Narrator produced invalid output.' }) }
    })())
  }

  if (wantsQuiz) {
    const t0 = time(); onAgentUpdate('quiz', { status: 'running' })
    tasks.push((async () => {
      if (missing) { result.quiz = fb.quiz; anyFallback = true; onAgentUpdate('quiz', { status: 'skipped', execution_time_ms: 0 }); return }
      try {
        const r = await runAgentWithSchema({ system: QUIZ_SYSTEM, user: `${lessonContext}\n\nProduce the quiz JSON now (3 MC + 1 TF + 1 SA).`, schema: QuizSchema, maxTokens: 1200 })
        if (!r.ok) throw new Error('quiz-invalid')
        result.quiz = r.data
        onAgentUpdate('quiz', { status: 'completed', execution_time_ms: time() - t0 })
      } catch { anyFallback = true; result.quiz = fb.quiz; onAgentUpdate('quiz', { status: 'failed', execution_time_ms: time() - t0, error_message: 'Quiz produced invalid output.' }) }
    })())
  }

  if (wantsFlash) {
    const t0 = time(); onAgentUpdate('flashcard', { status: 'running' })
    tasks.push((async () => {
      if (missing) { result.flashcards = fb.flashcards; anyFallback = true; onAgentUpdate('flashcard', { status: 'skipped', execution_time_ms: 0 }); return }
      try {
        const r = await runAgentWithSchema({ system: FLASHCARD_SYSTEM, user: `${lessonContext}\n\nProduce EXACTLY 5 flashcards JSON now.`, schema: FlashcardSchema, maxTokens: 800 })
        if (!r.ok) throw new Error('flash-invalid')
        result.flashcards = r.data
        onAgentUpdate('flashcard', { status: 'completed', execution_time_ms: time() - t0 })
      } catch { anyFallback = true; result.flashcards = fb.flashcards; onAgentUpdate('flashcard', { status: 'failed', execution_time_ms: time() - t0, error_message: 'Flashcard produced invalid output.' }) }
    })())
  }

  if (wantsRoadmap) {
    const t0 = time(); onAgentUpdate('roadmap', { status: 'running' })
    tasks.push((async () => {
      if (missing) { result.roadmap = fb.roadmap; anyFallback = true; onAgentUpdate('roadmap', { status: 'skipped', execution_time_ms: 0 }); return }
      try {
        const planText = plan ? `Plan: ${plan.title}. Sections: ${plan.sections.map(s => s.title).join(', ')}` : ''
        const r = await runAgentWithSchema({ system: ROADMAP_SYSTEM, user: `${ctx}\n\n${planText}\n\nProduce the roadmap JSON now.`, schema: RoadmapSchema, maxTokens: 900 })
        if (!r.ok) throw new Error('roadmap-invalid')
        result.roadmap = r.data
        onAgentUpdate('roadmap', { status: 'completed', execution_time_ms: time() - t0 })
      } catch { anyFallback = true; result.roadmap = fb.roadmap; onAgentUpdate('roadmap', { status: 'failed', execution_time_ms: time() - t0, error_message: 'Roadmap produced invalid output.' }) }
    })())
  }

  if (wantsRecs) {
    const t0 = time(); onAgentUpdate('recommendation', { status: 'running' })
    tasks.push((async () => {
      if (missing) { result.recommendations = fb.recommendations; anyFallback = true; onAgentUpdate('recommendation', { status: 'skipped', execution_time_ms: 0 }); return }
      try {
        const r = await runAgentWithSchema({ system: RECOMMENDATION_SYSTEM, user: `${lessonContext}\n\nProduce 3-5 recommendations JSON now.`, schema: RecommendationSchema, maxTokens: 800 })
        if (!r.ok) throw new Error('rec-invalid')
        result.recommendations = r.data
        onAgentUpdate('recommendation', { status: 'completed', execution_time_ms: time() - t0 })
      } catch { anyFallback = true; result.recommendations = fb.recommendations; onAgentUpdate('recommendation', { status: 'failed', execution_time_ms: time() - t0, error_message: 'Recommendation produced invalid output.' }) }
    })())
  }

  if (wantsVideos) {
    const t0 = time(); onAgentUpdate('video', { status: 'running' })
    tasks.push((async () => {
      try {
        const videos = await searchYoutubeVideos({ topic, level, learningGoal })
        result.videos = { items: videos }
        onAgentUpdate('video', { status: videos.length ? 'completed' : 'failed', execution_time_ms: time() - t0, error_message: videos.length ? null : 'YouTube API returned no results.' })
      } catch {
        result.videos = { items: [] }
        onAgentUpdate('video', { status: 'failed', execution_time_ms: time() - t0, error_message: 'YouTube search failed.' })
      }
    })())
  }

  await Promise.allSettled(tasks)
  if (anyFallback) result.source = 'demo-fallback'
  return result
}
