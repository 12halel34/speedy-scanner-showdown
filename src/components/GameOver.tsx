
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy, ShoppingCart } from 'lucide-react';
import { Item } from '@/types/game';

interface GameOverProps {
  score: number;
  highScore: number;
  mistakes: number;
  scannedItems: Item[];
  onRestart: () => void;
  onBackToMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ 
  score, 
  highScore, 
  mistakes, 
  scannedItems, 
  onRestart, 
  onBackToMenu 
}) => {
  const isNewHighScore = score > highScore;
  
  useEffect(() => {
    // Confetti effect for new high score could be added here in future versions
  }, []);
  
  const getGameOverMessage = () => {
    if (mistakes >= 3) {
      return "You're fired! Too many mistakes!";
    } else {
      return "Time's up! Great job!";
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Game Over</h1>
      <h2 className="text-2xl text-gray-700 mb-8">{getGameOverMessage()}</h2>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 w-full max-w-md">
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-lg bg-gray-100">
            <div className="text-xl">Your Score</div>
            <div className="text-4xl font-bold text-blue-600">{score}</div>
          </div>
          
          {isNewHighScore && (
            <div className="text-amber-500 font-bold text-xl flex items-center justify-center">
              <Trophy className="mr-2" />
              New High Score!
            </div>
          )}
          
          <div className="flex justify-between p-4 bg-gray-100 rounded-lg">
            <div>
              <div className="text-gray-600">Items Scanned</div>
              <div className="text-2xl font-bold">{scannedItems.length}</div>
            </div>
            <div>
              <div className="text-gray-600">Mistakes</div>
              <div className="text-2xl font-bold">{mistakes}/3</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onBackToMenu}
          className="font-semibold"
        >
          <ShoppingCart className="mr-2" size={18} />
          Main Menu
        </Button>
        
        <Button
          size="lg"
          onClick={onRestart}
          className="bg-green-500 hover:bg-green-600 font-semibold"
        >
          <RotateCcw className="mr-2" size={18} />
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default GameOver;
