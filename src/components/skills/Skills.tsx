import { useState } from 'react'
import type { CSSProperties } from 'react'
import { skillGroups } from '../../data/skills'
import type { Skill, SkillIcon } from '../../data/skills'
import { visibleBrandColor } from '../../lib/brands'
import { cn } from '../../lib/cn'
import { BrandIcon } from '../ui/BrandIcon'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

function SkillGlyph({ icon, className }: { icon: SkillIcon; className?: string }) {
  if (icon.kind === 'brand') return <BrandIcon mark={icon.mark} className={className} />
  const { Icon } = icon
  return <Icon className={className} aria-hidden="true" />
}

const brandColor = (skill: Skill) =>
  skill.icon.kind === 'brand' ? visibleBrandColor(skill.icon.mark.hex) : 'var(--color-mist)'

function SkillBadge({ skill, active, onActivate }: { skill: Skill; active: boolean; onActivate: () => void }) {
  return (
    <li>
      <button
        type="button"
        onPointerEnter={onActivate}
        onFocus={onActivate}
        onClick={onActivate}
        style={{ '--brand': brandColor(skill) } as CSSProperties}
        className={cn(
          'group inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13.5px] transition-[border-color,background-color,color,box-shadow,transform] duration-200 active:scale-[0.97]',
          active
            ? 'border-overlay/25 bg-overlay/[0.07] text-mist shadow-[0_0_22px_-8px_var(--brand)]'
            : 'border-line bg-overlay/[0.02] text-fog hover:border-overlay/20 hover:text-mist',
        )}
      >
        <SkillGlyph
          icon={skill.icon}
          className={cn(
            'size-4 shrink-0 transition-colors duration-200',
            active ? 'text-(--brand)' : 'text-smoke group-hover:text-(--brand)',
          )}
        />
        {skill.name}
      </button>
    </li>
  )
}

function Readout({ skill }: { skill: Skill | null }) {
  return (
    <div className="sticky bottom-3 z-10 p-2 sm:p-3 lg:static">
      <div
        aria-live="polite"
        className="flex min-h-[5.75rem] flex-col justify-center gap-1 rounded-xl border border-line bg-graphite/90 px-4 py-3.5 font-mono text-[12.5px] leading-relaxed backdrop-blur-md sm:min-h-14 sm:flex-row sm:items-center sm:justify-start sm:gap-3"
      >
        {skill ? (
          <>
            <span className="flex shrink-0 items-center gap-2 text-mist">
              <SkillGlyph icon={skill.icon} className="size-3.5 text-fog" />
              {skill.name}
            </span>
            <span className="text-fog">{skill.usedIn}</span>
          </>
        ) : (
          <span className="text-smoke">Hover or tap a tool to see where I’ve used it.</span>
        )}
      </div>
    </div>
  )
}

export function Skills() {
  const [active, setActive] = useState<Skill | null>(null)

  return (
    <section id="stack" aria-labelledby="stack-title">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <SectionHeading
          id="stack-title"
          title="The stack behind the work"
          description="Grouped by what I reach for, and tied to where I’ve actually used it."
        />

        <Reveal className="mt-12">
          <div className="glass rounded-2xl">
            {skillGroups.map((group) => (
              <div
                key={group.id}
                className="grid gap-4 border-b border-line p-5 sm:p-7 lg:grid-cols-[11rem_1fr] lg:gap-8"
              >
                <h3 className="flex items-baseline gap-2 text-[13.5px] font-medium text-mist lg:pt-2">
                  {group.label}
                  <span className="font-mono text-[11.5px] font-normal text-smoke">{group.skills.length}</span>
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <SkillBadge
                      key={skill.name}
                      skill={skill}
                      active={active?.name === skill.name}
                      onActivate={() => setActive(skill)}
                    />
                  ))}
                </ul>
              </div>
            ))}
            <Readout skill={active} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
