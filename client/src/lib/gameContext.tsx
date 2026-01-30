import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { type GameState, type Character, type Dynasty, type Title, type Holding, type GameEvent, type CultureId, CULTURES, getCharacterAge, type PortraitData, type TraitId, type TitleRank, type Sex } from './gameTypes';
import { generateEvent } from './events';

const SAVE_KEY = 'house_eternal_save';
const AUTOSAVE_INTERVAL_WEEKS = 104; // 2 in-game years

interface GameContextType {
  gameState: GameState | null;
  isRunning: boolean;
  selectedCharacterId: string | null;
  activeScreen: 'tree' | 'character' | 'timeline' | 'succession' | 'holdings' | 'court';
  startNewGame: (dynastyName: string, rulerName: string, culture: CultureId, sex: Sex) => void;
  loadGame: () => boolean;
  saveGame: () => void;
  exitGame: () => void;
  setSpeed: (speed: 0 | 1 | 2 | 4) => void;
  selectCharacter: (id: string | null) => void;
  setActiveScreen: (screen: 'tree' | 'character' | 'timeline' | 'succession' | 'holdings' | 'court') => void;
  resolveEvent: (eventId: string, choiceIndex: number) => void;
  arrangeMarriage: (char1Id: string, char2Id: string) => boolean;
  inviteToCourt: (characterId: string) => boolean;
  banishFromCourt: (characterId: string) => boolean;
  grantTitle: (characterId: string, titleId: string) => boolean;
  getCharacter: (id: string) => Character | undefined;
  getDynasty: (id: string) => Dynasty | undefined;
  getTitle: (id: string) => Title | undefined;
  getPlayerCharacter: () => Character | undefined;
  getPlayerDynasty: () => Dynasty | undefined;
  getDynastyMembers: (dynastyId: string) => Character[];
  getCourtMembers: () => Character[];
  getNonDynasticCharacters: () => Character[];
  getChildren: (characterId: string) => Character[];
  getSpouses: (characterId: string) => Character[];
  getParents: (characterId: string) => { mother: Character | undefined; father: Character | undefined };
  hasSave: () => boolean;
  deleteSave: () => void;
  treeExpandedNodes: Set<string>;
  setTreeExpandedNodes: (nodes: Set<string>) => void;
  toggleTreeNode: (id: string) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generatePortrait(seed?: number): PortraitData {
  const s = seed ?? Math.floor(Math.random() * 1000000);
  const rand = () => {
    const x = Math.sin(s * Math.random()) * 10000;
    return x - Math.floor(x);
  };
  return {
    seed: s,
    headShape: Math.floor(rand() * 3),
    eyeStyle: Math.floor(rand() * 3),
    hairStyle: Math.floor(rand() * 4),
    hairColor: Math.floor(rand() * 8),
    skinTone: Math.floor(rand() * 5),
    beardStyle: Math.floor(rand() * 4),
    clothingStyle: Math.floor(rand() * 3),
  };
}

function generateName(culture: CultureId, sex: Sex): string {
  const cultureData = CULTURES[culture];
  const names = sex === 'male' ? cultureData.maleNames : cultureData.femaleNames;
  return names[Math.floor(Math.random() * names.length)];
}

function generateDynastyName(culture: CultureId): string {
  const cultureData = CULTURES[culture];
  return cultureData.dynastyNames[Math.floor(Math.random() * cultureData.dynastyNames.length)];
}

function generateRandomTraits(count: number = 2): TraitId[] {
  const allTraits: TraitId[] = [
    'brave', 'craven', 'ambitious', 'content', 'cruel', 'kind',
    'greedy', 'generous', 'lustful', 'chaste', 'wrathful', 'patient',
    'deceitful', 'honest', 'proud', 'humble'
  ];
  const selected: TraitId[] = [];
  const available = [...allTraits];
  
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    selected.push(available[idx]);
    available.splice(idx, 1);
  }
  
  return selected;
}

