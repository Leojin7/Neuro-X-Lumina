import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Brain, Target, Users, Zap, Shield, Circle, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import { signUpWithEmail, signInWithEmail } from '../firebaseAuth';
import { useUserStore } from '../stores/useUserStore';
import * as ReactRouterDOM from 'react-router-dom';
// Google Icon Component
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);
// Glass Input Wrapper Component
const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-primary/70 focus-within:bg-primary/10">
    {children}
  </div>
);
// Testimonial Component
const TestimonialCard = ({ 
  testimonial, 
  delay 
}: { 
  testimonial: { avatarSrc: string; name: string; handle: string; text: string }, 
  delay: string 
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.7, delay: parseFloat(delay.replace('animate-delay-', '')) / 1000 }}
    className="flex items-start gap-3 rounded-3xl bg-card/40 backdrop-blur-xl border border-border p-5 w-64"
  >
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="font-medium text-foreground">{testimonial.name}</p>
      <p className="text-muted-foreground">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/80">{testimonial.text}</p>
    </div>
  </motion.div>
);
// Elegant Shape Component
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
        className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-white/10 shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]`}
        style={{
          background: `linear-gradient(to right, ${gradient.replace('from-', '').replace('/[', '').replace(']', '')}, transparent)`,
        }}
      />
    </motion.div>
  </motion.div>
);
const Login = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);
  // NeuroLearn testimonials
  const neurolearnTestimonials = [
    {
      avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
      name: "Dr. Sarah Chen",
      handle: "@sarahlearns",
      text: "NeuroLearn transformed my learning experience. The cognitive tracking helps me understand my mind better."
    },
    {
      avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
      name: "Marcus Johnson",
      handle: "@marcustech",
      text: "The adaptive learning system is incredible. It knows exactly when I need a break or when to challenge me more."
    },
    {
      avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
      name: "David Martinez",
      handle: "@davidstudies",
      text: "Focus sessions with emotional feedback changed how I approach learning. Highly recommended!"
    },
  ];
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;
    try {
      if (isSignUpMode) {
        const user = await signUpWithEmail(email, password, displayName);
      } else {
        const user = await signInWithEmail(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      let friendlyMessage = "An unexpected error occurred.";
      switch(err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          friendlyMessage = "Invalid email or password. Please try again.";
          break;
        case 'auth/email-already-in-use':
          friendlyMessage = "An account with this email already exists. Please sign in.";
          break;
        case 'auth/weak-password':
          friendlyMessage = "Password is too weak. It should be at least 6 characters.";
          break;
        case 'auth/invalid-email':
          friendlyMessage = "Please enter a valid email address.";
          break;
        default:
          console.error("Auth error:", err);
          friendlyMessage = err.message;
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = () => {
    console.log("Google sign-in clicked");
    setError("Google sign-in coming soon!");
  };
  const handleResetPassword = () => {
    console.log("Reset password clicked");
    setError("Password reset coming soon!");
  };
  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw] bg-background text-foreground overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 overflow-hidden dark">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[18%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[72%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[6%] md:left-[10%] bottom-[6%] md:bottom-[10%]"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[12%] md:top-[15%]"
        />
      </div>
      {}
      <section className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/80 border border-border mb-4"
            >
              <Circle className="h-2 w-2 fill-rose-500/80" />
              <span className="text-sm text-muted-foreground tracking-wide">
                Adaptive Learning OS
              </span>
            </motion.div>
            {}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="flex items-center justify-center mb-8"
            >
              <div className="relative">
                <Circle className="w-16 h-16 text-primary animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
            </motion.div>
            {}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-4xl md:text-5xl font-semibold leading-tight"
            >
              {isSignUpMode ? (
                <span className="font-light text-foreground tracking-tighter">
                  Join <span className="text-primary">NeuroLearn</span>
                </span>
              ) : (
                <span className="font-light text-foreground tracking-tighter">
                  Welcome to <span className="text-primary">NeuroLearn</span>
                </span>
              )}
            </motion.h1>
            {}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="text-muted-foreground"
            >
              {isSignUpMode 
                ? "Start your journey with adaptive learning and enhanced mental wellness"
                : "Continue your journey of adaptive learning and enhanced mental wellness"
              }
            </motion.p>
            {}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="space-y-5"
              onSubmit={handleSubmit}
            >
              {isSignUpMode && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Display Name</label>
                  <GlassInputWrapper>
                    <input 
                      name="displayName" 
                      type="text" 
                      placeholder="Enter your display name" 
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-foreground placeholder-muted-foreground" 
                      required 
                    />
                  </GlassInputWrapper>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email Address</label>
                <GlassInputWrapper>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-foreground placeholder-muted-foreground" 
                    required 
                  />
                </GlassInputWrapper>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Enter your password" 
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-foreground placeholder-muted-foreground" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sm text-red-400 text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                >
                  {error}
                </motion.div>
              )}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="rememberMe" 
                    className="w-4 h-4 rounded border-2 border-border bg-transparent text-primary focus:ring-primary"
                  />
                  <span className="text-muted-foreground">Keep me signed in</span>
                </label>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleResetPassword(); }} 
                  className="hover:underline text-primary transition-colors"
                >
                  Reset password
                </a>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  isSignUpMode ? 'Create Account' : 'Sign In'
                )}
              </button>
            </motion.form>
            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              className="relative flex items-center justify-center"
            >
              <span className="w-full border-t border-border"></span>
              <span className="px-4 text-sm text-muted-foreground bg-background absolute">Or continue with</span>
            </motion.div>
            {}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.8 }}
              onClick={handleGoogleSignIn} 
              className="w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-muted/50 transition-colors text-foreground"
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>
            {}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.9 }}
              className="text-center text-sm text-muted-foreground"
            >
              {isSignUpMode ? "Already have an account?" : "New to our platform?"}{' '}
              <button 
                onClick={() => { setIsSignUpMode(!isSignUpMode); setError(null); }} 
                className="text-primary hover:underline transition-colors font-medium"
              >
                {isSignUpMode ? "Sign In" : "Create Account"}
              </button>
            </motion.p>
          </div>
        </div>
      </section>
      {}
      <section className="hidden md:block flex-1 relative p-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute inset-4 rounded-3xl bg-cover bg-center"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80)` }}
        />
        {}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
          <TestimonialCard testimonial={neurolearnTestimonials[0]} delay="animate-delay-1000" />
          <div className="hidden xl:flex">
            <TestimonialCard testimonial={neurolearnTestimonials[1]} delay="animate-delay-1200" />
          </div>
          <div className="hidden 2xl:flex">
            <TestimonialCard testimonial={neurolearnTestimonials[2]} delay="animate-delay-1400" />
          </div>
        </div>
      </section>
      {}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
    </div>
  );
};
export default Login;