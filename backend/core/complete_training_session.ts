import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { AgentTrainingSession } from "./types";

export interface CompleteTrainingSessionRequest {
  session_id: number;
  score: number;
  feedback?: Record<string, any>;
}

// Completes a training session and updates agent skills.
export const completeTrainingSession = api<CompleteTrainingSessionRequest, AgentTrainingSession>(
  { expose: true, method: "POST", path: "/training/sessions/:session_id/complete" },
  async (req) => {
    // Get the training session
    const session = await coreDB.queryRow`
      SELECT ts.*, tm.target_skill, tm.skill_category, tm.difficulty_level
      FROM agent_training_sessions ts
      JOIN training_modules tm ON ts.training_module_id = tm.id
      WHERE ts.id = ${req.session_id} AND ts.status = 'in_progress'
    `;

    if (!session) {
      throw APIError.notFound("active training session not found");
    }

    const completedAt = new Date();
    const durationMinutes = Math.round((completedAt.getTime() - new Date(session.started_at).getTime()) / (1000 * 60));
    const status = req.score >= 70 ? 'completed' : 'failed';

    // Update the training session
    const updatedSession = await coreDB.queryRow<AgentTrainingSession>`
      UPDATE agent_training_sessions SET
        status = ${status},
        progress_percentage = 100,
        score = ${req.score},
        feedback = ${JSON.stringify(req.feedback || {})},
        completed_at = ${completedAt},
        duration_minutes = ${durationMinutes}
      WHERE id = ${req.session_id}
      RETURNING *
    `;

    if (!updatedSession) {
      throw APIError.internal("failed to update training session");
    }

    // If training was successful, update or create agent skill
    if (status === 'completed') {
      const experienceGained = Math.round(req.score * session.difficulty_level * 10);
      
      // Check if agent already has this skill
      const existingSkill = await coreDB.queryRow`
        SELECT * FROM agent_skills 
        WHERE agent_id = ${session.agent_id} AND skill_name = ${session.target_skill}
      `;

      if (existingSkill) {
        // Update existing skill
        const newExperience = existingSkill.experience_points + experienceGained;
        const newLevel = Math.min(10, Math.floor(newExperience / 1000) + 1);
        
        await coreDB.exec`
          UPDATE agent_skills SET
            proficiency_level = ${newLevel},
            experience_points = ${newExperience},
            updated_at = NOW()
          WHERE id = ${existingSkill.id}
        `;
      } else {
        // Create new skill
        const initialLevel = Math.min(3, Math.floor(experienceGained / 1000) + 1);
        
        await coreDB.exec`
          INSERT INTO agent_skills (
            agent_id, skill_name, skill_category, proficiency_level, experience_points
          )
          VALUES (
            ${session.agent_id}, ${session.target_skill}, ${session.skill_category},
            ${initialLevel}, ${experienceGained}
          )
        `;
      }

      // Update agent stats
      await coreDB.exec`
        UPDATE agents SET
          total_training_hours = total_training_hours + ${Math.round(durationMinutes / 60)},
          skill_points = skill_points + ${Math.round(experienceGained / 10)},
          updated_at = NOW()
        WHERE id = ${session.agent_id}
      `;
    }

    // Parse feedback JSON
    updatedSession.feedback = typeof updatedSession.feedback === 'string' 
      ? JSON.parse(updatedSession.feedback) 
      : updatedSession.feedback;

    return updatedSession;
  }
);
