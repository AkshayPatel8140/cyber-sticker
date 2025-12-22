'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ArchiveCard from './ArchiveCard';
import Toast from './Toast';
import ImageProtection from './ImageProtection';
import type { Sticker } from '../page';

interface StickerClientProps {
  featuredSticker: Sticker | null;
  allStickers: Sticker[];
}

export default function StickerClient({ featuredSticker, allStickers }: StickerClientProps) {
  const [showToast, setShowToast] = useState(false);

  const handleCopy = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      <ImageProtection />
      <Navbar />

      {/* Section 1: Hero */}
      <HeroSection featuredSticker={featuredSticker} />

      {/* Section 2: The Grid - All Stickers */}
      <section id="collection" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Header Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 max-w-3xl"
          >
            <p className="text-gray-600 text-base leading-relaxed">
              Every sticker comes with the exact prompt that created it. Skip the guesswork and learn directly from designs that caught the community&apos;s attention.
            </p>
          </motion.div>

          {/* Grid */}
          {allStickers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allStickers.map((sticker, index) => (
                <ArchiveCard
                  key={sticker.id}
                  sticker={sticker}
                  index={index}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No stickers available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-200 py-12 mt-0 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 CyberSticker. Daily AI Sticker Collection.
          </p>
        </div>
      </footer>

      <Toast show={showToast} message="Prompt copied to clipboard" />
    </div>
  );
}
