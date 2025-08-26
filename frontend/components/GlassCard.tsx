import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({ children, className, hover = true, glow = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl',
        hover && 'transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-3xl hover:scale-[1.02]',
        glow && 'shadow-purple-500/20',
        className
      )}
    >
      {children}
    </div>
  );
}
