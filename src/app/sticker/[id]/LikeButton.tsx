'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface LikeButtonProps {
  stickerId: number;
  initialLikes: number;
}

// Helper to get liked state from localStorage
const getLikedState = (stickerId: number): boolean => {
  if (typeof window === 'undefined') return false;
  const likedStickers = JSON.parse(localStorage.getItem('likedStickers') || '[]');
  return likedStickers.includes(stickerId);
};

// Helper to set liked state in localStorage
const setLikedState = (stickerId: number, liked: boolean): void => {
  if (typeof window === 'undefined') return;
  const likedStickers = JSON.parse(localStorage.getItem('likedStickers') || '[]');
  if (liked) {
    if (!likedStickers.includes(stickerId)) {
      likedStickers.push(stickerId);
    }
  } else {
    const index = likedStickers.indexOf(stickerId);
    if (index > -1) {
      likedStickers.splice(index, 1);
    }
  }
  localStorage.setItem('likedStickers', JSON.stringify(likedStickers));
};

export default function LikeButton({ stickerId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize liked state from localStorage on mount
  useEffect(() => {
    setLiked(getLikedState(stickerId));
  }, [stickerId]);

  const handleLike = async () => {
    // Prevent multiple clicks while loading
    if (isLoading) return;

    // Determine if we're liking or unliking
    const willLike = !liked;
    const previousLikes = likes;
    const newLikes = willLike ? likes + 1 : Math.max(likes - 1, 0);

    // Optimistic UI update
    setLikes(newLikes);
    setLiked(willLike);
    setIsLoading(true);

    try {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('toggle_likes', {
        sticker_id: stickerId,
        should_increment: willLike,
      });

      if (rpcError) {
        // If RPC function doesn't exist or fails, try direct UPDATE
        console.warn('RPC function failed, trying direct UPDATE:', rpcError);
        
        const { data: updateData, error: updateError } = await supabase
          .from('stickers')
          .update({ likes: newLikes })
          .eq('id', stickerId)
          .select('likes')
          .single();

        if (updateError) {
          // Both methods failed - revert
          setLikes(previousLikes);
          setLiked(!willLike);
          console.error('Error toggling likes (both RPC and UPDATE failed):', {
            rpcError,
            updateError,
          });
        } else if (updateData && typeof updateData.likes === 'number') {
          setLikes(updateData.likes);
          // Update localStorage on success
          setLikedState(stickerId, willLike);
        }
      } else {
        // RPC succeeded, update with returned value if available
        if (rpcData !== null && rpcData !== undefined) {
          setLikes(rpcData);
        }
        // Update localStorage on success
        setLikedState(stickerId, willLike);
      }
    } catch (error) {
      // Revert on error
      setLikes(previousLikes);
      setLiked(!willLike);
      console.error('Error toggling likes (catch block):', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format likes count
  const formatLikes = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <motion.button
      onClick={handleLike}
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

