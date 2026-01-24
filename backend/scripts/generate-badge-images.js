/* eslint-disable */
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const { PrismaClient } = require('@prisma/client');
const { Resvg } = require('@resvg/resvg-js');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const icons = require('lucide-react');

const prisma = new PrismaClient();

const OUTPUT_DIR = path.resolve(process.cwd(), 'uploads/badges');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Colors by category (background gradient) and rarity (ring/glow)
const CATEGORY_COLORS = {
  MILESTONE: ['#1e3a8a', '#3b82f6'],     // blue
  ACHIEVEMENT: ['#065f46', '#10b981'],   // green
  STREAK: ['#9a3412', '#f59e0b'],        // orange
  SPECIAL: ['#6d28d9', '#a78bfa'],       // purple
};
const RARITY_RING = {
  common: '#9ca3af',    // gray
  rare: '#3b82f6',      // blue
  epic: '#a78bfa',      // purple
  legendary: '#d97706', // gold-ish
};

// Map badge names to icons (adjust as you like)
const ICON_MAP = {
  'First Steps': 'Flag',
  'Quick Learner': 'Zap',
  'Dedicated Student': 'BookOpen',
  'Rising Star': 'Star',
  'Knowledge Seeker': 'Book',
  'Consistent Learner': 'Flame',
  'Video Master': 'Video',
  'Document Expert': 'FileText',
  'Ambitious Trader': 'LineChart',
  'Course Completer': 'GraduationCap',
  'Trading Scholar': 'GraduationCap',
  'Marathon Learner': 'Timer',
  'Multi-Course Master': 'Layers',
  'Expert Analyst': 'Brain',
  'Trading Master': 'Crown',
  'Legendary Trader': 'Trophy',
  'Ultimate Champion': 'Medal',
  'Hall of Fame': 'Sparkles',
};

// Render a Lucide React icon component to SVG inner markup
function renderLucideIconInner(iconName, stroke = '#ffffff', strokeWidth = 2.2, size = 24) {
  const IconComp = icons[iconName];
  if (!IconComp) throw new Error(`Icon not found: ${iconName}`);
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComp, { color: stroke, strokeWidth, size })
  );
  // Strip outer <svg ...> ... </svg> to embed into our master SVG
  return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
}

// Create a 1024x1024 badge SVG: gradient background, ring, centered icon
function makeBadgeSvg({ title, category, rarity, iconName }) {
  const [c1, c2] = CATEGORY_COLORS[category] || CATEGORY_COLORS.MILESTONE;
  const ring = RARITY_RING[rarity] || RARITY_RING.common;

  // Ensure icon component exists
  if (!icons[iconName]) throw new Error(`Icon not found: ${iconName} (for ${title})`);

  // Lucide icons use 24x24 viewBox; scale to fit badge
  // Centered group scaled ~32x to fill ~760px area within 1024
  const ICON_SCALE = 32;
  const ICON_STROKE = 2.2;

  const iconInner = renderLucideIconInner(iconName, '#ffffff', ICON_STROKE, 24);
  const svg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c1}"/>
    </radialGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="12" stdDeviation="24" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="${ring}"/>
    </filter>
  </defs>

  <!-- Background -->
  <circle cx="512" cy="512" r="460" fill="url(#bg)" filter="url(#shadow)"/>
  <!-- Rarity ring -->
  <circle cx="512" cy="512" r="430" fill="none" stroke="${ring}" stroke-width="24" filter="url(#glow)"/>

  <!-- Icon group (centered, scaled) -->
  <g transform="translate(512,512) scale(${ICON_SCALE}) translate(-12,-12)">
    ${iconInner}
  </g>
</svg>`;
  return svg.trim();
}

async function main() {
  const badges = await prisma.badge.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
  });

  for (const b of badges) {
    const iconName =
      ICON_MAP[b.name] ||
      (b.category === 'STREAK' ? 'Flame' : b.category === 'ACHIEVEMENT' ? 'Trophy' : 'Star');

    const svg = makeBadgeSvg({
      title: b.name,
      category: b.category,
      rarity: b.rarity || 'common',
      iconName,
    });

    const png = new Resvg(svg, {
      fitTo: { mode: 'width', value: 512 }, // output 512x512 PNG
      background: 'rgba(0,0,0,0)',
    }).render().asPng();

    const filename = `${slugify(b.name, { lower: true, strict: true })}.png`;
    const outPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outPath, png);

    const imageUrl = `/api/uploads/badges/${filename}`;
    await prisma.badge.update({
      where: { id: b.id },
      data: { imageUrl },
    });

    console.log(`✅ Generated ${b.name} -> ${imageUrl}`);
  }

  console.log('All badge images generated.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});