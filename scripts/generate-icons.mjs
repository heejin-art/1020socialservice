// Generates PWA PNG icons from an inline SVG using sharp.
// Run: npm run icons
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");

// Brand mark: route path with nodes + a won (₩) coin node — "a designed day course"
function svg({ size, maskable }) {
  const pad = maskable ? size * 0.16 : 0; // safe zone for maskable
  const r = maskable ? size * 0.5 : size * 0.22; // full bleed vs rounded square
  const inner = size - pad * 2;
  const s = inner / 512; // scale factor for the 512 art
  const tx = pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3D78FF"/>
      <stop offset="1" stop-color="#1E4FD9"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <g transform="translate(${tx},${tx}) scale(${s})" fill="none" stroke="#FFFFFF" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" opacity="0.95">
    <path d="M120 372 C 120 280, 220 300, 256 240 C 300 168, 220 150, 256 96"/>
  </g>
  <g transform="translate(${tx},${tx}) scale(${s})">
    <circle cx="120" cy="372" r="30" fill="#FFFFFF"/>
    <circle cx="392" cy="372" r="30" fill="#FFFFFF" opacity="0.6"/>
    <circle cx="256" cy="96" r="56" fill="#FFFFFF"/>
    <text x="256" y="116" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="#1E4FD9" text-anchor="middle">₩</text>
  </g>
</svg>`;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const jobs = [
    { name: "icon-192.png", size: 192, maskable: false },
    { name: "icon-512.png", size: 512, maskable: false },
    { name: "maskable-512.png", size: 512, maskable: true },
    { name: "apple-touch-icon.png", size: 180, maskable: false },
  ];
  for (const j of jobs) {
    const buf = Buffer.from(svg(j));
    await sharp(buf).png().toFile(join(outDir, j.name));
    console.log("✓", j.name);
  }
  // Also drop the source SVG (used by <link rel=icon>)
  await writeFile(join(outDir, "icon.svg"), svg({ size: 512, maskable: false }));
  console.log("✓ icon.svg");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
