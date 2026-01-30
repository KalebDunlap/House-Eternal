import { Switch, Route } from 'wouter';
import { GameProvider, useGame } from './lib/gameContext';
import { ThemeProvider } from './lib/themeProvider';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MainMenu } from '@/components/MainMenu';
import { GameHeader } from '@/components/GameHeader';
import { AppSidebar } from '@/components/AppSidebar';
import { FamilyTree } from '@/components/FamilyTree';
import { CharacterSheet } from '@/components/CharacterSheet';
import { CourtScreen } from '@/components/CourtScreen';
import { Timeline } from '@/components/Timeline';
import { SuccessionScreen } from '@/components/SuccessionScreen';
import { HoldingsScreen } from '@/components/HoldingsScreen';
import { EventModal } from '@/components/EventModal';
import { GameOverScreen } from '@/components/GameOverScreen';

function GameRouter() {
  return (
    <Switch>
      <Route path="/" component={FamilyTree} />
      <Route path="/character" component={CharacterSheet} />
      <Route path="/court" component={CourtScreen} />
      <Route path="/timeline" component={Timeline} />
      <Route path="/succession" component={SuccessionScreen} />
      <Route path="/holdings" component={HoldingsScreen} />
      <Route component={FamilyTree} />
    </Switch>
  );
}

function GameLayout() {
  const { gameState } = useGame();

  if (!gameState) {
    return <MainMenu />;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <GameHeader />
          <main className="flex-1 overflow-hidden bg-background">
            <GameRouter />
          </main>
        </div>
      </div>
      {gameState.events.length > 0 && <EventModal />}
      {gameState.gameOver && <GameOverScreen />}
    </SidebarProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <TooltipProvider>
          <Toaster />
          <GameLayout />
        </TooltipProvider>
      </GameProvider>
    </ThemeProvider>
  );
}

export default App;
