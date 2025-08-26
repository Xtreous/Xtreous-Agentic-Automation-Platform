import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Calendar, 
  Users, 
  Bot, 
  CheckCircle, 
  ArrowUpCircle,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useBackend } from '../hooks/useBackend';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const backend = useBackend();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => backend.subscriptions.getSubscription(),
    enabled: !!user
  });

  const plans = [
    {
      name: 'Free',
      price: '$0',
      interval: 'forever',
      description: 'Perfect for getting started',
      features: [
        '3 AI agents',
        '100 tasks per month',
        '1 user',
        '1GB storage',
        'Basic workflows',
        'Email support'
      ],
      limits: { agents: 3, tasks: 100, users: 1, storage: 1 },
      color: 'gray'
    },
    {
      name: 'Starter',
      price: '$25',
      interval: 'per month',
      description: 'Great for small teams',
      features: [
        '10 AI agents',
        '1,000 tasks per month',
        '5 users',
        '10GB storage',
        'Advanced workflows',
        'Integrations',
        'Priority email support'
      ],
      limits: { agents: 10, tasks: 1000, users: 5, storage: 10 },
      color: 'blue',
      popular: true
    },
    {
      name: 'Professional',
      price: '$99',
      interval: 'per month',
      description: 'For growing businesses',
      features: [
        '50 AI agents',
        '10,000 tasks per month',
        '25 users',
        '100GB storage',
        'Advanced analytics',
        'All integrations',
        'Phone & chat support'
      ],
      limits: { agents: 50, tasks: 10000, users: 25, storage: 100 },
      color: 'purple'
    },
    {
      name: 'Enterprise',
      price: '$499',
      interval: 'per month',
      description: 'For large organizations',
      features: [
        'Unlimited AI agents',
        'Unlimited tasks',
        'Unlimited users',
        '1TB storage',
        'Custom workflows',
        'SSO integration',
        'Dedicated support',
        'SLA guarantee'
      ],
      limits: { agents: -1, tasks: -1, users: -1, storage: 1000 },
      color: 'gold'
    }
  ];

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getPlanColor = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-500 bg-blue-900/30';
      case 'purple': return 'border-purple-500 bg-purple-900/30';
      case 'gold': return 'border-yellow-500 bg-yellow-900/30';
      default: return 'border-gray-700 bg-gray-900';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-64 bg-gray-700 rounded"></div>
              <div className="lg:col-span-2 h-64 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Subscription</h1>
          <p className="text-gray-400 mt-2">
            Manage your subscription and billing information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Subscription */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold capitalize">
                        {subscription.tier}
                      </span>
                      <Badge className={`${subscription.status === 'active' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                        {subscription.status}
                      </Badge>
                    </div>

                    <div className="text-2xl font-bold">
                      ${subscription.billing.amount}
                      <span className="text-sm font-normal text-gray-400">
                        /{subscription.billing.interval}
                      </span>
                    </div>

                    {subscription.billing.nextBillingDate && (
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        Next billing: {new Date(subscription.billing.nextBillingDate).toLocaleDateString()}
                      </div>
                    )}

                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium">Usage</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>AI Agents</span>
                          <span>
                            {subscription.limits.maxAgents === -1 ? 'Unlimited' : `0 / ${subscription.limits.maxAgents}`}
                          </span>
                        </div>
                        {subscription.limits.maxAgents !== -1 && (
                          <Progress value={getUsagePercentage(0, subscription.limits.maxAgents)} className="h-2" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tasks</span>
                          <span>
                            {subscription.limits.maxTasks === -1 ? 'Unlimited' : `0 / ${subscription.limits.maxTasks}`}
                          </span>
                        </div>
                        {subscription.limits.maxTasks !== -1 && (
                          <Progress value={getUsagePercentage(0, subscription.limits.maxTasks)} className="h-2" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Users</span>
                          <span>
                            {subscription.limits.maxUsers === -1 ? 'Unlimited' : `1 / ${subscription.limits.maxUsers}`}
                          </span>
                        </div>
                        {subscription.limits.maxUsers !== -1 && (
                          <Progress value={getUsagePercentage(1, subscription.limits.maxUsers)} className="h-2" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Available Plans */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>
                  Choose the plan that best fits your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`relative p-6 rounded-lg border-2 ${getPlanColor(plan.color)} ${
                        plan.popular ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-600 text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">{plan.price}</span>
                          <span className="text-gray-400 ml-1">/{plan.interval}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{plan.description}</p>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button 
                        className="w-full" 
                        variant={subscription?.tier === plan.name.toLowerCase() ? "outline" : "default"}
                        disabled={subscription?.tier === plan.name.toLowerCase()}
                      >
                        {subscription?.tier === plan.name.toLowerCase() ? (
                          'Current Plan'
                        ) : (
                          <>
                            <ArrowUpCircle className="h-4 w-4 mr-2" />
                            {subscription?.tier === 'free' ? 'Upgrade' : 'Switch Plan'}
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Why Upgrade?</CardTitle>
              <CardDescription>
                Unlock more powerful features with higher-tier plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">More AI Agents</h3>
                  <p className="text-sm text-gray-400">
                    Deploy more AI agents to handle complex workflows and scale your automation.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Team Collaboration</h3>
                  <p className="text-sm text-gray-400">
                    Add team members and collaborate on AI agent development and management.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Priority Support</h3>
                  <p className="text-sm text-gray-400">
                    Get faster response times and dedicated support for your business needs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
