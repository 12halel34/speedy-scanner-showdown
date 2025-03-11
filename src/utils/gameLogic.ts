
import { GameState, Item } from '@/types/game';
import { getRandomItems } from '@/data/items';
import { toast } from '@/components/ui/sonner';

export const GAME_TIME = 60; // 60 seconds game time
export const MAX_MISTAKES = 3; // 3 mistakes and you're out
export const INITIAL_ITEMS_COUNT = 8; // Initial number of items on the conveyor belt

export const initialGameState: GameState = {
  score: 0,
  timeLeft: GAME_TIME,
  items: [],
  scannedItems: [],
  mistakes: 0,
  gameStatus: 'menu',
  highScore: 0
};

// Initialize the game state
export const initGame = (): GameState => {
  const savedHighScore = localStorage.getItem('cashier2000HighScore');
  const highScore = savedHighScore ? parseInt(savedHighScore, 10) : 0;
  
  return {
    ...initialGameState,
    items: getRandomItems(INITIAL_ITEMS_COUNT),
    highScore
  };
};

// Process an item scan
export const processItemScan = (state: GameState, item: Item): GameState => {
  if (!item.isScannable) {
    // Wrong item scanned
    toast.error("Wrong item! That doesn't belong in the cart!");
    return {
      ...state,
      mistakes: state.mistakes + 1,
      gameStatus: state.mistakes + 1 >= MAX_MISTAKES ? 'gameOver' : state.gameStatus
    };
  }
  
  // Update the state with the scanned item
  const newScore = state.score + Math.floor(item.price * 100);
  
  // Select a random compliment for successful scan
  const compliments = [
    "Great scan!",
    "Nice job!",
    "Perfect!",
    "Keep it up!",
    `+${Math.floor(item.price * 100)} points!`
  ];
  
  const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
  toast.success(randomCompliment);
  
  // Remove the scanned item and add a new random one
  const updatedItems = state.items.filter(i => i.id !== item.id);
  const newItems = [...updatedItems, ...getRandomItems(1)];
  
  return {
    ...state,
    score: newScore,
    items: newItems,
    scannedItems: [...state.scannedItems, item]
  };
};

// Update game timer
export const updateGameTime = (state: GameState): GameState => {
  const timeLeft = state.timeLeft - 1;
  
  if (timeLeft <= 0) {
    return {
      ...state,
      timeLeft: 0,
      gameStatus: 'gameOver'
    };
  }
  
  return {
    ...state,
    timeLeft
  };
};

// Save high score
export const saveHighScore = (score: number): void => {
  const currentHighScore = localStorage.getItem('cashier2000HighScore');
  const highScore = currentHighScore ? parseInt(currentHighScore, 10) : 0;
  
  if (score > highScore) {
    localStorage.setItem('cashier2000HighScore', score.toString());
  }
};

// Achievements system
export const checkAchievements = (state: GameState): void => {
  // We'll implement this in a future version
};
