import { useState } from 'react';
import { useGame } from '@/lib/gameContext';
import { CULTURES, type CultureId, type Sex } from '@/lib/gameTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Crown, Play, Upload, Trash2 } from 'lucide-react';

export function MainMenu() {
  const { startNewGame, loadGame, hasSave, deleteSave } = useGame();
  
  const [dynastyName, setDynastyName] = useState('');
  const [rulerName, setRulerName] = useState('');
  const [culture, setCulture] = useState<CultureId>('anglo');
  const [sex, setSex] = useState<Sex>('male');
  const [showNewGame, setShowNewGame] = useState(false);

  const handleStartGame = () => {
    if (!dynastyName.trim() || !rulerName.trim()) return;
    startNewGame(dynastyName.trim(), rulerName.trim(), culture, sex);
  };

  const handleLoadGame = () => {
    loadGame();
  };

  const handleDeleteSave = () => {
    if (confirm('Are you sure you want to delete your saved game? This cannot be undone.')) {
      deleteSave();
    }
  };

  const canStart = dynastyName.trim().length > 0 && rulerName.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Crown className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
            House Eternal
          </h1>
          <p className="text-lg text-muted-foreground italic">
            A Dynasty Simulator
          </p>
        </div>

        {!showNewGame ? (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Button
                className="w-full h-12 text-lg"
                onClick={() => setShowNewGame(true)}
                data-testid="button-new-game"
              >
                <Play className="h-5 w-5 mr-2" />
                New Game
              </Button>

              {hasSave() && (
                <>
                  <Button
                    variant="secondary"
                    className="w-full h-12 text-lg"
                    onClick={handleLoadGame}
                    data-testid="button-load-game"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Continue Game
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-destructive"
                    onClick={handleDeleteSave}
                    data-testid="button-delete-save"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Save
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Found Your Dynasty</CardTitle>
              <CardDescription>
                Choose your ruler's name, culture, and begin your legacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dynastyName">Dynasty Name</Label>
                <Input
                  id="dynastyName"
                  placeholder="e.g., Plantagenet, von Hapsburg"
                  value={dynastyName}
                  onChange={(e) => setDynastyName(e.target.value)}
                  data-testid="input-dynasty-name"
                />
                <p className="text-xs text-muted-foreground">
                  Your house will be known as "House {dynastyName || '...'}"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rulerName">Ruler's Given Name</Label>
                <Input
                  id="rulerName"
                  placeholder="e.g., William, Eleanor"
                  value={rulerName}
                  onChange={(e) => setRulerName(e.target.value)}
                  data-testid="input-ruler-name"
                />
              </div>

              <div className="space-y-2">
                <Label>Culture</Label>
                <Select value={culture} onValueChange={(v) => setCulture(v as CultureId)}>
                  <SelectTrigger data-testid="select-culture">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CULTURES).map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Culture determines names and clothing style
                </p>
              </div>

              <div className="space-y-2">
                <Label>Ruler's Sex</Label>
                <RadioGroup
                  value={sex}
                  onValueChange={(v) => setSex(v as Sex)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" data-testid="radio-male" />
                    <Label htmlFor="male" className="cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" data-testid="radio-female" />
                    <Label htmlFor="female" className="cursor-pointer">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewGame(false)}
                  data-testid="button-back"
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canStart}
                  onClick={handleStartGame}
                  data-testid="button-start"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Begin Dynasty
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          A Mole Rat Studios original game | All progress saved locally in your browser
        </p>
      </div>
    </div>
  );
}
