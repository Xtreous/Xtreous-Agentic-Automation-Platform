import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { PerformanceGap, SkillRecommendation } from "./types";

export interface AnalyzePerformanceGapsRequest {
  agent_id: number;
  task_id?: number;
}

export interface AnalyzePerformanceGapsResponse {
  gaps: PerformanceGap[];
  recommendations: SkillRecommendation[];
}

// Analyzes performance gaps and generates skill recommendations for an agent.
export const analyzePerformanceGaps = api<AnalyzePerformanceGapsRequest, AnalyzePerformanceGapsResponse>(
  { expose: true, method: "POST", path: "/agents/:agent_id/analyze-gaps" },
  async (req) => {
    // Validate agent exists
    const agent = await coreDB.queryRow`
      SELECT * FROM agents WHERE id = ${req.agent_id}
    `;
    if (!agent) {
      throw APIError.notFound("agent not found");
    }

    // Get agent's current skills
    const currentSkills = await coreDB.queryAll`
      SELECT skill_name, skill_category, proficiency_level 
      FROM agent_skills 
      WHERE agent_id = ${req.agent_id}
    `;

    const skillMap = new Map();
    currentSkills.forEach(skill => {
      skillMap.set(skill.skill_name, skill.proficiency_level);
    });

    // Analyze recent failed or low-performing tasks
    const recentTasks = await coreDB.queryAll`
      SELECT t.*, th.details, th.metadata
      FROM tasks t
      LEFT JOIN task_history th ON t.id = th.task_id AND th.action = 'failed'
      WHERE t.assigned_agent_id = ${req.agent_id}
      AND t.updated_at >= NOW() - INTERVAL '30 days'
      AND (t.status = 'failed' OR t.actual_duration > t.estimated_duration * 1.5)
      ORDER BY t.updated_at DESC
      LIMIT 20
    `;

    const gaps: PerformanceGap[] = [];
    const recommendations: SkillRecommendation[] = [];

    // Define skill requirements based on task patterns and industry
    const skillRequirements = {
      'construction': {
        'blueprint_analysis': 7,
        'cost_estimation': 6,
        'material_quantification': 6,
        'project_management': 5
      },
      'customer-service': {
        'communication': 8,
        'problem_solving': 7,
        'empathy': 6,
        'product_knowledge': 6
      },
      'finance': {
        'data_analysis': 8,
        'risk_assessment': 7,
        'compliance': 8,
        'financial_modeling': 6
      },
      'sales': {
        'lead_qualification': 7,
        'negotiation': 6,
        'relationship_building': 7,
        'market_analysis': 5
      }
    };

    const requiredSkills = skillRequirements[agent.industry] || {};

    // Identify gaps based on industry requirements
    for (const [skillName, requiredLevel] of Object.entries(requiredSkills)) {
      const currentLevel = skillMap.get(skillName) || 0;
      
      if (currentLevel < requiredLevel) {
        const gap = {
          agent_id: req.agent_id,
          gap_type: 'industry_requirement',
          required_skill: skillName,
          current_level: currentLevel,
          required_level: requiredLevel,
          impact_score: (requiredLevel - currentLevel) / requiredLevel,
          identified_at: new Date()
        };

        // Insert gap into database
        const insertedGap = await coreDB.queryRow<PerformanceGap>`
          INSERT INTO performance_gaps (
            agent_id, gap_type, required_skill, current_level, 
            required_level, impact_score
          )
          VALUES (
            ${gap.agent_id}, ${gap.gap_type}, ${gap.required_skill},
            ${gap.current_level}, ${gap.required_level}, ${gap.impact_score}
          )
          RETURNING *
        `;

        if (insertedGap) {
          gaps.push(insertedGap);
        }

        // Create recommendation
        const priority = requiredLevel - currentLevel > 3 ? 5 : 
                        requiredLevel - currentLevel > 2 ? 4 :
                        requiredLevel - currentLevel > 1 ? 3 : 2;

        // Find suitable training modules
        const trainingModules = await coreDB.queryAll`
          SELECT id FROM training_modules 
          WHERE target_skill = ${skillName} 
          AND status = 'active'
          AND difficulty_level <= ${Math.min(currentLevel + 2, 10)}
          ORDER BY difficulty_level ASC
          LIMIT 3
        `;

        const moduleIds = trainingModules.map(m => m.id);

        const recommendation = await coreDB.queryRow<SkillRecommendation>`
          INSERT INTO skill_recommendations (
            agent_id, recommended_skill, skill_category, reason, priority,
            based_on_performance_gap, suggested_training_modules
          )
          VALUES (
            ${req.agent_id}, ${skillName}, 
            ${skillName.split('_')[0]}, 
            ${`Required for ${agent.industry} industry performance`},
            ${priority}, true, ${moduleIds}
          )
          RETURNING *
        `;

        if (recommendation) {
          recommendation.suggested_training_modules = typeof recommendation.suggested_training_modules === 'string'
            ? JSON.parse(recommendation.suggested_training_modules)
            : recommendation.suggested_training_modules;
          recommendations.push(recommendation);
        }
      }
    }

    // Analyze task-specific gaps if task_id provided
    if (req.task_id) {
      const task = await coreDB.queryRow`
        SELECT * FROM tasks WHERE id = ${req.task_id}
      `;

      if (task && task.context) {
        const context = typeof task.context === 'string' ? JSON.parse(task.context) : task.context;
        const requirements = context.requirements || [];

        for (const requirement of requirements) {
          const skillName = requirement.toLowerCase().replace(/\s+/g, '_');
          const currentLevel = skillMap.get(skillName) || 0;
          const requiredLevel = 5; // Default required level for task requirements

          if (currentLevel < requiredLevel) {
            const gap = await coreDB.queryRow<PerformanceGap>`
              INSERT INTO performance_gaps (
                agent_id, task_id, gap_type, required_skill, 
                current_level, required_level, impact_score
              )
              VALUES (
                ${req.agent_id}, ${req.task_id}, 'task_requirement', ${skillName},
                ${currentLevel}, ${requiredLevel}, ${(requiredLevel - currentLevel) / requiredLevel}
              )
              RETURNING *
            `;

            if (gap) {
              gaps.push(gap);
            }
          }
        }
      }
    }

    return { gaps, recommendations };
  }
);
