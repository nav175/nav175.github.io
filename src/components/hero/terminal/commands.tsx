import type { ReactNode } from 'react'
import { timeline } from '../../../data/experience'
import { profile } from '../../../data/profile'
import { featuredProjects } from '../../../data/projects'
import { skillGroups } from '../../../data/skills'
import {
  applyTheme,
  isThemePreference,
  nextTheme,
  readStoredTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from '../../../lib/theme'
import { Row, Rows, TermLink } from './TerminalOutput'

export interface CommandResult {
  output: ReactNode
  clear?: boolean
}

interface Command {
  summary: string
  hidden?: boolean
  run: (args: string[]) => CommandResult
}

const RESUME_FILE = 'resume.pdf'
const display = (url: string) => url.replace(/^https:\/\/(www\.)?/, '')
const out = (output: ReactNode): CommandResult => ({ output })

function openResumeTab(): boolean {
  // Don't pass 'noopener' here: it makes window.open always return null, so we
  // can't tell a blocked pop-up from a successful one. Clear opener ourselves.
  const win = window.open(profile.links.resume, '_blank')
  if (win) {
    win.opener = null
    return true
  }
  return false
}

function resumeOutput(opened: boolean) {
  return out(
    <p className="text-fog">
      {opened ? 'Opening' : 'Pop-up blocked. Open'}{' '}
      <TermLink href={profile.links.resume} external>
        Navjot-Resume.pdf
      </TermLink>
      {opened ? ' in a new tab' : ' directly'}
    </p>,
  )
}

function setThemePreference(next: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    // private mode / blocked storage
  }
  applyTheme(next)
  window.dispatchEvent(new CustomEvent('portfolio-theme', { detail: next }))
}

