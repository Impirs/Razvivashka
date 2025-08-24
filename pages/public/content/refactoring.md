# Project Documentation

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

- **React 19.1.0 + TypeScript** — componentized UI with type safety and maintainability
- **Electron 35.1.5** — desktop packaging, native shell integrations
- **Vite 6.3.5** — fast dev server and optimized builds with SVG support via vite-plugin-svgr
- **SCSS + CSS Modules** — main styling solution after migration from CSS; Tailwind CSS was considered but not adopted (see note above)
- **React Router DOM 7.5.1** — HashRouter for Electron navigation compatibility
- **Jest + React Testing Library** — unit/integration tests for the React app
- **Electron Builder** — automated builds with GitHub releases integration
- **Electron Log + Electron Updater** — logging and auto-update capabilities

## New Architecture

### Bridge Layer architecture overview

``` bash
               < Bridge Layer >
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
                  React (UI)
┌─────────────────────────────────────────────┐
│                                             │
│  LanguageProvider.t(key)                    │
│  SettingsProvider.useSetting('language')    │ → calls settingsAPI
│  GameStoreDataProvider.currentUser          │ → calls gameStoreAPI  
│  GameStoreActionsProvider.login/records     │ → coordinates data + actions
│  GameControllerProvider.start/endGame       │ → coordinates records + unlocks
│  useSelectiveContext hooks for performance  │ → granular data access
│                                             │
│  UI rerenders when contexts update          │
└─────────────────────────────────────────────┘

```

### Business Logic Layer architecture overview

```bash
                    <Routes> 
┌───────────────────────────────────────────────┐
│  SettingsProvider                             │
│  LanguageProvider                             │
│    ├─ LanguageContext (state)                 │
│    └─ TranslationsContext (data)              │
│  GameStoreDataProvider                        │
│  GameStoreActionsProvider                     │
│    └─ GameControllerProvider                  │  ← (idle, playing, win, lose)
│        └─ GameLayout (by gameId)              │
│            ├─ Menu (collect settings)         │ → startGame + setGameContext
│            └─ Game (play round)               │ → endGame(status, score)
│                                               │
│  On win: GameController → addGameRecord →     │
│          unlockAchievementCheck → (notify)    │
│                                               │
│  useSelectiveContext hooks prevent rerenders  │
│  Achievement/Notification UI renders higher   │
└───────────────────────────────────────────────┘

```

### Core Modules

List and describe main architectural modules or layers:
- **Electron Main** (electron/main.js)
  - Creates BrowserWindow, routes dev/prod loads, IPC for quit/openExternal.
  - Security posture: contextIsolation=true, nodeIntegration=false, sandbox=false (review pending).
  - Auto-updater integration with GitHub releases.
- **Preload Bridge** (electron/preload.js)
  - settingsAPI: get/getAll/set/subscribe with deep merging for backwards compatibility (JSON persistence to settings.json).
  - gameStoreAPI: user CRUD + load/save user data (gamestorage.json).
  - electronAPI: quitApp/openExternal utilities and update notifications.
  - Automatic directory creation and fallback handling for missing data files.
- **UI Layer** (src_ts/pages, components, layouts)
  - Pages: Home, Catalog, Settings, Achievements with HashRouter navigation.
  - Layout: GameLayout with side panels/main for game integration.
  - Reusable component system: button, select, slider, icon, badge, checkbox, gamesetting, scorelist.
  - Modules: game_digital, game_shulte, game_queens provide self-contained game logic and UI.
- **State/Context Layer** (src_ts/contexts)
  - SettingsProvider: bridge integration with reactive subscriptions and type-safe settings management.
  - LanguageProvider: split into LanguageContext (state) and TranslationsContext (data) for performance optimization.
  - GameStoreDataProvider: user data, achievements, and records with reducer-based state management.
  - GameStoreActionsProvider: user management and game actions separated from data for performance.
  - GameControllerProvider: centralized game session lifecycle with audio feedback and score coordination.
  - NotificationProvider: queue-based notification system with routing integration and update handling.
  - Selective Context Hooks: granular access hooks in `useSelectiveContext.ts` to prevent unnecessary re-renders.
- **Types/Contracts** (src_ts/types, types/global.d.ts): shared strict types for settings, language, game store, and global window APIs.
- **Build & Development**
  - Vite configuration with path aliases (@/ → src_ts, @shared → ../shared).
  - CSS Modules with local scoping for component isolation.
  - Jest configuration with TypeScript support and module mocking for Vite-specific features.

