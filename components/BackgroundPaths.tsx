
import React from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import { ArrowRight, Circle } from "lucide-react";
function cn(...cls: (string | undefined | null | false)[]) {
  return cls.filter(Boolean).join(" ");
}
function ElegantShape({
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
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
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
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.18),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}
interface Props {
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick: () => void;
}
export function BackgroundPaths({
  title,
  subtitle,
  buttonText,
  onButtonClick,
}: Props) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303] p-4">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      {}
      <div className="absolute inset-0 overflow-hidden">
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
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.15]"
          className="left-[22%] md:left-[26%] top-[6%] md:top-[9%]"
        />
      </div>
      {}
      <main className="relative z-10 container mx-auto px-4 md:px-6 text-center flex flex-col items-center">
        {}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12"
        >
          <Circle className="h-2 w-2 fill-rose-500/80" />
          <span className="text-sm text-white/60 tracking-wide">
            Adaptive Learning OS
          </span>
        </motion.div>
        {}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.7 }}
          className="text-4xl sm:text-6xl md:text-8xl font-extrabold mb-6 md:mb-8 tracking-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
            {title}
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
            {subtitle}
          </span>
        </motion.h1>
        {}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1 }}
          className="relative"
        >
          {}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-fuchsia-600 to-blue-400 blur-lg opacity-40" />
          <Button
            onClick={onButtonClick}
            size="lg"
            className="relative px-10 py-4 text-lg font-bold bg-gradient-to-r from-blue-600 via-fuchsia-600 to-blue-400 hover:scale-105 transition"
          >
            {buttonText}
            <ArrowRight className="ml-2 -mr-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </main>
      {}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  );
}
export default BackgroundPaths;
