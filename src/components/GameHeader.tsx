
import React from 'react';
import { Clock, Zap, XCircle } from 'lucide-react';

interface GameHeaderProps {
  timeLeft: number;
  score: number;
  mistakes: number;
  maxMistakes: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({ timeLeft, score, mistakes, maxMistakes }) => {
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
        <Clock className="text-gray-600 mr-2" />
        <div className="text-2xl font-bold">{formatTime(timeLeft)}</div>
      </div>
      
      <div className="flex items-center">
        <Zap className="text-amber-500 mr-2" />
        <div className="text-2xl font-bold">{score}</div>
      </div>
      
      <div className="flex items-center">
        <XCircle className="text-red-500 mr-2" />
        <div className="text-2xl font-bold">{mistakes}/{maxMistakes}</div>
      </div>
    </div>
  );
};

export default GameHeader;
