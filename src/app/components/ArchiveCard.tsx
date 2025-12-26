'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Copy, Heart, Lock } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStickerImageUrl } from '@/lib/image-url';
import { useLike } from '@/hooks/useLike';
import type { Sticker } from '../page';

interface ArchiveCardProps {
  sticker: Sticker;
  index: number;
  onCopy: () => void;
}

// Generate mock artist (for demo purposes)
// const getMockArtist = (id: number) => {
//   const artists = ['@tariqHasanSyed', 'BKD', '@edferreirajr', '@_raffanascimento', '@hahibomarov', 'Gemini'];
//   return artists[id % artists.length];
// };

export default function ArchiveCard({ sticker, index, onCopy }: ArchiveCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const premium = sticker.is_premium;
  
  // Use centralized like hook
  const { likes: likeCount, liked, isLoading, handleLike, formatLikes } = useLike(
    sticker.id,
    sticker.likes || 0
  );
  
  // Use this if you want to display the artist name
  // const artist = getMockArtist(sticker.id);

  const handleCopy = async () => {
    if (premium) return; // Don't allow copying premium prompts
    try {
      await navigator.clipboard.writeText(sticker.prompt);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };


  const handleUnlockPro = () => {
    // Navigate to pricing page so users can choose their plan
    router.push('/pricing');
  };

  const handleCardClick = () => {
    // Navigate to sticker detail page
    router.push(`/sticker/${sticker.id}`);
  };

  // Prevent right-click and drag ONLY on image area
  const handleImageContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleImageDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // Truncate prompt text to exactly 2 lines with ellipsis
  const truncateToTwoLines = (text: string) => {
    // Approximate character count for 2 lines (adjust based on font size and width)
    const maxChars = 100;
    if (text.length <= maxChars) return text;
    // Find the last space before maxChars to avoid cutting words
    const truncated = text.substring(0, maxChars);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxChars * 0.8) {
      return text.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03, duration: 0.5, ease: 'easeOut' }}
      className="group relative bg-slate-900 rounded-xl overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Container - Protected area ONLY */}
      <div 
        data-image-protected
        className="relative aspect-square w-full select-none"
        onContextMenu={handleImageContextMenu}
        onDragStart={handleImageDragStart}
      >
        {/* Transparent overlay to prevent direct image interaction */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer"
          onContextMenu={handleImageContextMenu}
          onDragStart={handleImageDragStart}
        />
        
        <Image
          src={getStickerImageUrl(sticker.image_url)}
          alt={sticker.title}
          fill
          className="object-cover select-none pointer-events-none"
          draggable={false}
          onContextMenu={handleImageContextMenu}
          onDragStart={handleImageDragStart}
        />

        {/* Title - Top Left in rounded transparent black box */}
        <div className="absolute top-4 left-4 z-20 pointer-events-auto">
          <div className="px-3 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
            <h3 className="text-sm font-medium text-white uppercase">
              {sticker.title}
            </h3>
          </div>
        </div>

        {/* Like Button - Top Right (clickable) */}
        <motion.button
          onClick={handleLike}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 bg-black/60 backdrop-blur-sm rounded-full pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ paddingTop: '3px', paddingBottom: '3px' }}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'text-red-500 fill-red-500' : 'text-white fill-white'}`} />
          <span className="text-xs font-medium text-white">{formatLikes(likeCount)}</span>
        </motion.button>

        {/* Bottom Overlay - Prompt Text or Premium Badge */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 pointer-events-auto">
          {premium ? (
            // Premium: Show Unlock (Pro) button
            <div className="flex items-center justify-between">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnlockPro();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3 text-white" />
                <span className="text-xs font-medium text-white">PREMIUM</span>
              </motion.button>
              {/* <span className="text-xs text-white/60">by {artist}</span> */}
            </div>
          ) : (
            // Free: Show prompt text (2 lines) and copy button
            <div className="space-y-3">
              {/* Prompt Text - Exactly 2 lines with ellipsis */}
              <p className="text-sm text-white line-clamp-2 leading-relaxed">
                {truncateToTwoLines(sticker.prompt)}
              </p>
              
              {/* Bottom Row: Copy Button and Artist */}
              <div className="flex items-center justify-between">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  whileHover={{ opacity: 0.9 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm hover:bg-black/70 text-white rounded-full text-xs font-medium transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </motion.button>

                {/* Use this if you want to display the artist name */}
                {/* <span className="text-xs text-white/60">
                  by {artist}
                </span> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
