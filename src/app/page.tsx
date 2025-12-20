import { readFileSync } from 'fs';
import { join } from 'path';
import Image from 'next/image';
import CopyPromptButton from './components/CopyPromptButton';

interface Sticker {
  id: number;
  date: string;
  title: string;
  image_filename: string;
  prompt_text: string;
  remix_tip?: string;
}

function getStickers(): Sticker[] {
  const filePath = join(process.cwd(), 'src', 'data.json');
  const fileContents = readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

function getFeaturedSticker(stickers: Sticker[]): Sticker {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Try to find today's sticker
  const todaySticker = stickers.find(s => s.date === today);
  if (todaySticker) return todaySticker;
  
  // Find the most recent past date
  const sortedStickers = [...stickers].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Find the most recent sticker that's not in the future
  const pastStickers = sortedStickers.filter(s => s.date <= today);
  return pastStickers[0] || sortedStickers[0];
}

function getArchiveStickers(stickers: Sticker[], featured: Sticker): Sticker[] {
  return stickers
    .filter(s => s.id !== featured.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function Home() {
  const stickers = getStickers();
  const featuredSticker = getFeaturedSticker(stickers);
  const archiveStickers = getArchiveStickers(stickers, featuredSticker);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - The Daily Drop */}
      <section className="relative overflow-hidden border-b border-cyan-500/20">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_50%)]"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent animate-pulse" style={{ fontFamily: 'var(--font-orbitron)' }}>
              CYBERSTICKER
            </h1>
            <p className="font-mono text-cyan-400 text-sm sm:text-base tracking-widest uppercase">
              THE DAILY DROP
            </p>
          </div>

          {/* Featured Sticker */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              {/* Glowing border effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-magenta-500 to-cyan-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              
              <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-cyan-500/30">
                {/* Date badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-xs sm:text-sm text-cyan-400/80 uppercase tracking-wider">
                    {featuredSticker.date}
                  </span>
                </div>

                {/* Sticker Image */}
                <div className="relative w-full aspect-square mb-6 rounded-lg overflow-hidden bg-white/5">
                  <Image
                    src={`/stickers/${featuredSticker.image_filename}`}
                    alt={featuredSticker.title}
                    fill
                    className="object-contain p-4"
                    priority
                  />
                </div>

                {/* Title */}
                <h2 className="font-mono text-2xl sm:text-3xl font-bold text-center mb-6 text-cyan-300">
                  {featuredSticker.title}
                </h2>

                {/* Copy Prompt Button */}
                <div className="flex justify-center">
                  <CopyPromptButton promptText={featuredSticker.prompt_text} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Archive Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-magenta-400 to-cyan-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-orbitron)' }}>
            THE ARCHIVE
          </h2>
          <p className="font-mono text-magenta-400/80 text-sm tracking-widest uppercase">
            Previous Drops
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {archiveStickers.map((sticker) => (
            <div
              key={sticker.id}
              className="group relative bg-slate-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-magenta-500/0 group-hover:from-cyan-500/10 group-hover:to-magenta-500/10 transition-all duration-300"></div>
              
              <div className="relative p-4">
                {/* Date */}
                <span className="font-mono text-xs text-cyan-400/60 uppercase tracking-wider block mb-2">
                  {sticker.date}
                </span>

                {/* Image */}
                <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-white/5">
                  <Image
                    src={`/stickers/${sticker.image_filename}`}
                    alt={sticker.title}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Title */}
                <h3 className="font-mono text-sm font-semibold text-cyan-300 text-center line-clamp-2">
                  {sticker.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono text-xs text-cyan-400/60 uppercase tracking-widest">
            Daily AI Sticker Collection
          </p>
        </div>
      </footer>
    </div>
  );
}
