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
  const scannerRef = useRef<HTMLDivElement>(null);
  
  // Initialize conveyor belt with items
  useEffect(() => {
    // Start with 6 random items on the conveyor to keep it full
    const initialItems = getRandomItems(6).map(item => ({
      ...item,
      location: undefined // Items on conveyor don't have a location yet
    }));
    
    setConveyorItems(initialItems);
  }, []);
  
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState.gameStatus === 'playing') {
        // Increase speed multiplier as time progresses - every 10 seconds
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
      
      // Remove the scanned item from the conveyor
      setConveyorItems(prev => prev.filter(item => item.id !== selectedItem.id));
      
      // Add 1-2 new random items to keep the conveyor full
      const newItemsCount = Math.floor(Math.random() * 2) + 1;
      const newItems = getRandomItems(newItemsCount).map(item => ({
        ...item,
        location: undefined
      }));
      
      setConveyorItems(prev => [...prev, ...newItems]);
      setSelectedItem(null);
    }
  }, [selectedItem, onGameOver]);

  // Handle drop on scanner
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const itemData = e.dataTransfer.getData('text/plain');
    if (itemData) {
      try {
        const item = JSON.parse(itemData) as ItemType;
        handleScanItem(item);
        
        // Simulate clicking the scan button
        setTimeout(() => {
          handleScanButtonClick();
        }, 300);
      } catch (error) {
        console.error('Error parsing dragged item:', error);
      }
    }
  }, [handleScanItem, handleScanButtonClick]);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  
  // Handle items reaching the end of the conveyor belt
  const handleItemReachEnd = useCallback((item: ItemType) => {
    // When an item reaches the end of the belt, add a new random item
    const newItem = getRandomItems(1)[0];
    
    setConveyorItems(prev => {
      // Remove the item that reached the end
      const updatedItems = prev.filter(i => i.id !== item.id);
      
      // Add a new random item
      return [...updatedItems, { ...newItem, location: undefined }];
    });
    
    // Penalize for letting an item reach the end
    setGameState(prev => ({
      ...prev,
      mistakes: prev.mistakes + 1,
      gameStatus: prev.mistakes + 1 >= MAX_MISTAKES ? 'gameOver' : prev.gameStatus
    }));
    
    toast.error("Item missed! Be faster next time!");
  }, []);
  
  // Make sure we keep the conveyor belt full
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
      {/* Game HUD/Header */}
      <GameHeader 
        timeLeft={gameState.timeLeft}
        score={gameState.score}
        mistakes={gameState.mistakes}
        maxMistakes={MAX_MISTAKES}
      />

      <div className="flex flex-col mt-4">
        {/* Supermarket section */}
        <div className="w-full bg-blue-50 p-4 rounded-lg min-h-[300px]">
          <h3 className="text-lg font-bold text-center mb-4">Supermarket Scanner</h3>
          
          {/* Selected Item Display - only show when there's a selected item */}
          {selectedItem && <SelectedItemDisplay selectedItem={selectedItem} />}
          
          {/* Conveyor Belt with automatic movement */}
          <ConveyorBelt 
            items={conveyorItems}
            onScanItem={handleScanItem}
            onItemReachEnd={handleItemReachEnd}
            speedMultiplier={speedMultiplier}
          />
          
          {/* Scanner Section with drop zone */}
          <div 
            ref={scannerRef}
            className="flex justify-center mt-4 p-4 border-2 border-dashed border-gray-400 rounded-lg hover:border-blue-500 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
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
