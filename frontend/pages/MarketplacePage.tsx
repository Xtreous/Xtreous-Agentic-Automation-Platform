import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye, 
  Heart,
  Grid3X3,
  List,
  TrendingUp,
  Award,
  Zap,
  Shield,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  FileText,
  Users,
  DollarSign
} from 'lucide-react';
import backend from '~backend/client';
import { Link } from 'react-router-dom';

interface MarketplaceAgent {
  id: number;
  name: string;
  description: string;
  category: string;
  industry: string[];
  workflow_types: string[];
  pricing_model: 'free' | 'subscription' | 'usage_based' | 'one_time';
  pricing_details: {
    free_tier?: boolean;
    monthly_price?: number;
    usage_price?: number;
    one_time_price?: number;
    currency: string;
  };
  rating: number;
  review_count: number;
  downloads: number;
  publisher: {
    id: number;
    name: string;
    verified: boolean;
    avatar_url?: string;
  };
  features: string[];
  tags: string[];
  screenshots: string[];
  demo_url?: string;
  documentation_url?: string;
  support_url?: string;
  version: string;
  last_updated: Date;
  created_at: Date;
  is_featured: boolean;
  compatibility: string[];
  requirements: string[];
}

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedWorkflowType, setSelectedWorkflowType] = useState('');
  const [selectedPricingModel, setSelectedPricingModel] = useState('');
  const [minRating, setMinRating] = useState([0]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'downloads' | 'created_at' | 'name' | 'price'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [compareList, setCompareList] = useState<number[]>([]);

  const pageSize = 12;
  const offset = (currentPage - 1) * pageSize;

  const { data: agentsData, isLoading } = useQuery({
    queryKey: [
      'marketplace-agents',
      searchTerm,
      selectedCategory,
      selectedIndustry,
      selectedWorkflowType,
      selectedPricingModel,
      minRating[0],
      featuredOnly,
      sortBy,
      sortOrder,
      currentPage
    ],
    queryFn: () => backend.marketplace.listMarketplaceAgents({
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
      industry: selectedIndustry || undefined,
      workflow_type: selectedWorkflowType || undefined,
      pricing_model: selectedPricingModel || undefined,
      min_rating: minRating[0] > 0 ? minRating[0] : undefined,
      featured_only: featuredOnly || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      limit: pageSize,
      offset: offset
    })
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedIndustry('');
    setSelectedWorkflowType('');
    setSelectedPricingModel('');
    setMinRating([0]);
    setFeaturedOnly(false);
    setCurrentPage(1);
  };

  const toggleCompare = (agentId: number) => {
    setCompareList(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId);
      } else if (prev.length < 5) {
        return [...prev, agentId];
      }
      return prev;
    });
  };

  const formatPrice = (agent: MarketplaceAgent) => {
    if (agent.pricing_model === 'free') return 'Free';
    if (agent.pricing_model === 'subscription' && agent.pricing_details.monthly_price) {
      return `$${agent.pricing_details.monthly_price}/mo`;
    }
    if (agent.pricing_model === 'usage_based' && agent.pricing_details.usage_price) {
      return `$${agent.pricing_details.usage_price} per use`;
    }
    if (agent.pricing_model === 'one_time' && agent.pricing_details.one_time_price) {
      return `$${agent.pricing_details.one_time_price}`;
    }
    return 'Contact for pricing';
  };

  const getPricingColor = (model: string) => {
    switch (model) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'subscription': return 'bg-blue-100 text-blue-800';
      case 'usage_based': return 'bg-purple-100 text-purple-800';
      case 'one_time': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const AgentCard = ({ agent }: { agent: MarketplaceAgent }) => (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg line-clamp-1">{agent.name}</CardTitle>
              {agent.publisher.verified && (
                <Shield className="h-4 w-4 text-blue-500" />
              )}
              {agent.is_featured && (
                <Award className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <CardDescription className="line-clamp-2">
              {agent.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleCompare(agent.id)}
            className={compareList.includes(agent.id) ? 'text-blue-600' : ''}
          >
            <Heart className={`h-4 w-4 ${compareList.includes(agent.id) ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Rating and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(agent.rating)}
              </div>
              <span className="text-sm text-gray-600">
                {agent.rating.toFixed(1)} ({agent.review_count})
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {agent.downloads.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Publisher */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="h-3 w-3" />
            </div>
            <span className="text-sm text-gray-600">{agent.publisher.name}</span>
          </div>

          {/* Categories and Tags */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {agent.category}
              </Badge>
              {agent.industry.slice(0, 2).map((ind) => (
                <Badge key={ind} variant="outline" className="text-xs">
                  {ind}
                </Badge>
              ))}
              {agent.industry.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{agent.industry.length - 2}
                </Badge>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between">
            <Badge className={getPricingColor(agent.pricing_model)}>
              {formatPrice(agent)}
            </Badge>
            {agent.pricing_details.free_tier && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                Free Tier
              </Badge>
            )}
          </div>

          {/* Features */}
          <div className="text-sm">
            <span className="text-gray-500">Key features:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {agent.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {agent.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{agent.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button className="flex-1" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/marketplace/${agent.id}`}>
                View Details
              </Link>
            </Button>
            {agent.demo_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={agent.demo_url} target="_blank" rel="noopener noreferrer">
                  <Play className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AgentListItem = ({ agent }: { agent: MarketplaceAgent }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  {agent.publisher.verified && (
                    <Shield className="h-4 w-4 text-blue-500" />
                  )}
                  {agent.is_featured && (
                    <Award className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-gray-600 line-clamp-2">{agent.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCompare(agent.id)}
                className={compareList.includes(agent.id) ? 'text-blue-600' : ''}
              >
                <Heart className={`h-4 w-4 ${compareList.includes(agent.id) ? 'fill-current' : ''}`} />
              </Button>
            </div>

            <div className="flex items-center gap-6 mb-3">
              <div className="flex items-center gap-2">
                {renderStars(agent.rating)}
                <span className="text-sm text-gray-600">
                  {agent.rating.toFixed(1)} ({agent.review_count})
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Download className="h-3 w-3" />
                {agent.downloads.toLocaleString()}
              </div>
              <span className="text-sm text-gray-600">by {agent.publisher.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getPricingColor(agent.pricing_model)}>
                  {formatPrice(agent)}
                </Badge>
                {agent.pricing_details.free_tier && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Free Tier
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/marketplace/${agent.id}`}>
                    Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Agent Marketplace</h1>
          <p className="text-gray-600">
            Discover, compare, and install AI agents to automate your workflows
          </p>
        </div>

        {/* Featured Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Featured Agents</h2>
                <p className="text-blue-100">
                  Hand-picked agents that deliver exceptional value
                </p>
              </div>
              <Award className="h-12 w-12 text-yellow-300" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search agents..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={(value) => {
                    setSelectedCategory(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {agentsData?.filters.categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Industry */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Industry</label>
                  <Select value={selectedIndustry} onValueChange={(value) => {
                    setSelectedIndustry(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Industries</SelectItem>
                      {agentsData?.filters.industries.map((industry) => (
                        <SelectItem key={industry.id} value={industry.id}>
                          {industry.name} ({industry.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Workflow Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Workflow Type</label>
                  <Select value={selectedWorkflowType} onValueChange={(value) => {
                    setSelectedWorkflowType(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {agentsData?.filters.workflow_types.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name.replace(/_/g, ' ')} ({type.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pricing Model */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Pricing</label>
                  <Select value={selectedPricingModel} onValueChange={(value) => {
                    setSelectedPricingModel(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Pricing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Pricing</SelectItem>
                      {agentsData?.filters.pricing_models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name.replace(/_/g, ' ')} ({model.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Minimum Rating: {minRating[0]} stars
                  </label>
                  <Slider
                    value={minRating}
                    onValueChange={(value) => {
                      setMinRating(value);
                      setCurrentPage(1);
                    }}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Featured Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={featuredOnly}
                    onCheckedChange={(checked) => {
                      setFeaturedOnly(checked as boolean);
                      setCurrentPage(1);
                    }}
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Featured only
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {agentsData?.total || 0} agents found
                </span>
                {compareList.length > 0 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/marketplace/compare?agents=${compareList.join(',')}`}>
                      Compare ({compareList.length})
                    </Link>
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="downloads">Downloads</SelectItem>
                    <SelectItem value="created_at">Newest</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Agents Grid/List */}
            {isLoading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
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
            ) : agentsData?.agents.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms to find more agents.
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {agentsData?.agents.map((agent) => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agentsData?.agents.map((agent) => (
                      <AgentListItem key={agent.id} agent={agent} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {agentsData && agentsData.total_pages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((agentsData.page - 1) * agentsData.per_page) + 1} to{' '}
                      {Math.min(agentsData.page * agentsData.per_page, agentsData.total)} of{' '}
                      {agentsData.total} agents
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(agentsData.page - 1)}
                        disabled={!agentsData.has_prev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, agentsData.total_pages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={page === agentsData.page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        })}
                        {agentsData.total_pages > 5 && (
                          <>
                            <span className="text-gray-500">...</span>
                            <Button
                              variant={agentsData.total_pages === agentsData.page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(agentsData.total_pages)}
                              className="w-8 h-8 p-0"
                            >
                              {agentsData.total_pages}
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(agentsData.page + 1)}
                        disabled={!agentsData.has_next}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
