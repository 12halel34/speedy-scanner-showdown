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
  const itemBeingProcessedRef = useRef<Set<string>>(new Set());
  const clickedItemsRef = useRef<Set<string>>(new Set());
  const processingActionsRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const handleItemProcessing = (event: CustomEvent) => {
      if (event.detail && event.detail.itemId) {
        const itemId = event.detail.itemId;
        
        itemBeingProcessedRef.current.add(itemId);
        setMovingItems(prev => prev.filter(item => item.id !== itemId));
        setTimeout(() => {
          itemBeingProcessedRef.current.delete(itemId);
        }, 5000);
      }
    };
    
    document.addEventListener('itemBeingProcessed' as any, handleItemProcessing as EventListener);
    
    return () => {
      document.removeEventListener('itemBeingProcessed' as any, handleItemProcessing as EventListener);
    };
  }, []);
  
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
      try {
        const filteredItems = items.filter(
          item => !item.id || !itemBeingProcessedRef.current.has(item.id)
        );
        
        const currentPositions = movingItems.map(item => ({
          x: item.position,
          y: item.yPosition
        }));
        
        setUsedPositions(prev => {
          const updatedPositions = [...prev];
          return [...currentPositions, ...updatedPositions].slice(0, 50);
        });
        
        const newItemsWithPosition = filteredItems.map(item => {
          if (isDragging === item.id || 
              (item.id && itemBeingProcessedRef.current.has(item.id)) ||
              (item.id && processingActionsRef.current.has(item.id))) {
            return null;
          }
          
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
        }).filter(Boolean) as (ItemType & { position: number, yPosition: number })[];
        
        const uniqueItems = new Map<string, ItemType & { position: number, yPosition: number }>();
        
        newItemsWithPosition.forEach(item => {
          if (item && item.id && !uniqueItems.has(item.id)) {
            uniqueItems.set(item.id, item);
          }
        });
        
        const timer = setTimeout(() => {
          setMovingItems(prevItems => {
            const filteredPrevItems = prevItems.filter(item => 
              !itemBeingProcessedRef.current.has(item.id) && 
              Array.from(uniqueItems.keys()).includes(item.id)
            );
            
            const itemsToAdd = Array.from(uniqueItems.values()).filter(
              item => !filteredPrevItems.some(fi => fi.id === item.id)
            );
            
            return [...filteredPrevItems, ...itemsToAdd].map(item => ({
              ...item,
              key: `${item.id}-${Date.now()}`
            }));
          });
        }, 0);
        
        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error updating moving items:", error);
      }
    }
  }, [items, conveyorWidth, conveyorHeight, isDragging]);
  
  useEffect(() => {
    if (movingItems.length === 0) return;
    
    const moveInterval = setInterval(() => {
      setMovingItems(prevItems => {
        try {
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
            if (onItemReachEnd && !itemBeingProcessedRef.current.has(item.id)) {
              onItemReachEnd(item);
            }
          });
          
          return updatedItems.filter(item => item.position > -15);
        } catch (error) {
          console.error("Error updating moving items in interval:", error);
          return prevItems;
        }
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
      
      try {
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
      } catch (error) {
        console.error("Error during mouse move:", error);
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!draggingInfo) return;
      
      try {
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
              itemBeingProcessedRef.current.add(item.id);
              
              setMovingItems(prev => prev.filter(i => i.id !== item.id));
              
              const draggedItemEvent = new CustomEvent('itemRemoved', {
                detail: { itemId: item.id }
              });
              document.dispatchEvent(draggedItemEvent);
              
              setTimeout(() => {
                onScanItem(item);
                
                setTimeout(() => {
                  itemBeingProcessedRef.current.delete(item.id);
                }, 3000);
              }, 50);
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
      } catch (error) {
        console.error("Error during mouse up:", error);
        
        document.querySelectorAll('.item-being-dragged').forEach(el => {
          el.classList.remove('item-being-dragged');
        });
        
        if (ghostImage) {
          ghostImage.style.display = 'none';
        }
        
        setDraggingInfo(null);
        setIsDragging(null);
      }
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
      if (item.id && (
          itemBeingProcessedRef.current.has(item.id) || 
          processingActionsRef.current.has(item.id)
      )) {
        console.log("Item is already being processed, cannot grab", item.id);
        return;
      }
      
      if (item.id) {
        processingActionsRef.current.add(item.id);
        
        setTimeout(() => {
          processingActionsRef.current.delete(item.id);
        }, 2000);
      }
      
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
      if (item.id) {
        processingActionsRef.current.delete(item.id);
      }
    }
  };
  
  const handleItemClick = (item: ItemType) => {
    if (isDragging || draggingInfo) return;
    
    if (item.id && (
        clickedItemsRef.current.has(item.id) || 
        processingActionsRef.current.has(item.id)
    )) {
      console.log("Item was recently clicked or is being processed, ignoring:", item.id);
      return;
    }
    
    if (item.id && itemBeingProcessedRef.current.has(item.id)) {
      console.log("Item is already being processed, cannot click", item.id);
      return;
    }
    
    if (item.id) {
      clickedItemsRef.current.add(item.id);
      processingActionsRef.current.add(item.id);
      
      setTimeout(() => {
        clickedItemsRef.current.delete(item.id);
      }, 2000);
      
      setTimeout(() => {
        processingActionsRef.current.delete(item.id);
      }, 3000);
    }
    
    if (item.id) {
      itemBeingProcessedRef.current.add(item.id);
      
      setMovingItems(prevItems => prevItems.filter(i => i.id !== item.id));
      
      const draggedItemEvent = new CustomEvent('itemBeingProcessed', {
        detail: { itemId: item.id }
      });
      document.dispatchEvent(draggedItemEvent);
      
      const removedEvent = new CustomEvent('itemRemoved', {
        detail: { itemId: item.id }
      });
      document.dispatchEvent(removedEvent);
      
      onScanItem(item);
      
      setTimeout(() => {
        itemBeingProcessedRef.current.delete(item.id);
      }, 3000);
    }
  };
  
  const getUniqueItemKey = (item: ItemType & { position: number, yPosition: number }) => {
    return `${item.id}-${item.position.toFixed(2)}-${item.yPosition.toFixed(2)}-${Date.now()}`;
  };
  
  return (
    <div 
      ref={conveyorRef}
      className="relative h-32 mt-6 mb-8 bg-gray-300 rounded-lg overflow-hidden shadow-inner"
    >
      <div className="absolute inset-0 flex">
        {Array.from({ length: 20 }).map((_, index) => (
          <div 
            key={`belt-segment-${index}`}
            className="h-full w-8 bg-gray-400" 
            style={{ marginRight: '12px' }}
          />
        ))}
      </div>
      
      <div className="relative h-full w-full">
        {movingItems.map((item) => (
          <div 
            key={getUniqueItemKey(item)}
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
