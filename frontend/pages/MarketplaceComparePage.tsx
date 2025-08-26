import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Star, 
  Download, 
  Shield, 
  Award, 
  CheckCircle, 
  X,
  ExternalLink,
  Play
} from 'lucide-react';
import backend from '~backend/client';

export default function MarketplaceComparePage() {
  const [searchParams] = useSearchParams();
  const agentIds = searchParams.get('agents')?.split(',').map(id => parseInt(id)).filter(Boolean) || [];
  
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['compare-agents', agentIds],
    queryFn: () => backend.marketplace.compareAgents({ agent_ids: agentIds }),
    enabled: agentIds.length >= 2
  });

  const formatPrice = (agent: any) => {
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
      case 'free': return 'bg-green-900/50 text-green-300';
      case 'subscription': return 'bg-blue-900/50 text-blue-300';
      case 'usage_based': return 'bg-purple-900/50 text-purple-300';
      case 'one_time': return 'bg-orange-900/50 text-orange-300';
      default: return 'bg-gray-700 text-gray-200';
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
            : 'text-gray-500'
        }`}
      />
    ));
  };

  const renderComparisonValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-red-500 mx-auto" />
      );
    }
    if (typeof value === 'number') {
      return <span className="font-medium">{value.toLocaleString()}</span>;
    }
    return <span className="text-sm">{value}</span>;
  };

  if (agentIds.length < 2) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-100 mb-4">Invalid Comparison</h1>
            <p className="text-gray-400 mb-6">You need to select at least 2 agents to compare.</p>
            <Button asChild>
              <Link to="/marketplace">Back to Marketplace</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-100 mb-4">Comparison not found</h1>
            <Button asChild>
              <Link to="/marketplace">Back to Marketplace</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/marketplace">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Compare Agents</h1>
          <p className="text-gray-400">
            Side-by-side comparison of {comparison.agents.length} AI agents
          </p>
        </div>

        {/* Agent Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {comparison.agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg line-clamp-1">{agent.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    {agent.publisher.verified && (
                      <Shield className="h-4 w-4 text-blue-500" />
                    )}
                    {agent.is_featured && (
                      <Award className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(agent.rating)}
                  <span className="text-sm text-gray-400">
                    {agent.rating.toFixed(1)} ({agent.review_count})
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getPricingColor(agent.pricing_model)}>
                      {formatPrice(agent)}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Download className="h-3 w-3" />
                      {agent.downloads.toLocaleString()}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 line-clamp-3">
                    {agent.description}
                  </p>
                  
                  <div className="flex gap-2 pt-2 border-t">
                    <Button className="flex-1" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Install
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/marketplace/${agent.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-100 w-48">
                      Feature
                    </th>
                    {comparison.agents.map((agent) => (
                      <th key={agent.id} className="text-center py-3 px-4 font-medium text-gray-100 min-w-48">
                        {agent.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.comparison_matrix.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}>
                      <td className="py-3 px-4 font-medium text-gray-300">
                        {row.feature}
                      </td>
                      {row.values.map((value, valueIndex) => (
                        <td key={valueIndex} className="py-3 px-4 text-center">
                          {renderComparisonValue(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild>
            <Link to="/marketplace">
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline">
            Export Comparison
          </Button>
        </div>
      </div>
    </div>
  );
}
