import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  variant?: 'default' | 'subtle' | 'strong';
}

export function GlassCard({ 
  children, 
  className, 
  hover = true, 
  glow = false, 
  variant = 'default' 
}: GlassCardProps) {
  const variants = {
    default: 'backdrop-blur-xl bg-white/70 border border-white/40 shadow-lg',
    subtle: 'backdrop-blur-md bg-white/50 border border-white/30 shadow-md',
    strong: 'backdrop-blur-2xl bg-white/80 border border-white/50 shadow-xl',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        variants[variant],
        hover && 'hover:bg-white/80 hover:border-white/60 hover:shadow-xl hover:scale-[1.02]',
        glow && 'shadow-purple-500/20',
        className
      )}
    >
      {children}
    </div>
  );
}
