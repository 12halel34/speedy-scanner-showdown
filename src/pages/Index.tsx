
import React, { useState, useEffect } from 'react';
import GameMenu from '@/components/GameMenu';
import GamePlay from '@/components/GamePlay';
import GameOver from '@/components/GameOver';
import UserProfile from '@/components/UserProfile';
import { GameState } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { profile, updateProfile } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: 60,
    items: [],
    scannedItems: [],
    throwableItems: [],
    thrownItems: [],
    lanes: [1, 2, 3],
    mistakes: 0,
    gameStatus: 'menu',
    highScore: profile?.highest_score || 0,
    combo: 0,
    comboMultiplier: 1,
    lastScannedCategory: '',
    lastComboTimestamp: Date.now()
  });

  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setGameState(prev => ({
        ...prev,
        highScore: profile.highest_score
      }));
    }
  }, [profile]);

  const handleStartGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      timeLeft: 60,
      items: [],
      scannedItems: [],
      throwableItems: [],
      thrownItems: [],
      mistakes: 0,
      gameStatus: 'playing',
      combo: 0,
      comboMultiplier: 1,
      lastScannedCategory: '',
      lastComboTimestamp: Date.now()
    }));
  };

  const handleGameOver = async (finalState: GameState) => {
    setGameState(finalState);
    
    // Update user profile with new stats
    if (profile) {
      const updates: any = {
        total_games_played: profile.total_games_played + 1
      };
      
      if (finalState.score > profile.highest_score) {
        updates.highest_score = finalState.score;
      }
      
      await updateProfile(updates);
    }
  };

  const handleBackToMenu = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'menu'
    }));
    setShowProfile(false);
  };

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">פרופיל משתמש</h1>
            <button
              onClick={() => setShowProfile(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              חזור למשחק
            </button>
          </div>
          <UserProfile />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-4">
        {gameState.gameStatus === 'menu' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowProfile(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                הצג פרופיל
              </button>
            </div>
            <GameMenu 
              onStartGame={handleStartGame} 
              highScore={gameState.highScore} 
            />
          </div>
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
            onRestart={handleStartGame}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
