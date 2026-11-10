/**
 * Poincaré disk helpers for the HyperSpace preview. Points are complex numbers
 * inside the unit disk, stored as { x, y } in screen orientation (y grows down).
 */

export interface Point {
  x: number
  y: number
}

export const ORIGIN: Point = { x: 0, y: 0 }

/** Disk automorphism sending `a` to the origin: z -> (z - a) / (1 - conj(a) z). */
export function translateToOrigin(z: Point, a: Point): Point {
  const nx = z.x - a.x
  const ny = z.y - a.y
  const dx = 1 - (a.x * z.x + a.y * z.y)
  const dy = -(a.x * z.y - a.y * z.x)
  const d = dx * dx + dy * dy
  return { x: (nx * dx + ny * dy) / d, y: (ny * dx - nx * dy) / d }
}

/** Inverse of translateToOrigin: sends the origin to `a`. */
export function translateFromOrigin(w: Point, a: Point): Point {
  return translateToOrigin(w, { x: -a.x, y: -a.y })
}

/** The point a fraction `t` of the hyperbolic distance from the origin to `b`, on their geodesic. */
export function alongGeodesic(b: Point, t: number): Point {
  const r = Math.hypot(b.x, b.y)
  if (r < 1e-9) return ORIGIN
  const target = Math.tanh(t * Math.atanh(Math.min(r, 0.999999)))
  return { x: (b.x / r) * target, y: (b.y / r) * target }
}

/** Conformal scale factor: 1 at the centre, falling to 0 at the rim. */
export function conformalScale(z: Point): number {
  return Math.max(0, 1 - (z.x * z.x + z.y * z.y))
}

/**
 * SVG path data for the geodesic from p to q, scaled by `radius`. Geodesics are
 * arcs of circles orthogonal to the rim, or diameters when p, q and the origin line up.
 */
export function geodesicPath(p: Point, q: Point, radius: number): string {
  const px = (p.x * radius).toFixed(2)
  const py = (p.y * radius).toFixed(2)
  const qx = (q.x * radius).toFixed(2)
  const qy = (q.y * radius).toFixed(2)
  const straight = `M${px} ${py}L${qx} ${qy}`

  const det = p.x * q.y - p.y * q.x
  if (Math.abs(det) < 1e-5) return straight

  // Centre c satisfies c.p = (|p|^2 + 1) / 2 and c.q = (|q|^2 + 1) / 2.
  const r1 = (p.x * p.x + p.y * p.y + 1) / 2
  const r2 = (q.x * q.x + q.y * q.y + 1) / 2
  const cx = (r1 * q.y - p.y * r2) / det
  const cy = (p.x * r2 - r1 * q.x) / det
  const arcRadius = Math.sqrt(cx * cx + cy * cy - 1)
  if (!Number.isFinite(arcRadius) || arcRadius > 1e4) return straight

  const cross = (p.x - cx) * (q.y - cy) - (p.y - cy) * (q.x - cx)
  const sweep = cross > 0 ? 1 : 0
  const r = (arcRadius * radius).toFixed(2)
  return `M${px} ${py}A${r} ${r} 0 0 ${sweep} ${qx} ${qy}`
}

export interface TopicNode {
  label: string
  children?: TopicNode[]
}

export interface PlacedNode {
  index: number
  label: string
  depth: number
  parent: number
  z: Point
}

function leafCount(node: TopicNode): number {
  if (!node.children?.length) return 1
  return node.children.reduce((sum, child) => sum + leafCount(child), 0)
}

/**
 * Hyperbolic tree layout in the spirit of Lamping and Rao: every node fans its
 * children out inside a wedge of its own local frame, facing away from its parent,
 * with each child's share of the wedge weighted by the size of its subtree.
 */
export function layoutTree(root: TopicNode, rootStep = 0.56, childStep = 0.6): PlacedNode[] {
  const placed: PlacedNode[] = []

  const visit = (node: TopicNode, z: Point, parentZ: Point | null, depth: number, parent: number) => {
    const index = placed.length
    placed.push({ index, label: node.label, depth, parent, z })

    const children = node.children ?? []
    if (children.length === 0) return

    const weights = children.map(leafCount)
    const total = weights.reduce((sum, w) => sum + w, 0)

    let start: number
    let span: number
    if (parentZ) {
      const towardParent = translateToOrigin(parentZ, z)
      const away = Math.atan2(towardParent.y, towardParent.x) + Math.PI
      span = Math.min(2.4, Math.max(0.9, children.length * 0.62))
      start = away - span / 2
    } else {
      span = Math.PI * 2
      start = -Math.PI / 2 - (span * weights[0]) / total / 2
    }

    const step = parentZ ? childStep : rootStep
    let consumed = 0
    children.forEach((child, k) => {
      const theta = start + ((consumed + weights[k] / 2) / total) * span
      consumed += weights[k]
      const local = { x: step * Math.cos(theta), y: step * Math.sin(theta) }
      visit(child, translateFromOrigin(local, z), z, depth + 1, index)
    })
  }

  visit(root, ORIGIN, null, 0, -1)
  return placed
}
