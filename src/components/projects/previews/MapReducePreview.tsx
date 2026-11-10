import { ArrowRight } from 'lucide-react'
import { Reveal } from '../../ui/Reveal'

const stages = [
  { name: 'Map', detail: 'split the input' },
  { name: 'Shuffle', detail: 'group by key' },
  { name: 'Reduce', detail: 'aggregate results' },
] as const

export function MapReducePreview() {
  return (
    <div className="rounded-xl border border-line bg-carbon/60 p-4 sm:p-5">
      <p className="font-mono text-[11px] tracking-wide text-smoke uppercase">pipeline</p>
      <ol className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
        {stages.map((stage, index) => (
          <li key={stage.name} className="flex min-w-0 flex-1 items-stretch gap-2 sm:gap-0">
            <Reveal delay={index * 0.06} className="min-w-0 flex-1">
              <div className="flex h-full flex-col justify-center rounded-lg border border-line bg-graphite/80 px-3 py-3">
                <p className="font-mono text-[13px] font-medium text-mist">{stage.name}</p>
                <p className="mt-1 text-[12px] text-fog">{stage.detail}</p>
              </div>
            </Reveal>
            {index < stages.length - 1 ? (
              <span aria-hidden="true" className="flex items-center text-smoke sm:px-1.5">
                <ArrowRight className="size-3.5 max-sm:rotate-90" />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="mt-3 font-mono text-[11.5px] text-smoke">shell scripts coordinate the worker threads</p>
    </div>
  )
}
