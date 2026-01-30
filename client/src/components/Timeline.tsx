import { useGame } from '@/lib/gameContext';
import { formatWeekAsDate } from '@/lib/gameTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  Baby, 
  Skull, 
  Crown, 
  Sparkles,
  Swords,
  Eye,
  Calendar
} from 'lucide-react';

const eventIcons: Record<string, any> = {
  birth: Baby,
  death: Skull,
  marriage: Heart,
  feast: Sparkles,
  illness: Skull,
  intrigue: Eye,
  tournament: Swords,
  coronation: Crown,
  plague: Skull,
  assassination_attempt: Eye,
  scholar_visit: Calendar,
  ambitious_vassal: Crown,
  religious_festival: Sparkles,
  hunting_accident: Swords,
  birth_complication: Baby,
  heir_education: Calendar,
};

const eventStyles: Record<string, string> = {
  birth: 'bg-primary dark:bg-primary',
  death: 'bg-muted dark:bg-muted',
  marriage: 'bg-accent dark:bg-accent',
  feast: 'bg-primary dark:bg-primary',
  illness: 'bg-destructive dark:bg-destructive',
  intrigue: 'bg-secondary dark:bg-secondary',
  tournament: 'bg-accent dark:bg-accent',
  coronation: 'bg-primary dark:bg-primary',
  plague: 'bg-destructive dark:bg-destructive',
  assassination_attempt: 'bg-destructive dark:bg-destructive',
  scholar_visit: 'bg-secondary dark:bg-secondary',
  ambitious_vassal: 'bg-secondary dark:bg-secondary',
  religious_festival: 'bg-primary dark:bg-primary',
  hunting_accident: 'bg-accent dark:bg-accent',
  birth_complication: 'bg-accent dark:bg-accent',
  heir_education: 'bg-secondary dark:bg-secondary',
};

export function Timeline() {
  const { gameState, getCharacter } = useGame();

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No game loaded</p>
      </div>
    );
  }

  const events = [...gameState.eventLog].reverse().slice(0, 100);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-card">
        <h2 className="text-lg font-serif font-semibold" data-testid="text-timeline-title">Timeline</h2>
        <p className="text-sm text-muted-foreground" data-testid="text-event-count">
          {events.length} recorded events
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground" data-testid="text-no-events">No events yet</p>
              <p className="text-sm text-muted-foreground/60">
                Start the simulation to see history unfold
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
              
              <div className="space-y-4">
                {events.map((event) => {
                  const Icon = eventIcons[event.type] || Crown;
                  const bgStyle = eventStyles[event.type] || 'bg-primary dark:bg-primary';

                  return (
                    <div key={event.id} className="relative flex gap-4 pl-2" data-testid={`event-${event.id}`}>
                      <div className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full ${bgStyle} text-primary-foreground`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      
                      <Card className="flex-1">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-medium text-sm" data-testid={`event-title-${event.id}`}>{event.title}</h3>
                            <Badge variant="outline" className="text-[10px] shrink-0" data-testid={`event-date-${event.id}`}>
                              {formatWeekAsDate(event.week)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground" data-testid={`event-desc-${event.id}`}>
                            {event.description}
                          </p>
                          {event.choices && event.chosenIndex !== undefined && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs" data-testid={`event-choice-${event.id}`}>
                                Chose: {event.choices[event.chosenIndex].text}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
