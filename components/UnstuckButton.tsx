
import React, { useState } from 'react';
import Button from './Button';
import { Sparkles } from 'lucide-react';
import UnstuckModal from './UnstuckModal';
const UnstuckButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-14 w-14 rounded-full bg-muted/40 border border-border text-primary hover:text-primary hover:bg-muted/80 hover:shadow-glow"
        onClick={() => setIsModalOpen(true)}
        aria-label="Unstuck Button"
      >
        <Sparkles size={24} className="animate-pulse" />
      </Button>
      <UnstuckModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
export default UnstuckButton;