import React from 'react';
import { BrainCircuit, Zap, Target } from 'lucide-react';
import type { Badge } from '../types';
const iconMap = {
  Zap,
  BrainCircuit,
  Target,
};
interface BadgeIconProps {
  name: Badge['icon'];
  size?: number;
  className?: string;
}
const BadgeIcon: React.FC<BadgeIconProps> = ({ name, size, className }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    return null;
  }
  return <IconComponent size={size} className={className} />;
};
export default BadgeIcon;
