# Harvester of Sorrow UI

**HOS** — Self-hosted multi-source media download manager. Queues, monitors, and downloads movies and TV shows from streaming sources (VixSrc, RaiPlay, and others). The name is a word game on the Metallica track.

## Overview

React frontend built pixel-faithfully from the HOS design handoff. Implements all screens with live animated state, dual themes, and responsive layout.

### Screens

| Screen | Description |
|---|---|
| **Search** | Query movies & TV, filter by type, card style switcher (Gradient / Accent / Poster) |
| **Downloads** | Live download queue with Table / Cards layout, track expansion, progress animation |
| **Library** | TV show monitoring table with status management |
| **Settings** | TMDB config, download config, system info, tool check |

### Features

- **Dark / Light themes** — "Ride the Lightning" and "…And Justice for All" palettes, persisted to `localStorage`
- **Live simulation** — Downloads animate in real time (speed jitter, QUEUED → EXTRACTING → DOWNLOADING → MERGING → COPYING → COMPLETED)
- **Responsive** — Desktop sidebar + mobile bottom tab bar + slide-in drawer
- **Design tokens** — All CSS custom properties from the HOS design system v1.0.0

---

## Stack

- **React 19** + Vite 6
- **Plain CSS custom properties** (no CSS-in-JS, no Tailwind) — tokens live in `src/design-system/tokens.css`
- **No UI library** — built from scratch to match the design handoff

---

## Getting Started

```bash
cd hos-app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build     # outputs to hos-app/dist/
```

### Docker

```bash
docker build -t hos-ui ./hos-app
docker run -p 8080:80 hos-ui
```

Then visit [http://localhost:8080](http://localhost:8080).

---

## Project Structure

```
harvester-of-sorrow-ui/
├── .github/
│   └── workflows/
│       └── docker.yml          # CI: build + push to GHCR on push to main
├── design-system/
│   ├── CHANGELOG.md
│   └── v1.0.0/                 # Versioned design system tokens + assets
│       ├── scythe.svg
│       ├── styles.css
│       └── tokens/
│           ├── colors.css
│           ├── typography.css
│           ├── spacing.css
│           └── animations.css
├── hos-app/                    # React application
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── design-system/
│       │   └── tokens.css      # All CSS custom properties (imported by index.css)
│       ├── hooks/
│       │   ├── useTheme.js     # Theme toggle + localStorage persistence
│       │   ├── useWindowSize.js
│       │   └── useDownloads.js # Seed data + live download simulation
│       ├── components/
│       │   ├── ScytheIcon.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── ProgressBar.jsx
│       │   ├── SourcePill.jsx
│       │   └── Toast.jsx
│       ├── screens/
│       │   ├── SearchScreen.jsx
│       │   ├── DownloadsScreen.jsx
│       │   ├── LibraryScreen.jsx
│       │   └── SettingsScreen.jsx
│       ├── App.jsx             # Root layout: Navbar, Sidebar, routing
│       ├── index.css           # Global reset + scrollbar styles
│       └── main.jsx
└── README.md
```

---

## Design System

The design system lives in `design-system/` as versioned directories. To create a new version:

1. Copy `design-system/v1.0.0/` to `design-system/v1.1.0/`
2. Edit the token files
3. Update `CHANGELOG.md`
4. Point `hos-app/src/design-system/tokens.css` to the new version (or import the new directory)

The token CSS is the single source of truth — all component styling references CSS custom properties.

---

## CI / CD

GitHub Actions workflow (`.github/workflows/docker.yml`) triggers on push to `main`/`master` and version tags:

- Builds a multi-platform Docker image (`linux/amd64`, `linux/arm64`)
- Pushes to GitHub Container Registry (`ghcr.io/<owner>/<repo>`)
- Uses layer caching for fast rebuilds

Pull requests build but do **not** push.

### Deploying a new version

```bash
git tag v1.2.0
git push origin v1.2.0
```

The image will be tagged `v1.2.0`, `1.2`, and `sha-<short>` in GHCR.

---

## Brand

- **App name:** Harvester of Sorrow
- **Abbrev:** HOS
- **Logo:** Scythe SVG (`fill="currentColor"`, colored with `--brand`)
- **Fonts:** IBM Plex Sans (UI) + IBM Plex Mono (data values)
- **Dark palette:** Extracted from Metallica "Ride the Lightning" (1984)
- **Light palette:** Extracted from Metallica "…And Justice for All" (1988)