### Data Flow

Unidirectional UI → Contexts → Bridge → Persistence, with performance-optimized subscriptions:

- UI events call context methods via selective hooks (e.g., `useCurrentUser()`, `useGameActions()`).
- SettingsProvider uses settingsAPI.subscribe to react to external changes and update consumers.
- GameController triggers addGameRecord/unlockAchievementCheck on win; GameStoreActions updates user state via reducer and pushes notifications.
- LanguageProvider manages dynamic translation loading through split contexts (LanguageContext + TranslationsContext).
- Auto-update notifications flow through electronAPI → useUpdateHandler → NotificationProvider.
- Game modules maintain isolated logic with pure functions and use selective context hooks to prevent unnecessary re-renders.
- Selective context hooks (`useSelectiveContext.ts`) provide granular access to prevent components from re-rendering on unrelated context changes.

### File Structure

```bash
react-refactor/
├── electron/                       # Electron main process
│   ├── main.js                     # BrowserWindow creation, IPC handlers
│   ├── preload.js                  # Context bridge APIs
│   └── README.md  
├── src_ts/                         # React TypeScript application
│   ├── App.tsx                     # Router and provider setup
│   ├── main.ts                     # React entry point
│   ├── assets/                     # Icons, sounds, images, fonts
│   ├── components/                 # Reusable UI components
│   ├── contexts/                   # React context providers
│   │   ├── gameStoreData.tsx       # Game data state management
│   │   ├── gameStoreActions.tsx    # Game actions and user management
│   │   ├── i18n.tsx                # Split language contexts
│   │   ├── pref.tsx                # Settings bridge integration
│   │   ├── gameController.tsx      # Game session lifecycle
│   │   └── notifProvider.tsx       # Notification queue system
│   ├── hooks/                      # Custom hooks
│   │   ├── useSelectiveContext.ts  # Performance-optimized context hooks
│   │   ├── useGameTimer.ts         # Game timing utilities
│   │   └── useUpdateHandler.ts     # Update notification handling
│   ├── data/                       # Static data files
│   ├── languages/                  # Translation files
│   ├── layouts/                    # Page layouts
│   ├── modules/                    # Self-contained game modules
│   │   ├── game_digit/             # Number composition game
│   │   ├── game_shulte/            # Schulte table game
│   │   └── game_queens/            # N-Queens puzzle game
│   ├── pages/                      # Route components
│   │   ├── home/
│   │   ├── catalog/
│   │   ├── settings/
│   │   └── achievements/
│   ├── styles/                     # SCSS stylesheets
│   │   └── components/             # Component-specific styles
│   ├── types/                      # TypeScript type definitions
│   └── utils/                      # Utility functions
├── types/                          # Global type declarations
│   └── global.d.ts                 # Window API interfaces
├── jest.config.js                  # Jest testing configuration
├── jest.setup.js                   # Test environment setup
├── tsconfig.json                   # TypeScript configuration
├── vite.config.js                  # Vite build configuration
└── package.json                    # Dependencies and scripts
```

## Refactoring Process

### Migration Strategy

- Full rewrite of the project, building an architecture and all business logic
- Parallel development branches -> Vanila [currently main] + React branch
- On this step we don't need any feature freezes in case this is a project rebuilding with already build-in new features

### Breaking Changes

List of known breaking changes:
- **API Changes**: Language API is now typed and routed via LanguageProvider with strict type checking
- **Folder Structure**: Reorganized from flat structure to domain-driven (electron/, src_ts/, modules by game type)
- **Data Access**: Settings and user data access only via preload bridge (no direct fs from UI)
- **Game Sessions**: Game session flow centralized in GameController with status machine (idle/playing/win/lose)
- **Storage Format**: Legacy localStorage replaced with JSON files in AppData with automatic migration
- **Component System**: Migrated to reusable component library with SCSS modules
- **Build System**: Switched from basic Electron setup to Vite-powered development with hot reload
- **Routing**: Implemented HashRouter for Electron compatibility with parameterized routes

### Backward Compatibility

- Data migration inbetween versions 
- Versioned APIs

Notes:
- Preload bootstraps defaults (ensures currentUser, creates default 'user').
- Migrators can be added to read and transform previous storage formats into the new settings.json/gamestorage.json schemas.

## Context Architecture and State Management

The refactored application implements a sophisticated context architecture designed for optimal performance and maintainability. The context system has been split into specialized providers to minimize unnecessary re-renders and provide granular access to different aspects of the application state.

### Context Split Strategy

