import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Star, GitCommit, GitPullRequest, Code, Trophy, Users, BookCopy } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import type { GitHubStats, LeetCodeStats } from '../../types';
interface StatsGridProps {
    githubStats: GitHubStats;
    leetcodeStats: LeetCodeStats;
    githubVisible: boolean;
    leetcodeVisible: boolean;
}
const StatCard = ({ icon, label, value, unit, colorClass }: { icon: React.ReactNode, label: string, value: number, unit?: string, colorClass: string }) => (
    <motion.div
        className="bg-card/60 p-4 rounded-2xl border border-border flex items-center gap-4 backdrop-blur-sm"
        {...{
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.9 },
            layout: true,
        } as any}
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-foreground">
                <AnimatedNumber value={value} />
                {unit}
            </p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        </div>
    </motion.div>
);
const StatsGrid: React.FC<StatsGridProps> = ({ githubStats, leetcodeStats, githubVisible, leetcodeVisible }) => {
    const { codingXP } = useUserStore();
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <AnimatePresence>
                <div key="neurolearn-xp">
                    <StatCard icon={<Star size={24} />} label="NeuroLearn XP" value={codingXP} colorClass="bg-primary/20 text-primary" />
                </div>
                {githubVisible && (
                    <React.Fragment key="github-block">
                        <div key="github-stars">
                            <StatCard icon={<Star size={24} />} label="GitHub Stars" value={githubStats.stars} colorClass="bg-warning/20 text-warning" />
                        </div>
                        <div key="github-followers">
                            <StatCard icon={<Users size={24} />} label="Followers" value={githubStats.followers} colorClass="bg-green-500/20 text-green-500" />
                        </div>
                        <div key="github-repos">
                            <StatCard icon={<BookCopy size={24} />} label="Repos" value={githubStats.repos} colorClass="bg-secondary text-secondary-foreground" />
                        </div>
                    </React.Fragment>
                )}
                {leetcodeVisible && (
                    <React.Fragment key="leetcode-block">
                        <div key="leetcode-solved">
                            <StatCard icon={<Code size={24} />} label="LC Solved" value={leetcodeStats.solved} colorClass="bg-blue-500/20 text-blue-400" />
                        </div>
                    </React.Fragment>
                )}
            </AnimatePresence>
        </div>
    );
};
// Sub-component for animating numbers
const AnimatedNumber = ({ value }: { value: number }) => {
    return (
        <motion.span
            {...{
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.5 },
            } as any}
        >
            {value.toLocaleString()}
        </motion.span>
    );
};
export default StatsGrid;