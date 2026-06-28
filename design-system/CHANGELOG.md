# Design System Changelog

## v1.0.0 — Initial Release

Initial design system for Harvester of Sorrow (HOS).

### Tokens
- **Colors**: Dark theme ("Ride the Lightning") and light theme ("…And Justice for All") extracted from Metallica album covers
- **Typography**: IBM Plex Sans + IBM Plex Mono, full scale from 10px to 28px
- **Spacing**: Gap scale (4px–22px), border radius variants (4px–16px), shadows
- **Animations**: `hos-indet`, `hos-spin`, `hos-toast`, `hos-pulse`, `hos-pop`, `hos-fade-in`

### Assets
- `scythe.svg` — Logo mark, use with `fill="currentColor"`

### Screens covered
- Navbar, Sidebar, Mobile tab bar
- Search (card styles: gradient / accent / poster)
- Downloads (table + cards layout, live progress, track expansion)
- Library (monitoring status, filter)
- Settings (TMDB, Download config, Extractor, System info)

### Components
- StatusBadge, ProgressBar, SourcePill, Toast
