import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Workflow, Plus, Search, Play, Pause, Settings, Edit, Webhook, Calendar } from 'lucide-react';
import backend from '~backend/client';
import type { Workflow as WorkflowType } from '~backend/core/types';
import CreateWorkflowDialog from '../components/CreateWorkflowDialog';
import WorkflowBuilderDialog from '../components/WorkflowBuilderDialog';
import { GlassCard } from '../components/GlassCard';
import { Sidebar } from '../components/Sidebar';

export default function WorkflowsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBuilderDialogOpen, setIsBuilderDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(null);

  const { data: workflowsData, isLoading, refetch } = useQuery({
    queryKey: ['workflows', industryFilter, statusFilter],
    queryFn: () => backend.core.listWorkflows({
      industry: industryFilter || undefined,
      status: statusFilter || undefined,
      limit: 50
    })
  });

  const filteredWorkflows = workflowsData?.workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Play;
      case 'inactive': return Pause;
      default: return Settings;
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'webhook': return Webhook;
      case 'schedule': return Calendar;
      default: return Play;
    }
  };

  const handleEditWorkflow = (workflow: WorkflowType) => {
    setSelectedWorkflow(workflow);
    setIsBuilderDialogOpen(true);
  };

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setIsBuilderDialogOpen(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
                <p className="text-gray-600 mt-2">
                  Design and manage automated business processes
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-white/60 border-white/40 hover:bg-white/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Create
                </Button>
                <Button 
                  onClick={handleCreateWorkflow}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Visual Builder
                </Button>
              </div>
            </div>

            {/* Filters */}
            <GlassCard className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/60 border-white/40 focus:bg-white/80"
                  />
                </div>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="bg-white/60 border-white/40 focus:bg-white/80">
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
                  <SelectTrigger className="bg-white/60 border-white/40 focus:bg-white/80">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-600 flex items-center">
                  Total: {workflowsData?.total || 0} workflows
                </div>
              </div>
            </GlassCard>

            {/* Workflows Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <GlassCard key={i} className="p-6 animate-pulse">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-8 bg-gray-200 rounded-xl" />
                        <div className="h-6 w-16 bg-gray-200 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkflows.map((workflow) => {
                  const StatusIcon = getStatusIcon(workflow.status);
                  const TriggerIcon = getTriggerIcon(workflow.trigger_type);
                  return (
                    <GlassCard key={workflow.id} className="p-6 group" hover>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                              <Workflow className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 truncate">{workflow.name}</h3>
                              <p className="text-sm text-gray-600 capitalize">{workflow.industry}</p>
                            </div>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {workflow.status}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {workflow.description || 'No description available'}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Trigger</span>
                            <div className="flex items-center space-x-1 text-gray-700">
                              <TriggerIcon className="h-3 w-3" />
                              <span className="capitalize">{workflow.trigger_type.replace('_', ' ')}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Steps</span>
                            <span className="font-medium text-gray-900">
                              {workflow.steps?.length || 0} steps
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Created</span>
                            <span className="font-medium text-gray-900">
                              {new Date(workflow.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-white/40 flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 bg-white/60 border-white/40 hover:bg-white/80"
                            onClick={() => handleEditWorkflow(workflow)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                            <Play className="h-4 w-4 mr-1" />
                            Run
                          </Button>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}

            {filteredWorkflows.length === 0 && !isLoading && (
              <GlassCard className="p-12 text-center">
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg w-fit mx-auto">
                    <Workflow className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">No workflows found</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {searchTerm || industryFilter || statusFilter
                        ? 'Try adjusting your filters to see more results.'
                        : 'Get started by creating your first workflow.'}
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-white/60 border-white/40 hover:bg-white/80"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Quick Create
                    </Button>
                    <Button 
                      onClick={handleCreateWorkflow}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Visual Builder
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      <CreateWorkflowDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />

      <WorkflowBuilderDialog
        open={isBuilderDialogOpen}
        onOpenChange={setIsBuilderDialogOpen}
        workflow={selectedWorkflow}
        onSuccess={() => {
          refetch();
          setIsBuilderDialogOpen(false);
        }}
      />
    </div>
  );
}
