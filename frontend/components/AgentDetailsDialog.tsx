import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bot, Activity, Brain, Settings, Calendar, CheckCircle, TrendingUp, Clock, Target, Zap } from 'lucide-react';
import backend from '~backend/client';
import AgentSkillsCard from './AgentSkillsCard';

interface AgentDetailsDialogProps {
  agentId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AgentDetailsDialog({ agentId, open, onOpenChange }: AgentDetailsDialogProps) {
  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent-details', agentId],
    queryFn: () => backend.core.getAgent({ id: agentId! }),
    enabled: !!agentId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/50 text-green-300';
      case 'training': return 'bg-yellow-900/50 text-yellow-300';
      case 'inactive': return 'bg-gray-700 text-gray-200';
      default: return 'bg-gray-700 text-gray-200';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-8 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      );
    }

    if (!agent) {
      return <div className="p-6">Agent not found.</div>;
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-blue-400" />
            {agent.name}
          </DialogTitle>
          <DialogDescription>
            Detailed information for agent ID: {agent.id}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="overview" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <div className="space-y-4">
              <p className="text-gray-400">{agent.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Status</div>
                  <Badge className={getStatusColor(agent.status)}>{agent.status}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Industry</div>
                  <div className="font-medium capitalize">{agent.industry}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Type</div>
                  <div className="font-medium capitalize">{agent.type}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Created At</div>
                  <div className="font-medium">{new Date(agent.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="performance" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-green-400" />
                  <span>Accuracy Rate</span>
                </div>
                <span className="font-bold text-lg">{(agent.accuracy_rate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                  <span>Tasks Completed</span>
                </div>
                <span className="font-bold text-lg">{agent.tasks_completed.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-400" />
                  <span>Total Training Hours</span>
                </div>
                <span className="font-bold text-lg">{agent.total_training_hours || 0}h</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                  <span>Skill Points</span>
                </div>
                <span className="font-bold text-lg">{agent.skill_points || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <span>Learning Rate</span>
                </div>
                <span className="font-bold text-lg">{agent.learning_rate || 1.0}</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="skills" className="mt-4">
            <AgentSkillsCard agentId={agent.id} />
          </TabsContent>
          <TabsContent value="config" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Max Concurrent Tasks</div>
                <div className="font-medium">{agent.max_concurrent_tasks}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Capabilities</div>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities?.length > 0 ? (
                    agent.capabilities.map((cap, i) => <Badge key={i} variant="outline">{cap}</Badge>)
                  ) : (
                    <span className="text-sm text-gray-500">No capabilities defined.</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Configuration JSON</div>
                <pre className="p-3 bg-gray-800 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(agent.configuration, null, 2)}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
