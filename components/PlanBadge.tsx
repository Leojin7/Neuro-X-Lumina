import React from 'react';
import type { SubscriptionTier } from '../types';
import { Star, Shield } from 'lucide-react';
interface PlanBadgeProps {
  tier: SubscriptionTier;
  className?: string;
}
const PlanBadge: React.FC<PlanBadgeProps> = ({ tier, className = '' }) => {
  if (tier === 'free') {
    return null;
  }
  const badgeConfig = {
    pro: {
      icon: <Star size={12} />,
      text: 'PRO',
      classes: 'bg-primary/20 text-primary',
    },
    elite: {
      icon: <Shield size={12} />,
      text: 'ELITE',
      classes: 'bg-blue-400/20 text-blue-300',
    },
  };
  const config = badgeConfig[tier];
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${config.classes} ${className}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};
export default PlanBadge;