import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sparkles, Loader2, Edit } from 'lucide-react';
import Button from '../Button';
import CircularProgress from '../CircularProgress';
import { generateSleepAdvice } from '../../services/geminiService';
import { useUserStore } from '../../stores/useUserStore';
const toYYYYMMDD = (date: Date) => date.toISOString().slice(0, 10);
const SleepWellness = () => {
    const { sleepEntries, addSleepEntry } = useUserStore();
    // Form state
    const [duration, setDuration] = useState(7.5);
    const [quality, setQuality] = useState(85);
    // UI/Flow state
    const [view, setView] = useState<'loading' | 'form' | 'result'>('loading');
    const [result, setResult] = useState<{ score: number; advice: string } | null>(null);
    const runAnalysis = async (sleepDuration: number, sleepQuality: number) => {
        setView('loading');
        try {
            const adviceResult = await generateSleepAdvice(sleepDuration, sleepQuality, sleepEntries);
            setResult(adviceResult);
            setView('result');
        } catch (error) {
            console.error("Failed to get sleep advice:", error);
            setResult({ score: 0, advice: "Sorry, there was an error getting your analysis. Please try again." });
            setView('result');
        }
    };
    // On component mount, check if today's sleep has been logged.
    useEffect(() => {
        const todayStr = toYYYYMMDD(new Date());
        const todaysEntry = sleepEntries.find(entry => entry.date === todayStr);
        if (todaysEntry) {
            setDuration(todaysEntry.duration);
            setQuality(todaysEntry.quality);
            runAnalysis(todaysEntry.duration, todaysEntry.quality);
        } else {
            setView('form');
        }
    }, []); // Run only on mount
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        addSleepEntry({ duration, quality });
        await runAnalysis(duration, quality);
    };
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <div className="inline-block p-3 rounded-full bg-indigo-500/20 mb-4">
                    <Moon className="h-8 w-8 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                    Cognitive Recharge
                </h2>
                <p className="text-white/70 text-lg max-w-2xl mx-auto mt-2">
                    Log your sleep to receive an AI-powered "Cognitive Recharge Score" and personalized advice to optimize your day for peak performance.
                </p>
            </div>
            <AnimatePresence mode="wait">
                {view === 'loading' && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
                    </motion.div>
                )}
                {view === 'form' && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                                <h3 className="text-lg font-bold text-white">Log Today's Sleep</h3>
                                <div>
                                    <label htmlFor="sleep-duration" className="block text-sm font-medium text-white mb-2">Sleep Duration: <span className="font-bold text-indigo-300">{duration.toFixed(1)} hours</span></label>
                                    <input
                                        id="sleep-duration"
                                        type="range"
                                        min="4"
                                        max="12"
                                        step="0.1"
                                        value={duration}
                                        onChange={(e) => setDuration(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="sleep-quality" className="block text-sm font-medium text-white mb-2">Sleep Quality: <span className="font-bold text-indigo-300">{quality}%</span></label>
                                    <input
                                        id="sleep-quality"
                                        type="range"
                                        min="50"
                                        max="100"
                                        step="1"
                                        value={quality}
                                        onChange={(e) => setQuality(parseInt(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                                    />
                                </div>
                                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600">
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Analyze My Sleep
                                </Button>
                            </form>
                             <div className="text-center text-white/40">
                                <Moon className="h-24 w-24 mx-auto" />
                                <p className="mt-4">Your analysis will appear here.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
                {view === 'result' && result && (
                     <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center"
                    >
                        <h3 className="text-xl font-bold text-white mb-6">Today's Cognitive Recharge Score</h3>
                        <div className="relative mx-auto w-48 h-48 mb-6">
                            <CircularProgress progress={result.score} size={192} strokeWidth={12} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-4xl font-bold text-indigo-300">{Math.round(result.score)}%</p>
                                <p className="text-sm text-white/70">Recharge</p>
                            </div>
                        </div>
                        <p className="text-white/80 mt-6 leading-relaxed max-w-xl mx-auto">{result.advice}</p>
                        <Button onClick={() => setView('form')} variant="secondary" className="mt-8">
                            <Edit className="mr-2 h-4 w-4" />
                            Log Again
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default SleepWellness;
