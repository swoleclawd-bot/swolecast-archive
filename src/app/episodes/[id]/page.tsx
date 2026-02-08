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
      <Link href="/episodes" className="inline-flex items-center gap-1 text-[#6A5890] hover:text-cyan-400 transition text-sm mb-6">
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
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#B8A9D4]">
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
        <div className="mb-8 rounded-xl overflow-hidden border border-[#2D1B4E]">
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
        <div className="mb-8 p-5 bg-[#1A0E2E] border border-[#2D1B4E] rounded-xl">
          <h2 className="text-sm font-bold text-[#B8A9D4] uppercase tracking-wide mb-2">Description</h2>
          <p className="text-[#D4C4F0] whitespace-pre-wrap">{episode.description}</p>
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Full Transcript</h2>
            <span className="text-sm text-[#6A5890]">
              {formatNumber(transcript.word_count)} words
            </span>
          </div>
          <div className="bg-[#1A0E2E] border border-[#2D1B4E] rounded-xl p-6 md:p-8">
            <div className="text-[#D4C4F0] leading-relaxed whitespace-pre-wrap text-sm md:text-base max-h-[600px] overflow-y-auto pr-2">
              {transcript.content}
            </div>
          </div>
        </div>
      )}

      {/* Listen on Spotify */}
      <div className="mb-8 p-5 bg-[#1A0E2E] border border-[#2D1B4E] rounded-xl">
        <h2 className="text-sm font-bold text-[#B8A9D4] uppercase tracking-wide mb-3">🎧 Listen on Spotify</h2>
        <iframe 
          style={{ borderRadius: '12px' }}
          src="https://open.spotify.com/embed/show/18TkH1Plo4jsqmbHHheAYl?utm_source=generator&theme=0"
          width="100%" 
          height="152" 
          frameBorder="0" 
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
          title="Swolecast on Spotify"
        />
        <p className="text-xs text-[#6A5890] mt-2 text-center">
          Find this episode on the Swolecast Spotify page
        </p>
      </div>

      {/* Watch/YouTube Links */}
      {episode.youtube_url && (
        <div className="text-center py-6 flex flex-wrap justify-center gap-4">
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
            Watch Full Video
          </a>
          <a
            href="https://open.spotify.com/show/18TkH1Plo4jsqmbHHheAYl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold px-6 py-3 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Listen on Spotify
          </a>
        </div>
      )}
    </div>
  );
}
