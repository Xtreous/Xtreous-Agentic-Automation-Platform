import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { AgentTrainingSession } from "./types";

export interface StartTrainingSessionRequest {
  agent_id: number;
  training_module_id: number;
}

// Starts a new training session for an agent.
export const startTrainingSession = api<StartTrainingSessionRequest, AgentTrainingSession>(
  { expose: true, method: "POST", path: "/training/sessions" },
  async (req) => {
    // Validate agent exists
    const agent = await coreDB.queryRow`
      SELECT id FROM agents WHERE id = ${req.agent_id}
    `;
    if (!agent) {
      throw APIError.notFound("agent not found");
    }

    // Validate training module exists and is active
    const module = await coreDB.queryRow`
      SELECT * FROM training_modules 
      WHERE id = ${req.training_module_id} AND status = 'active'
    `;
    if (!module) {
      throw APIError.notFound("active training module not found");
    }

    // Check if agent already has an active session for this module
    const existingSession = await coreDB.queryRow`
      SELECT id FROM agent_training_sessions 
      WHERE agent_id = ${req.agent_id} 
      AND training_module_id = ${req.training_module_id}
      AND status = 'in_progress'
    `;
    if (existingSession) {
      throw APIError.alreadyExists("agent already has an active training session for this module");
    }

    // Check prerequisites
    const prerequisites = Array.isArray(module.prerequisites) 
      ? module.prerequisites 
      : JSON.parse(module.prerequisites || '[]');

    if (prerequisites.length > 0) {
      for (const prerequisite of prerequisites) {
        const hasSkill = await coreDB.queryRow`
          SELECT id FROM agent_skills 
          WHERE agent_id = ${req.agent_id} 
          AND skill_name = ${prerequisite}
          AND proficiency_level >= 3
        `;
        if (!hasSkill) {
          throw APIError.failedPrecondition(`agent lacks prerequisite skill: ${prerequisite}`);
        }
      }
    }

    const session = await coreDB.queryRow<AgentTrainingSession>`
      INSERT INTO agent_training_sessions (agent_id, training_module_id)
      VALUES (${req.agent_id}, ${req.training_module_id})
      RETURNING *
    `;

    if (!session) {
      throw APIError.internal("failed to create training session");
    }

    // Parse feedback JSON
    session.feedback = typeof session.feedback === 'string' 
      ? JSON.parse(session.feedback) 
      : session.feedback;

    return session;
  }
);
