import { useState, useMemo } from 'react';
import { useGame } from '@/lib/gameContext';
import { getCharacterAge, CULTURES, type Character } from '@/lib/gameTypes';
import { Portrait } from './Portrait';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Heart, Search, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarriageDialogProps {
  character: Character;
}

export function MarriageDialog({ character }: MarriageDialogProps) {
  const { gameState, arrangeMarriage, getCharacter } = useGame();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const eligiblePartners = useMemo(() => {
    if (!gameState) return [];

    const currentAge = getCharacterAge(character, gameState.currentWeek);
    if (currentAge < 16) return [];

    return Object.values(gameState.characters).filter(c => {
      if (c.id === character.id) return false;
      if (!c.alive) return false;
      if (c.spouseIds.length > 0) return false;
      if (c.sex === character.sex) return false;
      
      const age = getCharacterAge(c, gameState.currentWeek);
      if (age < 16) return false;
      
      if (c.motherId === character.motherId && c.motherId) return false;
      if (c.fatherId === character.fatherId && c.fatherId) return false;
      if (c.motherId === character.id || c.fatherId === character.id) return false;
      if (character.motherId === c.id || character.fatherId === c.id) return false;
      
      return true;
    }).sort((a, b) => {
      const aDynasty = a.dynastyId && gameState.dynasties[a.dynastyId];
      const bDynasty = b.dynastyId && gameState.dynasties[b.dynastyId];
      const aPrestige = aDynasty ? aDynasty.prestige : 0;
      const bPrestige = bDynasty ? bDynasty.prestige : 0;
      return bPrestige - aPrestige;
    });
  }, [gameState, character]);

  const filteredPartners = useMemo(() => {
    if (!search.trim()) return eligiblePartners;
    const searchLower = search.toLowerCase();
    return eligiblePartners.filter(p => {
      const dynasty = p.dynastyId && gameState?.dynasties[p.dynastyId];
      const dynastyName = dynasty ? dynasty.name.toLowerCase() : '';
      return p.name.toLowerCase().includes(searchLower) || dynastyName.includes(searchLower);
    });
  }, [eligiblePartners, search, gameState]);

  const handleMarriage = (partnerId: string) => {
    const success = arrangeMarriage(character.id, partnerId);
    if (success) {
      const partner = getCharacter(partnerId);
      toast({
        title: 'Marriage Arranged',
        description: `${character.name} and ${partner?.name} are now wed.`,
      });
      setOpen(false);
    } else {
      toast({
        title: 'Marriage Failed',
        description: 'The marriage could not be arranged.',
        variant: 'destructive',
      });
    }
  };

  if (!gameState) return null;
  if (!character.alive) return null;
  if (character.spouseIds.length > 0) return null;

  const age = getCharacterAge(character, gameState.currentWeek);
  if (age < 16) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-arrange-marriage">
          <Heart className="h-4 w-4 text-pink-500" />
          Arrange Marriage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Arrange Marriage for {character.name}
          </DialogTitle>
          <DialogDescription>
            Select a suitable partner from the available nobles
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or dynasty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-partner"
          />
        </div>

        <ScrollArea className="h-[300px]">
          {filteredPartners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No eligible partners found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPartners.map(partner => {
                const partnerAge = getCharacterAge(partner, gameState.currentWeek);
                const dynasty = partner.dynastyId ? gameState.dynasties[partner.dynastyId] : null;
                const culture = CULTURES[partner.culture];
                const hasTitle = partner.primaryTitleId && gameState.titles[partner.primaryTitleId];

                return (
                  <Button
                    key={partner.id}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-2"
                    onClick={() => handleMarriage(partner.id)}
                    data-testid={`partner-${partner.id}`}
                  >
                    <Portrait
                      portrait={partner.portrait}
                      sex={partner.sex}
                      culture={partner.culture}
                      rank={hasTitle ? gameState.titles[partner.primaryTitleId!].rank : null}
                      alive={partner.alive}
                      size="sm"
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{partner.name}</span>
                        {hasTitle && <Crown className="h-3 w-3 text-primary" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Age {partnerAge}</span>
                        <span className="text-border">|</span>
                        <span>{culture.name}</span>
                        {dynasty && (
                          <>
                            <span className="text-border">|</span>
                            <span>House {dynasty.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {partner.fertility}% fertility
                    </Badge>
                  </Button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
