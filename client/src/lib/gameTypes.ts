export type Sex = 'male' | 'female';

export type CultureId = 'anglo' | 'frankish' | 'norse' | 'iberian';

export type TraitId = 
  | 'brave' | 'craven' | 'ambitious' | 'content' | 'cruel' | 'kind'
  | 'greedy' | 'generous' | 'lustful' | 'chaste' | 'wrathful' | 'patient'
  | 'deceitful' | 'honest' | 'proud' | 'humble' | 'genius' | 'imbecile'
  | 'strong' | 'weak' | 'beautiful' | 'ugly' | 'fertile' | 'barren';

export type TitleRank = 'barony' | 'county' | 'duchy' | 'kingdom' | 'empire';

export type SuccessionLaw = 'primogeniture' | 'ultimogeniture' | 'gavelkind' | 'elective';

export interface PortraitData {
  seed: number;
  headShape: number;
  eyeStyle: number;
  hairStyle: number;
  hairColor: number;
  skinTone: number;
  beardStyle: number;
  clothingStyle: number;
}

export interface Character {
  id: string;
  name: string;
  sex: Sex;
  culture: CultureId;
  dynastyId: string | null;
  birthWeek: number;
  deathWeek: number | null;
  alive: boolean;
  motherId: string | null;
  fatherId: string | null;
  spouseIds: string[];
  childrenIds: string[];
  traits: TraitId[];
  skills: {
    diplomacy: number;
    martial: number;
    stewardship: number;
    intrigue: number;
    learning: number;
  };
  health: number;
  fertility: number;
  opinions: Record<string, number>;
  portrait: PortraitData;
  pregnantWith: string | null;
  pregnancyWeeksRemaining: number;
  isRuler: boolean;
  primaryTitleId: string | null;
  atCourt: string | null;
}

export interface Dynasty {
  id: string;
  name: string;
  founderId: string;
  culture: CultureId;
  prestige: number;
  motto: string;
  coatOfArms: {
    primaryColor: string;
    secondaryColor: string;
    symbol: number;
  };
}

export interface Title {
  id: string;
  name: string;
  rank: TitleRank;
  holderId: string | null;
  successionLaw: SuccessionLaw;
  claimantIds: string[];
  dejureLiegeId: string | null;
  vassalTitleIds: string[];
}

export interface Holding {
  id: string;
  name: string;
  titleId: string;
  income: number;
  levies: number;
  development: number;
}

export interface GameEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  week: number;
  characterId: string;
  choices?: {
    text: string;
    effects: EventEffect[];
  }[];
  resolved: boolean;
  chosenIndex?: number;
}

export interface EventEffect {
  type: 'health' | 'fertility' | 'skill' | 'opinion' | 'prestige' | 'trait' | 'death' | 'gold';
  target?: string;
  skill?: keyof Character['skills'];
  trait?: TraitId;
  value?: number;
}

export interface GameState {
  currentWeek: number;
  speed: 0 | 1 | 2 | 4;
  playerDynastyId: string;
  playerCharacterId: string;
  characters: Record<string, Character>;
  dynasties: Record<string, Dynasty>;
  titles: Record<string, Title>;
  holdings: Record<string, Holding>;
  events: GameEvent[];
  eventLog: GameEvent[];
  lastAutosaveWeek: number;
  gameOver: boolean;
  gameOverReason: string | null;
}

export interface Culture {
  id: CultureId;
  name: string;
  maleNames: string[];
  femaleNames: string[];
  dynastyNames: string[];
}

