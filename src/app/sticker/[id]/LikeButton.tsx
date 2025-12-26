'use client';

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLike } from '@/hooks/useLike';

interface LikeButtonProps {
  stickerId: number;
  initialLikes: number;
}

export default function LikeButton({ stickerId, initialLikes }: LikeButtonProps) {
  const { likes, liked, isLoading, handleLike, formatLikes } = useLike(stickerId, initialLikes);

  return (
    <motion.button
      onClick={() => handleLike()}
      disabled={isLoading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Heart
        className={`w-5 h-5 ${
          liked ? 'text-red-500 fill-red-500' : 'text-gray-600'
        }`}
      />
      <span className="text-sm font-medium text-gray-700">
        {formatLikes(likes)}
      </span>
    </motion.button>
  );
}

