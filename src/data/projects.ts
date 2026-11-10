export type ProjectLinkKind = 'demo' | 'code' | 'devpost'

export interface ProjectLink {
  kind: ProjectLinkKind
  label: string
  href: string
}

export interface ProjectMetric {
  value: string
  label: string
}

export interface Project {
  id: string
  name: string
  context: string
  summary: string
  award?: string
  metrics: ProjectMetric[]
  stack: string[]
  links: ProjectLink[]
  /** Shown instead of links when the code belongs to an employer. */
  privateNote?: string
}

export const hyperspace: Project = {
  id: 'hyperspace',
  name: 'HyperSpace',
  context: 'StormHacks 2026',
  award: 'StormHacks 2026 Hackathon Winner',
  summary:
    'A knowledge map of AI on a hyperbolic disk. Click a topic and the map recenters around it, so what you focus on grows while the rest stays in view.',
  metrics: [
    { value: '5,635', label: 'Wikipedia topics' },
    { value: '29', label: 'fields, 6 levels deep' },
    { value: 'Hybrid', label: 'vector + full-text search' },
  ],
  stack: ['Next.js', 'TypeScript', 'TiDB', 'Gemini API', 'Canvas'],
  links: [
    { kind: 'demo', label: 'Live demo', href: 'https://hyperspace-henna.vercel.app' },
    { kind: 'code', label: 'Code', href: 'https://github.com/nav175/HyperSpace' },
    { kind: 'devpost', label: 'Devpost', href: 'https://devpost.com/software/hyperspace' },
  ],
}

export const mapreduce: Project = {
  id: 'mapreduce',
  name: 'Multithreaded MapReduce Engine',
  context: 'Systems coursework',
  summary:
    'A concurrent MapReduce-style engine in C/C++ that parses large datasets, fans work across threads, and visualizes latency across the pipeline.',
  metrics: [
    { value: 'C/C++', label: 'native engine' },
    { value: 'Multi-thread', label: 'map and reduce stages' },
  ],
  stack: ['C', 'C++', 'Shell', 'Data Analysis'],
  links: [],
}

export const dermascan: Project = {
  id: 'dermascan',
  name: 'DermaScan AI',
  context: 'Workflow automation',
  summary:
    'A computer-vision workflow that evaluates skin-image data, with automated tests and a Dockerized runtime for repeatable runs.',
  metrics: [
    { value: 'CV', label: 'image evaluation pipeline' },
    { value: 'Docker', label: 'containerized runs' },
  ],
  stack: ['Python', 'Docker', 'Automated Testing'],
  links: [],
}

export const iot: Project = {
  id: 'iot-embedded',
  name: 'IoT & Embedded Systems',
  context: 'Sensor automation & firmware',
  summary:
    'Low-level microcontroller firmware in C for real-time sensor input and actuator control, plus Python telemetry for acquisition and logging.',
  metrics: [
    { value: 'C', label: 'firmware on Arduino' },
    { value: 'Python', label: 'telemetry scripts' },
  ],
  stack: ['C', 'Python', 'Arduino', 'Hardware Testing'],
  links: [],
}

export const stockroom: Project = {
  id: 'skytec-stockroom',
  name: 'Skytec Stockroom',
  context: 'Co-op at Skytec Supply',
  summary:
    'Inventory, rental dispatch, and rebar tonnage tracking for an equipment rental company, shipped to iOS, Android, and the web from one codebase.',
  metrics: [
    { value: '3', label: 'platforms, one codebase' },
    { value: '32+', label: 'SQL migrations' },
    { value: '3-tier', label: 'roles behind row-level security' },
  ],
  stack: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'PostgreSQL'],
  links: [],
  privateNote: 'Proprietary codebase, built for Skytec Supply',
}

export const featuredProjects: Project[] = [hyperspace, mapreduce, dermascan, iot, stockroom]
