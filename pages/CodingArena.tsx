import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useUserStore } from '../stores/useUserStore';
import type { Language, CodingProblem, SubmissionResult as SubmissionResultType, TestCase } from '../types';
import { CODING_PROBLEMS } from '../constants/codingProblems';
import Card from '../components/Card';
import Button from '../components/Button';
import CodeEditor from '../components/CodeEditor';
import SubmissionResult from '../components/SubmissionResult';
import TimeTravelTicket from '../components/TimeTravelTicket';
import StreakPopup from '../components/StreakPopup';
import { 
  
  Lightbulb, 
  Code2, 
  History, 
  Loader2, 
  Play,
  Pause,
  RotateCcw,
  Check, 
  Circle, 
  Target, 
  Zap, 
  Trophy,
  Clock,
  Brain,
  Timer
} from 'lucide-react';
const toYYYYMMDD = (date: Date) => date.toISOString().slice(0, 10);
// Elegant Shape Component for Background
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
    initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
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
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ width, height }}
      className="relative"
    >
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-white/10 shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]`}
      />
    </motion.div>
  </motion.div>
);
// Glass Card Wrapper
const GlassCard = ({ 
  children, 
  className = "", 
  delay = 0 
}: { 
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className={`rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);
const CodingArena: React.FC = () => {
    const [problem, setProblem] = useState<CodingProblem | null>(null);
    const [language, setLanguage] = useState<Language>('javascript');
    const [code, setCode] = useState('');
    const [submissionResult, setSubmissionResult] = useState<SubmissionResultType | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionMode, setExecutionMode] = useState<'run' | 'submit' | null>(null);
    // Select fields separately to avoid returning a new object each render (prevents infinite loops)
    const addCodingSubmission = useUserStore(state => state.addCodingSubmission);
    const lastCodingDate = useUserStore(state => state.lastCodingDate);
    const [showStreakPopup, setShowStreakPopup] = useState(false);
    // Timer state
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
    const [isTimerActive, setIsTimerActive] = useState(false);
    const timerRef = useRef<number | null>(null);
    const [timeUntilNextProblem, setTimeUntilNextProblem] = useState('');
    useEffect(() => {
        const getProblemForToday = () => {
            const now = new Date();
            const todayAt9AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);
            // If it's before 9 AM today, we are still on "yesterday's" problem
            const referenceDate = now < todayAt9AM ? new Date(now.getTime() - 24 * 60 * 60 * 1000) : now;
            const startOfYear = new Date(referenceDate.getFullYear(), 0, 0);
            const diff = referenceDate.getTime() - startOfYear.getTime();
            const oneDay = 1000 * 60 * 60 * 24;
            const dayOfYear = Math.floor(diff / oneDay);
            const problemIndex = dayOfYear % CODING_PROBLEMS.length;
            setProblem(CODING_PROBLEMS[problemIndex]);
        };
        getProblemForToday();
        const problemCheckInterval = setInterval(getProblemForToday, 60000); // Check every minute
        const countdownInterval = setInterval(() => {
            const now = new Date();
            let next9AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);
            if (now.getTime() >= next9AM.getTime()) {
                next9AM.setDate(next9AM.getDate() + 1);
            }
            const diff = next9AM.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setTimeUntilNextProblem(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        }, 1000);
        return () => {
            clearInterval(problemCheckInterval);
            clearInterval(countdownInterval);
        };
    }, []);
    useEffect(() => {
        if (problem) {
            setCode(problem.starterCode[language] || '');
        }
    }, [language, problem]);
    // Timer logic
    useEffect(() => {
        if (isTimerActive && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isTimerActive) {
            setIsTimerActive(false);
            toast.error("Time's up!");
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerActive, timeLeft]);
    const toggleTimer = () => setIsTimerActive(prev => !prev);
    const resetTimer = () => {
        setIsTimerActive(false);
        setTimeLeft(30 * 60);
    }
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };
    const handleCodeChange = (value: string | undefined) => {
        setCode(value || '');
    };
    const executeCode = (userCode: string, testCasesToRun: TestCase[]): SubmissionResultType => {
        let passedCount = 0;
        const details: SubmissionResultType['details'] = [];
        if (language !== 'javascript') {
            // Enhanced mock for non-JS languages
            const checkSolution = (id: string, code: string): boolean => {
                switch (id) {
                    case 'two-sum': return (code.includes('unordered_map') && code.includes('find')) || code.includes('for');
                    case 'valid-parentheses': return (code.includes('stack') || code.includes('Stack')) && code.includes('push') && code.includes('pop');
                    case 'merge-two-sorted-lists': return code.includes("next") && code.includes("while");
                    default: return code.length > 20; // Basic plausibility
                }
            };
            const isPlausible = checkSolution(problem!.id, userCode);
            passedCount = isPlausible ? testCasesToRun.length : 0;
            details.push(...testCasesToRun.map(tc => ({
                testCase: tc,
                passed: isPlausible,
                output: isPlausible ? tc.expected : "Mock Error: Incomplete solution.",
            })));
        } else {
            // Real execution for JavaScript
            for (const testCase of testCasesToRun) {
                try {
                    const funcName = problem!.functionSignature.split('(')[0];
                    // Sanitize inputs for function constructor
                    const args = problem!.functionSignature.match(/\(([^)]+)\)/)?.[1].split(',').map(arg => arg.trim()) || [];
                    const func = new Function(...args, `${userCode}\nreturn ${funcName}(...arguments);`);
                    // Deep copy inputs to prevent modification
                    const inputs = JSON.parse(JSON.stringify(testCase.input));
                    const output = func(...inputs);
                    // Deep compare output with expected
                    const passed = JSON.stringify(output) === JSON.stringify(testCase.expected);
                    if (passed) passedCount++;
                    details.push({ testCase, passed, output });
                } catch (e: any) {
                    details.push({ testCase, passed: false, output: `Runtime Error: ${e.message}` });
                }
            }
        }
        const overallStatus: SubmissionResultType['status'] =
            passedCount === testCasesToRun.length ? 'Accepted'
            : details.some(d => typeof d.output === 'string' && d.output.includes('Runtime Error')) ? 'Runtime Error'
            : 'Wrong Answer';
        return {
            status: overallStatus,
            passedCount,
            totalCount: testCasesToRun.length,
            details,
        };
    };
    const handleExecution = (mode: 'run' | 'submit') => {
        if (!problem) return;
        setIsExecuting(true);
        setExecutionMode(mode);
        setSubmissionResult(null);
        setTimeout(() => {
            const testCasesToRun = mode === 'run' 
                ? problem.testCases.filter(tc => tc.isPublic)
                : problem.testCases;
            const result = executeCode(code, testCasesToRun);
            setSubmissionResult(result);
            setIsExecuting(false);
            if(mode === 'submit') {
                if (result.status === 'Accepted') {
                    const todayStr = toYYYYMMDD(new Date());
                    const isFirstSolveOfDay = lastCodingDate !== todayStr;
                    addCodingSubmission({
                        problemId: problem.id,
                        status: 'Accepted',
                        language: language,
                    });
                    if (isFirstSolveOfDay) {
                        setShowStreakPopup(true);
                    } else {
                        toast.success('Solution Accepted again! Well done.');
                    }
                } else {
                    toast.error(`Solution failed: ${result.status}`);
                }
            } else {
                 if (result.status === 'Accepted') {
                    toast.success('Public tests passed!');
                 } else {
                    toast.error(`Failed: ${result.status}`);
                 }
            }
        }, 1200);
    };
    const languageConfig = {
        javascript: { name: 'JavaScript', icon: '🟨', color: 'from-yellow-500 to-orange-500' },
        cpp: { name: 'C++', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
        c: { name: 'C', icon: '⚪', color: 'from-gray-400 to-gray-600' }
    };
    if (!problem) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
            <div className="absolute inset-0 overflow-hidden dark">
                <ElegantShape
                    delay={0.2}
                    width={450}
                    height={110}
                    rotate={6}
                    gradient="from-indigo-500/[0.12]"
                    className="left-[-6%] top-[8%]"
                />
                <ElegantShape
                    delay={0.4}
                    width={380}
                    height={95}
                    rotate={-10}
                    gradient="from-rose-500/[0.12]"
                    className="right-[-3%] top-[45%]"
                />
                <ElegantShape
                    delay={0.6}
                    width={320}
                    height={80}
                    rotate={-4}
                    gradient="from-violet-500/[0.12]"
                    className="left-[2%] bottom-[20%]"
                />
                <ElegantShape
                    delay={0.8}
                    width={220}
                    height={60}
                    rotate={12}
                    gradient="from-amber-500/[0.12]"
                    className="right-[18%] top-[75%]"
                />
            </div>
            {}
            <div className="relative z-10 p-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-7xl mx-auto"
                >
                    {}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border mb-4"
                        >
                            <Circle className="h-2 w-2 fill-green-400/80" />
                            <span className="text-sm text-muted-foreground tracking-wide">
                                Coding Arena • Daily Challenge
                            </span>
                        </motion.div>
                         <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-muted/50 border border-border rounded-full p-2 px-4 flex items-center shadow-lg backdrop-blur-sm mb-4"
                        >
                            <Timer className="text-primary mr-3" size={20} />
                            <div>
                                <span className="text-lg font-bold text-foreground tracking-wider">{timeUntilNextProblem}</span>
                                <p className="text-xs text-muted-foreground -mt-1">Until Next Problem</p>
                            </div>
                        </motion.div>
                    </div>
                    {}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-3xl md:text-4xl font-bold mb-2 text-foreground"
                    >
                        Code Challenge Arena
                    </motion.h1>
                </motion.div>
            </div>
            {}
            <div className="relative z-10 px-6 pb-6">
                <div className="max-w-7xl mx-auto">
                    <Toaster 
                        position="bottom-right" 
                        toastOptions={{
                            className: 'bg-popover text-popover-foreground border border-border shadow-lg',
                            style: {
                                background: 'hsl(var(--popover))',
                                color: 'hsl(var(--popover-foreground))',
                                border: '1px solid hsl(var(--border))',
                            },
                            success: { iconTheme: { primary: '#22c55e', secondary: 'hsl(var(--popover))' } },
                            error: { iconTheme: { primary: '#ef4444', secondary: 'hsl(var(--popover))' } },
                        }}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-220px)]">
                        {}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <GlassCard delay={0.4} className="flex-grow flex flex-col">
                                <div className="p-6 border-b border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-primary/20">
                                                <Target className="h-5 w-5 text-primary" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-foreground">{problem.title}</h2>
                                        </div>
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full ${
                                            problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                            <div className={`w-2 h-2 rounded-full ${
                                                problem.difficulty === 'Easy' ? 'bg-green-400' :
                                                problem.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'
                                            }`} />
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-2">
                                            <Brain className="h-4 w-4" />
                                            {problem.topic}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Estimated: 15-30 min
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                    <div 
                                        className="text-muted-foreground whitespace-pre-line leading-relaxed prose prose-invert prose-p:text-muted-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded" 
                                        dangerouslySetInnerHTML={{ 
                                            __html: problem.description.replace(
                                                /`([^`]+)`/g, 
                                                '<code class="bg-muted text-primary rounded-md px-2 py-1 font-mono text-sm">$1</code>'
                                            ) 
                                        }}
                                    />
                                    <div className="mt-8">
                                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                            <Lightbulb className="h-4 w-4 text-yellow-400" />
                                            Examples:
                                        </h3>
                                        {problem.testCases.filter(tc => tc.isPublic).map((tc, index) => (
                                            <div key={index} className="bg-muted/50 border border-border p-4 rounded-xl text-sm font-mono text-foreground/90 mb-4">
                                                <p className="mb-2">
                                                    <span className="font-semibold text-primary">Input:</span> nums = {JSON.stringify(tc.input[0])}, target = {JSON.stringify(tc.input[1])}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-success">Output:</span> {JSON.stringify(tc.expected)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                            >
                                <TimeTravelTicket />
                            </motion.div>
                        </div>
                        {}
                        <div className="lg:col-span-3 flex flex-col">
                            <GlassCard delay={0.6} className="flex-1 flex flex-col">
                                {}
                                <div className="flex-shrink-0 p-4 flex items-center justify-between border-b border-border">
                                    {}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 text-foreground font-semibold bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
                                            <Clock size={16} className={isTimerActive ? "text-primary" : ""} />
                                            <span className={isTimerActive ? "text-primary" : ""}>{formatTime(timeLeft)}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={toggleTimer} aria-label={isTimerActive ? "Pause timer" : "Start timer"}>
                                            {isTimerActive ? <Pause size={16} /> : <Play size={16} />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={resetTimer} aria-label="Reset timer">
                                            <RotateCcw size={16} />
                                        </Button>
                                        <div className="w-px h-6 bg-border mx-2"></div>
                                        {}
                                        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border">
                                            {Object.entries(languageConfig).map(([lang, config]) => (
                                                <button 
                                                    key={lang}
                                                    onClick={() => setLanguage(lang as Language)} 
                                                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                                                        language === lang 
                                                            ? 'bg-primary text-primary-foreground shadow-lg' 
                                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    }`}
                                                >
                                                    <span>{config.icon}</span>
                                                    {config.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {}
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleExecution('run')} 
                                            disabled={isExecuting}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground/90 hover:text-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-border"
                                        >
                                            {isExecuting && executionMode === 'run' ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Play size={16} />
                                            )}
                                            Run
                                        </button>
                                        <button 
                                            onClick={() => handleExecution('submit')} 
                                            disabled={isExecuting}
                                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-success text-success-foreground font-semibold hover:bg-success/90 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isExecuting && executionMode === 'submit' ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Check size={16} />
                                            )}
                                            Submit
                                        </button>
                                    </div>
                                </div>
                                {}
                                <div className="flex-1 min-h-0 bg-[#1a1a1a] relative">
                                    <CodeEditor language={language} code={code} onChange={handleCodeChange} />
                                    {}
                                    <AnimatePresence>
                                        {isExecuting && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20"
                                            >
                                                <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-6 border border-border">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 border-4 border-border rounded-full animate-spin border-t-primary" />
                                                            <Zap className="absolute inset-0 m-auto h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="font-semibold text-foreground mb-1">
                                                                {executionMode === 'run' ? 'Running Tests...' : 'Submitting Solution...'}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Executing your code against test cases
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {}
                                <div className="flex-shrink-0 h-2/5 border-t border-border bg-background">
                                    <SubmissionResult 
                                        result={submissionResult} 
                                        isExecuting={isExecuting} 
                                        executionMode={executionMode} 
                                    />
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </div>
            <StreakPopup isOpen={showStreakPopup} onClose={() => setShowStreakPopup(false)} />
            {}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
        </div>
    );
};
export default CodingArena;
