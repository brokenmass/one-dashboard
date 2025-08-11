# Copilot Coding Agent Onboarding

This document gives you everything you need to work efficiently in this repo without lots of searching. Prefer following these instructions exactly; only search the codebase when something here is missing or incorrect.

## What this repository is

- Self‑hosted home dashboard built with Next.js App Router (React) using a 16‑column, 60px row grid layout.
- Bookmarks (tiles) and Groups (containers with nested grid). Drag/drop via dnd-kit; simple Tailwind grid layout.
- Data is persisted in SQLite via MikroORM. Optional YAML config is read at startup.
- Health widgets (e.g., Docker containers) via a small widget registry system.

Tech stack and size

- TypeScript, Next.js 15, React 19, Tailwind CSS 4, MikroORM 6 (SQLite), Vitest, Playwright, dnd-kit.
- Single app in this repo; no packages/monorepo.

## How to build, run, test, and lint (validated flows)

Always use npm (lockfile present). Node 18.18+ recommended; Node 20 LTS works well.

1. Bootstrap

- Always run: npm install
- Optional but recommended once locally: npx playwright install (installs browsers)

2. Develop (local dev server)

- npm run dev
- Dev server runs Turbopack and hot reloads. Default DB path is data/dev.db (created automatically).

3. Lint

- npm run lint
- ESLint config: eslint.config.mjs (Next.js + TypeScript flat config).

4. Unit tests (Vitest)

- npm run test -s
- Vitest setup: vitest.config.ts and vitest.setup.ts. Each run uses an in‑memory SQLite DB; reflect‑metadata is initialized in setup. No additional services required.

5. E2E tests (Playwright)

- First time only: npx playwright install
- Recommended run (headless, more deterministic): npm run test:e2e -- --headless
- Playwright config: playwright.config.ts starts the production server for you (npm run build && npm run start on port 3000). It sets ONE_DASHBOARD_DB=:memory: for tests.
- If a run fails due to UI timing/drag flake, re‑run with: npm run test:e2e -- --retries=1 --headed

6. Production build and start

- Build: npm run build
- Start: npm run start
- Next.js config: next.config.ts (serverExternalPackages includes dockerode; images remotePatterns configured).

Preferred: VS Code Tasks

- This repo provides tasks in .vscode/tasks.json so you don’t have to remember flags:
  - Dev: Start Next.js dev server
  - Build: Next.js
  - Test: Unit (Vitest)
  - Test: E2E (Playwright)
  - Playwright: Install browsers
  - Lint: ESLint
- Use “Run Task” in VS Code to execute these. They encapsulate the correct commands.

Environment variables

- ONE_DASHBOARD_DB: SQLite file path. Defaults to data/dev.db in dev; tests and Playwright use in‑memory DB unless overridden.
- PLAYWRIGHT_BASE_URL: Optional base URL for E2E runs (defaults to http://localhost:3000).

Known behaviors and mitigations

- E2E drag‑and‑drop uses dnd-kit; headless mode is typically more stable. If you see intermittent drops, re‑run or use --headed for visibility.
- No Docker daemon is required to run or test the app; health checks gracefully fall back to "unknown" when Docker is unavailable.

## Project layout and where to make changes

Root files (high signal)

- package.json: scripts (dev, build, start, lint, test, test:e2e) and dependencies.
- next.config.ts: Next.js config (images, experimental flags, serverExternalPackages).
- eslint.config.mjs: ESLint flat config.
- tsconfig.json: TS settings (paths alias @/\*, decorators enabled for MikroORM).
- playwright.config.ts: E2E configuration (test dir, server command, env).
- vitest.config.ts, vitest.setup.ts: Unit test config and ORM reset.
- postcss.config.mjs: Tailwind PostCSS.
- README.md: Developer overview and scripts.

App and components

- src/app/layout.tsx, src/app/page.tsx: App Router entry points.
- src/components/ClientDashboard.tsx: Main client component. Builds the Grid items tree from bookmarks/groups and owns drag/drop membership logic (moving bookmarks into/out of groups, persisting via server actions). If you need to change DnD/membership, start here.
- src/components/Grid.tsx: Simple Tailwind grid rendering groups and bookmarks. Keeps data attributes used by tests (data-testid, data-grid-id, data-group-id).
- src/components/dnd/: Lightweight wrappers around dnd-kit context and hooks (DndProvider, Draggable, Droppable).
- src/components/BookmarkCard.tsx, AddBookmarkForm.tsx, EditBookmarkForm.tsx, AddGroupForm.tsx, EditModeToggle.tsx, HealthBadge.tsx: UI building blocks.

Data and server actions

- src/lib/orm.ts: MikroORM singleton (SQLite). Creates data directory, updates schema in dev. Exposes getORM()/getEM() and a test reset helper.
- src/models/\*.ts: MikroORM entities: Bookmark, Group, Setting, Widget.
- src/server/actions.ts: Server Actions for all mutations (create/update/delete bookmarks, create/update groups, widgets, delete group, Docker health). Prefer using/adding actions here over REST endpoints.

Widgets

- src/modules/widgets/index.ts and qbittorrent.tsx: Simple widget registry pattern. Add new widgets here and render them in BookmarkCard.

Configuration

- config/one-dashboard.yaml: Optional YAML source of truth for initial bookmarks and widgets (non‑destructive to layout).

Testing

- Unit tests live with code (src/\*_/_.spec.ts) and run in Node environment.
- E2E tests are under tests/e2e/\*.playwright.ts and rely on data attributes/ARIA roles. Avoid removing:
  - data-testid="bookmarks-grid"
  - data-grid-id on tiles and data-group-id on group containers

CI and pre‑check‑in

- There are no GitHub Actions workflows defined in this repo. To avoid breaking changes, always run, in order: npm install; npm run lint; npm run test -s; npm run build; npm run test:e2e -- --headless.
- If you change selectors or drag behavior, run E2E locally to confirm the DnD scenario still passes.

Conventions and gotchas

- Use server actions for mutations; do not add internal REST endpoints.
- Icon‑only bookmarks should be constrained visually to small tiles.
- MikroORM requires reflect‑metadata; tests initialize this in vitest.setup.ts.

Trust these instructions first. Only perform broader searches if something here is incomplete or incorrect.
