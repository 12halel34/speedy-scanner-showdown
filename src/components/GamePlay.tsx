
import React, { useEffect, useState, useCallback, useRef } from 'react';
import ConveyorBelt from './ConveyorBelt';
import Scanner from './Scanner';
import GameHeader from './GameHeader';
import SelectedItemDisplay from './SelectedItemDisplay';
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
  
  useEffect(() => {
    const initialItems = getRandomItems(6).map(item => ({
      ...item,
      location: undefined
    }));
    
    setConveyorItems(initialItems);
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState.gameStatus === 'playing') {
        if (gameState.timeLeft % 10 === 0 && gameState.timeLeft > 0) {
          setSpeedMultiplier(prev => prev + 0.1);
        }
        
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
      
      setConveyorItems(prev => prev.filter(item => item.id !== selectedItem.id));
      
      const newItemsCount = Math.floor(Math.random() * 2) + 1;
      const newItems = getRandomItems(newItemsCount).map(item => ({
        ...item,
        location: undefined
      }));
      
      setConveyorItems(prev => [...prev, ...newItems]);
      setSelectedItem(null);
    }
  }, [selectedItem, onGameOver]);

  const handleItemDropOnScanner = useCallback((item: ItemType) => {
    setGameState(prev => {
      const newState = processItemScan(prev, item);
      
      if (newState.gameStatus === 'gameOver') {
        saveHighScore(newState.score);
        onGameOver(newState);
      }
      
      return newState;
    });
    
    setConveyorItems(prev => prev.filter(i => i.id !== item.id));
    
    const newItemsCount = Math.floor(Math.random() * 2) + 1;
    const newItems = getRandomItems(newItemsCount).map(item => ({
      ...item,
      location: undefined
    }));
    
    setConveyorItems(prev => [...prev, ...newItems]);
    
    setSelectedItem(null);
  }, [onGameOver]);
  
  const handleItemReachEnd = useCallback((item: ItemType) => {
    // Just remove the item and add a new one without increasing mistakes
    const newItem = getRandomItems(1)[0];
    
    setConveyorItems(prev => {
      const updatedItems = prev.filter(i => i.id !== item.id);
      
      return [...updatedItems, { ...newItem, location: undefined }];
    });
    
    // Inform the user that the item was moved back to storage - no penalty
    toast.info("Item moved back to storage!");
  }, []);
  
  useEffect(() => {
    const minItemsOnBelt = 6;
    
    if (conveyorItems.length < minItemsOnBelt) {
      const itemsToAdd = minItemsOnBelt - conveyorItems.length;
      const newItems = getRandomItems(itemsToAdd).map(item => ({
        ...item,
        location: undefined
      }));
      
      setConveyorItems(prev => [...prev, ...newItems]);
    }
  }, [conveyorItems.length]);
  
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
          
          <div className="flex justify-center mt-4">
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