const commands: Record<string, Command> = {
  help: {
    summary: 'List the commands',
    run: () =>
      out(
        <Rows>
          {Object.entries(commands)
            .filter(([, command]) => !command.hidden)
            .map(([name, command]) => (
              <Row key={name} name={name}>
                <span className="text-smoke">{command.summary}</span>
              </Row>
            ))}
        </Rows>,
      ),
  },
  whoami: {
    summary: 'Who is behind this site',
    run: () =>
      out(
        <>
          <p className="text-mist">{profile.name}</p>
          <p className="text-fog">Computing Science at {profile.school}</p>
          <p className="text-fog">Based in {profile.location}</p>
        </>,
      ),
  },
  status: {
    summary: 'Availability',
    run: () =>
      out(
        <>
          <p className="text-signal">● {profile.availability.label.toLowerCase()}</p>
          <p className="text-fog">{profile.availability.seeking}</p>
        </>,
      ),
  },
  projects: {
    summary: 'Selected work, with links',
    run: () =>
      out(
        <Rows>
          {featuredProjects.map((project) => (
            <Row
              key={project.id}
              name={<TermLink href={`#project-${project.id}`}>{project.id}/</TermLink>}
            >
              {project.award ? `${project.context}, winner` : project.context}
            </Row>
          ))}
        </Rows>,
      ),
  },
  open: {
    summary: `Jump to a project, or open ${RESUME_FILE}`,
    run: ([name]) => {
      if (!name) {
        return out(
          <p className="text-fog">
            usage: open &lt;project|{RESUME_FILE}&gt;. Try projects for the list.
          </p>,
        )
      }
      const target = name.toLowerCase()
      if (target === RESUME_FILE || target === 'resume' || target === 'navjot-resume.pdf') {
        return resumeOutput(openResumeTab())
      }
      const project = featuredProjects.find((candidate) => candidate.id.startsWith(target))
      if (!project) return out(<p className="text-fog">No project called {name}. Try projects.</p>)
      document.getElementById(`project-${project.id}`)?.scrollIntoView({ block: 'start' })
      return out(<p className="text-fog">Scrolling to {project.name}</p>)
    },
  },
  stack: {
    summary: 'Languages, frameworks, and tools',
    run: () =>
      out(
        <Rows>
          {skillGroups.map((group) => (
            <Row key={group.id} name={group.id}>
              {group.skills.map((skill) => skill.name).join(', ')}
            </Row>
          ))}
        </Rows>,
      ),
  },
  experience: {
    summary: 'Work, school, and wins',
    run: () =>
      out(
        <Rows>
          {timeline.map((entry) => (
            <Row key={entry.id} name={entry.period.match(/\d{4}/)?.[0] ?? entry.period}>
              {entry.title}, {entry.org}
            </Row>
          ))}
        </Rows>,
      ),
  },
  contact: {
    summary: 'Ways to reach me',
    run: () =>
      out(
        <Rows>
          <Row name="email">
            <TermLink href={`mailto:${profile.email}`}>{profile.email}</TermLink>
          </Row>
          <Row name="github">
            <TermLink href={profile.links.github} external>
              {display(profile.links.github)}
            </TermLink>
          </Row>
          <Row name="linkedin">
            <TermLink href={profile.links.linkedin} external>
              {display(profile.links.linkedin)}
            </TermLink>
          </Row>
          <Row name="devpost">
            <TermLink href={profile.links.devpost} external>
              {display(profile.links.devpost)}
            </TermLink>
          </Row>
        </Rows>,
      ),
  },
  resume: {
    summary: `Alias for open ${RESUME_FILE}`,
    run: () => commands.open.run([RESUME_FILE]),
  },
  theme: {
    summary: 'Cycle light, dark, or system',
    run: ([arg]) => {
      const current = readStoredTheme()
      if (!arg || arg === 'cycle' || arg === 'next') {
        const next = nextTheme(current)
        setThemePreference(next)
        return out(<p className="text-fog">Theme set to {next}</p>)
      }
      if (isThemePreference(arg.toLowerCase())) {
        const next = arg.toLowerCase() as ThemePreference
        setThemePreference(next)
        return out(<p className="text-fog">Theme set to {next}</p>)
      }
      return out(
        <p className="text-fog">
          usage: theme [light|dark|system]. Current: {current}.
        </p>,
      )
    },
  },
  clear: {
    summary: 'Clear the screen',
    run: () => ({ output: null, clear: true }),
  },
  ls: {
    summary: 'Alias for projects',
    hidden: true,
    run: (args) => commands.projects.run(args),
  },
  sudo: {
    summary: '',
    hidden: true,
    run: () =>
      out(
        <p className="text-fog">
          Permission denied. Asking nicely works better:{' '}
          <TermLink href={`mailto:${profile.email}`}>{profile.email}</TermLink>
        </p>,
      ),
  },
}

/** Played on load, as if typed. Must stay free of side effects. */
export const INTRO_COMMANDS = ['whoami', 'projects'] as const

export const SUGGESTED_COMMANDS = ['help', 'stack', 'experience', 'contact', 'resume'] as const

/** Command string shown when the resume chip is clicked. */
export const RESUME_TYPED_COMMAND = `open ${RESUME_FILE}`

export function commandForSuggestion(suggestion: string): string {
  return suggestion === 'resume' ? RESUME_TYPED_COMMAND : suggestion
}

export function runCommand(input: string): CommandResult {
  const [name = '', ...args] = input.trim().split(/\s+/)
  const command = Object.hasOwn(commands, name.toLowerCase()) ? commands[name.toLowerCase()] : undefined
  if (command) return command.run(args)
  return out(
    <p className="text-fog">
      command not found: {name}. Type <span className="text-mist">help</span> for the list.
    </p>,
  )
}

/** Tab completion for command names, and for project / resume names after `open`. */
export function completeCommand(input: string): string | null {
  const openMatch = /^open\s+(\S*)$/i.exec(input)
  if (openMatch) {
    const prefix = openMatch[1].toLowerCase()
    if (RESUME_FILE.startsWith(prefix)) return `open ${RESUME_FILE}`
    const hit = featuredProjects.find((project) => project.id.startsWith(prefix))
    return hit ? `open ${hit.id}` : null
  }
  if (!input || /\s/.test(input)) return null
  const hit = Object.keys(commands).find((name) => !commands[name].hidden && name.startsWith(input.toLowerCase()))
  return hit ?? null
}
