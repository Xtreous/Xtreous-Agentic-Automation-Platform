import { api } from "encore.dev/api";
import { coreDB } from "./db";
import type { TrainingModule } from "./types";

export interface CreateTrainingModuleRequest {
  name: string;
  description?: string;
  skill_category: string;
  target_skill: string;
  difficulty_level: number;
  prerequisites?: string[];
  content: Record<string, any>;
  estimated_duration: number;
  success_criteria: Record<string, any>;
  created_by?: string;
}

// Creates a new training module for agent skill development.
export const createTrainingModule = api<CreateTrainingModuleRequest, TrainingModule>(
  { expose: true, method: "POST", path: "/training/modules" },
  async (req) => {
    const module = await coreDB.queryRow<TrainingModule>`
      INSERT INTO training_modules (
        name, description, skill_category, target_skill, difficulty_level,
        prerequisites, content, estimated_duration, success_criteria, created_by
      )
      VALUES (
        ${req.name}, ${req.description}, ${req.skill_category}, ${req.target_skill},
        ${req.difficulty_level}, ${JSON.stringify(req.prerequisites || [])},
        ${JSON.stringify(req.content)}, ${req.estimated_duration},
        ${JSON.stringify(req.success_criteria)}, ${req.created_by}
      )
      RETURNING *
    `;

    if (!module) {
      throw new Error("Failed to create training module");
    }

    // Parse JSON fields
    module.prerequisites = typeof module.prerequisites === 'string' 
      ? JSON.parse(module.prerequisites) 
      : module.prerequisites;
    module.content = typeof module.content === 'string' 
      ? JSON.parse(module.content) 
      : module.content;
    module.success_criteria = typeof module.success_criteria === 'string' 
      ? JSON.parse(module.success_criteria) 
      : module.success_criteria;

    return module;
  }
);
