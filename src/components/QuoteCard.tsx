import Link from 'next/link';
import { Highlight } from '@/lib/db';

const HOST_COLORS: Record<string, string> = {
  Dave: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  Davis: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  Pete: 'text-green-400 border-green-500/30 bg-green-500/10',
  Dan: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
};

export default function QuoteCard({ highlight }: { highlight: Highlight }) {
  const hostStyle = HOST_COLORS[highlight.host] || 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-orange-500/30 transition-all">
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
            className="text-sm text-zinc-500 hover:text-orange-500 transition truncate max-w-[200px]"
          >
            {highlight.episode_title}
          </Link>
        </div>

        {/* Share button */}
        <button
          className="shrink-0 text-zinc-600 hover:text-orange-500 transition p-1"
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
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
