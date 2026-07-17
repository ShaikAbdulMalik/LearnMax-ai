// Deterministic fallback when HF is unavailable.
function generic(topic) {
  const t = topic || 'the topic'
  return {
    lesson: {
      title: `${t}: A Focused Introduction`,
      learningObjectives: [`Define ${t}`, `Identify the core ideas`, `Apply ${t}`, `Recognize common mistakes`],
      introduction: `Let's take a clear pass at ${t}, focusing on what actually matters.`,
      explanation: `${t} is best understood by starting from a simple definition and adding vocabulary and mechanics with concrete examples.`,
      examples: [`Minimal illustration of ${t}.`, `A slightly richer variation.`, `A common misuse and why it fails.`],
      practiceActivity: `Describe how ${t} applies to a scenario in your work or studies in 3–5 sentences.`,
      summary: [`${t} rests on a small set of core ideas`, `Practice on tiny examples first`, `Watch out for classic pitfalls`],
    },
    quiz: { questions: [
      { type:'multiple-choice', question:`Which best describes ${t}?`, options:['Random concept','A structured idea with core principles','A brand name','None of the above'], answer:'A structured idea with core principles', explanation:'It has definable principles.' },
      { type:'multiple-choice', question:`A good first step when learning ${t} is to...`, options:['Memorize everything','Start with a definition and small example','Skip fundamentals','Only read theory'], answer:'Start with a definition and small example', explanation:'Concrete anchors help.' },
      { type:'multiple-choice', question:`Common pitfall with ${t}?`, options:['Over-applying it','Reading docs','Practicing','Asking for feedback'], answer:'Over-applying it', explanation:'Overuse is common.' },
      { type:'true-false', question:`${t} can only be learned one way.`, options:['True','False'], answer:'False', explanation:'Multiple paths exist.' },
      { type:'short-answer', question:`Name one situation where ${t} could be useful.`, options:[], answer:'Any relevant real-world scenario', explanation:'Applying it anchors retention.' },
    ]},
    flashcards: { flashcards: [
      { front: t, back: 'A structured concept with core principles' },
      { front: 'Core idea', back: `The fundamental principle of ${t}` },
      { front: 'Example', back: `A concrete instance of ${t}` },
      { front: 'Pitfall', back: `A common mistake with ${t}` },
      { front: 'Practice', back: `Small exercises to internalize ${t}` },
    ]},
    roadmap: { title: `${t} learning roadmap`, totalMinutes: 90, steps: [
      { id:'step-1', title:`Understand what ${t} is`, topics:['definition'], estimatedMinutes: 15 },
      { id:'step-2', title:`Core mechanics of ${t}`, topics:['fundamentals'], estimatedMinutes: 25 },
      { id:'step-3', title:`Hands-on examples`, topics:['practice'], estimatedMinutes: 30 },
      { id:'step-4', title:`Common pitfalls & best practices`, topics:['gotchas'], estimatedMinutes: 20 },
    ]},
    recommendations: { recommendations: [
      { topic:`Advanced ${t}`, description:`Go deeper into ${t}.`, difficulty:'intermediate', estimatedMinutes: 60, reason:'Natural next step.' },
      { topic:`Applied ${t}`, description:`Apply ${t} to a real project.`, difficulty:'intermediate', estimatedMinutes: 90, reason:'Solidify by building.' },
      { topic:`Related fundamentals`, description:`Adjacent concepts that reinforce ${t}.`, difficulty:'beginner', estimatedMinutes: 45, reason:'Broader context.' },
    ]},
    story: {
      title: `The Curious Adventure of ${t}`,
      style: 'adventure',
      characters: [
        { name: 'Maya', role: 'A curious student who wants to understand things deeply' },
        { name: 'Mentor Rao', role: 'A patient teacher who reveals concepts through stories' },
      ],
      chapters: [
        { number: 1, title: 'The Question', content: `Maya walks into the workshop with one question: what really is ${t}? Mentor Rao smiles and hands her a small notebook.`, concept: `Definition of ${t}`, takeaway: `${t} starts as a simple, definable idea.` },
        { number: 2, title: 'The First Example', content: `They open a tiny example on the desk. As Maya traces each line, Rao explains the moving parts, one at a time.`, concept: `First concrete example`, takeaway: `Concrete examples anchor abstract ideas.` },
        { number: 3, title: 'The Mistake', content: `Maya tries applying ${t} where it doesn't belong and immediately sees why. She laughs, then rewrites her approach the right way.`, concept: `Common pitfalls`, takeaway: `Wrong applications teach you when NOT to use ${t}.` },
        { number: 4, title: 'The Takeaway', content: `Rao asks her to summarize in her own words. Maya writes three simple sentences. Rao nods.`, concept: `Summarize and internalize`, takeaway: `You truly understand it when you can teach it back.` },
      ],
      narration: `Once, a student named Maya wanted to understand ${t}. Her mentor didn't give her a definition. He gave her a small notebook. Together, they explored one example. Then another. When Maya made a mistake, she saw exactly why. And by the end, she wrote her understanding in three simple sentences. That, her mentor said, is how ${t} truly becomes yours.`,
      reflectionQuestions: [
        `In your own words, what is ${t}?`,
        `Which example from the story surprised you most and why?`,
        `Where in your own life could you apply ${t}?`,
      ],
      recap: [
        `${t} starts with a simple, definable idea.`,
        `Concrete examples anchor abstract concepts.`,
        `Learning what NOT to do is as valuable as learning what to do.`,
      ],
      challengeQuestion: `Design a mini-scenario where ${t} would be the perfect tool — and one where it would be the wrong tool.`,
      moral: `Master the fundamentals, and the rest follows.`,
      estimatedReadingMinutes: 5,
    },
  }
}
export function fallbackFor(topic) { return generic(topic) }
