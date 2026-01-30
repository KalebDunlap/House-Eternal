import { useGame } from '@/lib/gameContext';
import { useLocation } from 'wouter';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch, 
  User, 
  Clock, 
  Crown, 
  Castle,
  Users,
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Family Tree', icon: GitBranch },
  { path: '/character', label: 'Character', icon: User },
  { path: '/court', label: 'Court & Nobles', icon: Users },
  { path: '/timeline', label: 'Timeline', icon: Clock },
  { path: '/succession', label: 'Succession', icon: Crown },
  { path: '/holdings', label: 'Holdings', icon: Castle },
];

export function AppSidebar() {
  const { gameState, getPlayerDynasty } = useGame();
  const [location, setLocation] = useLocation();
  
  if (!gameState) return null;

  const dynasty = getPlayerDynasty();
  const livingMembers = Object.values(gameState.characters).filter(
    c => c.dynastyId === gameState.playerDynastyId && c.alive
  ).length;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <h1 className="text-lg font-serif font-bold text-sidebar-primary">
          House Eternal
        </h1>
        <p className="text-xs text-sidebar-foreground/60 italic">
          A Dynasty Simulator
        </p>
      </SidebarHeader>

      {dynasty && (
        <div className="p-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: dynasty.coatOfArms.primaryColor }}
              data-testid="dynasty-crest"
            >
              {dynasty.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground" data-testid="text-dynasty-name">
                House {dynasty.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60" data-testid="text-member-count">
                {livingMembers} living member{livingMembers !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs bg-sidebar-accent/50 text-sidebar-foreground border-sidebar-border" data-testid="badge-prestige">
              Prestige: {dynasty.prestige}
            </Badge>
          </div>
        </div>
      )}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <a 
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          setLocation(item.path);
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {gameState.events.length > 0 && (
        <SidebarFooter className="p-3 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 mb-2">Pending Events</p>
          <Badge className="bg-accent text-accent-foreground w-full justify-center" data-testid="badge-pending-events">
            {gameState.events.length} Event{gameState.events.length > 1 ? 's' : ''}
          </Badge>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
