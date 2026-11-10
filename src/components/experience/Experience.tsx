import { profile } from '../../data/profile'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Timeline } from './Timeline'

const facts = [
  { label: 'Studying', value: `BSc Computing Science, ${profile.school}` },
  { label: 'Based in', value: profile.location },
  { label: 'Speaks', value: profile.spokenLanguages.join(', ') },
  { label: 'Looking for', value: profile.availability.seeking },
]

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 pt-16 pb-24 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:pt-20 lg:pb-28">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="experience-title"
            title="Experience"
            description="I like owning a feature end to end: the schema, the API, and the screen people actually use. Here’s where that’s happened so far."
          />
          <Reveal delay={0.1} className="mt-9">
            <dl className="divide-y divide-line border-y border-line">
              {facts.map((fact) => (
                <div key={fact.label} className="grid grid-cols-[6.5rem_1fr] gap-4 py-3.5 text-[14.5px]">
                  <dt className="text-smoke">{fact.label}</dt>
                  <dd className="text-fog">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Timeline />
      </div>
    </section>
  )
}
