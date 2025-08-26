import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  Settings, 
  Activity, 
  Server, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  MemoryStick,
  HardDrive
} from 'lucide-react';
import backend from '~backend/client';
import { DeployAgentDialog } from '../components/DeployAgentDialog';
import { ConfigureWorkflowDialog } from '../components/ConfigureWorkflowDialog';

interface Deployment {
  id: number;
  agent_id: number;
  environment: string;
  status: string;
  configuration: Record<string, any>;
  endpoint_url?: string;
  health_check_url?: string;
  resource_allocation: {
    cpu: number;
    memory: number;
    storage: number;
  };
  auto_scaling: {
    enabled: boolean;
    min_instances: number;
    max_instances: number;
    target_cpu_utilization: number;
  };
  deployment_logs: Array<{
    id: number;
    level: string;
    message: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  metrics: {
    cpu_usage: number;
    memory_usage: number;
    request_count: number;
    response_time_avg: number;
    error_rate: number;
    uptime_percentage: number;
    recorded_at: string;
  };
  created_at: string;
  updated_at: string;
  deployed_at?: string;
  last_health_check?: string;
}

interface AgentMonitoring {
  deployment_id: number;
  agent_id: number;
  status: string;
  health_score: number;
  performance_metrics: {
    tasks_processed: number;
    success_rate: number;
    avg_response_time: number;
    error_count: number;
    last_activity: string;
  };
  resource_usage: {
    cpu_percentage: number;
    memory_percentage: number;
    storage_percentage: number;
  };
  alerts: Array<{
    id: number;
    type: string;
    severity: string;
    message: string;
    triggered_at: string;
  }>;
}

export function DeploymentPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [monitoring, setMonitoring] = useState<AgentMonitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [showConfigureDialog, setShowConfigureDialog] = useState(false);

  useEffect(() => {
    loadDeployments();
  }, []);

  useEffect(() => {
    if (selectedDeployment) {
      loadMonitoring(selectedDeployment.id);
    }
  }, [selectedDeployment]);

