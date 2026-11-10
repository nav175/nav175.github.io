import { useRef } from 'react'
import { m, useScroll, useSpring } from 'motion/react'
import { ArrowUpRight, Briefcase, GraduationCap, Trophy } from 'lucide-react'
import { timeline } from '../../data/experience'
import type { TimelineEntry, TimelineKind } from '../../data/experience'
import { cn } from '../../lib/cn'
import { StackTags } from '../projects/ProjectCard'
import { Reveal } from '../ui/Reveal'

const kindIcon: Record<TimelineKind, typeof Briefcase> = {
  work: Briefcase,
  award: Trophy,
  education: GraduationCap,
}

function TimelineItem({ entry }: { entry: TimelineEntry }) {
  const Icon = kindIcon[entry.kind]
  return (
    <li className="relative pl-12 sm:pl-14">
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0 left-0 grid size-[31px] place-items-center rounded-full border bg-ink',
          entry.kind === 'award' ? 'border-signal/40 text-signal shadow-[0_0_18px_-4px_var(--color-signal)]' : 'border-line-strong text-fog',
        )}
      >
        <Icon className="size-3.5" />
      </span>

      <Reveal y={12}>
        <p className="pt-1.5 font-mono text-[12px] text-smoke">{entry.period}</p>
        <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-mist">{entry.title}</h3>
        <p className="mt-0.5 text-[14.5px] text-fog">
          {entry.org}
          <span className="text-smoke">, {entry.location}</span>
        </p>
        <p className="mt-3 max-w-[62ch] leading-relaxed text-pretty text-fog">{entry.summary}</p>

        {entry.highlights ? (
          <ul className="mt-4 max-w-[62ch] space-y-2.5">
            {entry.highlights.map((highlight) => (
              <li
                key={highlight}
                className="relative pl-4 text-[14.5px] leading-relaxed text-pretty text-fog before:absolute before:top-[0.72em] before:left-0 before:size-1 before:rounded-full before:bg-smoke"
              >
                {highlight}
              </li>
            ))}
          </ul>
        ) : null}

        {entry.tags ? <StackTags items={entry.tags} className="mt-5" /> : null}

        {entry.link ? (
          <a
            href={entry.link.href}
            target="_blank"
            rel="noreferrer"
            className="group mt-4 inline-flex items-center gap-1.5 text-[13.5px] text-fog transition-colors duration-200 hover:text-mist"
          >
            {entry.link.label}
            <ArrowUpRight
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : null}
      </Reveal>
    </li>
  )
}

export function Timeline() {
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.8', 'end 0.55'] })
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })

  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute top-2 bottom-2 left-[15px] w-px bg-line" />
      <m.div
        aria-hidden="true"
        style={{ scaleY: progress }}
        className="absolute top-2 bottom-2 left-[15px] w-px origin-top bg-linear-to-b from-mist/80 via-mist/50 to-mist/10"
      />
      <ol ref={listRef} className="relative space-y-14">
        {timeline.map((entry) => (
          <TimelineItem key={entry.id} entry={entry} />
        ))}
      </ol>
    </div>
  )
}
