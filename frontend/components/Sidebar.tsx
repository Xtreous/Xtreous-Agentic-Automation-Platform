import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Bot, 
  Workflow, 
  Users, 
  BookOpen, 
  Zap, 
  Settings,
  LayoutTemplate,
  ChevronDown,
  ChevronRight,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { GlassCard } from './GlassCard';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'AI Agents', href: '/agents', icon: Bot },
    { name: 'Workflows', href: '/workflows', icon: Workflow },
    { name: 'Templates', href: '/templates', icon: LayoutTemplate },
    { name: 'Tasks', href: '/tasks', icon: BarChart3 },
  ];

  const collaborationItems = [
    { name: 'Collaborations', href: '/collaborations', icon: Users },
    { name: 'Training', href: '/training', icon: BookOpen },
  ];

  const integrationItems = [
    { name: 'Integrations', href: '/integrations', icon: Zap },
    { name: 'Deployments', href: '/deployments', icon: Settings },
  ];

  const NavItem = ({ item, level = 0 }: { item: any; level?: number }) => (
    <Link
      to={item.href}
      className={cn(
        'flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group',
        level > 0 && 'ml-4',
        isActive(item.href)
          ? 'bg-white/60 text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
      )}
    >
      <item.icon className={cn(
        'h-4 w-4 transition-colors',
        isActive(item.href) ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'
      )} />
      <span>{item.name}</span>
    </Link>
  );

  const SectionHeader = ({ title, isExpanded, onToggle }: { 
    title: string; 
    isExpanded: boolean; 
    onToggle: () => void; 
  }) => (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
    >
      <span>{title}</span>
      {isExpanded ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronRight className="h-3 w-3" />
      )}
    </button>
  );

  return (
    <div className={cn('w-64 h-full', className)}>
      <GlassCard className="h-full p-4" variant="strong">
        <nav className="space-y-6">
          {/* Main Navigation */}
          <div>
            <SectionHeader
              title="Main"
              isExpanded={expandedSections.includes('main')}
              onToggle={() => toggleSection('main')}
            />
            {expandedSections.includes('main') && (
              <div className="mt-2 space-y-1">
                {mainNavigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Collaboration */}
          <div>
            <SectionHeader
              title="Collaboration"
              isExpanded={expandedSections.includes('collaboration')}
              onToggle={() => toggleSection('collaboration')}
            />
            {expandedSections.includes('collaboration') && (
              <div className="mt-2 space-y-1">
                {collaborationItems.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Integration */}
          <div>
            <SectionHeader
              title="Integration"
              isExpanded={expandedSections.includes('integration')}
              onToggle={() => toggleSection('integration')}
            />
            {expandedSections.includes('integration') && (
              <div className="mt-2 space-y-1">
                {integrationItems.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Help */}
          <div className="pt-4 border-t border-white/40">
            <NavItem item={{ name: 'Help & Support', href: '/help', icon: HelpCircle }} />
          </div>
        </nav>

        {/* Usage Indicator */}
        <div className="mt-auto pt-6">
          <GlassCard className="p-3" variant="subtle">
            <div className="text-xs text-gray-600 mb-2">Workflow Usage</div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">36/60</span>
              <span className="text-xs text-green-600 font-medium">Free Plan</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: '60%' }}
              />
            </div>
          </GlassCard>
        </div>
      </GlassCard>
    </div>
  );
}
