
import React, { useState, useCallback } from 'react';
import GameMenu from '@/components/GameMenu';
import GamePlay from '@/components/GamePlay';
import GameOver from '@/components/GameOver';
import { GameState } from '@/types/game';
import { initGame } from '@/utils/gameLogic';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(initGame());
  
  const startGame = useCallback(() => {
    setGameState({
      ...initGame(),
      gameStatus: 'playing'
    });
  }, []);
  
  const handleGameOver = useCallback((finalState: GameState) => {
    setGameState({
      ...finalState,
      gameStatus: 'gameOver'
    });
  }, []);
  
  const backToMenu = useCallback(() => {
    setGameState({
      ...initGame(),
      gameStatus: 'menu'
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="game-container py-8 px-4">
        {gameState.gameStatus === 'menu' && (
          <GameMenu 
            onStartGame={startGame} 
            highScore={gameState.highScore} 
          />
        )}
        
        {gameState.gameStatus === 'playing' && (
          <GamePlay 
            initialState={gameState} 
            onGameOver={handleGameOver} 
          />
        )}
        
        {gameState.gameStatus === 'gameOver' && (
          <GameOver 
            score={gameState.score}
            highScore={gameState.highScore}
            mistakes={gameState.mistakes}
            scannedItems={gameState.scannedItems}
            onRestart={startGame}
            onBackToMenu={backToMenu}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
