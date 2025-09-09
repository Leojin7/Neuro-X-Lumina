import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Brain,
  Users,
  Trophy,
  Target,
  Heart,
  Settings as SettingsIcon,
  MessageSquare,
  Sparkles,
  Menu,
  X,
  Bell,
  Search,
  User,
  LogOut,
  Crown,
  Zap,
  BookOpen,
  Code,
  Calendar,
  BarChart3,
  Shield,
  Palette,
  Moon,
  Sun,
  LayoutGrid,
  Wand2,
  Code2,
  List,
  Smile,
  BarChart2
} from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import AIAssistantModal from './AIAssistantModal';
import { Toaster } from 'react-hot-toast';
// Import Pages
import Dashboard from '../pages/Dashboard';
import QuizzesList from '../pages/QuizzesList';
import QuizView from '../pages/QuizView';
import SquadsList from '../pages/SquadsList';
import SquadView from '../pages/SquadView';
import Portfolio from '../pages/Portfolio';
import Focus from '../pages/Focus';
import Wellness from '../pages/Wellness';
import Settings from '../pages/Settings';
import Agents from '../pages/Agents';
import CodingArena from '../pages/CodingArena';
import NotebookLM from '../pages/NotebookLM';
import Leaderboard from '../pages/Leaderboard';
import Transparency from '../pages/Transparency';
// Import Components
import toast from 'react-hot-toast';
import AccountTab from './AccountTab';
import BillingTab from './BillingTab';
import StoreTab from './StoreTab';
const routes = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutGrid, component: Dashboard },
  { path: '/quizzes', name: 'AI Quizzes', icon: Wand2, component: QuizzesList },
  { path: '/coding-arena', name: 'Coding Arena', icon: Code2, component: CodingArena },
  { path: '/squad', name: 'Squad', icon: Users, component: SquadsList },
  { path: '/portfolio', name: 'Portfolio', icon: List, component: Portfolio },
  { path: '/focus', name: 'Focus', icon: Target, component: Focus },
  { path: '/wellness', name: 'Wellness', icon: Smile, component: Wellness },
  { path: '/agents', name: 'Agents', icon: Brain, component: Agents },
  { path: '/transparency', name: 'Transparency', icon: BarChart2, component: Transparency },
  { path: '/notebook', name: 'NotebookLM', icon: BookOpen, component: NotebookLM },
  { path: '/settings', name: 'Settings', icon: SettingsIcon, component: Settings }
];
const MainLayout: React.FC = () => {
  const { currentUser, subscriptionTier } = useUserStore();
  const userName = currentUser?.displayName || 'User';
  const userAvatar = currentUser?.photoURL || `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${currentUser?.uid}`;
  const newLogoSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:hsl(213, 90%25, 55%25);' /%3E%3Cstop offset='100%25' style='stop-color:hsl(213, 90%25, 65%25);' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M50,5 A45,45 0 1 1 49.9,5 Z' stroke='url(%23g)' stroke-width='8'/%3E%3Cpath d='M35,40 L65,40 M35,60 L65,60 M50,30 V70' stroke='white' stroke-width='7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E`;
  return (
    <>
      <div className="flex h-screen bg-background font-sans">
        <aside className="w-[72px] lg:w-64 bg-background border-r border-border p-4 flex flex-col transition-all duration-300">
          <NavLink to="/dashboard" className="flex items-center justify-center lg:justify-start mb-10 flex-shrink-0">
            <img src={newLogoSvg} alt="NeuroLearn Logo" className="h-10 w-10" />
            <h1 className="font-bold text-2xl ml-3 hidden lg:block text-foreground">NeuroLearn</h1>
          </NavLink>
          <nav className="flex flex-col space-y-2 flex-grow">
            {routes.map(route => (
              <NavItem key={route.path} to={route.path} icon={<route.icon size={20} />} label={route.name} />
            ))}
          </nav>
          <div className="flex-shrink-0">
            <NavItem to="/settings" icon={<SettingsIcon size={20} />} label="Settings" />
            <NavItem to="/portfolio" className="!p-2 mt-2">
              <div className="flex items-center w-full">
                <img src={userAvatar} className="w-9 h-9 rounded-full border-2 border-primary" alt="User avatar" />
                <div className="ml-3 hidden lg:block overflow-hidden flex-1">
                  <p className="font-semibold text-sm text-foreground truncate">{userName}</p>
                  <div className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                    {subscriptionTier || 'Free'}
                  </div>
                </div>
              </div>
            </NavItem>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quizzes" element={<QuizzesList />} />
            <Route path="/quiz/:quizId" element={<QuizView />} />
            <Route path="/squad" element={<SquadsList />} />
            <Route path="/squad/:squadId" element={<SquadView />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/wellness" element={<Wellness />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/coding-arena" element={<CodingArena />} />
            <Route path="/notebook" element={<NotebookLM />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/account" element={<AccountTab />} />
            <Route path="/settings/billing" element={<BillingTab />} />
            <Route path="/settings/store" element={<StoreTab />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '',
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
      <AIAssistantModal />
    </>
  );
};
interface NavItemProps {
  to: string;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}
const NavItem: React.FC<NavItemProps> = ({ to, icon, label, className, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <NavLink
      to={to}
      className={({ isActive: navIsActive }) =>
        `relative flex items-center p-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200 group ${className} ${navIsActive ? 'text-primary-foreground' : ''}`
      }
    >
      {({ isActive: navIsActive }) => (
        <>
          {navIsActive && (
            <motion.div
              layoutId="active-nav-pill"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute inset-0 bg-primary rounded-lg"
            />
          )}
          <div className={`relative z-10 flex items-center justify-center lg:justify-start w-full ${navIsActive ? 'text-primary-foreground' : ''}`}>
            {children || (
              <>
                {icon}
                <span className="ml-4 hidden lg:block font-semibold text-sm">{label}</span>
              </>
            )}
          </div>
        </>
      )}
    </NavLink>
  );
};
export default MainLayout;