import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
  as?: React.ElementType;
}
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', title, titleClassName = '', as: Component = motion.div }, ref) => {
    return (
      <Component
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn(
          'relative bg-card/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/10',
          className
        )}
      >
        {title && (
          <h3 className={cn('font-bold text-xl text-foreground mb-4 border-b border-white/10 pb-3', titleClassName)}>
            {title}
          </h3>
        )}
        <div className="relative z-10">{children}</div>
      </Component>
    );
  }
);
export default Card;