import SearchHero from '@/components/SearchHero';
import EpisodeCard from '@/components/EpisodeCard';
import QuoteCard from '@/components/QuoteCard';
import Link from 'next/link';
import { getRecentEpisodes, getEpisodeCount, getTotalWordCount } from '@/lib/episodes';
import { getFeaturedHighlights } from '@/lib/highlights';

export default function HomePage() {
  const episodes = getRecentEpisodes(6);
  const episodeCount = getEpisodeCount();
  const wordCount = getTotalWordCount();
  const highlights = getFeaturedHighlights(3);

  return (
    <div>
      {/* Hero Search */}
      <SearchHero episodeCount={episodeCount} wordCount={wordCount} />

      {/* Stats Bar */}
      <section className="border-y border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-black text-orange-500">{episodeCount}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Episodes</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">{(wordCount / 1000000).toFixed(1)}M+</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Words Transcribed</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">4</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Hosts</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">100%</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Searchable</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Episodes */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">
            Recent <span className="text-orange-500">Episodes</span>
          </h2>
          <Link href="/episodes" className="text-sm text-orange-500 hover:text-orange-400 font-medium transition">
            View All →
          </Link>
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
      </section>

      {/* Featured Quotes */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">
            Best <span className="text-orange-500">Of</span> 🎯
          </h2>
          <Link href="/best-of" className="text-sm text-orange-500 hover:text-orange-400 font-medium transition">
            See All Quotes →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {highlights.map(h => (
            <QuoteCard key={h.id} highlight={h} />
          ))}
        </div>
      </section>
    </div>
  );
}
