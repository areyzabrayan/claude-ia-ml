# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Diario de Estudio" — a single-page app to log study sessions and track a day-streak, meant to
motivate the user. Built incrementally: this is an early, intentionally minimal version. Don't
add features beyond what's explicitly requested for the current iteration.

## Commands

No build, lint, or test tooling. Open `index.html` directly in a browser (double-click or
`file://` path) — no server, no install step. To verify a change, drive it with Playwright
against the `file://` path (executable at `/opt/pw-browsers/chromium` in this environment)
instead of assuming correctness from reading the code.

## Architecture

Exactly three files, no frameworks, no build step:
- `index.html` — form (fecha/tema/minutos) + racha display + session list, all static markup.
- `styles.css` — mobile-first, card-based layout.
- `app.js` — all state and logic. Sessions are stored as an array of
  `{ fecha: "YYYY-MM-DD", tema, minutos, creada: <timestamp> }` objects in `localStorage` under
  the key `diario-estudio-sesiones`.

### Streak calculation (`calcularRacha` in app.js)

The core logic to preserve when touching this file:
- A day counts if it has at least one session.
- The streak is consecutive days with a session, ending today.
- If today has no session yet but yesterday does, the streak is still alive (today isn't over).
- If neither today nor yesterday has a session, the streak is 0.
- **Always use local dates, never UTC.** Dates are built/compared via
  `getFullYear`/`getMonth`/`getDate` (see `hoyLocal`, `formatearFechaLocal`,
  `textoAFechaLocal`, `sumarDias`) — never `toISOString()` or UTC-based math, since that would
  shift the day boundary for users not in UTC.

### Best-streak calculation (`calcularMejorRacha` in app.js)

Shows the longest streak ever achieved, next to the live streak above. Shares
`obtenerDiasConSesion` (unique session dates as a `Set`) with `calcularRacha`, then walks the
sorted dates once tracking a running streak and the max seen. It deliberately does **not**
apply the "today isn't over yet" rule from `calcularRacha` — that rule only decides whether the
*final* streak counts as still alive for display; `calcularMejorRacha` measures each historical
run by its real length. It's fully derived from `sesiones` on every render, like the live
streak — there's no separate "high score" value cached in `localStorage`, so it can never drift
out of sync with the session history (and needs no migration/initialization step for existing
users). Invariant to keep in mind when touching this code: `calcularMejorRacha(sesiones) >=
calcularRacha(sesiones)` always, since the live streak is by construction one of the runs it
measures.

### Session list ordering

Sorted most-recent-first by `fecha`; sessions on the same day are ordered by `creada`
(insertion timestamp) descending — this is what lets the form stay simple (no manual sort order
field) while still showing same-day entries in the order they were added.

## Conventions

- All UI text in Spanish.
- No frameworks, libraries, or build step.
- User-supplied text (`tema`) is escaped before being inserted into the DOM (see `escaparHTML`)
  — don't switch back to raw `innerHTML` interpolation.

## Workflow for this project

This project is developed directly on `main`, with no feature branches or pull requests —
changes are small enough that a branch/PR cycle isn't needed. Commit and push straight to
`main`.
