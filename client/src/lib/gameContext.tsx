import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { type GameState, type Character, type Dynasty, type Title, type Holding, type GameEvent, type CultureId, CULTURES, getCharacterAge, type PortraitData, type TraitId, type TitleRank, type Sex, type SuccessionLaw } from './gameTypes';
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
  setSpeed: (speed: 0 | 1 | 2 | 4 | 8) => void;
  selectCharacter: (id: string | null) => void;
  setActiveScreen: (screen: 'tree' | 'character' | 'timeline' | 'succession' | 'holdings' | 'court') => void;
  resolveEvent: (eventId: string, choiceIndex: number) => void;
  arrangeMarriage: (char1Id: string, char2Id: string, matrilineal?: boolean) => boolean;
  viewCharacterTree: (characterId: string) => void;
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
  getAllCharacters: () => Character[];
  getChildren: (characterId: string) => Character[];
  getSpouses: (characterId: string) => Character[];
  getParents: (characterId: string) => { mother: Character | undefined; father: Character | undefined };
  getSuccessionLine: (characterId: string, law?: SuccessionLaw) => Character[];
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
  fatherId: string | null = null,
  atCourt: string | null = null
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
    atCourt,
    liegeId: null,
    matrilinealMarriage: false,
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

// Calculate succession line using proper primogeniture (depth-first)
// In primogeniture, grandchildren through eldest child come before younger children
function calculateSuccessionLine(
  rootCharacterId: string,
  characters: Record<string, Character>,
  law: SuccessionLaw = 'primogeniture'
): string[] {
  const visited = new Set<string>();
  const line: string[] = [];
  
  function addDescendants(charId: string) {
    const char = characters[charId];
    if (!char || visited.has(charId)) return;
    visited.add(charId);
    
    // Get living children
    let children = char.childrenIds
      .map(id => characters[id])
      .filter(c => c && c.alive);
    
    // Sort children based on succession law
    switch (law) {
      case 'primogeniture':
        children = children.sort((a, b) => a.birthWeek - b.birthWeek);
        break;
      case 'ultimogeniture':
        children = children.sort((a, b) => b.birthWeek - a.birthWeek);
        break;
      case 'gavelkind':
        children = children.sort((a, b) => a.birthWeek - b.birthWeek);
        break;
      case 'elective':
        children = children.sort((a, b) => {
          const aScore = a.skills.diplomacy + a.skills.stewardship;
          const bScore = b.skills.diplomacy + b.skills.stewardship;
          return bScore - aScore;
        });
        break;
    }
    
    // For each child, add them and their descendants (depth-first)
    for (const child of children) {
      if (!visited.has(child.id)) {
        line.push(child.id);
        addDescendants(child.id);
      }
    }
  }
  
  addDescendants(rootCharacterId);
  return line;
}

