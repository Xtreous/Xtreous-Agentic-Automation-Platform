import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Mail, FileSpreadsheet, Ticket, Users, MessageSquare, Database } from 'lucide-react';
import backend from '~backend/client';

interface CreateIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateIntegrationDialog({ open, onOpenChange, onSuccess }: CreateIntegrationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    apiKey: '',
    endpoint: '',
    description: ''
  });
  const { toast } = useToast();

  const integrationTypes = [
    { value: 'gmail', label: 'Gmail', icon: Mail },
    { value: 'sheets', label: 'Google Sheets', icon: FileSpreadsheet },
    { value: 'jira', label: 'Jira', icon: Ticket },
    { value: 'crm', label: 'CRM System', icon: Users },
    { value: 'zendesk', label: 'Zendesk', icon: MessageSquare },
    { value: 'hubspot', label: 'HubSpot', icon: Database }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const configuration = {
        apiKey: formData.apiKey,
        endpoint: formData.endpoint,
        description: formData.description
      };

      await backend.core.createIntegration({
        name: formData.name,
        type: formData.type as any,
        configuration
      });

      toast({
        title: "Integration Created",
        description: "Your integration has been successfully configured.",
      });

      setFormData({ name: '', type: '', apiKey: '', endpoint: '', description: '' });
      onSuccess();
    } catch (error) {
      console.error('Failed to create integration:', error);
      toast({
        title: "Error",
        description: "Failed to create integration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = integrationTypes.find(type => type.value === formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Integration</DialogTitle>
          <DialogDescription>
            Connect an external service to your AI agents for automated workflows.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Integration Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select integration type" />
              </SelectTrigger>
              <SelectContent>
                {integrationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <type.icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Integration Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={selectedType ? `${selectedType.label} Integration` : "e.g., My Gmail Integration"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key / Token</Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="Enter your API key or access token"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint URL (Optional)</Label>
            <Input
              id="endpoint"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              placeholder="https://api.example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe how this integration will be used..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name || !formData.type || !formData.apiKey}>
              {isLoading ? 'Creating...' : 'Create Integration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
