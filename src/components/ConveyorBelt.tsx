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
  const [movingItems, setMovingItems] = useState<(ItemType & { position: number, yPosition: number })[]>([]);
  const itemWidth = 50; // Approximate width of an item in pixels
  const conveyorRef = useRef<HTMLDivElement>(null);
  const [conveyorWidth, setConveyorWidth] = useState(0);
  const [conveyorHeight, setConveyorHeight] = useState(0);
  const [usedPositions, setUsedPositions] = useState<{x: number, y: number}[]>([]);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [draggedPosition, setDraggedPosition] = useState<{x: number, y: number} | null>(null);
  
  // Set conveyor dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (conveyorRef.current) {
        setConveyorWidth(conveyorRef.current.offsetWidth);
        setConveyorHeight(conveyorRef.current.offsetHeight);
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Helper to determine if a position is already occupied
  const isPositionOccupied = (x: number, y: number): boolean => {
    // Check against recently used positions with a larger buffer zone
    return usedPositions.some(pos => 
      Math.abs(pos.x - x) < 60 && Math.abs(pos.y - y) < 60
    );
  };
  
  // Update items when the items prop changes
  useEffect(() => {
    if (items.length > 0 && conveyorWidth > 0 && conveyorHeight > 0) {
      // Calculate currently occupied positions to prevent overlap
      const currentPositions = movingItems.map(item => ({
        x: item.position,
        y: item.yPosition
      }));
      
      // Update used positions
      setUsedPositions(prev => {
        const updatedPositions = [...prev];
        // Keep only the 30 most recent positions to prevent the array from growing too large
        return [...currentPositions, ...updatedPositions].slice(0, 30);
      });
      
      // Distribute items across the conveyor with proper spacing
      const newItemsWithPosition = items.map(item => {
        // Check if the item already exists in movingItems
        const existingItem = movingItems.find(mi => mi.id === item.id);
        
        if (existingItem) {
          return {
            ...item,
            position: existingItem.position,
            yPosition: existingItem.yPosition
          };
        } else {
          // Find an available position for new items
          let x, y;
          let attempts = 0;
          
          do {
            // Position starts from right side (90-110%) and random vertical position (10-90% of height)
            x = 90 + Math.random() * 20; // 90-110% of conveyor width
            y = 10 + Math.random() * 80; // 10-90% of conveyor height
            attempts++;
            
            // Break after reasonable attempts to prevent infinite loop
            if (attempts > 25) {
              // If we can't find a non-overlapping position after many attempts,
              // place it far to the right to ensure it's off-screen
              x = 110 + Math.random() * 30;
              break;
            }
          } while (isPositionOccupied(x, y));
          
          // Add this position to used positions
          setUsedPositions(prev => [
            ...prev,
            { x, y },
            { x: x - 10, y }, // Add buffer zones
            { x: x + 10, y },
            { x, y: y - 10 },
            { x, y: y + 10 }
          ].slice(0, 50));
          
          return {
            ...item,
            position: x,
            yPosition: y
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
  }, [items, conveyorWidth, conveyorHeight]);
  
  // Animation effect for moving items
  useEffect(() => {
    if (movingItems.length === 0) return;
    
    const moveInterval = setInterval(() => {
      setMovingItems(prevItems => {
        // Move each item to the left with speedMultiplier affecting the speed
        // Skip moving the item that's being dragged
        const updatedItems = prevItems.map(item => {
          if (isDragging === item.id) {
            return item;
          }
          return {
            ...item,
            position: item.position - (0.4 * speedMultiplier) // Base speed
          };
        });
        
        // Check for items that have reached the left edge
        const itemsToRemove = updatedItems.filter(item => item.position <= -15);
        
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
  }, [movingItems, onItemReachEnd, speedMultiplier, isDragging]);
  
  // Handle dragging items on the conveyor
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setIsDragging(itemId);
    
    // Set up the drag image
    const dragImg = new Image();
    dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1px transparent gif
    e.dataTransfer.setDragImage(dragImg, 0, 0);
    
    // Add the item data to the drag event
    e.dataTransfer.setData('itemId', itemId);
  };
  
  const handleDragEnd = () => {
    setIsDragging(null);
    setDraggedPosition(null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) return;
    
    // Get the coordinates relative to the conveyor belt
    const rect = conveyorRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Constrain positions within the conveyor
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(10, Math.min(90, y));
    
    setDraggedPosition({ x: constrainedX, y: constrainedY });
    
    // Update the position of the dragged item
    setMovingItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === isDragging) {
          return {
            ...item,
            position: constrainedX,
            yPosition: constrainedY
          };
        }
        return item;
      });
    });
  };
  
  // Handle item scanning with position tracking
  const handleItemClick = (item: ItemType) => {
    // Store the position of the clicked item to avoid placing new items there
    const clickedItem = movingItems.find(mi => mi.id === item.id);
    if (clickedItem) {
      // Create a larger forbidden zone around the clicked item
      const position = clickedItem.position;
      const yPosition = clickedItem.yPosition;
      
      // Add multiple points in a grid pattern around the scanned item
      const forbiddenPositions = [];
      for (let xOffset = -30; xOffset <= 30; xOffset += 10) {
        for (let yOffset = -30; yOffset <= 30; yOffset += 10) {
          forbiddenPositions.push({
            x: position + xOffset,
            y: yPosition + yOffset
          });
        }
      }
      
      setUsedPositions(prev => [...prev, ...forbiddenPositions].slice(0, 50));
    }
    
    // Remove the item from movingItems
    setMovingItems(prevItems => prevItems.filter(i => i.id !== item.id));
    
    onScanItem(item);
  };
  
  // Render with unique, stable keys
  return (
    <div 
      ref={conveyorRef}
      className="relative h-32 mt-6 mb-8 bg-gray-300 rounded-lg overflow-hidden shadow-inner"
      onDragOver={handleDragOver}
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
            key={`${item.id}-${item.position.toFixed(1)}-${item.yPosition.toFixed(1)}`} 
            className="absolute"
            style={{ 
              left: `${item.position}%`,
              top: `${item.yPosition}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isDragging === item.id ? 100 : 10,
              cursor: 'grab'
            }}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragEnd={handleDragEnd}
          >
            <Item 
              item={item} 
              onScan={handleItemClick}
              onMove={onMoveItem}
              isDraggable={false} // We handle dragging at this level
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
