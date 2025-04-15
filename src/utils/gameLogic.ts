import { GameState, Item } from '@/types/game';
import { getRandomItems, getRandomVegetables, invalidItems } from '@/data/items';
import { toast } from 'sonner';

export const GAME_TIME = 60; // 60 seconds game time
export const MAX_MISTAKES = 3; // 3 mistakes and you're out
export const INITIAL_ITEMS_COUNT = 12; // Initial items count
export const USED_POSITIONS_MEMORY = 30; // Remember 30 recently used positions

export const initialGameState: GameState = {
  score: 0,
  timeLeft: GAME_TIME,
  items: [],
  scannedItems: [],
  throwableItems: [],
  thrownItems: [],
  lanes: [],
  mistakes: 0,
  gameStatus: 'menu',
  highScore: 0
};

// Helper function to check if an item is a market item
export const isMarketItem = (item: Item): boolean => {
  // Non-supermarket items are those with category 'invalid'
  return item.category !== 'invalid';
};

// Helper to generate unique item ID
export const ensureUniqueItemId = (item: Item, existingItems: Item[]): Item => {
  if (!item.id || existingItems.some(i => i.id === item.id)) {
    return {
      ...item,
      id: `${item.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
  }
  return item;
};

// Initialize the game state
export const initGame = (): GameState => {
  const savedHighScore = localStorage.getItem('cashier2000HighScore');
  const highScore = savedHighScore ? parseInt(savedHighScore, 10) : 0;
  
  // Get initial items with different positions
  const items = getRandomItems(INITIAL_ITEMS_COUNT).map((item, index) => {
    // Calculate position to ensure items are well-spaced
    // Invalid items initially go to the wrong side (right side)
    const initialLocation: 'left' | 'right' = isMarketItem(item) ? 'right' : 'right';
    
    return { 
      ...item, 
      location: initialLocation
    };
  });
  
  return {
    ...initialGameState,
    items,
    highScore,
    lanes: [0, 1, 2, 3],
    throwableItems: [],
    thrownItems: []
  };
};

// Process an item scan
export const processItemScan = (state: GameState, item: Item): GameState => {
  // Check if item is in the correct location before scanning
  const isInCorrectLocation = (isMarketItem(item) && item.location === 'right') || 
                              (!isMarketItem(item) && item.location === 'left');

  // Check if the item should be scannable
  if (!isMarketItem(item)) {
    // Non-supermarket item
    toast.error(`This ${item.name} doesn't belong in the shopping cart!`);
    return {
      ...state,
      mistakes: state.mistakes + 1,
      gameStatus: state.mistakes + 1 >= MAX_MISTAKES ? 'gameOver' : state.gameStatus
    };
  }

  if (!item.isScannable) {
    // Wrong item scanned
    toast.error("Wrong item! That doesn't belong in the cart!");
    return {
      ...state,
      mistakes: state.mistakes + 1,
      gameStatus: state.mistakes + 1 >= MAX_MISTAKES ? 'gameOver' : state.gameStatus
    };
  }
  
  // Check location only if it's a valid item
  if (!isInCorrectLocation) {
    toast.error("Item in wrong location! Move it to the correct side first!");
    return state;
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
  
  // Remove the scanned item and add new items including a higher chance of vegetables
  const updatedItems = state.items.filter(i => i.id !== item.id);
  
  // Get random items with varied distribution to ensure they appear at different positions
  const newItemsCount = Math.floor(Math.random() * 2) + 1; // 1-2 new items
  
  // Get regular items
  const newRegularItems = getRandomItems(newItemsCount)
    .map(item => ({
      ...item, 
      location: 'right' as const
    })); 
  
  // Get vegetables specifically
  const newVegetables = getRandomVegetables(Math.floor(Math.random() * 2) + 1)
    .map(item => ({
      ...item, 
      location: 'right' as const
    }));
  
  // Combine all new items - fixed to avoid using _positionOffset which doesn't exist in the Item type
  const newItems = [...updatedItems, ...newRegularItems, ...newVegetables];
  
  return {
    ...state,
    score: newScore,
    items: newItems,
    scannedItems: [...state.scannedItems, item]
  };
};

// Move an item between left and right areas
export const moveItem = (state: GameState, itemId: string, destination: 'left' | 'right'): GameState => {
  const updatedItems = state.items.map(item => {
    if (item.id === itemId) {
      // If moving to the correct location based on item type
      const isCorrectMove = (isMarketItem(item) && destination === 'right') || 
                           (!isMarketItem(item) && destination === 'left');
      
      // Award points for correct sorting
      if (isCorrectMove && item.location !== destination) {
        const bonusPoints = 50;
        toast.success(`+${bonusPoints} points! Correct sorting!`);
        return {
          ...item, 
          location: destination
        };
      } else if (!isCorrectMove && item.location !== destination) {
        // Penalize for incorrect sorting
        toast.error("Wrong location for this item!");
        return item;
      }
      
      // Just move without points if it's already been in the right location before
      return { ...item, location: destination };
    }
    return item;
  });
  
  return {
    ...state,
    items: updatedItems,
    score: isMarketItem(state.items.find(i => i.id === itemId)!) === (destination === 'right') ? 
           state.score + 50 : 
           state.score
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
