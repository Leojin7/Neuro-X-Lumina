import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import { Coins } from 'lucide-react';
const FocusCoinWallet: React.FC = () => {
    const focusCoins = useUserStore(state => state.focusCoins);
    return (
        <div className="bg-muted/40 border border-border rounded-full p-1.5 pr-4 flex items-center shadow-lg backdrop-blur-sm">
            <div className="bg-yellow-500/20 rounded-full p-2 mr-3">
                <Coins className="text-yellow-400" size={20} />
            </div>
            <div className="text-right">
                <span className="text-xl font-bold text-foreground">{focusCoins.toLocaleString()}</span>
                <p className="text-xs text-muted-foreground -mt-1">FocusCoins</p>
            </div>
        </div>
    );
}
export default FocusCoinWallet;