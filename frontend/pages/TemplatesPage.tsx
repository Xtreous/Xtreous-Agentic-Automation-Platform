import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LayoutTemplate, 
  Plus, 
  Search, 
  Building, 
  Bot, 
  HeartPulse,
  Shield,
  TrendingUp,
  FileText,
  Headphones
} from 'lucide-react';
import backend from '~backend/client';
import type { AgentTemplate } from '~backend/templates/types';
import CreateAgentFromTemplateDialog from '../components/CreateAgentFromTemplateDialog';

const iconMap: { [key: string]: React.ElementType } = {
  Building,
  Headphones,
  Shield,
  TrendingUp,
  HeartPulse,
  FileText,
  Default: LayoutTemplate
};

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);

  const { data: templatesData, isLoading, refetch } = useQuery({
    queryKey: ['templates', industryFilter, typeFilter, searchTerm],
    queryFn: () => backend.templates.list({
      industry: industryFilter || undefined,
      type: typeFilter || undefined,
      search: searchTerm || undefined,
    })
  });

  const handleUseTemplate = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Agent Templates</h1>
              <p className="text-gray-400 mt-2">
                Jumpstart your automation with pre-configured agent templates.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Industries</SelectItem>
              <SelectItem value="construction">Construction</SelectItem>
              <SelectItem value="customer-service">Customer Service</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="analytical">Analytical</SelectItem>
              <SelectItem value="conversational">Conversational</SelectItem>
              <SelectItem value="automation">Automation</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-400 flex items-center">
            Total: {templatesData?.templates.length || 0} templates
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesData?.templates.map((template) => {
              const Icon = iconMap[template.icon] || iconMap.Default;
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Icon className="h-8 w-8 text-blue-400" />
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="capitalize">
                          {template.industry} • {template.type}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <p className="text-gray-400 mb-4 line-clamp-3 flex-grow">
                      {template.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-gray-400">Use Cases:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {template.suggested_use_cases.slice(0, 3).map((useCase, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {useCase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Capabilities:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {template.capabilities.slice(0, 3).map((capability, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto">
                    <Button className="w-full" onClick={() => handleUseTemplate(template)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {templatesData?.templates.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <LayoutTemplate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-100 mb-2">No templates found</h3>
            <p className="text-gray-400">
              {searchTerm || industryFilter || typeFilter
                ? 'Try adjusting your filters to see more results.'
                : 'No templates are available at this time.'}
            </p>
          </div>
        )}
      </div>

      {selectedTemplate && (
        <CreateAgentFromTemplateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          template={selectedTemplate}
          onSuccess={() => {
            refetch();
            setIsCreateDialogOpen(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
}
