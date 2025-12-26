/**
 * Centralized Stickers API Service
 * All sticker-related database operations should be handled here
 */

import { supabase } from '../supabase';

export interface Sticker {
  id: number;
  title: string;
  prompt: string;
  image_url: string;
  publish_date: string;
  is_premium: boolean;
  likes?: number;
  remix_idea?: string | null;
}

/**
 * Fetches the latest sticker where publish_date is today or earlier
 * Orders by publish_date DESC, id DESC to get the most recent sticker
 * (handles multiple stickers per day by selecting the one with highest id)
 * 
 * @returns The latest sticker or null if none found
 */
export async function getTodaySticker(): Promise<Sticker | null> {
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

    // Map the data to include likes with default value
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
 * 
 * @returns Array of all stickers, ordered by publish_date descending
 */
export async function getAllStickers(): Promise<Sticker[]> {
  try {
    const { data, error } = await supabase
      .from('stickers')
      .select('*')
      .order('publish_date', { ascending: false });

    if (error) {
      console.error('Error fetching stickers:', error);
      return [];
    }

    // Map the data to include likes with default value
    return (data || []).map(sticker => ({
      ...sticker,
      likes: sticker.likes || 0,
    }));
  } catch (error) {
    console.error('Error in getAllStickers:', error);
    return [];
  }
}

/**
 * Fetches a single sticker by its ID
 * 
 * @param id - The sticker ID (as string, will be parsed to number)
 * @returns The sticker or null if not found or invalid ID
 */
export async function getStickerById(id: string): Promise<Sticker | null> {
  try {
    // Validate id is a number
    const stickerId = parseInt(id);
    if (isNaN(stickerId)) {
      return null;
    }

    // Select all fields - remix_idea will be null if column doesn't exist
    const { data, error } = await supabase
      .from('stickers')
      .select('*')
      .eq('id', stickerId)
      .single();

    if (error) {
      // PGRST116 means no rows found
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching sticker:', JSON.stringify(error, null, 2));
      return null;
    }

    // Map the data to our Sticker interface with default values
    return {
      id: data.id,
      title: data.title,
      prompt: data.prompt,
      image_url: data.image_url,
      publish_date: data.publish_date,
      remix_idea: data.remix_idea || null,
      likes: data.likes || 0,
      is_premium: data.is_premium || false,
    };
  } catch (error) {
    console.error('Error in getStickerById:', error);
    return null;
  }
}

