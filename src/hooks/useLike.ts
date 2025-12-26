'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Helper to get liked state from localStorage
 */
const getLikedState = (stickerId: number): boolean => {
  if (typeof window === 'undefined') return false;
  const likedStickers = JSON.parse(localStorage.getItem('likedStickers') || '[]');
  return likedStickers.includes(stickerId);
};

/**
 * Helper to set liked state in localStorage
 */
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

/**
 * Centralized hook for managing sticker likes
 * Handles state, localStorage persistence, and Supabase API calls
 * 
 * @param stickerId - The ID of the sticker
 * @param initialLikes - The initial like count from the database
 * @returns Object containing like state and handlers
 */
export function useLike(stickerId: number, initialLikes: number) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize liked state from localStorage on mount
  useEffect(() => {
    setLiked(getLikedState(stickerId));
  }, [stickerId]);

  // Update likes when initialLikes changes (e.g., after page refresh)
  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);

  /**
   * Toggles the like state for a sticker
   * Handles optimistic UI updates and Supabase API calls
   * 
   * @param event - Optional React event to stop propagation if needed
   */
  const handleLike = async (event?: React.MouseEvent) => {
    // Stop event propagation if event is provided (useful for nested clickable elements)
    if (event) {
      event.stopPropagation();
    }

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

  /**
   * Formats the like count for display
   * Converts numbers >= 1000 to "k" format (e.g., 1500 -> "1.5k")
   * 
   * @param count - The like count to format
   * @returns Formatted string representation of the count
   */
  const formatLikes = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return {
    likes,
    liked,
    isLoading,
    handleLike,
    formatLikes,
  };
}

