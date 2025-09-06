import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';

interface WorkflowNodeProps {
  type: 'action' | 'trigger' | 'condition' | 'delay';
  title: string;
  description?: string;
  icon: React.ElementType;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function WorkflowNode({ 
  type, 
  title, 
  description, 
  icon: Icon, 
  selected = false, 
  onClick, 
  className 
}: WorkflowNodeProps) {
  const typeColors = {
    action: 'from-blue-500 to-cyan-500',
    trigger: 'from-green-500 to-emerald-500',
    condition: 'from-yellow-500 to-orange-500',
    delay: 'from-purple-500 to-pink-500',
  };

  const typeBorders = {
    action: 'border-blue-200',
    trigger: 'border-green-200',
    condition: 'border-yellow-200',
    delay: 'border-purple-200',
  };

  return (
    <GlassCard 
      className={cn(
        'w-48 cursor-pointer transition-all duration-300 group',
        typeBorders[type],
        selected && 'ring-2 ring-offset-2 ring-blue-400 scale-105',
        className
      )}
      onClick={onClick}
      hover={true}
    >
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className={cn(
            'p-2 rounded-xl bg-gradient-to-br shadow-sm',
            `bg-gradient-to-br ${typeColors[type]}`
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            <span className="text-xs text-gray-500 capitalize">{type}</span>
          </div>
        </div>
        {description && (
          <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
        )}
      </div>
    </GlassCard>
  );
}
