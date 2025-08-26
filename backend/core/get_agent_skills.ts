import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "./cache";
import type { AgentSkill } from "./types";

export interface GetAgentSkillsRequest {
  agent_id: number;
}

export interface GetAgentSkillsResponse {
  skills: AgentSkill[];
  total_skills: number;
  average_proficiency: number;
  skill_categories: Record<string, number>;
}

// Retrieves all skills for a specific agent with proficiency levels and caching.
export const getAgentSkills = api<GetAgentSkillsRequest, GetAgentSkillsResponse>(
  { expose: true, method: "GET", path: "/agents/:agent_id/skills" },
  async (req) => {
    const cacheKey = CACHE_KEYS.AGENT_SKILLS(req.agent_id);
    
    // Try to get from cache first
    const cached = await getCached<GetAgentSkillsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Validate agent exists (with optimized query)
    const agent = await coreDB.queryRow`
      SELECT id FROM agents WHERE id = ${req.agent_id}
    `;
    if (!agent) {
      throw APIError.notFound("agent not found");
    }

    // Optimized query with proper indexing
    const skills = await coreDB.queryAll<AgentSkill>`
      SELECT 
        id, agent_id, skill_name, skill_category, proficiency_level,
        experience_points, last_used, acquired_at, updated_at
      FROM agent_skills 
      WHERE agent_id = ${req.agent_id}
      ORDER BY proficiency_level DESC, skill_name ASC
    `;

    const totalSkills = skills.length;
    const averageProficiency = totalSkills > 0 
      ? skills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / totalSkills 
      : 0;

    // Calculate skill categories efficiently
    const skillCategories: Record<string, number> = {};
    skills.forEach(skill => {
      skillCategories[skill.skill_category] = (skillCategories[skill.skill_category] || 0) + 1;
    });

    const response: GetAgentSkillsResponse = {
      skills,
      total_skills: totalSkills,
      average_proficiency: Math.round(averageProficiency * 10) / 10,
      skill_categories: skillCategories
    };

    // Cache the response
    await setCached(cacheKey, response, CACHE_TTL.AGENT_SKILLS);

    return response;
  }
);
