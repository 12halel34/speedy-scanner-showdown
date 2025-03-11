
import React from 'react';
import { Button } from '@/components/ui/button';

interface BasketPreviewProps {
  itemCount: number;
}

const BasketPreview: React.FC<BasketPreviewProps> = ({ itemCount }) => {
  return (
    <div className="mt-6 flex justify-center">
      <Button
        variant="outline"
        disabled
        className="text-gray-400 cursor-not-allowed"
      >
        Basket: {itemCount} items
      </Button>
    </div>
  );
};

export default BasketPreview;
