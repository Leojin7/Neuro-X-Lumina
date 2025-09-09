import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Rewind, Loader2 } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import toast from 'react-hot-toast';
import Button from './Button';
const TimeTravelTicket: React.FC = () => {
    const { timeTravelTickets, useTimeTravelTicket, codingStreak, lastCodingDate } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10);
    const isStreakBroken = codingStreak > 0 && lastCodingDate !== today && lastCodingDate !== yesterday;
    const handleUseTicket = () => {
        setIsLoading(true);
        if (window.confirm("Are you sure you want to use a Time Travel Ticket? This will mend your streak, allowing you to continue it with today's solution.")) {
            const success = useTimeTravelTicket();
            if (success) {
                toast.success("Streak mended! Solve today's problem to continue it.");
            } else {
                toast.error("You don't have any Time Travel Tickets!");
            }
        }
        // This is a simulation, in a real app you might have more complex logic
        setTimeout(() => setIsLoading(false), 500);
    }
    return (
        <div className="bg-muted/20 p-3 rounded-2xl border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/20 rounded-lg text-primary">
                    <Ticket size={24}/>
                </div>
                <div>
                    <p className="font-bold text-foreground">Time Travel Ticket</p>
                    <p className="text-xs text-muted-foreground">Mend a broken streak</p>
                </div>
            </div>
            <div className="text-center">
                 <p className="font-bold text-2xl text-foreground">{timeTravelTickets}</p>
                 <p className="text-xs text-muted-foreground -mt-1">available</p>
            </div>
            {isStreakBroken && (
                 <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUseTicket} 
                    disabled={isLoading || timeTravelTickets === 0}
                    className="!px-3"
                 >
                    {isLoading ? <Loader2 className="animate-spin"/> : <Rewind size={16}/>}
                    <span className="ml-2">Use One</span>
                </Button>
            )}
        </div>
    );
};
export default TimeTravelTicket;
