import { Activity, Cpu, Radio } from 'lucide-react'

const nodes = [
  { Icon: Radio, label: 'Sensors', detail: 'real-time input' },
  { Icon: Cpu, label: 'Arduino MCU', detail: 'C firmware' },
  { Icon: Activity, label: 'Actuators', detail: 'controlled output' },
] as const

export function IotPreview() {
  return (
    <div className="rounded-xl border border-line bg-carbon/60 p-4 sm:p-5">
      <p className="font-mono text-[11px] tracking-wide text-smoke uppercase">signal path</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
        {nodes.map(({ Icon, label, detail }, index) => (
          <div key={label} className="contents">
            <div className="rounded-lg border border-line bg-graphite/80 px-3 py-3 text-center">
              <span className="mx-auto grid size-8 place-items-center rounded-md border border-line bg-carbon text-fog">
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <p className="mt-2 text-[13px] font-medium text-mist">{label}</p>
              <p className="text-[12px] text-fog">{detail}</p>
            </div>
            {index < nodes.length - 1 ? (
              <div aria-hidden="true" className="relative mx-auto h-6 w-px overflow-hidden bg-line sm:mx-0 sm:h-px sm:w-5">
                <span className="absolute inset-0 bg-linear-to-b from-transparent via-signal to-transparent sm:bg-linear-to-r animate-flow-y sm:animate-flow" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[11.5px] text-smoke">Python telemetry logs acquisition; scope and multimeter for signal integrity</p>
    </div>
  )
}
