
import React, { useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Type } from 'lucide-react';
import Button from './Button';
import { useSquadStore } from '../stores/useSquadStore';
import * as ReactRouterDOM from 'react-router-dom';
interface CreateSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const CreateSquadModal = ({ isOpen, onClose }: CreateSquadModalProps) => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const createSquad = useSquadStore(state => state.createSquad);
  const navigate = ReactRouterDOM.useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !topic.trim()) return;
    console.log('Creating squad with name:', name, 'topic:', topic);
    setIsLoading(true);
    try {
      const newSquad = await createSquad(name, topic);
      console.log('Squad creation result:', newSquad);
      if(newSquad){
          onClose();
          setName('');
          setTopic('');
          navigate(`/squad/${newSquad.id}`);
      } else {
          console.error('Squad creation failed - no squad returned');
          alert("Failed to create squad. Please make sure you are logged in and try again.");
      }
    } catch (error) {
      console.error('Squad creation error:', error);
      alert("An error occurred while creating the squad. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-2xl w-full max-w-md"
            onClick={(e: MouseEvent) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-20" aria-label="Close">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-foreground mb-4">Create a New Study Squad</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="squad-name" className="block text-sm font-medium text-foreground mb-1">Squad Name</label>
                <div className="relative">
                   <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                   <input
                    id="squad-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Final Exam Grind"
                    className="w-full bg-input rounded-md pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
              </div>
               <div>
                <label htmlFor="squad-topic" className="block text-sm font-medium text-foreground mb-1">Topic</label>
                 <div className="relative">
                   <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                   <input
                    id="squad-topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Organic Chemistry"
                    className="w-full bg-input rounded-md pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                 </div>
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={!name.trim() || !topic.trim() || isLoading}>
                  {isLoading ? 'Creating Squad...' : 'Create and Join Squad'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default CreateSquadModal;