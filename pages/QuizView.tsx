import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { useQuizStore } from '../stores/useQuizStore';
import { useUserStore } from '../stores/useUserStore';
import type { Quiz, Question } from '../types';
import { 
  X, 
  Check, 
  Star, 
  Loader2, 
  Award, 
  ArrowRight, 
  Circle, 
  Brain, 
  Target, 
  Clock,
  Zap,
  Trophy,
  BookOpen,
  Volume2,
  Pause
} from 'lucide-react';
import * as geminiService from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import CircularProgress from '../components/CircularProgress';
import SubscriptionGate from '../components/SubscriptionGate';
import toast from 'react-hot-toast';
const QUIZ_COMPLETION_REWARD = 15;
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
const QuizView = () => {
  const { quizId } = ReactRouterDOM.useParams<{ quizId: string }>();
  const navigate = ReactRouterDOM.useNavigate();
  const getQuizById = useQuizStore(state => state.getQuizById);
  // Select each field separately to keep stable references and avoid new object creation per render
  const addCompletedQuiz = useUserStore(state => state.addCompletedQuiz);
  const addCoins = useUserStore(state => state.addCoins);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingQuestionId, setLoadingQuestionId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  useEffect(() => {
    if (quizId) {
      const foundQuiz = getQuizById(quizId) || null;
      setQuiz(foundQuiz);
    }
  }, [quizId]);
  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);
  const handleSelectAnswer = (option: string) => {
    setSelectedAnswer(option);
  };
  const handleGetExplanation = async (question: Question, incorrectAnswer: string) => {
    setLoadingQuestionId(question.id);
    setExplanations(prev => ({ ...prev, [question.id]: '' }));
    try {
      const result = await geminiService.getQuizExplanation(question, incorrectAnswer);
      setExplanations(prev => ({ ...prev, [question.id]: result }));
    } catch (error) {
      console.error('Failed to get explanation:', error);
      setExplanations(prev => ({ ...prev, [question.id]: 'Sorry, could not fetch an explanation at this time.' }));
    } finally {
      setLoadingQuestionId(null);
    }
  };
  const handleNextQuestion = () => {
    if (selectedAnswer) {
      // Stop speech if it's playing
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      const currentAnswers = { ...answers, [quiz!.questions[currentQuestionIndex].id]: selectedAnswer };
      setAnswers(currentAnswers);
      setSelectedAnswer(null);
      if (currentQuestionIndex < quiz!.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleSubmit(currentAnswers);
      }
    }
  };
  const handleSubmit = (finalAnswers: Record<string, string>) => {
    let correctCount = 0;
    quiz?.questions.forEach(q => {
      if (finalAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    const finalScore = (correctCount / quiz!.questions.length) * 100;
    setScore(finalScore);
    setShowResults(true);
    if (quiz) {
      addCompletedQuiz({
        quizId: quiz.id,
        title: quiz.title,
        difficulty: quiz.difficulty,
        score: Math.round(finalScore),
        completedAt: new Date().toISOString(),
      });
      addCoins(QUIZ_COMPLETION_REWARD);
    }
  };
  const handleSpeak = (text: string) => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => {
          toast.error("Couldn't read aloud. Please check browser settings.");
          setIsSpeaking(false);
        }
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    }
  };
  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-foreground p-8">
          <div className="animate-spin w-12 h-12 border-4 border-foreground/20 border-t-primary rounded-full mx-auto mb-4" />
          <p className="text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }
  if (showResults) {
    const correctAnswers = Math.round(score/100 * quiz.questions.length);
    const totalQuestions = quiz.questions.length;
    const getScoreColor = (score: number) => {
      if (score >= 90) return 'from-green-400 to-emerald-500';
      if (score >= 70) return 'from-blue-400 to-cyan-500';
      if (score >= 50) return 'from-yellow-400 to-orange-500';
      return 'from-red-400 to-pink-500';
    };
    return (
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
        <div className="absolute inset-0 overflow-hidden dark">
          <ElegantShape
            delay={0.2}
            width={400}
            height={100}
            rotate={12}
            gradient="from-green-500/[0.15]"
            className="left-[-8%] top-[15%]"
          />
          <ElegantShape
            delay={0.4}
            width={350}
            height={90}
            rotate={-8}
            gradient="from-blue-500/[0.15]"
            className="right-[-5%] top-[60%]"
          />
          <ElegantShape
            delay={0.6}
            width={300}
            height={80}
            rotate={-15}
            gradient="from-violet-500/[0.15]"
            className="left-[5%] bottom-[20%]"
          />
        </div>
        {}
        <div className="relative z-10 p-6 min-h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto w-full">
            <GlassCard delay={0.3} className="p-8">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="text-center"
              >
                {}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border mb-6"
                >
                  <Circle className="h-2 w-2 fill-green-400/80" />
                  <span className="text-sm text-muted-foreground tracking-wide">
                    Quiz Complete
                  </span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-bold mb-2 text-foreground">
                    Excellent Work!
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">{quiz.title}</p>
                {}
                <div className="my-12 flex justify-center relative">
                  <div className="relative">
                    <CircularProgress progress={score} size={220} strokeWidth={8} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className={`text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getScoreColor(score)}`}>
                        {Math.round(score)}%
                      </p>
                      <p className="text-foreground mt-2 font-medium">Score</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-8 mb-8">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">{correctAnswers}</p>
                    <p className="text-muted-foreground text-sm">Correct</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">{totalQuestions}</p>
                    <p className="text-muted-foreground text-sm">Total</p>
                  </div>
                </div>
                <motion.div 
                  className="inline-flex items-center justify-center gap-3 bg-yellow-500/10 border border-yellow-400/20 text-yellow-300 font-semibold px-6 py-3 rounded-xl mb-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  <Trophy className="h-5 w-5" />
                  You earned {QUIZ_COMPLETION_REWARD} FocusCoins!
                </motion.div>
              </motion.div>
              {}
              <motion.div 
                className="text-left space-y-6 my-12"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-primary/20">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    Review Your Answers
                  </h3>
                </div>
                {quiz.questions.map((q, index) => {
                  const userAnswer = answers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;
                  return (
                    <motion.div 
                      key={q.id} 
                      className="p-6 bg-muted/30 backdrop-blur-sm rounded-2xl border border-border"
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    >
                      <p className="font-semibold text-foreground text-lg mb-4">
                        <span className="text-primary mr-2">Q{index + 1}.</span>
                        {q.text}
                      </p>
                      <div className={`flex items-center text-sm p-3 rounded-xl border ${
                        isCorrect 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {isCorrect ? (
                          <Check className="w-5 h-5 mr-3 flex-shrink-0"/>
                        ) : (
                          <X className="w-5 h-5 mr-3 flex-shrink-0"/>
                        )}
                        <div>
                          <p className="font-medium">Your answer: {userAnswer || 'Not answered'}</p>
                          {!isCorrect && (
                            <p className="mt-1 text-muted-foreground">Correct answer: {q.correctAnswer}</p>
                          )}
                        </div>
                      </div>
                      {!isCorrect && (
                        <div className="mt-4">
                          <button
                            onClick={() => handleGetExplanation(q, userAnswer || '')}
                            disabled={loadingQuestionId === q.id}
                            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground/90 hover:text-foreground transition-all duration-200 rounded-xl border border-border text-sm"
                          >
                            {loadingQuestionId === q.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                            Why was I wrong?
                          </button>
                          <AnimatePresence>
                            {explanations[q.id] && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 bg-muted/50 backdrop-blur-sm rounded-xl border border-border"
                              >
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                  {explanations[q.id]}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
              <div className="text-center">
                <button
                  onClick={() => navigate('/quizzes')}
                  className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg"
                >
                  Back to Quizzes
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
        {}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
      </div>
    );
  }
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 overflow-hidden dark">
        <ElegantShape
          delay={0.2}
          width={420}
          height={110}
          rotate={8}
          gradient="from-indigo-500/[0.12]"
          className="left-[-8%] top-[10%]"
        />
        <ElegantShape
          delay={0.4}
          width={380}
          height={95}
          rotate={-12}
          gradient="from-rose-500/[0.12]"
          className="right-[-5%] top-[50%]"
        />
        <ElegantShape
          delay={0.6}
          width={320}
          height={80}
          rotate={-6}
          gradient="from-violet-500/[0.12]"
          className="left-[3%] bottom-[15%]"
        />
      </div>
      {}
      <div className="relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border mb-4"
          >
            <Circle className="h-2 w-2 fill-primary/80" />
            <span className="text-sm text-muted-foreground tracking-wide">
              Quiz Challenge • Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
          </motion.div>
          {}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-2 text-foreground"
          >
            {quiz.title}
          </motion.h1>
        </motion.div>
      </div>
      {}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <GlassCard delay={0.4} className="p-8">
            {}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">Progress</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-semibold text-sm">
                    {currentQuestionIndex + 1} / {quiz.questions.length}
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="bg-primary h-3 rounded-full shadow-lg" 
                  initial={{ width: `${((currentQuestionIndex) / quiz.questions.length) * 100}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
              </div>
            </div>
            {}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="mb-10"
              >
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-violet-500/20">
                      <Brain className="h-5 w-5 text-violet-400" />
                    </div>
                    <span className="text-muted-foreground font-medium text-sm">Question {currentQuestionIndex + 1}</span>
                  </div>
                   <Button variant="ghost" size="sm" onClick={() => handleSpeak(currentQuestion.text)}>
                      {isSpeaking ? <Pause size={16} className="mr-2"/> : <Volume2 size={16} className="mr-2"/>}
                      {isSpeaking ? 'Stop' : 'Read Aloud'}
                  </Button>
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-foreground leading-relaxed mb-8">
                  {currentQuestion.text}
                </h3>
              </motion.div>
            </AnimatePresence>
            {}
            <div className="space-y-4 mb-10">
              {currentQuestion.options.map((option, index) => (
                <motion.button 
                  key={option} 
                  onClick={() => handleSelectAnswer(option)}
                  className="w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 relative group overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  style={{
                    backgroundColor: selectedAnswer === option ? 'hsla(var(--primary) / 0.1)' : 'hsla(var(--muted) / 0.5)',
                    borderColor: selectedAnswer === option ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    boxShadow: selectedAnswer === option ? '0 8px 32px hsla(var(--primary) / 0.3)' : 'none'
                  }}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedAnswer === option 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground group-hover:border-foreground/60'
                    }`}>
                      {selectedAnswer === option && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-primary-foreground rounded-full"
                        />
                      )}
                    </div>
                    <span className="text-foreground font-medium text-lg">{option}</span>
                  </div>
                  {}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </motion.button>
              ))}
            </div>
            {}
            <div className="flex justify-end">
              <motion.button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-violet-600"
                whileHover={{ scale: selectedAnswer ? 1.05 : 1 }}
                whileTap={{ scale: selectedAnswer ? 0.98 : 1 }}
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
          </GlassCard>
        </div>
      </div>
      {}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
    </div>
  );
};
export default QuizView;