import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
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

// Retrieves all skills for a specific agent with proficiency levels.
export const getAgentSkills = api<GetAgentSkillsRequest, GetAgentSkillsResponse>(
  { expose: true, method: "GET", path: "/agents/:agent_id/skills" },
  async (req) => {
    // Validate agent exists
    const agent = await coreDB.queryRow`
      SELECT id FROM agents WHERE id = ${req.agent_id}
    `;
    if (!agent) {
      throw APIError.notFound("agent not found");
    }

    const skills = await coreDB.queryAll<AgentSkill>`
      SELECT * FROM agent_skills 
      WHERE agent_id = ${req.agent_id}
      ORDER BY proficiency_level DESC, skill_name ASC
    `;

    const totalSkills = skills.length;
    const averageProficiency = totalSkills > 0 
      ? skills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / totalSkills 
      : 0;

    const skillCategories: Record<string, number> = {};
    skills.forEach(skill => {
      skillCategories[skill.skill_category] = (skillCategories[skill.skill_category] || 0) + 1;
    });

    return {
      skills,
      total_skills: totalSkills,
      average_proficiency: Math.round(averageProficiency * 10) / 10,
      skill_categories: skillCategories
    };
  }
);
