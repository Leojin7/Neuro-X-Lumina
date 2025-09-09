import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import Card from './Card';
import Button from './Button';
import { CheckCircle, Star, Shield, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
const BillingTab = () => {
    const { subscriptionTier, upgradeSubscription, cancelSubscription } = useUserStore();
    const plans = [
        {
            name: 'Pro',
            price: '$9.99 / month',
            tier: 'pro' as const,
            icon: <Star className="h-7 w-7 text-primary" />,
            features: [
                'AI Tutor Access (Gemini)',
                'Daily Streak Tracking',
                'Basic Analytics',
                'Unlock All Premium Content'
            ]
        },
        {
            name: 'Elite',
            price: '$19.99 / month',
            tier: 'elite' as const,
            icon: <Shield className="h-7 w-7 text-blue-400" />,
            features: [
                'All Pro Features',
                'Early Access Modules',
                'Personalized AI Roadmap',
                'Priority Support'
            ]
        }
    ];
    const handleUpgrade = (tier: 'pro' | 'elite') => {
        if (window.confirm(`Are you sure you want to upgrade to the ${tier.toUpperCase()} plan?`)) {
            upgradeSubscription(tier);
            alert('Subscription upgraded successfully! (This is a simulation)');
        }
    };
    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel your subscription? You will be downgraded to the Free plan at the end of your billing cycle.')) {
            cancelSubscription();
            alert('Subscription canceled. (This is a simulation)');
        }
    };
    return (
        <div className="space-y-8 animate-fade-in-up">
            <Card title="Current Plan">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h3 className="text-3xl font-extrabold capitalize text-foreground flex items-center">
                            {subscriptionTier} Plan
                            {subscriptionTier !== 'free' && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="ml-3 text-sm font-medium px-3 py-1 rounded-full bg-success/10 text-success"
                                >
                                    Active
                                </motion.span>
                            )}
                        </h3>
                        {subscriptionTier !== 'free' ? (
                            <p className="text-muted-foreground mt-2">Enjoy all your premium features.</p>
                        ) : (
                            <p className="text-muted-foreground mt-2">Upgrade to unlock powerful features and elevate your learning.</p>
                        )}
                    </div>
                    {subscriptionTier !== 'free' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 sm:mt-0 text-left sm:text-right"
                        >
                            <p className="text-muted-foreground">Next payment: <span className="text-foreground font-semibold">{new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}</span></p>
                            <Button variant="ghost" size="sm" onClick={handleCancel} className="mt-3 text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200">
                                <XCircle size={18} />
                                Cancel Subscription
                            </Button>
                        </motion.div>
                    )}
                </div>
            </Card>
            <Card title="Upgrade Your Plan">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className={`p-8 rounded-2xl border-2 flex flex-col h-full
                            ${subscriptionTier === plan.tier
                                ? 'bg-primary/5 border-primary shadow-glow'
                                : 'bg-muted/20 border-border hover:border-primary/50 transition-colors duration-300'
                            }`}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                {plan.icon}
                                <h3 className="text-3xl font-bold text-foreground">{plan.name}</h3>
                            </div>
                            <p className="text-2xl font-extrabold my-4 text-primary">{plan.price}</p>
                            <ul className="space-y-3 text-muted-foreground mb-8 flex-grow">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto">
                                {subscriptionTier === plan.tier ? (
                                    <Button disabled className="w-full">Current Plan</Button>
                                ) : (
                                    <Button
                                        variant={plan.tier === 'elite' ? 'primary' : 'secondary'}
                                        onClick={() => handleUpgrade(plan.tier)}
                                        className="w-full text-lg py-3"
                                    >
                                        {subscriptionTier === 'free' ? 'Upgrade' : 'Switch'} to {plan.name}
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
export default BillingTab;