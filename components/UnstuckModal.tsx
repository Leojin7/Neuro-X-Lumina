import React, { MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, BrainCircuit, Sun, Flower2 } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
interface UnstuckModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const UnstuckModal = ({ isOpen, onClose }: UnstuckModalProps) => {
  const navigate = ReactRouterDOM.useNavigate();
  const handleAction = (path: string, state?: any) => {
    navigate(path, { state });
    onClose();
  };
  const actions = [
    {
      icon: <Wind className="text-blue-400" size={28} />,
      title: 'Breathe',
      description: 'A 1-minute guided breathing exercise.',
      action: () => handleAction('/focus'),
    },
    {
      icon: <BrainCircuit className="text-purple-400" size={28} />,
      title: 'Reframe a Thought',
      description: 'Challenge a negative thought pattern.',
      action: () => handleAction('/wellness', { initialTab: 'mindshift' }),
    },
    {
      icon: <Flower2 className="text-pink-400" size={28} />,
      title: 'Note Gratitude',
      description: 'Jot down something you\'re grateful for.',
       action: () => handleAction('/wellness', { initialTab: 'gratitude' }),
    },
    {
      icon: <Sun className="text-yellow-400" size={28} />,
      title: 'Start Focus',
      description: 'Begin a 25-minute focus session.',
      action: () => handleAction('/focus'),
    }
  ];
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
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl w-full max-w-lg text-center"
            onClick={(e: MouseEvent) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-20" aria-label="Close">
              <X size={24} />
            </button>
            <h2 className="text-3xl font-bold text-foreground mb-2">Feeling Stuck?</h2>
            <p className="text-muted-foreground mb-8">Take a small step forward. Choose an action below.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {actions.map((item, index) => (
                <motion.button
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className="p-4 bg-muted/40 rounded-2xl border border-border text-left flex flex-col items-start h-full hover:border-primary/50 transition-colors"
                >
                  <div className="mb-3">{item.icon}</div>
                  <h3 className="font-bold text-foreground text-lg flex-grow">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default UnstuckModal;