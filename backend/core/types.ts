export type AgentType = "conversational" | "analytical" | "automation" | "coordinator";
export type AgentStatus = "active" | "training" | "inactive";
export type Industry = "construction" | "customer-service" | "finance" | "sales";

export interface Agent {
  id: number;
  name: string;
  description?: string;
  type: AgentType;
  industry: Industry;
  status: AgentStatus;
  accuracy_rate: number;
  tasks_completed: number;
  created_at: Date;
  updated_at: Date;
  capabilities: string[];
  max_concurrent_tasks: number;
  learning_rate: number;
  total_training_hours: number;
  skill_points: number;
}

export interface Integration {
  id: number;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  config: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  status: "active" | "inactive" | "draft";
  trigger_type: "manual" | "scheduled" | "event";
  steps: WorkflowStep[];
  created_at: Date;
  updated_at: Date;
}

export interface WorkflowStep {
  id: number;
  name: string;
  type: "agent" | "integration" | "condition" | "delay";
  config: Record<string, any>;
  order: number;
}

export interface WorkflowExecution {
  id: number;
  workflow_id: number;
  status: "running" | "completed" | "failed" | "cancelled";
  started_at: Date;
  completed_at?: Date;
  error_message?: string;
  step_results: WorkflowStepResult[];
}

export interface WorkflowStepResult {
  step_id: number;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  started_at?: Date;
  completed_at?: Date;
  output?: Record<string, any>;
  error_message?: string;
}

export interface AgentPerformance {
  agent_id: number;
  period_start: Date;
  period_end: Date;
  tasks_completed: number;
  tasks_failed: number;
  average_completion_time: number;
  accuracy_rate: number;
  efficiency_score: number;
  collaboration_count: number;
  handoffs_given: number;
  handoffs_received: number;
}

export type TaskStatus = "pending" | "in_progress" | "completed" | "failed" | "handed_off";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_agent_id?: number;
  workflow_id?: string;
  parent_task_id?: number;
  context: TaskContext;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  estimated_duration?: number;
  actual_duration?: number;
}

export interface TaskContext {
  data: Record<string, any>;
  history: TaskHistoryEntry[];
  requirements: string[];
  constraints: string[];
  dependencies: string[];
}

export interface TaskHistoryEntry {
  id: number;
  task_id: number;
  agent_id?: number;
  action: "created" | "assigned" | "started" | "updated" | "completed" | "failed" | "handed_off";
  details: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface AgentCollaboration {
  id: number;
  name: string;
  description?: string;
  participating_agents: number[];
  coordinator_agent_id?: number;
  status: "active" | "paused" | "completed";
  shared_context: Record<string, any>;
  communication_log: CollaborationMessage[];
  created_at: Date;
  updated_at: Date;
  user_id?: number;
  organization_id?: number;
}

export interface CollaborationMessage {
  id: number;
  collaboration_id: number;
  from_agent_id: number;
  to_agent_id?: number;
  message_type: "handoff" | "request" | "response" | "update" | "question";
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface TaskHandoff {
  id: number;
  task_id: number;
  from_agent_id: number;
  to_agent_id: number;
  reason: string;
  context_transfer: Record<string, any>;
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: Date;
  completed_at?: Date;
}

export interface AgentCapability {
  name: string;
  description: string;
  input_types: string[];
  output_types: string[];
  complexity_level: number;
  estimated_duration: number;
}

export interface AgentSkill {
  id: number;
  agent_id: number;
  skill_name: string;
  skill_category: string;
  proficiency_level: number;
  experience_points: number;
  last_used?: Date;
  acquired_at: Date;
  updated_at: Date;
}

export interface TrainingModule {
  id: number;
  name: string;
  description?: string;
  skill_category: string;
  target_skill: string;
  difficulty_level: number;
  prerequisites: string[];
  content: Record<string, any>;
  estimated_duration: number;
  success_criteria: Record<string, any>;
  created_by?: string;
  status: "active" | "inactive" | "draft";
  created_at: Date;
  updated_at: Date;
}

export interface AgentTrainingSession {
  id: number;
  agent_id: number;
  training_module_id: number;
  status: "in_progress" | "completed" | "failed" | "cancelled";
  progress_percentage: number;
  score?: number;
  feedback: Record<string, any>;
  started_at: Date;
  completed_at?: Date;
  duration_minutes?: number;
}

export interface SkillRecommendation {
  id: number;
  agent_id: number;
  recommended_skill: string;
  skill_category: string;
  reason: string;
  priority: number;
  based_on_task_id?: number;
  based_on_performance_gap: boolean;
  suggested_training_modules: number[];
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: Date;
  reviewed_at?: Date;
}

export interface PerformanceGap {
  id: number;
  agent_id: number;
  task_id?: number;
  gap_type: string;
  required_skill: string;
  current_level: number;
  required_level: number;
  impact_score: number;
  identified_at: Date;
}
