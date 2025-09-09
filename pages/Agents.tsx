import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, BookOpen, Presentation, Circle, Wand2, Loader2, Link as LinkIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Task, Agent, AgentType } from '../types';
import * as gemini from '../services/geminiService';
import Button from '../components/Button';
// AGENT DEFINITIONS
const AGENTS: Agent[] = [
    {
        id: 'research',
        name: 'Research Assistant',
        description: 'Gathers and synthesizes information on any topic using Google Search.',
        icon: BookOpen,
        color: 'text-blue-400',
        accentColor: 'border-blue-500/50',
    },
    {
        id: 'presentation',
        name: 'Presentation Maker',
        description: 'Creates structured presentation outlines from a topic or research.',
        icon: Presentation,
        color: 'text-purple-400',
        accentColor: 'border-purple-500/50',
    },
];
const ElegantShape = ({ className, delay = 0, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]" }: { className?: string; delay?: number; width?: number; height?: number; rotate?: number; gradient?: string; }) => (
    <motion.div initial={{ opacity: 0, y: -150, rotate: rotate - 15 }} animate={{ opacity: 1, y: 0, rotate }} transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }} className={`absolute ${className}`}>
        <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} style={{ width, height }} className="relative">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]`} />
        </motion.div>
    </motion.div>
);
const TaskCard = ({ task, isDragging }: { task: Task; isDragging: boolean }) => {
    const getBorderColor = () => {
        switch (task.status) {
            case 'in_progress': return 'border-yellow-500/50 animate-pulse';
            case 'completed': return 'border-green-500/50';
            case 'error': return 'border-red-500/50';
            default: return 'border-white/20';
        }
    };
    const ResultDisplay = () => {
        if (!task.result) return null;
        if (task.assignedAgent === 'research') {
            return (
                <div className="mt-3 pt-3 border-t border-white/10 text-sm">
                    <p className="text-white/90 whitespace-pre-wrap">{task.result.text}</p>
                    {task.result.sources && task.result.sources.length > 0 && (
                        <div className="mt-2">
                            <h4 className="font-semibold text-xs text-white/70">Sources:</h4>
                            <ul className="list-disc list-inside text-blue-400 text-xs mt-1 space-y-1">
                                {task.result.sources.map((source, i) => (
                                    <li key={i}><a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">{source.web.title}</a></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }
        if (task.assignedAgent === 'presentation' && task.result.presentation) {
            return (
                <div className="mt-3 pt-3 border-t border-white/10 text-sm space-y-3">
                    {task.result.presentation.map((slide, i) => (
                        <div key={i}>
                            <h4 className="font-semibold text-white/90">{i + 1}. {slide.slideTitle}</h4>
                            <ul className="list-disc list-inside text-white/70 pl-4 mt-1">
                                {slide.bulletPoints.map((point, j) => <li key={j}>{point}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    }
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl border ${getBorderColor()} ${isDragging ? 'bg-white/20' : 'bg-white/10'} backdrop-blur-sm cursor-grab active:cursor-grabbing`}
        >
            <div className="flex items-start justify-between">
                <p className="text-white/90 font-medium text-sm pr-4">{task.text}</p>
                <div className="flex-shrink-0">
                    {task.status === 'in_progress' && <Loader2 size={16} className="animate-spin text-yellow-400" />}
                    {task.status === 'completed' && <CheckCircle size={16} className="text-green-400" />}
                    {task.status === 'error' && <AlertTriangle size={16} className="text-red-400" />}
                </div>
            </div>
            {task.status === 'completed' && <ResultDisplay />}
        </motion.div>
    );
};
const Agents: React.FC = () => {
    const [goal, setGoal] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [draggingTask, setDraggingTask] = useState<string | null>(null);
    const agentColumnRefs = {
        research: useRef<HTMLDivElement>(null),
        presentation: useRef<HTMLDivElement>(null),
    };
    const handleGenerateSubtasks = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal.trim()) return;
        setIsLoading(true);
        setTasks([]);
        try {
            const subtaskStrings = await gemini.breakdownGoalIntoSubtasks(goal);
            const newTasks = subtaskStrings.map((text, i) => ({
                id: `task-${Date.now()}-${i}`,
                text,
                status: 'todo' as const,
            }));
            setTasks(newTasks);
        } catch (error) {
            console.error("Failed to generate subtasks:", error);
            // Show an error toast or message
        } finally {
            setIsLoading(false);
        }
    };
    const runAgentExecution = useCallback(async (taskId: string, agentId: AgentType) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        try {
            let result;
            if (agentId === 'research') {
                result = await gemini.executeResearchTask(task.text);
            } else if (agentId === 'presentation') {
                result = await gemini.executePresentationTask(task.text);
            }
            setTasks(current => current.map(t => t.id === taskId ? { ...t, status: 'completed', result } : t));
        } catch (error) {
            console.error(`Agent ${agentId} failed for task ${taskId}:`, error);
            setTasks(current => current.map(t => t.id === taskId ? { ...t, status: 'error', result: { text: "An error occurred." } } : t));
        }
    }, [tasks]);
    const assignTask = useCallback((taskId: string, agentId: AgentType) => {
        setTasks(currentTasks => {
            const taskToAssign = currentTasks.find(t => t.id === taskId);
            // Allow re-assigning completed tasks
            if (taskToAssign) {
                runAgentExecution(taskId, agentId);
                return currentTasks.map(t => 
                    t.id === taskId 
                        ? { ...t, status: 'in_progress', assignedAgent: agentId, result: undefined } 
                        : t
                );
            }
            return currentTasks;
        });
    }, [runAgentExecution]);
    const handleDragEnd = (_event: any, info: any, taskId: string) => {
        setDraggingTask(null);
        const point = { x: info.point.x, y: info.point.y };
        for (const agent of AGENTS) {
            const zone = agentColumnRefs[agent.id].current?.getBoundingClientRect();
            if (zone && point.x >= zone.left && point.x <= zone.right && point.y >= zone.top && point.y <= zone.bottom) {
                assignTask(taskId, agent.id);
                return;
            }
        }
    };
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const agentTasks = Object.fromEntries(
        AGENTS.map(agent => [agent.id, tasks.filter(t => t.assignedAgent === agent.id)])
    );
    return (
        <div className="min-h-screen bg-[#030303] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <ElegantShape delay={0.2} width={500} height={120} rotate={8} gradient="from-indigo-500/[0.12]" className="left-[-8%] top-[8%]" />
                <ElegantShape delay={0.4} width={400} height={100} rotate={-12} gradient="from-rose-500/[0.12]" className="right-[-5%] top-[45%]" />
            </div>
            <div className="relative z-10 p-6 space-y-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
                        <Circle className="h-2 w-2 fill-blue-400/80" />
                        <span className="text-sm text-white/60 tracking-wide">AI Agent Hub</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-violet-200">Delegate Your Workload</h1>
                    <p className="text-white/70 text-lg max-w-3xl mt-4">Define a high-level goal, and our specialized AI agents will break it down and execute the subtasks for you.</p>
                </motion.div>
                <motion.form onSubmit={handleGenerateSubtasks} className="flex flex-col sm:flex-row gap-4 items-center bg-white/[0.05] p-6 rounded-2xl border border-white/10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <Wand2 className="text-primary h-8 w-8 flex-shrink-0" />
                    <input
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Enter a high-level goal, e.g., 'Create a presentation on the history of AI'"
                        className="flex-1 bg-transparent text-lg p-2 focus:outline-none text-white placeholder-white/40"
                    />
                    <Button type="submit" size="lg" disabled={isLoading || !goal.trim()}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Subtasks'}
                    </Button>
                </motion.form>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/20 min-h-[300px]">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Lightbulb className="text-yellow-400"/>Subtasks</h2>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {todoTasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        drag
                                        onDragStart={() => setDraggingTask(task.id)}
                                        onDragEnd={(e, i) => handleDragEnd(e, i, task.id)}
                                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                        dragElastic={1}
                                        layout
                                    >
                                        <TaskCard task={task} isDragging={draggingTask === task.id} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                             {tasks.length > 0 && todoTasks.length === 0 && (
                                <p className="text-center text-sm text-white/50 pt-10">All tasks assigned! Drag a completed task to an agent to re-run.</p>
                             )}
                              {tasks.length === 0 && !isLoading && (
                                <p className="text-center text-sm text-white/50 pt-10">Your generated subtasks will appear here. Drag them to an agent on the right.</p>
                            )}
                        </div>
                    </div>
                    {AGENTS.map(agent => (
                        <div key={agent.id} ref={agentColumnRefs[agent.id]} className={`bg-white/[0.02] p-4 rounded-2xl border border-dashed ${agent.accentColor} min-h-[300px]`}>
                            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${agent.color}`}>
                                <agent.icon/>{agent.name}
                            </h2>
                             <p className="text-xs text-white/60 mb-4">{agent.description}</p>
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {agentTasks[agent.id]?.map(task => (
                                        <motion.div
                                            key={task.id}
                                            drag
                                            onDragStart={() => setDraggingTask(task.id)}
                                            onDragEnd={(e, i) => handleDragEnd(e, i, task.id)}
                                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                            dragElastic={1}
                                            layout
                                        >
                                            <TaskCard task={task} isDragging={draggingTask === task.id} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
        </div>
    );
};
export default Agents;
