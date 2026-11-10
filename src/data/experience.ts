export type TimelineKind = 'work' | 'award' | 'education'

export interface TimelineEntry {
  id: string
  kind: TimelineKind
  period: string
  title: string
  org: string
  location: string
  summary: string
  highlights?: string[]
  tags?: string[]
  link?: { label: string; href: string }
}

export const timeline: TimelineEntry[] = [
  {
    id: 'stormhacks',
    kind: 'award',
    period: 'Oct 2026',
    title: 'StormHacks 2026 Hackathon Winner',
    org: 'StormHacks 2026',
    location: 'SFU Burnaby',
    summary:
      'Built HyperSpace with a team of three over the hackathon weekend and took the win. The event drew 832 participants.',
    link: { label: 'Devpost', href: 'https://devpost.com/software/hyperspace' },
  },
  {
    id: 'skytec',
    kind: 'work',
    period: 'May - Aug 2026',
    title: 'Software Developer Co-op',
    org: 'Skytec Supply Inc.',
    location: 'Surrey, BC',
    summary:
      'Built and deployed Skytec Stockroom, the company’s inventory, rental dispatch, and rebar tonnage app for iOS, Android, and the web.',
    highlights: [
      'Designed a three-tier role system (Admin, Yard Operations, Client Portal) enforced with PostgreSQL row-level security and an admin approval gate.',
      'Wrote atomic PostgreSQL RPC transactions and Realtime sync across 32+ migrations for dispatches, material returns, and write-offs with photo evidence.',
      'Built a rebar tonnage engine (10M to 35M bar sizes) with 80% and 100% quota alerts through Edge Functions, Expo push, and Resend email.',
      'Integrated two-way QuickBooks Online inventory sync over OAuth 2.0 with HMAC-SHA256 verified webhooks.',
    ],
    tags: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'PostgreSQL'],
  },
  {
    id: 'fic',
    kind: 'work',
    period: 'May - Dec 2024',
    title: 'Technology Specialist',
    org: 'Fraser International College',
    location: 'Burnaby, BC',
    summary:
      'Frontline IT support for students, faculty, and staff. Triaged tickets in Jira, standardized reporting in Excel, and documented root causes for the team.',
  },
  {
    id: 'sfu',
    kind: 'education',
    period: 'Sep 2023 - 2027',
    title: 'BSc, Computing Science',
    org: 'Simon Fraser University',
    location: 'Burnaby, BC',
    summary:
      'Coursework in data structures and algorithms, software engineering, database systems, systems programming, networking, and AI. CGPA 3.76 / 4.33.',
  },
]
