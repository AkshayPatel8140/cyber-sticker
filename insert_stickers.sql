-- SQL script to insert all stickers from data.json into the stickers table
-- Run this script in your Supabase SQL editor
-- 
-- Note: Since publish_date has a UNIQUE constraint, dates have been adjusted to be sequential
-- (original data had multiple stickers on 2025-12-23)

INSERT INTO stickers (id, title, prompt, image_url, publish_date, is_premium) VALUES
(1, 'The Retro Terminal', 'A vector die-cut sticker of a vintage bulky computer monitor displaying green command line text. Flat design, thick bold black outlines, simple shading. 90s tech nostalgia aesthetic. Wide white border, isolated on a pure white background.', '/stickers/sticker-1.jpg', '2025-12-20', false),
(2, 'Cyberpunk Neko', 'A die-cut sticker of a cyberpunk cat head wearing high-tech neon goggles. Vector illustration, vibrant purple and cyan colors, flat style, bold graphic lines. Minimalist shading. Thick white contour, isolated on white background.', '/stickers/sticker-2.jpg', '2025-12-21', false),
(3, 'Developer''s Fuel', 'A vector sticker of a takeaway coffee cup with a ''Java'' logo on the sleeve. Steam rising in a stylized swirl. Flat colors, warm brown and orange tones. Thick black outline, 2D vector art. Die-cut with a white border, white background.', '/stickers/sticker-3.jpg', '2025-12-22', true),
(4, 'The Glitch Ghost', 'A cute cartoon ghost character slightly glitching with pixelated edges. Turquoise and pink color palette. Vector art, flat design, thick bold outlines. Die-cut sticker style with a wide white border, isolated on white background.', '/stickers/sticker-4.jpg', '2025-12-23', false),
(5, 'Pixel Heart', 'A vibrant red pixel-art heart with a shiny highlight. 8-bit retro gaming style. Vector illustration, sharp edges, bold black outline. Die-cut sticker format, white border, isolated on white background.', '/stickers/sticker-5.jpg', '2025-12-24', false),
(6, 'Cyberpunk Cat', 'High-quality vector die-cut sticker of a cyberpunk cat wearing neon goggles and a tech jacket, bold thick black outlines, flat vector colors, minimal shading, pop-culture sci-fi style, clean white background, centered composition, sticker-ready, no text, no gradients', '/stickers/sticker-6.jpg', '2025-12-25', true),
(7, 'AI Brain Power', 'High-quality vector die-cut sticker of a glowing artificial intelligence brain with circuit patterns and lightning bolts, bold thick outlines, flat vector colors, simple shading, tech-inspired illustration, white background, clean edges, sticker design', '/stickers/sticker-7.jpg', '2025-12-26', false),
(8, 'Retro Robot Buddy', 'High-quality vector die-cut sticker of a cute retro robot with antenna and screen face, bold thick outlines, flat vector colors, minimal shading, playful pop-tech style, white background, centered, printable sticker', '/stickers/sticker-8.jpg', '2025-12-27', false),
(9, 'Hacker Frog', 'High-quality vector die-cut sticker of a frog in a hoodie typing on a laptop, bold thick outlines, flat vector colors, simple shading, internet meme style, white background, sticker-ready', '/stickers/sticker-9.jpg', '2025-12-28', true),
(10, 'Pixel Astronaut', 'High-quality vector die-cut sticker of an astronaut holding a pixelated planet, bold thick outlines, flat vector colors, simple shading, pop-culture space theme, white background, clean sticker cut', '/stickers/sticker-10.jpg', '2025-12-29', false);

