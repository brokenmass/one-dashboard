# oneDashboard

Self-hosted home dashboard built with Next.js App Router, Tailwind, MikroORM (SQLite), and a 16-column grid layout.

## Requirements

Initial requirements:

- Next.js + React app router project
- 16-column grid, 60px row-height; draggable tiles (membership via dnd-kit)
- Widgets inside bookmarks; registry-based widget system
- YAML config + SQLite via MikroORM; YAML sync is non-destructive to layout
- Docker health checks via API (dockerode)

Additional requirements implemented:

- Edit mode toggle; editing actions only available in edit mode
- Add bookmark via modal; optional icon and container fields
- Bookmark icons support shorthands: dh-_, mdi-_, si-_, sh-_ and full URLs
- Prevent layout reset when adding widgets/bookmarks (no refresh; optimistic updates)
- Modern, sleek UI styling
- Edit bookmark via modal (only in edit mode)
- No visual separation between bookmark header and body; no “No widgets” message
- “Icon only” bookmark mode: renders as a 1x1 icon tile, with name shown on hover
- Groups: groups have their own internal grid, optional title and icon, and contain bookmarks
- Drag bookmarks into a group by dropping onto a group tile (edit mode)
- Larger bookmark icons for better visibility
- Modern font: Inter applied globally
- Bookmark subtext: short description under the name

Other notes:

- 16 column grid, 60px row height
- Bookmarks are draggable (into groups) via dnd-kit; full-tile drag in edit mode
- Bookmark links are disabled in edit mode to avoid interfering with drag
- Widgets are anchored inside bookmarks and extensible via a registry
- Health checks via Docker socket
- Configuration from YAML + SQLite, synced on load

## Develop

1. Install dependencies
2. Start the dev server

```
npm install
npm run dev
```

Notes

- DB uses SQLite at `data/dev.db`; MikroORM auto-updates schema in dev.
- To use health checks, run the app on a host with Docker and expose the socket at `/var/run/docker.sock` (read-only recommended in production).
- The grid uses simple Tailwind CSS; dnd-kit powers drag-and-drop.
- Server actions are used for all mutations; REST endpoints were removed.

### VS Code Tasks (preferred)

Use VS Code tasks instead of raw terminal commands. Common tasks are defined in `.vscode/tasks.json`:

- Dev: Start Next.js dev server
- Build: Next.js
- Test: Unit (Vitest)
- Test: E2E (Playwright)
- Playwright: Install browsers
- Lint: ESLint

How to run:

1. Open the Command Palette and type “Run Task”, then pick one of the above.
2. Or bind keyboard shortcuts to these tasks if you use them often.

This repo prefers tasks so the workflow is consistent and reproducible (env, flags, and problem matchers pre-wired).

### Scripts

- `npm run dev` — start Next.js in dev mode (Turbopack)
- `npm run build` — production build
- `npm run start` — start production server
- `npm run test` — run unit tests (Vitest)
- `npm run test:e2e` — run Playwright end-to-end tests

## Config YAML

`config/one-dashboard.yaml` example:

```yaml
bookmarks:
  - name: qBittorrent
    url: http://qbittorrent.local:8080
    container: qbittorrent
    x: 0
    y: 0
    w: 4
    h: 3
    subtext: BitTorrent client
    widgets:
      - type: qbittorrent
        config:
          host: http://qbittorrent.local:8080
  - name: Jellyfin
    url: http://jellyfin.local:8096
    container: jellyfin
    x: 4
    y: 0
    w: 4
    h: 3
```

## Server actions

This app no longer exposes REST routes for internal mutations. Client components call server actions directly (see `src/server/actions.ts`) for:

- Creating/updating/deleting bookmarks
- Updating group layout
- Adding widgets to bookmarks
- Checking container health via Docker

## Testing

### Unit tests (Vitest)

- Run all unit tests:

```
npm run test
```

- Each Vitest worker uses its own SQLite DB file at `data/test-<workerId>.db` and the ORM is reset between tests.

### End-to-end tests (Playwright)

- Install Playwright browsers once:

```
npx playwright install
```

- Run e2e tests:

```
npm run test:e2e
```

- Test files follow the convention `*.playwright.ts` under `tests/e2e/`.
- The Playwright config starts the production server (`next build && next start`) on port 3000 and points the DB to `data/e2e.db`.
- You can override the base URL via `PLAYWRIGHT_BASE_URL`.

## Environment variables

- `ONE_DASHBOARD_DB` — path to the SQLite DB file. Defaults to `data/dev.db` in dev, `data/test-*.db` in tests, and `data/e2e.db` in Playwright.
- `PLAYWRIGHT_BASE_URL` — optional base URL for E2E tests (defaults to http://localhost:3000).
