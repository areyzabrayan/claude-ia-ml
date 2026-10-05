# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of independent, from-scratch frontend learning projects, each living in its own
folder under `projects-claude/`. There is no shared build system, package manager, or
dependency graph between projects — each one is self-contained.

## Commands

There is no build, lint, or test tooling in this repo. Every project is plain HTML/CSS/JS with
no framework, no bundler, and no npm dependencies. To run or check any project, open its
`index.html` directly in a browser (double-click, or `file://` path) — no server required.

To verify a change actually works, use Playwright against the `file://` path of the project's
`index.html` (see `/opt/pw-browsers/chromium` as the executable path in this environment) rather
than assuming correctness from reading the code.

## Architecture

- `index.html` (repo root) — a landing page listing links to each project under
  `projects-claude/`. This is the GitHub Pages entry point (Pages is configured to deploy from
  `main`, root folder). **Any time a new project folder is added under `projects-claude/`, add a
  link to it here too**, or it won't be reachable from the published site.
- `projects-claude/<Project Name>/` — one folder per project, each with exactly
  `index.html`, `styles.css`, and `app.js` (or no JS if the project is static). Folder names use
  spaces and Title Case (e.g. `Diario de Estudio`, `Primera Landing Page`) and are referenced
  with URL-encoded paths from the root `index.html`.

### Per-project conventions (established by existing projects)

- All UI text is in Spanish.
- No frameworks, libraries, or build step — code must run by opening the HTML file directly.
- Client-side persistence (when needed) uses `localStorage`, never a backend.
- Date/time logic must use the user's local timezone, never UTC (e.g. compute local
  `YYYY-MM-DD` strings from `getFullYear`/`getMonth`/`getDate`, not `toISOString`).
- Code favors clarity over cleverness: short, well-named functions, comments only where the
  "why" isn't obvious from the code, written for someone new to programming.

## Workflow notes specific to this repo

- Each project is developed incrementally across sessions — don't add functionality beyond
  what's explicitly requested for a given iteration.
- When adding a new project folder, follow the existing structure (`index.html` + `styles.css`
  + `app.js`) and update the root `index.html` link list in the same change.
