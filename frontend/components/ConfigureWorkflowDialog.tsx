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

interface Workflow {
  id: number;
  name: string;
  description?: string;
  industry: string;
  status: string;
}

interface ConfigureWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deploymentId: number;
  onSuccess: () => void;
}

export function ConfigureWorkflowDialog({ open, onOpenChange, deploymentId, onSuccess }: ConfigureWorkflowDialogProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workflow_id: '',
    enabled: true,
    configuration: '{}',
    trigger_conditions: '{}',
    max_retries: 3,
    backoff_strategy: 'exponential',
    retry_delay_ms: 1000,
    timeout_ms: 30000
  });

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadWorkflows();
    }
  }, [open]);

  const loadWorkflows = async () => {
    try {
      const response = await backend.core.listWorkflows({ status: 'active' });
      setWorkflows(response.workflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflows',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let configuration = {};
      let triggerConditions = {};

      if (formData.configuration.trim()) {
        try {
          configuration = JSON.parse(formData.configuration);
        } catch {
          throw new Error('Invalid JSON configuration');
        }
      }

      if (formData.trigger_conditions.trim()) {
        try {
          triggerConditions = JSON.parse(formData.trigger_conditions);
        } catch {
          throw new Error('Invalid JSON trigger conditions');
        }
      }

      await backend.deployment.configureWorkflow({
        deployment_id: deploymentId,
        workflow_id: parseInt(formData.workflow_id),
        configuration,
        enabled: formData.enabled,
        trigger_conditions: triggerConditions,
        retry_policy: {
          max_retries: formData.max_retries,
          backoff_strategy: formData.backoff_strategy as any,
          retry_delay_ms: formData.retry_delay_ms
        },
        timeout_ms: formData.timeout_ms
      });

      toast({
        title: 'Success',
        description: 'Workflow configured successfully'
      });

      onSuccess();
      resetForm();
    } catch (error: any) {
      console.error('Failed to configure workflow:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to configure workflow',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      workflow_id: '',
      enabled: true,
      configuration: '{}',
      trigger_conditions: '{}',
      max_retries: 3,
      backoff_strategy: 'exponential',
      retry_delay_ms: 1000,
      timeout_ms: 30000
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Workflow</DialogTitle>
          <DialogDescription>
            Configure a workflow for this deployed agent with custom settings and retry policies.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workflow">Workflow</Label>
              <Select
                value={formData.workflow_id}
                onValueChange={(value) => setFormData({ ...formData, workflow_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a workflow" />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id.toString()}>
                      {workflow.name} ({workflow.industry})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
              <Label htmlFor="enabled">Enable Workflow</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="configuration">Configuration (JSON)</Label>
            <Textarea
              id="configuration"
              placeholder='{"key": "value"}'
              value={formData.configuration}
              onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger_conditions">Trigger Conditions (JSON)</Label>
            <Textarea
              id="trigger_conditions"
              placeholder='{"event": "task_created", "priority": "high"}'
              value={formData.trigger_conditions}
              onChange={(e) => setFormData({ ...formData, trigger_conditions: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label className="text-base font-medium">Retry Policy</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="max_retries">Max Retries</Label>
                <Input
                  id="max_retries"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.max_retries}
                  onChange={(e) => setFormData({ ...formData, max_retries: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backoff_strategy">Backoff Strategy</Label>
                <Select
                  value={formData.backoff_strategy}
                  onValueChange={(value) => setFormData({ ...formData, backoff_strategy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="exponential">Exponential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retry_delay">Retry Delay (ms)</Label>
                <Input
                  id="retry_delay"
                  type="number"
                  min="100"
                  max="60000"
                  step="100"
                  value={formData.retry_delay_ms}
                  onChange={(e) => setFormData({ ...formData, retry_delay_ms: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="1000"
                  max="300000"
                  step="1000"
                  value={formData.timeout_ms}
                  onChange={(e) => setFormData({ ...formData, timeout_ms: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Configuring...' : 'Configure Workflow'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
