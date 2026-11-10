import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import { Experience } from './components/experience/Experience'
import { Hero } from './components/hero/Hero'
import { Footer } from './components/layout/Footer'
import { Nav } from './components/layout/Nav'
import { Projects } from './components/projects/Projects'
import { Skills } from './components/skills/Skills'
import { ThemeProvider } from './components/layout/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domAnimation} strict>
          <div className="grain relative isolate min-h-dvh overflow-x-clip">
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <Nav />
            <main id="main" tabIndex={-1} className="focus-visible:outline-none">
              <Hero />
              <Projects />
              <Skills />
              <Experience />
            </main>
            <Footer />
          </div>
        </LazyMotion>
      </MotionConfig>
    </ThemeProvider>
  )
}
