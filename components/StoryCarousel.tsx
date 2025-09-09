
import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import type { FocusStory } from '../types';
import { motion } from 'framer-motion';
import { Sun, Coins, Sparkles, BrainCircuit, Zap } from 'lucide-react';
import Card from './Card';
const MiniStoryCard = ({ story }: { story: FocusStory }) => {
  const { currentUser } = useUserStore();
  const userAvatar = currentUser?.photoURL || `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${currentUser?.uid}`;
  return (
    <motion.div 
        className="w-56 h-72 flex-shrink-0 bg-muted/20 rounded-2xl shadow-lg p-4 flex flex-col border border-border"
        whileHover={{ y: -5, scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <img src={userAvatar} alt="Avatar" className="w-8 h-8 rounded-full border border-primary" />
        <p className="text-xs font-semibold text-muted-foreground truncate">{currentUser?.displayName || 'Learner'}</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <Sun className="text-primary" size={32} />
        <p className="text-3xl font-bold mt-2 text-foreground">{story.duration}<span className="text-base font-normal ml-1">min</span></p>
        <p className="text-sm text-muted-foreground">Focus Session</p>
      </div>
      <div className="flex justify-around items-center pt-3 border-t border-border text-xs">
        <div className="flex items-center gap-1.5 text-yellow-400">
          <Coins size={14} />
          <span className="font-semibold">+{story.coinsEarned}</span>
        </div>
        <div className="flex items-center gap-1.5 text-primary/80">
            <Zap size={14} />
            <span className="font-semibold">{story.flowState}% Flow</span>
        </div>
      </div>
    </motion.div>
  );
};
const StoryCarousel = () => {
  const { focusStories } = useUserStore();
  if (focusStories.length === 0) {
    return (
        <Card>
            <div className="flex flex-col items-center justify-center text-center p-4">
                <BrainCircuit className="text-muted-foreground mb-3" size={32} />
                <h3 className="font-semibold text-foreground">Your Focus Stories</h3>
                <p className="text-sm text-muted-foreground mt-1">Complete a focus session to see your achievements here!</p>
            </div>
        </Card>
    );
  }
  return (
    <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Recent Stories</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin">
            {focusStories.map(story => (
                <MiniStoryCard key={story.id} story={story} />
            ))}
        </div>
    </div>
  );
};
export default StoryCarousel;