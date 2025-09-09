import React, { useRef, useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Check, Loader2 } from 'lucide-react';
import type { FocusStory } from '../types';
import FocusStoryCard from './FocusStoryCard';
import Button from './Button';
import html2canvas from 'html2canvas';
interface ShareFocusStoryModalProps {
  story: FocusStory;
  onClose: () => void;
}
const ShareFocusStoryModal = ({ story, onClose }: ShareFocusStoryModalProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
        const canvas = await html2canvas(cardRef.current, {
            backgroundColor: null, // transparent background
            useCORS: true,
            scale: 2 // Higher resolution
        });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `lumina-focus-story-${story.id}.png`;
        link.click();
    } catch (error) {
        console.error("Failed to generate image:", error);
        alert("Sorry, there was an error creating your story image.");
    } finally {
        setIsDownloading(false);
    }
  };
  const handleShare = () => {
      const shareText = `I just completed a ${story.duration}-minute focus session on NeuroLearn and earned ${story.coinsEarned} FocusCoins! #NeuroLearn #Focus #Productivity`;
      if(navigator.share) {
          navigator.share({
              title: 'My NeuroLearn Focus Story',
              text: shareText,
              url: window.location.href,
          }).catch(err => console.log('Share failed:', err));
      } else {
          // Fallback for desktop: copy to clipboard
          navigator.clipboard.writeText(shareText);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  }
  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/50 backdrop-blur-md z-50 flex items-center justify-center"
        onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative bg-card/80 backdrop-blur-xl border border-border rounded-4xl p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6"
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-20" aria-label="Close">
            <X size={24} />
        </button>
        <FocusStoryCard story={story} cardRef={cardRef} />
        <div className="w-full md:w-64 text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground mb-2">Focus Complete!</h2>
            <p className="text-muted-foreground mb-6">Great work! Share your achievement with your friends.</p>
            <div className="space-y-3">
                <Button onClick={handleDownload} className="w-full" disabled={isDownloading}>
                   {isDownloading ? <Loader2 className="animate-spin mr-2" /> : <Download size={18} className="mr-2" />}
                    Download Story
                </Button>
                <Button onClick={handleShare} variant="outline" className="w-full">
                   {copied ? <Check size={18} className="text-green-500 mr-2" /> : <Share2 size={18} className="mr-2" />}
                    {copied ? 'Link Copied!' : 'Share'}
                </Button>
            </div>
            <p className="text-xs text-muted-foreground/50 mt-4">You can view your past stories on the dashboard.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
export default ShareFocusStoryModal;