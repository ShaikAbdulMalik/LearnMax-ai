// YouTube Data API v3 client. Returns [] on any failure so it never blocks the lesson.

export async function searchYoutubeVideos({ topic, level, learningGoal }) {
  const key = process.env.YOUTUBE_API_KEY
  if (!key || !topic) return []
  const q = [topic, level || '', learningGoal || '', 'tutorial'].filter(Boolean).join(' ')
  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('q', q)
  url.searchParams.set('type', 'video')
  url.searchParams.set('maxResults', '5')
  url.searchParams.set('safeSearch', 'moderate')
  url.searchParams.set('videoEmbeddable', 'true')
  url.searchParams.set('relevanceLanguage', 'en')
  url.searchParams.set('key', key)
  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    const items = Array.isArray(data.items) ? data.items : []
    const seen = new Set()
    return items
      .map(v => ({
        videoId: v?.id?.videoId,
        title: v?.snippet?.title || '',
        channel: v?.snippet?.channelTitle || '',
        thumbnail: v?.snippet?.thumbnails?.medium?.url || v?.snippet?.thumbnails?.default?.url || null,
        url: v?.id?.videoId ? `https://www.youtube.com/watch?v=${v.id.videoId}` : null,
      }))
      .filter(v => v.videoId && !seen.has(v.videoId) && (seen.add(v.videoId) || true))
  } catch { return [] }
}
