import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import Card from './Card';
import Button from './Button';
import { Coins, Ticket, Gem, Package, Shield, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from './lib/utils';
const TICKET_COST = 100;
const StoreTab = () => {
    const { focusCoins, timeTravelTickets, buyFocusCoins, buyTimeTravelTicket } = useUserStore();
    const coinPackages = [
        { amount: 100, icon: <Package size={40} />, price: 'Simulated', tag: null },
        { amount: 500, icon: <Coins size={48} />, price: '₹199.00', tag: 'Best Value' },
        { amount: 1000, icon: <Gem size={40} />, price: 'Simulated', tag: null },
    ];
    const redeemableItems = [
        {
            id: 'time-travel-ticket',
            name: 'Time Travel Ticket',
            description: 'Mend a broken coding streak and keep your momentum.',
            icon: <Ticket size={32} />,
            cost: TICKET_COST,
            action: () => handleBuyItem(() => buyTimeTravelTicket(), TICKET_COST, 'Time Travel Ticket'),
            owned: timeTravelTickets,
        },
        {
            id: 'streak-shield',
            name: 'Streak Shield',
            description: 'Protects your focus streak for one missed day.',
            icon: <Shield size={32} />,
            cost: 250,
            action: () => toast.error("Feature coming soon!"), // Placeholder action
            owned: 0, // Placeholder
        },
        {
            id: 'aurora-theme',
            name: 'Aurora Theme Pack',
            description: 'Unlock an exclusive, dynamic dashboard theme.',
            icon: <Palette size={32} />,
            cost: 500,
            action: () => toast.error("Feature coming soon!"), // Placeholder action
            owned: 0, // Placeholder
        },
    ];
    const handleBuyCoins = (amount: number) => {
        buyFocusCoins(amount);
        toast.success(`Added ${amount.toLocaleString()} FocusCoins to your wallet!`);
    };
    const handleBuyItem = (purchaseFunction: () => boolean, cost: number, itemName: string) => {
        if (window.confirm(`Are you sure you want to buy 1 ${itemName} for ${cost} FocusCoins?`)) {
            const success = purchaseFunction();
            if (success) {
                toast.success(`Successfully purchased 1 ${itemName}!`);
            } else {
                toast.error('Not enough FocusCoins!');
            }
        }
    };
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
        }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };
    return (
        <motion.div 
            className="space-y-12"
            key="store-tab"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {}
            <motion.div variants={itemVariants}>
                <Card>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                            <Coins className="text-yellow-400" />
                            FocusCoin Store
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Need a boost? Acquire FocusCoins to redeem for powerful items and custom themes.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {coinPackages.map((pkg, i) => (
                            <motion.div
                                key={pkg.amount}
                                className={cn(
                                    "relative group overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center",
                                    pkg.tag ? "border-primary/80 bg-primary/10 hover:border-primary" : "border-border bg-muted/20 hover:border-muted-foreground/50"
                                )}
                                whileHover={{ y: -5, scale: 1.03 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                            >
                                {pkg.tag && (
                                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                                        {pkg.tag}
                                    </div>
                                )}
                                <div className={cn("mb-4 text-primary", pkg.tag ? "text-primary" : "text-primary/70")}>{pkg.icon}</div>
                                <p className="text-4xl font-bold text-foreground flex items-center gap-2">
                                    {pkg.amount.toLocaleString()} <Coins size={28} className="text-yellow-400" />
                                </p>
                                <p className="text-sm text-muted-foreground mt-1 mb-6">{pkg.price}</p>
                                <Button 
                                    onClick={() => handleBuyCoins(pkg.amount)} 
                                    variant={pkg.tag ? 'primary' : 'secondary'} 
                                    className="w-full mt-auto"
                                >
                                    Acquire
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-8 p-4 bg-muted/30 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Secure simulated payments by</p>
                        <div className="flex justify-center items-center gap-6 mt-2 filter grayscale brightness-200 contrast-125 opacity-60">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-6"/>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/GPay_logo.svg/1280px-GPay_logo.svg.png" alt="GPay" className="h-5"/>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Paytm_Logo.svg/2560px-Paytm_Logo.svg.png" alt="Paytm" className="h-4"/>
                        </div>
                    </div>
                </Card>
            </motion.div>
            {}
            <motion.div variants={itemVariants}>
                <Card>
                     <div className="mb-6">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                            <Ticket className="text-primary" />
                            Redeem Items
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Use your hard-earned FocusCoins to purchase powerful items and boosts for your learning journey.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {redeemableItems.map(item => (
                             <motion.div
                                key={item.id}
                                className="bg-muted/20 p-6 rounded-2xl border border-border group flex flex-col sm:flex-row items-center justify-between gap-6"
                                whileHover={{ borderColor: 'hsl(var(--primary))' }}
                             >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 flex items-center justify-center bg-primary/20 rounded-lg text-primary flex-shrink-0 transition-colors duration-300 group-hover:bg-primary/30">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground">{item.name}</h4>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                        <p className="text-sm text-foreground mt-2">You own: <span className="font-bold">{item.owned}</span></p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 w-full sm:w-auto">
                                    <Button onClick={item.action} disabled={focusCoins < item.cost} className="w-full">
                                        Buy for {item.cost} <Coins size={16} className="ml-2 text-yellow-300" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
}
export default StoreTab;