The original monolithic contexts have been split into separate data and action contexts, following the principle of separation of concerns:

#### 1. Data vs Actions Separation

**Problem Solved**: Components consuming entire contexts would re-render whenever any part of the context changed, even if they only needed specific pieces of data or actions.

**Solution**: Split contexts into:
- **Data contexts**: Provide read-only access to state
- **Action contexts**: Provide functions that modify state
- **Combined hooks**: Maintain backward compatibility

Example structure:
```typescript
// Before: Single context causing unnecessary re-renders
const GameStoreContext = { ...state, ...actions };

// After: Separated contexts for optimal performance
const GameStoreDataContext = { ...state, dispatch };
const GameStoreActionsContext = { ...actions };
```

#### 2. Language Context Optimization

The language system has been split into two specialized contexts:

**LanguageContext**: 
- Manages language state (`language`, `setLanguage`)
- Only re-renders when the active language changes

**TranslationsContext**: 
- Provides translation function (`t`) and loaded translations
- Only re-renders when translation data loads or changes

This separation prevents components from re-rendering when:
- Only language state changes (no need to reload translations)
- Only translation data changes (language preference unchanged)

#### 3. Selective Context Hooks

A new hook system provides granular access to context data:

**Location**: `src_ts/hooks/useSelectiveContext.ts`

**Purpose**: Prevent components from subscribing to entire contexts when they only need specific pieces of data.

**Examples**:
```typescript
// Instead of: const { currentUser, allAchievements, loading, actions } = useGameStore();
// Use specific hooks:
const currentUser = useCurrentUser();           // Only re-renders on user changes
const loading = useGameStoreLoading();          // Only re-renders on loading state
const { addGameRecord } = useGameActions();     // Only actions, no data subscription
```

### Context Provider Hierarchy

The application uses a carefully orchestrated provider hierarchy in `App.tsx`:

```typescript
<SettingsProvider>                          // Foundation: Settings and bridge integration
  <LanguageProvider>                        // Language state and translation loading
	<Router>                                // Route definitions and navigation

	<GameStoreDataProvider>                 // Game data: users, achievements, records
	  <GameStoreActionsProvider>            // Game actions: login, records, achievements
	    <NotificationProvider>              // Global notification system
	      <Routes>
               <GameControllerProvider>     // Game session lifecycle (when in game context)
                 {/* Game-specific UI */}
               </GameControllerProvider>
             </Routes>
	      <NotificationDisplay />
	    </NotificationProvider>
	  </GameStoreActionsProvider>
	</GameStoreDataProvider>

	</Router>
  </LanguageProvider>
</SettingsProvider>
```

### Key Context Implementations

#### 1. SettingsProvider

**Purpose**: Bridge integration with reactive settings management

**Key Features**:
- **Type-safe bridge integration**: Full TypeScript integration with `window.settingsAPI`
- **Reactive subscriptions**: Automatic UI updates when settings change externally
- **Custom hook**: `useSetting(key)` provides `[value, setter]` tuple similar to `useState`
- **Cross-window sync**: Settings changes in one window update all other windows

**Architecture Decisions**:
- **Bridge-first approach**: All settings flow through the preload bridge for security and persistence
- **Subscription pattern**: Uses `settingsAPI.subscribe()` for reactive updates
- **Memory efficiency**: Uses refs to store settings data and prevent unnecessary re-renders

#### 2. Language System

**Purpose**: Dynamic translation loading with performance optimization

**Key Features**:
- **Split contexts**: Separate language state from translation data
- **Lazy loading**: Translation files loaded on-demand via dynamic imports
- **Type safety**: Fully typed translation keys with TypeScript
- **Fallback support**: Graceful degradation when translations fail to load

**Architecture Decisions**:
- **Settings integration**: Language preference persisted via SettingsProvider
- **Dynamic imports**: `import('../languages/${lang}.json')` for bundle optimization
- **Performance split**: Separate contexts prevent unnecessary re-renders
- **Memoization**: Translation function memoized to prevent callback recreation

#### 3. Game Store System

**Purpose**: User management and game data with high-performance architecture

**Split Architecture**:

**GameStoreDataProvider**:
- **State management**: User data, achievements, game records
- **Reducer pattern**: Predictable state updates with `gameStoreDataReducer`
- **Data normalization**: Ensures all user data has required properties
- **Loading states**: Provides loading indicators for async operations

