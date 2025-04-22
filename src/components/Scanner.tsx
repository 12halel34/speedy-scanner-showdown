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
  const [currentlyProcessingDrop, setCurrentlyProcessingDrop] = useState(false);
  
  useEffect(() => {
    const handleDragEnterDocument = () => {
      setGhostVisible(true);
    };
    
    const handleDragLeaveDocument = () => {
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
  
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (processedItemsRef.current.size > 50) {
        processedItemsRef.current.clear();
      }
    }, 10000);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  useEffect(() => {
    const handleItemRemoved = (event: CustomEvent) => {
      if (event.detail && event.detail.itemId) {
        processedItemsRef.current.add(event.detail.itemId);
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
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDropTarget(true);
    e.currentTarget.classList.add('dragging-over-scanner');
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
    
    if (processingRef.current || currentlyProcessingDrop) {
      console.log("Already processing an item, ignoring drop");
      return;
    }
    
    setCurrentlyProcessingDrop(true);
    
    const now = Date.now();
    if (now - lastItemDropTime < 500) {
      console.log("Ignoring drop due to debounce", now - lastItemDropTime);
      setCurrentlyProcessingDrop(false);
      return;
    }
    setLastItemDropTime(now);
    
    try {
      processingRef.current = true;
      
      const itemData = e.dataTransfer.getData('text/plain');
      const itemId = e.dataTransfer.getData('itemId');
      
      if (itemData) {
        const item = JSON.parse(itemData) as ItemType;
        
        if (item.id && processedItemsRef.current.has(item.id)) {
          console.log("Already processed item:", item.id);
          setTimeout(() => {
            processingRef.current = false;
            setCurrentlyProcessingDrop(false);
          }, 500);
          return;
        }
        
        if (item.id) {
          processedItemsRef.current.add(item.id);
          const draggedItemEvent = new CustomEvent('itemBeingProcessed', {
            detail: { itemId: item.id }
          });
          document.dispatchEvent(draggedItemEvent);
          
          onItemDrop(item);
          
          setTimeout(() => {
            processedItemsRef.current.delete(item.id);
            processingRef.current = false;
            setCurrentlyProcessingDrop(false);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error processing dragged item:', error);
      toast.error('Failed to process item');
      processingRef.current = false;
      setCurrentlyProcessingDrop(false);
    }
  };
  
  return (
    <div className="relative flex flex-col items-center">
      <div 
        className={`flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed ${
          isDropTarget ? 'border-red-500 bg-red-50' : 
          currentlyProcessingDrop ? 'border-yellow-500 bg-yellow-50' : 
          'border-gray-300'
        } rounded-lg p-4 mb-4 h-32 w-32 transition-colors scanner-drop-area`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-sm text-gray-500 text-center mb-2">Drop items here</div>
        <div className="text-3xl">🛒</div>
      </div>

      <button 
        onClick={onScan}
        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-6 shadow-lg transform transition-transform active:scale-95 opacity-0 pointer-events-none"
      >
        <Scan size={40} />
      </button>
      
      <div className="mt-2 text-center text-sm font-semibold">
        SCAN AREA
      </div>
    </div>
  );
};

export default Scanner;
