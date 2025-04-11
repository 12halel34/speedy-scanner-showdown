
import React, { useState } from 'react';
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
  };
  
  const handleDragLeave = () => {
    setIsDropTarget(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDropTarget(false);
    
    // Check for both item data formats (direct object or ID)
    const itemData = e.dataTransfer.getData('text/plain');
    const itemId = e.dataTransfer.getData('itemId');
    
    try {
      // If we have JSON item data, use that
      if (itemData) {
        const item = JSON.parse(itemData) as ItemType;
        onItemDrop(item);
      } 
      // If we have an itemId from the conveyor belt, pass that to the parent
      else if (itemId) {
        // The onItemDrop handler will need to find the item by ID
        // We'll pass a minimal item with just the ID, and let the parent component handle it
        onItemDrop({ id: itemId } as ItemType);
      }
      
      // Trigger scan animation
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
      }, 300);
    } catch (error) {
      console.error('Error processing dragged item:', error);
      toast.error('Failed to process item');
    }
  };
  
  return (
    <div className="relative flex flex-col items-center">
      <div 
        className={`flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed ${isDropTarget ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg p-4 mb-4 h-32 w-32 transition-colors`}
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
