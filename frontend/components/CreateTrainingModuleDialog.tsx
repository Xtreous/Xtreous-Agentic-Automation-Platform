import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { X, Plus } from 'lucide-react';
import backend from '~backend/client';

interface CreateTrainingModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateTrainingModuleDialog({ open, onOpenChange, onSuccess }: CreateTrainingModuleDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [skillCategory, setSkillCategory] = useState('');
  const [targetSkill, setTargetSkill] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('60');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const skillCategories = [
    'communication',
    'data_analysis',
    'problem_solving',
    'technical',
    'creative',
    'management',
    'industry_specific'
  ];

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !prerequisites.includes(newPrerequisite.trim())) {
      setPrerequisites([...prerequisites, newPrerequisite.trim()]);
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (prerequisite: string) => {
    setPrerequisites(prerequisites.filter(p => p !== prerequisite));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !skillCategory || !targetSkill.trim()) return;

    setIsSubmitting(true);
    try {
      await backend.core.createTrainingModule({
        name: name.trim(),
        description: description.trim() || undefined,
        skill_category: skillCategory,
        target_skill: targetSkill.trim(),
        difficulty_level: difficultyLevel,
        prerequisites,
        content: {
          type: 'interactive',
          modules: [],
          assessments: []
        },
        estimated_duration: parseInt(estimatedDuration),
        success_criteria: {
          minimum_score: 70,
          required_completion: 100
        }
      });

      toast({
        title: "Training module created",
        description: "The training module has been created successfully.",
      });

      // Reset form
      setName('');
      setDescription('');
      setSkillCategory('');
      setTargetSkill('');
      setDifficultyLevel(1);
      setPrerequisites([]);
      setEstimatedDuration('60');
      
      onSuccess();
    } catch (error) {
      console.error('Failed to create training module:', error);
      toast({
        title: "Error",
        description: "Failed to create training module. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Training Module</DialogTitle>
          <DialogDescription>
            Design a new training module to help agents develop specific skills.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Module Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Advanced Blueprint Analysis"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this training module covers"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="skillCategory">Skill Category *</Label>
                <Select value={skillCategory} onValueChange={setSkillCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="targetSkill">Target Skill *</Label>
                <Input
                  id="targetSkill"
                  value={targetSkill}
                  onChange={(e) => setTargetSkill(e.target.value)}
                  placeholder="e.g., blueprint_analysis"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="difficultyLevel">Difficulty Level (1-10)</Label>
                <Select value={difficultyLevel.toString()} onValueChange={(value) => setDifficultyLevel(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Level {i + 1} {i < 3 ? '(Beginner)' : i < 7 ? '(Intermediate)' : '(Advanced)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="estimatedDuration">Duration (minutes)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  min="15"
                  max="480"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Prerequisites</Label>
              <div className="flex gap-2">
                <Input
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="Add prerequisite skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                />
                <Button type="button" variant="outline" onClick={addPrerequisite}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {prerequisites.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {prerequisites.map((prerequisite) => (
                    <Badge key={prerequisite} variant="secondary" className="text-sm">
                      {prerequisite}
                      <button
                        type="button"
                        onClick={() => removePrerequisite(prerequisite)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !name.trim() || !skillCategory || !targetSkill.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Module'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
