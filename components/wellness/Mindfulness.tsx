import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play, Pause, Volume2, StopCircle, Loader2 } from 'lucide-react';
import Button from '../Button';
import { generateMindfulnessStream } from '../../services/geminiService';
const Mindfulness = () => {
    const [duration, setDuration] = useState(3);
    const [sessionState, setSessionState] = useState<'idle' | 'generating' | 'playing' | 'finished'>('idle');
    const [script, setScript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const scriptContainerRef = useRef<HTMLDivElement>(null);
    const stopSession = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSessionState('idle');
        setScript('');
    };
    useEffect(() => {
        // Cleanup on unmount
        return () => {
            window.speechSynthesis.cancel();
        }
    }, []);
    const startSession = async () => {
        setSessionState('generating');
        setScript('');
        try {
            const stream = await generateMindfulnessStream(duration);
            let fullScript = '';
            for await (const chunk of stream) {
                fullScript += chunk.text;
                setScript(fullScript);
                if (scriptContainerRef.current) {
                    scriptContainerRef.current.scrollTop = scriptContainerRef.current.scrollHeight;
                }
            }
            setSessionState('playing');
        } catch (error) {
            console.error("Failed to stream mindfulness session:", error);
            setScript("Sorry, there was an error starting the session. Please try again.");
            setSessionState('finished');
        }
    };
    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(script);
            utterance.rate = 0.85; // Slower, more calming pace
            utterance.pitch = 1; // Natural pitch
            utterance.onend = () => {
                setIsSpeaking(false);
                setSessionState('finished');
            };
            utterance.onerror = () => {
                setIsSpeaking(false);
            }
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <div className="inline-block p-3 rounded-full bg-green-500/20 mb-4">
                    <Heart className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-green-200">
                    AI Mindfulness Guide
                </h2>
                <p className="text-white/70 text-lg max-w-2xl mx-auto mt-2">
                    Experience a unique, AI-generated mindfulness session every time. Calm your mind and ground your thoughts with a personalized guide.
                </p>
            </div>
            <AnimatePresence mode="wait">
                {sessionState === 'idle' ? (
                    <motion.div
                        key="setup"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center gap-6"
                    >
                        <div className="text-center">
                            <label htmlFor="session-duration" className="block text-sm font-medium text-white mb-2">Session Duration</label>
                            <div className="flex items-center justify-center gap-2">
                                {[1, 3, 5, 10].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDuration(d)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${duration === d ? 'bg-green-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                                    >
                                        {d} min
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button onClick={startSession} size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600">
                            <Play className="mr-2 h-5 w-5" />
                            Begin Session
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="session"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center gap-6"
                    >
                        <div ref={scriptContainerRef} className="w-full h-80 overflow-y-auto p-4 bg-black/20 rounded-lg text-lg text-white/90 leading-relaxed custom-scrollbar">
                           {sessionState === 'generating' && <Loader2 className="w-8 h-8 mx-auto animate-spin text-green-400"/>}
                           {script}
                        </div>
                        <div className="flex gap-4">
                            {sessionState === 'playing' && (
                                <Button onClick={handleSpeak} size="lg" variant="secondary">
                                    {isSpeaking ? <Pause className="mr-2"/> : <Volume2 className="mr-2"/>}
                                    {isSpeaking ? 'Pause Reading' : 'Read Aloud'}
                                </Button>
                            )}
                             <Button onClick={stopSession} size="lg" variant="destructive" className="bg-red-500/80">
                                <StopCircle className="mr-2" /> End Session
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default Mindfulness;
