
export interface Item {
  id: string;
  name: string;
  price: number;
  image: string;
  isScannable: boolean;
  category: ItemCategory;
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
  mistakes: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver';
  highScore: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  condition: (state: GameState) => boolean;
}