function createCharacter(
  name: string,
  sex: Sex,
  culture: CultureId,
  dynastyId: string | null,
  birthWeek: number,
  motherId: string | null = null,
  fatherId: string | null = null
): Character {
  return {
    id: generateId(),
    name,
    sex,
    culture,
    dynastyId,
    birthWeek,
    deathWeek: null,
    alive: true,
    motherId,
    fatherId,
    spouseIds: [],
    childrenIds: [],
    traits: generateRandomTraits(2),
    skills: {
      diplomacy: Math.floor(Math.random() * 15) + 3,
      martial: Math.floor(Math.random() * 15) + 3,
      stewardship: Math.floor(Math.random() * 15) + 3,
      intrigue: Math.floor(Math.random() * 15) + 3,
      learning: Math.floor(Math.random() * 15) + 3,
    },
    health: 80 + Math.floor(Math.random() * 40),
    fertility: 60 + Math.floor(Math.random() * 40),
    opinions: {},
    portrait: generatePortrait(),
    pregnantWith: null,
    pregnancyWeeksRemaining: 0,
    isRuler: false,
    primaryTitleId: null,
    atCourt: null,
  };
}

function createDynasty(name: string, founderId: string, culture: CultureId): Dynasty {
  const colors = [
    '#1E3A5F', '#4A0E4E', '#2F4F4F', '#8B0000', '#1B4D3E', '#4B0082', '#800020', '#003366'
  ];
  const secondaryColors = ['#FFD700', '#C0C0C0', '#B8860B', '#CD853F'];
  
  return {
    id: generateId(),
    name,
    founderId,
    culture,
    prestige: 100,
    motto: 'Glory through the ages',
    coatOfArms: {
      primaryColor: colors[Math.floor(Math.random() * colors.length)],
      secondaryColor: secondaryColors[Math.floor(Math.random() * secondaryColors.length)],
      symbol: Math.floor(Math.random() * 10),
    },
  };
}

function createTitle(name: string, rank: TitleRank, holderId: string | null = null): Title {
  return {
    id: generateId(),
    name,
    rank,
    holderId,
    successionLaw: 'primogeniture',
    claimantIds: [],
    dejureLiegeId: null,
    vassalTitleIds: [],
  };
}

