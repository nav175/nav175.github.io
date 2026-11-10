import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import { aiTopics } from '../../../data/hyperspaceTopics'
import {
  alongGeodesic,
  conformalScale,
  geodesicPath,
  layoutTree,
  translateToOrigin,
  type Point,
} from '../../../lib/hyperbolic'

const VIEW_HALF = 500
const RADIUS = 460
const NODES = layoutTree(aiTopics)
const EDGES = NODES.filter((node) => node.parent >= 0)
const LAYOUT = NODES.map((node) => node.z)
const COLLAPSED = NODES.map(() => ({ x: 0, y: 0 }))
/** Rings of equal hyperbolic distance (1 to 4) from the focus, as in HyperSpace's geometry lens. */
const RINGS = [1, 2, 3, 4].map((distance) => Math.tanh(distance / 2))
const MAX_DEPTH = Math.max(...NODES.map((node) => node.depth))
const RECENTER_MS = 820
const UNFOLD_MS = 1500

const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

function rotate(p: Point, angle: number): Point {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos }
}

function keepInsideDisk(p: Point): Point {
  const r = Math.hypot(p.x, p.y)
  return r > 0.9995 ? { x: (p.x / r) * 0.9995, y: (p.y / r) * 0.9995 } : p
}

interface Box {
  x0: number
  y0: number
  x1: number
  y1: number
}

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0

type Side = 'right' | 'left' | 'below' | 'above'

/** Preferred label sides for a node, best first: outward from the disk centre, then around it. */
function sidesFor(x: number, y: number): Side[] {
  const angle = Math.atan2(y, x)
  if (Math.cos(angle) > 0.38) return ['right', 'below', 'above', 'left']
  if (Math.cos(angle) < -0.38) return ['left', 'below', 'above', 'right']
  return Math.sin(angle) < 0 ? ['above', 'right', 'left', 'below'] : ['below', 'right', 'left', 'above']
}

function labelBox(side: Side, x: number, y: number, gap: number, width: number, size: number) {
  const anchor: 'start' | 'middle' | 'end' = side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle'
  const tx = side === 'right' ? x + gap : side === 'left' ? x - gap : x
  const ty = side === 'below' ? y + gap + size * 0.55 : side === 'above' ? y - gap - size * 0.55 : y
  const x0 = anchor === 'start' ? tx : anchor === 'end' ? tx - width : tx - width / 2
  return { anchor, tx, ty, box: { x0, y0: ty - size * 0.6, x1: x0 + width, y1: ty + size * 0.6 } }
}

