'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchHero({ episodeCount, wordCount }: { episodeCount: number; wordCount: number }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const suggestions = ['Patrick Mahomes', 'best ball strategy', 'rookie draft', 'trade value', 'waiver wire'];

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-zinc-950 to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
          <span className="text-orange-500">SWOLECAST</span>
          <br />
          <span className="text-white">ARCHIVE</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Search {episodeCount} episodes and {(wordCount / 1000000).toFixed(1)}M+ words of fantasy football wisdom.
          <br />
          <span className="text-zinc-500 text-sm">Every take. Every draft. Every bold prediction.</span>
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for players, topics, strategies..."
              className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-xl px-6 py-4 pl-12 text-white text-lg placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-zinc-600 text-sm">Try:</span>
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
                router.push(`/search?q=${encodeURIComponent(s)}`);
              }}
              className="text-sm px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 hover:bg-orange-500/20 hover:text-orange-400 border border-zinc-700 hover:border-orange-500/30 transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
