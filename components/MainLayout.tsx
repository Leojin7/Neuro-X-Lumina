import React, { lazy, Suspense, memo, useMemo, useCallback } from 'react';
import { Outlet, useLocation, useNavigate, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2,
  BarChart2,
  LayoutGrid,
  Wand2,
  Code2,
  Users,
  List,
  Target,
  Smile,
  Brain,
  BookOpen,
  Settings as SettingsIcon
} from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import AIAssistantModal from './AIAssistantModal';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load pages
const Dashboard = lazy(() => import('../pages/Dashboard'));
const QuizzesList = lazy(() => import('../pages/QuizzesList'));
const QuizView = lazy(() => import('../pages/QuizView'));
const SquadsList = lazy(() => import('../pages/SquadsList'));
const SquadView = lazy(() => import('../pages/SquadView'));
const Portfolio = lazy(() => import('../pages/Portfolio'));
const Focus = lazy(() => import('../pages/Focus'));
const Wellness = lazy(() => import('../pages/Wellness'));
const Agents = lazy(() => import('../pages/Agents'));
const CodingArena = lazy(() => import('../pages/CodingArena'));
const NotebookLM = lazy(() => import('../pages/NotebookLM'));
const Leaderboard = lazy(() => import('../pages/Leaderboard'));
const Transparency = lazy(() => import('../pages/Transparency'));
const Settings = lazy(() => import('../pages/Settings'));
const AccountTab = lazy(() => import('./AccountTab'));
const BillingTab = lazy(() => import('./BillingTab'));
const StoreTab = lazy(() => import('./StoreTab'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Error boundary fallback
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div role="alert" className="p-4 bg-red-100 text-red-700 rounded">
    <p>Something went wrong:</p>
    <pre className="whitespace-pre-wrap">{error.message}</pre>
    <button onClick={resetErrorBoundary} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
      Try again
    </button>
  </div>
);

interface RouteItem {
  path: string;
  name: string;
  icon: string;
  component: React.ComponentType;
}

const useRoutes = (): RouteItem[] => {
  return useMemo(() => [
    { path: '/dashboard', name: 'Dashboard', icon: 'LayoutGrid', component: Dashboard },
    { path: '/quizzes', name: 'AI Quizzes', icon: 'Wand2', component: QuizzesList },
    { path: '/coding-arena', name: 'Coding Arena', icon: 'Code2', component: CodingArena },
    { path: '/squad', name: 'Squad', icon: 'Users', component: SquadsList },
    { path: '/portfolio', name: 'Portfolio', icon: 'List', component: Portfolio },
    { path: '/focus', name: 'Focus', icon: 'Target', component: Focus },
    { path: '/wellness', name: 'Wellness', icon: 'Smile', component: Wellness },
    { path: '/agents', name: 'Agents', icon: 'Brain', component: Agents },
    { path: '/transparency', name: 'Transparency', icon: 'BarChart2', component: Transparency },
    { path: '/notebook', name: 'NotebookLM', icon: 'BookOpen', component: NotebookLM },
    { path: '/settings', name: 'Settings', icon: 'Settings', component: Settings }
  ], []);
};

const Logo = memo(() => {
  const newLogoSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:hsl(213, 90%25, 55%25);' /%3E%3Cstop offset='100%25' style='stop-color:hsl(213, 90%25, 65%25);' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M50,5 A45,45 0 1 1 49.9,5 Z' stroke='url(%23g)' stroke-width='8'/%3E%3Cpath d='M35,40 L65,40 M35,60 L65,60 M50,30 V70' stroke='white' stroke-width='7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E`;

  return (
    <NavLink to="/dashboard" className="flex items-center justify-center lg:justify-start mb-10 flex-shrink-0">
      <img
        src={newLogoSvg}
        alt="NeuroLearn Logo"
        className="h-10 w-10"
        width={40}
        height={40}
        loading="eager"
      />
      <h1 className="font-bold text-2xl ml-3 hidden lg:block text-foreground">NeuroLearn</h1>
    </NavLink>
  );
});

const UserProfile = memo(() => {
  const { currentUser, subscriptionTier } = useUserStore();
  const userName = currentUser?.displayName || 'User';
  const userAvatar = currentUser?.photoURL || `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${currentUser?.uid || 'default'}`;

  return (
    <NavItem to="/portfolio" className="!p-2 mt-2">
      <div className="flex items-center w-full">
        <img
          src={userAvatar}
          className="w-9 h-9 rounded-full border-2 border-primary"
          alt="User avatar"
          width={36}
          height={36}
          loading="lazy"
        />
        <div className="ml-3 hidden lg:block overflow-hidden flex-1">
          <p className="font-semibold text-sm text-foreground truncate">{userName}</p>
          <div className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
            {subscriptionTier || 'Free'}
          </div>
        </div>
      </div>
    </NavItem>
  );
});

interface NavItemProps {
  to: string;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

const NavItem = memo(({ to, icon, label, className = '', children }: NavItemProps) => {
  const location = useLocation();
  const isActive = useMemo(() =>
    location.pathname === to || location.pathname.startsWith(`${to}/`),
    [location.pathname, to]
  );

  return (
    <NavLink
      to={to}
      className={({ isActive: isNavActive }) =>
        `relative flex items-center p-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200 group ${className} ${isNavActive ? 'text-primary-foreground' : ''
        }`
      }
    >
      {({ isActive: isNavActive }) => (
        <>
          {isNavActive && (
            <motion.div
              layoutId="active-nav-pill"
              initial={false}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute inset-0 bg-primary rounded-lg"
            />
          )}
          <div className="relative z-10 flex items-center justify-center lg:justify-start w-full">
            {children || (
              <>
                {icon}
                {label && <span className="ml-4 hidden lg:block font-semibold text-sm">{label}</span>}
              </>
            )}
          </div>
        </>
      )}
    </NavLink>
  );
});

const MainLayout: React.FC = () => {
  const routes = useRoutes();

  const navItems = useMemo(() => {
    const iconMap: Record<string, React.ReactNode> = {
      'LayoutGrid': <LayoutGrid size={20} />,
      'Wand2': <Wand2 size={20} />,
      'Code2': <Code2 size={20} />,
      'Users': <Users size={20} />,
      'List': <List size={20} />,
      'Target': <Target size={20} />,
      'Smile': <Smile size={20} />,
      'Brain': <Brain size={20} />,
      'BarChart2': <BarChart2 size={20} />,
      'BookOpen': <BookOpen size={20} />,
      'Settings': <SettingsIcon size={20} />
    };

    return routes.map((route) => (
      <NavItem
        key={route.path}
        to={route.path}
        icon={iconMap[route.icon]}
        label={route.name}
      />
    ));
  }, [routes]);

  const appRoutes = useMemo(
    () => (
      <Routes>
        <Route path="/" element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
        <Route path="/dashboard" element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
        <Route path="/quizzes" element={<Suspense fallback={<LoadingSpinner />}><QuizzesList /></Suspense>} />
        <Route path="/quiz/:quizId" element={<Suspense fallback={<LoadingSpinner />}><QuizView /></Suspense>} />
        <Route path="/squad" element={<Suspense fallback={<LoadingSpinner />}><SquadsList /></Suspense>} />
        <Route path="/squad/:squadId" element={<Suspense fallback={<LoadingSpinner />}><SquadView /></Suspense>} />
        <Route path="/portfolio" element={<Suspense fallback={<LoadingSpinner />}><Portfolio /></Suspense>} />
        <Route path="/focus" element={<Suspense fallback={<LoadingSpinner />}><Focus /></Suspense>} />
        <Route path="/wellness" element={<Suspense fallback={<LoadingSpinner />}><Wellness /></Suspense>} />
        <Route path="/agents" element={<Suspense fallback={<LoadingSpinner />}><Agents /></Suspense>} />
        <Route path="/coding-arena" element={<Suspense fallback={<LoadingSpinner />}><CodingArena /></Suspense>} />
        <Route path="/notebook" element={<Suspense fallback={<LoadingSpinner />}><NotebookLM /></Suspense>} />
        <Route path="/leaderboard" element={<Suspense fallback={<LoadingSpinner />}><Leaderboard /></Suspense>} />
        <Route path="/transparency" element={<Suspense fallback={<LoadingSpinner />}><Transparency /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<LoadingSpinner />}><Settings /></Suspense>} />
        <Route path="/settings/account" element={<Suspense fallback={<LoadingSpinner />}><AccountTab /></Suspense>} />
        <Route path="/settings/billing" element={<Suspense fallback={<LoadingSpinner />}><BillingTab /></Suspense>} />
        <Route path="/settings/store" element={<Suspense fallback={<LoadingSpinner />}><StoreTab /></Suspense>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    ),
    []
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex h-screen bg-background font-sans">
        <aside className="w-[72px] lg:w-64 bg-background border-r border-border p-4 flex flex-col transition-all duration-300">
          <Logo />
          <nav className="flex flex-col space-y-2 flex-grow">
            {navItems}
          </nav>
          <div className="flex-shrink-0">
            <NavItem to="/settings" icon={<SettingsIcon size={20} />} label="Settings" />
            <UserProfile />
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <Suspense fallback={<LoadingSpinner />}>
            {appRoutes}
          </Suspense>
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
    </ErrorBoundary>
  );
};

export default MainLayout;