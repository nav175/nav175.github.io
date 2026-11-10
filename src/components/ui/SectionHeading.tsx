import { Reveal } from './Reveal'

interface SectionHeadingProps {
  id: string
  title: string
  description?: string
}

export function SectionHeading({ id, title, description }: SectionHeadingProps) {
  return (
    <Reveal className="max-w-2xl">
      <h2 id={id} className="text-3xl font-semibold tracking-[-0.035em] text-balance text-mist sm:text-[2.5rem] sm:leading-[1.1]">
        {title}
      </h2>
      {description ? <p className="mt-4 text-base leading-relaxed text-pretty text-fog sm:text-[1.0625rem]">{description}</p> : null}
    </Reveal>
  )
}
