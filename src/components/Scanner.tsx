
import React, { useState } from 'react';
import { Scan } from 'lucide-react';
import { Item as ItemType } from '@/types/game';

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
    
    const itemData = e.dataTransfer.getData('text/plain');
    try {
      const item = JSON.parse(itemData) as ItemType;
      onItemDrop(item);
      
      // Trigger scan animation
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
      }, 300);
    } catch (error) {
      console.error('Error parsing dragged item:', error);
    }
  };
  
  return (
    <div className="relative flex flex-col items-center">
      <button 
        onClick={handleScan}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-red-500 hover:bg-red-600 text-white rounded-full p-6 shadow-lg transform transition-transform active:scale-95 ${isDropTarget ? 'ring-4 ring-yellow-300 scale-110' : ''}`}
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
