import Link from 'next/link';
import { searchEpisodes, SortOrder } from '@/lib/search';
import { formatDate, formatDuration, highlightText } from '@/lib/utils';

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const sort = (searchParams.sort as SortOrder) || 'newest';
  const results = query ? searchEpisodes(query, 50, sort) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Form */}
      <form action="/search" method="GET" className="mb-8">
        <div className="relative">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search episodes, players, topics..."
            className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-xl px-6 py-4 pl-12 text-white text-lg placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
            autoFocus
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </form>

      {/* Results Header with Sort */}
      {query && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-lg text-zinc-400">
            {results.length > 0 ? (
              <>
                Found <span className="text-white font-bold">{results.length}</span> episodes matching{' '}
                <span className="text-orange-500 font-bold">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              <>
                No results for <span className="text-orange-500 font-bold">&ldquo;{query}&rdquo;</span>
              </>
            )}
          </h1>
          
          {results.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Sort:</span>
              <div className="flex bg-zinc-800 rounded-lg p-1">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&sort=newest`}
                  className={`px-3 py-1.5 text-sm rounded-md transition ${
                    sort === 'newest' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Newest
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&sort=oldest`}
                  className={`px-3 py-1.5 text-sm rounded-md transition ${
                    sort === 'oldest' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Oldest
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&sort=relevance`}
                  className={`px-3 py-1.5 text-sm rounded-md transition ${
                    sort === 'relevance' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Relevance
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {results.map(result => {
          const highlighted = highlightText(result.snippet, query);
          const parts = highlighted.split('|||');

          return (
            <Link key={result.id} href={`/episodes/${result.id}`}>
              <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-orange-500/50 transition-all cursor-pointer mb-4">
                <h3 className="text-white font-semibold group-hover:text-orange-500 transition-colors mb-2">
                  {result.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-zinc-500 mb-3">
                  {result.published_at && <span>{formatDate(result.published_at)}</span>}
                  {result.duration_seconds && (
                    <>
                      <span className="text-zinc-700">•</span>
                      <span>{formatDuration(result.duration_seconds)}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {parts.map((part, i) =>
                    i % 2 === 1 ? (
                      <mark key={i} className="bg-orange-500/30 text-orange-300 rounded px-0.5">
                        {part}
                      </mark>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {!query && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">Search the Swolecast Archive</h2>
          <p className="text-zinc-500">
            Search across 478 episodes and 4.8M+ words of fantasy football wisdom.
            <br />
            Try player names, strategies, or topics.
          </p>
        </div>
      )}
    </div>
  );
}
