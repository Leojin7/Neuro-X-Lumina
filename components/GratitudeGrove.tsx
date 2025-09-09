import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { useUserStore } from '../stores/useUserStore';
import { 
  Flower2, 
  Plus, 
  Sparkles, 
  Calendar, 
  Trophy, 
  Heart,
  Star,
  Sun
} from 'lucide-react';
const GratitudePlant = ({ entryText, index }: { entryText: string; index: number }) => {
    const randomDelay = Math.random() * 0.5;
    const randomDuration = 1 + Math.random();
    const colors = ['#2dd4bf', '#a78bfa', '#f472b6', '#fbbf24', '#60a5fa', '#34d399', '#fb7185'];
    const color = colors[index % colors.length];
    const flowerTypes = [Flower2, Star, Heart, Sun];
    const FlowerIcon = flowerTypes[index % flowerTypes.length];
    return (
        <motion.div
            className="absolute bottom-0"
            style={{
                left: `${5 + (index * 12) % 85}%`,
                transformOrigin: 'bottom center'
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: '100%', opacity: 1 }}
            transition={{ delay: 0.2 + randomDelay, duration: randomDuration, type: 'spring' }}
        >
            {}
            <div className="relative w-2 h-full bg-gradient-to-t from-green-600/40 to-green-400/20 rounded-t-full" />
            {}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                    delay: 0.2 + randomDelay + randomDuration / 2, 
                    type: 'spring',
                    stiffness: 200
                }}
                className="absolute -top-2 left-1/2 -translate-x-1/2"
            >
                <div 
                    className="p-1 rounded-full"
                    style={{ backgroundColor: `${color}20` }}
                >
                    <FlowerIcon size={28} style={{ color }} />
                </div>
            </motion.div>
            {}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + randomDelay + randomDuration / 3 }}
                className="absolute top-1/3 -left-1 w-3 h-2 bg-green-400/60 rounded-full transform -rotate-45"
            />
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + randomDelay + randomDuration / 3 }}
                className="absolute top-1/2 -right-1 w-3 h-2 bg-green-400/60 rounded-full transform rotate-45"
            />
        </motion.div>
    );
};
const GratitudeStats = ({ entries }: { entries: any[] }) => {
    const today = new Date().toDateString();
    const todayEntries = entries.filter(entry => new Date(entry.date).toDateString() === today).length;
    const thisWeek = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate > weekAgo;
    }).length;
    const streak = calculateStreak(entries);
    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl font-bold text-yellow-400">{todayEntries}</div>
                <div className="text-sm text-white/60">Today</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl font-bold text-green-400">{thisWeek}</div>
                <div className="text-sm text-white/60">This Week</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl font-bold text-purple-400">{streak}</div>
                <div className="text-sm text-white/60">Day Streak</div>
            </div>
        </div>
    );
};
const calculateStreak = (entries: any[]) => {
    if (entries.length === 0) return 0;
    const sortedDates = [...new Set(entries.map(entry => new Date(entry.date).toDateString()))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 0;
    const today = new Date().toDateString();
    for (let i = 0; i < sortedDates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        if (sortedDates[i] === expectedDate.toDateString()) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
};
const GratitudeGrove = () => {
    const { gratitudeEntries, addGratitudeEntry } = useUserStore();
    const [newEntry, setNewEntry] = useState('');
    const [selectedPrompt, setSelectedPrompt] = useState('');
    const gratitudePrompts = [
        "A person who made me smile today",
        "Something beautiful I noticed",
        "A skill or talent I have",
        "A comfortable place in my home",
        "A song that lifts my mood",
        "Someone who believes in me",
        "A lesson I learned recently",
        "Something my body can do",
        "A memory that makes me happy",
        "A challenge that made me stronger"
    ];
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEntry.trim()) return;
        addGratitudeEntry(newEntry);
        setNewEntry('');
        setSelectedPrompt('');
    };
    const handlePromptSelect = (prompt: string) => {
        setSelectedPrompt(prompt);
        setNewEntry('');
    };
    return (
        <div className="space-y-8">
            {}
            <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-pink-500/20">
                        <Flower2 className="h-8 w-8 text-pink-400" />
                    </div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-400">
                        Your Gratitude Grove
                    </h2>
                </div>
                <p className="text-white/70 max-w-2xl mx-auto">
                    Cultivate positivity and watch your mental garden bloom. Each gratitude entry plants a new flower, 
                    creating a beautiful visualization of your appreciation journey.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {}
                <div className="space-y-6">
                    <GratitudeStats entries={gratitudeEntries} />
                    <div className="relative w-full h-80 bg-gradient-to-t from-green-900/20 via-green-800/10 to-blue-900/20 rounded-2xl overflow-hidden border border-white/10">
                        {}
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-400/10 via-pink-300/5 to-transparent" />
                        {}
                        <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-green-900/30 to-transparent" />
                        {}
                        <AnimatePresence>
                            {gratitudeEntries.map((entry, index) => (
                                <GratitudePlant key={entry.id} entryText={entry.text} index={index} />
                            ))}
                        </AnimatePresence>
                        {}
                        {gratitudeEntries.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <Sparkles className="h-12 w-12 text-white/30 mx-auto mb-4" />
                                    <p className="text-white/60">Your garden awaits the first seed of gratitude</p>
                                </div>
                            </div>
                        )}
                        {}
                        <div className="absolute top-4 right-4">
                            <Sun className="h-8 w-8 text-yellow-300/60" />
                        </div>
                    </div>
                </div>
                {}
                <div className="space-y-6">
                    {}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400" />
                            Gratitude Prompts
                        </h3>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                            {gratitudePrompts.slice(0, 5).map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePromptSelect(prompt)}
                                    className={`text-left p-3 rounded-xl transition-all duration-200 border ${
                                        selectedPrompt === prompt 
                                            ? 'border-pink-400 bg-pink-500/20' 
                                            : 'border-white/20 bg-white/5 hover:border-white/40'
                                    }`}
                                >
                                    <p className="text-sm text-white/90">{prompt}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    {}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-white font-semibold flex items-center gap-2">
                                <Heart className="h-4 w-4 text-pink-400" />
                                What are you grateful for today?
                            </label>
                            {selectedPrompt && (
                                <p className="text-sm text-pink-300/80 italic">Prompt: {selectedPrompt}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newEntry}
                                onChange={(e) => setNewEntry(e.target.value)}
                                placeholder={selectedPrompt || "e.g., 'A warm cup of coffee on a cold morning'"}
                                className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                            />
                            <Button 
                                type="submit" 
                                disabled={!newEntry.trim()} 
                                size="icon"
                                className="px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-rose-500 hover:to-pink-600"
                            >
                                <Plus size={18} />
                            </Button>
                        </div>
                    </form>
                    {}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-400" />
                            Recent Entries
                        </h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {gratitudeEntries.length === 0 ? (
                                <p className="text-white/60 text-center py-8 italic">
                                    Your gratitude journal is waiting for its first entry...
                                </p>
                            ) : (
                                [...gratitudeEntries].reverse().map((entry, index) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10"
                                    >
                                        <p className="text-white mb-2">{entry.text}</p>
                                        <p className="text-xs text-white/60 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(entry.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default GratitudeGrove;
