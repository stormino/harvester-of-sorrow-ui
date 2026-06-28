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

The design system lives in `design-system/` as versioned directories. The app consumes it via `hos-app/src/design-system/tokens.css`, which is the compiled single-file entry point used at runtime.

### Structure

```
design-system/
├── CHANGELOG.md          # Version history
└── v1.0.0/               # One directory per version
    ├── scythe.svg         # Logo mark
    ├── styles.css         # Root entry — @imports all token files
    └── tokens/
        ├── colors.css     # Dark + light theme palettes
        ├── typography.css # Font imports + size/weight/leading scale
        ├── spacing.css    # Gap, radius, shadow, layout tokens
        └── animations.css # hos-* keyframes + duration/easing tokens
```

### Token reference

All tokens are CSS custom properties on `:root` (dark) and `[data-theme="light"]`. The theme is applied by setting `data-theme` on `<html>` — the app does this automatically from `useTheme.js`.

**Colors** (example — see `tokens/colors.css` for full list):

| Token | Dark | Light | Role |
|---|---|---|---|
| `--bg` | `#16171f` | `#EFF6F6` | Page background |
| `--surface` | `#1E1F28` | `#FAFEFE` | Cards, sidebar |
| `--surface-2` | `#222433` | `#E6E2D4` | Inputs, nav hover |
| `--elevated` | `#272a40` | `#FFFFFF` | Dialogs, toasts |
| `--border` | `#2a2e60` | `#D4CCBA` | Default borders |
| `--border-strong` | `#303E84` | `#93ADB2` | Focused borders |
| `--text` | `#D6E1EE` | `#434A47` | Primary text |
| `--text-muted` | `#8aa4c0` | `#6a7e80` | Secondary text |
| `--text-dim` | `#4a6a90` | `#93ADB2` | Placeholder, disabled |
| `--brand` | `#4A7EBC` | `#8a7018` | Buttons, active nav, focus |
| `--success` | `#3fb950` | `#2d7a35` | Complete, healthy |
| `--error` | `#f15f53` | `#c42c28` | Failed |
| `--warning` | `#f0a92c` | `#b06010` | Stalled, degraded |

**Typography:**

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | IBM Plex Sans | All UI chrome |
| `--font-mono` | IBM Plex Mono | Data values, timestamps, paths |
| `--text-xs` | `10px` | Caps labels, micro metadata |
| `--text-sm` | `11px` | Version badge, secondary metadata |
| `--text-base` | `13px` | Body text |
| `--text-ui` | `14px` | Standard UI labels, table rows |
| `--text-md` | `15px` | Navbar title, section headers |
| `--text-lg` | `17px` | Data readouts |
| `--text-xl` | `22px` | Screen headings |

**Spacing & shape:**

| Token | Value | Usage |
|---|---|---|
| `--gap-xs/sm/md/lg/xl` | 4 / 6 / 9 / 14 / 22 px | Layout gaps |
| `--radius-sm` | `4px` | Badges, chips |
| `--radius-md` | `7px` | Buttons, inputs |
| `--radius-nav` | `8px` | Nav items |
| `--radius-card` | `9px` | Task cards |
| `--radius-lg` | `12px` | Large panels |
| `--radius-xl` | `16px` | Dialogs |

**Color-mix pattern** — used throughout for tinted surfaces:

```css
color-mix(in srgb, var(--brand) 14%, transparent)   /* active nav bg */
color-mix(in srgb, var(--error) 14%, transparent)    /* danger button bg */
color-mix(in srgb, var(--success) 22%, transparent)  /* glow ring */
color-mix(in srgb, var(--brand) 18%, transparent)    /* input focus ring */
```

### Releasing a new design system version

1. **Copy** the current version directory:
   ```bash
   cp -r design-system/v1.0.0 design-system/v1.1.0
   ```

2. **Edit** the token files in `design-system/v1.1.0/tokens/` as needed.

3. **Sync** the changes into the app's compiled token file:
   ```bash
   # Option A: copy the full tokens.css manually
   cp design-system/v1.1.0/styles.css hos-app/src/design-system/tokens.css
   # then inline-update the @import paths or paste the token blocks directly

   # Option B: edit hos-app/src/design-system/tokens.css directly
   # (it is a self-contained copy, not a symlink)
   ```

4. **Document** the change in `design-system/CHANGELOG.md`.

5. **Commit** and open a PR — the Docker image will rebuild automatically on merge to `main`.

### Adding a new token

1. Add the custom property to both `:root` (dark) and `[data-theme="light"]` in `tokens/colors.css` (or the appropriate file).
2. Add it to `hos-app/src/design-system/tokens.css` in both theme blocks.
3. Reference it in components as `var(--my-new-token)`.

### Animations

All keyframes use the `hos-` prefix. Available animations:

| Name | Usage | Timing |
|---|---|---|
| `hos-indet` | Indeterminate progress bar sweep | `1.1s ease-in-out infinite` |
| `hos-spin` | Spinner rotation | `0.7s linear infinite` |
| `hos-pulse` | Status dot breathing | `1.6s ease-in-out infinite` |
| `hos-toast` | Toast entry | `0.2s ease` |
| `hos-pop` | Dialog/overlay entry | `0.15s ease` |
| `hos-fade-in` | Generic fade | `0.15s ease` |

Use them directly in inline styles or CSS classes:
```jsx
<div style={{ animation: 'hos-spin 0.7s linear infinite' }} />
```

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
