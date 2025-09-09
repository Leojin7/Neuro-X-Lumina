import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
const CodingStreakTracker = () => {
    const { codingStreak, lastCodingDate } = useUserStore();
    const today = new Date().toISOString().slice(0, 10);
    const isActiveToday = lastCodingDate === today;
    const hasStreak = codingStreak > 0;
    return (
        <motion.div 
            key={codingStreak} // Re-animate on change
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
                bg-muted/40 border border-border rounded-full p-1.5 pr-4 flex items-center shadow-lg backdrop-blur-sm
                transition-colors duration-300
                ${hasStreak ? 'text-orange-400' : 'text-muted-foreground'}
            `}
        >
            <div className={`
                rounded-full p-2 mr-3 transition-all duration-300
                ${hasStreak ? (isActiveToday ? 'bg-orange-500/80 shadow-[0_0_15px_rgba(251,146,60,0.4)]' : 'bg-orange-500/20') : 'bg-muted'}
            `}>
                <Flame className={hasStreak && isActiveToday ? 'text-white' : 'text-current'} size={20} />
            </div>
            <div className="text-right">
                <span className={`text-xl font-bold transition-colors duration-300 ${hasStreak ? 'text-foreground' : 'text-muted-foreground'}`}>{codingStreak}</span>
                <p className="text-xs -mt-1">{codingStreak === 1 ? 'Day Streak' : 'Day Streak'}</p>
            </div>
        </motion.div>
    );
};
export default CodingStreakTracker;
