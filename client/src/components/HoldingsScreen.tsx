import { useGame } from '@/lib/gameContext';
import { TITLE_RANK_NAMES, TITLE_RANK_ORDER, type Title, type Holding } from '@/lib/gameTypes';
import { Portrait } from './Portrait';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Castle, Coins, Users, TrendingUp, Shield, Crown } from 'lucide-react';

export function HoldingsScreen() {
  const { gameState, selectCharacter, getCharacter, getPlayerCharacter } = useGame();

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No game loaded</p>
      </div>
    );
  }

  const player = getPlayerCharacter();
  if (!player) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No player character</p>
      </div>
    );
  }

  const playerTitles = Object.values(gameState.titles).filter(t => t.holderId === player.id);
  const playerHoldings = Object.values(gameState.holdings).filter(h => 
    playerTitles.some(t => t.id === h.titleId)
  );

  const totalIncome = playerHoldings.reduce((sum, h) => sum + h.income, 0);
  const totalLevies = playerHoldings.reduce((sum, h) => sum + h.levies, 0);
  const avgDevelopment = playerHoldings.length > 0 
    ? playerHoldings.reduce((sum, h) => sum + h.development, 0) / playerHoldings.length 
    : 0;

  const vassals = Object.values(gameState.characters).filter(c => 
    c.alive && 
    c.id !== player.id && 
    c.primaryTitleId && 
    gameState.titles[c.primaryTitleId]?.dejureLiegeId === player.primaryTitleId
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-card">
        <h2 className="text-lg font-serif font-semibold">Holdings & Vassals</h2>
        <p className="text-sm text-muted-foreground">
          Manage your realm's lands and subjects
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-yellow-500/20">
                    <Coins className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                    <p className="text-2xl font-bold">{totalIncome}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-red-500/20">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Levies</p>
                    <p className="text-2xl font-bold">{totalLevies}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-green-500/20">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Development</p>
                    <p className="text-2xl font-bold">{avgDevelopment.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Titles ({playerTitles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {playerTitles.length === 0 ? (
                <p className="text-muted-foreground text-sm">No titles held</p>
              ) : (
                <div className="space-y-3">
                  {playerTitles
                    .sort((a, b) => TITLE_RANK_ORDER.indexOf(b.rank) - TITLE_RANK_ORDER.indexOf(a.rank))
                    .map(title => {
                      const holding = playerHoldings.find(h => h.titleId === title.id);
                      const rankName = TITLE_RANK_NAMES[title.rank][player.sex];
                      
                      return (
                        <div 
                          key={title.id} 
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <Castle className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{title.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {rankName}
                              </Badge>
                            </div>
                          </div>
                          {holding && (
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Coins className="h-3.5 w-3.5 text-yellow-600" />
                                <span>{holding.income}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Shield className="h-3.5 w-3.5 text-red-600" />
                                <span>{holding.levies}</span>
                              </div>
                              <div className="flex items-center gap-1 w-20">
                                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                                <Progress value={holding.development * 10} className="h-1.5 flex-1" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Vassals ({vassals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vassals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No vassals</p>
                  <p className="text-sm text-muted-foreground/60">
                    Expand your realm to gain vassals
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vassals.map(vassal => {
                    const vassalTitle = vassal.primaryTitleId 
                      ? gameState.titles[vassal.primaryTitleId] 
                      : null;
                    const vassalHoldings = Object.values(gameState.holdings).filter(h =>
                      vassalTitle && h.titleId === vassalTitle.id
                    );
                    const vassalIncome = vassalHoldings.reduce((sum, h) => sum + h.income, 0);
                    const vassalLevies = vassalHoldings.reduce((sum, h) => sum + h.levies, 0);
                    const opinion = vassal.opinions[player.id] ?? 0;

                    return (
                      <div 
                        key={vassal.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-md cursor-pointer hover-elevate"
                        onClick={() => selectCharacter(vassal.id)}
                        data-testid={`vassal-${vassal.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Portrait
                            portrait={vassal.portrait}
                            sex={vassal.sex}
                            culture={vassal.culture}
                            rank={vassalTitle?.rank}
                            alive={vassal.alive}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium">{vassal.name}</p>
                            {vassalTitle && (
                              <Badge variant="outline" className="text-xs">
                                {TITLE_RANK_NAMES[vassalTitle.rank][vassal.sex]}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge 
                            variant={opinion >= 0 ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {opinion >= 0 ? '+' : ''}{opinion}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Coins className="h-3.5 w-3.5 text-yellow-600" />
                            <span>{Math.floor(vassalIncome * 0.2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="h-3.5 w-3.5 text-red-600" />
                            <span>{Math.floor(vassalLevies * 0.2)}</span>
                          </div>
                        </div>
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
