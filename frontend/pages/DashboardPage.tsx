import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Workflow, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Users,
  Zap,
  Target,
  Plus,
  ArrowRight
} from 'lucide-react';
import backend from '~backend/client';
import { GlassCard } from '../components/GlassCard';
import { Sidebar } from '../components/Sidebar';

export default function DashboardPage() {
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => backend.core.listAgents({ limit: 10 })
  });

  const { data: workflowsData } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => backend.core.listWorkflows({ limit: 10 })
  });

  const activeAgents = agentsData?.agents.filter(agent => agent.status === 'active').length || 0;
  const activeWorkflows = workflowsData?.workflows.filter(workflow => workflow.status === 'active').length || 0;
  const totalTasks = agentsData?.agents.reduce((sum, agent) => sum + agent.tasks_completed, 0) || 0;
  const avgAccuracy = agentsData?.agents.length 
    ? agentsData.agents.reduce((sum, agent) => sum + agent.accuracy_rate, 0) / agentsData.agents.length 
    : 0;

  const stats = [
    {
      title: "Active Agents",
      value: activeAgents.toString(),
      description: "AI agents currently running",
      icon: Bot,
      color: "from-blue-500 to-cyan-500",
      change: "+12%"
    },
    {
      title: "Active Workflows",
      value: activeWorkflows.toString(),
      description: "Automated processes in progress",
      icon: Workflow,
      color: "from-green-500 to-emerald-500",
      change: "+8%"
    },
    {
      title: "Tasks Completed",
      value: totalTasks.toLocaleString(),
      description: "Total tasks processed",
      icon: CheckCircle,
      color: "from-purple-500 to-pink-500",
      change: "+24%"
    },
    {
      title: "Average Accuracy",
      value: `${(avgAccuracy * 100).toFixed(1)}%`,
      description: "AI performance metric",
      icon: Target,
      color: "from-orange-500 to-red-500",
      change: "+3%"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "agent_created",
      message: "New Construction Takeoff Agent created",
      time: "2 minutes ago",
      icon: Bot,
      color: "text-blue-600"
    },
    {
      id: 2,
      type: "workflow_completed",
      message: "Customer Support Workflow completed successfully",
      time: "5 minutes ago",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      id: 3,
      type: "agent_training",
      message: "Finance Agent accuracy improved to 97.2%",
      time: "12 minutes ago",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      id: 4,
      type: "workflow_started",
      message: "Sales Proposal Workflow initiated",
      time: "18 minutes ago",
      icon: Workflow,
      color: "text-orange-600"
    }
  ];

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
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">
                  Monitor your AI agents and workflow performance
                </p>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <GlassCard key={index} className="p-6" hover>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {stat.change}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-700">{stat.title}</div>
                    <div className="text-xs text-gray-500">{stat.description}</div>
                  </div>
                </GlassCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                        <p className="text-sm text-gray-600">Latest updates from your AI agents</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-xl bg-white/50 hover:bg-white/70 transition-colors">
                        <div className={`p-2 rounded-lg bg-gray-50 ${activity.color}`}>
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Quick Actions & System Status */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <GlassCard className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                      <p className="text-sm text-gray-600">Common tasks</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button className="w-full justify-start bg-white/60 text-gray-900 hover:bg-white/80 shadow-sm">
                      <Bot className="h-4 w-4 mr-3" />
                      Create New Agent
                    </Button>
                    <Button className="w-full justify-start bg-white/60 text-gray-900 hover:bg-white/80 shadow-sm">
                      <Workflow className="h-4 w-4 mr-3" />
                      Design Workflow
                    </Button>
                    <Button className="w-full justify-start bg-white/60 text-gray-900 hover:bg-white/80 shadow-sm">
                      <Users className="h-4 w-4 mr-3" />
                      Manage Integrations
                    </Button>
                    <Button className="w-full justify-start bg-white/60 text-gray-900 hover:bg-white/80 shadow-sm">
                      <TrendingUp className="h-4 w-4 mr-3" />
                      View Analytics
                    </Button>
                  </div>
                </GlassCard>

                {/* System Status */}
                <GlassCard className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                      <p className="text-sm text-gray-600">All systems operational</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                      <span className="text-sm font-medium text-gray-700">AI Processing</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                      <span className="text-sm font-medium text-gray-700">Integrations</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-50">
                      <span className="text-sm font-medium text-gray-700">Data Pipeline</span>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Maintenance
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                      <span className="text-sm font-medium text-gray-700">Security</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Secure
                      </Badge>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Top Performing Agents */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Top Performing Agents</h3>
                    <p className="text-sm text-gray-600">Agents with highest accuracy and task completion</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agentsData?.agents
                  .sort((a, b) => b.accuracy_rate - a.accuracy_rate)
                  .slice(0, 6)
                  .map((agent) => (
                    <div key={agent.id} className="p-4 rounded-xl bg-white/50 hover:bg-white/70 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{agent.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{agent.industry}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Accuracy</span>
                          <span className="font-medium text-gray-900">
                            {(agent.accuracy_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tasks</span>
                          <span className="font-medium text-gray-900">
                            {agent.tasks_completed.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
