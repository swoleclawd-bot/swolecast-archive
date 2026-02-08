import Link from 'next/link';
import { formatDuration, formatDate, formatNumber } from '@/lib/utils';

interface EpisodeCardProps {
  id: string;
  title: string;
  published_at: string | null;
  duration_seconds: number | null;
  transcript_word_count: number;
  tags?: string[];
}

export default function EpisodeCard({
  id,
  title,
  published_at,
  duration_seconds,
  transcript_word_count,
  tags,
}: EpisodeCardProps) {
  return (
    <Link href={`/episodes/${id}`}>
      <div className="group bg-[#1A0E2E] border border-[#2D1B4E] rounded-xl p-5 hover:border-cyan-400/50 hover:bg-[#1A0E2E]/80 transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base group-hover:text-cyan-400 transition-colors line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-sm text-[#6A5890]">
              {published_at && (
                <span>{formatDate(published_at)}</span>
              )}
              {duration_seconds && (
                <>
                  <span className="text-[#4A3870]">•</span>
                  <span>{formatDuration(duration_seconds)}</span>
                </>
              )}
              {transcript_word_count > 0 && (
                <>
                  <span className="text-[#4A3870]">•</span>
                  <span>{formatNumber(transcript_word_count)} words</span>
                </>
              )}
            </div>
          </div>
          <div className="shrink-0 mt-1">
            <svg className="w-5 h-5 text-[#4A3870] group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
