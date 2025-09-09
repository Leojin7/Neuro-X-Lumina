import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Flower2, 
  Shield, 
  Moon, 
  Heart, 
  BarChart3, 
  Phone,
  Circle,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
// Component imports
import MindShiftTool from '../components/MindShiftTool';
import GratitudeGrove from '../components/GratitudeGrove';
import DigitalWellbeing from '../components/wellness/DigitalWellbeing';
import SleepWellness from '../components/wellness/SleepWellness';
import Mindfulness from '../components/wellness/Mindfulness';
import WellnessAnalytics from '../components/wellness/WellnessAnalytics';
import SupportHub from '../components/wellness/SupportHub';
type WellnessTab = 'mindshift' | 'gratitude' | 'digital' | 'sleep' | 'mindfulness' | 'analytics' | 'crisis';
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
const Wellness: React.FC = () => {
  const location = ReactRouterDOM.useLocation();
  const [activeTab, setActiveTab] = useState<WellnessTab>('mindshift');
  useEffect(() => {
    if (location.state?.initialTab) {
      setActiveTab(location.state.initialTab);
    }
  }, [location.state]);
  const tabs: { id: WellnessTab; label: string; icon: React.ReactNode; color: string; description: string }[] = [
    { 
      id: 'mindshift', 
      label: 'MindShift', 
      icon: <BrainCircuit size={18} />, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Cognitive therapy & thought reframing'
    },
    { 
      id: 'gratitude', 
      label: 'Gratitude Grove', 
      icon: <Flower2 size={18} />, 
      color: 'from-pink-500 to-rose-500',
      description: 'Daily gratitude & positivity tracking'
    },
    { 
      id: 'digital', 
      label: 'Digital Wellbeing', 
      icon: <Shield size={18} />, 
      color: 'from-purple-500 to-violet-500',
      description: 'AI-powered focus plans & digital detox'
    },
    { 
      id: 'sleep', 
      label: 'Sleep Wellness', 
      icon: <Moon size={18} />, 
      color: 'from-indigo-500 to-blue-500',
      description: 'Cognitive recharge scores & advice'
    },
    { 
      id: 'mindfulness', 
      label: 'Mindfulness', 
      icon: <Heart size={18} />, 
      color: 'from-green-500 to-emerald-500',
      description: 'AI-generated meditation sessions'
    },
    { 
      id: 'analytics', 
      label: 'Wellness Analytics', 
      icon: <BarChart3 size={18} />, 
      color: 'from-amber-500 to-orange-500',
      description: 'Personalized correlation stories'
    },
    { 
      id: 'crisis', 
      label: 'Support Hub', 
      icon: <Phone size={18} />, 
      color: 'from-red-500 to-pink-500',
      description: 'Emergency resources & guided help'
    },
  ];
  const currentTab = tabs.find(tab => tab.id === activeTab);
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
              <Circle className="h-2 w-2 fill-green-400/80" />
              <span className="text-sm text-muted-foreground tracking-wide">
                Digital Wellness Platform
              </span>
            </motion.div>
            {}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-4 text-foreground"
            >
              Wellness Companion
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-muted-foreground text-lg max-w-3xl"
            >
              Your comprehensive digital wellness platform. Track mental health, optimize sleep, practice mindfulness, 
              and access professional support - all designed to cultivate a healthier, more resilient you.
            </motion.p>
          </motion.div>
          {}
          <GlassCard delay={0.4} className="mb-8">
            <div className="p-6">
              <div className="flex flex-wrap gap-3 mb-6">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border'
                    }`}
                  >
                    <div className={activeTab === tab.id ? 'text-white' : 'text-muted-foreground'}>
                      {tab.icon}
                    </div>
                    <span className="text-sm">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
              {}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border"
                >
                  <div className={`p-2 rounded-full bg-gradient-to-r ${currentTab?.color} bg-opacity-20`}>
                    <div className={`bg-gradient-to-r ${currentTab?.color} bg-clip-text text-transparent`}>
                      {currentTab?.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{currentTab?.label}</h3>
                    <p className="text-sm text-muted-foreground">{currentTab?.description}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </GlassCard>
          {}
          <GlassCard delay={0.6} className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {activeTab === 'mindshift' && <MindShiftTool />}
                {activeTab === 'gratitude' && <GratitudeGrove />}
                {activeTab === 'digital' && <DigitalWellbeing />}
                {activeTab === 'sleep' && <SleepWellness />}
                {activeTab === 'mindfulness' && <Mindfulness />}
                {activeTab === 'analytics' && <WellnessAnalytics />}
                {activeTab === 'crisis' && <SupportHub />}
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
      {}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
    </div>
  );
};
export default Wellness;