import { useGame } from '@/lib/gameContext';
import { getCharacterAge, getCharacterTitle, CULTURES, TRAITS, type Character } from '@/lib/gameTypes';
import { Portrait } from './Portrait';
import { MarriageDialog } from './MarriageDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Baby, 
  Swords, 
  Brain, 
  Coins, 
  Eye, 
  BookOpen,
  Users,
  Crown,
  ArrowLeft,
  Skull
} from 'lucide-react';

export function CharacterSheet() {
  const { 
    gameState, 
    selectedCharacterId, 
    selectCharacter, 
    getCharacter, 
    getChildren, 
    getSpouses, 
    getParents,
    setActiveScreen 
  } = useGame();

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No game loaded</p>
      </div>
    );
  }

  const character = selectedCharacterId ? getCharacter(selectedCharacterId) : null;

  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Users className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">Select a character from the family tree</p>
        <Button variant="outline" onClick={() => setActiveScreen('tree')}>
          Go to Family Tree
        </Button>
      </div>
    );
  }

  const age = getCharacterAge(character, gameState.currentWeek);
  const title = getCharacterTitle(character, gameState.titles);
  const culture = CULTURES[character.culture];
  const children = getChildren(character.id);
  const spouses = getSpouses(character.id);
  const { mother, father } = getParents(character.id);

  const skillIcons = {
    diplomacy: Brain,
    martial: Swords,
    stewardship: Coins,
    intrigue: Eye,
    learning: BookOpen,
  };

  const skillColors = {
    diplomacy: 'bg-blue-500',
    martial: 'bg-red-500',
    stewardship: 'bg-yellow-500',
    intrigue: 'bg-purple-500',
    learning: 'bg-green-500',
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => setActiveScreen('tree')}
          data-testid="back-to-tree"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Family Tree
        </Button>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <Portrait
                  portrait={character.portrait}
                  sex={character.sex}
                  culture={character.culture}
                  rank={character.primaryTitleId ? gameState.titles[character.primaryTitleId]?.rank : null}
                  alive={character.alive}
                  size="xl"
                />
                {!character.alive && (
                  <Badge variant="destructive" className="mt-2">
                    <Skull className="h-3 w-3 mr-1" />
                    Deceased
                  </Badge>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {title && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Crown className="h-3 w-3 mr-1" />
                      {title}
                    </Badge>
                  )}
                  <Badge variant="outline">{culture.name}</Badge>
                </div>

                <h1 className="text-2xl font-serif font-bold mb-1">
                  {character.name}
                </h1>
                
                {character.dynastyId && gameState.dynasties[character.dynastyId] && (
                  <p className="text-muted-foreground mb-4">
                    House {gameState.dynasties[character.dynastyId].name}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sex</p>
                    <p className="font-medium capitalize">{character.sex}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-destructive" />
                    <div className="w-24">
                      <Progress value={character.health} className="h-2" />
                    </div>
                    <span className="text-sm">{character.health}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Baby className="h-4 w-4 text-primary" />
                    <div className="w-24">
                      <Progress value={character.fertility} className="h-2" />
                    </div>
                    <span className="text-sm">{character.fertility}%</span>
                  </div>
                </div>

                {character.pregnantWith && character.alive && (
                  <Badge className="mt-4 bg-accent text-accent-foreground">
                    <Baby className="h-3 w-3 mr-1" />
                    Pregnant ({character.pregnancyWeeksRemaining} weeks remaining)
                  </Badge>
                )}

                {character.alive && character.spouseIds.length === 0 && getCharacterAge(character, gameState.currentWeek) >= 16 && (
                  <div className="mt-4">
                    <MarriageDialog character={character} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(Object.keys(character.skills) as (keyof typeof character.skills)[]).map(skill => {
                  const Icon = skillIcons[skill];
                  const value = character.skills[skill];
                  return (
                    <div key={skill} className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${skillColors[skill]}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm capitalize">{skill}</span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                        <Progress value={Math.min(value * 4, 100)} className="h-1.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Traits</CardTitle>
            </CardHeader>
            <CardContent>
              {character.traits.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {character.traits.map(traitId => {
                    const trait = TRAITS[traitId];
                    return (
                      <Badge 
                        key={traitId} 
                        variant="secondary"
                        className="cursor-help"
                        title={trait.description}
                      >
                        {trait.name}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No notable traits</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Family</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(mother || father) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Parents</p>
                  <div className="flex flex-wrap gap-2">
                    {father && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectCharacter(father.id)}
                        className="gap-2"
                        data-testid={`parent-${father.id}`}
                      >
                        <Portrait
                          portrait={father.portrait}
                          sex={father.sex}
                          culture={father.culture}
                          alive={father.alive}
                          size="sm"
                        />
                        <span>{father.name}</span>
                        {!father.alive && <Skull className="h-3 w-3 text-muted-foreground" />}
                      </Button>
                    )}
                    {mother && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectCharacter(mother.id)}
                        className="gap-2"
                        data-testid={`parent-${mother.id}`}
                      >
                        <Portrait
                          portrait={mother.portrait}
                          sex={mother.sex}
                          culture={mother.culture}
                          alive={mother.alive}
                          size="sm"
                        />
                        <span>{mother.name}</span>
                        {!mother.alive && <Skull className="h-3 w-3 text-muted-foreground" />}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {spouses.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {spouses.length === 1 ? 'Spouse' : 'Spouses'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {spouses.map(spouse => (
                        <Button
                          key={spouse.id}
                          variant="outline"
                          size="sm"
                          onClick={() => selectCharacter(spouse.id)}
                          className="gap-2"
                          data-testid={`spouse-${spouse.id}`}
                        >
                          <Portrait
                            portrait={spouse.portrait}
                            sex={spouse.sex}
                            culture={spouse.culture}
                            alive={spouse.alive}
                            size="sm"
                          />
                          <span>{spouse.name}</span>
                          {!spouse.alive && <Skull className="h-3 w-3 text-muted-foreground" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {children.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Children ({children.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {children.map(child => (
                        <Button
                          key={child.id}
                          variant="outline"
                          size="sm"
                          onClick={() => selectCharacter(child.id)}
                          className="gap-2"
                          data-testid={`child-${child.id}`}
                        >
                          <Portrait
                            portrait={child.portrait}
                            sex={child.sex}
                            culture={child.culture}
                            alive={child.alive}
                            size="sm"
                          />
                          <span>{child.name}</span>
                          {!child.alive && <Skull className="h-3 w-3 text-muted-foreground" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {!mother && !father && spouses.length === 0 && children.length === 0 && (
                <p className="text-muted-foreground text-sm">No known family relations</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
