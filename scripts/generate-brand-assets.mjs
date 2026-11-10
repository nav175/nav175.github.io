/**
 * Renders the favicons, app icons, and social preview into public/ from Geist's
 * outlines and the same hyperbolic layout the site draws, so the images match the
 * site without depending on installed fonts. Run with `npm run assets`.
 */
import { readFile, writeFile } from 'node:fs/promises'
import * as fontkit from 'fontkit'
import resvg from '@resvg/resvg-js'
import wawoff2 from 'wawoff2'
import { conformalScale, geodesicPath, layoutTree } from '../src/lib/hyperbolic.ts'
import { aiTopics } from '../src/data/hyperspaceTopics.ts'

/** Mirrors the @theme colours in src/index.css. */
const color = {
  ink: '#08090b',
  graphite: '#0e1013',
  mist: '#edeff2',
  fog: '#9aa1ab',
  smoke: '#7a808a',
  signal: '#3dd68c',
}

const publicDir = new URL('../public/', import.meta.url)

async function loadFont(name) {
  const file = new URL(`../node_modules/@fontsource-variable/${name}/files/${name}-latin-wght-normal.woff2`, import.meta.url)
  // fontkit can't apply variations to WOFF2's transformed glyph table, so decompress to TTF first.
  const font = fontkit.create(Buffer.from(await wawoff2.decompress(await readFile(file))))
  const instances = new Map()
  return (weight) => {
    if (!instances.has(weight)) instances.set(weight, font.getVariation({ wght: weight }))
    return instances.get(weight)
  }
}

const sans = await loadFont('geist')
const mono = await loadFont('geist-mono')

const trim = (value) => String(Math.round(value * 100) / 100)
const roundPath = (d) => d.replace(/-?\d*\.\d+/g, (n) => trim(Number(n)))

/** Lays out text as a single path in pixel space. `tracking` is in em, like CSS letter-spacing. */
function text(font, value, { size, weight = 400, tracking = 0, x = 0, y = 0, anchor = 'start' }) {
  const face = font(weight)
  const run = face.layout(value)
  const scale = size / face.unitsPerEm
  const spacing = tracking * face.unitsPerEm

  let pen = 0
  const offsets = run.glyphs.map((_, i) => {
    const at = pen + run.positions[i].xOffset
    pen += run.positions[i].xAdvance + (i < run.glyphs.length - 1 ? spacing : 0)
    return at
  })
  const width = pen * scale
  const left = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x

  const paths = run.glyphs.map((glyph, i) => glyph.path.scale(scale, -scale).translate(left + offsets[i] * scale, y))
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  for (const { bbox } of paths) {
    if (!Number.isFinite(bbox.minX)) continue
    box.minX = Math.min(box.minX, bbox.minX)
    box.minY = Math.min(box.minY, bbox.minY)
    box.maxX = Math.max(box.maxX, bbox.maxX)
    box.maxY = Math.max(box.maxY, bbox.maxY)
  }
  return { d: roundPath(paths.map((path) => path.toSVG()).join('')), width, box }
}

/** The NS letters, centred on their ink rather than their advance widths. */
function monogramLetters(size, fontSize) {
  const options = { size: fontSize, weight: 600, tracking: -0.04 }
  const { box } = text(sans, 'NS', options)
  const x = (size - (box.maxX - box.minX)) / 2 - box.minX
  const y = (size - (box.maxY - box.minY)) / 2 - box.minY
  return text(sans, 'NS', { ...options, x, y }).d
}

/** Same hairline edge as the `.monogram` class: bright at the top, dim through the middle. */
const edgeGradient = (id) => `<linearGradient id="${id}" x1="0.28" y1="-0.1" x2="0.72" y2="1.1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.55"/>
    <stop offset="0.48" stop-color="#fff" stop-opacity="0.07"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0.22"/>
  </linearGradient>`

