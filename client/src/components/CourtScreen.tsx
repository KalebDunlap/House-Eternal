import { useState, useMemo } from 'react';
import { useGame } from '@/lib/gameContext';
import { getCharacterAge, CULTURES, type Character } from '@/lib/gameTypes';
import { Portrait } from './Portrait';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Users, 
  UserPlus, 
  UserMinus,
  Heart,
  Crown,
  Home,
  Castle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export function CourtScreen() {
  const { 
    gameState, 
    getCourtMembers, 
    getNonDynasticCharacters,
    inviteToCourt,
    banishFromCourt,
    grantTitle,
    selectCharacter,
    getPlayerCharacter
  } = useGame();

  const getPlayerTitles = () => {
    if (!gameState) return [];
    return Object.values(gameState.titles).filter(
      t => t.holderId === gameState.playerCharacterId && t.rank !== 'empire' && t.rank !== 'kingdom'
    );
  };

  const handleGrantTitle = (characterId: string) => {
    const titles = getPlayerTitles();
    if (titles.length > 0) {
      const title = titles[0];
      const success = grantTitle(characterId, title.id);
      if (success) {
        const char = gameState?.characters[characterId];
        toast({
          title: 'Title Granted',
          description: `${char?.name} is now the holder of ${title.name}.`,
        });
      }
    }
  };
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('court');

  const courtMembers = useMemo(() => getCourtMembers(), [getCourtMembers]);
  const allNobles = useMemo(() => getNonDynasticCharacters(), [getNonDynasticCharacters]);
  const playerChar = getPlayerCharacter();

  const filteredCourt = useMemo(() => {
    if (!search.trim()) return courtMembers;
    const searchLower = search.toLowerCase();
    return courtMembers.filter(c => {
      const dynasty = c.dynastyId && gameState?.dynasties[c.dynastyId];
      const dynastyName = dynasty ? dynasty.name.toLowerCase() : '';
      return c.name.toLowerCase().includes(searchLower) || dynastyName.includes(searchLower);
    });
  }, [courtMembers, search, gameState]);

  const filteredNobles = useMemo(() => {
    if (!search.trim()) return allNobles;
    const searchLower = search.toLowerCase();
    return allNobles.filter(c => {
      const dynasty = c.dynastyId && gameState?.dynasties[c.dynastyId];
      const dynastyName = dynasty ? dynasty.name.toLowerCase() : '';
      return c.name.toLowerCase().includes(searchLower) || dynastyName.includes(searchLower);
    });
  }, [allNobles, search, gameState]);

  const handleInvite = (characterId: string) => {
    const success = inviteToCourt(characterId);
    if (success) {
      const char = gameState?.characters[characterId];
      toast({
        title: 'Invitation Accepted',
        description: `${char?.name} has joined your court.`,
      });
    } else {
      toast({
        title: 'Invitation Failed',
        description: 'They declined the invitation.',
        variant: 'destructive',
      });
    }
  };

  const handleBanish = (characterId: string) => {
    const char = gameState?.characters[characterId];
    const success = banishFromCourt(characterId);
    if (success) {
      toast({
        title: 'Banished',
        description: `${char?.name} has been banished from court.`,
      });
    }
  };

  const handleViewCharacter = (characterId: string) => {
    selectCharacter(characterId);
    setLocation('/character');
  };

  const canArrangeMarriage = (char: Character): boolean => {
    if (!gameState || !playerChar) return false;
    if (char.spouseIds.length > 0) return false;
    const age = getCharacterAge(char, gameState.currentWeek);
    if (age < 16) return false;
    return true;
  };

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No game loaded</p>
      </div>
    );
  }

  const CharacterCard = ({ character, showInvite = false, showBanish = false, showGrantTitle = false }: { 
    character: Character; 
    showInvite?: boolean; 
    showBanish?: boolean;
    showGrantTitle?: boolean;
  }) => {
    const age = getCharacterAge(character, gameState.currentWeek);
    const culture = CULTURES[character.culture];
    const dynasty = character.dynastyId ? gameState.dynasties[character.dynastyId] : null;
    const hasTitle = character.primaryTitleId && gameState.titles[character.primaryTitleId];
    const isMarried = character.spouseIds.length > 0;
    const isAtCourt = character.atCourt === gameState.playerCharacterId;

    return (
      <Card className="hover-elevate cursor-pointer" data-testid={`character-card-${character.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div onClick={() => handleViewCharacter(character.id)}>
              <Portrait
                portrait={character.portrait}
                sex={character.sex}
                culture={character.culture}
                rank={hasTitle ? gameState.titles[character.primaryTitleId!].rank : null}
                alive={character.alive}
                size="md"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span 
                  className="font-medium cursor-pointer hover:underline"
                  onClick={() => handleViewCharacter(character.id)}
                  data-testid={`character-name-${character.id}`}
                >
                  {character.name}
                </span>
                {hasTitle && <Crown className="h-3 w-3 text-primary" />}
                {isAtCourt && (
                  <Badge variant="outline" className="text-xs">
                    <Home className="h-2 w-2 mr-1" />
                    At Court
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                <span>Age {age}</span>
                <span className="text-border">|</span>
                <span>{character.sex === 'male' ? 'Male' : 'Female'}</span>
                <span className="text-border">|</span>
                <span>{culture.name}</span>
                {dynasty && (
                  <>
                    <span className="text-border">|</span>
                    <span>House {dynasty.name}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {isMarried ? (
                  <Badge variant="secondary" className="text-xs">
                    <Heart className="h-2 w-2 mr-1" />
                    Married
                  </Badge>
                ) : canArrangeMarriage(character) && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Unmarried
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {character.fertility}% fertility
                </Badge>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewCharacter(character.id)}
                  data-testid={`view-character-${character.id}`}
                >
                  View Details
                </Button>
                {showInvite && !isAtCourt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInvite(character.id)}
                    data-testid={`invite-${character.id}`}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Invite to Court
                  </Button>
                )}
                {showBanish && isAtCourt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBanish(character.id)}
                    className="text-destructive hover:text-destructive"
                    data-testid={`banish-${character.id}`}
                  >
                    <UserMinus className="h-3 w-3 mr-1" />
                    Banish
                  </Button>
                )}
                {showGrantTitle && isAtCourt && getPlayerTitles().length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGrantTitle(character.id)}
                    data-testid={`grant-title-${character.id}`}
                  >
                    <Castle className="h-3 w-3 mr-1" />
                    Grant Title
                  </Button>
                )}
                {isAtCourt && canArrangeMarriage(character) && (
                  <MarriageDialog character={character} />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-card">
        <h2 className="text-lg font-serif font-semibold" data-testid="text-court-title">Court & Nobles</h2>
        <p className="text-sm text-muted-foreground">
          Manage your court and interact with other nobles
        </p>
      </div>

      <div className="p-4 border-b">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or dynasty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-nobles"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 border-b">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="court" data-testid="tab-court">
              <Home className="h-4 w-4 mr-2" />
              Your Court ({courtMembers.length})
            </TabsTrigger>
            <TabsTrigger value="nobles" data-testid="tab-nobles">
              <Users className="h-4 w-4 mr-2" />
              All Nobles ({allNobles.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="court" className="p-4 mt-0">
            {filteredCourt.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground" data-testid="text-empty-court">
                  {search ? 'No court members match your search' : 'Your court is empty'}
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Invite nobles from the "All Nobles" tab
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCourt.map(char => (
                  <CharacterCard key={char.id} character={char} showBanish showGrantTitle />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="nobles" className="p-4 mt-0">
            {filteredNobles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {search ? 'No nobles match your search' : 'No other nobles exist'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNobles.map(char => (
                  <CharacterCard key={char.id} character={char} showInvite />
                ))}
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