  const loadDeployments = async () => {
    try {
      const response = await backend.deployment.listDeployments();
      setDeployments(response.deployments);
      if (response.deployments.length > 0 && !selectedDeployment) {
        setSelectedDeployment(response.deployments[0]);
      }
    } catch (error) {
      console.error('Failed to load deployments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonitoring = async (deploymentId: number) => {
    try {
      const response = await backend.deployment.getAgentMonitoring({ deployment_id: deploymentId });
      setMonitoring(response);
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    }
  };

  const handleStopDeployment = async (deploymentId: number) => {
    try {
      await backend.deployment.stopDeployment({ id: deploymentId });
      loadDeployments();
    } catch (error) {
      console.error('Failed to stop deployment:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'deploying':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'stopped':
        return <Square className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-100 text-green-800';
      case 'deploying':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agent Deployments</h1>
              <p className="text-gray-600">Deploy, configure, and monitor your AI agents</p>
            </div>
            <Button onClick={() => setShowDeployDialog(true)}>
              <Play className="h-4 w-4 mr-2" />
              Deploy Agent
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deployments List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Active Deployments</CardTitle>
                  <CardDescription>
                    {deployments.length} deployment{deployments.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deployments.map((deployment) => (
                    <div
                      key={deployment.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDeployment?.id === deployment.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDeployment(deployment)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(deployment.status)}
                          <span className="font-medium">Agent {deployment.agent_id}</span>
                        </div>
                        <Badge className={getStatusColor(deployment.status)}>
                          {deployment.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Environment: {deployment.environment}</div>
                        {deployment.endpoint_url && (
                          <div className="truncate">URL: {deployment.endpoint_url}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {deployments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No deployments found. Deploy your first agent to get started.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Deployment Details */}
            <div className="lg:col-span-2">
              {selectedDeployment ? (
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                    <TabsTrigger value="configuration">Configuration</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Deployment Overview</CardTitle>
                            <CardDescription>
                              Agent {selectedDeployment.agent_id} in {selectedDeployment.environment}
                            </CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowConfigureDialog(true)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                            {selectedDeployment.status === 'deployed' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleStopDeployment(selectedDeployment.id)}
                              >
                                <Square className="h-4 w-4 mr-2" />
                                Stop
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusIcon(selectedDeployment.status)}
                              <span className="capitalize">{selectedDeployment.status}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Environment</label>
                            <div className="mt-1 capitalize">{selectedDeployment.environment}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Deployed At</label>
                            <div className="mt-1">
                              {selectedDeployment.deployed_at
                                ? new Date(selectedDeployment.deployed_at).toLocaleString()
                                : 'Not deployed'}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Last Health Check</label>
                            <div className="mt-1">
                              {selectedDeployment.last_health_check
                                ? new Date(selectedDeployment.last_health_check).toLocaleString()
                                : 'Never'}
                            </div>
                          </div>
                        </div>

                        {selectedDeployment.endpoint_url && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Endpoint URL</label>
                            <div className="mt-1 p-2 bg-gray-50 rounded border font-mono text-sm">
                              {selectedDeployment.endpoint_url}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium text-gray-500 mb-2 block">
                            Resource Allocation
                          </label>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                              <Cpu className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">
                                {selectedDeployment.resource_allocation.cpu} CPU
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MemoryStick className="h-4 w-4 text-green-500" />
                              <span className="text-sm">
                                {selectedDeployment.resource_allocation.memory} MB RAM
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <HardDrive className="h-4 w-4 text-purple-500" />
                              <span className="text-sm">
                                {selectedDeployment.resource_allocation.storage} MB Storage
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="monitoring" className="space-y-4">
                    {monitoring && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Health Score</p>
                                  <p className={`text-2xl font-bold ${getHealthScoreColor(monitoring.health_score)}`}>
                                    {monitoring.health_score}%
                                  </p>
                                </div>
                                <Activity className="h-8 w-8 text-blue-500" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Tasks Processed</p>
                                  <p className="text-2xl font-bold text-gray-900">
                                    {monitoring.performance_metrics.tasks_processed}
                                  </p>
                                </div>
                                <Server className="h-8 w-8 text-green-500" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                                  <p className="text-2xl font-bold text-gray-900">
                                    {monitoring.performance_metrics.success_rate.toFixed(1)}%
                                  </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-blue-500" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Error Count</p>
                                  <p className="text-2xl font-bold text-gray-900">
                                    {monitoring.performance_metrics.error_count}
                                  </p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-500" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle>Resource Usage</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>CPU Usage</span>
                                <span>{monitoring.resource_usage.cpu_percentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={monitoring.resource_usage.cpu_percentage} />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Memory Usage</span>
                                <span>{monitoring.resource_usage.memory_percentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={monitoring.resource_usage.memory_percentage} />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Storage Usage</span>
                                <span>{monitoring.resource_usage.storage_percentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={monitoring.resource_usage.storage_percentage} />
                            </div>
                          </CardContent>
                        </Card>

                        {monitoring.alerts.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                <span>Active Alerts</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {monitoring.alerts.map((alert) => (
                                <Alert key={alert.id}>
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-medium">{alert.message}</div>
                                        <div className="text-sm text-gray-600">
                                          {new Date(alert.triggered_at).toLocaleString()}
                                        </div>
                                      </div>
                                      <Badge
                                        className={
                                          alert.severity === 'critical'
                                            ? 'bg-red-100 text-red-800'
                                            : alert.severity === 'high'
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }
                                      >
                                        {alert.severity}
                                      </Badge>
                                    </div>
                                  </AlertDescription>
                                </Alert>
                              ))}
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="logs" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Deployment Logs</CardTitle>
                        <CardDescription>Recent deployment activity and events</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {selectedDeployment.deployment_logs.map((log) => (
                            <div
                              key={log.id}
                              className={`p-3 rounded border-l-4 ${
                                log.level === 'error'
                                  ? 'border-red-500 bg-red-50'
                                  : log.level === 'warning'
                                  ? 'border-yellow-500 bg-yellow-50'
                                  : 'border-blue-500 bg-blue-50'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium">{log.message}</div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </div>
                                </div>
                                <Badge
                                  className={
                                    log.level === 'error'
                                      ? 'bg-red-100 text-red-800'
                                      : log.level === 'warning'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }
                                >
                                  {log.level}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {selectedDeployment.deployment_logs.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              No logs available
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="configuration" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Deployment Configuration</CardTitle>
                        <CardDescription>Current deployment settings and parameters</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Auto Scaling</label>
                            <div className="mt-1 p-3 bg-gray-50 rounded border">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Enabled:</span>{' '}
                                  {selectedDeployment.auto_scaling.enabled ? 'Yes' : 'No'}
                                </div>
                                <div>
                                  <span className="font-medium">Min Instances:</span>{' '}
                                  {selectedDeployment.auto_scaling.min_instances}
                                </div>
                                <div>
                                  <span className="font-medium">Max Instances:</span>{' '}
                                  {selectedDeployment.auto_scaling.max_instances}
                                </div>
                                <div>
                                  <span className="font-medium">Target CPU:</span>{' '}
                                  {selectedDeployment.auto_scaling.target_cpu_utilization}%
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-500">Configuration</label>
                            <div className="mt-1 p-3 bg-gray-50 rounded border">
                              <pre className="text-sm overflow-x-auto">
                                {JSON.stringify(selectedDeployment.configuration, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500">
                      <Server className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Select a deployment to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <DeployAgentDialog
            open={showDeployDialog}
            onOpenChange={setShowDeployDialog}
            onSuccess={loadDeployments}
          />

          {selectedDeployment && (
            <ConfigureWorkflowDialog
              open={showConfigureDialog}
              onOpenChange={setShowConfigureDialog}
              deploymentId={selectedDeployment.id}
              onSuccess={() => {
                setShowConfigureDialog(false);
                loadDeployments();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
