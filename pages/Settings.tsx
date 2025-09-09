import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, CreditCard, Shield, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// You can create this as a shared component or define it here if only used once.
const ElegantShape = ({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
    animate={{ opacity: 1, y: 0, rotate }}
    transition={{
      duration: 2.4,
      delay,
      ease: [0.23, 0.86, 0.39, 0.96],
      opacity: { duration: 1.2 },
    }}
    className={`absolute ${className}`}
  >
    <motion.div
      animate={{ y: [0, 15, 0] }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ width, height }}
      className="relative"
    >
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]`}
      />
    </motion.div>
  </motion.div>
);
export const Settings: React.FC = () => {
  const tabs = [
    { to: "account", icon: <User size={16} />, label: "Account" },
    { to: "billing", icon: <CreditCard size={16} />, label: "Billing & Plan" },
    { to: "store", icon: <Store size={16} />, label: "Store" },
    { to: "transparency", icon: <Shield size={16} />, label: "Transparency & Ethics" },
  ];
  return (
    <div className="min-h-full bg-[#030303] relative overflow-hidden p-4 sm:p-6 lg:p-8">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape delay={0.3} width={450} height={110} rotate={10} gradient="from-blue-500/[0.12]" className="left-[-5%] top-[8%]" />
        <ElegantShape delay={0.5} width={350} height={90} rotate={-14} gradient="from-purple-500/[0.12]" className="right-[-3%] bottom-[10%]" />
      </div>
      <motion.div 
        className="relative z-10 space-y-8 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
          }
        }}
      >
        {}
        <motion.div variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-violet-200">
            Settings
          </h1>
          <p className="text-white/70 mt-2 text-lg">Manage your account, plan, and ethical AI preferences.</p>
        </motion.div>
        {}
        <motion.div 
          className="relative flex items-center gap-2 p-2 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 w-full lg:w-max"
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        >
          {tabs.map((tab) => (
            <ReactRouterDOM.NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 z-10
                ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-settings-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-lg"
                    />
                  )}
                  <span className="relative">{tab.icon}</span>
                  <span className="relative">{tab.label}</span>
                </>
              )}
            </ReactRouterDOM.NavLink>
          ))}
        </motion.div>
        {}
        <motion.div 
          className="mt-6"
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        >
          <AnimatePresence mode="wait">
            <ReactRouterDOM.Outlet />
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};
export default Settings;
