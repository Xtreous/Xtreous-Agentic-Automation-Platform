import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Award, BookOpen } from 'lucide-react';
import backend from '~backend/client';

interface AgentSkillsCardProps {
  agentId: number;
}

export default function AgentSkillsCard({ agentId }: AgentSkillsCardProps) {
  const { data: skillsData, isLoading } = useQuery({
    queryKey: ['agent-skills', agentId],
    queryFn: () => backend.core.getAgentSkills({ agent_id: agentId })
  });

  const { data: recommendationsData } = useQuery({
    queryKey: ['skill-recommendations', agentId],
    queryFn: () => backend.core.getSkillRecommendations({ agent_id: agentId, status: 'pending' })
  });

  const getSkillLevelColor = (level: number) => {
    if (level >= 8) return 'text-green-300 bg-green-900/50';
    if (level >= 6) return 'text-blue-300 bg-blue-900/50';
    if (level >= 4) return 'text-yellow-300 bg-yellow-900/50';
    return 'text-red-300 bg-red-900/50';
  };

  const getSkillLevelLabel = (level: number) => {
    if (level >= 8) return 'Expert';
    if (level >= 6) return 'Advanced';
    if (level >= 4) return 'Intermediate';
    if (level >= 2) return 'Beginner';
    return 'Novice';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Skills & Learning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Skills & Learning
        </CardTitle>
        <CardDescription>
          Current skills and learning recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills Overview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {skillsData?.total_skills || 0}
            </div>
            <div className="text-sm text-gray-400">Total Skills</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {skillsData?.average_proficiency.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-gray-400">Avg. Level</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {recommendationsData?.total || 0}
            </div>
            <div className="text-sm text-gray-400">Recommendations</div>
          </div>
        </div>

        {/* Top Skills */}
        {skillsData?.skills && skillsData.skills.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-100 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Top Skills
            </h4>
            <div className="space-y-3">
              {skillsData.skills.slice(0, 5).map((skill) => (
                <div key={skill.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {skill.skill_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <Badge className={`text-xs ${getSkillLevelColor(skill.proficiency_level)}`}>
                        {getSkillLevelLabel(skill.proficiency_level)}
                      </Badge>
                    </div>
                    <Progress value={skill.proficiency_level * 10} className="h-2" />
                  </div>
                  <div className="text-sm text-gray-400 ml-3">
                    L{skill.proficiency_level}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Categories */}
        {skillsData?.skill_categories && Object.keys(skillsData.skill_categories).length > 0 && (
          <div>
            <h4 className="font-medium text-gray-100 mb-3">Skill Categories</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(skillsData.skill_categories).map(([category, count]) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Learning Recommendations */}
        {recommendationsData?.recommendations && recommendationsData.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-100 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Learning Recommendations
            </h4>
            <div className="space-y-2">
              {recommendationsData.recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3 bg-blue-900/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-blue-200">
                      {rec.recommended_skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Priority {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-blue-300">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            View Training
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analyze Gaps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