export const CULTURES: Record<CultureId, Culture> = {
  anglo: {
    id: 'anglo',
    name: 'Anglo-Saxon',
    maleNames: ['Alfred', 'Edward', 'Harold', 'Edgar', 'Athelstan', 'Edmund', 'Oswald', 'Leofric', 'Godwin', 'Wulfstan', 'Aelfric', 'Dunstan', 'Cuthbert', 'Aldhelm', 'Beorhtric'],
    femaleNames: ['Aethelflaed', 'Edith', 'Gytha', 'Eadgyth', 'Wulfhild', 'Aelfgifu', 'Godgifu', 'Leofwynn', 'Hild', 'Mildred', 'Aethelthryth', 'Cwenburh', 'Ealdgyth', 'Cyneburga'],
    dynastyNames: ['Godwinson', 'Leofricson', 'Aethelredson', 'Eadricson', 'Oswaldson', 'Wulfricson', 'Dunstanson', 'Cuthbertson', 'Aldhelming', 'Beorhtricson'],
  },
  frankish: {
    id: 'frankish',
    name: 'Frankish',
    maleNames: ['Charles', 'Louis', 'Robert', 'Hugh', 'Odo', 'Pepin', 'Lothair', 'Godfrey', 'Baldwin', 'Philip', 'Henry', 'Raoul', 'Eudes', 'Arnulf', 'Gilbert'],
    femaleNames: ['Adelaide', 'Bertha', 'Gertrude', 'Matilda', 'Beatrice', 'Hildegard', 'Ermengarde', 'Constance', 'Adela', 'Blanche', 'Isabelle', 'Judith', 'Richardis', 'Rothrud'],
    dynastyNames: ['de Valois', 'de Bourbon', 'de Lorraine', 'de Champagne', 'de Normandie', 'de Anjou', 'de Blois', 'de Vermandois', 'de Flandres', 'de Burgundy'],
  },
  norse: {
    id: 'norse',
    name: 'Norse',
    maleNames: ['Ragnar', 'Bjorn', 'Ivar', 'Harald', 'Erik', 'Olaf', 'Sigurd', 'Knut', 'Leif', 'Thorvald', 'Gunnar', 'Ulf', 'Sven', 'Hakon', 'Rollo'],
    femaleNames: ['Astrid', 'Freya', 'Ingrid', 'Sigrid', 'Helga', 'Thora', 'Ragnhild', 'Gudrun', 'Aslaug', 'Lagertha', 'Thyra', 'Gyda', 'Brynhild', 'Jorunn'],
    dynastyNames: ['Ragnarsson', 'Lothbrok', 'Ironside', 'Fairhair', 'Bloodaxe', 'Bluetooth', 'Forkbeard', 'Hardrada', 'Magnusson', 'Haraldson'],
  },
  iberian: {
    id: 'iberian',
    name: 'Iberian',
    maleNames: ['Alfonso', 'Sancho', 'Fernando', 'Rodrigo', 'Garcia', 'Ramon', 'Pedro', 'Gonzalo', 'Diego', 'Jimeno', 'Ordono', 'Bermudo', 'Pelayo', 'Munio', 'Fruela'],
    femaleNames: ['Urraca', 'Elvira', 'Jimena', 'Sancha', 'Teresa', 'Berenguela', 'Constanza', 'Mayor', 'Toda', 'Munia', 'Ximena', 'Oneca', 'Andregoto', 'Ermesinda'],
    dynastyNames: ['de Leon', 'de Castilla', 'de Aragon', 'de Navarra', 'de Portugal', 'de Barcelona', 'de Galicia', 'de Asturias', 'de Toledo', 'de Burgos'],
  },
};

