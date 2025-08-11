# Project Refactoring Documentation

## Table of Contents

- [Project Refactoring Documentation](#project-refactoring-documentation)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Motivation for Refactoring](#motivation-for-refactoring)
  - [Technology Stack](#technology-stack)
    - [Previous Stack](#previous-stack)
    - [Current Stack](#current-stack)
  - [New Architecture](#new-architecture)
    - [Bridge Layer architecture overview](#bridge-layer-architecture-overview)
    - [Business Logic Layer architecture overview](#business-logic-layer-architecture-overview)
    - [Core Modules](#core-modules)
    - [Data Flow](#data-flow)
    - [File Structure](#file-structure)
  - [Refactoring Process](#refactoring-process)
    - [Migration Strategy](#migration-strategy)
    - [Breaking Changes](#breaking-changes)
    - [Backward Compatibility](#backward-compatibility)
  - [Key Decisions](#key-decisions)
  - [Tooling \& Infrastructure](#tooling--infrastructure)
  - [Testing \& Quality Assurance](#testing--quality-assurance)
  - [Known Issues \& Limitations](#known-issues--limitations)
  - [Future Improvements](#future-improvements)
  - [Appendix](#appendix)
    - [Note on Tailwind CSS](#note-on-tailwind-css)

---

## Overview

This document reflects the ongoing refactor from the legacy vanilla Electron app to a modern Electron + React + TypeScript stack. It summarizes the current architecture (Electron main + preload bridge + React renderer), state management via typed React contexts (settings, language, game store, game controller, notifications), persistence through JSON files accessed from the preload bridge. 

**Note:** Initially, there was a plan to migrate styling to Tailwind CSS. However, in the course of development, I decided to abandon this idea. Rewriting the already completed migration from CSS to SCSS once again seemed unreasonable and, in practice, would not be a skill-building exercise but a waste of time, especially considering that I am already rewriting a previously rewritten React app.

## Motivation for Refactoring

Explain the rationale behind the refactor:
- Technical debt
- Maintainability
- Scalability
- Framework deprecation
- Business goals

> The main idea of refactoring is to make this project something bigger and valueable, improve different skills and knowledge.

## Technology Stack

### Previous Stack

Briefly describe the technologies used before:
- Vanilla js
- Electron

### Current Stack

List all updated technologies and why each was chosen:
- React + TypeScript — componentized UI with type safety and maintainability
- Electron — desktop packaging, native shell integrations
- Vite — fast dev server and optimized builds
- SCSS — main styling solution after migration from CSS; Tailwind CSS was considered but not adopted (see note above)
- Jest + React Testing Library — unit/integration tests for the React app

## New Architecture

### Bridge Layer architecture overview

``` bash
  ┌─────────────────────────────┐
  │         OS + Files          │
  │  ┌───────────────────────┐  │
  │  │ settings.json         │◄─┤  AppData/Roaming/play_and_learn/data
  │  │ gamestorage.json      │◄─┘
  └─────────────────────────────┘
        ▲
        │ (fs.readFileSync / writeFileSync)
        ▼
  ┌─────────────────────────────┐
  │         preload.js          │ ◄─ (contextBridge)
  │                             │
  │  window.settingsAPI:        │
  │    get(key), getAll(), set, │
  │    subscribe(cb)            │
  │                             │
  │  window.gameStoreAPI:       │
  │    load/save user data,     │
  │    list/create/delete/rename│
  │                             │
  │  window.electronAPI:        │
  │    quitApp, openExternal    │
  └─────────────────────────────┘
        ▲
        │ contextIsolation: true
        ▼
┌─────────────────────────────────────────────┐
│                  React (UI)                 │
│                                             │
│  LanguageProvider.t(key)                    │
│  SettingsProvider.useSetting('language')    │ → calls settingsAPI
│  GameStoreProvider.login/records/users      │ → calls gameStoreAPI
│  GameControllerProvider.start/endGame       │ → coordinates records + unlocks
│                                             │
│  UI rerenders when contexts update          │
└─────────────────────────────────────────────┘

```

### Business Logic Layer architecture overview

```bash
┌───────────────────────────────────────────────┐
│                 <Routes>                      │
│                                               │
│  SettingsProvider                             │
│  LanguageProvider                              │
│  GameStoreProvider                             │
│    └─ GameControllerProvider                   │  ← (idle, playing, win, lose)
│        └─ GameLayout (by gameId)               │
│            ├─ Menu (collect settings)          │ → startGame + setGameContext
│            └─ Game (play round)                │ → endGame(status, score)
│                                               │
│  On win: GameController → addGameRecord →      │
│          unlockAchievementCheck → (notify TBD) │
│                                               │
│  Achievement/Notification UI renders higher    │
└───────────────────────────────────────────────┘

```

### Core Modules

List and describe main architectural modules or layers:
- Electron Main (electron_ts/main.js)
  - Creates BrowserWindow, routes dev/prod loads, IPC for quit/openExternal.
  - Security posture: contextIsolation=true, nodeIntegration=false, sandbox=false (review pending).
- Preload Bridge (electron_ts/preload.js)
  - settingsAPI: get/getAll/set/subscribe (JSON persistence to settings.json).
  - gameStoreAPI: user CRUD + load/save user data (gamestorage.json).
  - electronAPI: quitApp/openExternal utilities.
- UI Layer (src_ts/pages, components, layouts)
  - Pages: Home, Catalog, Settings, Achievements. Layout: GameLayout with side panels/main.
  - Modules: game_digital, game_shulte provide menus and gameplay.
- State/Context Layer (src_ts/contexts)
  - SettingsProvider: wraps bridge settings with React hooks and cross-window subscriptions.
  - LanguageProvider: typed translations and runtime language switching.
  - GameStoreProvider: current user, achievements registry, records, and user management.
  - GameControllerProvider: session lifecycle and result reporting.
  - NotificationProvider: in-app toast/navigation notifications.
- Types/Contracts (src_ts/types): shared strict types for settings, language, game store.

### Data Flow

Unidirectional UI → Contexts → Bridge → Persistence, with pub-sub for settings updates:

- UI events call context methods (e.g., set language, start/end game).
- SettingsProvider uses settingsAPI.subscribe to react to external changes and update consumers.
- GameController triggers addGameRecord/unlockAchievementCheck on win; GameStore updates user state and (planned) pushes notifications.
- LanguageProvider reads JSON translation bundles and exposes t(key) with types.

### File Structure

```bash
react-refactor/
├── electron_ts/
│   ├── main.js
│   └── preload.js
├── src_ts/
│   ├── App.tsx
│   ├── main.ts
│   ├── assets/
│   ├── components/
│   ├── contexts/
│   ├── languages/
│   ├── layouts/
│   ├── modules/
│   ├── pages/
│   └── types/
├── jest.config.js
├── jest.setup.js
├── tsconfig.json
├── vite.config.js
└── styles/ (SCSS)
```

## Refactoring Process

### Migration Strategy

- Full rewrite of the project, building an architecture and all business logic
- Parallel development branches -> Vanila [currently main] + React branch
- On this step we don't need any feature freezes in case this is a project rebuilding with already build-in new features

### Breaking Changes

List of known breaking changes:
- Language API is now typed and routed via LanguageProvider
- Folder structure reorganized (electron_ts + src_ts, domain modules)
- Settings and user data access only via preload bridge (no direct fs from UI)
- Game session flow centralized in GameController
- Legacy local storage replaced with JSON files in AppData

### Backward Compatibility

- Data migration inbetween versions 
- Versioned APIs

Notes:
- Preload bootstraps defaults (ensures currentUser, creates default 'user').
- Migrators can be added to read and transform previous storage formats into the new settings.json/gamestorage.json schemas.

## Key Decisions

| Decision                         | Alternatives Considered     | Reason for Choice                    |
|----------------------------------|-----------------------------|--------------------------------------|
| Adopted Vite                     | Webpack, Parcel             | Faster development builds            |
| Migrated to TypeScript           | Continue with JavaScript    | Improved type safety, better tooling |
| Modularized components by domain | Flat structure              | Scalability and isolation            |

## Tooling & Infrastructure

Tools adopted or updated as part of the refactor:

- Vite dev/build with React + TS
- Jest + React Testing Library
- Path alias: @/ → src_ts
- Electron dev: http://localhost:5173, prod: dist/index.html
- Tailwind CSS (planned) via PostCSS + Autoprefixer
- **CI/CD**: GitHub Actions (planned)
- **Documentation**: Markdown

## Testing & Quality Assurance

Outline of testing approach and tools:

- Unit/Component: Jest + RTL + jsdom
- Reducer tests for contexts (GameStore, GameController, Notification)
- Bridge facades are thin; prefer integration tests with simple stubs/mocks of window.* APIs

## Known Issues & Limitations

- [ ] Sandbox disabled in Electron (memory/surface trade-off); revisit and move fs to dedicated IPC layer if needed
- [ ] Simple JSON persistence can be fragile under concurrency; consider write queueing or a tiny DB
- [ ] Translation lazy import path should be aligned with languages folder structure
- [ ] Build size and asset optimization pending
- [ ] Notification UX/toasts not finalized

## Future Improvements

- Achievement toast container and richer notification pipeline
- Optional storage upgrade (schema versioning, migrations, potential DB)
- E2E smoke tests with Playwright
- Re-enable Electron sandbox if performance permits; reduce preload surface

## Appendix

### Note on Tailwind CSS

Although Tailwind CSS was initially considered and planned for this project, the idea was abandoned during development. The main reason: rewriting the already completed migration from CSS to SCSS once again seemed unreasonable and, in practice, would not be a skill-building exercise but a waste of time, especially considering that the React part of the project was already being rewritten for the second time.