**GameStoreActionsProvider**:
- **Action creators**: Login, logout, user management, record creation
- **Achievement processing**: Automated achievement unlock checking
- **Notification integration**: Triggers notifications for achievements
- **Bridge integration**: All persistence flows through `gameStoreAPI`

**Architecture Decisions**:
- **Separation of concerns**: Data and actions in separate contexts for performance
- **Memoized actions**: All action creators wrapped in `useCallback` for stable references
- **Reducer pattern**: Complex state changes handled through reducers for predictability
- **Combined hook**: `useGameStore()` provides backward compatibility

#### 4. Game Controller

**Purpose**: Centralized game session lifecycle management

**Key Features**:
- **State machine**: `idle` → `playing` → `win`/`lose` status progression
- **Audio integration**: Automatic win/lose sound effects with volume control
- **Score coordination**: Centralized score management and recording
- **Game context**: Tracks game type, settings, and session metadata

**Architecture Decisions**:
- **Reducer pattern**: Game state changes handled through `gameControllerReducer`
- **Selective hooks**: Game controller split into selective hooks via `useSelectiveContext`
- **Action integration**: Automatically calls `addGameRecord` and `unlockAchievementCheck`
- **Audio management**: Uses volume settings from SettingsProvider

#### 5. Notification System

**Purpose**: Queue-based notification system with routing integration

**Key Features**:
- **Queue management**: Sequential notification display with timing control
- **Type-specific behavior**: Different notification types with custom settings
- **Routing integration**: Navigation notifications for deep-linking
- **Update handling**: Special handling for app update notifications

**Architecture Decisions**:
- **Queue pattern**: Prevents notification overlap and ensures sequential display
- **Router integration**: Uses `useNavigate` for in-app navigation notifications
- **Reducer pattern**: Notification state managed through `notificationReducer`
- **Type system**: Strongly typed notification types for consistency

### Performance Optimizations

#### 1. Selective Context Consumption

**Problem**: Components re-rendering on unrelated context changes
**Solution**: Granular hooks that subscribe only to needed data

```typescript
// Before: Full context subscription
const { currentUser, allAchievements, loading, ...actions } = useGameStore();

// After: Selective subscriptions
const currentUser = useCurrentUser();         // Only user changes
const { addGameRecord } = useGameActions();   // Only action references
```

#### 2. Context Splitting

**Problem**: Large contexts causing widespread re-renders
**Solution**: Split by responsibility and change frequency

**Examples**:
- Language state vs translation data
- Game store data vs actions
- Settings data vs bridge operations

#### 3. Memoization Strategy

**Key patterns**:
- **Action creators**: All wrapped in `useCallback` with proper dependencies
- **Context values**: Complex context values memoized with `useMemo`
- **Component optimization**: Game components use `React.memo` where appropriate

### Migration Benefits

#### 1. Performance Improvements

- **Reduced re-renders**: Components only update when relevant data changes
- **Faster rendering**: Selective hooks prevent unnecessary context consumption
- **Better memory usage**: Proper cleanup and memoization strategies

#### 2. Developer Experience

- **Type safety**: Full TypeScript integration across all contexts
- **Debugging**: Easier to track state changes with separated concerns
- **Testing**: Contexts can be tested independently with selective mocks

#### 3. Maintainability

- **Clear boundaries**: Each context has a single responsibility
- **Backward compatibility**: Combined hooks maintain existing API
- **Extensibility**: New contexts can be added without affecting existing ones

### Context Testing Strategy

**Mock System**: `src_ts/hooks/__mocks__/useSelectiveContext.ts`

**Approach**:
- **Selective mocking**: Each hook mocked independently
- **Realistic data**: Mock implementations return realistic test data
- **Jest integration**: Proper Jest mock functions for action testing
- **Isolation**: Tests can mock only the hooks they need

This context architecture represents a significant evolution from simple React contexts to a sophisticated, performance-optimized state management system that scales with application complexity while maintaining developer productivity.

| Decision                          | Alternatives Considered         | Reason for Choice                                                    |
|-----------------------------------|---------------------------------|----------------------------------------------------------------------|
| Adopted Vite                      | Webpack, Parcel                 | Faster development builds, better DX                                 |
| Migrated to TypeScript            | Continue with JavaScript        | Improved type safety, better tooling                                 |
| Modularized components by domain  | Flat structure                  | Scalability and isolation                                            |
| React Context over Redux          | Redux Toolkit, Zustand          | Simpler setup, adequate for app size; split contexts for performance |
| SCSS Modules over Tailwind        | Tailwind CSS, Styled Components | Existing CSS migration, component isolation                          |
| HashRouter over BrowserRouter     | Browser Router, Memory Router   | Electron file:// protocol compatibility                              |
| JSON files over Database          | SQLite, IndexedDB               | Simplicity, easy backup/restore                                      |
| Reducer pattern for complex state | useState hooks                  | Predictable state updates, easier testing                            |
| Context splitting strategy        | Monolithic contexts             | Performance optimization, granular subscriptions                     |
| Selective context hooks           | Full context consumption        | Prevent unnecessary re-renders, better performance                   |

