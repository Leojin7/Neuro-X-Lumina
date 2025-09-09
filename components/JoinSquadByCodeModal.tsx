
import React, { useState, MouseEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Loader2, AlertCircle } from 'lucide-react';
import Button from './Button';
import { useSquadStore } from '../stores/useSquadStore';
import * as ReactRouterDOM from 'react-router-dom';
interface JoinSquadByCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const JoinSquadByCodeModal = ({ isOpen, onClose }: JoinSquadByCodeModalProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const joinSquadByCode = useSquadStore(state => state.joinSquadByCode);
  const navigate = ReactRouterDOM.useNavigate();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const squad = await joinSquadByCode(code);
      if (squad) {
        onClose();
        navigate(`/squad/${squad.id}`);
      } else {
        setError('Invalid code. No squad found with that code.');
      }
    } catch (error) {
      setError('Failed to join squad. Please try again.');
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
            <h2 className="text-2xl font-bold text-foreground mb-4">Join Squad with Code</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="squad-code" className="block text-sm font-medium text-foreground mb-1">Enter Join Code</label>
                <div className="relative">
                   <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                   <input
                    id="squad-code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g., REACTUX"
                    className="w-full bg-input rounded-md pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring uppercase tracking-widest font-mono"
                    required
                    autoFocus
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    <AlertCircle size={16} />
                    <p>{error}</p>
                </div>
              )}
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isLoading || !code.trim()}>
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Join Squad'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default JoinSquadByCodeModal;