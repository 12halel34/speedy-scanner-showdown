export interface Item {
  id: string;
  name: string;
  price: number;
  image: string;
  isScannable: boolean;
  isThrowable?: boolean;
  category: ItemCategory;
  lane?: number;
  location?: 'left' | 'right'; // Track which side the item is on
}

export type ItemCategory = 
  | 'fruit' 
  | 'vegetable' 
  | 'dairy' 
  | 'bakery' 
  | 'meat'
  | 'snack'
  | 'drink'
  | 'household'
  | 'invalid';

export interface GameState {
  score: number;
  timeLeft: number;
  items: Item[];
  scannedItems: Item[];
  throwableItems: Item[];
  thrownItems: Item[];
  lanes: number[];
  mistakes: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver';
  highScore: number;
  combo: number;
  comboMultiplier: number;
  lastScannedCategory: string;
  lastComboTimestamp: number;
  lastCompliment?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  condition: (state: GameState) => boolean;
}
