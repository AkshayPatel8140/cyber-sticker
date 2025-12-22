/**
 * Constructs the full Supabase Storage URL for an image
 * 
 * @param imageUrl - Can be either:
 *   - A full URL (already complete)
 *   - A filename (e.g., "sticker-1.jpg") - will be constructed
 * @returns The full Supabase Storage URL
 */
export function getStickerImageUrl(imageUrl: string): string {
  // If it's already a full URL (starts with http:// or https://), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Otherwise, construct the full URL from the filename
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  // Remove trailing slash if present
  const baseUrl = supabaseUrl.replace(/\/$/, '');
  return `${baseUrl}/storage/v1/object/public/stickers/${imageUrl}`;
}

