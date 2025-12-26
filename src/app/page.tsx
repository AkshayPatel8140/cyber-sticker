import StickerClient from './components/StickerClient';
import { getTodaySticker, getAllStickers } from '@/lib/api/stickers';
import type { Sticker } from '@/lib/api/stickers';

// Re-export Sticker interface for backward compatibility
export type { Sticker };

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
