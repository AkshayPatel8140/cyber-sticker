import { readFileSync } from 'fs';
import { join } from 'path';
import StickerClient from './components/StickerClient';

interface Sticker {
  id: number;
  date: string;
  title: string;
  image_filename: string;
  prompt_text: string;
  remix_tip?: string;
}

function getStickers(): Sticker[] {
  const filePath = join(process.cwd(), 'src', 'data.json');
  const fileContents = readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export default function Home() {
  const stickers = getStickers();

  return (
    <StickerClient stickers={stickers} />
  );
}
