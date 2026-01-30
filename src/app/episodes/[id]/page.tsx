import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEpisodeById, getTranscript, getAllEpisodes } from '@/lib/episodes';
import { formatDate, formatDuration, formatNumber, getYouTubeId } from '@/lib/utils';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const episodes = getAllEpisodes();
  return episodes.map(ep => ({ id: ep.id }));
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const episode = getEpisodeById(params.id);
  if (!episode) return { title: 'Episode Not Found' };
  return {
    title: `${episode.title} — Swolecast Archive`,
    description: episode.description || `Full transcript and details for ${episode.title}`,
  };
}

export default async function EpisodePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const episode = getEpisodeById(params.id);
  if (!episode) notFound();

  const transcript = getTranscript(params.id);
  const youtubeId = getYouTubeId(episode.youtube_url);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/episodes" className="inline-flex items-center gap-1 text-zinc-500 hover:text-orange-500 transition text-sm mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Episodes
      </Link>

      {/* Title & Meta */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
          {episode.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          {episode.published_at && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(episode.published_at)}
            </span>
          )}
          {episode.duration_seconds && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(episode.duration_seconds)}
            </span>
          )}
          {episode.transcript_word_count > 0 && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {formatNumber(episode.transcript_word_count)} words
            </span>
          )}
        </div>
      </div>

      {/* YouTube Embed */}
      {youtubeId && (
        <div className="mb-8 rounded-xl overflow-hidden border border-zinc-800">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={episode.title}
            />
          </div>
        </div>
      )}

      {/* Description */}
      {episode.description && (
        <div className="mb-8 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-2">Description</h2>
          <p className="text-zinc-300 whitespace-pre-wrap">{episode.description}</p>
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Full Transcript</h2>
            <span className="text-sm text-zinc-500">
              {formatNumber(transcript.word_count)} words
            </span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8">
            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base max-h-[600px] overflow-y-auto pr-2">
              {transcript.content}
            </div>
          </div>
        </div>
      )}

      {/* YouTube Link */}
      {episode.youtube_url && (
        <div className="text-center py-6">
          <a
            href={episode.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
              <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Watch on YouTube
          </a>
        </div>
      )}
    </div>
  );
}