function createHolding(name: string, titleId: string): Holding {
  return {
    id: generateId(),
    name,
    titleId,
    income: 10 + Math.floor(Math.random() * 20),
    levies: 100 + Math.floor(Math.random() * 200),
    development: 1 + Math.floor(Math.random() * 5),
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<'tree' | 'character' | 'timeline' | 'succession' | 'holdings' | 'court'>('tree');
  const [treeExpandedNodes, setTreeExpandedNodes] = useState<Set<string>>(new Set());
  const tickRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const toggleTreeNode = useCallback((id: string) => {
    setTreeExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isRunning = gameState !== null && gameState.speed > 0 && !gameState.gameOver;

  const saveGame = useCallback(() => {
    if (gameState) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    }
  }, [gameState]);

  const hasSave = useCallback(() => {
    return localStorage.getItem(SAVE_KEY) !== null;
  }, []);

  const deleteSave = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
  }, []);

  const loadGame = useCallback((): boolean => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved) as GameState;
        setGameState(state);
        setSelectedCharacterId(state.playerCharacterId);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  const startNewGame = useCallback((dynastyName: string, rulerName: string, culture: CultureId, sex: Sex) => {
    const ruler = createCharacter(rulerName, sex, culture, null, -20 * 52);
    ruler.isRuler = true;
    
    const dynasty = createDynasty(dynastyName, ruler.id, culture);
    ruler.dynastyId = dynasty.id;
    
    const capitalTitle = createTitle(`County of ${dynastyName}`, 'county', ruler.id);
    ruler.primaryTitleId = capitalTitle.id;
    
    const capitalHolding = createHolding(`Castle ${dynastyName}`, capitalTitle.id);
    
    const spouse = createCharacter(
      generateName(culture, sex === 'male' ? 'female' : 'male'),
      sex === 'male' ? 'female' : 'male',
      culture,
      null,
      -18 * 52
    );
    
    ruler.spouseIds.push(spouse.id);
    spouse.spouseIds.push(ruler.id);
    spouse.atCourt = ruler.id;
    
    const child1 = createCharacter(
      generateName(culture, 'male'),
      'male',
      culture,
      dynasty.id,
      -3 * 52,
      sex === 'female' ? ruler.id : spouse.id,
      sex === 'male' ? ruler.id : spouse.id
    );
    
    const child2 = createCharacter(
      generateName(culture, 'female'),
      'female',
      culture,
      dynasty.id,
      -1 * 52,
      sex === 'female' ? ruler.id : spouse.id,
      sex === 'male' ? ruler.id : spouse.id
    );
    
    ruler.childrenIds.push(child1.id, child2.id);
    spouse.childrenIds.push(child1.id, child2.id);
    child1.atCourt = ruler.id;
    child2.atCourt = ruler.id;
    
    const characters: Record<string, Character> = {
      [ruler.id]: ruler,
      [spouse.id]: spouse,
      [child1.id]: child1,
      [child2.id]: child2,
    };
    
    const otherCultures = Object.keys(CULTURES).filter(c => c !== culture) as CultureId[];
    
    for (let i = 0; i < 15; i++) {
      const otherCulture = otherCultures[i % otherCultures.length];
      const otherDynastyName = generateDynastyName(otherCulture);
      
      const otherRulerSex: Sex = Math.random() > 0.5 ? 'male' : 'female';
      const otherRuler = createCharacter(
        generateName(otherCulture, otherRulerSex),
        otherRulerSex,
        otherCulture,
        null,
        -(18 + Math.floor(Math.random() * 30)) * 52
      );
      
      const otherDynasty = createDynasty(otherDynastyName, otherRuler.id, otherCulture);
      otherRuler.dynastyId = otherDynasty.id;
      otherRuler.isRuler = true;
      
      characters[otherRuler.id] = otherRuler;
      
      const otherSpouseSex: Sex = otherRulerSex === 'male' ? 'female' : 'male';
      const otherSpouse = createCharacter(
        generateName(otherCulture, otherSpouseSex),
        otherSpouseSex,
        otherCulture,
        null,
        -(16 + Math.floor(Math.random() * 25)) * 52
      );
      
      otherRuler.spouseIds.push(otherSpouse.id);
      otherSpouse.spouseIds.push(otherRuler.id);
      characters[otherSpouse.id] = otherSpouse;
      
      const numChildren = Math.floor(Math.random() * 4);
      for (let j = 0; j < numChildren; j++) {
        const childSex: Sex = Math.random() > 0.5 ? 'male' : 'female';
        const childAge = Math.floor(Math.random() * 15);
        const child = createCharacter(
          generateName(otherCulture, childSex),
          childSex,
          otherCulture,
          otherDynasty.id,
          -childAge * 52,
          otherSpouseSex === 'female' ? otherSpouse.id : otherRuler.id,
          otherSpouseSex === 'male' ? otherSpouse.id : otherRuler.id
        );
        otherRuler.childrenIds.push(child.id);
        otherSpouse.childrenIds.push(child.id);
        characters[child.id] = child;
      }
    }
    
    const state: GameState = {
      currentWeek: 0,
      speed: 0,
      playerDynastyId: dynasty.id,
      playerCharacterId: ruler.id,
      characters,
      dynasties: { [dynasty.id]: dynasty },
      titles: { [capitalTitle.id]: capitalTitle },
      holdings: { [capitalHolding.id]: capitalHolding },
      events: [],
      eventLog: [],
      lastAutosaveWeek: 0,
      gameOver: false,
      gameOverReason: null,
    };
    
    setGameState(state);
    setSelectedCharacterId(ruler.id);
    setActiveScreen('tree');
  }, []);

  const setSpeed = useCallback((speed: 0 | 1 | 2 | 4) => {
    setGameState(prev => prev ? { ...prev, speed } : null);
  }, []);

  const selectCharacter = useCallback((id: string | null) => {
    setSelectedCharacterId(id);
    if (id) {
      setActiveScreen('character');
    }
  }, []);

  const getCharacter = useCallback((id: string): Character | undefined => {
    return gameState?.characters[id];
  }, [gameState]);

  const getDynasty = useCallback((id: string): Dynasty | undefined => {
    return gameState?.dynasties[id];
  }, [gameState]);

  const getTitle = useCallback((id: string): Title | undefined => {
    return gameState?.titles[id];
  }, [gameState]);

  const getPlayerCharacter = useCallback((): Character | undefined => {
    if (!gameState) return undefined;
    return gameState.characters[gameState.playerCharacterId];
  }, [gameState]);

  const getPlayerDynasty = useCallback((): Dynasty | undefined => {
    if (!gameState) return undefined;
    return gameState.dynasties[gameState.playerDynastyId];
  }, [gameState]);

  const getDynastyMembers = useCallback((dynastyId: string): Character[] => {
    if (!gameState) return [];
    return Object.values(gameState.characters).filter(c => c.dynastyId === dynastyId);
  }, [gameState]);

  const getChildren = useCallback((characterId: string): Character[] => {
    if (!gameState) return [];
    const character = gameState.characters[characterId];
    if (!character) return [];
    return character.childrenIds.map(id => gameState.characters[id]).filter(Boolean);
  }, [gameState]);

  const getSpouses = useCallback((characterId: string): Character[] => {
    if (!gameState) return [];
    const character = gameState.characters[characterId];
    if (!character) return [];
    return character.spouseIds.map(id => gameState.characters[id]).filter(Boolean);
  }, [gameState]);

  const getParents = useCallback((characterId: string): { mother: Character | undefined; father: Character | undefined } => {
    if (!gameState) return { mother: undefined, father: undefined };
    const character = gameState.characters[characterId];
    if (!character) return { mother: undefined, father: undefined };
    return {
      mother: character.motherId ? gameState.characters[character.motherId] : undefined,
      father: character.fatherId ? gameState.characters[character.fatherId] : undefined,
    };
  }, [gameState]);

  const resolveEvent = useCallback((eventId: string, choiceIndex: number) => {
    setGameState(prev => {
      if (!prev) return null;
      
      const event = prev.events.find(e => e.id === eventId);
      if (!event || !event.choices) return prev;
      
      const choice = event.choices[choiceIndex];
      if (!choice) return prev;
      
      const newCharacters = { ...prev.characters };
      const newDynasties = { ...prev.dynasties };
      
      for (const effect of choice.effects) {
        const targetChar = newCharacters[effect.target || event.characterId];
        if (!targetChar) continue;
        
        const updatedChar = { ...targetChar };
        
        switch (effect.type) {
          case 'health':
            updatedChar.health = Math.max(0, Math.min(100, updatedChar.health + (effect.value || 0)));
            break;
          case 'fertility':
            updatedChar.fertility = Math.max(0, Math.min(100, updatedChar.fertility + (effect.value || 0)));
            break;
          case 'skill':
            if (effect.skill) {
              updatedChar.skills = {
                ...updatedChar.skills,
                [effect.skill]: Math.max(0, updatedChar.skills[effect.skill] + (effect.value || 0)),
              };
            }
            break;
          case 'trait':
            if (effect.trait && !updatedChar.traits.includes(effect.trait)) {
              updatedChar.traits = [...updatedChar.traits, effect.trait];
            }
            break;
          case 'death':
            updatedChar.alive = false;
            updatedChar.deathWeek = prev.currentWeek;
            break;
          case 'prestige':
            if (updatedChar.dynastyId) {
              const dynasty = newDynasties[updatedChar.dynastyId];
              if (dynasty) {
                newDynasties[updatedChar.dynastyId] = {
                  ...dynasty,
                  prestige: dynasty.prestige + (effect.value || 0),
                };
              }
            }
            break;
        }
        
        newCharacters[updatedChar.id] = updatedChar;
      }
      
      const resolvedEvent = { ...event, resolved: true, chosenIndex: choiceIndex };
      
      return {
        ...prev,
        characters: newCharacters,
        dynasties: newDynasties,
        events: prev.events.filter(e => e.id !== eventId),
        eventLog: [...prev.eventLog, resolvedEvent],
      };
    });
  }, []);

  const arrangeMarriage = useCallback((char1Id: string, char2Id: string): boolean => {
    if (!gameState) return false;
    
    const char1 = gameState.characters[char1Id];
    const char2 = gameState.characters[char2Id];
    
    if (!char1 || !char2) return false;
    if (!char1.alive || !char2.alive) return false;
    if (char1.spouseIds.length > 0 || char2.spouseIds.length > 0) return false;
    
    const age1 = getCharacterAge(char1, gameState.currentWeek);
    const age2 = getCharacterAge(char2, gameState.currentWeek);
    if (age1 < 16 || age2 < 16) return false;
    
    if (char1.sex === char2.sex) return false;
    
    setGameState(prev => {
      if (!prev) return null;
      
      const newChar1 = { ...prev.characters[char1Id], spouseIds: [...prev.characters[char1Id].spouseIds, char2Id] };
      const newChar2 = { ...prev.characters[char2Id], spouseIds: [...prev.characters[char2Id].spouseIds, char1Id] };
      
      const marriageEvent: GameEvent = {
        id: generateId(),
        type: 'marriage',
        title: 'Marriage',
        description: `${newChar1.name} and ${newChar2.name} have been wed.`,
        week: prev.currentWeek,
        characterId: char1Id,
        resolved: true,
      };
      
      return {
        ...prev,
        characters: {
          ...prev.characters,
          [char1Id]: newChar1,
          [char2Id]: newChar2,
        },
        eventLog: [...prev.eventLog, marriageEvent],
      };
    });
    
    return true;
  }, [gameState]);

  const exitGame = useCallback(() => {
    setGameState(null);
    setSelectedCharacterId(null);
    setActiveScreen('tree');
  }, []);

  const inviteToCourt = useCallback((characterId: string): boolean => {
    if (!gameState) return false;
    
    const character = gameState.characters[characterId];
    const playerChar = gameState.characters[gameState.playerCharacterId];
    const playerDynasty = gameState.dynasties[gameState.playerDynastyId];
    
    if (!character || !playerChar) return false;
    if (!character.alive) return false;
    if (character.dynastyId === gameState.playerDynastyId) return false;
    if (character.atCourt === gameState.playerCharacterId) return false;
    
    const baseChance = 0.5;
    const prestigeBonus = playerDynasty ? Math.min(playerDynasty.prestige / 500, 0.3) : 0;
    const diplomacyBonus = playerChar.skills.diplomacy / 100;
    const acceptChance = Math.min(baseChance + prestigeBonus + diplomacyBonus, 0.95);
    
    if (Math.random() > acceptChance) {
      return false;
    }
    
    setGameState(prev => {
      if (!prev) return null;
      
      const updatedChar = { 
        ...prev.characters[characterId], 
        atCourt: prev.playerCharacterId 
      };
      
      return {
        ...prev,
        characters: {
          ...prev.characters,
          [characterId]: updatedChar,
        },
      };
    });
    
    return true;
  }, [gameState]);

  const banishFromCourt = useCallback((characterId: string): boolean => {
    if (!gameState) return false;
    
    const character = gameState.characters[characterId];
    
    if (!character) return false;
    if (character.atCourt !== gameState.playerCharacterId) return false;
    
    setGameState(prev => {
      if (!prev) return null;
      
      const updatedChar = { 
        ...prev.characters[characterId], 
        atCourt: null 
      };
      
      return {
        ...prev,
        characters: {
          ...prev.characters,
          [characterId]: updatedChar,
        },
      };
    });
    
    return true;
  }, [gameState]);

  const grantTitle = useCallback((characterId: string, titleId: string): boolean => {
    if (!gameState) return false;
    
    const character = gameState.characters[characterId];
    const title = gameState.titles[titleId];
    const playerChar = gameState.characters[gameState.playerCharacterId];
    
    if (!character || !title || !playerChar) return false;
    if (!character.alive) return false;
    if (title.holderId !== gameState.playerCharacterId) return false;
    
    setGameState(prev => {
      if (!prev) return null;
      
      const updatedTitle = { ...prev.titles[titleId], holderId: characterId };
      const updatedChar = { 
        ...prev.characters[characterId], 
        primaryTitleId: prev.characters[characterId].primaryTitleId || titleId 
      };
      
      const playerTitles = Object.values(prev.titles).filter(t => t.holderId === prev.playerCharacterId);
      const updatedPlayer = { 
        ...prev.characters[prev.playerCharacterId],
        primaryTitleId: playerTitles.length > 1 ? playerTitles.find(t => t.id !== titleId)?.id || null : null,
      };
      
      return {
        ...prev,
        characters: {
          ...prev.characters,
          [characterId]: updatedChar,
          [prev.playerCharacterId]: updatedPlayer,
        },
        titles: {
          ...prev.titles,
          [titleId]: updatedTitle,
        },
      };
    });
    
    return true;
  }, [gameState]);

  const getCourtMembers = useCallback((): Character[] => {
    if (!gameState) return [];
    return Object.values(gameState.characters).filter(
      c => c.alive && c.atCourt === gameState.playerCharacterId && c.id !== gameState.playerCharacterId
    );
  }, [gameState]);

  const getNonDynasticCharacters = useCallback((): Character[] => {
    if (!gameState) return [];
    return Object.values(gameState.characters).filter(
      c => c.alive && c.dynastyId !== gameState.playerDynastyId
    );
  }, [gameState]);

  useEffect(() => {
    if (!isRunning || !gameState) {
      if (tickRef.current) {
        cancelAnimationFrame(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    const tickInterval = 1000 / gameState.speed;

    const tick = (timestamp: number) => {
      if (timestamp - lastTickRef.current >= tickInterval) {
        lastTickRef.current = timestamp;
        
        setGameState(prev => {
          if (!prev || prev.speed === 0 || prev.gameOver) return prev;
          
          const newWeek = prev.currentWeek + 1;
          const newCharacters = { ...prev.characters };
          const newEvents = [...prev.events];
          const newEventLog = [...prev.eventLog];
          let newDynasties = { ...prev.dynasties };
          let newTitles = { ...prev.titles };
          
          for (const charId of Object.keys(newCharacters)) {
            const char = newCharacters[charId];
            if (!char.alive) continue;
            
            const age = getCharacterAge(char, newWeek);
            
            if (age > 40) {
              const deathChance = (age - 40) * 0.001 + (100 - char.health) * 0.0005;
              if (Math.random() < deathChance) {
                newCharacters[charId] = { ...char, alive: false, deathWeek: newWeek };
                
                newEventLog.push({
                  id: generateId(),
                  type: 'death',
                  title: 'Death',
                  description: `${char.name} has died at the age of ${age}.`,
                  week: newWeek,
                  characterId: charId,
                  resolved: true,
                });
              }
            }
            
            if (char.pregnantWith && char.pregnancyWeeksRemaining > 0) {
              const updatedChar = { ...newCharacters[charId] };
              updatedChar.pregnancyWeeksRemaining--;
              
              if (updatedChar.pregnancyWeeksRemaining <= 0) {
                const father = newCharacters[char.pregnantWith];
                if (father) {
                  const childSex: Sex = Math.random() > 0.5 ? 'male' : 'female';
                  const child = createCharacter(
                    generateName(char.culture, childSex),
                    childSex,
                    char.culture,
                    char.dynastyId || father.dynastyId,
                    newWeek,
                    char.id,
                    father.id
                  );
                  
                  updatedChar.childrenIds = [...updatedChar.childrenIds, child.id];
                  newCharacters[father.id] = {
                    ...father,
                    childrenIds: [...father.childrenIds, child.id],
                  };
                  newCharacters[child.id] = child;
                  
                  newEventLog.push({
                    id: generateId(),
                    type: 'birth',
                    title: 'A Child is Born',
                    description: `${char.name} has given birth to a ${childSex === 'male' ? 'son' : 'daughter'} named ${child.name}.`,
                    week: newWeek,
                    characterId: char.id,
                    resolved: true,
                  });
                }
                
                updatedChar.pregnantWith = null;
              }
              
              newCharacters[charId] = updatedChar;
            }
            
            if (char.sex === 'female' && char.spouseIds.length > 0 && !char.pregnantWith && age >= 16 && age <= 45) {
              const spouse = newCharacters[char.spouseIds[0]];
              if (spouse && spouse.alive) {
                const pregnancyChance = (char.fertility / 100) * (spouse.fertility / 100) * 0.02;
                if (Math.random() < pregnancyChance) {
                  newCharacters[charId] = {
                    ...char,
                    pregnantWith: spouse.id,
                    pregnancyWeeksRemaining: 40,
                  };
                }
              }
            }
          }
          
          if (Math.random() < 0.02) {
            const playerChar = newCharacters[prev.playerCharacterId];
            if (playerChar && playerChar.alive) {
              const event = generateEvent(playerChar, newWeek);
              if (event) {
                newEvents.push(event);
              }
            }
          }
          
          const playerDynasty = newDynasties[prev.playerDynastyId];
          const livingDynastyMembers = Object.values(newCharacters).filter(
            c => c.dynastyId === prev.playerDynastyId && c.alive
          );
          
          let gameOver = false;
          let gameOverReason: string | null = null;
          
          if (livingDynastyMembers.length === 0) {
            gameOver = true;
            gameOverReason = `The ${playerDynasty?.name || 'dynasty'} has ended. No living heirs remain.`;
          }
          
          let shouldAutosave = false;
          if (newWeek - prev.lastAutosaveWeek >= AUTOSAVE_INTERVAL_WEEKS) {
            shouldAutosave = true;
          }
          
          const newState: GameState = {
            ...prev,
            currentWeek: newWeek,
            characters: newCharacters,
            dynasties: newDynasties,
            titles: newTitles,
            events: newEvents,
            eventLog: newEventLog,
            gameOver,
            gameOverReason,
            lastAutosaveWeek: shouldAutosave ? newWeek : prev.lastAutosaveWeek,
          };
          
          if (shouldAutosave) {
            localStorage.setItem(SAVE_KEY, JSON.stringify(newState));
          }
          
          return newState;
        });
      }
      
      tickRef.current = requestAnimationFrame(tick);
    };

    tickRef.current = requestAnimationFrame(tick);

    return () => {
      if (tickRef.current) {
        cancelAnimationFrame(tickRef.current);
      }
    };
  }, [isRunning, gameState?.speed]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        isRunning,
        selectedCharacterId,
        activeScreen,
        startNewGame,
        loadGame,
        saveGame,
        exitGame,
        setSpeed,
        selectCharacter,
        setActiveScreen,
        resolveEvent,
        arrangeMarriage,
        inviteToCourt,
        banishFromCourt,
        grantTitle,
        getCharacter,
        getDynasty,
        getTitle,
        getPlayerCharacter,
        getPlayerDynasty,
        getDynastyMembers,
        getCourtMembers,
        getNonDynasticCharacters,
        getChildren,
        getSpouses,
        getParents,
        hasSave,
        deleteSave,
        treeExpandedNodes,
        setTreeExpandedNodes,
        toggleTreeNode,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
