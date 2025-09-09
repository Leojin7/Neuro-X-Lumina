
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import CreateSquadModal from '../components/CreateSquadModal';
import JoinSquadByCodeModal from '../components/JoinSquadByCodeModal';
import { useSquadStore } from '../stores/useSquadStore';
import { Users, Clock, PlusCircle, Key } from 'lucide-react';
import type { StudySquad } from '../types';
import { motion } from 'framer-motion';
// ElegantShape Component (inline, no external import required)
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
const SquadsList: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const squads = useSquadStore(state => state.squads);
  const joinSquad = useSquadStore(state => state.joinSquad);
  const subscribeToAllSquads = useSquadStore(state => state.subscribeToAllSquads);
  const unsubscribeFromAllSquads = useSquadStore(state => state.unsubscribeFromAllSquads);
  // Subscribe to all squads when component mounts
  useEffect(() => {
    console.log('SquadsList: Subscribing to all squads');
    subscribeToAllSquads();
    return () => {
      console.log('SquadsList: Unsubscribing from all squads');
      unsubscribeFromAllSquads();
    };
  }, []);
  // Debug logging
  useEffect(() => {
    console.log('SquadsList: Current squads:', squads);
  }, [squads]);
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'lumina-squad-store') {
        setVersion(v => v + 1);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
  const handleJoinSquad = async (id: string) => {
    const success = await joinSquad(id);
    if (success) navigate(`/squad/${id}`);
    else alert("Could not join squad. Please login.");
  };
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none dark">
        <ElegantShape
          delay={0.25}
          width={480}
          height={120}
          rotate={10}
          gradient="from-indigo-500/[0.14]"
          className="left-[-9%] top-[9%]"
        />
        <ElegantShape
          delay={0.51}
          width={380}
          height={95}
          rotate={-12}
          gradient="from-rose-500/[0.13]"
          className="right-[-5%] top-[60%]"
        />
        <ElegantShape
          delay={0.43}
          width={300}
          height={85}
          rotate={-5}
          gradient="from-violet-500/[0.14]"
          className="left-[8%] bottom-[18%]"
        />
        <ElegantShape
          delay={0.69}
          width={220}
          height={70}
          rotate={16}
          gradient="from-amber-500/[0.12]"
          className="right-[18%] top-[23%]"
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.68 }}
        className="max-w-6xl mx-auto space-y-10 p-6"
      >
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-foreground">
              Collaboration Squads
            </h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-lg">
              Grow together—join or create your own focus squad now.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setJoinModalOpen(true)} size="sm" className="flex items-center gap-2">
              <Key size={16} />
              Join with Code
            </Button>
            <Button onClick={() => setCreateModalOpen(true)} size="sm" className="flex items-center gap-2">
              <PlusCircle size={16} />
              Create Squad
            </Button>
          </div>
        </header>
        <div className="flex flex-wrap gap-6 justify-center">
          {squads && squads.length > 0 ? (
            squads.map((squad: StudySquad, i) => (
              <motion.div
                key={squad.id}
                className="max-w-sm w-full bg-card/80 backdrop-blur-xl rounded-3xl border border-border shadow-lg flex flex-col transition-transform cursor-pointer hover:scale-[1.03]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 150, damping: 20 }}
              >
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-1">
                    {squad.topic}
                  </p>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{squad.name}</h3>
                  <div className="flex gap-5 text-sm text-muted-foreground mt-auto">
                    <span className="flex items-center gap-1.5">
                      <Users size={16} />
                      {squad.members.length} {squad.members.length === 1 ? 'member' : 'members'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} />
                      {squad.timerState.isActive ? 'In Session' : 'Idle'}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-b-3xl">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => handleJoinSquad(squad.id)}
                    aria-label={`Join squad ${squad.name}`}
                  >
                    Join Squad
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <Card className="w-full max-w-3xl text-center p-10 bg-card/50 border-border rounded-3xl">
              <h3 className="text-2xl font-semibold text-foreground">
                No active squads
              </h3>
              <p className="text-muted-foreground mt-3">
                Create your first study squad to get started!
              </p>
              <div className="mt-6">
                <Button onClick={() => setCreateModalOpen(true)} className="mx-auto">
                  <PlusCircle size={16} className="mr-2" />
                  Create Your First Squad
                </Button>
              </div>
            </Card>
          )}
        </div>
      </motion.div>
      <CreateSquadModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />
      <JoinSquadByCodeModal isOpen={isJoinModalOpen} onClose={() => setJoinModalOpen(false)} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
    </div>
  );
};
export default SquadsList;