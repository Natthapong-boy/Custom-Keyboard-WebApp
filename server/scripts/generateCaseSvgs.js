import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.resolve(__dirname, '../../public/images')

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

const cases = [
  { file: 'case-aluminum-black.svg', name: 'Aluminum Case (Black)', mat: 'Aluminum', bg: '#18181b', stroke: '#3f3f46', inner: '#09090b', accent: '#71717a', label: 'CNC 6063 ALUMINUM • MATTE BLACK' },
  { file: 'case-aluminum-silver.svg', name: 'Aluminum Case (Silver)', mat: 'Aluminum', bg: '#cbd5e1', stroke: '#94a3b8', inner: '#e2e8f0', accent: '#64748b', label: 'CNC 6063 ALUMINUM • SILVER' },
  { file: 'case-aluminum-navy.svg', name: 'Aluminum Case (Navy)', mat: 'Aluminum', bg: '#0f2b5c', stroke: '#1e3a8a', inner: '#0a192f', accent: '#38bdf8', label: 'CNC 6063 ALUMINUM • NAVY BLUE' },
  { file: 'case-aluminum-maroon.svg', name: 'Aluminum Case (Maroon)', mat: 'Aluminum', bg: '#581c27', stroke: '#881337', inner: '#3b0d16', accent: '#f43f5e', label: 'CNC 6063 ALUMINUM • MAROON RED' },
  { file: 'case-pc-frosted.svg', name: 'PC Case (Frosted White)', mat: 'Polycarbonate', bg: '#e2e8f0', stroke: '#cbd5e1', inner: '#f1f5f9', accent: '#94a3b8', label: 'POLYCARBONATE • FROSTED WHITE', opacity: '0.85' },
  { file: 'case-pc-clear.svg', name: 'PC Case (Clear)', mat: 'Polycarbonate', bg: '#f8fafc', stroke: '#94a3b8', inner: '#ffffff', accent: '#38bdf8', label: 'POLYCARBONATE • CRYSTAL CLEAR', opacity: '0.75' },
  { file: 'case-pc-purple.svg', name: 'PC Case (Translucent Purple)', mat: 'Polycarbonate', bg: '#7c3aed', stroke: '#a855f7', inner: '#581c87', accent: '#c084fc', label: 'POLYCARBONATE • NEON PURPLE', opacity: '0.85' },
  { file: 'case-abs-beige.svg', name: 'ABS Case (Retro Beige)', mat: 'ABS Plastic', bg: '#d4c5a9', stroke: '#b8a88a', inner: '#e6dbb9', accent: '#8c7e68', label: 'ABS PLASTIC • RETRO BEIGE' },
  { file: 'case-abs-white.svg', name: 'ABS Case (Matte White)', mat: 'ABS Plastic', bg: '#ffffff', stroke: '#e2e8f0', inner: '#f8fafc', accent: '#94a3b8', label: 'ABS PLASTIC • MATTE WHITE' },
  { file: 'case-abs-black.svg', name: 'ABS Case (Matte Black)', mat: 'ABS Plastic', bg: '#27272a', stroke: '#3f3f46', inner: '#18181b', accent: '#71717a', label: 'ABS PLASTIC • MATTE BLACK' },
  { file: 'case-wood-walnut.svg', name: 'Wood Case (Walnut)', mat: 'Solid Wood', bg: '#3e2723', stroke: '#5d4037', inner: '#271612', accent: '#8d6e63', label: 'SOLID WOOD • NATURAL WALNUT' },
  { file: 'case-wood-rosewood.svg', name: 'Wood Case (Rosewood)', mat: 'Solid Wood', bg: '#5c241c', stroke: '#7f3125', inner: '#3d140e', accent: '#a14234', label: 'SOLID WOOD • PREMIUM ROSEWOOD' }
]

function generateCaseSvg(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%">
  <defs>
    <linearGradient id="grad-${c.file.replace('.svg', '')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.bg}" stop-opacity="${c.opacity || '1'}"/>
      <stop offset="100%" stop-color="${c.inner}" stop-opacity="${c.opacity || '1'}"/>
    </linearGradient>
    <filter id="shadow-${c.file.replace('.svg', '')}" x="-8%" y="-8%" width="116%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="400" height="240" fill="#f8fafc" rx="24"/>
  
  <!-- Subtle Grid BG -->
  <g stroke="#e2e8f0" stroke-width="0.5" opacity="0.6">
    <line x1="40" y1="0" x2="40" y2="240"/>
    <line x1="120" y1="0" x2="120" y2="240"/>
    <line x1="200" y1="0" x2="200" y2="240"/>
    <line x1="280" y1="0" x2="280" y2="240"/>
    <line x1="360" y1="0" x2="360" y2="240"/>
  </g>

  <!-- Keyboard Case Outer Bezel -->
  <g filter="url(#shadow-${c.file.replace('.svg', '')})" transform="translate(25, 20)">
    <!-- Outer Bezel -->
    <rect width="350" height="195" rx="18" fill="url(#grad-${c.file.replace('.svg', '')})" stroke="${c.stroke}" stroke-width="3"/>
    
    <!-- Chamfered Edge Line -->
    <rect x="6" y="6" width="338" height="183" rx="14" fill="none" stroke="${c.accent}" stroke-width="1" opacity="0.6"/>

    <!-- Keyboard Tray Cavity (Where plate/PCB sit) -->
    <rect x="18" y="18" width="314" height="155" rx="10" fill="${c.inner}" stroke="${c.stroke}" stroke-width="1.5"/>
    
    <!-- Gasket Mount Tabs Silhouettes -->
    <g fill="${c.accent}" opacity="0.5">
      <rect x="60" y="14" width="24" height="4" rx="1.5"/>
      <rect x="160" y="14" width="24" height="4" rx="1.5"/>
      <rect x="260" y="14" width="24" height="4" rx="1.5"/>
      <rect x="60" y="173" width="24" height="4" rx="1.5"/>
      <rect x="160" y="173" width="24" height="4" rx="1.5"/>
      <rect x="260" y="173" width="24" height="4" rx="1.5"/>
      <rect x="14" y="80" width="4" height="24" rx="1.5"/>
      <rect x="332" y="80" width="4" height="24" rx="1.5"/>
    </g>

    <!-- USB-C Port Cutout -->
    <rect x="40" y="0" width="20" height="4" rx="1" fill="#475569"/>

    <!-- Case Spec / Acoustic Chamber Text -->
    <text x="175" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="${c.accent}" text-anchor="middle" letter-spacing="1.5">${c.name.toUpperCase()}</text>
    <text x="175" y="118" font-family="system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="600" fill="${c.accent}" text-anchor="middle" opacity="0.8" letter-spacing="1">${c.label}</text>
  </g>
</svg>`
}

for (const c of cases) {
  const filePath = path.join(imagesDir, c.file)
  fs.writeFileSync(filePath, generateCaseSvg(c), 'utf8')
  console.log(`Generated: ${c.file}`)
}

console.log('All 12 case SVG images generated successfully.')
