import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Crown, X } from 'lucide-react';
import backend from '~backend/client';
import { useBackend } from '../hooks/useBackend';

interface CreateCollaborationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateCollaborationDialog({ open, onOpenChange, onSuccess }: CreateCollaborationDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [coordinatorAgentId, setCoordinatorAgentId] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const authedBackend = useBackend();

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => authedBackend.core.listAgents({ limit: 100 })
  });

  const handleAgentToggle = (agentId: number, checked: boolean) => {
    if (checked) {
      setSelectedAgents(prev => [...prev, agentId]);
    } else {
      setSelectedAgents(prev => prev.filter(id => id !== agentId));
      // If removing the coordinator, clear coordinator selection
      if (coordinatorAgentId === agentId) {
        setCoordinatorAgentId(undefined);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedAgents.length < 2) return;

    setIsSubmitting(true);
    try {
      await authedBackend.core.createCollaboration({
        name: name.trim(),
        description: description.trim() || undefined,
        participating_agents: selectedAgents,
        coordinator_agent_id: coordinatorAgentId
      });

      toast({
        title: "Collaboration created",
        description: "The agent collaboration has been created successfully.",
      });

      // Reset form
      setName('');
      setDescription('');
      setSelectedAgents([]);
      setCoordinatorAgentId(undefined);
      
      onSuccess();
    } catch (error) {
      console.error('Failed to create collaboration:', error);
      toast({
        title: "Error",
        description: "Failed to create collaboration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAgentName = (agentId: number) => {
    const agent = agentsData?.agents.find(a => a.id === agentId);
    return agent?.name || agentId.toString();
  };

  const getAgentType = (agentId: number) => {
    const agent = agentsData?.agents.find(a => a.id === agentId);
    return agent?.type || 'unknown';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Agent Collaboration</DialogTitle>
          <DialogDescription>
            Set up a collaboration between multiple AI agents to work together on complex tasks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Collaboration Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter collaboration name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose and goals of this collaboration"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Participating Agents * (minimum 2)</Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                {agentsData?.agents.map((agent) => (
                  <div key={agent.id} className="flex items-center space-x-3 py-2">
                    <Checkbox
                      id={agent.id.toString()}
                      checked={selectedAgents.includes(agent.id)}
                      onCheckedChange={(checked) => handleAgentToggle(agent.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={agent.id.toString()} className="text-sm font-medium cursor-pointer">
                        {agent.name}
                      </Label>
                      <div className="text-xs text-gray-400">
                        {agent.type} • {agent.industry}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {agent.status}
                    </Badge>
                  </div>
                ))}
              </div>
              {selectedAgents.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm text-gray-400 mb-2">Selected agents:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgents.map((agentId) => (
                      <Badge key={agentId} variant="secondary" className="text-xs">
                        {getAgentName(agentId)} ({getAgentType(agentId)})
                        <button
                          type="button"
                          onClick={() => handleAgentToggle(agentId, false)}
                          className="ml-1 hover:bg-gray-700 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedAgents.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="coordinator">Coordinator Agent (Optional)</Label>
                <Select value={coordinatorAgentId?.toString() || ''} onValueChange={(value) => setCoordinatorAgentId(value ? parseInt(value) : undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a coordinator agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No coordinator</SelectItem>
                    {selectedAgents.map((agentId) => (
                      <SelectItem key={agentId} value={agentId.toString()}>
                        <div className="flex items-center gap-2">
                          <Crown className="h-3 w-3" />
                          {getAgentName(agentId)} ({getAgentType(agentId)})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-400">
                  The coordinator agent will manage task distribution and communication flow.
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !name.trim() || selectedAgents.length < 2}
            >
              {isSubmitting ? 'Creating...' : 'Create Collaboration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
