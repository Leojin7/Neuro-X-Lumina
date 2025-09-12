import React from 'react';
import Card from './Card';
import { useUserStore } from '../stores/useUserStore';
import type { Mood } from '../types';
import { BarChart2 } from 'lucide-react';
const MoodTracker: React.FC = () => {
    const dailyCheckins = useUserStore(state => state.dailyCheckins);
    const moodColors: Record<Mood, string> = {
        awful: 'bg-rose-600',
        bad: 'bg-amber-500',
        ok: 'bg-lime-400',
        good: 'bg-emerald-400',
        great: 'bg-cyan-400',
    };
