import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Loader2, FileText, AudioLines, Video, Map, Play, Pause, Download } from 'lucide-react';
import MindMap from '../components/MindMap';
import * as gemini from '../services/geminiService';
import type { NotebookScript, NotebookSlide } from '../types';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
type StudioTab = 'summary' | 'audio' | 'video' | 'map';
const ElegantShape = ({ className, delay = 0, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]" }: { className?: string; delay?: number; width?: number; height?: number; rotate?: number; gradient?: string; }) => (
    <motion.div initial={{ opacity: 0, y: -150, rotate: rotate - 15 }} animate={{ opacity: 1, y: 0, rotate }} transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }} className={`absolute ${className}`}>
        <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} style={{ width, height }} className="relative">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-white/10 shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]`} />
        </motion.div>
    </motion.div>
);
const NotebookLM: React.FC = () => {
    const [sourceText, setSourceText] = useState('');
    const [script, setScript] = useState<NotebookScript | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<StudioTab>('summary');
    const handleAnalyze = async () => {
        if (!sourceText.trim()) {
            setError('Please provide some source text to analyze.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setScript(null);
        try {
            const result = await gemini.generateNotebookScript(sourceText);
            setScript(result);
            setActiveTab('summary');
        } catch (err) {
            console.error("Failed to generate notebook script:", err);
            setError("Sorry, the AI couldn't process this text. Please try again with different content.");
            toast.error("Analysis failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
            <div className="absolute inset-0 overflow-hidden dark">
                <ElegantShape delay={0.2} width={500} height={120} rotate={8} gradient="from-blue-500/[0.12]" className="left-[-8%] top-[8%]" />
                <ElegantShape delay={0.4} width={400} height={100} rotate={-12} gradient="from-purple-500/[0.12]" className="right-[-5%] top-[45%]" />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground">NotebookLM</h1>
                    <p className="text-muted-foreground text-lg max-w-3xl mt-2">Your AI-powered research and learning assistant. Transform any text into summaries, audio, and video presentations.</p>
                </motion.div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <SourceInputPanel onAnalyze={handleAnalyze} isLoading={isLoading} setSourceText={setSourceText} sourceText={sourceText} />
                    <StudioPanel script={script} activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </div>
        </div>
    );
};
const SourceInputPanel = ({ onAnalyze, isLoading, sourceText, setSourceText }: any) => (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-6 h-full flex flex-col">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><BookOpen /> Source Material</h2>
        <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Paste your article, notes, or any text here..."
            className="flex-1 w-full bg-input/50 rounded-lg p-4 text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary custom-scrollbar min-h-[300px] lg:min-h-[500px]"
            disabled={isLoading}
        />
        <Button onClick={onAnalyze} disabled={isLoading || !sourceText.trim()} size="lg" className="w-full mt-4">
            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
            Analyze & Generate
        </Button>
    </motion.div>
);
const StudioPanel = ({ script, activeTab, setActiveTab }: { script: NotebookScript | null, activeTab: StudioTab, setActiveTab: (tab: StudioTab) => void }) => {
    const tabs = [
        { id: 'summary', icon: <FileText size={18} />, label: 'Summary' },
        { id: 'audio', icon: <AudioLines size={18} />, label: 'Audio Overview' },
        { id: 'video', icon: <Video size={18} />, label: 'Video Overview' },
        { id: 'map', icon: <Map size={18} />, label: 'Mind Map' },
    ];
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-2xl min-h-[400px] lg:min-h-[612px] flex flex-col">
            {!script ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <Sparkles size={48} className="mb-4 text-primary/50" />
                    <h3 className="text-lg font-semibold text-foreground">Awaiting Analysis</h3>
                    <p>Your generated content will appear here.</p>
                </div>
            ) : (
                <>
                    <div className="p-3 border-b border-border flex flex-wrap gap-2">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as StudioTab)} className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>
                                {activeTab === tab.id && <motion.div layoutId="studio-tab-active" className="absolute inset-0 bg-primary rounded-lg z-0" />}
                                <span className="relative z-10 flex items-center gap-2">{tab.icon}{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                {activeTab === 'summary' && <div className="prose prose-invert max-w-none prose-p:text-muted-foreground whitespace-pre-line">{script.summary}</div>}
                                {activeTab === 'audio' && <AudioPlayer script={script} />}
                                {activeTab === 'video' && <VideoPlayer script={script} />}
                                {activeTab === 'map' && script && (
                                    <div className="h-[600px] w-full">
                                        <MindMap slides={script.slides} summary={script.summary} />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </>
            )}
        </motion.div>
    );
};
const AudioPlayer = ({ script }: { script: NotebookScript }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const fullNarration = script.slides.map(s => s.narration).join(' ');
    const handleTogglePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
        } else {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            } else {
                const utterance = new SpeechSynthesisUtterance(fullNarration);
                utterance.onend = () => setIsPlaying(false);
                utterance.onerror = () => {
                    toast.error("Audio playback failed.");
                    setIsPlaying(false);
                };
                window.speechSynthesis.speak(utterance);
            }
            setIsPlaying(true);
        }
    };
    useEffect(() => {
      // Cleanup when component unmounts or script changes
      return () => {
          window.speechSynthesis.cancel();
      };
    }, [script]);
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold">Audio Overview</h3>
            <div className="flex items-center gap-4">
                <Button onClick={handleTogglePlay} size="icon" className="w-14 h-14 rounded-full">
                    {isPlaying ? <Pause size={24}/> : <Play size={24}/>}
                </Button>
                <div className="text-muted-foreground flex-1">Click play to listen to the AI-narrated summary of your source material.</div>
            </div>
            <div className="p-4 bg-input/50 rounded-lg max-h-96 overflow-y-auto custom-scrollbar">
                <p className="text-muted-foreground whitespace-pre-line">{fullNarration}</p>
            </div>
        </div>
    );
};
const VideoPlayer = ({ script }: { script: NotebookScript }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const slideRef = useRef<HTMLDivElement>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const playNarrationForSlide = (index: number) => {
        window.speechSynthesis.cancel();
        if (index >= script.slides.length) {
            setIsPlaying(false);
            setCurrentSlideIndex(0); // Loop back to start
            return;
        }
        const slide = script.slides[index];
        const utterance = new SpeechSynthesisUtterance(slide.narration);
        utteranceRef.current = utterance;
        utterance.onend = () => {
            setCurrentSlideIndex(prev => prev + 1);
        };
        utterance.onerror = () => {
            toast.error("Audio playback failed.");
            setIsPlaying(false);
        };
        window.speechSynthesis.speak(utterance);
    };
    useEffect(() => {
        if (isPlaying) {
            playNarrationForSlide(currentSlideIndex);
        }
    }, [isPlaying, currentSlideIndex]);
    const handleTogglePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            setCurrentSlideIndex(0);
            setIsPlaying(true);
        }
    };
    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, [script]);
    const handleDownloadSlide = async () => {
        if (slideRef.current) {
            const toastId = toast.loading("Generating image...");
            try {
                const canvas = await html2canvas(slideRef.current, { backgroundColor: '#1a1d2c' });
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `neurolearn-slide-${currentSlideIndex + 1}.png`;
                link.click();
                toast.success("Slide downloaded!", { id: toastId });
            } catch (error) {
                toast.error("Could not download slide.", { id: toastId });
            }
        }
    };
    const currentSlide = script.slides[currentSlideIndex] || script.slides[0];
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold">Video Overview</h3>
            <div ref={slideRef} className="aspect-video bg-gradient-to-br from-[#1a1d2c] to-[#11131e] rounded-lg p-8 flex flex-col justify-center items-center text-center shadow-inner">
                 <AnimatePresence mode="wait">
                    <motion.div key={currentSlideIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                        <h4 className="text-3xl font-bold text-primary">{currentSlide.title}</h4>
                        <ul className="mt-6 space-y-3">
                            {currentSlide.points.map((point, i) => <li key={i} className="text-xl text-foreground/80">{point}</li>)}
                        </ul>
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="flex items-center justify-between gap-4 p-2 bg-input/50 rounded-lg">
                <Button onClick={handleTogglePlay} size="icon" className="w-12 h-12 rounded-full">
                    {isPlaying ? <Pause /> : <Play />}
                </Button>
                 <div className="text-sm text-muted-foreground">Slide {currentSlideIndex + 1} of {script.slides.length}</div>
                <Button onClick={handleDownloadSlide} variant="ghost" size="icon">
                    <Download />
                </Button>
            </div>
        </div>
    );
};
export default NotebookLM;
