import { useGame } from '@/lib/gameContext';
import { type Character, getCharacterAge, getCharacterTitle, CULTURES } from '@/lib/gameTypes';
import { Portrait } from './Portrait';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Skull, Heart, Users } from 'lucide-react';
import React, { useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';

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
  isFirstChild?: boolean;
  isLastChild?: boolean;
  isOnlyChild?: boolean;
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
  isFirstChild,
  isLastChild,
  isOnlyChild,
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
    <div className="flex flex-col items-center relative">
      <div className="flex items-center">
        <Card 
          className={`p-0 cursor-pointer transition-all hover-elevate border-2 bg-[#F3E6D5] overflow-visible ${
            !character.alive ? 'opacity-60 border-muted grayscale' : 
            isPlayerDynasty ? 'border-[#C1A173]' : 'border-transparent'
          }`}
          style={{ width: '180px' }}
          onClick={() => onSelect(character.id)}
          data-testid={`tree-node-${character.id}`}
        >
          <div className="flex items-center p-2 gap-3 relative">
            {hasChildren && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute -left-8 top-1/2 -translate-y-1/2 h-6 w-6 shrink-0 bg-[#F3E6D5] border border-[#C1A173] rounded-sm hover:bg-[#E8D9C5]"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(character.id);
                }}
                data-testid={`expand-${character.id}`}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-[#8B4513]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[#8B4513]" />
                )}
              </Button>
            )}
            <div className="shrink-0 border border-[#C1A173]/30 rounded-sm bg-white p-0.5">
              <Portrait
                portrait={character.portrait}
                sex={character.sex}
                culture={character.culture}
                rank={character.primaryTitleId ? titles[character.primaryTitleId]?.rank : null}
                alive={character.alive}
                size="sm"
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1 justify-between">
                <span className={`text-sm font-serif font-bold truncate ${!character.alive ? 'text-muted-foreground' : 'text-[#5D4037]'}`}>
                  {character.name}
                </span>
                {!character.alive && (
                  <Skull className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 flex-wrap mt-0.5">
                {title && (
                  <span className="text-[10px] font-medium text-[#8B4513] bg-[#E8D9C5] px-1 rounded-sm">
                    {title}
                  </span>
                )}
                <span className="text-[11px] text-[#795548] font-mono">
                  {age}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {spouse && (showDeceased || spouse.alive) && (
          <>
            <div className="w-8 h-1 bg-[#C1A173] flex items-center justify-center relative">
              <Heart className="h-3 w-3 text-[#C1A173] absolute fill-[#F3E6D5]" />
            </div>
            <Card 
              className={`p-0 cursor-pointer transition-all hover-elevate border-2 bg-[#F3E6D5] ${
                !spouse.alive ? 'opacity-60 grayscale' : 'border-transparent'
              }`}
              style={{ width: '150px' }}
              onClick={() => onSelect(spouse.id)}
              data-testid={`spouse-node-${spouse.id}`}
            >
              <div className="flex items-center p-2 gap-3">
                <div className="shrink-0 border border-[#C1A173]/30 rounded-sm bg-white p-0.5">
                  <Portrait
                    portrait={spouse.portrait}
                    sex={spouse.sex}
                    culture={spouse.culture}
                    rank={spouse.primaryTitleId ? titles[spouse.primaryTitleId]?.rank : null}
                    alive={spouse.alive}
                    size="sm"
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className={`text-sm font-serif font-bold truncate ${!spouse.alive ? 'text-muted-foreground' : 'text-[#5D4037]'}`}>
                    {spouse.name}
                  </span>
                  <span className="text-[11px] text-[#795548] font-mono">
                    {getCharacterAge(spouse, currentWeek)}
                  </span>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="w-1 h-6 bg-[#C1A173] mt-0" />
      )}
    </div>
  );
}

export function FamilyTree() {
  const { gameState, selectCharacter, treeExpandedNodes, setTreeExpandedNodes, toggleTreeNode } = useGame();
  const [, setLocation] = useLocation();
  const [showDeceased, setShowDeceased] = React.useState(true);

  const handleSelectCharacter = useCallback((id: string) => {
    selectCharacter(id);
    setLocation('/character');
  }, [selectCharacter, setLocation]);

  const expandAll = useCallback(() => {
    if (!gameState) return;
    const allIds = Object.keys(gameState.characters);
    setTreeExpandedNodes(new Set(allIds));
  }, [gameState, setTreeExpandedNodes]);

  const collapseAll = useCallback(() => {
    setTreeExpandedNodes(new Set());
  }, [setTreeExpandedNodes]);

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
            onSelect={handleSelectCharacter}
            expandedNodes={treeExpandedNodes}
            onToggleExpand={toggleTreeNode}
            showDeceased={showDeceased}
            depth={0}
            playerDynastyId={gameState.playerDynastyId}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
