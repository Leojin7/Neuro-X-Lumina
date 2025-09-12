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

    const moodLegend = [
        { mood: 'awful', color: 'bg-rose-600' },
        { mood: 'bad', color: 'bg-amber-500' },
        { mood: 'ok', color: 'bg-lime-400' },
        { mood: 'good', color: 'bg-emerald-400' },
        { mood: 'great', color: 'bg-cyan-400' },
    ];
    const WEEKS_TO_SHOW = 17;
    const today = new Date();

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const dayOfWeek = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - (WEEKS_TO_SHOW * 7 - 1) - dayOfWeek);

    const weeks: Date[][] = [];
    for (let w = 0; w < WEEKS_TO_SHOW; w++) {
        const column: Date[] = [];
        for (let r = 0; r < 7; r++) {
            const d = new Date(start);
            d.setDate(start.getDate() + w * 7 + r);
            column.push(d);
        }
        weeks.push(column);
    }
    const checkinsByDate = Object.fromEntries(dailyCheckins.map(c => [c.date, c]));
     const getDayKey = (date: Date) => {
        const y = date.getFullYear();
        const m = date.getMonth();
        const d = date.getDate();
        const utcMidnight = new Date(Date.UTC(y, m, d));
        return utcMidnight.toISOString().slice(0, 10);
    };
    return (
        <Card title="Mood Flow">
            
