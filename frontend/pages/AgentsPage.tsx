import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Plus, Search, TrendingUp, Clock, CheckCircle, Users, Activity, Brain } from 'lucide-react';
import backend from '~backend/client';
import type { Agent } from '~backend/core/types';
import { useState } from 'react';
import CreateAgentDialog from '../components/CreateAgentDialog';
import AgentSkillsCard from '../components/AgentSkillsCard';

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  const { data: agentsData, isLoading, refetch } = useQuery({
    queryKey: ['agents', industryFilter, statusFilter],
    queryFn: () => backend.core.listAgents({
      industry: industryFilter || undefined,
      status: statusFilter || undefined,
      limit: 50
    })
  });

  const filteredAgents = agentsData?.agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'training': return Clock;
      default: return Bot;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
              <p className="text-gray-600 mt-2">
                Manage and monitor your self-learning AI agents
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Industries</SelectItem>
              <SelectItem value="construction">Construction</SelectItem>
              <SelectItem value="customer-service">Customer Service</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-600 flex items-center">
            Total: {agentsData?.total || 0} agents
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agents Grid */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAgents.map((agent) => {
                  const StatusIcon = getStatusIcon(agent.status);
                  return (
                    <Card 
                      key={agent.id} 
                      className={`hover:shadow-lg transition-shadow cursor-pointer ${
                        selectedAgentId === agent.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedAgentId(agent.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Bot className="h-8 w-8 text-blue-600" />
                            <div>
                              <CardTitle className="text-lg">{agent.name}</CardTitle>
                              <CardDescription className="capitalize">
                                {agent.industry} • {agent.type}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getStatusColor(agent.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {agent.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {agent.description || 'No description available'}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Accuracy Rate</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${agent.accuracy_rate * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {(agent.accuracy_rate * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Tasks Completed</span>
                            <span className="text-sm font-medium flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                              {agent.tasks_completed.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Training Hours</span>
                            <span className="text-sm font-medium flex items-center">
                              <Brain className="h-3 w-3 mr-1 text-purple-500" />
                              {agent.total_training_hours || 0}h
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Skill Points</span>
                            <span className="text-sm font-medium flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1 text-blue-500" />
                              {agent.skill_points || 0} pts
                            </span>
                          </div>

                          {agent.capabilities && agent.capabilities.length > 0 && (
                            <div className="text-sm">
                              <span className="text-gray-500">Capabilities:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {agent.capabilities.slice(0, 3).map((capability, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {capability}
                                  </Badge>
                                ))}
                                {agent.capabilities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{agent.capabilities.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex gap-2">
                          <Button variant="outline" className="flex-1">
                            <Activity className="h-4 w-4 mr-2" />
                            Workload
                          </Button>
                          <Button variant="outline" className="flex-1">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {filteredAgents.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || industryFilter || statusFilter
                    ? 'Try adjusting your filters to see more results.'
                    : 'Get started by creating your first AI agent.'}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Agent
                </Button>
              </div>
            )}
          </div>

          {/* Agent Skills Panel */}
          <div className="lg:col-span-1">
            {selectedAgentId ? (
              <AgentSkillsCard agentId={selectedAgentId} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Agent Skills
                  </CardTitle>
                  <CardDescription>
                    Select an agent to view their skills and learning progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Click on an agent to see their skills, training progress, and recommendations.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <CreateAgentDialog 
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
