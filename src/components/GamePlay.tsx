
import React, { useEffect, useState, useCallback } from 'react';
import ConveyorBelt from './ConveyorBelt';
import Scanner from './Scanner';
import { Item as ItemType, GameState } from '@/types/game';
import { 
  processItemScan, 
  updateGameTime,
  initialGameState,
  saveHighScore
} from '@/utils/gameLogic';
import { Clock, Zap, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GamePlayProps {
  initialState: GameState;
  onGameOver: (finalState: GameState) => void;
}

const GamePlay: React.FC<GamePlayProps> = ({ initialState, onGameOver }) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
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
      
      {/* Shopping Basket Preview (could be implemented in a future version) */}
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