export function HyperbolicPreview() {
  const frameRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const haloRef = useRef<SVGCircleElement>(null)
  const nodeEls = useRef<(SVGCircleElement | null)[]>([])
  const hitEls = useRef<(SVGCircleElement | null)[]>([])
  const labelEls = useRef<(SVGTextElement | null)[]>([])
  const edgeEls = useRef<(SVGPathElement | null)[]>([])

  const displayed = useRef<Point[]>(COLLAPSED)
  const labelAlpha = useRef(0)
  const focus = useRef(0)
  const hovered = useRef(-1)
  const unitsPerPx = useRef(2)
  const frame = useRef(0)
  const unfolded = useRef(false)

  const [focusLabel, setFocusLabel] = useState(NODES[0].label)
  const reduceMotion = useReducedMotion()
  const inView = useInView(frameRef, { once: true, amount: 0.35 })

  const draw = useCallback((points: Point[]) => {
    displayed.current = points
    const f = focus.current
    const neighbours = new Set<number>([NODES[f].parent])
    for (const node of NODES) if (node.parent === f) neighbours.add(node.index)

    const scales = points.map(conformalScale)

    points.forEach((p, i) => {
      const x = (p.x * RADIUS).toFixed(2)
      const y = (p.y * RADIUS).toFixed(2)
      const state = i === f ? 'focus' : i === hovered.current ? 'hover' : 'idle'
      const node = nodeEls.current[i]
      if (node) {
        node.setAttribute('cx', x)
        node.setAttribute('cy', y)
        node.setAttribute('r', Math.max(1.6, (state === 'focus' ? 13 : state === 'hover' ? 11 : 7.5) * scales[i]).toFixed(2))
        node.dataset.state = state
      }
      const hit = hitEls.current[i]
      if (hit) {
        hit.setAttribute('cx', x)
        hit.setAttribute('cy', y)
        hit.setAttribute('r', Math.max(9, 30 * scales[i]).toFixed(2))
      }
    })

    const halo = haloRef.current
    if (halo) {
      halo.setAttribute('cx', (points[f].x * RADIUS).toFixed(2))
      halo.setAttribute('cy', (points[f].y * RADIUS).toFixed(2))
      halo.setAttribute('r', (38 * scales[f]).toFixed(2))
    }

    EDGES.forEach((node, k) => {
      const el = edgeEls.current[k]
      if (!el) return
      const p = points[node.parent]
      const q = points[node.index]
      el.setAttribute('d', geodesicPath(p, q, RADIUS))
      const onFocus = node.parent === f || node.index === f
      const s = (scales[node.parent] + scales[node.index]) / 2
      el.setAttribute('stroke-opacity', (onFocus ? 0.55 : 0.06 + 0.3 * s).toFixed(3))
      el.dataset.state = onFocus ? 'focus' : 'idle'
    })

    // Greedy label picker: focus and hover first, then the largest nodes, rejecting overlaps.
    const order = NODES.map((node) => node.index).sort((a, b) => {
      const rank = (i: number) => (i === f ? 3 : i === hovered.current ? 2 : 0) + scales[i]
      return rank(b) - rank(a)
    })
    const taken: Box[] = []
    const u = unitsPerPx.current
    const limit = VIEW_HALF - 6

    for (const i of order) {
      const el = labelEls.current[i]
      if (!el) continue
      const s = scales[i]
      const isFocus = i === f
      const isHover = i === hovered.current
      const wanted = isFocus || isHover || s > 0.55 || (neighbours.has(i) && s > 0.2)
      if (!wanted || labelAlpha.current <= 0) {
        el.setAttribute('opacity', '0')
        continue
      }

      const sizePx = isFocus ? 15 : 10.5 + 3.5 * s
      const size = sizePx * u
      const width = NODES[i].label.length * size * 0.56
      const gap = Math.max(1.6, 7.5 * s) + 6 * u
      const px = points[i].x * RADIUS
      const py = points[i].y * RADIUS
      const sides: Side[] = isFocus || Math.hypot(px, py) < 1 ? ['below'] : sidesFor(px, py)
      const fits = (box: Box) =>
        box.x0 >= -limit && box.x1 <= limit && box.y0 >= -limit && box.y1 <= limit && !taken.some((other) => overlaps(box, other))
      const candidates = sides.map((side) => labelBox(side, px, py, gap, width, size))
      const placed = isFocus ? candidates[0] : candidates.find((candidate) => fits(candidate.box))
      if (!placed) {
        el.setAttribute('opacity', '0')
        continue
      }
      taken.push(placed.box)

      el.setAttribute('x', placed.tx.toFixed(2))
      el.setAttribute('y', placed.ty.toFixed(2))
      el.setAttribute('font-size', size.toFixed(2))
      el.setAttribute('stroke-width', (4 * u).toFixed(2))
      el.setAttribute('text-anchor', placed.anchor)
      el.setAttribute('opacity', (labelAlpha.current * (isFocus || isHover ? 1 : Math.min(1, 0.3 + s))).toFixed(3))
      el.dataset.state = isFocus ? 'focus' : 'idle'
    }
  }, [])

  const animate = useCallback(
    (duration: number, step: (t: number) => Point[], onDone?: () => void) => {
      cancelAnimationFrame(frame.current)
      if (reduceMotion) {
        draw(step(1))
        onDone?.()
        return
      }
      const start = performance.now()
      const tick = (now: number) => {
        const t = clamp01((now - start) / duration)
        draw(step(t))
        if (t < 1) frame.current = requestAnimationFrame(tick)
        else onDone?.()
      }
      frame.current = requestAnimationFrame(tick)
    },
    [draw, reduceMotion],
  )

  const recenter = useCallback(
    (target: number, restoreLayout = false) => {
      const from = displayed.current.slice()
      const b = from[target]
      focus.current = target
      labelAlpha.current = 1
      setFocusLabel(NODES[target].label)

      // When resetting, also undo the rotation that repeated recentering accumulates.
      let turn = 0
      if (restoreLayout) {
        const probe = translateToOrigin(from[1], b)
        turn = Math.atan2(LAYOUT[1].y, LAYOUT[1].x) - Math.atan2(probe.y, probe.x)
        turn = Math.atan2(Math.sin(turn), Math.cos(turn))
      }

      animate(
        RECENTER_MS,
        (t) => {
          const e = easeInOutCubic(t)
          const c = alongGeodesic(b, e)
          return from.map((z) => keepInsideDisk(rotate(translateToOrigin(z, c), turn * e)))
        },
        restoreLayout ? () => draw(LAYOUT) : undefined,
      )
    },
    [animate, draw],
  )

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const measure = () => {
      const width = svg.getBoundingClientRect().width
      if (width > 0) unitsPerPx.current = (VIEW_HALF * 2) / width
      draw(displayed.current)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [draw])

  useEffect(() => {
    if (!inView || unfolded.current) return
    unfolded.current = true
    let finished = false
    labelAlpha.current = 0
    animate(
      UNFOLD_MS,
      (t) => {
        labelAlpha.current = clamp01((t - 0.5) / 0.5)
        return NODES.map((node) => {
          const local = clamp01((t - node.depth * 0.14) / (1 - MAX_DEPTH * 0.14))
          return alongGeodesic(node.z, easeOutCubic(local))
        })
      },
      () => {
        finished = true
      },
    )
    return () => {
      cancelAnimationFrame(frame.current)
      if (!finished) unfolded.current = false
    }
  }, [inView, animate])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const setHover = (index: number) => {
    hovered.current = index
    if (unfolded.current) draw(displayed.current)
  }

  return (
    <figure ref={frameRef} className="relative overflow-hidden rounded-xl border border-line bg-carbon/80">
      <figcaption className="sr-only">
        Interactive preview of HyperSpace: AI topics laid out on a Poincaré disk. Selecting a topic recenters the map on
        it with a Möbius transformation.
      </figcaption>

      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 font-mono text-[11.5px]">
        <p className="min-w-0 truncate text-smoke">
          focus <span className="text-mist">{focusLabel}</span>
        </p>
        <button
          type="button"
          onClick={() => recenter(0, true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-fog transition-colors hover:bg-overlay/[0.06] hover:text-mist"
        >
          <RotateCcw className="size-3" aria-hidden="true" />
          reset
        </button>
      </div>

      <div className="relative aspect-square w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--overlay)/0.04),transparent)] dark:bg-[radial-gradient(closest-side,rgb(61_214_140/0.07),transparent)]"
        />
        <svg
          ref={svgRef}
          viewBox={`${-VIEW_HALF} ${-VIEW_HALF} ${VIEW_HALF * 2} ${VIEW_HALF * 2}`}
          className="absolute inset-0 size-full touch-manipulation select-none"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="hs-disk" r="0.5">
              <stop offset="0%" stopColor="rgb(var(--glow) / 0.05)" />
              <stop offset="100%" stopColor="rgb(var(--glow) / 0.015)" />
            </radialGradient>
          </defs>
          <circle r={RADIUS} fill="url(#hs-disk)" className="stroke-overlay/15" vectorEffect="non-scaling-stroke" />
          {RINGS.map((ring) => (
            <circle
              key={ring}
              r={ring * RADIUS}
              fill="none"
              strokeDasharray="2 7"
              vectorEffect="non-scaling-stroke"
              className="stroke-overlay/[0.07]"
            />
          ))}

          <g fill="none" strokeWidth={1}>
            {EDGES.map((node, k) => (
              <path
                key={node.index}
                ref={(el) => {
                  edgeEls.current[k] = el
                }}
                vectorEffect="non-scaling-stroke"
                className="stroke-mist data-[state=focus]:stroke-signal"
              />
            ))}
          </g>

          <circle ref={haloRef} className="fill-signal/15" />

          <g>
            {NODES.map((node) => (
              <circle
                key={node.index}
                ref={(el) => {
                  nodeEls.current[node.index] = el
                }}
                className="fill-fog transition-[fill] duration-200 data-[state=focus]:fill-signal data-[state=hover]:fill-mist"
              />
            ))}
          </g>

          <g className="font-sans">
            {NODES.map((node) => (
              <text
                key={node.index}
                ref={(el) => {
                  labelEls.current[node.index] = el
                }}
                dominantBaseline="central"
                opacity={0}
                className="fill-fog stroke-carbon [paint-order:stroke] [stroke-linejoin:round] data-[state=focus]:fill-mist data-[state=focus]:font-semibold"
              >
                {node.label}
              </text>
            ))}
          </g>

          <g>
            {NODES.map((node) => (
              <circle
                key={node.index}
                ref={(el) => {
                  hitEls.current[node.index] = el
                }}
                className="cursor-pointer fill-transparent"
                onPointerEnter={() => setHover(node.index)}
                onPointerLeave={() => setHover(-1)}
                onClick={() => recenter(node.index)}
              />
            ))}
          </g>
        </svg>
      </div>

      <p className="border-t border-line px-4 py-2.5 font-mono text-[11.5px] text-smoke">
        click any topic to recenter the disk
      </p>
    </figure>
  )
}
