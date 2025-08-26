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
  Target
} from 'lucide-react';
import backend from '~backend/client';

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
      color: "text-blue-400"
    },
    {
      title: "Active Workflows",
      value: activeWorkflows.toString(),
      description: "Automated processes in progress",
      icon: Workflow,
      color: "text-green-400"
    },
    {
      title: "Tasks Completed",
      value: totalTasks.toLocaleString(),
      description: "Total tasks processed",
      icon: CheckCircle,
      color: "text-purple-400"
    },
    {
      title: "Average Accuracy",
      value: `${(avgAccuracy * 100).toFixed(1)}%`,
      description: "AI performance metric",
      icon: Target,
      color: "text-orange-400"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "agent_created",
      message: "New Construction Takeoff Agent created",
      time: "2 minutes ago",
      icon: Bot,
      color: "text-blue-400"
    },
    {
      id: 2,
      type: "workflow_completed",
      message: "Customer Support Workflow completed successfully",
      time: "5 minutes ago",
      icon: CheckCircle,
      color: "text-green-400"
    },
    {
      id: 3,
      type: "agent_training",
      message: "Finance Agent accuracy improved to 97.2%",
      time: "12 minutes ago",
      icon: TrendingUp,
      color: "text-purple-400"
    },
    {
      id: 4,
      type: "workflow_started",
      message: "Sales Proposal Workflow initiated",
      time: "18 minutes ago",
      icon: Workflow,
      color: "text-orange-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Monitor your AI agents and workflow performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-400 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Latest updates from your AI agents and workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <activity.icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-100">{activity.message}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Bot className="h-4 w-4 mr-2" />
                  Create New Agent
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Workflow className="h-4 w-4 mr-2" />
                  Design Workflow
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Integrations
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">AI Processing</span>
                  <Badge className="bg-green-900/50 text-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Integrations</span>
                  <Badge className="bg-green-900/50 text-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Data Pipeline</span>
                  <Badge className="bg-yellow-900/50 text-yellow-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Maintenance
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Security</span>
                  <Badge className="bg-green-900/50 text-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Secure
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Performing Agents */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Top Performing Agents</span>
              </CardTitle>
              <CardDescription>
                AI agents with highest accuracy and task completion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentsData?.agents
                  .sort((a, b) => b.accuracy_rate - a.accuracy_rate)
                  .slice(0, 5)
                  .map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Bot className="h-8 w-8 text-blue-400" />
                        <div>
                          <p className="font-medium text-gray-100">{agent.name}</p>
                          <p className="text-sm text-gray-400 capitalize">{agent.industry}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-100">
                          {(agent.accuracy_rate * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-400">
                          {agent.tasks_completed.toLocaleString()} tasks
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
