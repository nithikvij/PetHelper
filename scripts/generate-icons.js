// This script generates PWA icons
// Run with: node scripts/generate-icons.js
// Requires: npm install sharp (optional, for production quality icons)

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icon
function generateSVG(size) {
  const padding = size * 0.1;
  const innerSize = size - padding * 2;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0f172a"/>
  <g transform="translate(${padding}, ${padding})">
    <!-- Paw print -->
    <ellipse cx="${innerSize * 0.5}" cy="${innerSize * 0.65}" rx="${innerSize * 0.15}" ry="${innerSize * 0.18}" fill="#fff"/>
    <ellipse cx="${innerSize * 0.25}" cy="${innerSize * 0.4}" rx="${innerSize * 0.1}" ry="${innerSize * 0.12}" fill="#fff"/>
    <ellipse cx="${innerSize * 0.45}" cy="${innerSize * 0.32}" rx="${innerSize * 0.1}" ry="${innerSize * 0.12}" fill="#fff"/>
    <ellipse cx="${innerSize * 0.55}" cy="${innerSize * 0.32}" rx="${innerSize * 0.1}" ry="${innerSize * 0.12}" fill="#fff"/>
    <ellipse cx="${innerSize * 0.75}" cy="${innerSize * 0.4}" rx="${innerSize * 0.1}" ry="${innerSize * 0.12}" fill="#fff"/>
    <!-- Heart/Plus symbol -->
    <path d="M${innerSize * 0.5} ${innerSize * 0.55}
             L${innerSize * 0.42} ${innerSize * 0.63}
             L${innerSize * 0.5} ${innerSize * 0.75}
             L${innerSize * 0.58} ${innerSize * 0.63} Z"
          fill="#ef4444"/>
  </g>
</svg>`;
}

// Generate icons for each size
sizes.forEach(size => {
  const svg = generateSVG(size);
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`Generated: icon-${size}x${size}.svg`);
});

// Also create a favicon.svg
const faviconSvg = generateSVG(32);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), faviconSvg);
console.log('Generated: favicon.svg');

console.log(`
Icons generated successfully!

To convert SVG to PNG (for full PWA compatibility), you can:
1. Use an online tool like https://cloudconvert.com/svg-to-png
2. Or install sharp: npm install sharp
   Then update this script to use sharp for conversion

For now, you can use the SVG icons directly or convert them manually.
`);
