import React, { useEffect, useState, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useSquadStore } from '../stores/useSquadStore';
import { useUserStore } from '../stores/useUserStore';
import { decrypt } from '../services/encryptionService';
import Card from '../components/Card';
import Button from '../components/Button';
import CircularProgress from '../components/CircularProgress';
import { LogOut, Send, BrainCircuit, Users, Play, Pause, RotateCcw, Copy, Check, Lock, Trash2 } from 'lucide-react';
import type { SquadMessage } from '../types';
import { motion } from 'framer-motion';
// ElegantShape (inline)
const ElegantShape = ({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
    animate={{ opacity: 1, y: 0, rotate }}
    transition={{
      duration: 2.4,
      delay,
      ease: [0.23, 0.86, 0.39, 0.96],
      opacity: { duration: 1.2 },
    }}
    className={`absolute ${className}`}
  >
    <motion.div
      animate={{ y: [0, 15, 0] }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ width, height }}
      className="relative"
    >
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-white/10 shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]`}
      />
    </motion.div>
  </motion.div>
);
const SquadView: React.FC = () => {
  const { squadId } = ReactRouterDOM.useParams<{ squadId: string }>();
  const navigate = ReactRouterDOM.useNavigate();
  const { currentUser } = useUserStore();
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'lumina-squad-store') setVersion(v => v + 1);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
  const squad = useSquadStore(state => state.getSquadById(squadId || ''));
  const leaveSquad = useSquadStore(state => state.leaveSquad);
  const sendMessage = useSquadStore(state => state.sendMessage);
  const postAIMessage = useSquadStore(state => state.postAIMessage);
  const toggleTimer = useSquadStore(state => state.toggleTimer);
  const resetTimer = useSquadStore(state => state.resetTimer);
  const decrementTimer = useSquadStore(state => state.decrementTimer);
  const subscribeToSquad = useSquadStore(state => state.subscribeToSquad);
  const unsubscribeFromSquad = useSquadStore(state => state.unsubscribeFromSquad);
  const deleteSquad = useSquadStore(state => state.deleteSquad);
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<number | null>(null);
  // Subscribe to squad updates when component mounts
  useEffect(() => {
    if (squadId) {
      subscribeToSquad(squadId);
      return () => unsubscribeFromSquad(squadId);
    }
  }, [squadId]);
  useEffect(() => {
    if (!squad || !currentUser || !squad.members.some(m => m.uid === currentUser.uid)) {
      navigate('/squads');
    }
  }, [squad, currentUser, navigate]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [squad?.messages]);
  useEffect(() => {
    const isHost = squad?.hostId === currentUser?.uid;
    if (squad?.timerState.isActive && isHost) {
      timerIntervalRef.current = window.setInterval(() => {
        decrementTimer(squad.id);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [squad?.timerState.isActive, squad?.hostId, squad?.id, currentUser?.uid, decrementTimer]);
  useEffect(() => {
    if (!squadId || !squad) return;
    const hasWelcomed = squad.messages.some(m => m.isAIMessage && m.content.includes('Welcome'));
    if (!hasWelcomed) {
      postAIMessage(squadId, `Welcome to '${squad.name}'! Let's get focused.`);
    }
    const tips = [
      "Remember to take short breaks to stay fresh!",
      "Try explaining concepts aloud – Feynman technique!",
      "A clean workspace leads to a clear mind.",
      "Stay hydrated! Water fuels your brain.",
    ];
    const tipInterval = setInterval(() => {
      const tip = tips[Math.floor(Math.random() * tips.length)];
      postAIMessage(squadId, tip);
    }, 90000);
    return () => clearInterval(tipInterval);
  }, [squadId, postAIMessage, squad?.name, squad?.messages]);
  const handleLeaveSquad = async () => {
    if (squadId) {
      console.log('Attempting to leave squad:', squadId);
      try {
        await leaveSquad(squadId);
        console.log('Successfully left squad, navigating to squads list');
        navigate('/squads');
      } catch (error) {
        console.error('Error leaving squad:', error);
        alert('Failed to leave squad. Please try again.');
      }
    }
  };
  const handleDeleteSquad = async () => {
    if (squadId && squad && squad.hostId === currentUser?.uid) {
      const confirmed = window.confirm('Are you sure you want to delete this squad? This action cannot be undone.');
      if (confirmed) {
        console.log('Attempting to delete squad:', squadId);
        try {
          await deleteSquad(squadId);
          console.log('Successfully deleted squad, navigating to squads list');
          navigate('/squads');
        } catch (error) {
          console.error('Error deleting squad:', error);
          alert('Failed to delete squad. Please try again.');
        }
      }
    } else {
      console.warn('Cannot delete squad - not host or missing data:', { squadId, squad, currentUser: currentUser?.uid });
    }
  };
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && squadId) {
      await sendMessage(squadId, chatInput.trim());
      setChatInput('');
    }
  };
  const handleCopyCode = () => {
    if (!squad) return;
    navigator.clipboard.writeText(squad.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (!squad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-10 text-foreground text-center">
          Loading squad...
        </Card>
      </div>
    );
  }
  const isHost = squad.hostId === currentUser?.uid;
  const { timerState } = squad;
  const totalDuration = 25 * 60;
  const progress = ((totalDuration - timerState.timeLeft) / totalDuration) * 100;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none dark">
        <ElegantShape
          delay={0.24}
          width={420}
          height={110}
          rotate={9}
          gradient="from-indigo-500/[0.13]"
          className="left-[-7%] top-[6%]"
        />
        <ElegantShape
          delay={0.44}
          width={320}
          height={91}
          rotate={-15}
          gradient="from-violet-500/[0.13]"
          className="left-[7%] bottom-[13%]"
        />
        <ElegantShape
          delay={0.61}
          width={220}
          height={67}
          rotate={14}
          gradient="from-amber-500/[0.10]"
          className="right-[17%] top-[57%]"
        />
      </div>
      <div className="relative z-10 p-6 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        {}
        <div className="flex-1 flex flex-col gap-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground">{squad.name}</h1>
              <p className="text-primary mt-1">Topic: <span className="font-semibold">{squad.topic}</span></p>
              <div className="mt-2 flex items-center gap-3 bg-muted rounded-xl max-w-max px-3 py-1 text-primary font-mono font-semibold tracking-widest">
                Code: {squad.joinCode}
                <button onClick={handleCopyCode} aria-label="Copy join code" className="ml-1 text-foreground hover:text-muted-foreground transition">
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              {isHost && (
                <Button variant="destructive" onClick={handleDeleteSquad} size="sm" className="flex items-center gap-2">
                  <Trash2 size={18} /> Delete Squad
                </Button>
              )}
              <Button variant="destructive" onClick={handleLeaveSquad} size="sm" className="flex items-center gap-2">
                <LogOut size={18} /> Leave Squad
              </Button>
            </div>
          </header>
          <Card className="flex-1 flex flex-col items-center justify-center text-center bg-card/80 backdrop-blur-xl">
            <div className="relative flex items-center justify-center my-6">
              <CircularProgress progress={progress} size={216} strokeWidth={10} />
              <div className="absolute">
                <h2 className="text-6xl font-extrabold text-foreground">{formatTime(timerState.timeLeft)}</h2>
                <p className="text-muted-foreground mt-2">{timerState.isActive ? "In Session" : "Paused"}</p>
              </div>
            </div>
            {isHost ? (
              <div className="flex justify-center gap-6 mt-6">
                <Button onClick={() => toggleTimer(squad.id)} size="lg" className="w-44">
                  {timerState.isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                  {timerState.isActive ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={() => resetTimer(squad.id)} variant="ghost" size="icon" className="bg-muted hover:bg-muted/80 transition rounded-xl">
                  <RotateCcw />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic mt-4">Timer controlled by squad host.</p>
            )}
          </Card>
        </div>
        {}
        <div className="w-full max-w-md flex flex-col gap-8 flex-shrink-0">
          <Card className="flex-1 flex flex-col bg-card/80 backdrop-blur-lg border-border rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
              <Users size={22} /> Members ({squad.members.length})
            </h3>
            <div className="overflow-y-auto custom-scrollbar space-y-3 max-h-64 no-scrollbar pr-2">
              {squad.members.map(member => (
                <div key={member.uid} className="flex items-center gap-4 bg-muted rounded-xl p-2">
                  <img src={member.photoURL} alt={member.displayName} className="w-9 h-9 rounded-full border-2 border-border shadow-md" />
                  <p className="text-foreground font-medium truncate">{member.displayName}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="flex-[2] flex flex-col bg-card/80 backdrop-blur-lg border-border rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">Live Chat</h3>
              <span className="flex items-center gap-1 text-xs text-green-400 font-semibold" title="End-to-end encrypted">
                <Lock size={12} /> E2EE Active
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {squad.messages.map((msg: SquadMessage) => {
                const content = msg.isAIMessage ? msg.content : decrypt(msg.content);
                const isCurrentUser = msg.author.uid === currentUser?.uid;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}
                  >
                    {!isCurrentUser && (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 flex-shrink-0 flex items-center justify-center shadow-lg">
                        {msg.isAIMessage ? (
                          <BrainCircuit className="text-white" size={18} />
                        ) : (
                          <img src={msg.author.photoURL} alt={msg.author.displayName} className="w-full h-full rounded-full" />
                        )}
                      </div>
                    )}
                    <div className="flex flex-col max-w-xs">
                      <p className={`text-xs mb-0.5 ${isCurrentUser ? 'text-right text-muted-foreground' : 'text-muted-foreground'}`}>
                        {msg.author.displayName}
                      </p>
                      <div
                        className={`p-3 rounded-lg break-words ${
                          msg.isAIMessage
                            ? "bg-primary/10 text-primary-foreground/80 italic border border-primary/20"
                            : isCurrentUser
                            ? "bg-primary text-primary-foreground rounded-br-none shadow-lg"
                            : "bg-muted text-foreground rounded-tl-none"
                        }`}
                      >
                        {content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-6 flex gap-3">
              <input
                type="text"
                aria-label="Type your message"
                placeholder="Send a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 self-stretch text-foreground bg-input placeholder-muted-foreground outline-none focus:ring-2 focus:ring-ring rounded-lg px-4 py-3 border border-border"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-primary hover:bg-primary/90"
                disabled={chatInput.trim().length === 0}
                aria-label="Send message"
              >
                <Send size={20} />
              </Button>
            </form>
          </Card>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
    </div>
  );
};
export default SquadView;