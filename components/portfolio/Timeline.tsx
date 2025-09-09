import React from 'react';
import { motion } from 'framer-motion';
import type { TimelineEvent } from '../../types';
import Card from '../Card';
import { Briefcase, Milestone, BookOpen, GitBranch } from 'lucide-react';
const icons = {
    Job: <Briefcase className="w-5 h-5" />,
    Milestone: <Milestone className="w-5 h-5" />,
    Learn: <BookOpen className="w-5 h-5" />,
    Project: <GitBranch className="w-5 h-5" />,
};
const TimelineItem = ({ event, isLast }: { event: TimelineEvent, isLast: boolean }) => {
    return (
        <motion.div
            className="flex gap-4"
            {...{
                initial: { opacity: 0, y: 30 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, amount: 0.5 },
                transition: { type: 'spring', stiffness: 100 },
            } as any}
        >
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-muted border-2 border-primary/50 flex items-center justify-center text-primary">
                    {icons[event.icon]}
                </div>
                {!isLast && <div className="w-0.5 flex-grow bg-border mt-2"></div>}
            </div>
            <div className="pb-8 flex-1">
                <p className="text-sm text-muted-foreground">{event.date}</p>
                <h3 className="font-bold text-foreground mt-1">{event.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            </div>
        </motion.div>
    );
};
interface TimelineProps {
    events: TimelineEvent[];
}
const Timeline: React.FC<TimelineProps> = ({ events }) => {
    return (
        <Card title="Career Timeline" className="h-full">
             <div className="max-h-[30rem] overflow-y-auto pr-2 custom-scrollbar">
                {events.map((event, index) => (
                    <TimelineItem key={event.id} event={event} isLast={index === events.length - 1} />
                ))}
                 {events.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>No timeline events yet.</p>
                    </div>
                 )}
             </div>
        </Card>
    );
};
export default Timeline;