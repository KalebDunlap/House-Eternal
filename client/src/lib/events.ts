import { type GameEvent, type EventEffect, type Character, getCharacterAge, type TraitId } from './gameTypes';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export interface EventTemplate {
  type: string;
  title: string;
  description: string;
  weight: number;
  minAge?: number;
  maxAge?: number;
  requiresSpouse?: boolean;
  requiresChildren?: boolean;
  requiresTrait?: TraitId;
  choices: {
    text: string;
    effects: EventEffect[];
  }[];
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    type: 'feast',
    title: 'A Grand Feast',
    description: 'Your court is hosting a grand feast to celebrate the harvest. Nobles from across the realm have gathered. How do you wish to proceed?',
    weight: 10,
    choices: [
      { 
        text: 'Spare no expense - this will be remembered!', 
        effects: [{ type: 'prestige', value: 25 }] 
      },
      { 
        text: 'Keep it modest and save our treasury', 
        effects: [{ type: 'skill', skill: 'stewardship', value: 1 }] 
      },
      { 
        text: 'Use this opportunity to forge alliances', 
        effects: [{ type: 'skill', skill: 'diplomacy', value: 2 }] 
      },
    ],
  },
  {
    type: 'illness',
    title: 'A Fever Takes Hold',
    description: 'You have fallen ill with a burning fever. Your physicians are concerned and suggest various treatments.',
    weight: 8,
    choices: [
      { 
        text: 'Rest and pray for recovery', 
        effects: [{ type: 'health', value: -15 }] 
      },
      { 
        text: 'Consult the court physician', 
        effects: [{ type: 'health', value: 5 }, { type: 'skill', skill: 'learning', value: 1 }] 
      },
      { 
        text: 'Ignore it and continue ruling', 
        effects: [{ type: 'health', value: -25 }, { type: 'prestige', value: 10 }] 
      },
    ],
  },
  {
    type: 'intrigue',
    title: 'Whispers at Court',
    description: 'Your spymaster brings disturbing news - there are whispers of a conspiracy against you. Some nobles may be plotting in secret.',
    weight: 7,
    choices: [
      { 
        text: 'Launch a thorough investigation', 
        effects: [{ type: 'skill', skill: 'intrigue', value: 2 }] 
      },
      { 
        text: 'Increase the guard and stay vigilant', 
        effects: [{ type: 'skill', skill: 'martial', value: 1 }, { type: 'health', value: 5 }] 
      },
      { 
        text: 'Ignore the rumors - they are beneath you', 
        effects: [{ type: 'skill', skill: 'diplomacy', value: 1 }] 
      },
    ],
  },
  {
    type: 'tournament',
    title: 'A Grand Tournament',
    description: 'Knights from across the realm have gathered for a tournament in your honor. Will you participate or merely observe?',
    weight: 6,
    minAge: 16,
    maxAge: 50,
    choices: [
      { 
        text: 'Join the joust yourself!', 
        effects: [{ type: 'skill', skill: 'martial', value: 2 }, { type: 'health', value: -10 }, { type: 'prestige', value: 15 }] 
      },
      { 
        text: 'Observe and reward the champions', 
        effects: [{ type: 'prestige', value: 10 }, { type: 'skill', skill: 'diplomacy', value: 1 }] 
      },
      { 
        text: 'Use this to scout for capable warriors', 
        effects: [{ type: 'skill', skill: 'martial', value: 1 }] 
      },
    ],
  },
  {
    type: 'birth_complication',
    title: 'A Difficult Birth',
    description: 'Your spouse is in labor, but the midwife reports complications. Difficult decisions may need to be made.',
    weight: 5,
    requiresSpouse: true,
    choices: [
      { 
        text: 'Pray for mother and child', 
        effects: [{ type: 'skill', skill: 'learning', value: 1 }] 
      },
      { 
        text: 'Summon the best physicians in the realm', 
        effects: [{ type: 'prestige', value: -5 }, { type: 'health', value: 10 }] 
      },
    ],
  },
  {
    type: 'heir_education',
    title: 'Educating the Heir',
    description: 'Your heir has come of age for formal education. How shall they be trained?',
    weight: 6,
    requiresChildren: true,
    choices: [
      { 
        text: 'Focus on martial training', 
        effects: [{ type: 'skill', skill: 'martial', value: 1 }] 
      },
      { 
        text: 'Emphasize diplomacy and courtly manners', 
        effects: [{ type: 'skill', skill: 'diplomacy', value: 1 }] 
      },
      { 
        text: 'Train them in the art of intrigue', 
        effects: [{ type: 'skill', skill: 'intrigue', value: 1 }] 
      },
      { 
        text: 'Let the scholars educate them', 
        effects: [{ type: 'skill', skill: 'learning', value: 2 }] 
      },
    ],
  },
  {
    type: 'plague',
    title: 'Plague Spreads',
    description: 'A terrible plague has struck the realm. People are dying in the streets, and fear grips the land.',
    weight: 3,
    choices: [
      { 
        text: 'Quarantine the affected areas', 
        effects: [{ type: 'health', value: -5 }, { type: 'skill', skill: 'stewardship', value: 2 }] 
      },
      { 
        text: 'Flee to the countryside', 
        effects: [{ type: 'health', value: 10 }, { type: 'prestige', value: -20 }] 
      },
      { 
        text: 'Stay and care for your people', 
        effects: [{ type: 'health', value: -20 }, { type: 'prestige', value: 30 }, { type: 'trait', trait: 'kind' }] 
      },
    ],
  },
  {
    type: 'assassination_attempt',
    title: 'Assassin in the Night!',
    description: 'An assassin was caught trying to sneak into your chambers! Thankfully, your guards intervened in time.',
    weight: 4,
    choices: [
      { 
        text: 'Execute the assassin publicly', 
        effects: [{ type: 'prestige', value: 10 }, { type: 'trait', trait: 'cruel' }] 
      },
      { 
        text: 'Interrogate them for information', 
        effects: [{ type: 'skill', skill: 'intrigue', value: 3 }] 
      },
      { 
        text: 'Show mercy and imprison them', 
        effects: [{ type: 'skill', skill: 'diplomacy', value: 1 }, { type: 'trait', trait: 'kind' }] 
      },
    ],
  },
  {
    type: 'scholar_visit',
    title: 'A Learned Scholar Arrives',
    description: 'A renowned scholar from distant lands has arrived at your court, seeking patronage. They offer to share their knowledge.',
    weight: 5,
    choices: [
      { 
        text: 'Become their patron', 
        effects: [{ type: 'skill', skill: 'learning', value: 3 }, { type: 'prestige', value: 5 }] 
      },
      { 
        text: 'Listen but do not commit', 
        effects: [{ type: 'skill', skill: 'learning', value: 1 }] 
      },
      { 
        text: 'Ask them to train your administrators', 
        effects: [{ type: 'skill', skill: 'stewardship', value: 2 }] 
      },
    ],
  },
  {
    type: 'ambitious_vassal',
    title: 'Ambitious Vassal',
    description: 'One of your vassals has been making bold moves, seeking to expand their influence. Some see them as a threat to your authority.',
    weight: 5,
    choices: [
      { 
        text: 'Remind them of their place', 
        effects: [{ type: 'skill', skill: 'martial', value: 1 }, { type: 'trait', trait: 'proud' }] 
      },
      { 
        text: 'Befriend them and keep enemies closer', 
        effects: [{ type: 'skill', skill: 'diplomacy', value: 2 }] 
      },
      { 
        text: 'Watch them carefully', 
        effects: [{ type: 'skill', skill: 'intrigue', value: 2 }] 
      },
    ],
  },
  {
    type: 'religious_festival',
    title: 'Holy Day Celebrations',
    description: 'A major religious festival approaches. The clergy expects your participation and generous donations.',
    weight: 6,
    choices: [
      { 
        text: 'Make a grand offering', 
        effects: [{ type: 'prestige', value: 15 }, { type: 'skill', skill: 'diplomacy', value: 1 }] 
      },
      { 
        text: 'Participate modestly', 
        effects: [{ type: 'skill', skill: 'learning', value: 1 }] 
      },
      { 
        text: 'Focus on the feast instead', 
        effects: [{ type: 'health', value: 5 }] 
      },
    ],
  },
  {
    type: 'hunting_accident',
    title: 'Hunting Mishap',
    description: 'During a hunt, you had a close call with a wild boar. Your quick reflexes saved you, but it was a narrow escape.',
    weight: 4,
    minAge: 16,
    maxAge: 55,
    choices: [
      { 
        text: 'Continue the hunt more carefully', 
        effects: [{ type: 'skill', skill: 'martial', value: 1 }, { type: 'health', value: -5 }] 
      },
      { 
        text: 'Return to the castle - hunting is too dangerous', 
        effects: [{ type: 'health', value: 5 }] 
      },
      { 
        text: 'Track down that boar personally', 
        effects: [{ type: 'skill', skill: 'martial', value: 2 }, { type: 'health', value: -10 }, { type: 'trait', trait: 'brave' }] 
      },
    ],
  },
];

export function generateEvent(character: Character, currentWeek: number): GameEvent | null {
  const age = getCharacterAge(character, currentWeek);
  const hasSpouse = character.spouseIds.length > 0;
  const hasChildren = character.childrenIds.length > 0;

  const eligibleEvents = EVENT_TEMPLATES.filter(template => {
    if (template.minAge && age < template.minAge) return false;
    if (template.maxAge && age > template.maxAge) return false;
    if (template.requiresSpouse && !hasSpouse) return false;
    if (template.requiresChildren && !hasChildren) return false;
    if (template.requiresTrait && !character.traits.includes(template.requiresTrait)) return false;
    return true;
  });

  if (eligibleEvents.length === 0) return null;

  const totalWeight = eligibleEvents.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  
  for (const template of eligibleEvents) {
    roll -= template.weight;
    if (roll <= 0) {
      return {
        id: generateId(),
        type: template.type,
        title: template.title,
        description: template.description,
        week: currentWeek,
        characterId: character.id,
        choices: template.choices,
        resolved: false,
      };
    }
  }

  return null;
}
