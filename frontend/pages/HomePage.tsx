import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Zap, 
  Target, 
  Shield, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Building,
  Headphones,
  DollarSign,
  BarChart3
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Bot,
      title: "Multi-Agent Systems",
      description: "Deploy multiple AI agents that collaborate seamlessly to handle complex workflows with human-level precision."
    },
    {
      icon: Zap,
      title: "Self-Learning Capabilities",
      description: "Agents continuously improve through feedback loops and Constitutional AI, achieving up to 98% accuracy."
    },
    {
      icon: Target,
      title: "Smart Model Switching",
      description: "ModelMesh technology automatically selects the best AI model for each task, optimizing speed, accuracy, and cost."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2 compliant with flexible deployment options: cloud, on-premise, or EU-hosted for compliance."
    }
  ];

  const industries = [
    {
      icon: Building,
      title: "Construction",
      description: "Automated takeoff software reducing manual effort by 90%",
      benefits: ["Material quantification", "Cost estimation", "Project addendums"]
    },
    {
      icon: Headphones,
      title: "Customer Service",
      description: "AI agents handling inquiries with 68% faster response times",
      benefits: ["Email/chat support", "Order tracking", "Issue resolution"]
    },
    {
      icon: DollarSign,
      title: "Financial Services",
      description: "Automated compliance checks and risk management",
      benefits: ["Data processing", "Compliance monitoring", "Risk assessment"]
    },
    {
      icon: BarChart3,
      title: "Sales & Operations",
      description: "Streamlined proposal generation and onboarding",
      benefits: ["Client research", "Proposal creation", "Employee onboarding"]
    }
  ];

  const stats = [
    { value: "90%", label: "Time Reduction" },
    { value: "98%", label: "Accuracy Rate" },
    { value: "2x", label: "More Projects" },
    { value: "68%", label: "Faster Response" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-600 hover:bg-blue-700">
              Agentic Process Automation Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform Your Business with
              <span className="text-blue-300 block">Self-Learning AI Agents</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Automate complex workflows, reduce operational costs, and scale your business with AI agents that learn and improve continuously.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful AI-Driven Automation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with enterprise-grade security to deliver unmatched automation capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Industry-Specific Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored AI agents designed for your industry's unique challenges and workflows.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industries.map((industry, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <industry.icon className="h-12 w-12 text-blue-600" />
                    <div>
                      <CardTitle className="text-2xl">{industry.title}</CardTitle>
                      <CardDescription className="text-lg">
                        {industry.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {industry.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using Xtreous to automate their workflows and boost productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
