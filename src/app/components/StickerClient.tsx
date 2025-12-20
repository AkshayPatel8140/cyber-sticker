'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ArchiveCard from './ArchiveCard';
import PricingSection from './PricingSection';
import Toast from './Toast';
import ImageProtection from './ImageProtection';

interface Sticker {
  id: number;
  date: string;
  title: string;
  image_filename: string;
  prompt_text: string;
}

interface StickerClientProps {
  stickers: Sticker[];
}

export default function StickerClient({ stickers }: StickerClientProps) {
  const [showToast, setShowToast] = useState(false);

  const handleCopy = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Sort stickers by date (newest first)
  const sortedStickers = [...stickers].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get featured sticker (most recent)
  const featuredSticker = sortedStickers[0];

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
              Every sticker comes with the exact prompt that created it. Skip the guesswork and learn directly from designs that caught the community's attention.
            </p>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedStickers.map((sticker, index) => (
              <ArchiveCard
                key={sticker.id}
                sticker={sticker}
                index={index}
                onCopy={handleCopy}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Pricing/Subscribe */}
      <PricingSection />

      {/* Footer */}
      <footer className="relative border-t border-gray-200 py-12 mt-24 bg-gray-50">
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
