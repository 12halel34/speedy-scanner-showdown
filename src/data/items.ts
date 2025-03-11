import { Item } from '@/types/game';

// Regular scannable supermarket items
export const marketItems: Item[] = [
  {
    id: 'apple',
    name: 'Apple',
    price: 0.99,
    image: '🍎',
    isScannable: true,
    category: 'fruit'
  },
  {
    id: 'banana',
    name: 'Banana',
    price: 0.59,
    image: '🍌',
    isScannable: true,
    category: 'fruit'
  },
  {
    id: 'orange',
    name: 'Orange',
    price: 0.79,
    image: '🍊',
    isScannable: true,
    category: 'fruit'
  },
  {
    id: 'milk',
    name: 'Milk',
    price: 2.99,
    image: '🥛',
    isScannable: true,
    category: 'dairy'
  },
  {
    id: 'bread',
    name: 'Bread',
    price: 2.49,
    image: '🍞',
    isScannable: true,
    category: 'bakery'
  },
  {
    id: 'cheese',
    name: 'Cheese',
    price: 3.99,
    image: '🧀',
    isScannable: true,
    category: 'dairy'
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    price: 1.29,
    image: '🥦',
    isScannable: true,
    isThrowable: true,
    category: 'vegetable'
  },
  {
    id: 'carrot',
    name: 'Carrot',
    price: 0.99,
    image: '🥕',
    isScannable: true,
    isThrowable: true,
    category: 'vegetable'
  },
  {
    id: 'chicken',
    name: 'Chicken',
    price: 5.99,
    image: '🍗',
    isScannable: true,
    category: 'meat'
  },
  {
    id: 'egg',
    name: 'Eggs',
    price: 2.59,
    image: '🥚',
    isScannable: true,
    category: 'dairy'
  },
  {
    id: 'avocado',
    name: 'Avocado',
    price: 1.99,
    image: '🥑',
    isScannable: true,
    isThrowable: true,
    category: 'vegetable'
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    price: 4.99,
    image: '🍉',
    isScannable: true,
    category: 'fruit'
  },
  {
    id: 'tomato',
    name: 'Tomato',
    price: 0.79,
    image: '🍅',
    isScannable: true,
    isThrowable: true,
    category: 'vegetable'
  },
  {
    id: 'potato',
    name: 'Potato',
    price: 0.59,
    image: '🥔',
    isScannable: true,
    isThrowable: true,
    category: 'vegetable'
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    price: 0.89,
    image: '🥒',
    isScannable: true,
    isThrowable: true,
    category: 'vegetable'
  }
];

// Non-scannable items that appear occasionally
export const invalidItems: Item[] = [
  {
    id: 'laptop',
    name: 'Laptop',
    price: 0,
    image: '💻',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'phone',
    name: 'Phone',
    price: 0,
    image: '📱',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'watch',
    name: 'Watch',
    price: 0,
    image: '⌚',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'cat',
    name: 'Cat',
    price: 0,
    image: '🐱',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'shoe',
    name: 'Shoe',
    price: 0,
    image: '👟',
    isScannable: false,
    category: 'invalid'
  }
];

export const getAllItems = (): Item[] => {
  return [...marketItems, ...invalidItems];
};

export const getRandomItems = (count: number, invalidItemProbability = 0.2): Item[] => {
  const items: Item[] = [];
  const allItems = getAllItems();
  
  for (let i = 0; i < count; i++) {
    const isInvalid = Math.random() < invalidItemProbability;
    const pool = isInvalid ? invalidItems : marketItems;
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    items.push({ ...randomItem });
  }
  
  return items;
};
