import { GameState, Item } from '@/types/game';
import { getRandomItems as getItemsFromData, getRandomVegetables, invalidItems, marketItems } from '@/data/items';
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
  highScore: 0,
  combo: 0,
  comboMultiplier: 1,
  lastScannedCategory: ''
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
  const items = getRandomGameItems(INITIAL_ITEMS_COUNT).map((item, index) => {
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
    thrownItems: [],
    combo: 0,
    comboMultiplier: 1,
    lastScannedCategory: ''
  };
};

// Use a different name for the local getRandomItems function to avoid conflict
export const getRandomGameItems = (count: number, invalidItemProbability = 0.4): Item[] => {
  const items: Item[] = [];
  
  for (let i = 0; i < count; i++) {
    const isInvalid = Math.random() < invalidItemProbability; // 40% chance for invalid items now
    const pool = isInvalid ? invalidItems : marketItems;
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    items.push({ ...randomItem });
  }
  
  return items;
};

// Generate fun compliments for successful scans
const generateCompliment = (comboCount: number): string => {
  if (comboCount <= 1) {
    const basicCompliments = [
      "Great scan!",
      "Nice job!",
      "Perfect!",
      "Keep it up!",
    ];
    return basicCompliments[Math.floor(Math.random() * basicCompliments.length)];
  } else if (comboCount <= 3) {
    const goodCompliments = [
      "You're on fire!",
      "Great combo!",
      "Cashier skills leveling up!",
      "Speedy scanning!"
    ];
    return goodCompliments[Math.floor(Math.random() * goodCompliments.length)];
  } else if (comboCount <= 6) {
    const awesomeCompliments = [
      "INCREDIBLE!",
      "AMAZING COMBO!",
      "CASHIER SUPERSTAR!",
      "LIGHTNING FAST!"
    ];
    return awesomeCompliments[Math.floor(Math.random() * awesomeCompliments.length)];
  } else {
    const epicCompliments = [
      "UNSTOPPABLE!!!",
      "CASHIER GOD MODE!!!",
      "LEGENDARY SCANNING!!!",
      "SCANNER NINJA!!!"
    ];
    return epicCompliments[Math.floor(Math.random() * epicCompliments.length)];
  }
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
      combo: 0,
      comboMultiplier: 1,
      gameStatus: state.mistakes + 1 >= MAX_MISTAKES ? 'gameOver' : state.gameStatus
    };
  }

  if (!item.isScannable) {
    // Wrong item scanned
    toast.error("Wrong item! That doesn't belong in the cart!");
    return {
      ...state,
      mistakes: state.mistakes + 1,
      combo: 0,
      comboMultiplier: 1,
      gameStatus: state.mistakes + 1 >= MAX_MISTAKES ? 'gameOver' : state.gameStatus
    };
  }
  
  // Check location only if it's a valid item
  if (!isInCorrectLocation) {
    toast.error("Item in wrong location! Move it to the correct side first!");
    return state;
  }
  
  // Calculate combo and multiplier
  let newCombo = state.combo + 1;
  let newMultiplier = state.comboMultiplier;
  
  // Check if we get a category match bonus (same category in a row)
  const categoryMatch = item.category === state.lastScannedCategory && state.lastScannedCategory !== '';
  
  // Increase multiplier based on combo count
  if (newCombo % 3 === 0) {
    newMultiplier += 0.5;
  }
  
  // Extra bonus for scanning items of the same category in succession
  if (categoryMatch) {
    newMultiplier += 0.25;
    toast.success("CATEGORY MATCH! +0.25x multiplier!", { duration: 1500 });
  }
  
  // Base points calculation
  let basePoints = Math.floor(item.price * 100);
  
  // Apply multiplier
  const pointsWithMultiplier = Math.floor(basePoints * newMultiplier);
  
  // Calculate final score
  const newScore = state.score + pointsWithMultiplier;
  
  // Generate a compliment based on combo level
  const compliment = generateCompliment(newCombo);
  
  // Show score with multiplier information
  if (newMultiplier > 1) {
    toast.success(`${compliment} +${pointsWithMultiplier} points! (${newMultiplier}x multiplier)`, { 
      duration: 2000,
      position: 'top-center'
    });
  } else {
    toast.success(`${compliment} +${pointsWithMultiplier} points!`);
  }
  
  // Remove the scanned item and add new items including a higher chance of vegetables
  const updatedItems = state.items.filter(i => i.id !== item.id);
  
  // Get random items with varied distribution to ensure they appear at different positions
  const newItemsCount = Math.floor(Math.random() * 2) + 1; // 1-2 new items
  
  // Get regular items
  const newRegularItems = getRandomGameItems(newItemsCount)
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
    scannedItems: [...state.scannedItems, item],
    combo: newCombo,
    comboMultiplier: newMultiplier,
    lastScannedCategory: item.category
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
  
  // Time bonus: every 15 seconds that pass, add a time bonus if the player has been doing well
  let timeBonusAdded = 0;
  if (timeLeft > 0 && timeLeft % 15 === 0 && state.combo >= 5) {
    timeBonusAdded = 5; // 5 second bonus for maintaining a good combo
    toast.success(`TIME BONUS! +${timeBonusAdded} seconds for your awesome combo!`, {
      position: 'top-center',
      duration: 3000
    });
  }
  
  if (timeLeft <= 0) {
    return {
      ...state,
      timeLeft: 0,
      gameStatus: 'gameOver'
    };
  }
  
  return {
    ...state,
    timeLeft: timeLeft + timeBonusAdded
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
