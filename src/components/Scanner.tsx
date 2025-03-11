
import React, { useState } from 'react';
import { Scan } from 'lucide-react';

interface ScannerProps {
  onScan: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  
  const handleScan = () => {
    if (isScanning) return;
    
    setIsScanning(true);
    onScan();
    
    // Reset scanning state after animation completes
    setTimeout(() => {
      setIsScanning(false);
    }, 300);
  };
  
  return (
    <div className="relative flex flex-col items-center">
      <button 
        onClick={handleScan}
        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-6 shadow-lg transform transition-transform active:scale-95"
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
