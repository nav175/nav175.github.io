import { Boxes, FlaskConical, ScanLine } from 'lucide-react'

const steps = [
  { Icon: ScanLine, label: 'Ingest images', detail: 'skin-image dataset' },
  { Icon: FlaskConical, label: 'Evaluate', detail: 'CV scoring pass' },
  { Icon: Boxes, label: 'Ship in Docker', detail: 'repeatable runtime' },
] as const

export function DermaScanPreview() {
  return (
    <div className="rounded-xl border border-line bg-carbon/60 p-4 sm:p-5">
      <p className="font-mono text-[11px] tracking-wide text-smoke uppercase">workflow</p>
      <ul className="mt-3 space-y-2">
        {steps.map(({ Icon, label, detail }) => (
          <li
            key={label}
            className="flex items-center gap-3 rounded-lg border border-line bg-graphite/80 px-3 py-2.5 transition-colors hover:border-line-strong"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-carbon text-fog">
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-mist">{label}</p>
              <p className="text-[12px] text-fog">{detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[11.5px] text-smoke">automated tests gate every run</p>
    </div>
  )
}
