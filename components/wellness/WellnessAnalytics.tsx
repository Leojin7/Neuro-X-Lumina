import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Loader2, Sparkles, BrainCircuit, Moon } from 'lucide-react';
import Button from '../Button';
import { useUserStore } from '../../stores/useUserStore';
import { generateWellnessInsights } from '../../services/geminiService';
interface Insight {
    title: string;
    insight: string;
}
const WellnessAnalytics = () => {
    const { dailyCheckins, sleepEntries, focusStories } = useUserStore();
    const [insights, setInsights] = useState<Insight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const fetchInsights = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await generateWellnessInsights({
                    checkins: dailyCheckins,
                    sleep: sleepEntries,
                    focus: focusStories
                });
                setInsights(result);
            } catch (err) {
                console.error("Failed to generate insights:", err);
                setError("Sorry, we couldn't generate your insights at this time.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInsights();
    }, [dailyCheckins, sleepEntries, focusStories]);
    const insightIcons = [
        <Sparkles className="h-6 w-6 text-yellow-400" />,
        <BrainCircuit className="h-6 w-6 text-blue-400" />,
        <Moon className="h-6 w-6 text-indigo-400" />,
    ];
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-semibold text-white">Your AI is analyzing your data...</h3>
                <p className="text-white/70 mt-2">Discovering correlations in your wellness journey.</p>
            </div>
        );
    }
    if (error) {
         return (
            <div className="text-center py-16 text-red-400">
                <p>{error}</p>
            </div>
        );
    }
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <div className="inline-block p-3 rounded-full bg-amber-500/20 mb-4">
                    <BarChart3 className="h-8 w-8 text-amber-400" />
                </div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-200">
                    Your Correlation Stories
                </h2>
                <p className="text-white/70 text-lg max-w-2xl mx-auto mt-2">
                    NeuroLearn's AI has analyzed your recent activity to uncover connections between your habits, mood, and performance. Here are your personalized insights.
                </p>
            </div>
            <div className="space-y-6">
                <AnimatePresence>
                    {insights.map((insight, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-start gap-4"
                        >
                            <div className="p-3 bg-white/10 rounded-full mt-1">
                                {insightIcons[index % insightIcons.length]}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{insight.title}</h3>
                                <p className="text-white/80 mt-2 leading-relaxed">{insight.insight}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                 {insights.length === 0 && !isLoading && (
                     <div className="text-center py-16 text-white/60">
                         <p>Not enough data to generate insights yet.</p>
                         <p className="text-sm">Keep using NeuroLearn's features to unlock your stories!</p>
                     </div>
                 )}
            </div>
        </div>
    );
};
export default WellnessAnalytics;