## Advanced Implementation Details

### Component System Architecture

The refactored app implements a comprehensive component library with consistent APIs:

```typescript
// Example: Button component with icon integration
type ButtonProps = {
    children?: ReactNode;
    size?: 'large' | 'small';
    leftIcon?: string;
    iconOnly?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

// Usage: <Button leftIcon="play" size="large">Start Game</Button>
```

### State Management Patterns

- **Settings**: Reactive subscription pattern with bridge sync and type-safe `useSetting()` hook
- **Game Store**: Split into data and actions contexts with reducer pattern for immutable updates
- **Game Controller**: State machine with audio feedback integration and selective context hooks
- **Notifications**: Queue-based system with automatic cleanup and routing integration
- **Language**: Split contexts for performance (LanguageContext + TranslationsContext)
- **Selective Hooks**: Performance-optimized hooks in `useSelectiveContext.ts` for granular data access

### Game Module Architecture

Each game is implemented as a self-contained module with:
- Pure logic functions (e.g., `generateBoard`, `getDistribution`, `computeConflicts`)
- React components for UI (`DigitGame.tsx`, `DigitMenu.tsx`, `QueensGame.tsx`, `QueensMenu.tsx`)
- TypeScript types for complete type safety
- Isolated test suites
- Performance optimizations with React.memo and selective context hooks

```typescript
// Example: Digital game board generation
export function generateBoard(target: number, size: number): DigitBoard {
    const numbers = getDistribution(target, size);
    // Pure function implementation...
}

// Example: Queens game conflict computation
export function computeConflicts(board: QueensBoard): ConflictData {
    // Pure function for conflict detection...
}
```

**Current Game Modules**:
- **game_digit**: Number composition game with arithmetic challenges
- **game_shulte**: Schulte table attention training game  
- **game_queens**: N-Queens puzzle game with conflict visualization

### Bridge API Design

The preload bridge implements a clean, typed API surface:

```typescript
interface SettingsAPI {
    get<K extends keyof AppSettings>(key: K): AppSettings[K];
    set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void;
    subscribe(callback: (key: keyof AppSettings, value: any) => void): () => void;
}
```

Key features:
- **Type Safety**: Full TypeScript integration with generic constraints
- **Reactive Updates**: Subscription pattern for cross-window synchronization
- **Error Handling**: Graceful fallbacks and automatic file creation
- **Migration Support**: Deep merging for backwards compatibility

## Performance and Optimization

### Build Configuration

The project uses optimized Vite configuration for both development and production:

- **Development**: Hot module replacement with React Fast Refresh
- **Production**: Tree shaking, code splitting, and asset optimization
- **Electron Integration**: Seamless dev server integration with `wait-on` coordination

### Memory Management

- **Context Optimization**: Minimal re-renders through careful dependency arrays
- **Asset Loading**: On-demand loading of game assets and sounds
- **State Cleanup**: Proper cleanup of subscriptions and event listeners

### Bundle Analysis

Current bundle includes:
- React 19.1.0 with modern JSX transform
- TypeScript compilation target: ES2020
- SCSS processing with CSS Modules
- SVG optimization through vite-plugin-svgr

## Development Workflow

### Development Commands

```bash
npm run react:dev        # Start Vite dev server + Electron
npm run react:build      # Build React app + Electron distribution
npm run react:test       # Run Jest test suite
npm start                # Start Electron with built app
```

### Hot Reload Integration

The development setup provides:
- **React HMR**: Instant component updates without state loss
- **Electron Restart**: Automatic main process restart on changes
- **Bridge Updates**: Live reload of preload scripts during development

### Testing Strategy

- **Unit Tests**: Individual component and utility function testing
- **Integration Tests**: Context provider behavior and data flow
- **Mock Strategy**: Window API mocking for Electron-specific features
- **Type Testing**: Compile-time verification of TypeScript contracts

## Developer Guide

This section provides a comprehensive guide for developers who want to add new games to the project. The modular architecture makes adding new games straightforward by following established patterns.

