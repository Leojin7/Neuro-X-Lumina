import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import * as ReactRouterDOM from 'react-router-dom';
import type { Quiz } from '../types';
import { useQuizStore } from '../stores/useQuizStore';
import { useUserStore } from '../stores/useUserStore';
import {
  Lock,
  ArrowRight,
  Circle,
  Trophy,
  Clock,
  Star,
  BookOpen,
  Zap,
  Crown,
  Target,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const PREMIUM_QUIZ_COST = 50;
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
// Glass Card Component
const GlassQuizCard = ({
  quiz,
  isUnlocked,
  isPremiumAndLocked,
  focusCoins,
  onUnlock,
  onTakeQuiz,
  delay = 0
}: {
  quiz: Quiz;
  isUnlocked: boolean;
  isPremiumAndLocked: boolean;
  focusCoins: number;
  onUnlock: (quizId: string) => void;
  onTakeQuiz: (quizId: string) => void;
  delay?: number;
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'from-green-400 to-emerald-500';
      case 'Medium': return 'from-yellow-400 to-orange-500';
      case 'Hard': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return <Target className="h-4 w-4" />;
      case 'Medium': return <Brain className="h-4 w-4" />;
      case 'Hard': return <Trophy className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <div className={`h-full rounded-3xl border backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 ${isPremiumAndLocked
        ? 'border-yellow-400/30 bg-gradient-to-br from-yellow-500/[0.05] to-amber-500/[0.03] dark:bg-card/80'
        : 'border-border bg-card/80 hover:bg-muted/80'
        }`}>
        <div className="p-6 h-full flex flex-col">
          {}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {quiz.isPremium && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 rounded-full">
                    <Crown className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs font-bold text-yellow-400 tracking-wider">PREMIUM</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">
                {quiz.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                {quiz.description}
              </p>
            </div>
          </div>
          {}
          <div className="flex items-center gap-4 mb-6">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(quiz.difficulty)} bg-opacity-10 border border-current border-opacity-20`}>
              <div className={`bg-gradient-to-r ${getDifficultyColor(quiz.difficulty)} bg-clip-text text-transparent`}>
                {getDifficultyIcon(quiz.difficulty)}
              </div>
              <span className={`text-sm font-semibold bg-gradient-to-r ${getDifficultyColor(quiz.difficulty)} bg-clip-text text-transparent`}>
                {quiz.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">~15 min</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span className="text-sm">{quiz.questions?.length || 10}Q</span>
            </div>
          </div>
          {}
          {quiz.tags && quiz.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {quiz.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-muted/80 text-muted-foreground rounded-full border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {}
          <div className="mt-auto">
            {isPremiumAndLocked ? (
              <button
                onClick={() => onUnlock(quiz.id)}
                disabled={focusCoins < PREMIUM_QUIZ_COST}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-400/30 text-yellow-300 hover:from-yellow-600/30 hover:to-amber-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Lock className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">
                  Unlock for {PREMIUM_QUIZ_COST} coins
                </span>
              </button>
            ) : (
              <button
                onClick={() => onTakeQuiz(quiz.id)}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-200 shadow-lg group"
              >
                <Zap className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Take Quiz
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
        {}
        {isPremiumAndLocked && (
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 backdrop-blur-[1px] pointer-events-none" />
        )}
      </div>
    </motion.div>
  );
};
const QuizzesList: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const [filter, setFilter] = useState<string>('All');
  const allQuizzes = useQuizStore((state) => state.quizzes);
  // Select fields separately to avoid creating a new object each render
  const subscriptionTier = useUserStore(state => state.subscriptionTier);
  const unlockedQuizIds = useUserStore(state => state.unlockedQuizIds);
  const focusCoins = useUserStore(state => state.focusCoins);
  const spendCoins = useUserStore(state => state.spendCoins);
  const unlockQuiz = useUserStore(state => state.unlockQuiz);
  const allTags = ['All', ...Array.from(new Set(allQuizzes.flatMap((q) => q.tags || [])))];
  const filteredQuizzes = filter === 'All'
    ? allQuizzes
    : allQuizzes.filter((q) => q.tags?.includes(filter));
  const handleUnlock = (quizId: string) => {
    if (focusCoins >= PREMIUM_QUIZ_COST) {
      if (spendCoins(PREMIUM_QUIZ_COST)) {
        unlockQuiz(quizId);
        // Better success notification
      }
    } else {
      // Better error notification
    }
  };
  const handleTakeQuiz = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 overflow-hidden dark">
        <ElegantShape
          delay={0.2}
          width={500}
          height={120}
          rotate={8}
          gradient="from-indigo-500/[0.12]"
          className="left-[-8%] top-[8%]"
        />
        <ElegantShape
          delay={0.4}
          width={400}
          height={100}
          rotate={-12}
          gradient="from-rose-500/[0.12]"
          className="right-[-5%] top-[45%]"
        />
        <ElegantShape
          delay={0.6}
          width={350}
          height={90}
          rotate={-6}
          gradient="from-violet-500/[0.12]"
          className="left-[3%] bottom-[25%]"
        />
        <ElegantShape
          delay={0.8}
          width={250}
          height={70}
          rotate={15}
          gradient="from-amber-500/[0.12]"
          className="right-[15%] top-[75%]"
        />
      </div>
      {}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            {}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border mb-6"
            >
              <Circle className="h-2 w-2 fill-primary/80" />
              <span className="text-sm text-muted-foreground tracking-wide">
                Knowledge Hub • {allQuizzes.length} Quizzes Available
              </span>
            </motion.div>
            {}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-4 text-foreground"
            >
              Quiz Collection
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-muted-foreground text-lg max-w-2xl"
            >
              Challenge yourself with our curated collection of quizzes. Test your knowledge, earn rewards, and unlock your potential.
            </motion.p>
          </motion.div>
          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-3">
              {allTags.map((tag: string, index) => (
                <motion.button
                  key={tag}
                  onClick={() => setFilter(tag)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${filter === tag
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border'
                    }`}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </motion.div>
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredQuizzes.map((quiz: Quiz, index) => {
                const isUnlocked = subscriptionTier !== 'free' || unlockedQuizIds.includes(quiz.id);
                const isPremiumAndLocked = quiz.isPremium && !isUnlocked;
                return (
                  <React.Fragment key={quiz.id}>
                    <GlassQuizCard
                      quiz={quiz}
                      isUnlocked={isUnlocked}
                      isPremiumAndLocked={isPremiumAndLocked}
                      focusCoins={focusCoins}
                      onUnlock={handleUnlock}
                      onTakeQuiz={handleTakeQuiz}
                      delay={index * 0.1}
                    />
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
          </motion.div>
          {}
          {filteredQuizzes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">No quizzes found</h3>
              <p className="text-muted-foreground">Try adjusting your filter or check back later for new content.</p>
            </motion.div>
          )}
        </div>
      </div>
      {}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
    </div>
  );
};
export default QuizzesList;