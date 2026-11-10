import { m } from 'motion/react'
import type { Variants } from 'motion/react'
import { FileText, Mail } from 'lucide-react'
import { profile } from '../../data/profile'
import { gitHubMark, linkedInMark } from '../../lib/brands'
import { BrandIcon } from '../ui/BrandIcon'
import { ButtonLink } from '../ui/ButtonLink'
import { StatusIndicator } from './StatusIndicator'
import { Terminal } from './terminal/Terminal'

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgb(var(--glow)/0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--glow)/0.045)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_75%_65%_at_62%_28%,#000_25%,transparent_72%)]" />
      <div className="absolute -top-56 right-[-12%] h-[42rem] w-[56rem] bg-[radial-gradient(closest-side,rgb(var(--glow)/0.08),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-overlay/10 to-transparent" />
    </div>
  )
}

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <Backdrop />
      <div className="mx-auto grid max-w-6xl gap-14 px-5 pt-32 pb-20 sm:px-8 sm:pt-40 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-14 lg:pt-44 lg:pb-24">
        <m.div variants={stagger} initial="hidden" animate="show">
          {/* Blur filters create stacking contexts; z-20 keeps the status popover above later siblings. */}
          <m.div variants={rise} className="relative z-20">
            <StatusIndicator />
          </m.div>
          <m.h1
            id="hero-title"
            variants={rise}
            className="mt-7 text-[2.5rem] leading-[1.04] font-semibold tracking-[-0.045em] text-balance text-mist sm:text-[3.5rem] lg:text-[3.375rem]"
          >
            {profile.headline}
          </m.h1>
          <m.p variants={rise} className="mt-6 max-w-[34rem] text-[1.0625rem] leading-relaxed text-pretty text-fog sm:text-lg">
            {profile.intro}
          </m.p>
          <m.div variants={rise} className="mt-9 flex flex-wrap items-center gap-2.5">
            <ButtonLink variant="primary" href={`mailto:${profile.email}`} icon={<Mail className="size-4" aria-hidden="true" />}>
              Email me
            </ButtonLink>
            <ButtonLink href={profile.links.github} external icon={<BrandIcon mark={gitHubMark} className="size-4" />}>
              GitHub
            </ButtonLink>
            <ButtonLink href={profile.links.linkedin} external icon={<BrandIcon mark={linkedInMark} className="size-4" />}>
              LinkedIn
            </ButtonLink>
            <ButtonLink href={profile.links.resume} external icon={<FileText className="size-4" aria-hidden="true" />}>
              Resume
            </ButtonLink>
          </m.div>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="min-w-0"
        >
          <Terminal />
        </m.div>
      </div>
    </section>
  )
}
