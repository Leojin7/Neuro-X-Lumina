
import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { useUserStore } from '../stores/useUserStore';
import { Flame, Target, Plus, Check, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const toYYYYMMDD = (date: Date) => date.toISOString().slice(0, 10);
const HabitTracker = () => {
    const { habits, addHabit, toggleHabit } = useUserStore();
    const [newHabitName, setNewHabitName] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const todayStr = toYYYYMMDD(new Date());
    const handleAddHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitName.trim()) return;
        addHabit(newHabitName, 30); // Default 30-day goal
        setNewHabitName('');
        setShowAddForm(false);
    };
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2"><Target /> Conscious Habits</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? <RotateCcw size={16} /> : <Plus size={16} />}
                    {showAddForm ? 'Cancel' : 'New Habit'}
                </Button>
            </div>
            <AnimatePresence>
            {showAddForm && (
                <motion.form 
                    onSubmit={handleAddHabit} 
                    className="flex gap-2 mb-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <input
                        type="text"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder="e.g., Read for 20 minutes"
                        className="flex-1 bg-input rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                        autoFocus
                    />
                    <Button type="submit" variant="primary" disabled={!newHabitName.trim()}>Add</Button>
                </motion.form>
            )}
            </AnimatePresence>
            <div className="space-y-3">
                {habits.length > 0 ? habits.map(habit => {
                    const isDoneToday = habit.lastCompleted === todayStr;
                    return (
                        <motion.div
                            key={habit.id}
                            className={`flex items-center gap-4 p-3 rounded-lg transition-colors duration-300 ${isDoneToday ? 'bg-success/10' : 'bg-muted/50'}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            layout
                        >
                            <Button 
                                variant={isDoneToday ? 'primary' : 'secondary'}
                                onClick={() => toggleHabit(habit.id)}
                                className={`!p-0 w-10 h-10 rounded-full flex-shrink-0 ${isDoneToday ? 'bg-success text-success-foreground' : ''}`}
                            >
                                <Check size={20} />
                            </Button>
                            <div className="flex-1">
                                <p className={`font-semibold text-foreground ${isDoneToday ? 'line-through' : ''}`}>{habit.name}</p>
                                <p className="text-xs text-muted-foreground">Goal: {habit.goal} days</p>
                            </div>
                            <div className={`flex items-center gap-1.5 font-bold text-lg ${habit.streak > 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                                <Flame size={18} />
                                {habit.streak}
                            </div>
                        </motion.div>
                    )
                }) : (
                    <p className="text-center text-muted-foreground py-4">No habits yet. Add one to get started!</p>
                )}
            </div>
        </Card>
    );
};
export default HabitTracker;