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
  isMarketItem
} from '@/utils/gameLogic';
import { toast } from 'sonner';

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
  
  // Separate market and non-market items
  const marketItems = gameState.items.filter(item => isMarketItem(item));
  const nonMarketItems = gameState.items.filter(item => !isMarketItem(item));
  
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
        {/* Left Column - Non-supermarket elements */}
        <div className="w-full md:w-1/3 order-2 md:order-1">
          {/* Non-market items */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-center mb-2">Non-Market Items</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              {nonMarketItems.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {nonMarketItems.map(item => (
                    <div 
                      key={`nonmarket-${item.id}`}
                      className="bg-red-100 p-2 rounded-lg cursor-pointer"
                      onClick={() => handleScanItem(item)}
                    >
                      <div className="text-2xl">{item.image}</div>
                      <div className="text-xs">{item.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center">No non-market items</div>
              )}
            </div>
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
        <div className="w-full md:w-2/3 order-1 md:order-2 flex flex-col">
          {/* Selected Item Display */}
          <SelectedItemDisplay selectedItem={selectedItem} />
          
          {/* Conveyor Belt - Now only showing market items */}
          <ConveyorBelt 
            items={marketItems} 
            onScanItem={handleScanItem} 
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
