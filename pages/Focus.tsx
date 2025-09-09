
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import CircularProgress from '../components/CircularProgress';
import { 
  Play, Pause, RotateCcw, Webcam, Sparkles, Loader2, AlertTriangle, 
  VideoOff, Mic, MicOff, Waves, Trophy, Share2, Clock, ArrowLeftCircle,
  BrainCircuit, Circle, MousePointerClick, Frown, Battery, Info
} from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import * as geminiService from '../services/geminiService';
import type { CognitiveStateAnalysis, FocusStory, AudioEnvironmentAnalysis } from '../types';
type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';
const FOCUS_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;
const FOCUS_REWARD = 25;
const ANALYSIS_INTERVAL = 15000;
const ElegantShape = ({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -100, rotate: rotate - 15 }}
    animate={{ opacity: 1, y: 0, rotate }}
    transition={{
      duration: 2.4,
      delay,
      ease: [0.23, 0.86, 0.39, 0.96],
      opacity: { duration: 1.2 },
    }}
    className={`absolute ${className}`}
  >
    <motion.div
      animate={{ y: [0, 15, 0] }}
      transition={{
        duration: 12, repeat: Infinity, ease: "easeInOut",
      }}
      style={{ width, height }}
      className="relative"
    >
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient}
          backdrop-blur-[2px] border-2 border-white/10 shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]`}
      />
    </motion.div>
  </motion.div>
);
const Focus: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const navigate = ReactRouterDOM.useNavigate();
  const timerRef = useRef<number | null>(null);
  // Select fields separately to avoid creating a new object every render
  const addCoins = useUserStore(state => state.addCoins);
  const addFocusStory = useUserStore(state => state.addFocusStory);
  // Cognitive State Analysis
  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisIntervalRef = useRef<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [cognitiveStateResult, setCognitiveStateResult] = useState<CognitiveStateAnalysis | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [actionableAdvice, setActionableAdvice] = useState<string | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  // Audio State
  const [isAudioAnalyzing, setIsAudioAnalyzing] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioAnalysisResult, setAudioAnalysisResult] = useState<AudioEnvironmentAnalysis | null>(null);
  const [audioSuggestionText, setAudioSuggestionText] = useState<string | null>(null);
  const [isAudioSuggestionLoading, setIsAudioSuggestionLoading] = useState(false);
  const audioIntervalRef = useRef<number | null>(null);
  const detectedSoundsRef = useRef<string[]>([]);
  const getTimeForMode = (m: TimerMode) =>
    m === 'pomodoro' ? FOCUS_TIME : m === 'shortBreak' ? SHORT_BREAK_TIME : LONG_BREAK_TIME;
  const handleSessionComplete = useCallback(() => {
    if (mode === 'pomodoro') {
      addCoins(FOCUS_REWARD);
      const story: Omit<FocusStory, 'id' | 'date'> = {
        duration: FOCUS_TIME / 60,
        coinsEarned: FOCUS_REWARD,
        cognitiveStateResult: isAnalyzing ? cognitiveStateResult : null,
        flowState: Math.floor(Math.random() * 51) + 50,
        cognitiveLoad: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)],
      };
      addFocusStory(story);
    } else {
      alert('Break finished! Time to get back to focus.');
    }
    const nextMode = mode === 'pomodoro' ? 'shortBreak' : 'pomodoro';
    setMode(nextMode);
    setTimeLeft(getTimeForMode(nextMode));
  }, [addCoins, mode, addFocusStory, isAnalyzing, cognitiveStateResult]);
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopTimer();
            setIsActive(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isActive, stopTimer, handleSessionComplete]);
  // --- Enhanced Visual Analysis (camera) ---
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;
    // Set loading state with a timeout to ensure UI feedback is shown
    const loadingTimeout = setTimeout(() => {
      if (!isAnalysisLoading) setIsAnalysisLoading(true);
    }, 300);
    setActionableAdvice(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Draw mirrored video feed
      ctx.save();
      ctx.scale(-1, 1); // Mirror the context
      ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
      // Optimize image quality and size
      const base64Image = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
      // Run analysis with timeout
      const analysisPromise = geminiService.analyzeCognitiveState(base64Image);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Analysis timed out')), 8000) // 8 second timeout
      );
      const result = await Promise.race([analysisPromise, timeoutPromise]) as any;
      setCognitiveStateResult(result);
      // Get advice in parallel to save time
      Promise.resolve().then(async () => {
        try {
          const adviceText = await geminiService.getActionableAdvice(result.actionable_advice_id);
          setActionableAdvice(adviceText);
        } catch (e) {
          console.error("Failed to get advice:", e);
          setActionableAdvice("Focus on maintaining a good posture and taking regular breaks.");
        } finally {
          setIsAdviceLoading(false);
        }
      });
    } catch (error) {
      console.error("Cognitive state analysis failed:", error);
      // Only update state if component is still mounted
      setCognitiveStateResult({
        cognitive_state: 'Neutral',
        confidence_score: 0,
        key_indicators: ['Analysis in progress...'],
        actionable_advice_id: 'ADVICE_NEUTRAL'
      });
      setActionableAdvice("Analyzing your focus state...");
    } finally {
      clearTimeout(loadingTimeout);
      setIsAnalysisLoading(false);
    }
  }, [isAnalysisLoading]);
  const startAnalysis = async () => {
    setCameraError(null);
    setCognitiveStateResult({
      cognitive_state: 'Neutral',
      confidence_score: 0,
      key_indicators: ['Initializing camera...'],
      actionable_advice_id: 'ADVICE_NEUTRAL'
    });
    setActionableAdvice("Camera is starting up. Please wait...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => {
          console.error("Video play failed:", e);
          throw new Error("Could not start video feed");
        });
      }
      setIsAnalyzing(true);
      // Initial analysis after camera is ready
      const checkReady = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          clearInterval(checkReady);
          captureAndAnalyze();
          analysisIntervalRef.current = window.setInterval(captureAndAnalyze, 10000); // 10 second interval
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera access is required for focus analysis. Please check your browser permissions.");
      setCognitiveStateResult({
        cognitive_state: 'Neutral',
        confidence_score: 0,
        key_indicators: ['Camera not available'],
        actionable_advice_id: 'ADVICE_NEUTRAL'
      });
      setActionableAdvice("Enable camera access to use focus analysis.");
    }
  };
  const stopAnalysis = useCallback(() => {
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsAnalyzing(false);
    setIsAnalysisLoading(false);
    setCognitiveStateResult(null);
    setActionableAdvice(null);
  }, []);
  // --- Audio environment analysis ---
  const MOCK_SOUND_EVENTS = [ "Keyboard Taps", "Mouse Clicks", "Silence", "Silence", "Silence", "Computer Fan", "Traffic Hum (distant)", "Human Speech (faint)", "Sudden Noise (door close)", "Music (instrumental)" ];
  const analyzeAudio = useCallback(async () => {
    if (detectedSoundsRef.current.length === 0) return;
    setIsAudioLoading(true);
    setAudioSuggestionText(null);
    const soundsToAnalyze = [...detectedSoundsRef.current];
    detectedSoundsRef.current = []; // Reset for the next interval
    try {
        const result = await geminiService.analyzeAudioEnvironment(soundsToAnalyze);
        setAudioAnalysisResult(result);
        setIsAudioSuggestionLoading(true);
        const suggestion = await geminiService.getAudioEnvironmentSuggestion(result.suggestion_id, result.primary_distraction);
        setAudioSuggestionText(suggestion);
        setIsAudioSuggestionLoading(false);
    } catch (error) {
        console.error("Audio environment analysis failed:", error);
        setAudioAnalysisResult({
            environment_quality: 'Distracting',
            primary_distraction: 'Analysis Error',
            suggestion_id: 'SUGGEST_HEADPHONES',
        });
        setAudioSuggestionText("There was an error analyzing your audio. Maybe try using headphones?");
    } finally {
        setIsAudioLoading(false);
    }
  }, []);
  const startAudioAnalysis = async () => {
    setAudioError(null);
    setAudioAnalysisResult(null);
    detectedSoundsRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, just for permission
      setIsAudioAnalyzing(true);
      // Simulate sound detection and run analysis periodically
      audioIntervalRef.current = window.setInterval(() => {
        // Simulate detecting a sound event
        const detectedSound = MOCK_SOUND_EVENTS[Math.floor(Math.random() * MOCK_SOUND_EVENTS.length)];
        if (detectedSound !== 'Silence') {
          detectedSoundsRef.current.push(detectedSound);
        }
      }, 4000); // Simulate detecting a sound every 4 seconds
      // Run analysis every 15 seconds
      const analysisRunner = setInterval(analyzeAudio, 15000);
      audioIntervalRef.current = window.setInterval(() => {
        clearInterval(analysisRunner);
      }, 15000);
      // Run initial analysis after a short delay
      setTimeout(analyzeAudio, 10000);
    } catch (err) {
      setAudioError("Microphone access is required for analysis.");
    }
  };
  const stopAudioAnalysis = useCallback(() => {
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    setIsAudioAnalyzing(false);
    setIsAudioLoading(false);
    setAudioAnalysisResult(null);
    setAudioSuggestionText(null);
    detectedSoundsRef.current = [];
  }, []);
  useEffect(() => () => {
    stopAnalysis();
    stopAudioAnalysis();
  }, [stopAnalysis, stopAudioAnalysis]);
  const toggleTimer = () => setIsActive(x => !x);
  const resetTimer = () => {
    stopTimer();
    setIsActive(false);
    setTimeLeft(getTimeForMode(mode));
  };
  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    stopTimer();
    setIsActive(false);
    setTimeLeft(getTimeForMode(newMode));
  };
  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const totalDuration = getTimeForMode(mode);
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  const getModeButtonClass = (buttonMode: TimerMode) =>
    `px-4 py-2 rounded-md font-semibold transition-colors duration-200 text-sm ${
      mode === buttonMode
        ? 'bg-primary text-primary-foreground shadow-lg'
        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
    }`;
  const stateIcons: Record<string, React.ReactNode> = {
    'Deep Focus': <BrainCircuit className="text-green-400" />,
    'Neutral': <Circle className="text-yellow-400" />,
    'Slightly Distracted': <MousePointerClick className="text-orange-400" />,
    'Visibly Stressed': <Frown className="text-red-400" />,
    'Tired': <Battery className="text-blue-400" />,
  };
  const qualityColors: Record<string, string> = {
    'Optimal': 'text-green-400',
    'Acceptable': 'text-yellow-400',
    'Distracting': 'text-red-400',
  };
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] to-rose-500/[0.03] blur-3xl" />
      <div className="dark">
        <ElegantShape delay={0.3} width={550} height={110} rotate={12} gradient="from-blue-500/[0.11]" className="left-[-10%] top-[9%]" />
        <ElegantShape delay={0.4} width={420} height={88} rotate={-11} gradient="from-violet-500/[0.12]" className="right-[-7%] top-[57%]" />
        <ElegantShape delay={0.5} width={310} height={74} rotate={-7} gradient="from-sky-400/[0.12]" className="left-[5%] bottom-[12%]" />
      </div>
      {}
      <div className="relative z-10 p-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Focus Session</h1>
            <p className="text-muted-foreground max-w-md mt-3">
              Stay focused, track your progress, and unlock rewards. Activate advanced NeuroSync™ insights with Pro.
            </p>
          </div>
          <div className="flex gap-3 mt-3 md:mt-0">
            <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ArrowLeftCircle size={20} />
              Back
            </Button>
            <Button variant="secondary" onClick={resetTimer} className="flex items-center gap-2">
              <RotateCcw size={18} />
              Reset
            </Button>
          </div>
        </motion.div>
      </div>
      {}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto px-6 items-start">
        {}
        <GlassCard>
          <div className="flex flex-col items-center py-2">
            <div className="flex justify-center mb-8">
              <button className={getModeButtonClass('pomodoro')} onClick={() => switchMode('pomodoro')}>Focus</button>
              <button className={getModeButtonClass('shortBreak')} onClick={() => switchMode('shortBreak')}>Short Break</button>
              <button className={getModeButtonClass('longBreak')} onClick={() => switchMode('longBreak')}>Long Break</button>
            </div>
            <div className="relative my-8 flex items-center justify-center drop-shadow-xl">
              <CircularProgress progress={progress} size={214} />
              <div className="absolute">
                <h2 className="text-7xl font-extrabold text-foreground">
                  {formatTime(timeLeft)}
                </h2>
              </div>
            </div>
            <div className="flex gap-6 mt-4">
              <Button onClick={toggleTimer} size="lg" className="w-44 flex items-center justify-center">
                {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                {isActive ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={resetTimer} variant="ghost" size="icon" className="w-14 h-14">
                <RotateCcw />
              </Button>
            </div>
            {mode === 'pomodoro' && (
              <div className="text-center mt-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="inline-flex items-center gap-2 bg-green-500/10 px-5 py-2 rounded-xl border border-green-400/20 font-semibold text-green-400 text-lg shadow"
                >
                  <Trophy className="h-4 w-4" />
                  +{FOCUS_REWARD} FocusCoins per session
                </motion.div>
              </div>
            )}
          </div>
        </GlassCard>
        {}
        <div className="space-y-9">
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">NeuroSync™ Visual Analysis</h3>
            <div className="relative h-40 rounded-2xl flex items-center justify-center border-2 border-dashed border-primary/30 bg-muted/30 overflow-hidden">
              {!isAnalyzing && (
                <div className="text-center text-muted-foreground z-10">
                  <Webcam size={42} className="mx-auto mb-2" />
                  <p>Start for live camera feedback</p>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full max-h-[300px] rounded-xl object-cover transition-opacity duration-300 ${isAnalyzing ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  transform: 'scaleX(-1)',
                  backgroundColor: 'hsl(var(--muted))',
                  zIndex: 0,
                  filter: isAnalyzing ? undefined : 'blur(4px) brightness(0.8)'
                }}
              />
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-red-400 font-medium z-20">
                  <VideoOff className="w-7 h-7 mr-2" />
                  {cameraError}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="secondary"
                onClick={isAnalyzing ? stopAnalysis : startAnalysis}
                disabled={!!cameraError}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? <VideoOff size={18} /> : <Webcam size={18} />}
                {isAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
              </Button>
            </div>
            <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3"
                  >
                    {isAnalysisLoading ? (
                      <div className="flex items-center gap-3 text-primary">
                        <Loader2 size={20} className="animate-spin" />
                        <p className="font-semibold">Analyzing cognitive state...</p>
                      </div>
                    ) : cognitiveStateResult ? (
                      <>
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                              {stateIcons[cognitiveStateResult.cognitive_state]}
                              <h4 className="font-bold text-lg text-foreground">{cognitiveStateResult.cognitive_state}</h4>
                           </div>
                           <div className="text-right">
                              <p className="text-xs text-muted-foreground">Confidence</p>
                              <p className="font-semibold text-foreground">{Math.round(cognitiveStateResult.confidence_score * 100)}%</p>
                           </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Key Indicators:</p>
                          <ul className="text-sm text-foreground space-y-1">
                            {cognitiveStateResult.key_indicators.map((indicator, i) => (
                              <li key={i} className="flex items-center gap-2"><Info size={12} className="text-primary"/>{indicator}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-2 pt-2 border-t border-primary/10 text-center">
                            {isAdviceLoading ? (
                                <div className="flex items-center justify-center gap-2 text-primary text-sm font-medium">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Generating advice...</span>
                                </div>
                            ) : (
                               <p className="text-sm text-primary font-medium">{actionableAdvice}</p>
                            )}
                        </div>
                      </>
                    ) : (
                       <p className="text-muted-foreground text-sm">Waiting for first analysis...</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">NeuroSync™ Audio Analysis</h3>
             <AnimatePresence mode="wait">
                {isAudioAnalyzing ? (
                    <motion.div 
                        key="analysis-active"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        {isAudioLoading ? (
                            <div className="h-24 flex items-center justify-center text-center text-muted-foreground">
                                <Loader2 size={32} className="animate-spin text-primary" />
                            </div>
                        ) : audioAnalysisResult ? (
                            <div className="h-24 flex flex-col justify-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Environment Quality</p>
                                    <p className={`text-2xl font-bold ${qualityColors[audioAnalysisResult.environment_quality]}`}>{audioAnalysisResult.environment_quality}</p>
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs text-muted-foreground">Primary Distraction: <span className="font-semibold text-foreground">{audioAnalysisResult.primary_distraction}</span></p>
                                    <div className="mt-2">
                                        <p className="text-xs text-muted-foreground">Suggestion:</p>
                                        {isAudioSuggestionLoading ? (
                                            <div className="flex items-center gap-2 text-primary text-sm font-medium mt-1">
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Cerebrum is thinking...</span>
                                            </div>
                                        ) : (
                                            <p className="font-semibold text-primary mt-1">{audioSuggestionText}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-24 flex items-center justify-center text-center text-muted-foreground">
                                <Waves size={32} className="mx-auto mb-1 text-primary animate-pulse" />
                                <p className="font-medium">Listening to your environment...</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="analysis-idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-24 flex items-center justify-center text-center text-muted-foreground"
                    >
                        <div>
                            <Mic size={32} className="mx-auto mb-1" />
                            <p className="font-medium">Start for live audio feedback</p>
                            {audioError && <p className="text-red-400 text-xs mt-1">{audioError}</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex items-center justify-start mt-6">
              <Button
                variant="secondary"
                onClick={isAudioAnalyzing ? stopAudioAnalysis : startAudioAnalysis}
                disabled={!!audioError}
                className="flex items-center gap-2"
              >
                {isAudioAnalyzing ? <MicOff size={16} /> : <Mic size={16} />}
                {isAudioAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
    </div>
  );
};
export default Focus;
// GlassCard helper
function GlassCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number; }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`border border-border bg-card/50 rounded-3xl shadow-xl backdrop-blur-xl p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}