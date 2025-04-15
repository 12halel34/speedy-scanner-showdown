
import React, { useState, useEffect, useRef } from 'react';
import { Scan } from 'lucide-react';
import { Item as ItemType } from '@/types/game';
import { toast } from 'sonner';
import { isMarketItem } from '@/utils/gameLogic';

interface ScannerProps {
  onScan: () => void;
  onItemDrop: (item: ItemType) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onItemDrop }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [ghostVisible, setGhostVisible] = useState(false);
  const [lastItemDropTime, setLastItemDropTime] = useState(0);
  const processedItemsRef = useRef<Set<string>>(new Set());
  const processingRef = useRef<boolean>(false);
  const activeDropTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track when an item is being dragged over the entire document
  useEffect(() => {
    const handleDragEnterDocument = () => {
      setGhostVisible(true);
    };
    
    const handleDragLeaveDocument = () => {
      // Only hide ghost when actually leaving the document
      if (!document.querySelector('.dragging-over-scanner')) {
        setGhostVisible(false);
      }
    };
    
    document.addEventListener('dragenter', handleDragEnterDocument);
    document.addEventListener('dragleave', handleDragLeaveDocument);
    
    return () => {
      document.removeEventListener('dragenter', handleDragEnterDocument);
      document.removeEventListener('dragleave', handleDragLeaveDocument);
    };
  }, []);
  
  // Cleanup processed items cache periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (processedItemsRef.current.size > 50) {
        processedItemsRef.current.clear();
      }
    }, 10000);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Subscribe to item removed events from the conveyor
  useEffect(() => {
    const handleItemRemoved = (event: CustomEvent) => {
      if (event.detail && event.detail.itemId) {
        processedItemsRef.current.add(event.detail.itemId);
        // Clear from processed cache after 5 seconds
        setTimeout(() => {
          processedItemsRef.current.delete(event.detail.itemId);
        }, 5000);
      }
    };

    document.addEventListener('itemRemoved' as any, handleItemRemoved as EventListener);
    
    return () => {
      document.removeEventListener('itemRemoved' as any, handleItemRemoved as EventListener);
    };
  }, []);
  
  const handleScan = () => {
    if (isScanning) return;
    
    setIsScanning(true);
    onScan();
    
    // Reset scanning state after animation completes
    setTimeout(() => {
      setIsScanning(false);
    }, 300);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDropTarget(true);
    
    // Add a class to indicate dragging over scanner
    e.currentTarget.classList.add('dragging-over-scanner');
    // Add scanner-drop-area class for general detection
    e.currentTarget.classList.add('scanner-drop-area');
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDropTarget(false);
    e.currentTarget.classList.remove('dragging-over-scanner');
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDropTarget(false);
    e.currentTarget.classList.remove('dragging-over-scanner');
    
    if (processingRef.current) {
      console.log("Already processing an item, ignoring drop");
      return;
    }
    
    // Prevent multiple drops in quick succession (debounce)
    const now = Date.now();
    if (now - lastItemDropTime < 1000) {
      console.log("Ignoring drop due to debounce", now - lastItemDropTime);
      return; // Ignore drops that happen too quickly after another
    }
    setLastItemDropTime(now);
    
    try {
      // Mark that we're processing an item
      processingRef.current = true;
      
      // Check for both item data formats (direct object or ID)
      const itemData = e.dataTransfer.getData('text/plain');
      const itemId = e.dataTransfer.getData('itemId');
      
      // For either case, check if we've recently processed this item
      if (itemData) {
        const item = JSON.parse(itemData) as ItemType;
        
        if (item.id && processedItemsRef.current.has(item.id)) {
          console.log("Already processed item:", item.id);
          setTimeout(() => {
            processingRef.current = false;
          }, 500);
          return;
        }
        
        if (item.id) {
          processedItemsRef.current.add(item.id);
          // Dispatch an event to notify the conveyor belt this item is being processed
          const draggedItemEvent = new CustomEvent('itemBeingProcessed', {
            detail: { itemId: item.id }
          });
          document.dispatchEvent(draggedItemEvent);
          
          // Remove from processed set after a while
          setTimeout(() => {
            processedItemsRef.current.delete(item.id);
          }, 5000);
        }
        
        // Clear any active drop timeout
        if (activeDropTimeoutRef.current) {
          clearTimeout(activeDropTimeoutRef.current);
          activeDropTimeoutRef.current = null;
        }
        
        // Process the item with a slight delay to allow rendering to catch up
        activeDropTimeoutRef.current = setTimeout(() => {
          onItemDrop(item);
          activeDropTimeoutRef.current = null;
          
          // Reset processing flag after a delay
          setTimeout(() => {
            processingRef.current = false;
          }, 500);
        }, 50);
      } 
      // If we have an itemId from the conveyor belt, pass that to the parent
      else if (itemId) {
        if (processedItemsRef.current.has(itemId)) {
          console.log("Already processed item with ID:", itemId);
          setTimeout(() => {
            processingRef.current = false;
          }, 500);
          return;
        }
        
        processedItemsRef.current.add(itemId);
        // Dispatch an event to notify the conveyor belt this item is being processed
        const draggedItemEvent = new CustomEvent('itemBeingProcessed', {
          detail: { itemId: itemId }
        });
        document.dispatchEvent(draggedItemEvent);
        
        // Remove from processed set after a while
        setTimeout(() => {
          processedItemsRef.current.delete(itemId);
        }, 5000);
        
        // Clear any active drop timeout
        if (activeDropTimeoutRef.current) {
          clearTimeout(activeDropTimeoutRef.current);
          activeDropTimeoutRef.current = null;
        }
        
        // Process the item with a slight delay
        activeDropTimeoutRef.current = setTimeout(() => {
          // The onItemDrop handler will need to find the item by ID
          // We'll pass a minimal item with just the ID, and let the parent component handle it
          onItemDrop({ id: itemId } as ItemType);
          activeDropTimeoutRef.current = null;
          
          // Reset processing flag after a delay
          setTimeout(() => {
            processingRef.current = false;
          }, 500);
        }, 50);
      } else {
        processingRef.current = false;
      }
      
      // Trigger scan animation
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
      }, 500);
    } catch (error) {
      console.error('Error processing dragged item:', error);
      toast.error('Failed to process item');
      // Make sure to reset processing flag on error
      processingRef.current = false;
    }
  };
  
  return (
    <div className="relative flex flex-col items-center">
      <div 
        className={`flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed ${isDropTarget ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg p-4 mb-4 h-32 w-32 transition-colors scanner-drop-area`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-sm text-gray-500 text-center mb-2">Drop items here</div>
        <div className="text-3xl">🛒</div>
      </div>

      <button 
        onClick={handleScan}
        className={`bg-red-500 hover:bg-red-600 text-white rounded-full p-6 shadow-lg transform transition-transform active:scale-95`}
        disabled={isScanning}
      >
        <Scan size={40} />
      </button>
      
      {isScanning && (
        <div className="absolute top-0 left-0 w-full h-full bg-red-400 opacity-50 rounded-full scanner-flash" />
      )}
      
      <div className="mt-2 text-center text-sm font-semibold">
        SCAN
      </div>
    </div>
  );
};

export default Scanner;
