import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Download, 
  Shield, 
  Award, 
  ExternalLink, 
  Play, 
  FileText, 
  Users, 
  Calendar,
  Heart,
  Share2,
  Flag,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import backend from '~backend/client';
import { Link } from 'react-router-dom';

export default function MarketplaceAgentPage() {
  const { id } = useParams<{ id: string }>();
  const agentId = parseInt(id || '0');
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: agent, isLoading } = useQuery({
    queryKey: ['marketplace-agent', agentId],
    queryFn: () => backend.marketplace.getMarketplaceAgent({ id: agentId }),
    enabled: !!agentId
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['agent-reviews', agentId],
    queryFn: () => backend.marketplace.listAgentReviews({ agent_id: agentId }),
    enabled: !!agentId
  });

  const formatPrice = () => {
    if (!agent) return '';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-700 rounded"></div>
              </div>
              <div className="h-96 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-100 mb-4">Agent not found</h1>
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
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/marketplace">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-100">{agent.name}</h1>
                    {agent.publisher.verified && (
                      <Shield className="h-6 w-6 text-blue-500" />
                    )}
                    {agent.is_featured && (
                      <Award className="h-6 w-6 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-lg text-gray-400 mb-4">{agent.description}</p>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      {renderStars(agent.rating)}
                      <span className="font-medium">{agent.rating.toFixed(1)}</span>
                      <span className="text-gray-400">({agent.review_count} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Download className="h-4 w-4" />
                      {agent.downloads.toLocaleString()} downloads
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline">{agent.category}</Badge>
                {agent.industry.map((ind) => (
                  <Badge key={ind} variant="outline">{ind}</Badge>
                ))}
                {agent.workflow_types.map((type) => (
                  <Badge key={type} variant="outline">{type.replace(/_/g, ' ')}</Badge>
                ))}
              </div>
            </div>

            {/* Screenshots */}
            {agent.screenshots.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Screenshots</h3>
                <div className="grid grid-cols-2 gap-4">
                  {agent.screenshots.slice(0, 4).map((screenshot, index) => (
                    <div key={index} className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About this Agent</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-gray-400">{agent.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Industries</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.industry.map((ind) => (
                          <Badge key={ind} variant="outline">{ind}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Workflow Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.workflow_types.map((type) => (
                          <Badge key={type} variant="outline">{type.replace(/_/g, ' ')}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Compatibility</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.compatibility.map((comp) => (
                          <Badge key={comp} variant="outline">{comp}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Requirements</h4>
                      <ul className="list-disc list-inside text-gray-400 space-y-1">
                        {agent.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {agent.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {/* Rating Summary */}
                  {reviewsData && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Customer Reviews</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="text-center">
                            <div className="text-4xl font-bold mb-2">{reviewsData.average_rating.toFixed(1)}</div>
                            <div className="flex items-center justify-center gap-1 mb-2">
                              {renderStars(reviewsData.average_rating)}
                            </div>
                            <div className="text-gray-400">{reviewsData.total} reviews</div>
                          </div>
                          
                          <div className="space-y-2">
                            {reviewsData.rating_breakdown.map((breakdown) => (
                              <div key={breakdown.rating} className="flex items-center gap-3">
                                <span className="text-sm w-8">{breakdown.rating}★</span>
                                <Progress value={breakdown.percentage} className="flex-1" />
                                <span className="text-sm text-gray-400 w-12">{breakdown.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reviews List */}
                  {reviewsData?.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={review.user_avatar} />
                            <AvatarFallback>{review.user_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{review.user_name}</span>
                              {review.verified_purchase && (
                                <Badge className="bg-green-900/50 text-green-300 text-xs">
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-400">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <h4 className="font-medium mb-2">{review.title}</h4>
                            <p className="text-gray-400 mb-3">{review.content}</p>
                            
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="sm">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Helpful ({review.helpful_count})
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Not helpful
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="support" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Support & Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {agent.documentation_url && (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">Documentation</div>
                            <div className="text-sm text-gray-400">Complete setup and usage guide</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={agent.documentation_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}

                    {agent.support_url && (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-green-500" />
                          <div>
                            <div className="font-medium">Support Center</div>
                            <div className="text-sm text-gray-400">Get help from the community</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={agent.support_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        <div className="font-medium">Version Information</div>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>Current version: {agent.version}</div>
                        <div>Last updated: {new Date(agent.last_updated).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Install Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">{formatPrice()}</div>
                    <Badge className={getPricingColor(agent.pricing_model)}>
                      {agent.pricing_model.replace('_', ' ')}
                    </Badge>
                    {agent.pricing_details.free_tier && (
                      <div className="mt-2">
                        <Badge className="bg-green-900/50 text-green-300">
                          Free Tier Available
                        </Badge>
                      </div>
                    )}
                  </div>

                  <Button className="w-full" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Install Agent
                  </Button>

                  {agent.demo_url && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={agent.demo_url} target="_blank" rel="noopener noreferrer">
                        <Play className="h-4 w-4 mr-2" />
                        Try Demo
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Publisher Info */}
            <Card>
              <CardHeader>
                <CardTitle>Publisher</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={agent.publisher.avatar_url} />
                    <AvatarFallback>{agent.publisher.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{agent.publisher.name}</span>
                      {agent.publisher.verified && (
                        <Shield className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-400">Verified Publisher</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Publisher Profile
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Downloads</span>
                  <span className="font-medium">{agent.downloads.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span className="font-medium">{agent.rating.toFixed(1)}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reviews</span>
                  <span className="font-medium">{agent.review_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Version</span>
                  <span className="font-medium">{agent.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Updated</span>
                  <span className="font-medium">{new Date(agent.last_updated).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
