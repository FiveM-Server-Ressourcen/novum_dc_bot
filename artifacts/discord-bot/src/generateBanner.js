import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS    = join(__dirname, 'assets');

const BG_PATH       = join(ASSETS, 'background.jpg');
const LOGO_PATH     = join(ASSETS, 'novum_logo_nobg.png');
const TEMPLATE_PATH = join(ASSETS, 'banner_template.png');

const W = 1200;
const H = 430;

// ── Hilfsfunktionen ─────────────────────────────────────────────────────────

/** Macht alle nicht-transparenten Pixel einer RGBA-Buffer weiß */
async function toWhite(inputPath, width, height) {
  const { data, info } = await sharp(inputPath)
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const alpha = out[i + 3];
    if (alpha > 10) {            // nicht-transparentes Pixel
      out[i]     = 255;          // R → weiß
      out[i + 1] = 255;          // G → weiß
      out[i + 2] = 255;          // B → weiß
    }
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** Avatar-URL als Buffer laden */
async function fetchAvatar(url) {
  const res = await fetch(url);
  return Buffer.from(await res.arrayBuffer());
}

/** Avatar zu einem kreisförmigen PNG zuschneiden mit weißem Ring */
async function circleAvatar(avatarBuffer, size) {
  const r   = size / 2;
  // Kreismaske
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`
  );
  // Avatar kreisförmig
  const cropped = await sharp(avatarBuffer)
    .resize(size, size, { fit: 'cover' })
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Weißer Rand (border) drum herum
  const border  = size + 8;
  const borderR = border / 2;
  const ring = Buffer.from(
    `<svg width="${border}" height="${border}">
       <circle cx="${borderR}" cy="${borderR}" r="${borderR}" fill="white"/>
     </svg>`
  );
  return sharp(ring)
    .composite([{ input: cropped, left: 4, top: 4 }])
    .png()
    .toBuffer();
}

// ── Template generieren (einmal beim Start) ──────────────────────────────────

export async function generateBannerTemplate() {
  if (!existsSync(ASSETS)) mkdirSync(ASSETS, { recursive: true });
  if (!existsSync(BG_PATH) || !existsSync(LOGO_PATH)) {
    console.log('[Banner] ⚠️  Quelldateien fehlen, Template übersprungen.');
    return false;
  }

  // Hintergrund auf Banner-Größe
  const background = await sharp(BG_PATH)
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .toBuffer();

  // Dunkles Overlay (Gradient von oben nach unten)
  const overlay = Buffer.from(`
    <svg width="${W}" height="${H}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#0a0010" stop-opacity="0.55"/>
          <stop offset="40%"  stop-color="#0a0010" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#0a0010" stop-opacity="0.75"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
    </svg>`
  );

  // Akzent-Linie unten (lila)
  const accent = Buffer.from(`
    <svg width="${W}" height="${H}">
      <rect x="0" y="${H - 5}" width="${W}" height="5" fill="#8a2be2"/>
    </svg>`
  );

  // NOVUM-Logo weiß machen
  const logoW     = 340;
  const logoH     = Math.round(logoW / 2.6);
  const whiteLogo = await toWhite(LOGO_PATH, logoW, logoH);

  // Trennlinie unter dem Logo
  const dividerY = 12 + logoH + 14;
  const divider  = Buffer.from(`
    <svg width="${W}" height="${H}">
      <rect x="${(W - 300) / 2}" y="${dividerY}" width="300" height="1" fill="rgba(255,255,255,0.25)" rx="1"/>
    </svg>`
  );

  // Alles zusammensetzen
  await sharp(background)
    .composite([
      { input: overlay,    gravity: 'centre', blend: 'over' },
      { input: whiteLogo,  left: Math.round((W - logoW) / 2), top: 12, blend: 'over' },
      { input: divider,    gravity: 'centre', blend: 'over' },
      { input: accent,     gravity: 'centre', blend: 'over' },
    ])
    .png()
    .toFile(TEMPLATE_PATH);

  console.log('[Banner] ✅  Template generiert:', TEMPLATE_PATH);
  return true;
}

// ── Willkommens-Banner pro User generieren ───────────────────────────────────

export async function generateWelcomeBanner(member) {
  if (!existsSync(TEMPLATE_PATH)) {
    await generateBannerTemplate();
    if (!existsSync(TEMPLATE_PATH)) return null;
  }

  const template = await sharp(TEMPLATE_PATH).toBuffer();

  // Displayname + Tag kürzen damit er auf den Banner passt
  const rawName  = member.user.globalName ?? member.user.username;
  const name     = rawName.length > 20 ? rawName.slice(0, 20) + '…' : rawName;
  const tag      = `@${member.user.username}`;

  // Avatar
  const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
  const avatarRaw = await fetchAvatar(avatarUrl);
  const AVATAR_SIZE = 118;
  const avatarCircle = await circleAvatar(avatarRaw, AVATAR_SIZE);
  const avatarFull   = AVATAR_SIZE + 8; // inkl. weißem Rand
  const avatarLeft   = Math.round((W - avatarFull) / 2);

  // Wo fängt das Avatar-Bereich an (unterhalb Logo + Divider)
  const logoH   = Math.round(340 / 2.6);
  const avatarY = 12 + logoH + 14 + 1 + 18; // logo + divider + Abstand

  // Text-SVG: Displayname + Username-Tag
  const textY1  = avatarY + avatarFull + 28;  // Displayname
  const textY2  = textY1  + 38;               // Tag

  // Willkommen-Text oben (klein, über dem Logo — optional) schreiben wir auf Linie
  const textSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <!-- Displayname -->
      <text x="${W / 2}" y="${textY1}"
        text-anchor="middle"
        fill="white"
        font-family="Arial, Helvetica, sans-serif"
        font-size="40"
        font-weight="700"
        letter-spacing="1">${escapeXml(name)}</text>
      <!-- Username-Tag -->
      <text x="${W / 2}" y="${textY2}"
        text-anchor="middle"
        fill="#c9b8ff"
        font-family="Arial, Helvetica, sans-serif"
        font-size="22"
        font-weight="400">${escapeXml(tag)}</text>
    </svg>`
  );

  const banner = await sharp(template)
    .composite([
      { input: avatarCircle, left: avatarLeft, top: avatarY,   blend: 'over' },
      { input: textSvg,      gravity: 'centre',                blend: 'over' },
    ])
    .jpeg({ quality: 93 })
    .toBuffer();

  return banner;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