/** Rounded tile with transparent corners, for favicons and "any" purpose icons. */
function tileIcon(size) {
  const stroke = Math.max(1, size / 40)
  const inset = stroke / 2
  const radius = size * (9 / 32) - inset
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>${edgeGradient('edge')}</defs>
  <rect x="${trim(inset)}" y="${trim(inset)}" width="${trim(size - stroke)}" height="${trim(size - stroke)}" rx="${trim(radius)}" fill="${color.graphite}" stroke="url(#edge)" stroke-width="${trim(stroke)}"/>
  <path fill="${color.mist}" d="${monogramLetters(size, size * 0.47)}"/>
</svg>
`
}

/** Full-bleed square for platforms that apply their own mask (iOS, Android adaptive icons). */
function bleedIcon(size, letterScale) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="lift" cx="0.5" cy="0" r="0.9">
      <stop offset="0" stop-color="#fff" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="${color.graphite}"/>
  <rect width="${size}" height="${size}" fill="url(#lift)"/>
  <path fill="${color.mist}" d="${monogramLetters(size, size * letterScale)}"/>
</svg>
`
}

/** The HyperSpace disk at rest, as drawn by HyperbolicPreview (whose sizes assume a 460-unit radius). */
function disk(cx, cy, radius) {
  const nodes = layoutTree(aiTopics)
  const scales = nodes.map((node) => conformalScale(node.z))
  const k = radius / 460
  const at = (z) => `cx="${trim(cx + z.x * radius)}" cy="${trim(cy + z.y * radius)}"`

  const rings = [1, 2, 3, 4]
    .map((depth) => `<circle cx="${cx}" cy="${cy}" r="${trim(Math.tanh(depth / 2) * radius)}"/>`)
    .join('')
  const edges = nodes
    .filter((node) => node.parent >= 0)
    .map((node) => {
      const onFocus = node.parent === 0
      const s = (scales[node.parent] + scales[node.index]) / 2
      const opacity = onFocus ? 0.55 : 0.06 + 0.3 * s
      return `<path d="${geodesicPath(nodes[node.parent].z, node.z, radius)}" stroke="${onFocus ? color.signal : color.mist}" stroke-opacity="${trim(opacity)}"/>`
    })
    .join('')
  const dots = nodes
    .map((node, i) => {
      const r = Math.max(1.6, (i === 0 ? 13 : 7.5) * scales[i]) * k
      return `<circle ${at(node.z)} r="${trim(r)}" fill="${i === 0 ? color.signal : color.fog}"/>`
    })
    .join('')

  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="url(#disk)" stroke="#fff" stroke-opacity="0.15" stroke-width="1.5"/>
    <g fill="none" stroke="#fff" stroke-opacity="0.07" stroke-width="1.2" stroke-dasharray="2 7">${rings}</g>
    <g fill="none" stroke-width="1.4"><g transform="translate(${cx} ${cy})">${edges}</g></g>
    <circle ${at(nodes[0].z)} r="${trim(38 * k)}" fill="${color.signal}" fill-opacity="0.15"/>
    ${dots}`
}

function socialImage() {
  const width = 1200
  const height = 630
  const left = 80

  const tile = 56
  const name = text(sans, 'Navjot Singh', { size: 26, weight: 500, tracking: -0.01, x: left + tile + 18, y: 72 + tile / 2 + 9.5 })

  const pillTop = 196
  const pillHeight = 44
  const status = text(sans, 'Open for opportunities', { size: 19, weight: 500, x: left + 44, y: pillTop + pillHeight / 2 + 7 })
  const pillWidth = 44 + status.width + 22

  const headlineSize = 66
  const headline = ['Full-stack software,', 'from schema to screen.'].map((line, i) =>
    text(sans, line, { size: headlineSize, weight: 600, tracking: -0.045, x: left - 3, y: 338 + i * headlineSize * 1.08 }),
  )
  const proof = text(sans, 'Inventory platform at Skytec Supply. StormHacks 2026 prize winner.', {
    size: 24,
    x: left,
    y: 478,
  })
  const url = text(mono, 'nav175.github.io', { size: 20, x: left, y: 566 })

  const widest = Math.max(...headline.map((line) => line.width), proof.width)
  if (left + widest > 860) throw new Error(`Social image copy runs into the disk (${Math.round(left + widest)}px)`)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0H0V64" fill="none" stroke="#fff" stroke-opacity="0.035" stroke-width="2"/>
    </pattern>
    <radialGradient id="grid-fade" cx="0.62" cy="0.28" r="0.75">
      <stop offset="0.25" stop-color="#fff"/>
      <stop offset="0.72" stop-color="#000"/>
    </radialGradient>
    <mask id="grid-mask"><rect width="${width}" height="${height}" fill="url(#grid-fade)"/></mask>
    <radialGradient id="glow" cx="0.82" cy="0.1" r="0.6">
      <stop offset="0" stop-color="#fff" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="disk" r="0.5">
      <stop offset="0" stop-color="#fff" stop-opacity="0.045"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0.01"/>
    </radialGradient>
    <linearGradient id="disk-fade" x1="0" x2="1">
      <stop offset="0.66" stop-color="#000"/>
      <stop offset="0.84" stop-color="#fff"/>
    </linearGradient>
    <mask id="disk-mask"><rect width="${width}" height="${height}" fill="url(#disk-fade)"/></mask>
    ${edgeGradient('edge')}
  </defs>

  <rect width="${width}" height="${height}" fill="${color.ink}"/>
  <rect width="${width}" height="${height}" fill="url(#grid)" mask="url(#grid-mask)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <g mask="url(#disk-mask)">${disk(1050, 315, 255)}</g>

  <rect x="${left + 0.5}" y="72.5" width="${tile - 1}" height="${tile - 1}" rx="15.5" fill="${color.graphite}" stroke="url(#edge)"/>
  <path fill="${color.mist}" transform="translate(${left} 72)" d="${monogramLetters(tile, 21)}"/>
  <path fill="${color.mist}" d="${name.d}"/>

  <rect x="${left + 0.5}" y="${pillTop + 0.5}" width="${trim(pillWidth - 1)}" height="${pillHeight - 1}" rx="${(pillHeight - 1) / 2}" fill="#fff" fill-opacity="0.04" stroke="#fff" stroke-opacity="0.1"/>
  <circle cx="${left + 24}" cy="${pillTop + pillHeight / 2}" r="9" fill="${color.signal}" fill-opacity="0.18"/>
  <circle cx="${left + 24}" cy="${pillTop + pillHeight / 2}" r="4.5" fill="${color.signal}"/>
  <path fill="${color.mist}" d="${status.d}"/>

  ${headline.map((line) => `<path fill="${color.mist}" d="${line.d}"/>`).join('\n  ')}
  <path fill="${color.fog}" d="${proof.d}"/>
  <path fill="${color.smoke}" d="${url.d}"/>
</svg>
`
}

const png = (svg, size) =>
  new resvg.Resvg(svg, { fitTo: { mode: 'width', value: size }, font: { loadSystemFonts: false } }).render().asPng()

/** ICO with embedded PNGs (supported everywhere since Windows Vista). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16
    header.writeUInt8(size % 256, entry)
    header.writeUInt8(size % 256, entry + 1)
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(data.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += data.length
  })
  return Buffer.concat([header, ...images.map(({ data }) => data)])
}

const outputs = {
  'favicon.svg': tileIcon(32),
  'favicon.ico': ico([16, 32, 48].map((size) => ({ size, data: png(tileIcon(size), size) }))),
  'apple-touch-icon.png': png(bleedIcon(180, 0.42), 180),
  'icon-192.png': png(tileIcon(192), 192),
  'icon-512.png': png(tileIcon(512), 512),
  'icon-maskable-512.png': png(bleedIcon(512, 0.36), 512),
  'og-image.png': png(socialImage(), 1200),
}

for (const [file, data] of Object.entries(outputs)) {
  await writeFile(new URL(file, publicDir), data)
  console.log(`public/${file}  ${(Buffer.byteLength(data) / 1024).toFixed(1)} kB`)
}
