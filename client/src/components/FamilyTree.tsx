import { useGame } from '@/lib/gameContext';
import { type Character, getCharacterAge, getCharacterTitle, CULTURES } from '@/lib/gameTypes';
import { Portrait } from './Portrait';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Skull, Heart, Users } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

interface TreeNodeProps {
  character: Character;
  currentWeek: number;
  titles: Record<string, any>;
  characters: Record<string, Character>;
  onSelect: (id: string) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (id: string) => void;
  showDeceased: boolean;
  depth: number;
  playerDynastyId: string;
}

function TreeNode({ 
  character, 
  currentWeek, 
  titles, 
  characters,
  onSelect, 
  expandedNodes,
  onToggleExpand,
  showDeceased,
  depth,
  playerDynastyId,
}: TreeNodeProps) {
  const children = character.childrenIds
    .map(id => characters[id])
    .filter(c => c && (showDeceased || c.alive));
  
  const hasChildren = children.length > 0;
  const isExpanded = expandedNodes.has(character.id);
  const age = getCharacterAge(character, currentWeek);
  const title = getCharacterTitle(character, titles);
  const spouse = character.spouseIds.length > 0 ? characters[character.spouseIds[0]] : null;
  const isPlayerDynasty = character.dynastyId === playerDynastyId;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <Card 
          className={`p-2 cursor-pointer transition-all hover-elevate border-2 ${
            !character.alive ? 'opacity-60 border-muted' : 
            isPlayerDynasty ? 'border-primary/50' : 'border-transparent'
          }`}
          onClick={() => onSelect(character.id)}
          data-testid={`tree-node-${character.id}`}
        >
          <div className="flex items-center gap-2">
            {hasChildren && (
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(character.id);
                }}
                data-testid={`expand-${character.id}`}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            <Portrait
              portrait={character.portrait}
              sex={character.sex}
              culture={character.culture}
              rank={character.primaryTitleId ? titles[character.primaryTitleId]?.rank : null}
              alive={character.alive}
              size="sm"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium truncate max-w-[100px] ${!character.alive ? 'text-muted-foreground line-through' : ''}`}>
                  {character.name}
                </span>
                {!character.alive && (
                  <Skull className="h-3 w-3 text-destructive flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {title && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                    {title}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {character.alive ? age : `${age}`}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {spouse && (showDeceased || spouse.alive) && (
          <>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-pink-500" />
            </div>
            <Card 
              className={`p-2 cursor-pointer transition-all hover-elevate ${
                !spouse.alive ? 'opacity-60' : ''
              }`}
              onClick={() => onSelect(spouse.id)}
              data-testid={`spouse-node-${spouse.id}`}
            >
              <div className="flex items-center gap-2">
                <Portrait
                  portrait={spouse.portrait}
                  sex={spouse.sex}
                  culture={spouse.culture}
                  rank={spouse.primaryTitleId ? titles[spouse.primaryTitleId]?.rank : null}
                  alive={spouse.alive}
                  size="sm"
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-medium truncate max-w-[80px] ${!spouse.alive ? 'text-muted-foreground line-through' : ''}`}>
                      {spouse.name}
                    </span>
                    {!spouse.alive && (
                      <Skull className="h-3 w-3 text-destructive flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {spouse.alive ? getCharacterAge(spouse, currentWeek) : getCharacterAge(spouse, currentWeek)}
                  </span>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center mt-2">
          <div className="w-px h-4 bg-border" />
          
          {children.length > 1 && (
            <div 
              className="h-px bg-border"
              style={{ width: `${Math.max((children.length - 1) * 180, 50)}px` }}
            />
          )}
          
          <div className="flex gap-4">
            {children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-border" />
                <TreeNode
                  character={child}
                  currentWeek={currentWeek}
                  titles={titles}
                  characters={characters}
                  onSelect={onSelect}
                  expandedNodes={expandedNodes}
                  onToggleExpand={onToggleExpand}
                  showDeceased={showDeceased}
                  depth={depth + 1}
                  playerDynastyId={playerDynastyId}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function FamilyTree() {
  const { gameState, selectCharacter } = useGame();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showDeceased, setShowDeceased] = useState(true);

  const toggleExpand = useCallback((id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (!gameState) return;
    const allIds = Object.keys(gameState.characters);
    setExpandedNodes(new Set(allIds));
  }, [gameState]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const dynastyFounder = useMemo(() => {
    if (!gameState) return null;
    const dynasty = gameState.dynasties[gameState.playerDynastyId];
    if (!dynasty) return null;
    return gameState.characters[dynasty.founderId];
  }, [gameState]);

  const dynastyStats = useMemo(() => {
    if (!gameState) return { living: 0, total: 0, generations: 0 };
    
    const members = Object.values(gameState.characters).filter(
      c => c.dynastyId === gameState.playerDynastyId
    );
    
    const living = members.filter(c => c.alive).length;
    const total = members.length;
    
    let maxDepth = 0;
    const getDepth = (charId: string, depth: number): number => {
      const char = gameState.characters[charId];
      if (!char) return depth;
      if (char.childrenIds.length === 0) return depth;
      return Math.max(...char.childrenIds.map(id => getDepth(id, depth + 1)));
    };
    
    if (dynastyFounder) {
      maxDepth = getDepth(dynastyFounder.id, 1);
    }
    
    return { living, total, generations: maxDepth };
  }, [gameState, dynastyFounder]);

  if (!gameState || !dynastyFounder) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Users className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No dynasty loaded</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div>
          <h2 className="text-lg font-serif font-semibold">Family Tree</h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{dynastyStats.living} living</span>
            <span className="text-border">|</span>
            <span>{dynastyStats.total} total</span>
            <span className="text-border">|</span>
            <span>{dynastyStats.generations} generations</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showDeceased ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowDeceased(!showDeceased)}
            data-testid="toggle-deceased"
          >
            <Skull className="h-3.5 w-3.5 mr-1.5" />
            {showDeceased ? 'Showing' : 'Hiding'} Deceased
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            data-testid="expand-all"
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            data-testid="collapse-all"
          >
            Collapse All
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex justify-center p-8 min-w-max">
          <TreeNode
            character={dynastyFounder}
            currentWeek={gameState.currentWeek}
            titles={gameState.titles}
            characters={gameState.characters}
            onSelect={selectCharacter}
            expandedNodes={expandedNodes}
            onToggleExpand={toggleExpand}
            showDeceased={showDeceased}
            depth={0}
            playerDynastyId={gameState.playerDynastyId}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
