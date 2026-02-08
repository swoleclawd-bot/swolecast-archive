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
      <div className="absolute inset-0 bg-gradient-to-b from-[#2DDCE0]/10 via-[#150D25] to-[#150D25]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#E83E8C]/15 via-[#7B5EA7]/10 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
          <span className="text-cyan-400">SWOLECAST</span>
          <br />
          <span className="text-white">ARCHIVE</span>
        </h1>
        <p className="text-[#B8A9D4] text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Search {episodeCount} episodes and {(wordCount / 1000000).toFixed(1)}M+ words of fantasy football wisdom.
          <br />
          <span className="text-[#6A5890] text-sm">Every take. Every draft. Every bold prediction.</span>
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for players, topics, strategies..."
              className="w-full bg-[#1A0E2E] border-2 border-[#3D2663] rounded-xl px-6 py-4 pl-12 text-white text-lg placeholder-[#6A5890] focus:outline-none focus:border-[#2DDCE0] focus:ring-2 focus:ring-[#2DDCE0]/20 transition"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6A5890]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#2DDCE0] to-[#E83E8C] hover:from-[#2DDCE0] hover:to-[#FF69B4] text-white font-bold px-6 py-2 rounded-lg transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[#5A4880] text-sm">Try:</span>
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
                router.push(`/search?q=${encodeURIComponent(s)}`);
              }}
              className="text-sm px-3 py-1 rounded-full bg-[#1E1335] text-[#B8A9D4] hover:bg-cyan-400/20 hover:text-cyan-300 border border-[#3D2663] hover:border-cyan-400/30 transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
