import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import Card from './Card';
import Button from './Button';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
const AccountTab = () => {
    const { logoutUser } = useUserStore();
    const handleSignOut = async () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            const toastId = toast.loading('Signing out...');
            try {
          
                await logoutUser();
                toast.success('Signed out successfully!', { id: toastId });
                // NO LONGER NEEDED: The explicit navigation is removed.
                // navigate('/welcome', { replace: true });
            } catch (error) {
                console.error("Sign out failed:", error);
                toast.error('Sign out failed. Please try again.', { id: toastId });
            }
        }
    };
    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card title="Account Actions">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-muted/20 rounded-lg border border-border">
                    <div>
                        <h3 className="font-bold text-foreground">Sign Out</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            You will be returned to the landing page.
                        </p>
                    </div>
                    <Button 
                        variant="destructive" 
                        onClick={handleSignOut} 
                        className="mt-4 sm:mt-0"
                    >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
export default AccountTab;
