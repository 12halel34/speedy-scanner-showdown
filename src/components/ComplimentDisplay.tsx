
import React from 'react';
import { Star } from 'lucide-react';

interface ComplimentDisplayProps {
  compliment: string;
  isVisible: boolean;
}

const ComplimentDisplay: React.FC<ComplimentDisplayProps> = ({ 
  compliment, 
  isVisible 
}) => {
  if (!isVisible || !compliment) {
    return null;
  }

  // Determine styling based on compliment content (uppercase = more emphasis)
  const isHighEmphasis = compliment.includes('!') && compliment === compliment.toUpperCase();
  const isMediumEmphasis = compliment.includes('!') && !isHighEmphasis;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className={`
        flex items-center justify-center px-4 py-2 rounded-lg
        ${isHighEmphasis ? 'bg-yellow-500 text-white compliment-animation-large' : 
          isMediumEmphasis ? 'bg-blue-500 text-white compliment-animation-medium' : 
          'bg-green-500 text-white compliment-animation-small'}
        shadow-lg
      `}>
        {isHighEmphasis && (
          <Star className="text-yellow-300 mr-2 animate-pulse" size={24} />
        )}
        <span className={`
          font-bold
          ${isHighEmphasis ? 'text-3xl' : isMediumEmphasis ? 'text-2xl' : 'text-xl'}
        `}>
          {compliment}
        </span>
        {isHighEmphasis && (
          <Star className="text-yellow-300 ml-2 animate-pulse" size={24} />
        )}
      </div>
    </div>
  );
};

export default ComplimentDisplay;
