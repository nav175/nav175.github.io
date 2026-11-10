const resumeUrl = `${import.meta.env.BASE_URL}assets/pdf/Navjot-Resume.pdf`

export const profile = {
  name: 'Navjot Singh',
  firstName: 'Navjot',
  initials: 'NS',
  headline: 'Full-stack software, from schema to screen.',
  intro:
    'I’m Navjot, a Computing Science student at SFU. I’ve shipped an enterprise inventory platform and a prize-winning hackathon project.',
  school: 'Simon Fraser University',
  location: 'British Columbia, Canada',
  email: 'nsn8@sfu.ca',
  spokenLanguages: ['English', 'Punjabi', 'Hindi'],
  availability: {
    open: true,
    label: 'Open for opportunities',
    seeking: 'Software engineering internships and new-grad roles',
  },
  links: {
    github: 'https://github.com/nav175',
    linkedin: 'https://www.linkedin.com/in/navjot-s',
    devpost: 'https://devpost.com/nav175',
    resume: resumeUrl,
  },
} as const
