
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trophy, HelpCircle } from 'lucide-react';

interface GameMenuProps {
  onStartGame: () => void;
  highScore: number;
}

const GameMenu: React.FC<GameMenuProps> = ({ onStartGame, highScore }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          קופאית 2000
        </h1>
        <p className="text-xl text-gray-600">
          Scan items lightning fast! Beat the clock!
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-md">
        <h2 className="text-xl font-bold mb-4 flex items-center justify-center">
          <HelpCircle className="mr-2" size={20} />
          How to Play
        </h2>
        
        <ul className="text-left space-y-3 mb-6">
          <li className="flex">
            <span className="mr-2">👉</span>
            <span>Scan items by clicking on them or using the scanner button</span>
          </li>
          <li className="flex">
            <span className="mr-2">👉</span>
            <span>You have {60} seconds to scan as many items as possible</span>
          </li>
          <li className="flex">
            <span className="mr-2">⚠️</span>
            <span>Be careful! Don't scan non-supermarket items!</span>
          </li>
          <li className="flex">
            <span className="mr-2">❌</span>
            <span>3 mistakes and you're fired!</span>
          </li>
        </ul>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <Button 
          size="lg" 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-6 px-10 rounded-lg text-xl shadow-lg transform transition-all hover:scale-105"
          onClick={onStartGame}
        >
          <ShoppingCart className="mr-2" size={24} />
          START SCANNING!
        </Button>
        
        <div className="flex items-center mt-4 text-amber-600">
          <Trophy className="mr-2" size={20} />
          <span className="font-semibold">High Score:</span>
          <span className="ml-2 font-bold">{highScore}</span>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
