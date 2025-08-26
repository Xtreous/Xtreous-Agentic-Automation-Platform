import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Settings, 
  GitBranch, 
  Clock, 
  Database, 
  Mail, 
  MessageSquare,
  FileText,
  Calculator,
  Zap,
  ArrowRight,
  ArrowDown,
  Copy,
  Save,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'start' | 'action' | 'condition' | 'integration' | 'delay' | 'end';
  name: string;
  description?: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  connections: string[];
}

interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  condition?: string;
  label?: string;
}

interface WorkflowBuilderProps {
  initialWorkflow?: {
    id?: number;
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
  };
  onSave: (workflow: any) => void;
  onTest?: (workflow: any) => void;
}

const nodeTypes = [
  {
    type: 'action',
    name: 'Action',
    icon: Zap,
    description: 'Perform an action or task',
    color: 'bg-blue-900/50 text-blue-300 border-blue-700'
  },
  {
    type: 'condition',
    name: 'Condition',
    icon: GitBranch,
    description: 'Branch based on conditions',
    color: 'bg-yellow-900/50 text-yellow-300 border-yellow-700'
  },
  {
    type: 'integration',
    name: 'Integration',
    icon: Database,
    description: 'Connect to external services',
    color: 'bg-green-900/50 text-green-300 border-green-700'
  },
  {
    type: 'delay',
    name: 'Delay',
    icon: Clock,
    description: 'Wait for a specified time',
    color: 'bg-purple-900/50 text-purple-300 border-purple-700'
  }
];

const integrationTypes = [
  { id: 'email', name: 'Email', icon: Mail },
  { id: 'slack', name: 'Slack', icon: MessageSquare },
  { id: 'webhook', name: 'Webhook', icon: Zap },
  { id: 'database', name: 'Database', icon: Database },
  { id: 'file', name: 'File System', icon: FileText },
  { id: 'api', name: 'REST API', icon: ArrowRight }
];

