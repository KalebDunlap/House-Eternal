# House Eternal - A Dynasty Simulator

## Overview
A browser-based medieval dynasty simulator inspired by Crusader Kings. The game focuses on family tree management, succession, and keeping a dynasty alive through generations. All game state is saved/loaded via localStorage - no backend database required.

## Recent Changes
- **January 2026**: Initial MVP development - core game types, portrait system, family tree, character sheets, event system, and game simulation

## Project Architecture

### Frontend Structure (client/src/)
- **lib/gameTypes.ts**: Core TypeScript types and constants (Character, Dynasty, Title, Holding, GameEvent, Cultures, Traits)
- **lib/gameContext.tsx**: React context providing game state management, simulation loop, and all game actions
- **components/**: UI components
  - Portrait.tsx - Procedural SVG portrait generator
  - MainMenu.tsx - New game/load game screen
  - GameHeader.tsx - Top bar with player info and speed controls
  - GameSidebar.tsx - Navigation sidebar
  - FamilyTree.tsx - Main family tree visualization
  - CharacterSheet.tsx - Detailed character view
  - Timeline.tsx - Event history log
  - SuccessionScreen.tsx - Heir management
  - HoldingsScreen.tsx - Titles and vassals
  - EventModal.tsx - In-game event popups
  - GameOverScreen.tsx - Dynasty extinction screen

### Design Tokens
- Medieval parchment theme with warm browns and golds
- Fonts: Merriweather (body), Playfair Display (headings), Roboto Mono (dates)
- Dark mode support with proper contrast

### Game Systems
1. **Time System**: 1 real second = 1 in-game week, with pause/1x/2x/4x speed controls
2. **Character System**: Full stats (5 skills), traits, health, fertility, portraits
3. **Family System**: Parents, spouses, children with proper inheritance
4. **Event System**: Random events with player choices affecting stats
5. **Save System**: localStorage with autosave every 2 in-game years

### Data Flow
1. GameProvider wraps entire app with game state
2. useGame() hook provides access to state and actions
3. Simulation runs in useEffect with requestAnimationFrame
4. Components read from context and dispatch actions

## User Preferences
- Medieval aesthetic with serif fonts
- Strategy game dashboard feel
- Deceased characters clearly marked with grayscale and skull icon

## Key Extension Points
- Add new cultures in gameTypes.ts CULTURES object
- Add new traits in gameTypes.ts TRAITS object
- Add new event types in gameContext.tsx event generation
- Extend Character interface for new attributes
