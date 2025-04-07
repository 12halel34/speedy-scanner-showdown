import React, { useState, useEffect, useRef } from 'react';
import { Item as ItemType } from '@/types/game';
import Item from './Item';

interface ConveyorBeltProps {
  items: ItemType[];
  onScanItem: (item: ItemType) => void;
  onMoveItem?: (item: ItemType, destination: 'left' | 'right') => void;
  onItemReachEnd?: (item: ItemType) => void;
  speedMultiplier: number;
}

const ConveyorBelt: React.FC<ConveyorBeltProps> = ({ 
  items, 
  onScanItem, 
  onMoveItem,
  onItemReachEnd,
  speedMultiplier = 1
}) => {
  const [movingItems, setMovingItems] = useState<(ItemType & { position: number })[]>([]);
  const itemWidth = 50; // Approximate width of an item in pixels
  const conveyorRef = useRef<HTMLDivElement>(null);
  const [conveyorWidth, setConveyorWidth] = useState(0);
  const [usedPositions, setUsedPositions] = useState<number[]>([]);
  
  // Set conveyor width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (conveyorRef.current) {
        setConveyorWidth(conveyorRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  // Update items when the items prop changes
  useEffect(() => {
    if (items.length > 0 && conveyorWidth > 0) {
      // Calculate positions ensuring items don't overlap
      const spacePerItem = itemWidth + 60; // Reduced spacing to fit more items (was 80)
      const maxItemsVisible = Math.floor(conveyorWidth / spacePerItem);
      
      // Distribute items across the conveyor with proper spacing
      const newItemsWithPosition = items.map((item, index) => {
        // Check if the item already exists in movingItems
        const existingItem = movingItems.find(mi => mi.id === item.id);
        
        if (existingItem) {
          return {
            ...item,
            position: existingItem.position
          };
        } else {
          // Place new items offscreen to the right with proper spacing
          // Avoid positions that were recently used
          let startPos;
          let attempts = 0;
          do {
            // Start with base position then add random offset to avoid patterns
            startPos = 100 + (index % maxItemsVisible) * 20 + (Math.random() * 15); // Reduced spacing multiplier from 25 to 20
            attempts++;
            // Break after some attempts to prevent infinite loop
            if (attempts > 10) break;
          } while (usedPositions.some(pos => Math.abs(pos - startPos) < 15));
          
          return {
            ...item,
            position: startPos
          };
        }
      });
      
      setMovingItems(prevItems => {
        // Filter out items that no longer exist in the incoming items
        const filteredItems = prevItems.filter(item => 
          newItemsWithPosition.some(ni => ni.id === item.id)
        );
        
        // Add any new items that aren't already in the moving items
        const itemsToAdd = newItemsWithPosition.filter(item => 
          !filteredItems.some(fi => fi.id === item.id)
        );
        
        return [...filteredItems, ...itemsToAdd];
      });
    }
  }, [items, conveyorWidth, usedPositions]);
  
  // Animation effect for moving items
  useEffect(() => {
    if (movingItems.length === 0) return;
    
    const moveInterval = setInterval(() => {
      setMovingItems(prevItems => {
        // Move each item to the left with speedMultiplier affecting the speed
        const updatedItems = prevItems.map(item => ({
          ...item,
          position: item.position - (0.4 * speedMultiplier) // Increased base speed
        }));
        
        // Check for items that have reached the left edge
        const itemsToRemove = updatedItems.filter(item => item.position <= -15);
        
        // Store positions of removed items to avoid placing new items there
        if (itemsToRemove.length > 0) {
          const positions = itemsToRemove.map(item => item.position);
          setUsedPositions(prev => [...prev, ...positions].slice(-10)); // Keep last 10 positions
        }
        
        // Notify parent of items reaching the end
        itemsToRemove.forEach(item => {
          if (onItemReachEnd) {
            onItemReachEnd(item);
          }
        });
        
        // Remove items that have gone off screen
        return updatedItems.filter(item => item.position > -15);
      });
    }, 50); // Update every 50ms for smooth animation
    
    return () => clearInterval(moveInterval);
  }, [movingItems, onItemReachEnd, speedMultiplier]);
  
  // Track which positions were used for scanned items
  const handleItemClick = (item: ItemType) => {
    // Store the position of the clicked item
    const clickedItem = movingItems.find(mi => mi.id === item.id);
    if (clickedItem) {
      setUsedPositions(prev => [...prev, clickedItem.position].slice(-10)); // Keep last 10 positions
    }
    
    onScanItem(item);
  };
  
  return (
    <div 
      ref={conveyorRef}
      className="relative h-32 mt-6 mb-8 bg-gray-300 rounded-lg overflow-hidden shadow-inner"
    >
      {/* Conveyor belt stripes */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 20 }).map((_, index) => (
          <div 
            key={index} 
            className="h-full w-8 bg-gray-400" 
            style={{ marginRight: '12px' }}
          />
        ))}
      </div>
      
      {/* Items on the belt */}
      <div className="relative h-full">
        {movingItems.map((item) => (
          <div 
            key={`${item.id}-${item.position.toFixed(2)}`} 
            className="absolute"
            style={{ 
              left: `${item.position}%`,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <Item 
              item={item} 
              onScan={handleItemClick}
              onMove={onMoveItem}
              isDraggable={true}
              isAnimating={false} // We're handling animation ourselves
              showPrice={false} // Hide prices as requested
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConveyorBelt;
