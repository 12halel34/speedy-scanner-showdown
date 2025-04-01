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
  },
  {
    id: 'lettuce',
    name: 'Lettuce',
    price: 1.29,
    image: '🥬',
    isScannable: true,
    isThrowable: true,
    category: 'vegetable'
  },
  {
    id: 'pepper',
    name: 'Pepper',
    price: 0.99,
    image: '🫑',
    isScannable: true,
    isThrowable: true,
    category: 'vegetable'
  },
  {
    id: 'corn',
    name: 'Corn',
    price: 0.69,
    image: '🌽',
    isScannable: true,
    isThrowable: true,
    category: 'vegetable'
  },
  {
    id: 'onion',
    name: 'Onion',
    price: 0.49,
    image: '🧅',
    isScannable: true,
    isThrowable: true,
    category: 'vegetable'
  },
  {
    id: 'garlic',
    name: 'Garlic',
    price: 0.79,
    image: '🧄',
    isScannable: true,
    isThrowable: true,
    category: 'vegetable'
  }
];

// Hebrew market items - all scannable supermarket items with Hebrew names
export const hebrewMarketItems: Item[] = [
  {
    id: 'tuna',
    name: 'טונה',
    price: 3.50,
    image: '🥫',
    isScannable: true,
    category: 'meat'
  },
  {
    id: 'eggs',
    name: 'ביצים',
    price: 2.59,
    image: '🥚',
    isScannable: true,
    category: 'dairy'
  },
  {
    id: 'ketchup',
    name: 'קטשופ',
    price: 1.99,
    image: '🍅',
    isScannable: true,
    category: 'snack'
  },
  {
    id: 'toilet-paper',
    name: 'נייר טואלט',
    price: 4.99,
    image: '🧻',
    isScannable: true,
    category: 'household'
  },
  {
    id: 'cereal',
    name: 'דגנים',
    price: 3.29,
    image: '🥣',
    isScannable: true,
    category: 'snack'
  },
  {
    id: 'dish-soap',
    name: 'סבון כלים',
    price: 2.49,
    image: '🧴',
    isScannable: true,
    category: 'household'
  },
  {
    id: 'butter',
    name: 'חמאה',
    price: 3.99,
    image: '🧈',
    isScannable: true,
    category: 'dairy'
  },
  {
    id: 'rice',
    name: 'אורז',
    price: 2.19,
    image: '🍚',
    isScannable: true,
    category: 'snack'
  },
  {
    id: 'wine',
    name: 'יין',
    price: 9.99,
    image: '🍷',
    isScannable: true,
    category: 'drink'
  },
  {
    id: 'toothpaste',
    name: 'משחת שיניים',
    price: 3.49,
    image: '🪥',
    isScannable: true,
    category: 'household'
  },
  {
    id: 'olive-oil',
    name: 'שמן זית',
    price: 6.99,
    image: '🫒',
    isScannable: true,
    category: 'snack'
  },
  {
    id: 'laundry-detergent',
    name: 'אבקת כביסה',
    price: 7.99,
    image: '🧼',
    isScannable: true,
    category: 'household'
  },
  {
    id: 'coffee',
    name: 'קפה',
    price: 5.49,
    image: '☕',
    isScannable: true,
    category: 'drink'
  },
  {
    id: 'chocolate',
    name: 'שוקולד',
    price: 1.79,
    image: '🍫',
    isScannable: true,
    category: 'snack'
  },
  {
    id: 'wipes',
    name: 'מגבונים',
    price: 3.49,
    image: '🧻',
    isScannable: true,
    category: 'household'
  },
  {
    id: 'energy-bars',
    name: 'חטיפי אנרגיה',
    price: 4.29,
    image: '🍫',
    isScannable: true,
    category: 'snack'
  },
  {
    id: 'beer',
    name: 'בירה',
    price: 7.99,
    image: '🍺',
    isScannable: true,
    category: 'drink'
  },
  {
    id: 'diapers',
    name: 'חיתולים',
    price: 9.99,
    image: '👶',
    isScannable: true,
    category: 'household'
  },
  {
    id: 'milk',
    name: 'חלב',
    price: 2.99,
    image: '🥛',
    isScannable: true,
    category: 'dairy'
  },
  {
    id: 'razors',
    name: 'סכין גילוח',
    price: 4.99,
    image: '🪒',
    isScannable: true,
    category: 'household'
  },
  {
    id: 'batteries',
    name: 'סוללות',
    price: 6.99,
    image: '🔋',
    isScannable: true,
    category: 'household'
  },
  {
    id: 'bandaids',
    name: 'פלסטרים',
    price: 2.99,
    image: '🩹',
    isScannable: true,
    category: 'household'
  },
  {
    id: 'garbage-bags',
    name: 'שקיות זבל',
    price: 3.49,
    image: '🗑️',
    isScannable: true,
    category: 'household'
  },
  {
    id: 'honey',
    name: 'דבש',
    price: 4.49,
    image: '🍯',
    isScannable: true,
    category: 'snack'
  },
  {
    id: 'salt',
    name: 'מלח',
    price: 1.29,
    image: '🧂',
    isScannable: true,
    category: 'snack'
  },
  {
    id: 'pepper',
    name: 'פלפל',
    price: 1.49,
    image: '🌶️',
    isScannable: true,
    category: 'vegetable'
  },
  {
    id: 'pasta',
    name: 'פסטה',
    price: 1.99,
    image: '🍝',
    isScannable: true,
    category: 'snack'
  },
  {
    id: 'bread',
    name: 'לחם',
    price: 2.49,
    image: '🍞',
    isScannable: true,
    category: 'bakery'
  },
  {
    id: 'cheese',
    name: 'גבינה',
    price: 3.99,
    image: '🧀',
    isScannable: true,
    category: 'dairy'
  },
  {
    id: 'shampoo',
    name: 'שמפו',
    price: 4.99,
    image: '🧴',
    isScannable: true,
    category: 'household'
  },
  {
    id: 'fresh-vegetables',
    name: 'ירקות טריים',
    price: 3.99,
    image: '🥗',
    isScannable: true,
    category: 'vegetable'
  },
  {
    id: 'fresh-fruits',
    name: 'פירות טריים',
    price: 4.49,
    image: '🍎',
    isScannable: true,
    category: 'fruit'
  }
];

