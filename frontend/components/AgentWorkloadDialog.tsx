import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, ArrowRight, ListTodo } from 'lucide-react';
import backend from '~backend/client';

interface AgentWorkloadDialogProps {
  agentId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AgentWorkloadDialog({ agentId, open, onOpenChange }: AgentWorkloadDialogProps) {
  const { data: workload, isLoading } = useQuery({
    queryKey: ['agent-workload', agentId],
    queryFn: () => backend.core.getAgentWorkload({ agent_id: agentId! }),
    enabled: !!agentId,
  });

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

    if (!workload) {
      return <div className="p-6">Workload data not found.</div>;
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-blue-400" />
            Agent Workload
          </DialogTitle>
          <DialogDescription>
            Current tasks and performance for agent ID: {workload.agent_id}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Capacity Utilization</span>
              <span className="font-bold">{(workload.capacity_utilization * 100).toFixed(1)}%</span>
            </div>
            <Progress value={workload.capacity_utilization * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold">{workload.current_tasks.length}</div>
              <div className="text-sm text-gray-400">Active Tasks</div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold">{workload.pending_handoffs}</div>
              <div className="text-sm text-gray-400">Pending Handoffs</div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold">{workload.recent_completions}</div>
              <div className="text-sm text-gray-400">Completed (7d)</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Current Tasks
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {workload.current_tasks.length > 0 ? (
                workload.current_tasks.map(task => (
                  <div key={task.id} className="p-3 bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{task.title}</span>
                      <Badge variant="outline" className="capitalize">{task.priority}</Badge>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Status: <span className="capitalize">{task.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">No active tasks.</div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
