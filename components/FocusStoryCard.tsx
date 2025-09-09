
import React from 'react';
import type { FocusStory } from '../types';
import { useUserStore } from '../stores/useUserStore';
import { BrainCircuit, Coins, Sun, Activity, Zap, Circle, MousePointerClick, Frown, Battery } from 'lucide-react';
interface FocusStoryCardProps {
  story: FocusStory;
  cardRef: React.RefObject<HTMLDivElement>;
}
const FocusStoryCard: React.FC<FocusStoryCardProps> = ({ story, cardRef }) => {
  const { currentUser } = useUserStore();
  const userAvatar = currentUser?.photoURL || `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${currentUser?.uid}`;
  const userName = currentUser?.displayName || 'A Focused Learner';
  const cognitiveStateIcons: Record<string, React.ReactNode> = {
    'Deep Focus': <BrainCircuit className="text-green-300" />,
    'Neutral': <Circle className="text-yellow-300" />,
    'Slightly Distracted': <MousePointerClick className="text-orange-300" />,
    'Visibly Stressed': <Frown className="text-red-300" />,
    'Tired': <Battery className="text-blue-300" />,
  };
  const loadColors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-red-400'
  }
  return (
    <div 
        ref={cardRef}
        className="w-[350px] h-[600px] bg-gradient-to-br from-background to-slate-900 p-6 flex flex-col rounded-4xl shadow-2xl border border-border text-foreground overflow-hidden"
    >
        <div className="flex items-center gap-3">
            <img src={userAvatar} alt="User Avatar" className="w-12 h-12 rounded-full border-2 border-primary" />
            <div>
                <p className="font-bold text-lg">{userName}</p>
                <p className="text-xs text-muted-foreground">{new Date(story.date).toLocaleDateString('en-us', { month: 'long', day: 'numeric', year: 'numeric'})}</p>
            </div>
            <BrainCircuit className="ml-auto text-primary" size={32} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center my-4">
            <h2 className="text-2xl font-semibold tracking-tighter">Completed a</h2>
            <h1 className="text-6xl font-bold my-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-400">Focus Session</h1>
            <p className="text-muted-foreground">and stayed on track!</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
             <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <Sun className="mx-auto text-primary mb-2" size={28} />
                <p className="text-2xl font-bold">{story.duration}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Minutes</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <Coins className="mx-auto text-yellow-400 mb-2" size={28} />
                <p className="text-2xl font-bold">+{story.coinsEarned}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">FocusCoins</p>
            </div>
        </div>
        {}
        <div className="bg-muted/30 p-4 rounded-xl border border-border mt-4">
            <h4 className="text-sm font-bold text-muted-foreground mb-3 text-center uppercase tracking-wider">Post-Focus Analytics</h4>
            <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                    <Zap className="mx-auto text-primary mb-1" size={24} />
                    <p className="text-xl font-bold">{story.flowState}%</p>
                    <p className="text-xs text-muted-foreground">Flow State</p>
                </div>
                 <div className="text-center">
                    <Activity className={`mx-auto mb-1 ${loadColors[story.cognitiveLoad]}`} size={24} />
                    <p className={`text-xl font-bold capitalize ${loadColors[story.cognitiveLoad]}`}>{story.cognitiveLoad}</p>
                    <p className="text-xs text-muted-foreground">Cognitive Load</p>
                </div>
            </div>
             {story.cognitiveStateResult && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-primary/20 rounded-full flex-shrink-0">
                        {cognitiveStateIcons[story.cognitiveStateResult.cognitive_state]}
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Cognitive State: {story.cognitiveStateResult.cognitive_state}</p>
                        <p className="text-xs text-muted-foreground">Top Indicator: "{story.cognitiveStateResult.key_indicators[0]}"</p>
                    </div>
                </div>
            )}
        </div>
        <div className="mt-auto text-center pt-4">
            <p className="text-sm font-bold text-primary">Powered by NeuroLearn</p>
        </div>
    </div>
  );
};
export default FocusStoryCard;
