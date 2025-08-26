import React from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'purple' | 'blue' | 'pink' | 'rainbow';
}

export function GradientText({ children, className, gradient = 'purple' }: GradientTextProps) {
  const gradients = {
    purple: 'bg-gradient-to-r from-purple-400 to-pink-400',
    blue: 'bg-gradient-to-r from-blue-400 to-cyan-400',
    pink: 'bg-gradient-to-r from-pink-400 to-rose-400',
    rainbow: 'bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400',
  };

  return (
    <span
      className={cn(
        'bg-clip-text text-transparent',
        gradients[gradient],
        className
      )}
    >
      {children}
    </span>
  );
}
