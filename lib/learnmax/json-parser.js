export function stripFences(text) {
  if (!text) return ''
  let t = String(text).trim()
  // Remove ```json ... ``` or ``` ... ```
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  return t.trim()
}

export function extractJsonObject(text) {
  const t = stripFences(text)
  // Fast path
  try { return JSON.parse(t) } catch (_) {}
  // Find first { and last }
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  const candidate = t.slice(start, end + 1)
  try { return JSON.parse(candidate) } catch (_) {}
  // Try to fix common trailing comma issues
  try { return JSON.parse(candidate.replace(/,\s*([}\]])/g, '$1')) } catch (_) {}
  return null
}

export function safeParseWithSchema(text, schema) {
  const obj = extractJsonObject(text)
  if (!obj) return { ok: false, error: 'no-json' }
  const res = schema.safeParse(obj)
  if (!res.success) return { ok: false, error: 'schema', issues: res.error.issues }
  return { ok: true, data: res.data }
}
