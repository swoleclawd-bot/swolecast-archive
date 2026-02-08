import QuoteCard from '@/components/QuoteCard';
import Link from 'next/link';
import { getHighlights, getHosts, getAllTags } from '@/lib/highlights';

export const metadata = {
  title: 'Best Of — Swolecast Archive',
  description: 'The greatest quotes and moments from the Swolecast podcast.',
};

export default async function BestOfPage(props: {
  searchParams: Promise<{ host?: string; tag?: string }>;
}) {
  const searchParams = await props.searchParams;
  const selectedHost = searchParams.host;
  const selectedTag = searchParams.tag;

  const highlights = getHighlights({ host: selectedHost, tag: selectedTag });
  const hosts = getHosts();
  const tags = getAllTags();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          Best <span className="text-cyan-400">Of</span> 🎯
        </h1>
        <p className="text-[#6A5890]">
          The greatest quotes, takes, and moments from the Swolecast.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Host Filter */}
        <div>
          <h3 className="text-sm font-bold text-[#B8A9D4] uppercase tracking-wide mb-2">Filter by Host</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/best-of"
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                !selectedHost
                  ? 'bg-cyan-400 text-white border-cyan-400'
                  : 'bg-[#1A0E2E] text-[#B8A9D4] border-[#3D2663] hover:border-cyan-400/50'
              }`}
            >
              All
            </Link>
            {hosts.map(host => (
              <Link
                key={host}
                href={`/best-of?host=${host}${selectedTag ? `&tag=${selectedTag}` : ''}`}
                className={`text-sm px-3 py-1.5 rounded-full border transition ${
                  selectedHost === host
                    ? 'bg-cyan-400 text-white border-cyan-400'
                    : 'bg-[#1A0E2E] text-[#B8A9D4] border-[#3D2663] hover:border-cyan-400/50'
                }`}
              >
                {host}
              </Link>
            ))}
          </div>
        </div>

        {/* Tag Filter */}
        <div>
          <h3 className="text-sm font-bold text-[#B8A9D4] uppercase tracking-wide mb-2">Filter by Topic</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/best-of${selectedHost ? `?host=${selectedHost}` : ''}`}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                !selectedTag
                  ? 'bg-cyan-400 text-white border-cyan-400'
                  : 'bg-[#1A0E2E] text-[#B8A9D4] border-[#3D2663] hover:border-cyan-400/50'
              }`}
            >
              All
            </Link>
            {tags.map(tag => (
              <Link
                key={tag}
                href={`/best-of?${selectedHost ? `host=${selectedHost}&` : ''}tag=${tag}`}
                className={`text-sm px-3 py-1.5 rounded-full border transition ${
                  selectedTag === tag
                    ? 'bg-cyan-400 text-white border-cyan-400'
                    : 'bg-[#1A0E2E] text-[#B8A9D4] border-[#3D2663] hover:border-cyan-400/50'
                }`}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quotes Grid */}
      {highlights.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {highlights.map(h => (
            <QuoteCard key={h.id} highlight={h} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="text-xl font-bold text-white mb-2">No quotes match those filters</h2>
          <p className="text-[#6A5890] mb-4">Try a different combination.</p>
          <Link href="/best-of" className="text-cyan-400 hover:text-cyan-300 font-medium transition">
            Clear Filters →
          </Link>
        </div>
      )}

      {/* Coming Soon Banner */}
      <div className="mt-12 bg-gradient-to-r from-cyan-400/10 to-[#1A0E2E] border border-cyan-400/20 rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">🚀 More Quotes Coming Soon</h3>
        <p className="text-[#B8A9D4] max-w-lg mx-auto">
          We&apos;re using AI to surface the best moments from all 214 episodes.
          Check back for hundreds of curated quotes, hot takes, and legendary predictions.
        </p>
      </div>
    </div>
  );
}
