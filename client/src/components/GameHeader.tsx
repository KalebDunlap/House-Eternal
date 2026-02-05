import { useGame } from '@/lib/gameContext';
import { useTheme } from '@/lib/themeProvider';
import { formatWeekAsDate, getCharacterAge, getCharacterTitle, CULTURES } from '@/lib/gameTypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Portrait } from './Portrait';
import { Pause, Play, FastForward, Save, Moon, Sun, LogOut } from 'lucide-react';

export function GameHeader() {
  const { gameState, setSpeed, saveGame, exitGame, getPlayerCharacter, getPlayerDynasty } = useGame();
  const { theme, toggleTheme } = useTheme();

  if (!gameState) return null;

  const player = getPlayerCharacter();
  const dynasty = getPlayerDynasty();

  if (!player || !dynasty) return null;

  const playerTitle = getCharacterTitle(player, gameState.titles);
  const playerAge = getCharacterAge(player, gameState.currentWeek);

  return (
    <header className="bg-sidebar border-b border-sidebar-border px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          
          <div className="flex items-center gap-3">
            <Portrait
              portrait={player.portrait}
              sex={player.sex}
              culture={player.culture}
              rank={player.primaryTitleId ? gameState.titles[player.primaryTitleId]?.rank : null}
              alive={player.alive}
              size="md"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sidebar-foreground font-serif font-semibold" data-testid="text-player-name">
                  {playerTitle && <span className="text-sidebar-primary">{playerTitle} </span>}
                  {player.name}
                </span>
                <Badge variant="outline" className="text-xs bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border" data-testid="badge-culture">
                  {CULTURES[player.culture].name}
                </Badge>
              </div>
              <span className="text-sm text-sidebar-foreground/70" data-testid="text-player-info">
                House {dynasty.name} | Age {playerAge}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-sidebar-accent rounded-md p-1 gap-1">
            <Button
              size="icon"
              variant={gameState.speed === 0 ? 'default' : 'ghost'}
              onClick={() => setSpeed(0)}
              data-testid="button-pause"
            >
              <Pause className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={gameState.speed === 1 ? 'default' : 'ghost'}
              onClick={() => setSpeed(1)}
              data-testid="button-speed-1"
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={gameState.speed === 2 ? 'default' : 'ghost'}
              onClick={() => setSpeed(2)}
              data-testid="button-speed-2"
            >
              <FastForward className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={gameState.speed === 4 ? 'default' : 'ghost'}
              onClick={() => setSpeed(4)}
              data-testid="button-speed-4"
              className="relative"
            >
              <FastForward className="h-4 w-4" />
              <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-primary text-primary-foreground rounded-full px-1">2x</span>
            </Button>
            <Button
              size="icon"
              variant={gameState.speed === 8 ? 'default' : 'ghost'}
              onClick={() => setSpeed(8)}
              data-testid="button-speed-8"
              className="relative"
            >
              <FastForward className="h-4 w-4" />
              <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-primary text-primary-foreground rounded-full px-1">4x</span>
            </Button>
          </div>

          <div className="px-3 py-1.5 bg-sidebar-accent rounded-md">
            <span className="text-sidebar-foreground font-mono text-sm" data-testid="text-date">
              {formatWeekAsDate(gameState.currentWeek)}
            </span>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="text-sidebar-foreground"
            onClick={saveGame}
            data-testid="button-save"
          >
            <Save className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="text-sidebar-foreground"
            onClick={toggleTheme}
            data-testid="button-theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="text-sidebar-foreground"
            onClick={exitGame}
            data-testid="button-exit"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {gameState.events.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <Badge className="bg-accent text-accent-foreground animate-pulse" data-testid="badge-events-header">
            {gameState.events.length} Event{gameState.events.length > 1 ? 's' : ''} Pending
          </Badge>
        </div>
      )}
    </header>
  );
}
