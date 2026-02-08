import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#2D1B4E] bg-[#150D25] mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tighter">
              <span className="text-cyan-400">SWOLE</span>
              <span className="text-white">CAST</span>
            </span>
            <span className="text-xs text-[#5A4880] uppercase tracking-widest">Archive</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-[#6A5890]">
            <Link href="/episodes" className="hover:text-cyan-400 transition">Episodes</Link>
            <Link href="/best-of" className="hover:text-cyan-400 transition">Best Of</Link>
            <Link href="/search" className="hover:text-cyan-400 transition">Search</Link>
          </nav>
          <p className="text-xs text-[#5A4880]">
            Built for Swolies 🏈
          </p>
        </div>
      </div>
    </footer>
  );
}
