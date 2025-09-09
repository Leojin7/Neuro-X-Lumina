import React from 'react';
import Card from '../components/Card';
import { Trophy, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';
const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Alex', score: 9250, avatar: `https://i.pravatar.cc/40?u=alex` },
  { rank: 2, name: 'Samantha', score: 8800, avatar: `https://i.pravatar.cc/40?u=samantha` },
  { rank: 3, name: 'Jordan', score: 8150, avatar: `https://i.pravatar.cc/40?u=jordan` },
  { rank: 4, name: 'Casey', score: 7600, avatar: `https://i.pravatar.cc/40?u=casey` },
  { rank: 5, name: 'Taylor', score: 7200, avatar: `https://i.pravatar.cc/40?u=taylor` },
  { rank: 6, name: 'Morgan', score: 6850, avatar: `https://i.pravatar.cc/40?u=morgan` },
];
const Leaderboard: React.FC = () => {
  return (
    <div className="animate-fade-in-up space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">See how you stack up against the top learners.</p>
      </header>
      <Card>
        <div className="flow-root">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-foreground">Rank</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">User</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-foreground">Focus Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_LEADERBOARD.map((user, index) => (
                <motion.tr 
                  key={user.name} 
                  className="hover:bg-muted/30 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-foreground">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        {user.rank === 1 && <Trophy className="text-yellow-400" size={18}/>}
                        {user.rank === 2 && <Award className="text-slate-300" size={18}/>}
                        {user.rank === 3 && <Star className="text-orange-400" size={18}/>}
                        {user.rank > 3 && user.rank}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-foreground">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-foreground font-semibold">{user.score.toLocaleString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default Leaderboard;