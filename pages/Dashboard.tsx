import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import * as ReactRouterDOM from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2, Zap, BarChart2, AlertTriangle, ArrowRight, Circle, Sparkles, TrendingUp, Brain, Target, Calendar } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import { useQuizStore } from '../stores/useQuizStore';
import { generateQuiz } from '../services/geminiService';
import SubscriptionGate from '../components/SubscriptionGate';
import FocusCoinWallet from '../components/FocusCoinWallet';
import DailyMissions from '../components/DailyMissions';
import CodingStreakTracker from '../components/CodingStreakTracker';
import DailyCheckin from '../components/DailyCheckin';
import MoodTracker from '../components/MoodTracker';
import UnstuckButton from '../components/UnstuckButton';
import CodingStats from '../components/CodingStats';
import { motion, AnimatePresence } from 'framer-motion';
import HabitTracker from '../components/HabitTracker';
import NotesTaker from '../components/NotesTaker';
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
// Glass Card Wrapper Component
const GlassCard = ({ 
  children, 
  title, 
  icon, 
  className = "",
  delay = 0 
}: { 
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className={`rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl p-6 ${className}`}
  >
    {title && (
      <div className="flex items-center gap-3 mb-6">
        {icon && <div className="text-primary">{icon}</div>}
        <h3 className="text-xl font-semibold text-foreground">
          {title}
        </h3>
      </div>
    )}
    {children}
  </motion.div>
);
// Glass Input Wrapper
const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-input/50 backdrop-blur-sm transition-colors focus-within:border-primary/70 focus-within:bg-primary/10">
    {children}
  </div>
);
const Dashboard: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const location = ReactRouterDOM.useLocation();
  const { currentUser, focusStories } = useUserStore();
  const addQuiz = useQuizStore(state => state.addQuiz);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (location.state?.topic) {
      setTopic(location.state.topic);
      const topicInput = document.getElementById('quiz-topic') as HTMLInputElement;
      if(topicInput) topicInput.focus();
    }
  }, [location.state]);
  const userName = currentUser?.displayName || 'Learner';
  const focusData = [...focusStories]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(session => ({
      name: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: session.duration,
    }));
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const newQuiz = await generateQuiz(topic, difficulty, numQuestions);
      addQuiz(newQuiz);
      navigate(`/quiz/${newQuiz.id}`);
    } catch (err) {
      console.error("Failed to generate quiz", err);
      setError("Sorry, we couldn't generate a quiz on that topic. Please try another one.");
    } finally {
      setIsGenerating(false);
    }
  };
  const difficultyOptions: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];
  const numQuestionsOptions: number[] = [5, 10, 15];
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 overflow-hidden dark">
        <ElegantShape
          delay={0.3}
          width={500}
          height={120}
          rotate={8}
          gradient="from-indigo-500/[0.12]"
          className="left-[-8%] top-[10%]"
        />
        <ElegantShape
          delay={0.5}
          width={400}
          height={100}
          rotate={-12}
          gradient="from-rose-500/[0.12]"
          className="right-[-5%] top-[60%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-6}
          gradient="from-violet-500/[0.12]"
          className="left-[5%] bottom-[15%]"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={15}
          gradient="from-amber-500/[0.12]"
          className="right-[20%] top-[5%]"
        />
      </div>
      {}
      <div className="relative z-10 p-6 space-y-8">
        {}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            {}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/80 border border-border mb-3"
            >
              <Circle className="h-2 w-2 fill-primary/80" />
              <span className="text-sm text-muted-foreground tracking-wide">
                {currentDate}
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              Welcome back, {userName}!
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <UnstuckButton />
            <CodingStreakTracker />
            <FocusCoinWallet />
          </motion.div>
        </motion.header>
        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <DailyCheckin />
        </motion.div>
        {}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {}
          <div className="lg:col-span-3 space-y-8">
            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <SubscriptionGate requiredTier='free'>
                <DailyMissions />
              </SubscriptionGate>
            </motion.div>
            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <CodingStats />
            </motion.div>
            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <HabitTracker />
            </motion.div>
            {}
            <GlassCard 
              title="Focus Trends" 
              icon={<TrendingUp size={20} />}
              delay={0.8}
            >
              <div className="h-80">
                {focusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={focusData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                        label={{ 
                          value: 'Minutes', 
                          angle: -90, 
                          position: 'insideLeft', 
                          fill: 'hsl(var(--muted-foreground))' 
                        }} 
                      />
                      <Tooltip
                        cursor={{ fill: 'hsla(var(--primary) / 0.1)' }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '12px',
                          color: 'hsl(var(--card-foreground))'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        itemStyle={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}
                      />
                      <Bar 
                        dataKey="duration" 
                        name="Focus Duration" 
                        fill="url(#colorFocus)" 
                        radius={[6, 6, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-4 rounded-full bg-primary/10 mb-4">
                      <BarChart2 size={48} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">No Focus Data Yet</h3>
                    <p className="text-sm text-muted-foreground">Complete a session in the 'Focus' tab to see your trends.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
          {}
          <div className="lg:col-span-2 space-y-8">
            {}
            <GlassCard 
              title="AI-Powered Learning" 
              icon={<Brain size={20} />}
              className="relative"
              delay={0.9}
            >
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl z-20"
                  >
                    <div className="p-4 rounded-full bg-primary/20 mb-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                    <p className="font-semibold text-foreground mb-2">Crafting your custom quiz...</p>
                    <p className="text-sm text-muted-foreground">This may take a moment.</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Unleash your potential. Generate a custom quiz on any topic to test your knowledge and accelerate your learning journey.
              </p>
              <form onSubmit={handleGenerateQuiz} className="space-y-6">
                <div>
                  <label htmlFor="quiz-topic" className="block text-sm font-medium text-foreground mb-3">
                    <Target size={16} className="inline mr-2" />
                    Topic
                  </label>
                  <GlassInputWrapper>
                    <input
                      id="quiz-topic"
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., 'The Italian Renaissance'"
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-foreground placeholder-muted-foreground"
                      disabled={isGenerating}
                      autoFocus
                    />
                  </GlassInputWrapper>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    <Sparkles size={16} className="inline mr-2" />
                    Customize
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {}
                    <div>
                      <div className="flex bg-muted/50 p-1 rounded-xl border border-border">
                        {difficultyOptions.map(d => (
                          <button 
                            type="button" 
                            key={d} 
                            onClick={() => setDifficulty(d)} 
                            disabled={isGenerating} 
                            className={`flex-1 text-sm font-semibold py-2 px-3 rounded-lg transition-all duration-200 ${
                              difficulty === d 
                                ? 'bg-primary text-primary-foreground shadow-lg' 
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    {}
                    <div>
                      <div className="flex bg-muted/50 p-1 rounded-xl border border-border">
                        {numQuestionsOptions.map(n => (
                          <button 
                            type="button" 
                            key={n} 
                            onClick={() => setNumQuestions(n)} 
                            disabled={isGenerating} 
                            className={`flex-1 text-sm font-semibold py-2 px-3 rounded-lg transition-all duration-200 ${
                              numQuestions === n 
                                ? 'bg-primary text-primary-foreground shadow-lg' 
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={!topic.trim() || isGenerating}
                    className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl"
                  >
                    <Zap className="h-5 w-5" />
                    Generate Quiz
                  </button>
                </div>
              </form>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-3"
                  >
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <MoodTracker />
            </motion.div>
          </div>
        </div>
        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <NotesTaker />
        </motion.div>
      </div>
      {}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
    </div>
  );
};
export default Dashboard;