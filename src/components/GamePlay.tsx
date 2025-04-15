
import React, { useEffect, useState, useCallback, useRef } from 'react';
import ConveyorBelt from './ConveyorBelt';
import Scanner from './Scanner';
import GameHeader from './GameHeader';
import SelectedItemDisplay from './SelectedItemDisplay';
import BasketPreview from './BasketPreview';
import { Item as ItemType, GameState } from '@/types/game';
import { 
  updateGameTime,
  saveHighScore,
  MAX_MISTAKES,
  isMarketItem
} from '@/utils/gameLogic';
import { toast } from 'sonner';
import { getRandomItems } from '@/data/items';

interface GamePlayProps {
  initialState: GameState;
  onGameOver: (finalState: GameState) => void;
}

const GamePlay: React.FC<GamePlayProps> = ({ initialState, onGameOver }) => {
  const [gameState, setGameState] = useState<GameState>({
    ...initialState,
  });
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [conveyorItems, setConveyorItems] = useState<ItemType[]>([]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [scoreAnimation, setScoreAnimation] = useState<{ amount: number, isVisible: boolean }>({ amount: 0, isVisible: false });
  const speedIncreaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const minConveyorItems = 12;
  const maxConveyorItems = 16;
  const lastScannedPositionsRef = useRef<{id: string, timestamp: number}[]>([]);
  const processedItemsRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const initialItems = getRandomItems(minConveyorItems).map(item => ({
      ...item,
      location: undefined
    }));
    
    setConveyorItems(initialItems);
    
    speedIncreaseIntervalRef.current = setInterval(() => {
      setSpeedMultiplier(prev => prev + 0.02);
    }, 1000);
    
    return () => {
      if (speedIncreaseIntervalRef.current) {
        clearInterval(speedIncreaseIntervalRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState.gameStatus === 'playing') {
        setGameState(prev => {
          const newState = updateGameTime(prev);
          
          if (newState.gameStatus === 'gameOver') {
            clearInterval(timer);
            if (speedIncreaseIntervalRef.current) {
              clearInterval(speedIncreaseIntervalRef.current);
            }
            saveHighScore(newState.score);
            onGameOver(newState);
          }
          
          return newState;
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState.gameStatus, onGameOver]);
  
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      lastScannedPositionsRef.current = lastScannedPositionsRef.current.filter(
        item => now - item.timestamp < 10000
      );
    }, 5000);
    
    // Also clean up the processed items cache occasionally
    const cleanupProcessedItems = setInterval(() => {
      if (processedItemsRef.current.size > 100) {
        processedItemsRef.current = new Set();
      }
    }, 30000);
    
    return () => {
      clearInterval(cleanupInterval);
      clearInterval(cleanupProcessedItems);
    };
  }, []);
  
  useEffect(() => {
    if (conveyorItems.length < minConveyorItems) {
      const itemsToAdd = minConveyorItems - conveyorItems.length;
      
      const addItems = () => {
        const newItem = getRandomItems(1)[0];
        const newItemWithId = {
          ...newItem,
          location: undefined
        };
        
        setConveyorItems(prev => [...prev, newItemWithId]);
        
        if (itemsToAdd > 1) {
          setTimeout(addItems, 300);
        }
      };
      
      if (itemsToAdd > 0) {
        addItems();
      }
    } else if (conveyorItems.length > maxConveyorItems) {
      setConveyorItems(prev => prev.slice(0, maxConveyorItems));
    }
  }, [conveyorItems.length]);
  
  const handleScanItem = useCallback((item: ItemType) => {
    // Check if this item has already been processed recently
    if (item.id && processedItemsRef.current.has(item.id)) {
      console.log("Preventing duplicate scan for item:", item.id);
      return;
    }
    
    // Add the item to the processed set to prevent duplicates
    if (item.id) {
      processedItemsRef.current.add(item.id);
      
      // After 2 seconds, remove from processed set to allow re-scanning
      setTimeout(() => {
        processedItemsRef.current.delete(item.id);
      }, 2000);
    }
    
    setSelectedItem(item);
  }, []);
  
  const handleScanButtonClick = useCallback(() => {
    if (selectedItem) {
      processSelectedItem(selectedItem);
    }
  }, [selectedItem]);

  const processSelectedItem = (item: ItemType) => {
    // Prevent duplicate processing
    if (item.id && processedItemsRef.current.has(item.id)) {
      console.log("Prevented duplicate processing of item:", item.id);
      return;
    }
    
    if (item.id) {
      processedItemsRef.current.add(item.id);
    }
    
    const fullItem = item.id && !item.name ? 
      conveyorItems.find(i => i.id === item.id) || item : 
      item;
    
    if (!fullItem.name) {
      toast.error("Couldn't identify the item!");
      return;
    }
    
    if (isMarketItem(fullItem)) {
      const scoreIncrease = Math.floor(fullItem.price * 100);
      
      setScoreAnimation({
        amount: scoreIncrease,
        isVisible: true
      });
      
      setTimeout(() => {
        setScoreAnimation(prev => ({ ...prev, isVisible: false }));
      }, 1000);
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + scoreIncrease,
        scannedItems: [...prev.scannedItems, fullItem]
      }));
      
      toast.success(`+${scoreIncrease} points!`);
      
      lastScannedPositionsRef.current.push({
        id: fullItem.id,
        timestamp: Date.now()
      });
    } else {
      setGameState(prev => {
        const newMistakes = prev.mistakes + 1;
        const newGameStatus = newMistakes >= MAX_MISTAKES ? 'gameOver' : prev.gameStatus;
        
        if (newGameStatus === 'gameOver') {
          if (speedIncreaseIntervalRef.current) {
            clearInterval(speedIncreaseIntervalRef.current);
          }
          saveHighScore(prev.score);
          setTimeout(() => onGameOver({...prev, mistakes: newMistakes, gameStatus: 'gameOver'}), 500);
        }
        
        toast.error(`Strike ${newMistakes}/${MAX_MISTAKES}! This item doesn't belong in a supermarket!`);
        
        return {
          ...prev,
          mistakes: newMistakes,
          gameStatus: newGameStatus
        };
      });
    }
    
    setConveyorItems(prev => prev.filter(i => i.id !== fullItem.id));
    
    const newItemsCount = 1;
    
    setTimeout(() => {
      const newItems = getRandomItems(newItemsCount).map(item => ({
        ...item,
        location: undefined
      }));
      
      setConveyorItems(prev => [...prev, ...newItems]);
    }, 1000);
    
    setSelectedItem(null);
    
    // Allow reprocessing after a delay
    if (item.id) {
      setTimeout(() => {
        processedItemsRef.current.delete(item.id);
      }, 2000);
    }
  };

  const handleItemDropOnScanner = useCallback((item: ItemType) => {
    processSelectedItem(item);
  }, []);
  
  const handleItemReachEnd = useCallback((item: ItemType) => {
    setConveyorItems(prev => prev.filter(i => i.id !== item.id));
    
    setTimeout(() => {
      const newItem = getRandomItems(1)[0];
      setConveyorItems(prev => [...prev, { ...newItem, location: undefined }]);
    }, 800);
    
    toast.info("Item moved back to storage!");
  }, []);
  
  return (
    <div className="game-play p-4">
      <GameHeader 
        timeLeft={gameState.timeLeft}
        score={gameState.score}
        mistakes={gameState.mistakes}
        maxMistakes={MAX_MISTAKES}
      />

      <div className="flex flex-col mt-4">
        <div className="w-full bg-blue-50 p-4 rounded-lg min-h-[300px]">
          <h3 className="text-lg font-bold text-center mb-4">Supermarket Scanner</h3>
          
          {selectedItem && <SelectedItemDisplay selectedItem={selectedItem} />}
          
          <ConveyorBelt 
            items={conveyorItems}
            onScanItem={handleScanItem}
            onItemReachEnd={handleItemReachEnd}
            speedMultiplier={speedMultiplier}
          />
          
          <div className="flex justify-center mt-4 relative">
            {scoreAnimation.isVisible && (
              <div className="absolute top-0 transform -translate-y-full text-green-500 font-bold text-xl score-animation">
                +{scoreAnimation.amount}
              </div>
            )}
            <Scanner 
              onScan={handleScanButtonClick} 
              onItemDrop={handleItemDropOnScanner} 
            />
          </div>
          
          <BasketPreview itemCount={gameState.scannedItems.length} />
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
