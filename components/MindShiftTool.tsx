import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { 
  Loader2, 
  BrainCircuit, 
  RefreshCw, 
  Check, 
  Star, 
  Heart,
  TrendingUp,
  Lightbulb,
  Shield
} from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import { getMindShiftGuidance } from '../services/geminiService';
import SubscriptionGate from './SubscriptionGate';
import * as ReactRouterDOM from 'react-router-dom';
import type { MoodLevel } from '../types';
type ShiftState = 'idle' | 'challenging' | 'reframing' | 'complete';
interface Message {
    role: 'user' | 'ai';
    text: string;
}
const MoodSelector = ({ 
  value, 
  onChange, 
  label 
}: { 
  value: MoodLevel | null; 
  onChange: (mood: MoodLevel) => void; 
  label: string;
}) => {
  const moods = [
    { level: 1 as MoodLevel, emoji: '😰', label: 'Very Low', color: 'text-red-500' },
    { level: 2 as MoodLevel, emoji: '😟', label: 'Low', color: 'text-orange-500' },
    { level: 3 as MoodLevel, emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
    { level: 4 as MoodLevel, emoji: '🙂', label: 'Good', color: 'text-green-400' },
    { level: 5 as MoodLevel, emoji: '😊', label: 'Great', color: 'text-green-500' },
  ];
  return (
    <div className="space-y-3">
      <p className="text-white/90 font-medium">{label}</p>
      <div className="flex gap-2 justify-center">
        {moods.map((mood) => (
          <button
            key={mood.level}
            onClick={() => onChange(mood.level)}
            className={`p-3 rounded-xl transition-all duration-200 border-2 ${
              value === mood.level 
                ? 'border-blue-400 bg-blue-500/20 scale-110' 
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:scale-105'
            }`}
          >
            <div className="text-2xl mb-1">{mood.emoji}</div>
            <div className={`text-xs font-medium ${mood.color}`}>{mood.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
const MindShiftTool = () => {
    const { addMindShiftEntry } = useUserStore();
    const navigate = ReactRouterDOM.useNavigate();
    const [thought, setThought] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [state, setState] = useState<ShiftState>('idle');
    const [isLoading, setIsLoading] = useState(false);
    const [reframe, setReframe] = useState('');
    const [moodBefore, setMoodBefore] = useState<MoodLevel | null>(null);
    const [moodAfter, setMoodAfter] = useState<MoodLevel | null>(null);
    const [category, setCategory] = useState<string>('');
    const thoughtCategories = [
      { id: 'self-doubt', label: 'Self-Doubt', icon: '🤔' },
      { id: 'anxiety', label: 'Anxiety', icon: '😰' },
      { id: 'perfectionism', label: 'Perfectionism', icon: '🎯' },
      { id: 'comparison', label: 'Social Comparison', icon: '👥' },
      { id: 'failure', label: 'Fear of Failure', icon: '💭' },
      { id: 'rejection', label: 'Fear of Rejection', icon: '💔' },
    ];
    const startShift = (e: React.FormEvent) => {
        e.preventDefault();
        if (!thought.trim() || !moodBefore) return;
        setMessages([{ role: 'user', text: thought }]);
        fetchGuidance('challenge');
        setState('challenging');
    };
    const fetchGuidance = async (step: 'challenge' | 'reframe') => {
        setIsLoading(true);
        try {
            const guidance = await getMindShiftGuidance(thought, step);
            setMessages(prev => [...prev, { role: 'ai', text: guidance }]);
            if (step === 'reframe') {
                const suggestedReframe = guidance.split(':').pop()?.trim() || guidance;
                setReframe(suggestedReframe);
                setState('complete');
            }
        } catch (error) {
            console.error("MindShift guidance failed:", error);
            setMessages(prev => [...prev, { role: 'ai', text: "I'm here to help you work through this thought. Let's try a different approach." }]);
        } finally {
            setIsLoading(false);
        }
    };
    const handleReframe = () => {
        setState('reframing');
        fetchGuidance('reframe');
    };
    const handleComplete = () => {
        if (moodAfter && moodBefore) {
            addMindShiftEntry({ 
                negativeThought: thought, 
                reframe,
                moodBefore,
                moodAfter,
                category: category || 'general'
            });
        }
        reset();
    };
    const reset = () => {
        setThought('');
        setMessages([]);
        setState('idle');
        setIsLoading(false);
        setReframe('');
        setMoodBefore(null);
        setMoodAfter(null);
        setCategory('');
    };
    return (
        <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key={state}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {state === 'idle' && (
                        <div className="space-y-8">
                            {}
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    <div className="p-3 rounded-full bg-blue-500/20">
                                        <BrainCircuit className="h-8 w-8 text-blue-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                                        Challenge a Negative Thought
                                    </h2>
                                </div>
                                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                                    Transform negative thinking patterns through evidence-based cognitive behavioral techniques. 
                                    Let's work together to reframe your thoughts and improve your mental wellbeing.
                                </p>
                            </div>
                            <form onSubmit={startShift} className="space-y-8">
                                {}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white">What type of thought is bothering you?</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {thoughtCategories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCategory(cat.id)}
                                                className={`p-4 rounded-xl transition-all duration-200 border-2 ${
                                                    category === cat.id 
                                                        ? 'border-blue-400 bg-blue-500/20' 
                                                        : 'border-white/20 bg-white/5 hover:border-white/40'
                                                }`}
                                            >
                                                <div className="text-2xl mb-2">{cat.icon}</div>
                                                <div className="text-sm font-medium text-white">{cat.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white">Write down the specific thought</h3>
                                    <textarea
                                        value={thought}
                                        onChange={(e) => setThought(e.target.value)}
                                        placeholder="e.g., 'I'm not smart enough for this course.' or 'Everyone thinks I'm weird.'"
                                        className="w-full bg-white/5 rounded-xl p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[120px] border border-white/20"
                                        required
                                    />
                                </div>
                                {}
                                <MoodSelector 
                                    value={moodBefore} 
                                    onChange={setMoodBefore} 
                                    label="How are you feeling right now?"
                                />
                                <div className="text-center">
                                    <Button 
                                        type="submit" 
                                        size="lg" 
                                        disabled={!thought.trim() || !moodBefore}
                                        className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-violet-600 hover:to-blue-700"
                                    >
                                        <Shield className="mr-2 h-5 w-5" />
                                        Start MindShift Journey
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                    {state !== 'idle' && (
                        <div className="space-y-6">
                            {}
                            <div className="space-y-4 bg-white/[0.02] backdrop-blur-sm p-6 rounded-2xl border border-white/10 min-h-[300px] max-h-[500px] overflow-y-auto">
                                {messages.map((msg, index) => (
                                    <motion.div 
                                        key={index} 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                                    >
                                        {msg.role === 'ai' && (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex-shrink-0 flex items-center justify-center">
                                                <BrainCircuit size={20} className="text-white"/>
                                            </div>
                                        )}
                                        <div className={`max-w-md p-4 rounded-xl ${
                                            msg.role === 'ai' 
                                                ? 'bg-white/10 border border-white/20' 
                                                : 'bg-gradient-to-r from-blue-600 to-violet-600'
                                        }`}>
                                            <p className={`whitespace-pre-wrap ${
                                                msg.role === 'ai' ? 'text-white' : 'text-white'
                                            }`}>
                                                {msg.text}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex-shrink-0 flex items-center justify-center">
                                            <BrainCircuit size={20} className="text-white"/>
                                        </div>
                                        <div className="bg-white/10 border border-white/20 p-4 rounded-xl">
                                            <Loader2 className="animate-spin text-blue-400" />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                            {}
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={reset} className="text-white/70 hover:text-white">
                                    <RefreshCw size={16} className="mr-2"/> 
                                    Start Over
                                </Button>
                                {state === 'challenging' && !isLoading && (
                                    <Button 
                                        onClick={handleReframe}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-700"
                                    >
                                        <Lightbulb className="mr-2 h-4 w-4" />
                                        Find New Perspective
                                    </Button>
                                )}
                                {state === 'complete' && (
                                    <div className="space-y-4">
                                        <MoodSelector 
                                            value={moodAfter} 
                                            onChange={setMoodAfter} 
                                            label="How do you feel now?"
                                        />
                                        <Button 
                                            onClick={handleComplete} 
                                            disabled={!moodAfter}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-700"
                                        >
                                            <Check size={16} className="mr-2"/> 
                                            Complete & Save Progress
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
export default MindShiftTool;