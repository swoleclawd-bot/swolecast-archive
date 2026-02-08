'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#150D25]/95 backdrop-blur border-b border-[#2D1B4E]">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-black tracking-tighter">
              <span className="text-cyan-400">SWOLE</span>
              <span className="text-white">CAST</span>
            </span>
            <span className="hidden sm:inline text-xs text-[#6A5890] uppercase tracking-widest mt-1">
              Archive
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg">
            <div className="relative w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search episodes, players, topics..."
                className="w-full bg-[#1A0E2E] border border-[#3D2663] rounded-lg px-4 py-2 pl-10 text-white placeholder-[#6A5890] focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A5890]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/episodes" className="text-[#B8A9D4] hover:text-cyan-400 transition text-sm font-medium">
              Episodes
            </Link>
            <Link href="/best-of" className="text-[#B8A9D4] hover:text-cyan-400 transition text-sm font-medium">
              Best Of
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#B8A9D4] hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 pb-2 space-y-3">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search episodes..."
                className="w-full bg-[#1A0E2E] border border-[#3D2663] rounded-lg px-4 py-2 text-white placeholder-[#6A5890] focus:outline-none focus:border-cyan-400"
              />
            </form>
            <nav className="flex flex-col gap-2">
              <Link href="/episodes" className="text-[#B8A9D4] hover:text-cyan-400 transition py-1" onClick={() => setMenuOpen(false)}>
                Episodes
              </Link>
              <Link href="/best-of" className="text-[#B8A9D4] hover:text-cyan-400 transition py-1" onClick={() => setMenuOpen(false)}>
                Best Of
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
