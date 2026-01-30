import { useGame } from '@/lib/gameContext';
import { formatWeekAsDate } from '@/lib/gameTypes';
import { Portrait } from './Portrait';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scroll, Sparkles } from 'lucide-react';

export function EventModal() {
  const { gameState, resolveEvent, getCharacter, setSpeed } = useGame();

  if (!gameState) return null;

  const pendingEvent = gameState.events[0];
  if (!pendingEvent) return null;

  const character = getCharacter(pendingEvent.characterId);
  if (!character) return null;

  const handleChoice = (index: number) => {
    resolveEvent(pendingEvent.id, index);
  };

  return (
    <Dialog open={true} onOpenChange={() => setSpeed(0)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Scroll className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="text-xs">
              {formatWeekAsDate(pendingEvent.week)}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-serif">
            {pendingEvent.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 my-4">
          <Portrait
            portrait={character.portrait}
            sex={character.sex}
            culture={character.culture}
            rank={character.primaryTitleId ? gameState.titles[character.primaryTitleId]?.rank : null}
            alive={character.alive}
            size="lg"
          />
          <div className="flex-1">
            <DialogDescription className="text-base leading-relaxed whitespace-pre-wrap">
              {pendingEvent.description}
            </DialogDescription>
          </div>
        </div>

        {pendingEvent.choices && pendingEvent.choices.length > 0 && (
          <div className="space-y-2 mt-4">
            {pendingEvent.choices.map((choice, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => handleChoice(index)}
                data-testid={`event-choice-${index}`}
              >
                <Sparkles className="h-4 w-4 mr-3 text-primary shrink-0" />
                <span>{choice.text}</span>
              </Button>
            ))}
          </div>
        )}

        {(!pendingEvent.choices || pendingEvent.choices.length === 0) && (
          <Button
            className="w-full mt-4"
            onClick={() => resolveEvent(pendingEvent.id, 0)}
            data-testid="event-acknowledge"
          >
            Acknowledge
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
