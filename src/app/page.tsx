import StickerClient from './components/StickerClient';
import { supabase } from '@/lib/supabase';

export interface Sticker {
  id: number;
  title: string;
  prompt: string;
  image_url: string;
  publish_date: string;
  is_premium: boolean;
}

/**
 * Fetches the sticker for today's date
 * Falls back to the latest sticker if no sticker exists for today
 */
async function getTodaySticker(): Promise<Sticker | null> {
  try {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // First, try to get sticker for today
    const { data: todaySticker, error: todayError } = await supabase
      .from('stickers')
      .select('*')
      .eq('publish_date', today)
      .single();

    if (!todayError && todaySticker) {
      return todaySticker;
    }

    // If no sticker for today, get the latest sticker
    const { data: latestSticker, error: latestError } = await supabase
      .from('stickers')
      .select('*')
      .order('publish_date', { ascending: false })
      .limit(1)
      .single();

    if (latestError || !latestSticker) {
      console.error('Error fetching latest sticker:', latestError);
      return null;
    }

    return latestSticker;
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

    return data || [];
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
