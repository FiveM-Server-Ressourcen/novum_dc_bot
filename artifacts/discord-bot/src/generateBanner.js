import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS    = join(__dirname, 'assets');

const BG_PATH     = join(ASSETS, 'background.jpg');
const LOGO_PATH   = join(ASSETS, 'novum_logo_nobg.png');
const BANNER_PATH = join(ASSETS, 'welcome_banner.jpg');

// Banner-Dimensionen (Discord-Embed-optimiert)
const W = 1200;
const H = 400;

export async function generateWelcomeBanner() {
  if (!existsSync(BG_PATH) || !existsSync(LOGO_PATH)) {
    console.log('[Banner] ⚠️  Quelldateien fehlen, Banner übersprungen.');
    return null;
  }

  // Hintergrund auf Banner-Größe bringen
  const background = await sharp(BG_PATH)
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .toBuffer();

  // Logo: ~40% der Banner-Höhe, zentriert
  const logoH  = Math.round(H * 0.52);
  const logoW  = Math.round(logoH * 2.6); // Logo ist ca. 2.6:1 Seitenverhältnis
  const logo   = await sharp(LOGO_PATH)
    .resize(logoW, logoH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Dunkles Overlay für bessere Logo-Sichtbarkeit (50% Schwarz-Gradient)
  const overlay = Buffer.from(
    `<svg width="${W}" height="${H}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#000" stop-opacity="0.25"/>
          <stop offset="50%"  stop-color="#000" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.65"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
    </svg>`
  );

  // Linie unten (lila Akzent)
  const accent = Buffer.from(
    `<svg width="${W}" height="${H}">
      <rect x="0" y="${H - 4}" width="${W}" height="4" fill="#8a2be2" rx="0"/>
    </svg>`
  );

  // Alles zusammensetzen
  await sharp(background)
    .composite([
      { input: overlay,                                    gravity: 'centre',        blend: 'over' },
      { input: logo, left: Math.round((W - logoW) / 2), top: Math.round((H - logoH) / 2), blend: 'over' },
      { input: accent,                                     gravity: 'centre',        blend: 'over' },
    ])
    .jpeg({ quality: 92 })
    .toFile(BANNER_PATH);

  console.log('[Banner] ✅  Welcome-Banner generiert:', BANNER_PATH);
  return BANNER_PATH;
}

export { BANNER_PATH };
