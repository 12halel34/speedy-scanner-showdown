
import React from 'react';
import { Clock, Zap, XCircle, Star } from 'lucide-react';

interface GameHeaderProps {
  timeLeft: number;
  score: number;
  mistakes: number;
  maxMistakes: number;
  combo?: number;
  multiplier?: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({ 
  timeLeft, 
  score, 
  mistakes, 
  maxMistakes,
  combo = 0,
  multiplier = 1
}) => {
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
      
      {combo > 0 && (
        <div className="flex items-center">
          <Star className={`${combo > 5 ? 'text-yellow-500 animate-pulse' : 'text-blue-500'} mr-2`} />
          <div className="text-lg font-bold">
            <span className={`${combo > 5 ? 'text-yellow-500' : 'text-blue-500'}`}>
              {combo}× 
            </span>
            <span className="text-sm ml-1">
              ({multiplier.toFixed(1)}×)
            </span>
          </div>
        </div>
      )}
      
      <div className="flex items-center">
        <XCircle className="text-red-500 mr-2" />
        <div className="text-2xl font-bold">{mistakes}/{maxMistakes}</div>
      </div>
    </div>
  );
};

export default GameHeader;
