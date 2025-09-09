import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import Button from '../Button';
import { generateFocusPlan } from '../../services/geminiService';
const DigitalWellbeing = () => {
    const [goal, setGoal] = useState('');
    const [duration, setDuration] = useState(60); // Default 60 minutes
    const [isLoading, setIsLoading] = useState(false);
    const [plan, setPlan] = useState<string | null>(null);
    const [isShieldActive, setIsShieldActive] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal.trim()) return;
        setIsLoading(true);
        setPlan(null);
        setIsShieldActive(false);
        try {
            const result = await generateFocusPlan(goal, duration);
            setPlan(result);
        } catch (error) {
            console.error("Failed to generate focus plan:", error);
            setPlan("Sorry, there was an error creating your focus plan. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    // Simple markdown-to-HTML parser for plan display
    const PlanDisplay = ({ content }: { content: string }) => {
        const lines = content.split('\n').map((line, i) => {
            if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-primary mt-4 mb-2">{line.replace('### ', '')}</h3>;
            if (line.startsWith('- ')) return <li key={i} className="flex items-start gap-2"><span className="text-primary mt-1">∙</span>{line.replace('- ', '')}</li>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i}>{line}</p>;
        });
        return <div className="prose prose-invert prose-p:text-muted-foreground">{lines}</div>;
    };
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <div className="inline-block p-3 rounded-full bg-purple-500/20 mb-4">
                    <Shield className="h-8 w-8 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                    Focus Filter AI
                </h2>
                <p className="text-white/70 text-lg max-w-2xl mx-auto mt-2">
                    Create an intelligent focus environment. Tell the AI your goal, and it will generate a shield plan to minimize distractions and maximize productivity.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div>
                    <label htmlFor="focus-goal" className="block text-sm font-medium text-white mb-2">What is your primary goal for this session?</label>
                    <input
                        id="focus-goal"
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="e.g., 'Master Chapter 3 of Quantum Physics'"
                        className="w-full bg-white/5 rounded-xl p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-white/20"
                    />
                </div>
                <div>
                    <label htmlFor="focus-duration" className="block text-sm font-medium text-white mb-2">Focus Duration: <span className="font-bold text-purple-300">{duration} minutes</span></label>
                    <input
                        id="focus-duration"
                        type="range"
                        min="25"
                        max="120"
                        step="5"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    />
                </div>
                <Button type="submit" size="lg" disabled={isLoading || !goal.trim()} className="w-full bg-gradient-to-r from-purple-600 to-violet-600">
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                    Generate Focus Plan
                </Button>
            </form>
            <AnimatePresence>
                {plan && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/5 p-6 rounded-2xl border border-white/10"
                    >
                        {isShieldActive ? (
                            <div className="text-center py-8">
                                <motion.div initial={{scale: 0.5}} animate={{scale: 1}} transition={{type: 'spring'}}>
                                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4"/>
                                </motion.div>
                                <h3 className="text-2xl font-bold text-green-400">Focus Shield: Engaged</h3>
                                <p className="text-white/70 mt-2">Your focus plan is active. You've got this!</p>
                            </div>
                        ) : (
                            <>
                                <PlanDisplay content={plan} />
                                <div className="text-center mt-6">
                                    <Button onClick={() => setIsShieldActive(true)} size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600">
                                        <Shield className="mr-2 h-5 w-5" />
                                        Activate Focus Shield
                                    </Button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default DigitalWellbeing;