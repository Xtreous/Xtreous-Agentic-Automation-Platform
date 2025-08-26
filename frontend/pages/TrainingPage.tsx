import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Brain, 
  Clock, 
  Target, 
  TrendingUp,
  Award,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import backend from '~backend/client';
import type { TrainingModule } from '~backend/core/types';
import CreateTrainingModuleDialog from '../components/CreateTrainingModuleDialog';

export default function TrainingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: modulesData, isLoading, refetch } = useQuery({
    queryKey: ['training-modules', categoryFilter, difficultyFilter],
    queryFn: () => backend.core.listTrainingModules({
      skill_category: categoryFilter || undefined,
      difficulty_level: difficultyFilter ? parseInt(difficultyFilter) : undefined,
      limit: 100
    })
  });

  const filteredModules = modulesData?.modules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.target_skill.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return 'bg-green-100 text-green-800';
    if (level <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 3) return 'Beginner';
    if (level <= 6) return 'Intermediate';
    return 'Advanced';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Training & Learning</h1>
              <p className="text-gray-600 mt-2">
                Manage training modules and track agent skill development
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Module
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Modules
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modulesData?.total || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                Available training modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Skill Categories
              </CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(filteredModules.map(m => m.skill_category)).size}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Different skill areas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg. Duration
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredModules.length > 0 
                  ? Math.round(filteredModules.reduce((sum, m) => sum + m.estimated_duration, 0) / filteredModules.length)
                  : 0}m
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Average training time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Sessions
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-600 mt-1">
                Currently in progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="data_analysis">Data Analysis</SelectItem>
              <SelectItem value="problem_solving">Problem Solving</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="industry_specific">Industry Specific</SelectItem>
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Difficulties</SelectItem>
              <SelectItem value="1">Beginner (1-3)</SelectItem>
              <SelectItem value="4">Intermediate (4-6)</SelectItem>
              <SelectItem value="7">Advanced (7-10)</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-600 flex items-center">
            Showing: {filteredModules.length} modules
          </div>
        </div>

        {/* Training Modules Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Brain className="h-8 w-8 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <CardDescription className="capitalize">
                          {module.skill_category.replace('_', ' ')}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(module.difficulty_level)}>
                      {getDifficultyLabel(module.difficulty_level)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {module.description || 'No description available'}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Target Skill</span>
                      <Badge variant="outline" className="text-xs">
                        {module.target_skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Duration</span>
                      <span className="text-sm font-medium flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(module.estimated_duration)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Difficulty</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={module.difficulty_level * 10} className="w-16 h-2" />
                        <span className="text-sm font-medium">{module.difficulty_level}/10</span>
                      </div>
                    </div>

                    {module.prerequisites && module.prerequisites.length > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-500">Prerequisites:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {module.prerequisites.slice(0, 2).map((prereq, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {prereq}
                            </Badge>
                          ))}
                          {module.prerequisites.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{module.prerequisites.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredModules.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No training modules found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter || difficultyFilter
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first training module.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Module
            </Button>
          </div>
        )}
      </div>

      <CreateTrainingModuleDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
}
