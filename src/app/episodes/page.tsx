import EpisodeCard from '@/components/EpisodeCard';
import { getAllEpisodes } from '@/lib/episodes';

export const metadata = {
  title: 'All Episodes — Swolecast Archive',
  description: 'Browse all 214 Swolecast episodes with full transcripts.',
};

export default function EpisodesPage() {
  const episodes = getAllEpisodes();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          All <span className="text-orange-500">Episodes</span>
        </h1>
        <p className="text-zinc-500">
          {episodes.length} episodes, newest first. Every episode has a full searchable transcript.
        </p>
      </div>

      <div className="grid gap-3">
        {episodes.map(ep => (
          <EpisodeCard
            key={ep.id}
            id={ep.id}
            title={ep.title}
            published_at={ep.published_at}
            duration_seconds={ep.duration_seconds}
            transcript_word_count={ep.transcript_word_count}
          />
        ))}
      </div>
    </div>
  );
}
