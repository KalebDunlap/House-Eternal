# House Eternal - A Dynasty Simulator

## Overview
A browser-based medieval dynasty simulator inspired by Crusader Kings. The game focuses on family tree management, succession, and keeping a dynasty alive through generations. All game state is saved/loaded via localStorage - no backend database required.

## Recent Changes
- **January 2026**: Added Court & Nobles system - view and interact with non-dynastic characters, invite to court, banish, grant titles
- **January 2026**: Added exit button to return to main menu from gameplay
- **January 2026**: Added character interaction options with prestige-based acceptance probability
- **January 2026**: Initial MVP development - core game types, portrait system, family tree, character sheets, event system, and game simulation

## Project Architecture

### Frontend Structure (client/src/)
- **lib/gameTypes.ts**: Core TypeScript types and constants (Character, Dynasty, Title, Holding, GameEvent, Cultures, Traits)
- **lib/gameContext.tsx**: React context providing game state management, simulation loop, and all game actions
- **lib/themeProvider.tsx**: Centralized theme management with localStorage persistence
- **lib/events.ts**: Event templates and generation logic
- **components/**: UI components
  - Portrait.tsx - Procedural SVG portrait generator
  - MainMenu.tsx - New game/load game screen
  - GameHeader.tsx - Top bar with player info, speed controls, and exit button
  - AppSidebar.tsx - Navigation sidebar using shadcn primitives
  - FamilyTree.tsx - Main family tree visualization
  - CharacterSheet.tsx - Detailed character view with interaction options
  - CourtScreen.tsx - Court members and all nobles management
  - Timeline.tsx - Event history log
  - SuccessionScreen.tsx - Heir management
  - HoldingsScreen.tsx - Titles and vassals
  - EventModal.tsx - In-game event popups
  - GameOverScreen.tsx - Dynasty extinction screen
  - MarriageDialog.tsx - Marriage arrangement interface

### Design Tokens
- Medieval parchment theme with warm browns and golds
- Fonts: Merriweather (body), Playfair Display (headings), Roboto Mono (dates)
- Dark mode support with proper contrast via ThemeProvider

### Game Systems
1. **Time System**: 1 real second = 1 in-game week, with pause/1x/2x/4x speed controls
2. **Character System**: Full stats (5 skills), traits, health, fertility, portraits, atCourt tracking
3. **Family System**: Parents, spouses, children with proper inheritance
4. **Court System**: Invite nobles to court, banish from court, grant titles
5. **Event System**: Random events with player choices affecting stats
6. **Save System**: localStorage with autosave every 2 in-game years

### Character Interactions
- **Invite to Court**: Non-dynasty characters can be invited; acceptance based on player prestige/diplomacy
- **Banish from Court**: Remove characters from your court
- **Grant Title**: Give lower titles (baronies, counties) to court members
- **Arrange Marriage**: Set up marriages between eligible characters

### Data Flow
1. GameProvider wraps entire app with game state
2. useGame() hook provides access to state and actions
3. Simulation runs in useEffect with requestAnimationFrame
4. Components read from context and dispatch actions
5. Wouter provides client-side routing

## User Preferences
- Medieval aesthetic with serif fonts
- Strategy game dashboard feel
- Deceased characters clearly marked with grayscale and skull icon

## Key Extension Points
- Add new cultures in gameTypes.ts CULTURES object
- Add new traits in gameTypes.ts TRAITS object
- Add new event types in events.ts
- Extend Character interface for new attributes
