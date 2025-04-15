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
  const itemWidth = 60;
  const conveyorRef = useRef<HTMLDivElement>(null);
  const [conveyorWidth, setConveyorWidth] = useState(0);
  const [conveyorHeight, setConveyorHeight] = useState(0);
  const [usedPositions, setUsedPositions] = useState<{x: number, y: number}[]>([]);
  
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [ghostImage, setGhostImage] = useState<HTMLElement | null>(null);
  const [draggingInfo, setDraggingInfo] = useState<{
    itemId: string;
    initialX: number;
    initialY: number;
    freeDragging: boolean;
  } | null>(null);
  
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

  const isPositionOccupied = (x: number, y: number): boolean => {
    return usedPositions.some(pos => 
      Math.abs(pos.x - x) < 80 && Math.abs(pos.y - y) < 80
    );
  };
  
  useEffect(() => {
    if (items.length > 0 && conveyorWidth > 0 && conveyorHeight > 0) {
      const currentPositions = movingItems.map(item => ({
        x: item.position,
        y: item.yPosition
      }));
      
      setUsedPositions(prev => {
        const updatedPositions = [...prev];
        return [...currentPositions, ...updatedPositions].slice(0, 50);
      });
      
      const newItemsWithPosition = items.map(item => {
        const existingItem = movingItems.find(mi => mi.id === item.id);
        
        if (existingItem) {
          return {
            ...item,
            position: existingItem.position,
            yPosition: existingItem.yPosition
          };
        } else {
          let x, y;
          let attempts = 0;
          let maxAttempts = 40;
          
          do {
            x = 110 + Math.random() * 30;
            y = 20 + Math.random() * 60;
            attempts++;
            
            if (attempts > maxAttempts) {
              x = 140 + Math.random() * 40;
              break;
            }
          } while (isPositionOccupied(x, y));
          
          const bufferPoints = [];
          for (let bx = -40; bx <= 40; bx += 20) {
            for (let by = -40; by <= 40; by += 20) {
              bufferPoints.push({ x: x + bx, y: y + by });
            }
          }
          
          setUsedPositions(prev => [
            ...prev,
            ...bufferPoints
          ].slice(0, 100));
          
          return {
            ...item,
            position: x,
            yPosition: y
          };
        }
      });
      
      setMovingItems(prevItems => {
        const filteredItems = prevItems.filter(item => 
          newItemsWithPosition.some(ni => ni.id === item.id)
        );
        
        const itemsToAdd = newItemsWithPosition.filter(item => 
          !filteredItems.some(fi => fi.id === item.id)
        );
        
        return [...filteredItems, ...itemsToAdd];
      });
    }
  }, [items, conveyorWidth, conveyorHeight]);
  
  useEffect(() => {
    if (movingItems.length === 0) return;
    
    const moveInterval = setInterval(() => {
      setMovingItems(prevItems => {
        const updatedItems = prevItems.map(item => {
          if (draggingInfo && draggingInfo.itemId === item.id && draggingInfo.freeDragging) {
            return item;
          }
          return {
            ...item,
            position: item.position - (0.4 * speedMultiplier)
          };
        });
        
        const itemsToRemove = updatedItems.filter(item => item.position <= -15);
        
        itemsToRemove.forEach(item => {
          if (onItemReachEnd) {
            onItemReachEnd(item);
          }
        });
        
        return updatedItems.filter(item => item.position > -15);
      });
    }, 50);
    
    return () => clearInterval(moveInterval);
  }, [movingItems, onItemReachEnd, speedMultiplier, draggingInfo]);
  
  useEffect(() => {
    if (!ghostImage) {
      const img = document.createElement('div');
      img.className = 'drag-ghost fixed pointer-events-none z-50 opacity-80 scale-110';
      img.style.display = 'none';
      document.body.appendChild(img);
      setGhostImage(img);
    }
    
    return () => {
      if (ghostImage) {
        document.body.removeChild(ghostImage);
      }
    };
  }, [ghostImage]);
  
  useEffect(() => {
    if (!draggingInfo) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingInfo) return;
      
      if (draggingInfo.freeDragging && ghostImage) {
        ghostImage.style.display = 'block';
        ghostImage.style.left = `${e.clientX}px`;
        ghostImage.style.top = `${e.clientY}px`;
        ghostImage.style.transform = 'translate(-50%, -50%)';
        
        const item = movingItems.find(item => item.id === draggingInfo.itemId);
        if (item) {
          ghostImage.innerHTML = item.image;
          ghostImage.style.fontSize = '2.5em';
        }
        
        const scanners = document.querySelectorAll('.scanner-drop-area');
        scanners.forEach(scanner => {
          if (!scanner) return;
          
          const rect = scanner.getBoundingClientRect();
          if (
            e.clientX >= rect.left && 
            e.clientX <= rect.right && 
            e.clientY >= rect.top && 
            e.clientY <= rect.bottom
          ) {
            scanner.classList.add('scan-area-highlight');
          } else {
            scanner.classList.remove('scan-area-highlight');
          }
        });
      } else if (conveyorRef.current) {
        const rect = conveyorRef.current.getBoundingClientRect();
        
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const withinConveyor = 
          e.clientX >= rect.left && 
          e.clientX <= rect.right && 
          e.clientY >= rect.top && 
          e.clientY <= rect.bottom;
        
        if (!withinConveyor && !draggingInfo.freeDragging) {
          setDraggingInfo({
            ...draggingInfo,
            freeDragging: true
          });
          
          if (ghostImage) {
            ghostImage.style.display = 'block';
            ghostImage.style.left = `${e.clientX}px`;
            ghostImage.style.top = `${e.clientY}px`;
            
            const item = movingItems.find(item => item.id === draggingInfo.itemId);
            if (item) {
              ghostImage.innerHTML = item.image;
              ghostImage.style.fontSize = '2.5em';
            }
          }
        } else if (withinConveyor && !draggingInfo.freeDragging) {
          const constrainedX = Math.max(0, Math.min(100, x));
          const constrainedY = Math.max(10, Math.min(90, y));
          
          setMovingItems(prevItems => {
            return prevItems.map(item => {
              if (item.id === draggingInfo.itemId) {
                return {
                  ...item,
                  position: constrainedX,
                  yPosition: constrainedY
                };
              }
              return item;
            });
          });
        }
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!draggingInfo) return;
      
      if (draggingInfo.freeDragging) {
        const scanners = document.querySelectorAll('.scanner-drop-area');
        let isOverScanner = false;
        let scanner: Element | null = null;
        
        scanners.forEach(s => {
          if (!s) return;
          
          const rect = s.getBoundingClientRect();
          if (
            e.clientX >= rect.left && 
            e.clientX <= rect.right && 
            e.clientY >= rect.top && 
            e.clientY <= rect.bottom
          ) {
            isOverScanner = true;
            scanner = s;
            s.classList.remove('scan-area-highlight');
          }
        });
        
        if (isOverScanner && scanner) {
          const item = movingItems.find(item => item.id === draggingInfo.itemId);
          if (item) {
            onScanItem(item);
            setMovingItems(prev => prev.filter(i => i.id !== item.id));
          }
        } else {
          if (conveyorRef.current) {
            const rect = conveyorRef.current.getBoundingClientRect();
            let newPosition = 50;
            
            if (
              e.clientX >= rect.left && 
              e.clientX <= rect.right
            ) {
              newPosition = ((e.clientX - rect.left) / rect.width) * 100;
            }
            
            let newYPosition = 50;
            
            if (
              e.clientY >= rect.top && 
              e.clientY <= rect.bottom
            ) {
              newYPosition = ((e.clientY - rect.top) / rect.height) * 100;
            }
            
            const constrainedX = Math.max(20, Math.min(80, newPosition));
            const constrainedY = Math.max(20, Math.min(80, newYPosition));
            
            setMovingItems(prev => {
              return prev.map(item => {
                if (item.id === draggingInfo.itemId) {
                  return {
                    ...item,
                    position: constrainedX,
                    yPosition: constrainedY
                  };
                }
                return item;
              });
            });
          }
        }
      }
      
      document.querySelectorAll('.item-being-dragged').forEach(el => {
        el.classList.remove('item-being-dragged');
      });
      
      if (ghostImage) {
        ghostImage.style.display = 'none';
      }
      
      setDraggingInfo(null);
      setIsDragging(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      document.querySelectorAll('.scan-area-highlight').forEach(el => {
        el.classList.remove('scan-area-highlight');
      });
    };
  }, [draggingInfo, ghostImage, movingItems, onScanItem]);
  
  const handleLongPress = (item: ItemType, e: React.MouseEvent) => {
    try {
      const element = e.currentTarget as HTMLElement;
      if (element && element.classList) {
        element.classList.add('item-being-dragged');
      }
      
      const movingItem = movingItems.find(mi => mi.id === item.id);
      if (!movingItem) return;
      
      setIsDragging(item.id);
      setDraggingInfo({
        itemId: item.id,
        initialX: movingItem.position,
        initialY: movingItem.yPosition,
        freeDragging: false
      });
    } catch (error) {
      console.error("Error in handleLongPress:", error);
    }
  };
  
  const handleItemClick = (item: ItemType) => {
    if (isDragging || draggingInfo) return;
    
    const clickedItem = movingItems.find(mi => mi.id === item.id);
    if (clickedItem) {
      const position = clickedItem.position;
      const yPosition = clickedItem.yPosition;
      
      const forbiddenPositions = [];
      for (let xOffset = -50; xOffset <= 50; xOffset += 10) {
        for (let yOffset = -50; yOffset <= 50; yOffset += 10) {
          forbiddenPositions.push({
            x: position + xOffset,
            y: yPosition + yOffset
          });
        }
      }
      
      setUsedPositions(prev => [...prev, ...forbiddenPositions].slice(0, 100));
    }
    
    setMovingItems(prevItems => prevItems.filter(i => i.id !== item.id));
    
    onScanItem(item);
  };
  
  return (
    <div 
      ref={conveyorRef}
      className="relative h-32 mt-6 mb-8 bg-gray-300 rounded-lg overflow-hidden shadow-inner"
    >
      <div className="absolute inset-0 flex">
        {Array.from({ length: 20 }).map((_, index) => (
          <div 
            key={index} 
            className="h-full w-8 bg-gray-400" 
            style={{ marginRight: '12px' }}
          />
        ))}
      </div>
      
      <div className="relative h-full w-full">
        {movingItems.map((item) => (
          <div 
            key={`${item.id}-${item.position.toFixed(1)}-${item.yPosition.toFixed(1)}`} 
            className={`absolute transition-all duration-200 ${isDragging === item.id ? 'z-50' : 'z-10'}`}
            style={{ 
              left: `${item.position}%`,
              top: `${item.yPosition}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer'
            }}
          >
            <Item 
              item={item} 
              onScan={handleItemClick}
              onMove={onMoveItem}
              onLongPress={handleLongPress}
              isDraggable={false}
              isAnimating={false}
              showPrice={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConveyorBelt;