export const TRAITS: Record<TraitId, { name: string; description: string; effects: Partial<Record<keyof Character['skills'] | 'health' | 'fertility', number>> }> = {
  brave: { name: 'Brave', description: 'Courageous in battle', effects: { martial: 2 } },
  craven: { name: 'Craven', description: 'Cowardly and fearful', effects: { martial: -2 } },
  ambitious: { name: 'Ambitious', description: 'Desires power and glory', effects: { diplomacy: 1, intrigue: 1 } },
  content: { name: 'Content', description: 'Satisfied with their lot', effects: { stewardship: 1 } },
  cruel: { name: 'Cruel', description: 'Takes pleasure in suffering', effects: { intrigue: 1, diplomacy: -1 } },
  kind: { name: 'Kind', description: 'Compassionate and caring', effects: { diplomacy: 2 } },
  greedy: { name: 'Greedy', description: 'Obsessed with wealth', effects: { stewardship: 1, diplomacy: -1 } },
  generous: { name: 'Generous', description: 'Freely gives to others', effects: { diplomacy: 1, stewardship: -1 } },
  lustful: { name: 'Lustful', description: 'Driven by desire', effects: { fertility: 20, intrigue: -1 } },
  chaste: { name: 'Chaste', description: 'Abstains from carnal pleasure', effects: { fertility: -15, learning: 1 } },
  wrathful: { name: 'Wrathful', description: 'Quick to anger', effects: { martial: 2, diplomacy: -1 } },
  patient: { name: 'Patient', description: 'Calm and measured', effects: { learning: 1, intrigue: 1 } },
  deceitful: { name: 'Deceitful', description: 'A master of lies', effects: { intrigue: 3, diplomacy: -2 } },
  honest: { name: 'Honest', description: 'Always speaks the truth', effects: { diplomacy: 2, intrigue: -2 } },
  proud: { name: 'Proud', description: 'Arrogant and haughty', effects: { martial: 1, diplomacy: -1 } },
  humble: { name: 'Humble', description: 'Modest and unassuming', effects: { learning: 1 } },
  genius: { name: 'Genius', description: 'Brilliant mind', effects: { diplomacy: 3, martial: 3, stewardship: 3, intrigue: 3, learning: 5 } },
  imbecile: { name: 'Imbecile', description: 'Dull-witted', effects: { diplomacy: -3, martial: -3, stewardship: -3, intrigue: -3, learning: -5 } },
  strong: { name: 'Strong', description: 'Physically powerful', effects: { martial: 2, health: 10, fertility: 10 } },
  weak: { name: 'Weak', description: 'Frail and sickly', effects: { martial: -2, health: -10, fertility: -5 } },
  beautiful: { name: 'Beautiful', description: 'Strikingly attractive', effects: { diplomacy: 2, fertility: 15 } },
  ugly: { name: 'Ugly', description: 'Unpleasant to look upon', effects: { diplomacy: -1, fertility: -10 } },
  fertile: { name: 'Fertile', description: 'Blessed with fecundity', effects: { fertility: 30 } },
  barren: { name: 'Barren', description: 'Unable to bear children', effects: { fertility: -50 } },
};

export const TITLE_RANK_ORDER: TitleRank[] = ['barony', 'county', 'duchy', 'kingdom', 'empire'];

export const TITLE_RANK_NAMES: Record<TitleRank, { male: string; female: string }> = {
  barony: { male: 'Baron', female: 'Baroness' },
  county: { male: 'Count', female: 'Countess' },
  duchy: { male: 'Duke', female: 'Duchess' },
  kingdom: { male: 'King', female: 'Queen' },
  empire: { male: 'Emperor', female: 'Empress' },
};

export function getCharacterAge(character: Character, currentWeek: number): number {
  const weeks = (character.alive ? currentWeek : character.deathWeek!) - character.birthWeek;
  return Math.floor(weeks / 52);
}

export function getCharacterTitle(character: Character, titles: Record<string, Title>): string | null {
  if (!character.primaryTitleId) return null;
  const title = titles[character.primaryTitleId];
  if (!title) return null;
  const rankName = TITLE_RANK_NAMES[title.rank];
  return character.sex === 'male' ? rankName.male : rankName.female;
}

export function formatWeekAsDate(week: number): string {
  const year = 867 + Math.floor(week / 52);
  const weekOfYear = (week % 52) + 1;
  const month = Math.floor((weekOfYear - 1) / 4.33);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[month]} ${year}`;
}
