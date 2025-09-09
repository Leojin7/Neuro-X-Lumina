
import React from 'react';
import { useThemeStore } from '../stores/useThemeStore';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useThemeStore();
    const options: { name: 'light' | 'dark' | 'system', icon: React.ReactNode }[] = [
        { name: 'light', icon: <Sun size={16} /> },
        { name: 'dark', icon: <Moon size={16} /> },
        { name: 'system', icon: <Monitor size={16} /> },
    ];
    return (
        <div className="bg-muted/50 p-1 rounded-xl border border-border flex items-center justify-center gap-1">
            {options.map(option => (
                <button
                    key={option.name}
                    onClick={() => setTheme(option.name)}
                    className="relative px-3 py-1.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Set theme to ${option.name}`}
                >
                    {theme === option.name && (
                        <motion.div
                            layoutId="theme-active-pill"
                            className="absolute inset-0 bg-background shadow-md rounded-lg"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        {option.icon}
                        <span className="capitalize hidden lg:inline">{option.name}</span>
                    </span>
                </button>
            ))}
        </div>
    );
};
export default ThemeToggle;
