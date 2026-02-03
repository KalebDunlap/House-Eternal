import { useGame } from '@/lib/gameContext';
import { getCharacterAge, TITLE_RANK_NAMES, type Character, type SuccessionLaw } from '@/lib/gameTypes';
import { Portrait } from './Portrait';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, ArrowDown, Skull, Info } from 'lucide-react';
import { useMemo, useState } from 'react';

const SUCCESSION_LAWS: { id: SuccessionLaw; name: string; description: string }[] = [
  { 
    id: 'primogeniture', 
    name: 'Primogeniture', 
    description: 'The eldest child and their descendants inherit before younger children (depth-first)' 
  },
  { 
    id: 'ultimogeniture', 
    name: 'Ultimogeniture', 
    description: 'The youngest child and their descendants inherit before older children' 
  },
  { 
    id: 'gavelkind', 
    name: 'Gavelkind', 
    description: 'Titles are divided equally among children' 
  },
  { 
    id: 'elective', 
    name: 'Elective', 
    description: 'Vassals vote on the next ruler based on diplomacy and stewardship' 
  },
];

export function SuccessionScreen() {
  const { gameState, selectCharacter, getPlayerCharacter, getSuccessionLine } = useGame();
  const [selectedLaw, setSelectedLaw] = useState<SuccessionLaw>('primogeniture');

  const player = getPlayerCharacter();

  const successionLine = useMemo(() => {
    if (!gameState || !player) return [];
    return getSuccessionLine(player.id, selectedLaw);
  }, [gameState, player, selectedLaw, getSuccessionLine]);

  if (!gameState || !player) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No game loaded</p>
      </div>
    );
  }

  const primaryTitle = player.primaryTitleId ? gameState.titles[player.primaryTitleId] : null;
  const rankName = primaryTitle 
    ? TITLE_RANK_NAMES[primaryTitle.rank][player.sex] 
    : null;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-card">
        <h2 className="text-lg font-serif font-semibold">Succession</h2>
        <p className="text-sm text-muted-foreground">
          Manage your dynasty's line of succession
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Current Ruler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Portrait
                  portrait={player.portrait}
                  sex={player.sex}
                  culture={player.culture}
                  rank={primaryTitle?.rank}
                  alive={player.alive}
                  size="lg"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {rankName && (
                      <Badge className="bg-primary text-primary-foreground">
                        {rankName}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-serif font-bold">{player.name}</h3>
                  <p className="text-muted-foreground">
                    Age {getCharacterAge(player, gameState.currentWeek)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Succession Law</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Select value={selectedLaw} onValueChange={(v) => setSelectedLaw(v as SuccessionLaw)}>
                  <SelectTrigger className="w-full" data-testid="select-succession-law">
                    <SelectValue placeholder="Select succession law" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUCCESSION_LAWS.map(law => (
                      <SelectItem key={law.id} value={law.id}>
                        {law.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {SUCCESSION_LAWS.find(l => l.id === selectedLaw)?.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Line of Succession</CardTitle>
            </CardHeader>
            <CardContent>
              {successionLine.length === 0 ? (
                <div className="text-center py-8">
                  <Skull className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No eligible heirs</p>
                  <p className="text-sm text-muted-foreground/60">
                    Your dynasty is at risk of extinction
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {successionLine.map((heir, index) => {
                    // Determine relationship
                    let relationship = '';
                    if (heir.fatherId === player.id || heir.motherId === player.id) {
                      relationship = heir.sex === 'male' ? 'Son' : 'Daughter';
                    } else {
                      // Check if grandchild
                      const father = heir.fatherId ? gameState.characters[heir.fatherId] : null;
                      const mother = heir.motherId ? gameState.characters[heir.motherId] : null;
                      const isGrandchild = 
                        (father && (father.fatherId === player.id || father.motherId === player.id)) ||
                        (mother && (mother.fatherId === player.id || mother.motherId === player.id));
                      
                      if (isGrandchild) {
                        relationship = heir.sex === 'male' ? 'Grandson' : 'Granddaughter';
                      } else {
                        relationship = heir.sex === 'male' ? 'Descendant (M)' : 'Descendant (F)';
                      }
                    }
                    
                    return (
                      <div key={heir.id}>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-3 h-auto p-3"
                          onClick={() => selectCharacter(heir.id)}
                          data-testid={`heir-${index}`}
                        >
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            {index + 1}
                          </div>
                          <Portrait
                            portrait={heir.portrait}
                            sex={heir.sex}
                            culture={heir.culture}
                            alive={heir.alive}
                            size="sm"
                          />
                          <div className="flex-1 text-left">
                            <p className="font-medium">{heir.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Age {getCharacterAge(heir, gameState.currentWeek)} | 
                              {' '}{relationship}
                            </p>
                          </div>
                          {index === 0 && (
                            <Badge className="bg-accent text-accent-foreground">
                              Heir Apparent
                            </Badge>
                          )}
                        </Button>
                        {index < successionLine.length - 1 && (
                          <div className="flex justify-center py-1">
                            <ArrowDown className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
