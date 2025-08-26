import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';

interface Agent {
  id: number;
  name: string;
  type: string;
  status: string;
}

interface DeployAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeployAgentDialog({ open, onOpenChange, onSuccess }: DeployAgentDialogProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agent_id: '',
    environment: 'development',
    cpu: 1,
    memory: 2048,
    storage: 10240,
    autoScalingEnabled: false,
    minInstances: 1,
    maxInstances: 3,
    targetCpuUtilization: 70,
    configuration: '{}'
  });

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadAgents();
    }
  }, [open]);

  const loadAgents = async () => {
    try {
      const response = await backend.core.listAgents({ status: 'active' });
      setAgents(response.agents);
    } catch (error) {
      console.error('Failed to load agents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load agents',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let configuration = {};
      if (formData.configuration.trim()) {
        try {
          configuration = JSON.parse(formData.configuration);
        } catch {
          throw new Error('Invalid JSON configuration');
        }
      }

      await backend.deployment.deployAgent({
        agent_id: parseInt(formData.agent_id),
        environment: formData.environment as any,
        configuration,
        resource_allocation: {
          cpu: formData.cpu,
          memory: formData.memory,
          storage: formData.storage
        },
        auto_scaling: {
          enabled: formData.autoScalingEnabled,
          min_instances: formData.minInstances,
          max_instances: formData.maxInstances,
          target_cpu_utilization: formData.targetCpuUtilization
        }
      });

      toast({
        title: 'Success',
        description: 'Agent deployment initiated successfully'
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to deploy agent:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to deploy agent',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      agent_id: '',
      environment: 'development',
      cpu: 1,
      memory: 2048,
      storage: 10240,
      autoScalingEnabled: false,
      minInstances: 1,
      maxInstances: 3,
      targetCpuUtilization: 70,
      configuration: '{}'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deploy Agent</DialogTitle>
          <DialogDescription>
            Deploy an AI agent to a specific environment with custom configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agent">Agent</Label>
              <Select
                value={formData.agent_id}
                onValueChange={(value) => setFormData({ ...formData, agent_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name} ({agent.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={formData.environment}
                onValueChange={(value) => setFormData({ ...formData, environment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Resource Allocation</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="cpu">CPU Cores</Label>
                <Input
                  id="cpu"
                  type="number"
                  min="1"
                  max="16"
                  value={formData.cpu}
                  onChange={(e) => setFormData({ ...formData, cpu: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory">Memory (MB)</Label>
                <Input
                  id="memory"
                  type="number"
                  min="512"
                  max="32768"
                  step="512"
                  value={formData.memory}
                  onChange={(e) => setFormData({ ...formData, memory: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Storage (MB)</Label>
                <Input
                  id="storage"
                  type="number"
                  min="1024"
                  max="102400"
                  step="1024"
                  value={formData.storage}
                  onChange={(e) => setFormData({ ...formData, storage: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="autoScaling"
                checked={formData.autoScalingEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, autoScalingEnabled: checked })}
              />
              <Label htmlFor="autoScaling" className="text-base font-medium">
                Enable Auto Scaling
              </Label>
            </div>

            {formData.autoScalingEnabled && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minInstances">Min Instances</Label>
                  <Input
                    id="minInstances"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.minInstances}
                    onChange={(e) => setFormData({ ...formData, minInstances: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxInstances">Max Instances</Label>
                  <Input
                    id="maxInstances"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxInstances}
                    onChange={(e) => setFormData({ ...formData, maxInstances: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetCpu">Target CPU (%)</Label>
                  <Input
                    id="targetCpu"
                    type="number"
                    min="10"
                    max="90"
                    value={formData.targetCpuUtilization}
                    onChange={(e) => setFormData({ ...formData, targetCpuUtilization: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="configuration">Configuration (JSON)</Label>
            <Textarea
              id="configuration"
              placeholder='{"key": "value"}'
              value={formData.configuration}
              onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
              rows={4}
            />
            <p className="text-sm text-gray-400">
              Optional JSON configuration for the agent deployment
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Deploying...' : 'Deploy Agent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
