'use client'
import { Video as VideoIcon, ExternalLink } from 'lucide-react'

export default function VideosView({ videos }) {
  const items = videos?.items || []
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 md:p-8">
      <div className="flex items-center gap-2 text-[#3b8ad9]">
        <VideoIcon className="h-5 w-5" />
        <span className="text-xs font-mono uppercase tracking-wider">Recommended videos</span>
      </div>
      <h2 className="text-2xl font-bold mt-1 text-[#0a3663]">Watch and learn</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 mt-3">No videos found for this topic. Try refining your query.</p>
      ) : (
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((v) => (
            <a key={v.videoId} href={v.url} target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-blue-100 bg-slate-50 overflow-hidden hover:border-[#3b8ad9]/50 transition-colors">
              {v.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.thumbnail} alt={v.title} className="w-full aspect-video object-cover" />
              )}
              <div className="p-3">
                <h4 className="font-medium text-sm line-clamp-2 text-[#0a3663]">{v.title}</h4>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate">{v.channel}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 group-hover:text-[#3b8ad9] transition-colors" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
