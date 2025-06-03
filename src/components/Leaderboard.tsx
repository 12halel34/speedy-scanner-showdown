
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, User, GamepadIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LeaderboardEntry {
  id: string;
  username: string | null;
  highest_score: number;
  total_games_played: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, highest_score, total_games_played')
        .order('highest_score', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching leaderboard:', error);
      } else {
        setLeaderboard(data || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">{index + 1}</span>;
  };

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
    if (index === 1) return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
    if (index === 2) return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200";
    return "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-xl text-gray-600">טוען לוח התוצאות...</div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          לוח התוצאות
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            <GamepadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>עדיין אין שחקנים בלוח התוצאות</p>
            <p className="text-sm">תהיה הראשון לשחק!</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">דירוג</TableHead>
                  <TableHead>שם שחקן</TableHead>
                  <TableHead className="text-center">ניקוד גבוה</TableHead>
                  <TableHead className="text-center">משחקים ששוחקו</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => (
                  <TableRow key={entry.id} className={getRankBg(index)}>
                    <TableCell className="text-center">
                      {getRankIcon(index)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {entry.username || `שחקן ${entry.id.slice(0, 8)}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-green-600">
                      {entry.highest_score?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-center text-blue-600">
                      {entry.total_games_played || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
