// Agent metadata + dynamic selection.
//   lesson       -> Planner + Tutor
//   quiz         -> Planner + Tutor + Quiz
//   flashcards   -> Tutor + Flashcard
//   roadmap      -> Planner + Roadmap
//   recommendations -> Recommendation only
//   videos       -> Video only
//   story        -> Planner + Tutor + Story Narrator

export const AGENT_META = {
  planner:        { id: 'planner',        name: 'Planner Agent',        responsibility: 'Creates the learning structure and objectives.' },
  tutor:          { id: 'tutor',          name: 'Tutor Agent',          responsibility: 'Generates the personalized lesson.' },
  quiz:           { id: 'quiz',           name: 'Quiz Agent',           responsibility: 'Generates assessment questions.' },
  flashcard:      { id: 'flashcard',      name: 'Flashcard Agent',      responsibility: 'Generates revision flashcards.' },
  roadmap:        { id: 'roadmap',        name: 'Roadmap Agent',        responsibility: 'Builds a step-by-step learning roadmap.' },
  recommendation: { id: 'recommendation', name: 'Recommendation Agent', responsibility: 'Suggests next topics to master.' },
  video:          { id: 'video',          name: 'Video Agent',          responsibility: 'Finds relevant YouTube videos.' },
  story:          { id: 'story',          name: 'Story Narrator Agent', responsibility: 'Transforms the lesson into an engaging story.' },
}

const ORDER = ['planner','tutor','story','quiz','flashcard','roadmap','recommendation','video']

export function selectAgents(outputs) {
  const wants = new Set(outputs || [])
  const need = new Set()
  const reasons = {}

  if (wants.has('lesson')) {
    need.add('planner');  reasons.planner = 'A personalized lesson requires a learning plan.'
    need.add('tutor');    reasons.tutor = 'The Tutor delivers the lesson based on the plan.'
  }
  if (wants.has('quiz')) {
    need.add('planner');  reasons.planner = reasons.planner || 'Quiz generation benefits from a scoped plan.'
    need.add('tutor');    reasons.tutor = reasons.tutor || 'Quiz questions are grounded in the lesson.'
    need.add('quiz');     reasons.quiz = 'The user requested a quiz to assess understanding.'
  }
  if (wants.has('flashcards')) {
    need.add('tutor');    reasons.tutor = reasons.tutor || 'Flashcards are derived from the lesson content.'
    need.add('flashcard');reasons.flashcard = 'The user requested revision flashcards.'
  }
  if (wants.has('roadmap')) {
    need.add('planner');  reasons.planner = reasons.planner || 'A roadmap requires an initial learning plan.'
    need.add('roadmap');  reasons.roadmap = 'The user requested a step-by-step roadmap.'
  }
  if (wants.has('recommendations')) {
    need.add('recommendation'); reasons.recommendation = 'The user requested next-topic suggestions.'
  }
  if (wants.has('videos')) {
    need.add('video'); reasons.video = 'The user requested relevant learning videos.'
  }
  if (wants.has('story')) {
    need.add('planner');  reasons.planner = reasons.planner || 'Story mode needs a planned narrative arc.'
    need.add('tutor');    reasons.tutor = reasons.tutor || 'The Story Narrator transforms the tutor lesson into narrative.'
    need.add('story');    reasons.story = 'The user chose to learn through story.'
  }

  const agents = ORDER.filter(id => need.has(id)).map((id, i) => ({
    ...AGENT_META[id], reason: reasons[id], status: 'queued', execution_order: i,
  }))
  return { agents, executionOrder: agents.map(a => a.id) }
}
