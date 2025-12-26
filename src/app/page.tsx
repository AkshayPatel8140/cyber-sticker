import StickerClient from './components/StickerClient';
import { supabase } from '@/lib/supabase';

export interface Sticker {
  id: number;
  title: string;
  prompt: string;
  image_url: string;
  publish_date: string;
  is_premium: boolean;
  likes?: number;
}

/**
 * Fetches the latest sticker where publish_date is today or earlier
 * Orders by publish_date DESC, id DESC to get the most recent sticker
 * (handles multiple stickers per day by selecting the one with highest id)
 */
async function getTodaySticker(): Promise<Sticker | null> {
  try {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Get the latest sticker where publish_date <= today
    // Order by publish_date DESC, then id DESC to handle multiple stickers per day
    const { data: latestSticker, error: latestError } = await supabase
      .from('stickers')
      .select('*')
      .lte('publish_date', today)
      .order('publish_date', { ascending: false })
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (latestError) {
      // PGRST116 means no rows found - this is expected if no stickers exist
      if (latestError.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching latest sticker:', latestError);
      return null;
    }

    // Map the data to include likes
    return latestSticker ? {
      ...latestSticker,
      likes: latestSticker.likes || 0,
    } : null;
  } catch (error) {
    console.error('Error in getTodaySticker:', error);
    return null;
  }
}

/**
 * Fetches all stickers for the archive grid, ordered by date (newest first)
 */
async function getAllStickers(): Promise<Sticker[]> {
  try {
    const { data, error } = await supabase
      .from('stickers')
      .select('*')
      .order('publish_date', { ascending: false });

    if (error) {
      console.error('Error fetching stickers:', error);
      return [];
    }

    // Map the data to include likes
    return (data || []).map(sticker => ({
      ...sticker,
      likes: sticker.likes || 0,
    }));
  } catch (error) {
    console.error('Error in getAllStickers:', error);
    return [];
  }
}

export const revalidate = 300; // Revalidate every 60 seconds

export default async function Home() {
  const [todaySticker, allStickers] = await Promise.all([
    getTodaySticker(),
    getAllStickers(),
  ]);

  return (
    <StickerClient 
      featuredSticker={todaySticker} 
      allStickers={allStickers} 
    />
  );
}
