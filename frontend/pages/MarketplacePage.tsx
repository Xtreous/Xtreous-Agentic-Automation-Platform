import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  ChevronLeft,
  ChevronRight,
  CheckCircle
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
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 12;
  const offset = (currentPage - 1) * pageSize;

  const { data: agentsData, isLoading } = useQuery({
    queryKey: [
      'marketplace-agents',
      searchTerm,
      selectedCategory,
      selectedIndustry,
      currentPage
    ],
    queryFn: () => backend.marketplace.listMarketplaceAgents({
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
      industry: selectedIndustry || undefined,
      limit: pageSize,
      offset: offset
    })
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const AgentCard = ({ agent }: { agent: MarketplaceAgent }) => (
    <Link to={`/marketplace/${agent.id}`}>
      <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all group overflow-hidden h-full flex flex-col">
        <div className="h-32 bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 relative">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
          <Badge variant="outline" className="border-gray-500 text-gray-400 text-xs mb-2 self-start">
            {agent.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          <h3 className="font-semibold text-white mb-2 flex-grow">{agent.name}</h3>
          <ul className="space-y-2 mt-auto">
            {agent.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 pb-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter
                </h2>
                {/* Industry Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">BY INDUSTRY</h3>
                  <div className="space-y-2">
                    {agentsData?.filters.industries.map((industry) => (
                      <div key={industry.id} className="flex items-center">
                        <Checkbox
                          id={`industry-${industry.id}`}
                          checked={selectedIndustry === industry.id}
                          onCheckedChange={(checked) => {
                            setSelectedIndustry(checked ? industry.id : '');
                            setCurrentPage(1);
                          }}
                          className="border-gray-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                        />
                        <label htmlFor={`industry-${industry.id}`} className="ml-2 text-sm text-gray-300 cursor-pointer">
                          {industry.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Teams Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">BY TEAMS</h3>
                  <div className="space-y-2">
                    {agentsData?.filters.categories.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategory === category.id}
                          onCheckedChange={(checked) => {
                            setSelectedCategory(checked ? category.id : '');
                            setCurrentPage(1);
                          }}
                          className="border-gray-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                        />
                        <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-300 cursor-pointer">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for an agent..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-12 pr-4 py-3 text-lg bg-gray-800 border-gray-700 rounded-md text-white w-full"
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
                    <div className="h-32 bg-gray-700"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : agentsData?.agents.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No agents found</h3>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {agentsData?.agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>

                {/* Pagination */}
                {agentsData && agentsData.total_pages > 1 && (
                  <div className="mt-8 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(agentsData.page - 1)}
                        disabled={!agentsData.has_prev}
                        className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-400">
                        Page {agentsData.page} of {agentsData.total_pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(agentsData.page + 1)}
                        disabled={!agentsData.has_next}
                        className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
