import React, { useEffect, useState, useCallback } from 'react';
import ConveyorBelt from './ConveyorBelt';
import Scanner from './Scanner';
import ThrowingLanes from './ThrowingLanes';
import GameHeader from './GameHeader';
import SelectedItemDisplay from './SelectedItemDisplay';
import ThrowableItemsDisplay from './ThrowableItemsDisplay';
import BasketPreview from './BasketPreview';
import { Item as ItemType, GameState } from '@/types/game';
import { 
  processItemScan, 
  updateGameTime,
  saveHighScore,
  MAX_MISTAKES,
  isMarketItem,
  moveItem
} from '@/utils/gameLogic';
import { toast } from 'sonner';
import Item from './Item';

interface GamePlayProps {
  initialState: GameState;
  onGameOver: (finalState: GameState) => void;
}

const GamePlay: React.FC<GamePlayProps> = ({ initialState, onGameOver }) => {
  const [gameState, setGameState] = useState<GameState>({
    ...initialState,
  });
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState.gameStatus === 'playing') {
        setGameState(prev => {
          const newState = updateGameTime(prev);
          
          if (newState.gameStatus === 'gameOver') {
            clearInterval(timer);
            saveHighScore(newState.score);
            onGameOver(newState);
          }
          
          return newState;
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState.gameStatus, onGameOver]);

  // Occasionally add throwable vegetables
  useEffect(() => {
    const throwableTimer = setInterval(() => {
      if (gameState.gameStatus === 'playing' && gameState.throwableItems.length < 3) {
        setGameState(prev => {
          // Find a vegetable from current items
          const vegetables = prev.items.filter(item => 
            item.category === 'vegetable' && !prev.throwableItems.some(t => t.id === item.id)
          );
          
          if (vegetables.length > 0) {
            const randomVegetable = {...vegetables[Math.floor(Math.random() * vegetables.length)], isThrowable: true};
            return {
              ...prev,
              throwableItems: [...prev.throwableItems, randomVegetable]
            };
          }
          return prev;
        });
      }
    }, 5000);
    
    return () => clearInterval(throwableTimer);
  }, [gameState.gameStatus]);
  
  // Handle scanning
  const handleScanItem = useCallback((item: ItemType) => {
    setSelectedItem(item);
  }, []);
  
  const handleScanButtonClick = useCallback(() => {
    if (selectedItem) {
      setGameState(prev => {
        const newState = processItemScan(prev, selectedItem);
        
        if (newState.gameStatus === 'gameOver') {
          saveHighScore(newState.score);
          onGameOver(newState);
        }
        
        return newState;
      });
      
      setSelectedItem(null);
    }
  }, [selectedItem, onGameOver]);

  // Handle throwing
  const handleThrowItem = useCallback((item: ItemType) => {
    setGameState(prev => {
      const updatedThrowableItems = prev.throwableItems.filter(i => i.id !== item.id);
      const randomLane = Math.floor(Math.random() * prev.lanes.length);
      const thrownItem = { ...item, lane: randomLane };
      
      // Add points for throwing
      const bonusPoints = 150;
      toast.success(`+${bonusPoints} points! Great throw!`);
      
      // After 1.5 seconds, remove the thrown item
      setTimeout(() => {
        setGameState(current => ({
          ...current,
          thrownItems: current.thrownItems.filter(i => i.id !== item.id)
        }));
      }, 1500);
      
      return {
        ...prev,
        score: prev.score + bonusPoints,
        throwableItems: updatedThrowableItems,
        thrownItems: [...prev.thrownItems, thrownItem]
      };
    });
  }, []);
  
  // Handle moving items between areas
  const handleMoveItem = useCallback((item: ItemType, destination: 'left' | 'right') => {
    setGameState(prev => moveItem(prev, item.id, destination));
  }, []);
  
  // Handle drop events
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, destination: 'left' | 'right') => {
    e.preventDefault();
    const itemData = e.dataTransfer.getData('text/plain');
    if (itemData) {
      try {
        const item = JSON.parse(itemData) as ItemType;
        handleMoveItem(item, destination);
      } catch (error) {
        console.error('Error parsing dragged item:', error);
      }
    }
  }, [handleMoveItem]);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  
  // Filter items by location
  const leftItems = gameState.items.filter(item => item.location === 'left');
  const rightItems = gameState.items.filter(item => item.location === 'right');
  
  return (
    <div className="game-play p-4">
      {/* Game HUD/Header */}
      <GameHeader 
        timeLeft={gameState.timeLeft}
        score={gameState.score}
        mistakes={gameState.mistakes}
        maxMistakes={MAX_MISTAKES}
      />

      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* Left Column - Non-supermarket items */}
        <div 
          className="w-full md:w-1/2 order-2 md:order-1 bg-red-50 p-4 rounded-lg min-h-[300px]"
          onDrop={(e) => handleDrop(e, 'left')}
          onDragOver={handleDragOver}
        >
          <h3 className="text-lg font-bold text-center mb-4">Non-Market Items (Drop Here)</h3>
          
          {/* Items already in the left zone */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {leftItems.map(item => (
              <Item 
                key={`left-${item.id}`}
                item={item}
                onScan={handleScanItem}
                onMove={handleMoveItem}
                isAnimating={false}
                isDraggable={true}
              />
            ))}
            {leftItems.length === 0 && (
              <div className="text-gray-500 text-center p-4">
                Drag non-market items here
              </div>
            )}
          </div>
          
          {/* Throwing Lanes */}
          <ThrowingLanes 
            lanes={gameState.lanes} 
            thrownItems={gameState.thrownItems} 
          />
          
          {/* Throwable Items */}
          <ThrowableItemsDisplay 
            throwableItems={gameState.throwableItems}
            onThrow={handleThrowItem}
          />
        </div>

        {/* Right Column - Supermarket elements */}
        <div 
          className="w-full md:w-1/2 order-1 md:order-2 bg-blue-50 p-4 rounded-lg min-h-[300px]"
          onDrop={(e) => handleDrop(e, 'right')}
          onDragOver={handleDragOver}
        >
          <h3 className="text-lg font-bold text-center mb-4">Market Items (Drop Here)</h3>
          
          {/* Items already in the right zone */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {rightItems.map(item => (
              <Item 
                key={`right-${item.id}`}
                item={item}
                onScan={handleScanItem}
                onMove={handleMoveItem}
                isAnimating={false}
                isDraggable={true}
              />
            ))}
            {rightItems.length === 0 && (
              <div className="text-gray-500 text-center p-4">
                Drag market items here
              </div>
            )}
          </div>
          
          {/* Selected Item Display */}
          <SelectedItemDisplay selectedItem={selectedItem} />
          
          {/* Conveyor Belt with new items */}
          <ConveyorBelt 
            items={gameState.items.filter(item => item.location === undefined)}
            onScanItem={handleScanItem}
            onMoveItem={handleMoveItem}
          />
          
          {/* Scanner Section */}
          <div className="flex justify-center mt-4">
            <Scanner onScan={handleScanButtonClick} />
          </div>
          
          {/* Shopping Basket Preview */}
          <BasketPreview itemCount={gameState.scannedItems.length} />
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
