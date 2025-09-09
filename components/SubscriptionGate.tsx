import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import type { SubscriptionTier } from '../types';
interface SubscriptionGateProps {
  children: React.ReactNode;
  requiredTier: SubscriptionTier;
  fallback?: React.ReactNode;
}
const tierLevels: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  elite: 2,
};
const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children, requiredTier, fallback = null }) => {
  const userTier = useUserStore(state => state.subscriptionTier);
  const hasAccess = tierLevels[userTier] >= tierLevels[requiredTier];
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
export default SubscriptionGate;