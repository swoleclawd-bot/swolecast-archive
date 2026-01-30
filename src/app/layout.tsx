import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Swolecast Archive — Search 214 Episodes of Fantasy Football Wisdom',
  description: 'The complete searchable archive of the Swolecast podcast. Search transcripts, browse episodes, and find the best fantasy football takes.',
  openGraph: {
    title: 'Swolecast Archive',
    description: 'Search 214 episodes and 2M+ words of fantasy football wisdom.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