export default function WorkflowBuilder({ initialWorkflow, onSave, onTest }: WorkflowBuilderProps) {
  const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || '');
  const [workflowDescription, setWorkflowDescription] = useState(initialWorkflow?.description || '');
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialWorkflow?.nodes || [
    {
      id: 'start',
      type: 'start',
      name: 'Start',
      position: { x: 100, y: 100 },
      config: {},
      connections: []
    }
  ]);
  const [connections, setConnections] = useState<WorkflowConnection[]>(initialWorkflow?.connections || []);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: type as any,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodes.length}`,
      position,
      config: {},
      connections: []
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
    setShowNodePanel(false);
  }, [nodes.length]);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedNode]);

  const deleteNode = useCallback((nodeId: string) => {
    if (nodeId === 'start') return; // Can't delete start node
    
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => conn.from !== nodeId && conn.to !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const addConnection = useCallback((fromId: string, toId: string, condition?: string) => {
    const newConnection: WorkflowConnection = {
      id: `conn_${Date.now()}`,
      from: fromId,
      to: toId,
      condition,
      label: condition || ''
    };

    setConnections(prev => [...prev, newConnection]);
    
    // Update the from node's connections
    setNodes(prev => prev.map(node => 
      node.id === fromId 
        ? { ...node, connections: [...node.connections, toId] }
        : node
    ));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (isConnecting) {
      if (connectionStart && connectionStart !== nodeId) {
        addConnection(connectionStart, nodeId);
        setIsConnecting(false);
        setConnectionStart(null);
      } else {
        setConnectionStart(nodeId);
      }
      return;
    }

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggedNode(nodeId);
    setSelectedNode(node);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [isConnecting, connectionStart, nodes, addConnection]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newPosition = {
      x: e.clientX - canvasRect.left - dragOffset.x,
      y: e.clientY - canvasRect.top - dragOffset.y
    };

    updateNode(draggedNode, { position: newPosition });
  }, [draggedNode, dragOffset, updateNode]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null);
      if (isConnecting) {
        setIsConnecting(false);
        setConnectionStart(null);
      }
    }
  }, [isConnecting]);

  const handleSave = useCallback(() => {
    const workflow = {
      name: workflowName,
      description: workflowDescription,
      nodes,
      connections
    };
    onSave(workflow);
  }, [workflowName, workflowDescription, nodes, connections, onSave]);

  const handleTest = useCallback(() => {
    if (onTest) {
      const workflow = {
        name: workflowName,
        description: workflowDescription,
        nodes,
        connections
      };
      onTest(workflow);
    }
  }, [workflowName, workflowDescription, nodes, connections, onTest]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start': return Play;
      case 'end': return Square;
      case 'action': return Zap;
      case 'condition': return GitBranch;
      case 'integration': return Database;
      case 'delay': return Clock;
      default: return Zap;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'end': return 'bg-red-900/50 text-red-300 border-red-700';
      case 'action': return 'bg-blue-900/50 text-blue-300 border-blue-700';
      case 'condition': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'integration': return 'bg-purple-900/50 text-purple-300 border-purple-700';
      case 'delay': return 'bg-orange-900/50 text-orange-300 border-orange-700';
      default: return 'bg-gray-700 text-gray-200 border-gray-600';
    }
  };

  const renderConnection = (connection: WorkflowConnection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return null;

    const fromX = fromNode.position.x + 100; // Node width / 2
    const fromY = fromNode.position.y + 40; // Node height / 2
    const toX = toNode.position.x + 100;
    const toY = toNode.position.y + 40;

    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;

    return (
      <g key={connection.id}>
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke="#9ca3af"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        {connection.label && (
          <text
            x={midX}
            y={midY - 5}
            textAnchor="middle"
            className="text-xs fill-gray-400"
            style={{ fontSize: '12px' }}
          >
            {connection.label}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="h-full flex">
      {/* Toolbar */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-semibold text-gray-100 mb-4">Workflow Builder</h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="workflow-name">Name</Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
              />
            </div>
            
            <div>
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Describe your workflow"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-100">Actions</h4>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsConnecting(!isConnecting)}
                className={isConnecting ? 'bg-blue-900/30 border-blue-700' : ''}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4">
            <Button size="sm" onClick={handleSave} disabled={!workflowName}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            {onTest && (
              <Button size="sm" variant="outline" onClick={handleTest}>
                <Play className="h-4 w-4 mr-2" />
                Test
              </Button>
            )}
          </div>

          {isConnecting && (
            <div className="p-2 bg-blue-900/30 border border-blue-800 rounded text-sm text-blue-200">
              Click on nodes to connect them
            </div>
          )}
        </div>

        <div className="flex-1 p-4">
          <h4 className="font-medium text-gray-100 mb-3">Add Nodes</h4>
          <div className="space-y-2">
            {nodeTypes.map((nodeType) => {
              const Icon = nodeType.icon;
              return (
                <div
                  key={nodeType.type}
                  className={`p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-800 ${nodeType.color}`}
                  onClick={() => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const rect = canvas.getBoundingClientRect();
                      addNode(nodeType.type, { 
                        x: Math.random() * (rect.width - 200) + 100, 
                        y: Math.random() * (rect.height - 200) + 100 
                      });
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium text-sm">{nodeType.name}</div>
                      <div className="text-xs opacity-75">{nodeType.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <div
          ref={canvasRef}
          className="w-full h-full bg-gray-800 relative overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
        >
          {/* Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="1"/>
              </pattern>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Render connections */}
            {connections.map(renderConnection)}
          </svg>

          {/* Render nodes */}
          {nodes.map((node) => {
            const Icon = getNodeIcon(node.type);
            const isSelected = selectedNode?.id === node.id;
            const isConnecting = connectionStart === node.id;
            
            return (
              <div
                key={node.id}
                className={`absolute w-48 cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                } ${isConnecting ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  zIndex: isSelected ? 10 : 1
                }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
              >
                <Card className={`border-2 ${getNodeColor(node.type)}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{node.name}</span>
                      </div>
                      {node.type !== 'start' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNode(node.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-red-900/30"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {node.description && (
                      <p className="text-xs opacity-75">{node.description}</p>
                    )}
                    {node.connections.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {node.connections.map((connId, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            →
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="w-80 bg-gray-900 border-l border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-100">Node Properties</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedNode(null)}
            >
              ×
            </Button>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div>
                <Label htmlFor="node-name">Name</Label>
                <Input
                  id="node-name"
                  value={selectedNode.name}
                  onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="node-description">Description</Label>
                <Textarea
                  id="node-description"
                  value={selectedNode.description || ''}
                  onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Type</Label>
                <div className={`p-2 rounded border ${getNodeColor(selectedNode.type)}`}>
                  {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              {selectedNode.type === 'action' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="action-type">Action Type</Label>
                    <Select
                      value={selectedNode.config.actionType || ''}
                      onValueChange={(value) => updateNode(selectedNode.id, {
                        config: { ...selectedNode.config, actionType: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="data_processing">Data Processing</SelectItem>
                        <SelectItem value="notification">Send Notification</SelectItem>
                        <SelectItem value="calculation">Calculation</SelectItem>
                        <SelectItem value="validation">Validation</SelectItem>
                        <SelectItem value="transformation">Data Transformation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="action-params">Parameters (JSON)</Label>
                    <Textarea
                      id="action-params"
                      value={selectedNode.config.parameters || '{}'}
                      onChange={(e) => updateNode(selectedNode.id, {
                        config: { ...selectedNode.config, parameters: e.target.value }
                      })}
                      placeholder='{"key": "value"}'
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'condition' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="condition-field">Field to Check</Label>
                    <Input
                      id="condition-field"
                      value={selectedNode.config.field || ''}
                      onChange={(e) => updateNode(selectedNode.id, {
                        config: { ...selectedNode.config, field: e.target.value }
                      })}
                      placeholder="e.g., status, amount, priority"
                    />
                  </div>

                  <div>
                    <Label htmlFor="condition-operator">Operator</Label>
                    <Select
                      value={selectedNode.config.operator || ''}
                      onValueChange={(value) => updateNode(selectedNode.id, {
                        config: { ...selectedNode.config, operator: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Not Equals</SelectItem>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="starts_with">Starts With</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="condition-value">Value</Label>
                    <Input
                      id="condition-value"
                      value={selectedNode.config.value || ''}
                      onChange={(e) => updateNode(selectedNode.id, {
                        config: { ...selectedNode.config, value: e.target.value }
                      })}
                      placeholder="Comparison value"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'integration' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="integration-type">Integration Type</Label>
                    <Select
                      value={selectedNode.config.integrationType || ''}
                      onValueChange={(value) => updateNode(selectedNode.id, {
                        config: { ...selectedNode.config, integrationType: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select integration" />
                      </SelectTrigger>
                      <SelectContent>
                        {integrationTypes.map((integration) => (
                          <SelectItem key={integration.id} value={integration.id}>
                            {integration.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="integration-config">Configuration</Label>
                    <Textarea
                      id="integration-config"
                      value={selectedNode.config.integrationConfig || '{}'}
                      onChange={(e) => updateNode(selectedNode.id, {
                        config: { ...selectedNode.config, integrationConfig: e.target.value }
                      })}
                      placeholder='{"endpoint": "https://api.example.com"}'
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'delay' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="delay-duration">Duration</Label>
                    <Input
                      id="delay-duration"
                      type="number"
                      value={selectedNode.config.duration || ''}
                      onChange={(e) => updateNode(selectedNode.id, {
                        config: { ...selectedNode.config, duration: parseInt(e.target.value) }
                      })}
                      placeholder="Duration in seconds"
                    />
                  </div>

                  <div>
                    <Label htmlFor="delay-unit">Unit</Label>
                    <Select
                      value={selectedNode.config.unit || 'seconds'}
                      onValueChange={(value) => updateNode(selectedNode.id, {
                        config: { ...selectedNode.config, unit: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seconds">Seconds</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
