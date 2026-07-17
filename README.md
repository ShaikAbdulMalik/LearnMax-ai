# LearnMax.ai — Phase 2 MVP

A dynamic multi-agent AI platform for personalized learning. Enter a topic, level, duration, learning style and desired outputs — LearnMax dynamically selects only the required AI agents (Planner / Tutor / Quiz / Flashcard) and generates a personalized lesson, 5-question quiz and 5 flashcards using the Hugging Face Inference API.

## Core Innovation

- **Dynamic agent orchestration** — only the agents required by your request run. No lesson requested → no Planner or Tutor. Quiz + flashcards can run in parallel.
- **Server-side, schema-validated AI output** — every model response is stripped of markdown, parsed, Zod-validated and repaired once before falling back to deterministic demo content.
- **Zero-config UX** — one form, one button, one bundle.

## Features

1. **Personalized Learning Request Form** — topic, level (beginner / intermediate / advanced), duration (15 / 30 / 60 min), learning style (concise / examples / practice / step-by-step), outputs (lesson / quiz / flashcards). Validated with Zod.
2. **Dynamic Agent Selection** — 4 logical agents with responsibilities, selection reasons and live status (queued → running → completed / failed).
3. **Personalized Learning Content** — lesson (title, objectives, intro, explanation, examples, practice, summary), quiz (exactly 3 multiple-choice + 1 true-false + 1 short-answer), flashcards (exactly 5).

## Tech Stack

- **Next.js 15 (App Router)** + React 18
- **Tailwind CSS** + shadcn/ui components
- **Framer Motion** for animations (respects `prefers-reduced-motion`)
- **Zod** for runtime validation
- **Hugging Face Inference API** (OpenAI-compatible router endpoint)
- **Lucide React** icons

## Architecture

```
/app
  ├── app/
  │   ├── page.js                 # Landing (hero, marquee, steps, agents, CTA)
  │   ├── generate/page.js        # Form + agent execution + result views
  │   ├── layout.js
  │   ├── globals.css             # Design tokens + custom animations
  │   └── api/[[...path]]/route.js
  │       ├── POST /api/orchestrate → dynamic agent selection (fast, no LLM)
  │       ├── POST /api/generate    → full HF pipeline
  │       └── GET  /api/health
  ├── lib/learnmax/
  │   ├── schemas.js              # Zod schemas (request, planner, tutor, quiz, flashcards)
  │   ├── prompts.js              # System prompts per agent
  │   ├── json-parser.js          # Strip fences + safe parse + schema validate
  │   ├── huggingface.js          # Server-only HF client
  │   ├── agents.js               # Agent metadata + selection rules
  │   ├── orchestrator.js         # Planner → Tutor sequential, Quiz/Flashcard parallel
  │   └── demo-fallback.js        # Deterministic fallback content
  └── components/learnmax/        # RequestForm, AgentList, Lesson/Quiz/FlashcardView
```

## Local Setup

```bash
git clone <your-repo>
cd learnmax
yarn install
cp .env.example .env
# Edit .env and set HF_TOKEN + HF_MODEL
yarn dev
```

Open http://localhost:3000

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `HF_TOKEN` | Yes | Hugging Face access token from https://huggingface.co/settings/tokens |
| `HF_MODEL` | Yes | Chat / instruction model, e.g. `meta-llama/Llama-3.1-8B-Instruct` |
| `MONGO_URL` | No (unused by MVP) | Kept from template |
| `NEXT_PUBLIC_BASE_URL` | No | Used by the dev preview; not required in production |
| `CORS_ORIGINS` | No | Defaults to `*` |

**HF_TOKEN is never sent to the browser.** All calls happen inside `/api/generate`.

## Hugging Face Setup

1. Create a free HF account: https://huggingface.co/join
2. Generate a token with `read` permission: https://huggingface.co/settings/tokens
3. Pick a model that supports chat completions on HF's Inference Providers, e.g.
   - `meta-llama/Llama-3.1-8B-Instruct` (recommended)
   - `mistralai/Mistral-7B-Instruct-v0.3`
   - `Qwen/Qwen2.5-7B-Instruct`
4. Put both values in `.env`.

## Demo Fallback

If HF is missing, times out, rate-limits, errors, or returns invalid JSON after one repair retry, LearnMax falls back to deterministic demo content for these topics:

- `Java inheritance`
- `SQL joins`
- `Machine learning basics`

Any other topic uses a generic template. The response includes `"source": "demo-fallback"` and the UI shows a subtle amber notice.

## Deployment — Vercel (recommended)

Next.js is built by Vercel; the deploy takes one minute.

1. Push this repo to GitHub (via Emergent's "Save to GitHub" button, or manually).
2. Go to https://vercel.com/new
3. Import the GitHub repo. Framework auto-detects as **Next.js** — accept the defaults.
4. Under **Environment Variables**, add:
   - `HF_TOKEN` = your token
   - `HF_MODEL` = `meta-llama/Llama-3.1-8B-Instruct`
5. Click **Deploy**. You'll get a URL like `learnmax-ai.vercel.app`.

That's it — the API routes work automatically because they're Next.js Route Handlers.

## Deployment — GitHub Pages (not supported)

GitHub Pages serves **static files only**. This app requires server-side execution for `/api/orchestrate` and `/api/generate` (HF calls must never expose the token to the browser). Pages will not work here. Use Vercel, Netlify, Render, Cloudflare Pages (with Functions), or any Node host.

## Deployment — Other platforms

- **Netlify:** import repo, framework = Next.js, add env vars, deploy.
- **Render:** create a Web Service, build `yarn build`, start `yarn start`, add env vars.
- **Docker:** `next.config.js` already sets `output: 'standalone'`; build with `next build` and run `node .next/standalone/server.js`.

## Future scope

- Multi-turn tutor chat with context memory
- Adaptive difficulty based on quiz score
- Spaced-repetition flashcard scheduler
- PDF export of the learning bundle
- Sign-in + saved sessions
