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

---

## Overview

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
- React Typescript
- Electron
- Vite
- svgr-plugin
- scss

## New Architecture

### Bridge Layer architecture overview

``` bash
       ┌─────────────────────────────┐
       │         ОС + Files          │
       │  ┌───────────────────────┐  │
       │  │ /locales/en.json      │◄─┤
       │  │ /locales/ru.json      │◄─┤
       │  │ /config/user.json     │◄─┤
       │  │ /config/settings.json │◄─┘
       └─────────────────────────────┘
                       ▲
                       │ (fs.readFileSync / fs.promises.writeFile)
                       ▼
       ┌─────────────────────────────┐
       │         Preload.js          │ ◄─ (using contextBridge)
       │                             │
       │  ┌────────────────────────────┐
       │  │ globalThis.translations    │ ← loading from settings.lang
       │  │ globalThis.settings        │ ← sync preload
       │  │ globalThis.user            │ ← sync preload
       │  └────────────────────────────┘
       │                             │
       │  window.api = {
       │    getTranslation(tag) → translations[tag],
       │    setLanguage(lang) → reloads translations & updates settings,
       │
       │    getSetting(key), setSetting(key, val), saveSettings(obj),
       │    getUser(), setUserKey(key, val), saveUser(obj),
       │  }
       └─────────────────────────────┘
                       ▲
                       │ contextBridge
                       ▼
┌─────────────────────────────────────────────┐
│                                             │
│                  React (UI)                 │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │           useTranslation()            │  │
│  │                  ↓                    │  │
│  │   window.api.getTranslation('tag')    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │         useSettingsContext()          │  │
│  │                  ↓                    │  │
│  │  getSetting / setSetting / changeLang │◄────────┐
│  └───────────────────────────────────────┘  │      │
│                                             │      │
│  ┌───────────────────────────────────────┐  │      │
│  │           useUserContext()            │  │      │
│  │                  ↓                    │  │      │
│  │   getUser / updateUser / setUsername  │  │      │
│  └───────────────────────────────────────┘  │      │
│                                             │      │
│                UI rerenders                 │      │
│            when contexts update             │      │
└─────────────────────────────────────────────┘      │
             ▲                                       │
             │     context triggers state update     │
             └───────────────────────────────────────┘

```

### Business Logic Layer architecture overview

```bash
┌───────────────────────────────────────────────┐
│                 <Routes>                      │
│                                               │
│  ┌───────────────────────────────────────┐    │
│  │           RecordsProvider             │◄─┐ │  ← contains and controls records
│  │                                       │  │ │         and achievements 
│  │  ┌───────────────────────────────┐    │  │ │
│  │  │       GameStateProvider       │◄─┐ │  │ │  ←  (idle, playing, win, lose)
│  │  │                               │  │ │  │ │
│  │  │  ┌─────────────────────────┐  │  │ │  │ │
│  │  │  │    GameLayoutWrapper    │  │  │ │  │ │
│  │  │  │   (defines layout by)   │  │  │ │  │ │
│  │  │  │         gameId          │  │  │ │  │ │
│  │  │  └────────────▲────────────┘  │  │ │  │ │
│  │  │               │               │  │ │  │ │
│  │  │  ┌────────────┴────────────┐  │  │ │  │ │
│  │  │  │       GameLayout        │  │  │ │  │ │
│  │  │  │  (Central or others)    │  │  │ │  │ │
│  │  │  │                         │──────────┘ │
│  │  │  │    ┌───────────────┐    │  │  │ │    │
│  │  │  │    │ GameLeftPanel │    │  │  │ │    │
│  │  │  │    └───────────────┘    │  │  │ │    │
│  │  │  │    ┌───────────────┐    │  │  │ │    │
│  │  │  │    │ GameMainPanel │──────────┘ │    │ ← calls: startGame / endGame →
│  │  │  │    └───────────────┘    │  │    │    │          → submitResult → notify
│  │  │  │    ┌───────────────┐    │  │    │    │
│  │  │  │    │ ScoreSection  │    │  │    │    │ ← shows scores and justAddedRecord
│  │  │  │    └───────────────┘    │  │    │    │
│  │  │  └─────────────────────────┘  │    │──┐ │ 
│  │  └───────────────────────────────┘    │  │ │
│  └───────────────────────────────────────┘  │ │
│                                             │ │
│    ┌──────────────────────────────────┐     │ │
│    │   <AchievementToastContainer/>   │◄────┘ │ ← render notification on higher level
│    └──────────────────────────────────┘       │
└───────────────────────────────────────────────┘

```

### Core Modules

List and describe main architectural modules or layers:
- UI Layer
- Business Logic Layer
- Data Layer
- API Services
- Utilities / Shared

### Data Flow

Describe the data flow (e.g., unidirectional, pub-sub, observer pattern).

### File Structure

```bash
src/
├── components/
├── contexts/
├── modules/
├── state/
├── utils/
├── assets/
└── main.ts
```

## Refactoring Process

### Migration Strategy

- Full rewrite of the project, building an architecture and all business logic
- Parallel development branches -> Vanila [currently main] + React branch
- On this step we don't need any feature freezes in case this is a project rebuilding with already build-in new features

### Breaking Changes

List of known breaking changes:
- Language API
- Changes in folder structure
- Scalability for components/modules
- Incompatible interface changes
- Local data Storage is removed

### Backward Compatibility

- Data migration inbetween versions 
- Versioned APIs

## Key Decisions

| Decision                         | Alternatives Considered     | Reason for Choice                    |
|----------------------------------|-----------------------------|--------------------------------------|
| Adopted Vite                     | Webpack, Parcel             | Faster development builds            |
| Migrated to TypeScript           | Continue with JavaScript    | Improved type safety, better tooling |
| Modularized components by domain | Flat structure              | Scalability and isolation            |

## Tooling & Infrastructure

Tools adopted or updated as part of the refactor:

- **CI/CD**: GitHub Actions, GitLab CI, CircleCI
- **Documentation**: Markdown

## Testing & Quality Assurance

Outline of testing approach and tools:

- **Unit Testing**: Vitest *currently at work*

## Known Issues & Limitations

- [ ] the size of build

## Future Improvements


## Appendix

