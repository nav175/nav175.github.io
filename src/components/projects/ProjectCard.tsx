import type { ReactNode } from 'react'
import { ArrowUpRight, Globe, Lock, Trophy } from 'lucide-react'
import type { Project, ProjectLink, ProjectMetric } from '../../data/projects'
import { devpostMark, gitHubMark } from '../../lib/brands'
import { cn } from '../../lib/cn'
import { BrandIcon } from '../ui/BrandIcon'
import { SpotlightCard } from '../ui/SpotlightCard'

function LinkIcon({ kind }: { kind: ProjectLink['kind'] }) {
  if (kind === 'code') return <BrandIcon mark={gitHubMark} className="size-3.5" />
  if (kind === 'devpost') return <BrandIcon mark={devpostMark} className="size-3.5" />
  return <Globe className="size-3.5" aria-hidden="true" />
}

function ProjectLinks({ project }: { project: Project }) {
  if (project.privateNote) {
    return (
      <p className="inline-flex items-center gap-2 text-[13px] text-smoke">
        <Lock className="size-3.5" aria-hidden="true" />
        {project.privateNote}
      </p>
    )
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {project.links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${link.label} for ${project.name} (opens in a new tab)`}
            className={cn(
              'group inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap',
              'transition-[background-color,border-color,transform] duration-200 active:scale-[0.97]',
              link.kind === 'demo'
                ? 'bg-mist text-ink hover:opacity-90'
                : 'border border-line-strong bg-overlay/[0.02] text-mist hover:border-overlay/25 hover:bg-overlay/[0.07]',
            )}
          >
            <LinkIcon kind={link.kind} />
            {link.label}
            <ArrowUpRight
              className="size-3.5 opacity-60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
              aria-hidden="true"
            />
          </a>
        </li>
      ))}
    </ul>
  )
}

function ProjectMetrics({ metrics }: { metrics: ProjectMetric[] }) {
  return (
    <dl className={cn('grid gap-4 border-t border-line pt-5', metrics.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
      {metrics.map((metric) => (
        <div key={metric.label} className="flex flex-col gap-1">
          <dt className="text-[12.5px] leading-snug text-smoke">{metric.label}</dt>
          <dd className="order-first font-mono text-[1.0625rem] tracking-[-0.02em] text-mist sm:text-lg">{metric.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function StackTags({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)} aria-label="Built with">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-line bg-overlay/[0.02] px-2.5 py-1 font-mono text-[11.5px] leading-none text-fog"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

interface ProjectCardProps {
  project: Project
  preview?: ReactNode
  layout?: 'stacked' | 'split'
  className?: string
}

export function ProjectCard({ project, preview, layout = 'stacked', className }: ProjectCardProps) {
  const headingId = `project-${project.id}-title`
  const split = layout === 'split'

  return (
    <SpotlightCard
      id={`project-${project.id}`}
      aria-labelledby={headingId}
      className={cn(
        'flex scroll-mt-6 flex-col p-5 sm:p-7',
        split && 'lg:grid lg:grid-cols-[1fr_1.08fr] lg:items-center lg:gap-12 lg:p-8',
        className,
      )}
    >
      <div className={cn('flex flex-col', split && 'lg:py-2 lg:pr-2')}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]">
          <span className="text-fog">{project.context}</span>
          {project.award ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-signal/25 bg-signal/10 px-2.5 py-1 text-[12px] leading-none font-medium text-signal">
              <Trophy className="size-3.5" aria-hidden="true" />
              {project.award}
            </span>
          ) : null}
        </div>

        <h3
          id={headingId}
          className={cn(
            'mt-4 font-semibold tracking-[-0.03em] text-mist',
            split ? 'text-[1.75rem] sm:text-[2.125rem]' : 'text-[1.625rem]',
          )}
        >
          {project.name}
        </h3>
        <p className="mt-3 max-w-[58ch] leading-relaxed text-pretty text-fog">{project.summary}</p>

        {project.metrics.length > 0 ? (
          <div className="mt-6">
            <ProjectMetrics metrics={project.metrics} />
          </div>
        ) : null}

        <StackTags items={project.stack} className="mt-6" />
        <div className="mt-6">
          <ProjectLinks project={project} />
        </div>
      </div>

      {preview ? <div className={cn('pt-6', split && 'lg:order-first lg:pt-0')}>{preview}</div> : null}
    </SpotlightCard>
  )
}
