# nav175.github.io

Personal portfolio of [Navjot Singh](https://nav175.github.io/), built with Vite, React, TypeScript, Tailwind CSS, and Motion.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run check   # lint + typecheck + production build
npm run assets  # regenerate favicons and the social image from Geist outlines
```

## Deploy

Pushes to `main` build and publish through GitHub Actions (`.github/workflows/deploy.yml`).

In the repository settings, set **Pages → Source** to **GitHub Actions** once.
