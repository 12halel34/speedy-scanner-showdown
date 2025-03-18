
import React from 'react';
import { Item } from '@/types/game';

interface SelectedItemDisplayProps {
  selectedItem: Item | null;
}

const SelectedItemDisplay: React.FC<SelectedItemDisplayProps> = ({ selectedItem }) => {
  if (!selectedItem) return null;
  
  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
        <div className="text-4xl mr-4">{selectedItem.image}</div>
        <div>
          <div className="font-bold">{selectedItem.name}</div>
          {selectedItem.isScannable && (
            <div className="text-green-600">${selectedItem.price.toFixed(2)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectedItemDisplay;
