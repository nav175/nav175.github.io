import type { LucideIcon } from 'lucide-react'
import { Cable, CircuitBoard, Database, FileSpreadsheet } from 'lucide-react'
import {
  siC,
  siCplusplus,
  siDocker,
  siExpo,
  siGit,
  siGithubactions,
  siGooglegemini,
  siJavascript,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siQuickbooks,
  siReact,
  siSupabase,
  siTypescript,
  siVercel,
} from 'simple-icons'
import type { BrandMark } from '../lib/brands'

export type SkillIcon = { kind: 'brand'; mark: BrandMark } | { kind: 'glyph'; Icon: LucideIcon }

export interface Skill {
  name: string
  icon: SkillIcon
  /** Where it was used, shown in the readout on hover or focus. */
  usedIn: string
}

export interface SkillGroup {
  id: string
  label: string
  skills: Skill[]
}

const brand = (mark: BrandMark): SkillIcon => ({ kind: 'brand', mark })
const glyph = (Icon: LucideIcon): SkillIcon => ({ kind: 'glyph', Icon })

export const skillGroups: SkillGroup[] = [
  {
    id: 'languages',
    label: 'Languages',
    skills: [
      { name: 'TypeScript', icon: brand(siTypescript), usedIn: 'Skytec Stockroom and HyperSpace, end to end.' },
      { name: 'JavaScript', icon: brand(siJavascript), usedIn: 'HyperSpace’s Node data pipeline and browser clients.' },
      { name: 'Python', icon: brand(siPython), usedIn: 'DermaScan AI, IoT telemetry scripts, and systems tooling.' },
      { name: 'SQL', icon: glyph(Database), usedIn: '32+ PostgreSQL migrations at Skytec, and hybrid search in TiDB.' },
      { name: 'C++', icon: brand(siCplusplus), usedIn: 'The multithreaded MapReduce engine.' },
      { name: 'C', icon: brand(siC), usedIn: 'MapReduce workers and Arduino firmware for the IoT project.' },
    ],
  },
  {
    id: 'frameworks',
    label: 'Frameworks',
    skills: [
      { name: 'React', icon: brand(siReact), usedIn: 'HyperSpace’s interface and this site.' },
      { name: 'React Native', icon: brand(siReact), usedIn: 'Skytec Stockroom on iOS, Android, and the web from one codebase.' },
      { name: 'Expo', icon: brand(siExpo), usedIn: 'Builds and push notifications for Skytec Stockroom.' },
      { name: 'Next.js', icon: brand(siNextdotjs), usedIn: 'HyperSpace’s app and its search, ask, and grow API routes.' },
      { name: 'Node.js', icon: brand(siNodedotjs), usedIn: 'HyperSpace’s Wikipedia ingest and embedding pipeline.' },
      { name: 'Docker', icon: brand(siDocker), usedIn: 'Containerized DermaScan AI runs.' },
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud & tools',
    skills: [
      { name: 'Supabase', icon: brand(siSupabase), usedIn: 'Auth, Realtime, and Edge Functions behind Skytec Stockroom.' },
      { name: 'PostgreSQL', icon: brand(siPostgresql), usedIn: 'Row-level security and atomic RPC transactions at Skytec.' },
      { name: 'Gemini API', icon: brand(siGooglegemini), usedIn: 'Grows branches, explains links, and answers questions in HyperSpace.' },
      { name: 'Vercel', icon: brand(siVercel), usedIn: 'Hosting HyperSpace’s live demo.' },
      { name: 'QuickBooks API', icon: brand(siQuickbooks), usedIn: 'Two-way inventory sync over OAuth 2.0 with HMAC-verified webhooks.' },
      { name: 'Arduino', icon: glyph(CircuitBoard), usedIn: 'Sensor acquisition and actuator control in the IoT project.' },
      { name: 'Excel', icon: glyph(FileSpreadsheet), usedIn: 'Standardized reporting workflows at Fraser International College.' },
      { name: 'Sockets', icon: glyph(Cable), usedIn: 'Concurrent worker coordination in systems coursework.' },
      { name: 'Git', icon: brand(siGit), usedIn: 'Branches and pull requests on every project here.' },
      { name: 'GitHub Actions', icon: brand(siGithubactions), usedIn: 'Building and deploying this site to GitHub Pages.' },
    ],
  },
]
