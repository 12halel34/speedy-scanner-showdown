
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Trophy, GamepadIcon } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, profile, signOut } = useAuth();

  if (!user || !profile) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          {profile.username || user.email?.split('@')[0]}
        </h2>
        <p className="text-gray-600 text-sm">{user.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-50 p-4 rounded-lg text-center">
          <Trophy className="w-6 h-6 text-amber-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-amber-800">{profile.highest_score}</div>
          <div className="text-sm text-amber-600">ניקוד גבוה</div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <GamepadIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-blue-800">{profile.total_games_played}</div>
          <div className="text-sm text-blue-600">משחקים</div>
        </div>
      </div>

      <Button
        onClick={signOut}
        variant="outline"
        className="w-full"
      >
        <LogOut className="mr-2" size={16} />
        התנתק
      </Button>
    </div>
  );
};

export default UserProfile;
