import Link from 'next/link';
import { Highlight } from '@/lib/db';

const HOST_COLORS: Record<string, string> = {
  Dave: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10',
  Davis: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  Pete: 'text-green-400 border-green-500/30 bg-green-500/10',
  Dan: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
};

export default function QuoteCard({ highlight }: { highlight: Highlight }) {
  const hostStyle = HOST_COLORS[highlight.host] || 'text-[#B8A9D4] border-[#6A5890]/30 bg-[#6A5890]/10';

  return (
    <div className="bg-[#1A0E2E] border border-[#2D1B4E] rounded-xl p-6 hover:border-cyan-400/30 transition-all">
      {/* Quote */}
      <blockquote className="text-white text-lg font-medium leading-relaxed mb-4">
        &ldquo;{highlight.quote}&rdquo;
      </blockquote>

      {/* Attribution */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold px-2.5 py-1 rounded-full border ${hostStyle}`}>
            {highlight.host}
          </span>
          <Link
            href={`/episodes/${highlight.episode_id}`}
            className="text-sm text-[#6A5890] hover:text-cyan-400 transition truncate max-w-[200px]"
          >
            {highlight.episode_title}
          </Link>
        </div>

        {/* Share button */}
        <button
          className="shrink-0 text-[#5A4880] hover:text-cyan-400 transition p-1"
          title="Share quote"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* Tags */}
      {highlight.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {highlight.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#1E1335] text-[#6A5890] border border-[#3D2663]">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
