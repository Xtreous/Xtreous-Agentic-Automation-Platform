import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Mail, 
  FileSpreadsheet, 
  Ticket, 
  Users, 
  MessageSquare, 
  Database,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import backend from '~backend/client';
import type { Integration } from '~backend/core/types';
import CreateIntegrationDialog from '../components/CreateIntegrationDialog';

export default function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: integrationsData, isLoading, refetch } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => backend.core.listIntegrations()
  });

  const filteredIntegrations = integrationsData?.integrations.filter(integration =>
    integration.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'gmail': return Mail;
      case 'sheets': return FileSpreadsheet;
      case 'jira': return Ticket;
      case 'crm': return Users;
      case 'zendesk': return MessageSquare;
      case 'hubspot': return Database;
      default: return Settings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availableIntegrations = [
    {
      type: 'gmail',
      name: 'Gmail',
      description: 'Send and receive emails automatically',
      icon: Mail,
      category: 'Communication'
    },
    {
      type: 'sheets',
      name: 'Google Sheets',
      description: 'Read and write spreadsheet data',
      icon: FileSpreadsheet,
      category: 'Data'
    },
    {
      type: 'jira',
      name: 'Jira',
      description: 'Manage tickets and project workflows',
      icon: Ticket,
      category: 'Project Management'
    },
    {
      type: 'crm',
      name: 'CRM Systems',
      description: 'Sync customer data and interactions',
      icon: Users,
      category: 'Customer Management'
    },
    {
      type: 'zendesk',
      name: 'Zendesk',
      description: 'Handle customer support tickets',
      icon: MessageSquare,
      category: 'Support'
    },
    {
      type: 'hubspot',
      name: 'HubSpot',
      description: 'Marketing and sales automation',
      icon: Database,
      category: 'Marketing'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
              <p className="text-gray-600 mt-2">
                Connect your AI agents with external services and tools
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Active Integrations */}
        {filteredIntegrations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations.map((integration) => {
                const Icon = getIntegrationIcon(integration.type);
                return (
                  <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-8 w-8 text-blue-600" />
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <CardDescription className="capitalize">
                              {integration.type}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status === 'active' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {integration.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Connected</span>
                          <span className="text-sm font-medium">
                            {new Date(integration.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t flex gap-2">
                        <Button variant="outline" className="flex-1">
                          Configure
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Test
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Integrations */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableIntegrations.map((integration) => {
              const isConnected = filteredIntegrations.some(
                active => active.type === integration.type
              );
              
              return (
                <Card key={integration.type} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <integration.icon className="h-8 w-8 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription>{integration.category}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {integration.description}
                    </p>
                    
                    <Button 
                      className="w-full" 
                      variant={isConnected ? "outline" : "default"}
                      disabled={isConnected}
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      {isConnected ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {filteredIntegrations.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
            <p className="text-gray-600 mb-4">
              Connect your first integration to start automating workflows.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Integration
            </Button>
          </div>
        )}
      </div>

      <CreateIntegrationDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
}
