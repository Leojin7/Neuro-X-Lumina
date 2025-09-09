import React, { useState } from 'react';
import { useUserStore } from '../stores/useUserStore';
import * as ReactRouterDOM from 'react-router-dom';
import Card from './Card';
import Button from './Button';
import { Zap, Loader2, BrainCircuit, Target, Sun, CheckCircle, Circle, RefreshCw, Coins } from 'lucide-react';
import type { DailyMission } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '../stores/useQuizStore';
import StudyRoadmap from './StudyRoadmap';
const DailyMissions = () => {
    const { studyPlan, isPlanGenerating, generateAndSetStudyPlan, updateMissionStatus } = useUserStore();
    const navigate = ReactRouterDOM.useNavigate();
    const [rewardedDay, setRewardedDay] = useState<number | null>(null);
    const handleGeneratePlan = () => {
        generateAndSetStudyPlan();
    };
    const handleAction = (mission: DailyMission) => {
        updateMissionStatus(mission.day, 'completed');
        switch(mission.activityType) {
            case 'quiz':
            case 'review':
                const quizIdWithAdvanced = mission.activityTarget.toLowerCase().replace(/\s+/g, '-');
                const quizzes = useQuizStore.getState().quizzes;
                const targetQuiz = quizzes.find(q => q.title.toLowerCase() === mission.activityTarget.toLowerCase()) || quizzes.find(q => q.id.includes(quizIdWithAdvanced))
                if (targetQuiz) {
                    navigate(`/quiz/${targetQuiz.id}`);
                } else {
                    alert(`Quiz "${mission.activityTarget}" not found. Starting a default quiz.`);
                    navigate('/quizzes');
                }
                break;
            case 'focus':
                navigate('/focus');
                break;
            case 'generate':
                navigate('/dashboard', { state: { topic: mission.activityTarget } });
                break;
            default:
                break;
        }
    }
    const handleToggleStatus = (mission: DailyMission) => {
        const newStatus = mission.status === 'pending' ? 'completed' : 'pending';
        updateMissionStatus(mission.day, newStatus);
        if (newStatus === 'completed') {
            setRewardedDay(mission.day);
            setTimeout(() => setRewardedDay(null), 2000);
        }
    };
    const MissionIcon = ({ type }: { type: DailyMission['activityType'] }) => {
        switch (type) {
            case 'quiz': return <Target className="h-4 w-4" />;
            case 'focus': return <Sun className="h-4 w-4" />;
            case 'review': return <BrainCircuit className="h-4 w-4" />;
            case 'generate': return <Zap className="h-4 w-4" />;
            default: return null;
        }
    };
    if (isPlanGenerating && !studyPlan) {
        return (
            <Card title="Generating Your Personalized Plan...">
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg animate-pulse">
                            <div className="w-10 h-10 bg-muted rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-1/2"></div>
                                <div className="h-3 bg-muted rounded w-3/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }
    if (!studyPlan) {
        return <StudyRoadmap />;
    }
    const todayMission = studyPlan.find(m => m.status === 'pending') || studyPlan[studyPlan.length - 1];
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-foreground">Your 7-Day Plan</h3>
                <Button variant="ghost" size="sm" onClick={handleGeneratePlan} disabled={isPlanGenerating}>
                    {isPlanGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Regenerate
                </Button>
            </div>
            <div className="space-y-3">
            <AnimatePresence>
                {studyPlan.map(mission => (
                     <motion.div
                        key={mission.day}
                        className={`relative flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${mission.day === todayMission.day && mission.status === 'pending' ? 'bg-primary/10 border border-primary/50' : 'bg-muted/20'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: mission.day * 0.05 }}
                    >
                        <div className="pt-1">
                            <button onClick={() => handleToggleStatus(mission)} className="transition-transform hover:scale-110">
                                {mission.status === 'completed' 
                                    ? <CheckCircle className="text-success" size={20} /> 
                                    : <Circle className="text-muted-foreground" size={20} />}
                            </button>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-muted-foreground">Day {mission.day}</p>
                            <h4 className={`font-bold ${mission.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{mission.title}</h4>
                            <p className={`text-sm mt-1 ${mission.status === 'completed' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{mission.description}</p>
                            {mission.status === 'pending' && mission.day === todayMission.day && (
                                <Button 
                                    size="sm" 
                                    className="mt-3"
                                    onClick={() => handleAction(mission)}
                                    variant="outline"
                                >
                                    <MissionIcon type={mission.activityType}/>
                                    <span className="ml-2">Start Mission</span>
                                </Button>
                            )}
                        </div>
                        <AnimatePresence>
                        {rewardedDay === mission.day && (
                            <motion.div
                                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                animate={{ opacity: 1, y: -20, scale: 1 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="absolute top-2 right-2 flex items-center gap-1 text-yellow-400 font-bold"
                            >
                                <Coins size={14} /> +10
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </AnimatePresence>
            </div>
        </Card>
    );
};
export default DailyMissions;