// Get the heir for a specific title based on its succession law
function getHeirForTitle(
  title: Title,
  characters: Record<string, Character>
): string | null {
  if (!title.holderId) return null;
  
  const holder = characters[title.holderId];
  if (!holder) return null;
  
  const successionLine = calculateSuccessionLine(holder.id, characters, title.successionLaw);
  return successionLine.length > 0 ? successionLine[0] : null;
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
    
    const allDynasties: Record<string, Dynasty> = { [dynasty.id]: dynasty };
    const allTitles: Record<string, Title> = { [capitalTitle.id]: capitalTitle };
    const allHoldings: Record<string, Holding> = { [capitalHolding.id]: capitalHolding };
    
    const otherCultures = Object.keys(CULTURES).filter(c => c !== culture) as CultureId[];
    
    // Helper to create a ruler with spouse and children
    function createRulerWithFamily(cultureId: CultureId, title: Title): void {
      const dynastyName = generateDynastyName(cultureId);
      const rulerSex: Sex = Math.random() > 0.5 ? 'male' : 'female';
      const ruler = createCharacter(
        generateName(cultureId, rulerSex),
        rulerSex,
        cultureId,
        null,
        -(18 + Math.floor(Math.random() * 30)) * 52
      );
      
      const dynasty = createDynasty(dynastyName, ruler.id, cultureId);
      ruler.dynastyId = dynasty.id;
      ruler.isRuler = true;
      ruler.primaryTitleId = title.id;
      title.holderId = ruler.id;
      
      const holdingPrefix = title.rank === 'kingdom' ? 'Palace' : title.rank === 'duchy' ? 'Fortress' : 'Castle';
      const holding = createHolding(`${holdingPrefix} ${dynastyName}`, title.id);
      
      allDynasties[dynasty.id] = dynasty;
      allHoldings[holding.id] = holding;
      characters[ruler.id] = ruler;
      
      const spouseSex: Sex = rulerSex === 'male' ? 'female' : 'male';
      const spouse = createCharacter(
        generateName(cultureId, spouseSex),
        spouseSex,
        cultureId,
        null,
        -(16 + Math.floor(Math.random() * 25)) * 52
      );
      spouse.atCourt = ruler.id;
      
      ruler.spouseIds.push(spouse.id);
      spouse.spouseIds.push(ruler.id);
      characters[spouse.id] = spouse;
      
      const numChildren = 1 + Math.floor(Math.random() * 4);
      for (let j = 0; j < numChildren; j++) {
        const childSex: Sex = Math.random() > 0.5 ? 'male' : 'female';
        const childAge = Math.floor(Math.random() * 15);
        const child = createCharacter(
          generateName(cultureId, childSex),
          childSex,
          cultureId,
          dynasty.id,
          -childAge * 52,
          spouseSex === 'female' ? spouse.id : ruler.id,
          spouseSex === 'male' ? spouse.id : ruler.id
        );
        child.atCourt = ruler.id;
        ruler.childrenIds.push(child.id);
        spouse.childrenIds.push(child.id);
        characters[child.id] = child;
      }
    }
    
    // Create feudal hierarchy: 3 kingdoms, 5 duchies as vassals, 7 counties as sub-vassals
    const kingdomTitles: Title[] = [];
    const duchyTitles: Title[] = [];
    
    // Create 3 kingdoms (independent - no liege)
    for (let i = 0; i < 3; i++) {
      const cultureId = otherCultures[i % otherCultures.length];
      const kingdomName = generateDynastyName(cultureId);
      const kingdomTitle = createTitle(`Kingdom of ${kingdomName}`, 'kingdom', null);
      allTitles[kingdomTitle.id] = kingdomTitle;
      kingdomTitles.push(kingdomTitle);
      createRulerWithFamily(cultureId, kingdomTitle);
    }
    
    // Create 5 duchies as vassals to kingdoms
    for (let i = 0; i < 5; i++) {
      const cultureId = otherCultures[(i + 3) % otherCultures.length];
      const duchyName = generateDynastyName(cultureId);
      const duchyTitle = createTitle(`Duchy of ${duchyName}`, 'duchy', null);
      
      // Assign liege - distribute among kingdoms
      const liegeKingdom = kingdomTitles[i % kingdomTitles.length];
      duchyTitle.dejureLiegeId = liegeKingdom.id;
      liegeKingdom.vassalTitleIds.push(duchyTitle.id);
      
      allTitles[duchyTitle.id] = duchyTitle;
      duchyTitles.push(duchyTitle);
      createRulerWithFamily(cultureId, duchyTitle);
    }
    
    // Create 7 counties as vassals to duchies
    for (let i = 0; i < 7; i++) {
      const cultureId = otherCultures[i % otherCultures.length];
      const countyName = generateDynastyName(cultureId);
      const countyTitle = createTitle(`County of ${countyName}`, 'county', null);
      
      // Assign liege - distribute among duchies
      const liegeDuchy = duchyTitles[i % duchyTitles.length];
      countyTitle.dejureLiegeId = liegeDuchy.id;
      liegeDuchy.vassalTitleIds.push(countyTitle.id);
      
      allTitles[countyTitle.id] = countyTitle;
      createRulerWithFamily(cultureId, countyTitle);
    }
    
    const state: GameState = {
      currentWeek: 0,
      speed: 0,
      playerDynastyId: dynasty.id,
      playerCharacterId: ruler.id,
      characters,
      dynasties: allDynasties,
      titles: allTitles,
      holdings: allHoldings,
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

  const setSpeed = useCallback((speed: 0 | 1 | 2 | 4 | 8) => {
    setGameState(prev => prev ? { ...prev, speed } : null);
  }, []);

  const selectCharacter = useCallback((id: string | null) => {
    setSelectedCharacterId(id);
    if (id) {
      setActiveScreen('character');
    }
  }, []);

  const viewCharacterTree = useCallback((characterId: string) => {
    if (!gameState) return;
    const character = gameState.characters[characterId];
    if (!character || !character.dynastyId) return;
    
    // Find the dynasty founder and expand the full lineage path
    const dynasty = gameState.dynasties[character.dynastyId];
    if (dynasty) {
      // Build path from founder to character by tracing up parents
      const nodesToExpand = new Set<string>([dynasty.founderId, characterId]);
      
      // Trace from character up to founder
      let current = character;
      while (current) {
        nodesToExpand.add(current.id);
        // Check mother first, then father
        const mother = current.motherId ? gameState.characters[current.motherId] : null;
        const father = current.fatherId ? gameState.characters[current.fatherId] : null;
        
        // Follow the parent that's in this dynasty
        if (mother && mother.dynastyId === dynasty.id) {
          current = mother;
        } else if (father && father.dynastyId === dynasty.id) {
          current = father;
        } else {
          break;
        }
      }
      
      setTreeExpandedNodes(nodesToExpand);
    }
    setActiveScreen('tree');
    setSelectedCharacterId(characterId);
  }, [gameState]);

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

  const arrangeMarriage = useCallback((char1Id: string, char2Id: string, matrilineal: boolean = false): boolean => {
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
      
      // Determine who is the husband and wife
      const husband = char1.sex === 'male' ? char1 : char2;
      const wife = char1.sex === 'female' ? char1 : char2;
      const husbandId = husband.id;
      const wifeId = wife.id;
      
      // Determine where wife moves to - wife moves to husband's court unless she's a ruler
      const wifeIsRuler = wife.isRuler && wife.primaryTitleId;
      let wifeNewCourt = wife.atCourt;
      let husbandNewCourt = husband.atCourt;
      
      if (wifeIsRuler) {
        // Wife stays in her court, husband joins her court
        husbandNewCourt = wifeId;
      } else {
        // Wife moves to husband's court (husband's location or husband himself if he's a ruler)
        wifeNewCourt = husband.isRuler ? husbandId : husband.atCourt;
      }
      
      const newHusband = { 
        ...prev.characters[husbandId], 
        spouseIds: [...prev.characters[husbandId].spouseIds, wifeId],
        matrilinealMarriage: matrilineal,
        atCourt: husbandNewCourt,
      };
      const newWife = { 
        ...prev.characters[wifeId], 
        spouseIds: [...prev.characters[wifeId].spouseIds, husbandId],
        matrilinealMarriage: matrilineal,
        atCourt: wifeNewCourt,
      };
      
      const marriageType = matrilineal ? 'Matrilineal Marriage' : 'Marriage';
      const marriageEvent: GameEvent = {
        id: generateId(),
        type: 'marriage',
        title: marriageType,
        description: `${newHusband.name} and ${newWife.name} have been wed${matrilineal ? ' in a matrilineal marriage' : ''}.`,
        week: prev.currentWeek,
        characterId: char1Id,
        resolved: true,
      };
      
      return {
        ...prev,
        characters: {
          ...prev.characters,
          [husbandId]: newHusband,
          [wifeId]: newWife,
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

  const getAllCharacters = useCallback((): Character[] => {
    if (!gameState) return [];
    return Object.values(gameState.characters).filter(c => c.alive);
  }, [gameState]);

  const getSuccessionLine = useCallback((characterId: string, law: SuccessionLaw = 'primogeniture'): Character[] => {
    if (!gameState) return [];
    const line = calculateSuccessionLine(characterId, gameState.characters, law);
    return line.map(id => gameState.characters[id]).filter(Boolean);
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
          
          const deadCharIds: string[] = [];
          
          for (const charId of Object.keys(newCharacters)) {
            const char = newCharacters[charId];
            if (!char.alive) continue;
            
            const age = getCharacterAge(char, newWeek);
            
            if (age > 40) {
              const deathChance = (age - 40) * 0.001 + (100 - char.health) * 0.0005;
              if (Math.random() < deathChance) {
                newCharacters[charId] = { ...char, alive: false, deathWeek: newWeek };
                deadCharIds.push(charId);
                
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
            
            // Child mortality: 10% per year for children under age 5
            if (age < 5 && newWeek % 52 === 0) {
              if (Math.random() < 0.10) {
                newCharacters[charId] = { ...char, alive: false, deathWeek: newWeek };
                deadCharIds.push(charId);
                
                newEventLog.push({
                  id: generateId(),
                  type: 'death',
                  title: 'Child Death',
                  description: `${char.name} has died in childhood at the age of ${age}.`,
                  week: newWeek,
                  characterId: charId,
                  resolved: true,
                });
                continue;
              }
            }
            
            if (char.pregnantWith && char.pregnancyWeeksRemaining > 0) {
              const updatedChar = { ...newCharacters[charId] };
              updatedChar.pregnancyWeeksRemaining--;
              
              if (updatedChar.pregnancyWeeksRemaining <= 0) {
                const father = newCharacters[char.pregnantWith];
                if (father) {
                  const childSex: Sex = Math.random() > 0.5 ? 'male' : 'female';
                  
                  // Dynasty inheritance: father's dynasty unless matrilineal marriage
                  const isMatrilineal = char.matrilinealMarriage || father.matrilinealMarriage;
                  const childDynasty = isMatrilineal ? char.dynastyId : (father.dynastyId || char.dynastyId);
                  
                  // Court assignment: child joins the parent's court (the ruler parent, or the court they're at)
                  const parentCourt = char.isRuler ? char.id : (father.isRuler ? father.id : (char.atCourt || father.atCourt));
                  
                  const child = createCharacter(
                    generateName(char.culture, childSex),
                    childSex,
                    char.culture,
                    childDynasty,
                    newWeek,
                    char.id,
                    father.id,
                    parentCourt
                  );
                  
                  updatedChar.childrenIds = [...updatedChar.childrenIds, child.id];
                  newCharacters[father.id] = {
                    ...newCharacters[father.id],
                    childrenIds: [...newCharacters[father.id].childrenIds, child.id],
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
                  
                  // Maternal mortality: 10% chance of mother dying per birth
                  if (Math.random() < 0.10) {
                    updatedChar.alive = false;
                    updatedChar.deathWeek = newWeek;
                    deadCharIds.push(charId);
                    
                    newEventLog.push({
                      id: generateId(),
                      type: 'death',
                      title: 'Death in Childbirth',
                      description: `${char.name} has died in childbirth at the age of ${age}.`,
                      week: newWeek,
                      characterId: charId,
                      resolved: true,
                    });
                  }
                }
                
                updatedChar.pregnantWith = null;
              }
              
              newCharacters[charId] = updatedChar;
            }
            
            // Pregnancy logic with child cap of 4 and reduced chance
            if (char.sex === 'female' && char.spouseIds.length > 0 && !char.pregnantWith && age >= 16 && age <= 45) {
              const spouse = newCharacters[char.spouseIds[0]];
              if (spouse && spouse.alive) {
                // Count existing children from this couple (both parents must have the child)
                const sharedChildren = char.childrenIds.filter(cid => spouse.childrenIds.includes(cid));
                const childCount = sharedChildren.length;
                
                // Hard cap of 4 children per couple
                if (childCount < 4) {
                  // Reduced pregnancy chance (was 0.02, now 0.005 = ~0.26 per year, much lower)
                  const pregnancyChance = (char.fertility / 100) * (spouse.fertility / 100) * 0.005;
                  if (Math.random() < pregnancyChance) {
                    newCharacters[charId] = {
                      ...newCharacters[charId],
                      pregnantWith: spouse.id,
                      pregnancyWeeksRemaining: 40,
                    };
                  }
                }
              }
            }
          }
          
          // Process title succession for all dead characters
          for (const deadCharId of deadCharIds) {
            const deadChar = newCharacters[deadCharId];
            
            // Find all titles held by this character
            const heldTitles = Object.values(newTitles).filter(t => t.holderId === deadCharId);
            
            for (const title of heldTitles) {
              // Calculate heir using proper succession
              const successionLine = calculateSuccessionLine(deadCharId, newCharacters, title.successionLaw);
              const heirId = successionLine.length > 0 ? successionLine[0] : null;
              
              if (heirId) {
                const heir = newCharacters[heirId];
                
                // Update title holder
                newTitles[title.id] = { ...title, holderId: heirId };
                
                // Update heir's primary title if they don't have one
                if (!heir.primaryTitleId) {
                  newCharacters[heirId] = { ...newCharacters[heirId], primaryTitleId: title.id, isRuler: true };
                }
                
                newEventLog.push({
                  id: generateId(),
                  type: 'succession',
                  title: 'Title Inherited',
                  description: `${heir.name} has inherited ${title.name} from ${deadChar.name}.`,
                  week: newWeek,
                  characterId: heirId,
                  resolved: true,
                });
              } else {
                // No heir - title becomes vacant
                newTitles[title.id] = { ...title, holderId: null };
              }
            }
          }
          
          // Handle player character death - MUST switch to a living character
          let newPlayerCharacterId = prev.playerCharacterId;
          const playerChar = newCharacters[prev.playerCharacterId];
          const playerDynasty = newDynasties[prev.playerDynastyId];
          
          // Get all living dynasty members
          const livingDynastyMembers = Object.values(newCharacters).filter(
            c => c.dynastyId === prev.playerDynastyId && c.alive
          );
          
          let gameOver = false;
          let gameOverReason: string | null = null;
          
          // CRITICAL: Player must ALWAYS control a living character
          if (!playerChar || !playerChar.alive) {
            if (livingDynastyMembers.length === 0) {
              // No living dynasty members - game over
              gameOver = true;
              gameOverReason = `The ${playerDynasty?.name || 'dynasty'} has ended. No living heirs remain.`;
            } else {
              // Find the best heir using succession line, or fall back to any living member
              const playerSuccessionLine = calculateSuccessionLine(prev.playerCharacterId, newCharacters, 'primogeniture');
              const dynastyHeirs = playerSuccessionLine.filter(id => {
                const char = newCharacters[id];
                return char && char.alive && char.dynastyId === prev.playerDynastyId;
              });
              
              if (dynastyHeirs.length > 0) {
                newPlayerCharacterId = dynastyHeirs[0];
              } else {
                // No heirs in succession line, pick any living dynasty member (prefer rulers)
                const rulers = livingDynastyMembers.filter(c => c.isRuler);
                newPlayerCharacterId = rulers.length > 0 ? rulers[0].id : livingDynastyMembers[0].id;
              }
              
              const newPlayerChar = newCharacters[newPlayerCharacterId];
              
              newEventLog.push({
                id: generateId(),
                type: 'succession',
                title: 'You are now playing as your heir',
                description: `You are now ${newPlayerChar.name}, heir to the ${playerDynasty?.name || ''} dynasty.`,
                week: newWeek,
                characterId: newPlayerCharacterId,
                resolved: true,
              });
            }
          }
          
          if (!gameOver && Math.random() < 0.02) {
            const currentPlayerChar = newCharacters[newPlayerCharacterId];
            if (currentPlayerChar && currentPlayerChar.alive) {
              const event = generateEvent(currentPlayerChar, newWeek);
              if (event) {
                newEvents.push(event);
              }
            }
          }
          
          let shouldAutosave = false;
          if (newWeek - prev.lastAutosaveWeek >= AUTOSAVE_INTERVAL_WEEKS) {
            shouldAutosave = true;
          }
          
          const newState: GameState = {
            ...prev,
            currentWeek: newWeek,
            playerCharacterId: newPlayerCharacterId,
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
        viewCharacterTree,
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
        getAllCharacters,
        getChildren,
        getSpouses,
        getParents,
        getSuccessionLine,
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
