
import React, { useEffect, useState, useCallback } from 'react';
import ConveyorBelt from './ConveyorBelt';
import Scanner from './Scanner';
import ThrowingLanes from './ThrowingLanes';
import { Item as ItemType, GameState } from '@/types/game';
import { 
  processItemScan, 
  updateGameTime,
  initialGameState,
  saveHighScore
} from '@/utils/gameLogic';
import { Clock, Zap, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Item from './Item';

interface GamePlayProps {
  initialState: GameState;
  onGameOver: (finalState: GameState) => void;
}

const GamePlay: React.FC<GamePlayProps> = ({ initialState, onGameOver }) => {
  const [gameState, setGameState] = useState<GameState>({
    ...initialState,
    throwableItems: [],
    thrownItems: [],
    lanes: [0, 1, 2, 3]
  });
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [selectedLane, setSelectedLane] = useState<number | null>(null);
  
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
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="game-play p-4">
      {/* Game HUD/Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <Clock className="text-gray-600 mr-2" />
          <div className="text-2xl font-bold">{formatTime(gameState.timeLeft)}</div>
        </div>
        
        <div className="flex items-center">
          <Zap className="text-amber-500 mr-2" />
          <div className="text-2xl font-bold">{gameState.score}</div>
        </div>
        
        <div className="flex items-center">
          <XCircle className="text-red-500 mr-2" />
          <div className="text-2xl font-bold">{gameState.mistakes}/3</div>
        </div>
      </div>

      {/* Throwing Lanes */}
      <ThrowingLanes 
        lanes={gameState.lanes} 
        thrownItems={gameState.thrownItems} 
      />
      
      {/* Selected Item Display */}
      <div className="flex justify-center mb-6">
        {selectedItem ? (
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <div className="text-4xl mr-4">{selectedItem.image}</div>
            <div>
              <div className="font-bold">{selectedItem.name}</div>
              {selectedItem.isScannable && (
                <div className="text-green-600">${selectedItem.price.toFixed(2)}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg text-gray-500">
            Select an item to scan
          </div>
        )}
      </div>
      
      {/* Conveyor Belt */}
      <ConveyorBelt 
        items={gameState.items} 
        onScanItem={handleScanItem} 
      />
      
      {/* Scanner Section */}
      <div className="flex justify-center mt-4">
        <Scanner onScan={handleScanButtonClick} />
      </div>
      
      {/* Throwable Items */}
      {gameState.throwableItems.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-center mb-2">Throwable Items</h3>
          <div className="flex justify-center space-x-4">
            {gameState.throwableItems.map(item => (
              <Item 
                key={`throwable-${item.id}`}
                item={item}
                onScan={() => {}}
                onThrow={handleThrowItem}
                isAnimating={false}
                isThrowable={true}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Shopping Basket Preview */}
      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          disabled
          className="text-gray-400 cursor-not-allowed"
        >
          Basket: {gameState.scannedItems.length} items
        </Button>
      </div>
    </div>
  );
};

export default GamePlay;
