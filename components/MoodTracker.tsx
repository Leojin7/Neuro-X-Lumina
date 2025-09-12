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
             {dailyCheckins.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
                    <BarChart2 size={40} className="mb-4" />
                    <h3 className="font-semibold text-foreground">Log your mood daily</h3>
                    <p className="text-sm">Complete the daily check-in to see your trends here.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="overflow-x-auto">
                        { } <div className="flex gap-1 pl-6 mb-1 text-[10px] text-muted-foreground select-none">
                            {weeks.map((col, idx) => {
                                const firstDay = col[0];
                                const prevFirst = idx > 0 ? weeks[idx - 1][0] : null;
                                const showLabel = idx === 0 || (prevFirst && firstDay.getMonth() !== prevFirst.getMonth());
                                return (
                                    <div key={`m-${idx}`} className="w-3 h-3 md:w-3.5 md:h-3.5 flex items-end justify-center">
                                        {showLabel && (
                                            <span className="truncate" style={{ width: '2rem' }}>
                                                {firstDay.toLocaleString('en-US', { month: 'short' })}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-1">
                            { }
                            <div className="grid grid-rows-7 gap-1.5 text-[10px] text-muted-foreground select-none mr-2 sticky left-0 bg-card/0">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
<div key={`lab-${d}`} className="flex items-center justify-end pr-2" style={{ height: '14px' }}>
                                        {(i === 0 || i === 2 || i === 4) ? d : ''}
                                    </div>
                                ))}
                            </div>
                            { }
                            <div className="flex gap-1 w-max">
                                {weeks.map((col, cIdx) => (
                                    <div key={`c-${cIdx}`} className="grid grid-rows-7 gap-1.5">
                                        {col.map((day, rIdx) => {
                                            const dayKey = getDayKey(day);
                                            const checkin = checkinsByDate[dayKey];
                                            const color = checkin ? moodColors[checkin.mood] : 'bg-muted/40';
                                            const isFuture = day > today;
                                            return (
                                                <div key={`d-${cIdx}-${rIdx}`} className="relative group" style={{ width: '14px', height: '14px' }}>
                                                    <div className={`w-full h-full rounded ${color} ${isFuture ? 'opacity-20' : ''}`}></div>
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max p-2 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                                        {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                     {checkin && <span className="capitalize">: {checkin.mood}</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span>Less Positive</span>
                        <div className="flex items-center gap-1">
                            {moodLegend.map(item => <div key={item.mood} className={`w-4 h-4 rounded ${item.color} ring-1 ring-border`}></div>)}
                        </div>
                        <span>More Positive</span>
                    </div>
                </div>
            )}
        </Card>
    );
};
export default MoodTracker;
