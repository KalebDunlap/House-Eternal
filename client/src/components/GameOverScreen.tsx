import { useGame } from '@/lib/gameContext';
import { formatWeekAsDate } from '@/lib/gameTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skull, RotateCcw, Home } from 'lucide-react';

export function GameOverScreen() {
  const { gameState, deleteSave } = useGame();

  if (!gameState || !gameState.gameOver) return null;

  const handleNewGame = () => {
    deleteSave();
    window.location.reload();
  };

  const dynasty = gameState.dynasties[gameState.playerDynastyId];
  const totalMembers = Object.values(gameState.characters).filter(
    c => c.dynastyId === gameState.playerDynastyId
  ).length;
  const yearsPlayed = Math.floor(gameState.currentWeek / 52);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
              <Skull className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">Dynasty Extinguished</CardTitle>
          <CardDescription className="text-base">
            {gameState.gameOverReason}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-md p-4 mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dynasty</span>
              <span className="font-medium">House {dynasty?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Years Ruled</span>
              <span className="font-medium">{yearsPlayed} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Members</span>
              <span className="font-medium">{totalMembers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Final Prestige</span>
              <span className="font-medium">{dynasty?.prestige || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Final Date</span>
              <span className="font-medium">{formatWeekAsDate(gameState.currentWeek)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={handleNewGame}
              data-testid="button-new-game-over"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Start New Dynasty
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
