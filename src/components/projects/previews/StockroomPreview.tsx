import { Fragment } from 'react'
import type { LucideIcon } from 'lucide-react'
import { BellRing, Database, Globe, Mail, RadioTower, RefreshCw, ShieldCheck, Smartphone, Zap } from 'lucide-react'

interface Tier {
  name: string
  note: string
  items: { Icon: LucideIcon; label: string }[]
}

const tiers: Tier[] = [
  {
    name: 'clients',
    note: 'one Expo codebase',
    items: [
      { Icon: Smartphone, label: 'iOS' },
      { Icon: Smartphone, label: 'Android' },
      { Icon: Globe, label: 'Web' },
    ],
  },
  {
    name: 'supabase',
    note: '32+ migrations',
    items: [
      { Icon: ShieldCheck, label: 'Row-level security' },
      { Icon: Database, label: 'Atomic RPC' },
      { Icon: RadioTower, label: 'Realtime sync' },
      { Icon: Zap, label: 'Edge Functions' },
    ],
  },
  {
    name: 'integrations',
    note: 'OAuth 2.0 + webhooks',
    items: [
      { Icon: RefreshCw, label: 'QuickBooks sync' },
      { Icon: BellRing, label: 'Expo push' },
      { Icon: Mail, label: 'Resend email' },
    ],
  },
]

function Connector({ delay }: { delay: string }) {
  return (
    <div aria-hidden="true" className="flex h-6 items-center justify-center sm:h-auto sm:self-stretch">
      <div className="relative h-full w-px overflow-hidden bg-line-strong sm:h-px sm:w-full">
        <span
          className="absolute inset-x-0 top-0 h-1/3 animate-flow-y bg-linear-to-b from-transparent via-signal/80 to-transparent sm:inset-x-auto sm:inset-y-0 sm:left-0 sm:h-auto sm:w-1/3 sm:animate-flow sm:bg-linear-to-r"
          style={{ animationDelay: delay }}
        />
      </div>
    </div>
  )
}

function TierBox({ tier }: { tier: Tier }) {
  return (
    <div className="rounded-lg border border-line bg-overlay/[0.02] p-2">
      <p className="px-1.5 pt-0.5 pb-1.5 font-mono text-[11px] text-mist">{tier.name}</p>
      <ul className="space-y-0.5">
        {tier.items.map(({ Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[12.5px] text-fog transition-colors duration-200 hover:bg-overlay/[0.05] hover:text-mist"
          >
            <Icon className="size-3.5 shrink-0 text-smoke" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
      <p className="px-1.5 pt-1.5 pb-0.5 font-mono text-[10.5px] text-smoke">{tier.note}</p>
    </div>
  )
}

export function StockroomPreview() {
  return (
    <figure className="rounded-xl border border-line bg-carbon/80 p-3 sm:p-4">
      <figcaption className="sr-only">
        Skytec Stockroom architecture: iOS, Android, and web clients built from one Expo codebase talk to Supabase, which
        enforces row-level security, runs atomic RPC transactions, syncs in realtime, and triggers Edge Functions that
        sync QuickBooks and send push and email alerts.
      </figcaption>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.25rem_1.2fr_1.25rem_1fr] sm:items-center">
        {tiers.map((tier, i) => (
          <Fragment key={tier.name}>
            {i > 0 ? <Connector delay={`${i * 0.9}s`} /> : null}
            <TierBox tier={tier} />
          </Fragment>
        ))}
      </div>
    </figure>
  )
}
