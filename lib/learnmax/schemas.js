import { z } from 'zod'

export const LevelEnum = z.enum(['beginner','intermediate','advanced'])
export const DurationEnum = z.union([z.literal(15), z.literal(30), z.literal(60)])
export const StyleEnum = z.enum(['concise','examples','practice','step-by-step'])
export const OutputEnum = z.enum(['lesson','quiz','flashcards','roadmap','recommendations','videos','story'])
export const StoryStyleEnum = z.enum(['adventure','mystery','sci-fi','fantasy','detective','historical','classroom','real-world','corporate'])

export const RequestSchema = z.object({
  topic: z.string().min(2, 'Topic must contain at least two characters.'),
  level: LevelEnum,
  duration: DurationEnum,
  learningStyle: StyleEnum,
  learningGoal: z.string().optional().default(''),
  outputs: z.array(OutputEnum).min(1, 'Select at least one output.'),
  storyStyle: StoryStyleEnum.optional().default('adventure'),
})

export const PlannerSchema = z.object({
  title: z.string(),
  learningObjectives: z.array(z.string()).min(1),
  sections: z.array(z.object({ title: z.string(), estimatedMinutes: z.number(), goal: z.string() })).min(1),
})

export const TutorSchema = z.object({
  introduction: z.string(),
  explanation: z.string(),
  examples: z.array(z.string()).min(1),
  practiceActivity: z.string(),
  summary: z.array(z.string()).min(1),
})

export const QuizQuestionSchema = z.object({
  type: z.enum(['multiple-choice','true-false','short-answer']),
  question: z.string(), options: z.array(z.string()).optional().default([]),
  answer: z.string(), explanation: z.string(),
})
export const QuizSchema = z.object({
  questions: z.array(QuizQuestionSchema).length(5).refine((qs) => {
    return qs.filter(q => q.type === 'multiple-choice').length === 3 && qs.filter(q => q.type === 'true-false').length === 1 && qs.filter(q => q.type === 'short-answer').length === 1
  }, 'Quiz must contain 3 MCQ, 1 true-false, 1 short-answer.'),
})

export const FlashcardSchema = z.object({ flashcards: z.array(z.object({ front: z.string(), back: z.string() })).length(5) })

export const RoadmapSchema = z.object({
  title: z.string(), totalMinutes: z.number(),
  steps: z.array(z.object({ id: z.string(), title: z.string(), topics: z.array(z.string()).default([]), estimatedMinutes: z.number() })).min(3).max(8),
})

export const RecommendationSchema = z.object({
  recommendations: z.array(z.object({
    topic: z.string(), description: z.string(),
    difficulty: z.enum(['beginner','intermediate','advanced']),
    estimatedMinutes: z.number(), reason: z.string(),
  })).min(3).max(5),
})

export const StorySchema = z.object({
  title: z.string(),
  style: z.string().optional().default('adventure'),
  characters: z.array(z.object({ name: z.string(), role: z.string() })).min(1),
  chapters: z.array(z.object({
    number: z.number(),
    title: z.string(),
    content: z.string(),
    concept: z.string(),
    takeaway: z.string(),
  })).min(3).max(6),
  narration: z.string(),
  reflectionQuestions: z.array(z.string()).length(3),
  recap: z.array(z.string()).length(3),
  challengeQuestion: z.string(),
  moral: z.string(),
  estimatedReadingMinutes: z.number().optional().default(5),
})
