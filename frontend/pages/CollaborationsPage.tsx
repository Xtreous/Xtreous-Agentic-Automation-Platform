import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Search, 
  MessageSquare, 
  Crown, 
  Activity,
  Calendar,
  ArrowRight
} from 'lucide-react';
import backend from '~backend/client';
import type { AgentCollaboration } from '~backend/core/types';
import CreateCollaborationDialog from '../components/CreateCollaborationDialog';

export default function CollaborationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: collaborationsData, isLoading, refetch } = useQuery({
    queryKey: ['collaborations', statusFilter],
    queryFn: () => backend.core.listCollaborations({
      status: statusFilter || undefined,
      limit: 50
    })
  });

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => backend.core.listAgents({ limit: 100 })
  });

  const filteredCollaborations = collaborationsData?.collaborations.filter(collaboration =>
    collaboration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collaboration.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentName = (agentId: number) => {
    const agent = agentsData?.agents.find(a => a.id === agentId);
    return agent?.name || `Agent ${agentId.toString().slice(0, 8)}...`;
  };

  const getRecentMessages = (collaboration: AgentCollaboration) => {
    return collaboration.communication_log
      .slice(-3)
      .reverse();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agent Collaborations</h1>
              <p className="text-gray-600 mt-2">
                Manage multi-agent workflows and team collaborations
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Collaboration
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search collaborations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <div className="col-span-2 text-sm text-gray-600 flex items-center">
            Total: {collaborationsData?.total || 0} collaborations
          </div>
        </div>

        {/* Collaborations Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCollaborations.map((collaboration) => {
              const recentMessages = getRecentMessages(collaboration);
              return (
                <Card key={collaboration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          {collaboration.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {collaboration.description || 'No description available'}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(collaboration.status)}>
                        <Activity className="h-3 w-3 mr-1" />
                        {collaboration.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Participating Agents */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Participating Agents ({collaboration.participating_agents.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {collaboration.participating_agents.map((agentId) => (
                            <Badge 
                              key={agentId} 
                              variant="outline" 
                              className={`text-xs ${
                                collaboration.coordinator_agent_id === agentId 
                                  ? 'border-yellow-300 bg-yellow-50 text-yellow-800' 
                                  : ''
                              }`}
                            >
                              {collaboration.coordinator_agent_id === agentId && (
                                <Crown className="h-3 w-3 mr-1" />
                              )}
                              {getAgentName(agentId)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Recent Messages */}
                      {recentMessages.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Recent Activity
                          </h4>
                          <div className="space-y-2">
                            {recentMessages.map((message) => (
                              <div key={message.id} className="text-sm bg-gray-50 rounded p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-700">
                                    {getAgentName(message.from_agent_id)}
                                  </span>
                                  {message.to_agent_id && (
                                    <>
                                      <ArrowRight className="h-3 w-3 text-gray-400" />
                                      <span className="text-gray-600">
                                        {getAgentName(message.to_agent_id)}
                                      </span>
                                    </>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {message.message_type}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 line-clamp-2">{message.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Created: {new Date(collaboration.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          {collaboration.communication_log.length} messages
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredCollaborations.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No collaborations found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first agent collaboration.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Collaboration
            </Button>
          </div>
        )}
      </div>

      <CreateCollaborationDialog 
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
