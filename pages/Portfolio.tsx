import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useUserStore } from '../stores/useUserStore';
import { usePortfolioStore } from '../stores/usePortfolioStore';
import { Circle, Github, Code2, Trophy, Calendar, FileText, Sparkles, TrendingUp, Star, GitBranch } from 'lucide-react';
import PortfolioHeader from '../components/portfolio/PortfolioHeader';
import StatsGrid from '../components/portfolio/StatsGrid';
import LeetCodeProblemStats from '../components/portfolio/LeetCodeProblemStats';
import ProjectShowcase from '../components/portfolio/ProjectShowcase';
import Timeline from '../components/portfolio/Timeline';
import ResumeGenerator from '../components/portfolio/ResumeGenerator';
import EditProfileModal from '../components/EditProfileModal';
import * as externalApiService from '../services/externalApiService';
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
// Glass Section Wrapper
const GlassSection = ({ 
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
    className={`rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl p-8 ${className}`}
  >
    {children}
  </motion.div>
);
const Portfolio = () => {
    const { currentUser } = useUserStore();
    const { 
        githubStats, 
        leetcodeStats, 
        projects, 
        timelineEvents,
        integrations,
        isSyncing,
        fetchAndSetStats
    } = usePortfolioStore();
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    if (!currentUser) return null;
    const handleSync = () => {
        fetchAndSetStats(externalApiService);
    };
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };
    const itemVariants: Variants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { 
                type: 'spring', 
                stiffness: 100, 
                damping: 15 
            },
        },
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
                    className="left-[-8%] top-[5%]"
                />
                <ElegantShape
                    delay={0.4}
                    width={400}
                    height={100}
                    rotate={-12}
                    gradient="from-rose-500/[0.12]"
                    className="right-[-5%] top-[35%]"
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
                    className="right-[15%] top-[70%]"
                />
                <ElegantShape
                    delay={1.0}
                    width={180}
                    height={50}
                    rotate={-20}
                    gradient="from-cyan-500/[0.12]"
                    className="left-[25%] top-[15%]"
                />
            </div>
            {}
            <div className="relative z-10 p-6">
                <motion.div
                    className="max-w-7xl mx-auto space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {}
                    <motion.div variants={itemVariants}>
                        {}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border mb-6"
                        >
                            <Circle className="h-2 w-2 fill-primary/80" />
                            <span className="text-sm text-muted-foreground tracking-wide">
                                Developer Portfolio
                            </span>
                        </motion.div>
                        {}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-4xl md:text-6xl font-bold mb-4 text-foreground"
                        >
                            Professional Portfolio
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-lg text-muted-foreground mb-8 max-w-2xl"
                        >
                            Showcasing my journey in software development, achievements, and contributions to the tech community.
                        </motion.p>
                        <GlassSection delay={0.4}>
                            <PortfolioHeader
                                user={currentUser}
                                onEdit={() => setEditModalOpen(true)}
                                onSync={handleSync}
                                isSyncing={isSyncing}
                            />
                        </GlassSection>
                    </motion.div>
                    {}
                    <AnimatePresence>
                        {(integrations.github.visible || integrations.leetcode.visible) && (
                            <motion.div
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <GlassSection 
                                    delay={0.5}
                                    className="bg-gradient-to-br from-card/80 to-card/50"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-full bg-primary/20">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                        </div>
                                        <h2 className="text-2xl font-semibold text-foreground">
                                            Development Statistics
                                        </h2>
                                    </div>
                                    <StatsGrid 
                                        githubStats={githubStats} 
                                        leetcodeStats={leetcodeStats}
                                        githubVisible={integrations.github.visible}
                                        leetcodeVisible={integrations.leetcode.visible}
                                    />
                                </GlassSection>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {integrations.github.visible && (
                                <motion.div
                                    className="lg:col-span-2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    layout
                                >
                                    <GlassSection 
                                        delay={0.6}
                                        className="h-full bg-gradient-to-br from-card/80 to-card/50"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 rounded-full bg-violet-500/20">
                                                <GitBranch className="h-5 w-5 text-violet-400" />
                                            </div>
                                            <h2 className="text-2xl font-semibold text-foreground">
                                                Featured Projects
                                            </h2>
                                        </div>
                                        <ProjectShowcase projects={projects} />
                                    </GlassSection>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <motion.div 
                            className={integrations.github.visible ? "lg:col-span-1" : "lg:col-span-3"}
                            variants={itemVariants}
                            layout
                        >
                            <GlassSection 
                                delay={0.7}
                                className="h-full bg-gradient-to-br from-card/80 to-card/50"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-full bg-green-500/20">
                                        <Code2 className="h-5 w-5 text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-foreground">
                                        Coding Statistics
                                    </h2>
                                </div>
                                <LeetCodeProblemStats stats={leetcodeStats} />
                            </GlassSection>
                        </motion.div>
                    </div>
                    {}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div 
                            className="lg:col-span-2" 
                            variants={itemVariants}
                        >
                            <GlassSection 
                                delay={0.8}
                                className="h-full bg-gradient-to-br from-card/80 to-card/50"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-full bg-amber-500/20">
                                        <Calendar className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-foreground">
                                        Professional Timeline
                                    </h2>
                                </div>
                                <Timeline events={timelineEvents} />
                            </GlassSection>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <GlassSection 
                                delay={0.9}
                                className="h-full bg-gradient-to-br from-card/80 to-card/50"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-full bg-rose-500/20">
                                        <FileText className="h-5 w-5 text-rose-400" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-foreground">
                                        Resume Builder
                                    </h2>
                                </div>
                                <ResumeGenerator />
                            </GlassSection>
                        </motion.div>
                    </div>
                    {}
                    <motion.div variants={itemVariants}>
                        <GlassSection 
                            delay={1.0}
                            className="bg-gradient-to-r from-card/80 via-primary/5 to-secondary/5"
                        >
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20">
                                        <Trophy className="h-6 w-6 text-yellow-400" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-foreground">
                                        Achievement Showcase
                                    </h2>
                                </div>
                                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                    Highlighting key milestones, certifications, and recognition in my development journey.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-400/20">
                                        <div className="p-3 rounded-full bg-blue-500/20 w-fit mx-auto mb-4">
                                            <Github className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-2">Open Source</h3>
                                        <p className="text-sm text-muted-foreground">Contributing to community projects</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-400/20">
                                        <div className="p-3 rounded-full bg-violet-500/20 w-fit mx-auto mb-4">
                                            <Star className="h-6 w-6 text-violet-400" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-2">Recognition</h3>
                                        <p className="text-sm text-muted-foreground">Awards and acknowledgments</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-400/20">
                                        <div className="p-3 rounded-full bg-green-500/20 w-fit mx-auto mb-4">
                                            <Sparkles className="h-6 w-6 text-green-400" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-2">Innovation</h3>
                                        <p className="text-sm text-muted-foreground">Creative solutions and ideas</p>
                                    </div>
                                </div>
                            </div>
                        </GlassSection>
                    </motion.div>
                </motion.div>
            </div>
            {}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
            />
            {}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
        </div>
    );
};
export default Portfolio;