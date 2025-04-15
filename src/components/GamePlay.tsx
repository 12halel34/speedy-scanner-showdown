
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
  const itemProcessingRef = useRef<Set<string>>(new Set());
  const minConveyorItems = 12;
  const maxConveyorItems = 16;
  const lastScannedPositionsRef = useRef<{id: string, timestamp: number}[]>([]);
  const processedItemsRef = useRef<Set<string>>(new Set());
  
  // Listen for item processing events
  useEffect(() => {
    const handleItemProcessing = (event: CustomEvent) => {
      if (event.detail && event.detail.itemId) {
        // Remove item from conveyor immediately to prevent duplication
        setConveyorItems(prev => prev.filter(i => i.id !== event.detail.itemId));
        
        // Add to processing set to prevent reprocessing
        itemProcessingRef.current.add(event.detail.itemId);
        
        // Clear from processing set after a while
        setTimeout(() => {
          itemProcessingRef.current.delete(event.detail.itemId);
        }, 5000);
      }
    };
    
    document.addEventListener('itemBeingProcessed' as any, handleItemProcessing as EventListener);
    
    return () => {
      document.removeEventListener('itemBeingProcessed' as any, handleItemProcessing as EventListener);
    };
  }, []);
  
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
      
      // Use a staggered approach to add items to prevent batch creation
      const addItems = () => {
        try {
          const newItem = getRandomItems(1)[0];
          const newItemWithId = {
            ...newItem,
            id: `${newItem.id || newItem.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            location: undefined
          };
          
          // Only add if this ID isn't already being processed
          if (!itemProcessingRef.current.has(newItemWithId.id)) {
            setConveyorItems(prev => [...prev, newItemWithId]);
          }
          
          if (itemsToAdd > 1) {
            setTimeout(addItems, 300);
          }
        } catch (error) {
          console.error("Error adding new item:", error);
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
    if (item.id && processedItemsRef.current.has(item.id + "_processed")) {
      console.log("Prevented duplicate processing of item:", item.id);
      return;
    }
    
    if (item.id) {
      processedItemsRef.current.add(item.id + "_processed");
      
      // Clear from processed set after some time
      setTimeout(() => {
        processedItemsRef.current.delete(item.id + "_processed");
      }, 5000);
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
    
    // Then add a new item with a delay to prevent rapid appearance
    const newItemsCount = 1;
    
    setTimeout(() => {
      try {
        const newItems = getRandomItems(newItemsCount).map(item => ({
          ...item,
          id: `${item.id || item.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          location: undefined
        }));
        
        setConveyorItems(prev => [...prev, ...newItems]);
      } catch (error) {
        console.error("Error adding replacement items:", error);
      }
    }, 1000);
    
    setSelectedItem(null);
  };

  const handleItemDropOnScanner = useCallback((item: ItemType) => {
    // Check if already in processed items
    if (item.id && processedItemsRef.current.has(item.id + "_dropped")) {
      console.log("Prevented duplicate drop handling:", item.id);
      return;
    }
    
    // Add to processed set with drop-specific marker
    if (item.id) {
      processedItemsRef.current.add(item.id + "_dropped");
      
      // Clear from processed set after some time
      setTimeout(() => {
        processedItemsRef.current.delete(item.id + "_dropped");
      }, 3000);
    }
    
    // Process the item after a short delay
    setTimeout(() => {
      try {
        processSelectedItem(item);
      } catch (error) {
        console.error("Error processing dropped item:", error);
      }
    }, 100);
  }, []);
  
  const handleItemReachEnd = useCallback((item: ItemType) => {
    // Make sure we're not trying to remove an item that's already being processed
    if (item.id && itemProcessingRef.current.has(item.id)) {
      return;
    }
    
    setConveyorItems(prev => prev.filter(i => i.id !== item.id));
    
    setTimeout(() => {
      try {
        const newItem = getRandomItems(1)[0];
        const newItemWithId = {
          ...newItem,
          id: `${newItem.id || newItem.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          location: undefined
        };
        
        setConveyorItems(prev => [...prev, newItemWithId]);
      } catch (error) {
        console.error("Error adding replacement item:", error);
      }
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
