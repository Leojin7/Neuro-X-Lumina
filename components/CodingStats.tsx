import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import Card from './Card';
import Button from './Button';
import { Code2, Flame, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
const CodingStats = () => {
    const { codingXP, codingStreak, lastCodingDate } = useUserStore();
    const navigate = ReactRouterDOM.useNavigate();
    const today = new Date().toISOString().slice(0, 10);
    const hasStreak = codingStreak > 0;
    const isActiveToday = lastCodingDate === today;
    return (
        <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2"><Code2 /> Coding Arena</h3>
                    <p className="text-muted-foreground mt-1">Sharpen your skills and build your streak.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{codingXP}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Star size={12} /> XP</p>
                    </div>
                     <motion.div 
                        key={codingStreak}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-center transition-colors duration-300 ${hasStreak ? 'text-orange-400' : 'text-muted-foreground'}`}
                    >
                        <p className="text-2xl font-bold">{codingStreak}</p>
                        <p className="text-xs flex items-center gap-1"><Flame size={12} className={hasStreak && isActiveToday ? 'text-orange-400' : ''} /> Streak</p>
                    </motion.div>
                </div>
                 <Button onClick={() => navigate('/coding-arena')} className="group">
                    Enter Arena <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </Card>
    );
};
export default CodingStats;