### 1. Game Module Structure

Each game should be implemented as a self-contained module in `src_ts/modules/game_[name]/`:

``` bash
src_ts/modules/game_myGame/
├── MyGameGame.tsx           # Main game component
├── MyGameMenu.tsx           # Settings/menu component
├── myGameLogic.ts           # Pure game logic functions
├── types/
│   └── game_myGame.ts       # TypeScript interfaces
└── __tests__/               # Optional test files
    ├── MyGameGame.test.tsx
    └── myGameLogic.test.ts
```

### 2. Required Components

#### Game Logic
(`myGameLogic.ts`)

Pure functions for game mechanics, separate from React components:

```typescript
// Example structure
export interface MyGameBoard {
    // Define your game board structure
}

export function generateBoard(settings: MyGameSettings): MyGameBoard {
    // Pure board generation logic
}

export function isGameWon(board: MyGameBoard): boolean {
    // Win condition check
}

export function makeMove(board: MyGameBoard, move: any): MyGameBoard {
    // Game state updates
}
```

#### Type Definitions
(`types/game_myGame.ts`)

Define all game-specific interfaces:

```typescript
export interface MyGameSettings {
    difficulty: number;
    size: number;
    // Other game-specific settings
}

export interface MyGameState {
    board: MyGameBoard;
    score: number;
    moves: number;
}
```

#### Menu Component
(`MyGameMenu.tsx`)

Settings interface for the game:

```typescript
import React, { useState, useEffect } from 'react';
import { useTranslationFunction } from '@/hooks/useSelectiveContext';
import GameSetting from '@/components/gamesetting/gamesetting';
import Button from '@/components/button/button';

interface MyGameMenuProps {
    onStart: (settings: MyGameSettings) => void;
    initialSettings?: MyGameSettings;
    onChangeSettings?: (settings: MyGameSettings) => void;
}

function MyGameMenu({ onStart, initialSettings, onChangeSettings }: MyGameMenuProps) {
    const [difficulty, setDifficulty] = useState(initialSettings?.difficulty || 1);
    const t = useTranslationFunction(); // Use selective hook for better performance

    // Notify parent of settings changes for ScoreList updates
    useEffect(() => {
        if (onChangeSettings) onChangeSettings({ difficulty, size });
    }, [difficulty, onChangeSettings]);

    return (
        <div className="game-menu">
            <GameSetting
                label={t('games.difficulty')}
                type="select"
                options={[
                    { value: 1, label: t('games.easy') },
                    { value: 2, label: t('games.medium') },
                    { value: 3, label: t('games.hard') }
                ]}
                value={difficulty}
                onChange={setDifficulty}
            />
            <Button onClick={() => onStart({ difficulty })}>
                {t('games.start')}
            </Button>
        </div>
    );
}

export default MyGameMenu;
```

#### Main Game Component
(`MyGameGame.tsx`)

The core game interface with controller integration:

```typescript
import { useEffect, useRef, useState } from 'react';
import { useGameControllerActions, useGameSession } from '@/hooks/useSelectiveContext';
import { useSettings } from '@/contexts/pref';
import { useTranslationFunction } from '@/hooks/useSelectiveContext';
import { generateRecordProps } from '@/utils/pt';
import { formatTime } from '@/utils/ft';

interface MyGameGameProps {
    settings: MyGameSettings;
}

function MyGameGame({ settings }: MyGameGameProps) {
    // Essential hooks for game integration - using selective hooks for performance
    const { 
        startGame, 
        endGame, 
        updateScore, 
        setGameContext, 
        setModifications 
    } = useGameControllerActions();
    const { status, startedAt, gameId } = useGameSession();
    const t = useTranslationFunction();

    // Game state
    const [board, setBoard] = useState<MyGameBoard | null>(null);
    const [moves, setMoves] = useState(0);

    // Initialize game when started
    useEffect(() => {
        if (status === 'playing' && startedAt) {
            const newBoard = generateBoard(settings);
            setBoard(newBoard);
            setMoves(0);
            
            // Set game context for recording
            const props = generateRecordProps(settings);
            setGameContext('myGame', props, /* isPerfect */ moves === 0);
        }
    }, [status, startedAt, settings, setGameContext]);

    // Check win condition
    useEffect(() => {
        if (board && isGameWon(board)) {
            const finalScore = calculateScore(moves, /* other factors */);
            updateScore(finalScore);
            endGame('win', finalScore);
        }
    }, [board, moves, updateScore, endGame]);

    const handleMove = (move: any) => {
        if (status !== 'playing' || !board) return;
        
        const newBoard = makeMove(board, move);
        setBoard(newBoard);
        setMoves(prev => prev + 1);
    };

    return (
        <div className="game-main">
            {/* Your game UI here */}
        </div>
    );
}

export default MyGameGame;
```

