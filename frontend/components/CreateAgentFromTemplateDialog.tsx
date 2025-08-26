import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { AgentTemplate } from '~backend/templates/types';

interface CreateAgentFromTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: AgentTemplate;
  onSuccess: () => void;
}

export default function CreateAgentFromTemplateDialog({ open, onOpenChange, template, onSuccess }: CreateAgentFromTemplateDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (template) {
      setFormData({
        name: `${template.name} Copy`,
        description: template.description
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await backend.core.createAgent({
        name: formData.name,
        description: formData.description || undefined,
        template_id: template.id
      });

      toast({
        title: "Agent Created",
        description: "Your new AI agent has been created from the template.",
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to create agent from template:', error);
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Agent from Template</DialogTitle>
          <DialogDescription>
            Using template: <span className="font-semibold">{template.name}</span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter a name for your new agent"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this agent will do..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Industry</Label>
            <Input value={template.industry} disabled className="capitalize" />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Input value={template.type} disabled className="capitalize" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name}>
              {isLoading ? 'Creating...' : 'Create Agent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
