
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
  const [occupiedRanges, setOccupiedRanges] = useState<[number, number][]>([]);
  
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

  // Helper to determine if a position is already occupied
  const isPositionOccupied = (pos: number): boolean => {
    // Check against recently used positions
    if (usedPositions.some(usedPos => Math.abs(usedPos - pos) < 20)) {
      return true;
    }
    
    // Check against current item positions with a safety buffer
    return occupiedRanges.some(([min, max]) => pos >= min - 25 && pos <= max + 25);
  };
  
  // Update items when the items prop changes
  useEffect(() => {
    if (items.length > 0 && conveyorWidth > 0) {
      // Calculate positions ensuring items don't overlap
      const spacePerItem = itemWidth + 60; // Spacing between items
      const maxItemsVisible = Math.floor(conveyorWidth / spacePerItem);
      
      // Calculate currently occupied position ranges to prevent overlap
      const currentOccupiedRanges: [number, number][] = movingItems.map(item => {
        const itemSpaceWidth = itemWidth + 20; // Width of item plus buffer
        const minPos = item.position - itemSpaceWidth/2;
        const maxPos = item.position + itemSpaceWidth/2;
        return [minPos, maxPos];
      });
      setOccupiedRanges(currentOccupiedRanges);
      
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
          // Find an available position for new items
          // Start with a position far to the right
          let startPos;
          let attempts = 0;
          const basePosition = 100 + Math.random() * 20; // Start with random base position
          
          do {
            // Each new position is further to the right with some randomization
            startPos = basePosition + (attempts * 15) + (Math.random() * 10);
            attempts++;
            // Break after reasonable attempts to prevent infinite loop
            if (attempts > 15) break;
          } while (isPositionOccupied(startPos));
          
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
          position: item.position - (0.4 * speedMultiplier) // Base speed
        }));
        
        // Update occupied ranges for collision detection
        const newOccupiedRanges: [number, number][] = updatedItems.map(item => {
          const itemSpaceWidth = itemWidth + 20;
          const minPos = item.position - itemSpaceWidth/2;
          const maxPos = item.position + itemSpaceWidth/2;
          return [minPos, maxPos];
        });
        setOccupiedRanges(newOccupiedRanges);
        
        // Check for items that have reached the left edge
        const itemsToRemove = updatedItems.filter(item => item.position <= -15);
        
        // Store positions of removed items to avoid placing new items there
        if (itemsToRemove.length > 0) {
          const positions = itemsToRemove.map(item => item.position);
          setUsedPositions(prev => [...prev, ...positions].slice(-15)); // Keep last 15 positions
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
  }, [movingItems, onItemReachEnd, speedMultiplier, itemWidth]);
  
  // Handle item scanning with position tracking
  const handleItemClick = (item: ItemType) => {
    // Store the position of the clicked item to avoid placing new items there
    const clickedItem = movingItems.find(mi => mi.id === item.id);
    if (clickedItem) {
      // Save both the exact position and neighboring positions to create a "forbidden zone"
      const position = clickedItem.position;
      const forbiddenPositions = [
        position - 10, 
        position - 5, 
        position, 
        position + 5, 
        position + 10
      ];
      setUsedPositions(prev => [...prev, ...forbiddenPositions].slice(-30)); // Increase memory of used positions
    }
    
    onScanItem(item);
  };
  
  // Render with unique, stable keys
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
      
      {/* Items on the belt with guaranteed unique keys */}
      <div className="relative h-full">
        {movingItems.map((item) => (
          <div 
            key={`${item.id}-${item.position.toFixed(1)}`} 
            className="absolute"
            style={{ 
              left: `${item.position}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: item.position < 50 ? 10 : 5 // Items closer to scanner have higher z-index
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
