import React from 'react';
import { motion } from 'framer-motion';
import { usePortfolioStore } from '../../stores/usePortfolioStore';
import type { CurrentUser } from '../../types';
import { Github, Linkedin, Twitter, Edit, RefreshCw, Loader2, Code } from 'lucide-react';
import Button from '../Button';
import PlanBadge from '../PlanBadge';
import { useUserStore } from '../../stores/useUserStore';
interface PortfolioHeaderProps {
    user: CurrentUser;
    onEdit: () => void;
    
    onSync: () => void;
    isSyncing: boolean;
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({ user, onEdit, onSync, isSyncing }) => {
    const { professionalTitle, bio, socialLinks, integrations } = usePortfolioStore();
    const { subscriptionTier } = useUserStore();
    const userAvatar = user.photoURL || `https://i.pravatar.cc/128?u=${user.uid}`;
    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 bg-card/80 p-6 rounded-3xl border border-border backdrop-blur-lg">
            <motion.div
                {...{
                    initial: { scale: 0.8, opacity: 0 },
                    animate: { scale: 1, opacity: 1 },
                    transition: { type: 'spring', stiffness: 200, damping: 20, delay: 0.1 },
                } as any}
                className="relative flex-shrink-0"
            >
                <img src={userAvatar} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg" />
            </motion.div>
            <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                             <h1 className="font-heading text-4xl font-bold text-foreground">{user.displayName}</h1>
                             <PlanBadge tier={subscriptionTier} />
                        </div>
                        <p className="text-primary font-semibold text-lg mt-1">{professionalTitle}</p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 sm:mt-0">
                        <Button onClick={onSync} variant="ghost" size="sm" disabled={isSyncing}>
                            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            Sync Stats
                        </Button>
                        <Button onClick={onEdit} variant="secondary" size="sm">
                            <Edit size={16} />
                            Edit Profile
                        </Button>
                    </div>
                </div>
                <p className="text-muted-foreground mt-4 max-w-2xl">{bio}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 text-muted-foreground">
                    <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Github /></a>
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Linkedin /></a>
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Twitter /></a>
                    {integrations.leetcode.visible && integrations.leetcode.username && (
                        <a href={`https://leetcode.com/${integrations.leetcode.username}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Code /></a>
                    )}
                </div>
            </div>
        </div>
    );
};
export default PortfolioHeader;