// Non-scannable items that appear occasionally (Hebrew)
export const hebrewInvalidItems: Item[] = [
  {
    id: 'shirt',
    name: 'חולצה',
    price: 0,
    image: '👕',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'screwdriver',
    name: 'מברג',
    price: 0,
    image: '🪛',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'sunglasses',
    name: 'משקפי שמש',
    price: 0,
    image: '🕶️',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'israel-flag',
    name: 'דגל ישראל',
    price: 0,
    image: '🇮🇱',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'hammer',
    name: 'פטיש',
    price: 0,
    image: '🔨',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'flower-pot',
    name: 'עציץ פרחים',
    price: 0,
    image: '🪴',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'car-tire',
    name: 'צמיג לרכב',
    price: 0,
    image: '🛞',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'hat',
    name: 'כובע',
    price: 0,
    image: '🧢',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'pillow',
    name: 'כרית',
    price: 0,
    image: '🛌',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'shoes',
    name: 'נעליים',
    price: 0,
    image: '👟',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'lamp',
    name: 'מנורה',
    price: 0,
    image: '💡',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'books',
    name: 'ספרים',
    price: 0,
    image: '📚',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'bicycle',
    name: 'אופניים',
    price: 0,
    image: '🚲',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'phone-charger',
    name: 'מטען טלפון',
    price: 0,
    image: '🔌',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'usb-cable',
    name: 'כבל USB',
    price: 0,
    image: '🔌',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'fuel',
    name: 'דלק',
    price: 0,
    image: '⛽',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'carpenter-glue',
    name: 'דבק נגרים',
    price: 0,
    image: '🧴',
    isScannable: false,
    category: 'invalid'
  },
  {
    id: 'nails',
    name: 'מסמרים',
    price: 0,
    image: '📌',
    isScannable: false,
    category: 'invalid'
  }
];

// Filter vegetable items
export const vegetableItems = marketItems.filter(item => item.category === 'vegetable');

// Combine all items for the Hebrew version
const combinedHebrewItems = [...hebrewMarketItems, ...hebrewInvalidItems];

// Non-scannable items that appear occasionally (English)
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
  return combinedHebrewItems;
};

export const getRandomItems = (count: number, invalidItemProbability = 0.2): Item[] => {
  const items: Item[] = [];
  const allItems = getAllItems();
  
  for (let i = 0; i < count; i++) {
    const isInvalid = Math.random() < invalidItemProbability;
    const pool = isInvalid ? hebrewInvalidItems : hebrewMarketItems;
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    items.push({ ...randomItem });
  }
  
  return items;
};

// New function to get only vegetable items
export const getRandomVegetables = (count: number): Item[] => {
  const items: Item[] = [];
  const hebrewVegetables = hebrewMarketItems.filter(item => item.category === 'vegetable');
  
  for (let i = 0; i < count; i++) {
    const randomVegetable = hebrewVegetables[Math.floor(Math.random() * hebrewVegetables.length)];
    // Add unique identifier to ensure React keys are unique
    items.push({ 
      ...randomVegetable, 
      id: `${randomVegetable.id}-${Math.random().toString(36).substr(2, 9)}`
    });
  }
  
  return items;
};
