import React, { useState, useEffect } from 'react';
import { useUserStore } from '../stores/useUserStore';
import type { Mood } from '../types';
import Card from './Card';
import Button from './Button';
import { Sunrise, Sunset, Send, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupportiveReply } from '../services/geminiService';
const toYYYYMMDD = (date: Date) => date.toISOString().slice(0, 10);
const DailyCheckin = () => {
  const { dailyCheckins, addOrUpdateCheckin } = useUserStore();
  const todayStr = toYYYYMMDD(new Date());
  const todayCheckin = dailyCheckins.find(c => c.date === todayStr);
  const [mode, setMode] = useState<'hidden' | 'morning' | 'evening' | 'done'>('hidden');
  // Morning state
  const [intention, setIntention] = useState('');
  const [morningMood, setMorningMood] = useState<Mood | null>(null);
  // Evening state
  const [reflection, setReflection] = useState('');
  const [eveningMood, setEveningMood] = useState<Mood | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiReply, setAiReply] = useState('');
  useEffect(() => {
    const hour = new Date().getHours();
    if (todayCheckin?.reflection) {
      setMode('done');
      return;
    }
    if (hour >= 16) {
      setMode('evening');
      return;
    }
    if (hour >= 5 && hour < 12) {
      if (!todayCheckin?.intention) {
        setMode('morning');
      } else {
        setMode('hidden');
      }
      return;
    }
    setMode('hidden');
  }, [todayCheckin]);
  const moodOptions: { mood: Mood; label: string; icon: string; }[] = [
    { mood: 'awful', label: 'Awful', icon: '😞' },
    { mood: 'bad', label: 'Bad', icon: '😕' },
    { mood: 'ok', label: 'OK', icon: '😐' },
    { mood: 'good', label: 'Good', icon: '😊' },
    { mood: 'great', label: 'Great', icon: '😄' },
  ];
  const handleMorningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intention || !morningMood) return;
    setIsLoading(true);
    addOrUpdateCheckin({ mood: morningMood, intention });
    const reply = await getSupportiveReply('intention', intention);
    setAiReply(reply);
    setIsLoading(false);
    setTimeout(() => {
        setMode('hidden');
        setAiReply('');
    }, 4000);
  };
  const handleEveningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection || !eveningMood) return;
    setIsLoading(true);
    addOrUpdateCheckin({ mood: eveningMood, reflection });
    const reply = await getSupportiveReply('reflection', reflection);
    setAiReply(reply);
    setIsLoading(false);
    setTimeout(() => setMode('done'), 4000);
  };
  if (mode === 'hidden' || (mode === 'done' && !aiReply)) {
    return null;
  }
  const renderForm = () => {
      if (aiReply) {
        return (
             <div className="text-center p-4">
              <CheckCircle className="mx-auto text-primary h-12 w-12 mb-4" />
              <p className="text-lg text-foreground font-semibold">"{aiReply}"</p>
            </div>
        )
      }
      if (mode === 'morning') {
          return (
             <form onSubmit={handleMorningSubmit}>
              <h3 className="flex items-center gap-2 text-xl font-bold text-foreground mb-4"><Sunrise className="text-yellow-400" /> Sunrise Intention</h3>
              <p className="text-muted-foreground mb-3 text-sm">How are you feeling this morning?</p>
              <div className="flex justify-around mb-4">
                {moodOptions.map(({ mood, icon, label }) => (
                  <button type="button" key={mood} onClick={() => setMorningMood(mood)} className={`text-center transition-transform hover:scale-110 ${morningMood === mood ? 'scale-110' : 'opacity-60'}`}>
                    <span className={`text-3xl ${morningMood === mood ? 'drop-shadow-[0_0_5px_#fff]' : ''}`}>{icon}</span>
                    <p className={`text-xs font-semibold ${morningMood === mood ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</p>
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground mb-2 text-sm">What is your main intention for today?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={intention}
                  onChange={e => setIntention(e.target.value)}
                  placeholder="e.g., 'Stay focused on my biology chapter'"
                  className="flex-1 bg-input rounded-md px-4 py-2 text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <Button type="submit" disabled={!intention || !morningMood || isLoading} size="icon">
                  {isLoading ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                </Button>
              </div>
            </form>
          )
      }
       if (mode === 'evening') {
          return (
            <form onSubmit={handleEveningSubmit}>
              <h3 className="flex items-center gap-2 text-xl font-bold text-foreground mb-4"><Sunset className="text-orange-400" /> Sunset Reflection</h3>
              <p className="text-muted-foreground mb-3 text-sm">How are you feeling now?</p>
              <div className="flex justify-around mb-4">
                {moodOptions.map(({ mood, icon, label }) => (
                  <button type="button" key={mood} onClick={() => setEveningMood(mood)} className={`text-center transition-transform hover:scale-110 ${eveningMood === mood ? 'scale-110' : 'opacity-60'}`}>
                    <span className={`text-3xl ${eveningMood === mood ? 'drop-shadow-[0_0_5px_#fff]' : ''}`}>{icon}</span>
                    <p className={`text-xs font-semibold ${eveningMood === mood ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</p>
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground mb-2 text-sm">What is one thing you accomplished or are grateful for?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  placeholder="e.g., 'Finished my notes and enjoyed the sunshine'"
                  className="flex-1 bg-input rounded-md px-4 py-2 text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <Button type="submit" disabled={!reflection || !eveningMood || isLoading} size="icon">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                </Button>
              </div>
            </form>
          )
      }
      return (
            <div className="text-center p-4">
              <CheckCircle className="mx-auto text-primary h-12 w-12 mb-4" />
              <p className="text-lg text-foreground font-semibold">Your check-in for today is complete. Well done!</p>
            </div>
      );
  }
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, height: 0, y: -20, transition: { duration: 0.3 } }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <Card className="bg-muted/20">
            {renderForm()}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
export default DailyCheckin;