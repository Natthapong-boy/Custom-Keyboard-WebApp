import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const plates = [
  {
    file: 'plate-pc.svg',
    title: 'POLYCARBONATE (PC) • SOFT THOCK',
    bg1: '#e0f2fe', bg2: '#bae6fd', border: '#7dd3fc', text: '#0284c7', cutout: '#f0f9ff'
  },
  {
    file: 'plate-pom.svg',
    title: 'POM PLATE • DEEP THOCK',
    bg1: '#f8fafc', bg2: '#f1f5f9', border: '#cbd5e1', text: '#475569', cutout: '#e2e8f0'
  },
  {
    file: 'plate-aluminum.svg',
    title: 'CNC ALUMINUM • CRISP CLACK',
    bg1: '#cbd5e1', bg2: '#94a3b8', border: '#64748b', text: '#334155', cutout: '#475569'
  },
  {
    file: 'plate-brass.svg',
    title: 'POLISHED BRASS • HIGH-PITCH CLACK',
    bg1: '#fef08a', bg2: '#eab308', border: '#ca8a04', text: '#854d0e', cutout: '#713f12'
  },
  {
    file: 'plate-carbon.svg',
    title: 'CARBON FIBER • CRISP SOLID CLACK',
    bg1: '#1e293b', bg2: '#0f172a', border: '#334155', text: '#94a3b8', cutout: '#020617'
  },
  {
    file: 'plate-copper.svg',
    title: 'COPPER PLATE • SOLID DENSE CLACK',
    bg1: '#fdba74', bg2: '#c2410c', border: '#9a3412', text: '#7c2d12', cutout: '#431407'
  },
  {
    file: 'plate-steel.svg',
    title: 'STAINLESS STEEL • BRIGHT SHARP CLACK',
    bg1: '#e2e8f0', bg2: '#64748b', border: '#475569', text: '#1e293b', cutout: '#334155'
  }
]

const dest = path.resolve(__dirname, '../public/images')
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })

plates.forEach(p => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%">
  <defs>
    <linearGradient id="plateGrad-${p.file.replace('.svg', '')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bg1}"/>
      <stop offset="100%" stop-color="${p.bg2}"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="400" height="240" fill="#f8fafc" rx="24"/>
  <g filter="url(#shadow)" transform="translate(30, 25)">
    <rect width="340" height="190" rx="14" fill="url(#plateGrad-${p.file.replace('.svg', '')})" stroke="${p.border}" stroke-width="2.5"/>
    <path d="M 12 12 L 328 12 M 12 178 L 328 178 M 12 12 L 12 178 M 328 12 L 328 178" stroke="${p.border}" stroke-width="0.75" stroke-dasharray="6,4" opacity="0.5"/>
    <g fill="${p.cutout}" stroke="${p.border}" stroke-width="0.75">
      <rect x="22" y="24" width="18" height="18" rx="2"/>
      <rect x="44" y="24" width="18" height="18" rx="2"/>
      <rect x="66" y="24" width="18" height="18" rx="2"/>
      <rect x="88" y="24" width="18" height="18" rx="2"/>
      <rect x="110" y="24" width="18" height="18" rx="2"/>
      <rect x="132" y="24" width="18" height="18" rx="2"/>
      <rect x="154" y="24" width="18" height="18" rx="2"/>
      <rect x="176" y="24" width="18" height="18" rx="2"/>
      <rect x="198" y="24" width="18" height="18" rx="2"/>
      <rect x="220" y="24" width="18" height="18" rx="2"/>
      <rect x="242" y="24" width="18" height="18" rx="2"/>
      <rect x="264" y="24" width="18" height="18" rx="2"/>
      <rect x="286" y="24" width="32" height="18" rx="2"/>
      <rect x="22" y="48" width="24" height="18" rx="2"/>
      <rect x="50" y="48" width="18" height="18" rx="2"/>
      <rect x="72" y="48" width="18" height="18" rx="2"/>
      <rect x="94" y="48" width="18" height="18" rx="2"/>
      <rect x="116" y="48" width="18" height="18" rx="2"/>
      <rect x="138" y="48" width="18" height="18" rx="2"/>
      <rect x="160" y="48" width="18" height="18" rx="2"/>
      <rect x="182" y="48" width="18" height="18" rx="2"/>
      <rect x="204" y="48" width="18" height="18" rx="2"/>
      <rect x="226" y="48" width="18" height="18" rx="2"/>
      <rect x="248" y="48" width="18" height="18" rx="2"/>
      <rect x="270" y="48" width="18" height="18" rx="2"/>
      <rect x="292" y="48" width="26" height="18" rx="2"/>
      <rect x="22" y="72" width="28" height="18" rx="2"/>
      <rect x="54" y="72" width="18" height="18" rx="2"/>
      <rect x="76" y="72" width="18" height="18" rx="2"/>
      <rect x="98" y="72" width="18" height="18" rx="2"/>
      <rect x="120" y="72" width="18" height="18" rx="2"/>
      <rect x="142" y="72" width="18" height="18" rx="2"/>
      <rect x="164" y="72" width="18" height="18" rx="2"/>
      <rect x="186" y="72" width="18" height="18" rx="2"/>
      <rect x="208" y="72" width="18" height="18" rx="2"/>
      <rect x="230" y="72" width="18" height="18" rx="2"/>
      <rect x="252" y="72" width="18" height="18" rx="2"/>
      <rect x="274" y="72" width="44" height="18" rx="2"/>
      <rect x="22" y="96" width="36" height="18" rx="2"/>
      <rect x="62" y="96" width="18" height="18" rx="2"/>
      <rect x="84" y="96" width="18" height="18" rx="2"/>
      <rect x="106" y="96" width="18" height="18" rx="2"/>
      <rect x="128" y="96" width="18" height="18" rx="2"/>
      <rect x="150" y="96" width="18" height="18" rx="2"/>
      <rect x="172" y="96" width="18" height="18" rx="2"/>
      <rect x="194" y="96" width="18" height="18" rx="2"/>
      <rect x="216" y="96" width="18" height="18" rx="2"/>
      <rect x="238" y="96" width="18" height="18" rx="2"/>
      <rect x="260" y="96" width="36" height="18" rx="2"/>
      <rect x="300" y="96" width="18" height="18" rx="2"/>
      <rect x="22" y="120" width="24" height="18" rx="2"/>
      <rect x="50" y="120" width="20" height="18" rx="2"/>
      <rect x="74" y="120" width="22" height="18" rx="2"/>
      <rect x="100" y="120" width="118" height="18" rx="2"/>
      <rect x="222" y="120" width="20" height="18" rx="2"/>
      <rect x="246" y="120" width="20" height="18" rx="2"/>
      <rect x="270" y="120" width="20" height="18" rx="2"/>
      <rect x="294" y="120" width="24" height="18" rx="2"/>
    </g>
    <path d="M 40 148 L 300 148 M 80 160 L 260 160" stroke="${p.border}" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
    <text x="170" y="180" fill="${p.text}" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" letter-spacing="2">${p.title}</text>
  </g>
</svg>`
  fs.writeFileSync(path.join(dest, p.file), svg, 'utf8')
})
console.log('✅ SVGs generated successfully!')
