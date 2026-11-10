import { dermascan, hyperspace, iot, mapreduce, stockroom } from '../../data/projects'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { ProjectCard } from './ProjectCard'
import { DermaScanPreview } from './previews/DermaScanPreview'
import { HyperbolicPreview } from './previews/HyperbolicPreview'
import { IotPreview } from './previews/IotPreview'
import { MapReducePreview } from './previews/MapReducePreview'
import { StockroomPreview } from './previews/StockroomPreview'

export function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-48 left-1/2 -z-10 h-[44rem] w-[min(70rem,100%)] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(var(--glow)/0.05),transparent)]"
      />
      <div className="mx-auto max-w-6xl px-5 pt-20 pb-12 sm:px-8 lg:pt-24 lg:pb-16">
        <SectionHeading
          id="projects-title"
          title="Selected work"
          description="The projects on my latest co-op resume, plus the inventory platform I shipped at Skytec Supply."
        />

        <div className="mt-12 grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-12">
            <ProjectCard project={hyperspace} layout="split" preview={<HyperbolicPreview />} />
          </Reveal>
          <Reveal className="lg:col-span-6">
            <ProjectCard project={mapreduce} preview={<MapReducePreview />} />
          </Reveal>
          <Reveal className="lg:col-span-6" delay={0.08}>
            <ProjectCard project={dermascan} preview={<DermaScanPreview />} />
          </Reveal>
          <Reveal className="lg:col-span-5">
            <ProjectCard project={iot} preview={<IotPreview />} />
          </Reveal>
          <Reveal className="lg:col-span-7" delay={0.08}>
            <ProjectCard project={stockroom} preview={<StockroomPreview />} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
