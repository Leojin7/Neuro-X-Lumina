import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X } from 'lucide-react';
import Button from './Button';
import { useUserStore } from '../stores/useUserStore';
interface StreakPopupProps {
    isOpen: boolean;
    onClose: () => void;
}
const StreakPopup: React.FC<StreakPopupProps> = ({ isOpen, onClose }) => {
    const codingStreak = useUserStore(state => state.codingStreak);
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-background/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                    aria-modal="true"
                    role="dialog"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        className="relative bg-gradient-to-br from-card to-slate-900/80 backdrop-blur-xl border border-orange-500/30 rounded-3xl p-8 shadow-2xl w-full max-w-sm text-center overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        role="document"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-20" aria-label="Close">
                            <X size={24} />
                        </button>
                        {}
                        <motion.div
                            className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-orange-500/20 via-red-500/10 to-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                        />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
                            className="relative z-10"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.15, 1],
                                    filter: ['drop-shadow(0 0 10px #fb923c)', 'drop-shadow(0 0 25px #fb923c)', 'drop-shadow(0 0 10px #fb923c)'],
                                }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            >
                                <Flame className="w-24 h-24 text-orange-400 mx-auto" fill="currentColor" />
                            </motion.div>
                        </motion.div>
                        <div className="relative z-10">
                            <h2 className="text-5xl font-extrabold text-foreground mt-4">{codingStreak}</h2>
                            <p className="text-2xl font-semibold text-orange-400 -mt-1">{codingStreak === 1 ? 'Day Streak!' : 'Day Streak!'}</p>
                            <p className="text-muted-foreground mt-4">
                                Awesome job! You've extended your daily coding streak. Keep the flame alive!
                            </p>
                            <Button onClick={onClose} className="mt-8 w-full" variant="secondary">
                                Continue
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
export default StreakPopup;
