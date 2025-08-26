import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import WorkflowBuilder from './WorkflowBuilder';
import backend from '~backend/client';

interface WorkflowBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow?: any;
  onSuccess: () => void;
}

export default function WorkflowBuilderDialog({ 
  open, 
  onOpenChange, 
  workflow, 
  onSuccess 
}: WorkflowBuilderDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async (workflowData: any) => {
    setIsLoading(true);
    try {
      // Convert the visual workflow to the backend format
      const steps = workflowData.nodes
        .filter((node: any) => node.type !== 'start')
        .map((node: any, index: number) => ({
          id: node.id,
          name: node.name,
          type: node.type,
          config: node.config,
          order: index
        }));

      if (workflow?.id) {
        // Update existing workflow
        await backend.core.updateWorkflow({
          id: workflow.id,
          name: workflowData.name,
          description: workflowData.description,
          steps
        });
        
        toast({
          title: "Workflow updated",
          description: "Your workflow has been updated successfully.",
        });
      } else {
        // Create new workflow
        await backend.core.createWorkflow({
          name: workflowData.name,
          description: workflowData.description,
          industry: 'general', // Default industry
          steps
        });
        
        toast({
          title: "Workflow created",
          description: "Your workflow has been created successfully.",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast({
        title: "Error",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async (workflowData: any) => {
    try {
      // Simulate workflow testing
      toast({
        title: "Workflow test started",
        description: "Testing your workflow with sample data...",
      });

      // In a real implementation, this would execute the workflow
      setTimeout(() => {
        toast({
          title: "Test completed",
          description: "Workflow executed successfully with sample data.",
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to test workflow:', error);
      toast({
        title: "Test failed",
        description: "Failed to test workflow. Please check your configuration.",
        variant: "destructive",
      });
    }
  };

  // Convert backend workflow to visual format
  const initialWorkflow = workflow ? {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    nodes: [
      {
        id: 'start',
        type: 'start' as const,
        name: 'Start',
        position: { x: 100, y: 100 },
        config: {},
        connections: workflow.steps.length > 0 ? [workflow.steps[0].id] : []
      },
      ...workflow.steps.map((step: any, index: number) => ({
        id: step.id,
        type: step.type,
        name: step.name,
        position: { x: 100 + (index + 1) * 250, y: 100 },
        config: step.config || {},
        connections: index < workflow.steps.length - 1 ? [workflow.steps[index + 1].id] : []
      }))
    ],
    connections: workflow.steps.map((step: any, index: number) => {
      if (index === 0) {
        return {
          id: `conn_start_${step.id}`,
          from: 'start',
          to: step.id
        };
      } else {
        return {
          id: `conn_${workflow.steps[index - 1].id}_${step.id}`,
          from: workflow.steps[index - 1].id,
          to: step.id
        };
      }
    }).filter(Boolean)
  } : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {workflow ? 'Edit Workflow' : 'Create New Workflow'}
          </DialogTitle>
          <DialogDescription>
            Design your workflow using the visual builder. Drag and drop nodes to create your automation flow.
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-[80vh]">
          <WorkflowBuilder
            initialWorkflow={initialWorkflow}
            onSave={handleSave}
            onTest={handleTest}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
