
import React, { useState, useEffect, useRef } from 'react';
import { Scan, Star, Sparkles } from 'lucide-react';
import { Item as ItemType } from '@/types/game';
import { toast } from 'sonner';

interface ScannerProps {
  onScan: () => void;
  onItemDrop: (item: ItemType) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onItemDrop }) => {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [ghostVisible, setGhostVisible] = useState(false);
  const [lastItemDropTime, setLastItemDropTime] = useState(0);
  const processedItemsRef = useRef<Set<string>>(new Set());
  const processingRef = useRef<boolean>(false);
  const [currentlyProcessingDrop, setCurrentlyProcessingDrop] = useState(false);
  const [showScanEffect, setShowScanEffect] = useState(false);
  
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
  
  const playScanSound = () => {
    const scanSound = new Audio('/scan-beep.mp3');
    scanSound.volume = 0.3;
    scanSound.play().catch(e => console.log('Error playing sound:', e));
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
          
          setShowScanEffect(true);
          setTimeout(() => setShowScanEffect(false), 600);
          
          playScanSound();
          
          // Process the item as scanned immediately when dropped
          onItemDrop(item);
          onScan();
          
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
          isDropTarget ? 'border-green-500 bg-green-50' : 
          currentlyProcessingDrop ? 'border-yellow-500 bg-yellow-50' : 
          'border-gray-300'
        } rounded-lg p-4 mb-4 h-32 w-32 transition-colors scanner-drop-area ${isDropTarget ? 'drop-here-animation' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-sm text-gray-500 text-center mb-2">Drop items here</div>
        <div className="text-3xl relative">
          🛒
          {showScanEffect && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="scanner-flash bg-green-400 opacity-50 absolute inset-0 rounded-full"></div>
              <Sparkles className="text-yellow-400 absolute" size={32} />
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-2 text-center text-sm font-semibold">
        SCAN AREA
      </div>
    </div>
  );
};

export default Scanner;
