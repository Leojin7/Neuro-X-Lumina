import React from 'react';
import { motion } from 'framer-motion';
import type { LeetCodeStats } from '../../types';
import Card from '../Card';
import { Code } from 'lucide-react';
const AnimatedNumber = ({ value }: { value: number }) => (
    <motion.span
        key={value}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
        {value}
    </motion.span>
);
const CircularStat = ({ value, total, label, colorClass, delay }: { value: number; total: number; label: string; colorClass: string, delay: number }) => {
    const radius = 42;
    const strokeWidth = 10;
    const size = (radius + strokeWidth / 2) * 2;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progress = total > 0 ? value / total : 0;
    const strokeDashoffset = circumference - progress * circumference;
    return (
        <motion.div 
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, delay }}
        >
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                    <circle
                        stroke="hsl(var(--muted))"
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        r={normalizedRadius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                    <motion.circle
                        className={colorClass}
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={size / 2}
                        cy={size / 2}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: 'easeOut', delay: delay + 0.3 }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-bold text-xl text-foreground">
                        <AnimatedNumber value={value} />
                    </span>
                    <span className="text-xs text-muted-foreground">/ {total}</span>
                </div>
            </div>
            <p className={`font-semibold text-sm ${colorClass}`}>{label}</p>
        </motion.div>
    );
};
const LeetCodeProblemStats: React.FC<{ stats: LeetCodeStats }> = ({ stats }) => {
    const { 
        solved = 0, 
        easySolved = 0, 
        mediumSolved = 0, 
        hardSolved = 0, 
        totalEasy = 0, 
        totalMedium = 0, 
        totalHard = 0 
    } = stats;
    const hasData = solved > 0 && totalEasy > 0;
    return (
        <Card title="LeetCode Problem Stats" className="h-full flex flex-col justify-between">
            {hasData ? (
                <>
                    <div className="text-center">
                        <p className="text-5xl font-extrabold text-foreground"><AnimatedNumber value={solved} /></p>
                        <p className="font-medium text-muted-foreground mt-1">Total Problems Solved</p>
                    </div>
                    <div className="flex items-end justify-around mt-4">
                        <CircularStat 
                            value={easySolved} 
                            total={totalEasy} 
                            label="Easy" 
                            colorClass="text-success"
                            delay={0.1}
                        />
                        <CircularStat 
                            value={mediumSolved} 
                            total={totalMedium} 
                            label="Medium" 
                            colorClass="text-warning"
                            delay={0.2}
                        />
                        <CircularStat 
                            value={hardSolved} 
                            total={totalHard} 
                            label="Hard" 
                            colorClass="text-destructive"
                            delay={0.3}
                        />
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Code size={48} className="mb-4" />
                    <h3 className="font-semibold text-foreground">No LeetCode Data</h3>
                    <p className="text-sm">Connect your LeetCode account in 'Edit Profile' to see your stats.</p>
                </div>
            )}
        </Card>
    );
};
export default LeetCodeProblemStats;