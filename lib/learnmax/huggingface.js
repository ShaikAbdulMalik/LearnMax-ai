// LLM client used by all LearnMax agents.
// Prefers Groq (fast, generous free tier). Falls back to Hugging Face
// if GROQ_API_KEY is not set. Same interface as before — no other
// file needs to change.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const HF_URL = 'https://router.huggingface.co/v1/chat/completions'

export class HFError extends Error {
  constructor(kind, message) { super(message); this.kind = kind }
}

async function callProvider({ url, token, model, system, user, maxTokens, temperature, timeoutMs, providerName }) {
  const controller = new AbortController()
  const to = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [ { role: 'system', content: system }, { role: 'user', content: user } ],
        max_tokens: maxTokens,
        temperature,
        stream: false,
      }),
      signal: controller.signal,
    })
    if (res.status === 429) throw new HFError('rate-limit', `${providerName} rate limit`)
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new HFError('provider-error', `${providerName} ${res.status}: ${txt.slice(0, 200)}`)
    }
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) throw new HFError('provider-error', `Empty response from ${providerName}`)
    return content
  } catch (err) {
    if (err?.name === 'AbortError') throw new HFError('timeout', `${providerName} timeout`)
    if (err instanceof HFError) throw err
    throw new HFError('network', err?.message || 'Network error')
  } finally { clearTimeout(to) }
}

export async function hfChat({ system, user, maxTokens = 1200, temperature = 0.5, timeoutMs = 25000 }) {
  const groqKey = process.env.GROQ_API_KEY
  const hfToken = process.env.HF_TOKEN
  const hfModel = process.env.HF_MODEL

  // Prefer Groq — 10-30x faster than HF free-tier inference.
  if (groqKey) {
    const groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
    return callProvider({
      url: GROQ_URL, token: groqKey, model: groqModel,
      system, user, maxTokens, temperature, timeoutMs,
      providerName: 'Groq',
    })
  }

  if (hfToken && hfModel) {
    return callProvider({
      url: HF_URL, token: hfToken, model: hfModel,
      system, user, maxTokens, temperature, timeoutMs,
      providerName: 'HF',
    })
  }

  throw new HFError('missing-config', 'No LLM provider configured. Set GROQ_API_KEY or HF_TOKEN + HF_MODEL.')
}
