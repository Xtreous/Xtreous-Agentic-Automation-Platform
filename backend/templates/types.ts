export interface AgentTemplate {
  id: number;
  name: string;
  description: string;
  type: string;
  industry: string;
  base_configuration: Record<string, any>;
  capabilities: string[];
  suggested_use_cases: string[];
  icon: string;
  version: string;
}