### 3. Integration Steps

#### Step 1: Add to GameLayout
Update `src_ts/layouts/GameLayout.tsx`:

```typescript
// Import your components
import MyGameGame from '@/modules/game_myGame/MyGameGame';
import MyGameMenu from '@/modules/game_myGame/MyGameMenu';
import type { MyGameSettings } from '@/modules/game_myGame/types/game_myGame';

// Add state for your game
const [pendingMyGame, setPendingMyGame] = useState<MyGameSettings>({ difficulty: 1 });
const [activeMyGame, setActiveMyGame] = useState<MyGameSettings>({ difficulty: 1 });

// Add settings change handler
const handleMyGameSettingsChange = useCallback((s: MyGameSettings) => {
    setPendingMyGame(prev => (prev.difficulty === s.difficulty ? prev : s));
}, []);

// Add start handler
const startMyGame = useCallback(() => {
    setActiveMyGame(pendingMyGame);
    const props = generateRecordProps(pendingMyGame);
    setGameContext('myGame', props);
    startGame();
}, [pendingMyGame, setGameContext, startGame]);

// Add to the game switching logic
const renderMenu = () => {
    switch (gameId) {
        case 'myGame':
            return (
                <MyGameMenu
                    onStart={startMyGame}
                    initialSettings={pendingMyGame}
                    onChangeSettings={handleMyGameSettingsChange}
                />
            );
        // ... other cases
    }
};

const renderGame = () => {
    switch (gameId) {
        case 'myGame':
            return <MyGameGame settings={activeMyGame} />;
        // ... other cases
    }
};
```

#### Step 2: Add Settings Support
Update `src_ts/types/settings.ts`:

```typescript
export interface AppSettings {
    // ... existing settings
    games: {
        // ... existing games
        myGame: {
            view_modification: boolean;
            // Add other game-specific settings
        }
    }
}
```

Update preload.js default settings:

```javascript
const defaultSettings = {
    // ... existing settings
    games: {
        // ... existing games
        myGame: { view_modification: true },
    },
};
```

#### Step 3: Add Achievements
Update `src_ts/data/achievements.json`:

```json
[
    // ... existing achievements
    {
        "gameId": "myGame",
        "gameProps": "difficulty_1",
        "requirements": [100, 150, 200]
    },
    {
        "gameId": "myGame",
        "gameProps": "difficulty_2", 
        "requirements": [80, 120, 160]
    }
]
```

#### Step 4: Add Translations
Update language files in `src_ts/languages/`:

```json
{
    "games": {
        "myGame": {
            "name": "My Game",
            "description": "Game description",
            "start": "Start Game",
            "difficulty": "Difficulty"
        }
    }
}
```

#### Step 5: Add Routing
Ensure your game is accessible via `/catalog/myGame` by adding it to the catalog page.

### 4. Best Practices

#### Performance
- Keep game logic pure and separate from React components
- Use `useCallback` for event handlers to prevent unnecessary re-renders
- Implement proper cleanup in `useEffect` hooks
- **Use selective context hooks** from `useSelectiveContext.ts` instead of full context consumption
- **Memoize expensive computations** with `useMemo` and `React.memo` for components
- **Minimize context dependencies** by using only the specific hooks you need

#### Type Safety
- Define comprehensive TypeScript interfaces
- Use generic constraints for type safety
- Export all types for potential reuse

#### Testing
- Write unit tests for pure logic functions
- Test React components with React Testing Library
- Mock context providers for isolated component testing

#### Accessibility
- Add proper ARIA labels for interactive elements
- Ensure keyboard navigation support
- Provide clear visual feedback for game states

### 5. Common Patterns

#### Score Calculation
Use the existing utility for generating record properties:

```typescript
import { generateRecordProps } from '@/utils/pt';

const props = generateRecordProps(settings);
setGameContext('myGame', props, isPerfect);
```

#### Audio Integration
Game controller automatically handles win/lose sounds, but you can add custom sounds:

```typescript
import { useSettings } from '@/contexts/pref';

const { useSetting } = useSettings();
const [volume] = useSetting('volume');

const playSound = (audioFile: string) => {
    const audio = new Audio(audioFile);
    audio.volume = volume.effects;
    audio.play();
};
```

