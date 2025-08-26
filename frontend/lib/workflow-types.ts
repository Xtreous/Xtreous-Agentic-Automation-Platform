export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: (Condition | ConditionGroup)[];
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'action' | 'condition' | 'integration' | 'delay' | 'end';
  name: string;
  description?: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  connections: string[];
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  condition?: string;
  label?: string;
}