#### Context Usage Optimization
Use selective hooks for better performance:

```typescript
// Instead of: const { currentUser, allAchievements, ...actions } = useGameStore();
// Use selective hooks:
import { 
    useCurrentUser, 
    useGameActions, 
    useTranslationFunction 
} from '@/hooks/useSelectiveContext';

const currentUser = useCurrentUser();           // Only re-renders on user changes
const { addGameRecord } = useGameActions();     // Only actions, no data subscription
const t = useTranslationFunction();             // Only translation function
```

#### Error Handling
Follow the established pattern for graceful error handling:

```typescript
try {
    // Game logic
} catch (error) {
    console.error('Game error:', error);
    endGame('lose', 0);
}
```

This modular approach ensures that new games integrate seamlessly with the existing architecture while maintaining code quality and user experience consistency.

## Tooling and Infrastructure

Tools adopted or updated as part of the refactor:

- **Vite 6.3.5** dev/build with React + TS and SVG component support
- **Jest + React Testing Library** with TypeScript integration and jsdom environment
- **Path aliases**: @/ → src_ts, @shared → ../shared for clean imports
- **Electron integration**: dev server on http://localhost:5173, prod builds to dist/index.html
- **SCSS + CSS Modules** with local scoping for component isolation
- **Concurrently** for parallel dev server and Electron process management
- **Electron Builder** with GitHub releases integration and NSIS installer
- **TypeScript 5.8.3** with strict type checking and JSX support
- **Auto-updater**: electron-updater with GitHub releases backend
- **Logging**: electron-log for debugging and error tracking

## Testing and Quality Assurance

Outline of testing approach and tools:

- **Unit/Component Testing**: Jest + React Testing Library + jsdom environment
- **TypeScript Integration**: ts-jest transformer with full type checking
- **Module Mocking**: Custom mocks for Vite-specific features (import.meta.glob) and icon mappings
- **Test Organization**: Tests co-located with components using *.test.* and *.spec.* patterns
- **Context Testing**: Reducer tests for contexts (GameStore, GameController, Notification) with action verification
- **Bridge Integration**: Integration tests with simple stubs/mocks of window.* APIs to avoid filesystem dependencies
- **Audio Testing**: Mock implementations for sound effects in game controller tests
- **Path Alias Support**: Jest moduleNameMapper configured for @/ imports

## Known Issues and Limitations

- [ ] **Security**: Sandbox disabled in Electron (memory/surface trade-off); revisit and move fs to dedicated IPC layer if needed
- [ ] **Concurrency**: Simple JSON persistence can be fragile under concurrency; consider write queueing or a tiny DB
- [x] **Translation Import**: Translation lazy import path aligned with languages folder structure
- [ ] **Performance**: Build size and asset optimization pending; large asset bundles not yet optimized
- [x] **Notifications**: Notification UX/toasts implemented with update integration
- [x] **Context Performance**: Context splitting and selective hooks implemented for optimal performance
- [x] **Migration**: Achievement threshold reduction function needed for legacy user data updates
- [ ] **Feature Flags**: Temporary feature disable controller needed for gradual rollouts across patches
- [ ] **Testing Coverage**: E2E tests and comprehensive component test coverage pending
- [x] **Documentation**: API documentation and component storybook missing
- [x] **Context Architecture**: Split contexts implemented for data/actions separation and performance optimization
- [x] **Game Timer Hook**: Centralized timer logic could be extracted to a shared hook for consistency across games

## Future Improvements

- **Enhanced Notifications**: Achievement toast container and richer notification pipeline with animations
- **Storage Upgrade**: Optional storage upgrade (schema versioning, migrations, potential SQLite integration)
- **Testing Coverage**: E2E smoke tests with Playwright for critical user journeys
- **Security Hardening**: Re-enable Electron sandbox if performance permits; reduce preload surface area
- **Performance Optimization**: Lazy loading for game modules, asset optimization, and bundle splitting
- **Developer Experience**: Component storybook, API documentation, and development tooling improvements
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **CI/CD Pipeline**: GitHub Actions for automated testing, building, and releases
- **Feature Management**: Temporary feature toggle system for gradual rollouts
- **Context Optimization**: Further context splitting based on usage patterns and performance monitoring
- **Game Timer System**: Centralized timer hook for consistent timing across all games
- **Advanced Game Analytics**: Detailed performance metrics and user behavior tracking
- **Context Documentation**: Comprehensive documentation for the selective context hook system

