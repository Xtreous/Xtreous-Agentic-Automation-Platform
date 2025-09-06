import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  BarChart3,
  Star,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedCounter } from '../components/AnimatedCounter';

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
    { value: 90, suffix: "%", label: "Time Reduction", color: "from-blue-500 to-cyan-500" },
    { value: 98, suffix: "%", label: "Accuracy Rate", color: "from-green-500 to-emerald-500" },
    { value: 2, suffix: "x", label: "More Projects", color: "from-purple-500 to-pink-500" },
    { value: 68, suffix: "%", label: "Faster Response", color: "from-orange-500 to-red-500" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Agentic Process Automation Platform
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your Business with
                <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Self-Learning AI Agents
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Automate complex workflows, reduce operational costs, and scale your business with AI agents that learn and improve continuously.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg px-8 py-4 text-lg" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/60 border-white/40 hover:bg-white/80 px-8 py-4 text-lg">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <GlassCard key={index} className="p-6 text-center" hover>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg w-fit mx-auto mb-4`}>
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  <AnimatedCounter from={0} to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Powerful AI-Driven Automation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with enterprise-grade security to deliver unmatched automation capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <GlassCard key={index} className="p-6 text-center group" hover>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${
                  index === 0 ? 'from-blue-500 to-cyan-500' :
                  index === 1 ? 'from-green-500 to-emerald-500' :
                  index === 2 ? 'from-purple-500 to-pink-500' :
                  'from-orange-500 to-red-500'
                } shadow-lg w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Industry-Specific Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored AI agents designed for your industry's unique challenges and workflows.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industries.map((industry, index) => (
              <GlassCard key={index} className="p-8 group" hover>
                <div className="flex items-start space-x-6">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${
                    index === 0 ? 'from-blue-500 to-cyan-500' :
                    index === 1 ? 'from-green-500 to-emerald-500' :
                    index === 2 ? 'from-purple-500 to-pink-500' :
                    'from-orange-500 to-red-500'
                  } shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <industry.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">{industry.title}</h3>
                      <p className="text-lg text-gray-600">{industry.description}</p>
                    </div>
                    <div className="space-y-2">
                      {industry.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying about Xtreous
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Xtreous has revolutionized our construction takeoff process. We're now able to bid on twice as many projects with 90% less manual work.",
                author: "Sarah Chen",
                role: "VP of Operations",
                company: "BuildTech Solutions",
                rating: 5
              },
              {
                quote: "The AI agents handle our customer support so efficiently that we've reduced response times by 68% while maintaining high satisfaction scores.",
                author: "Marcus Rodriguez",
                role: "Customer Success Director",
                company: "ServiceFlow Inc",
                rating: 5
              },
              {
                quote: "Implementation was seamless and the ROI was immediate. Our compliance monitoring is now automated and 99% accurate.",
                author: "Jennifer Park",
                role: "Risk Management Lead", 
                company: "FinanceFirst Corp",
                rating: 5
              }
            ].map((testimonial, index) => (
              <GlassCard key={index} className="p-6 space-y-4" hover>
                <div className="flex space-x-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic leading-relaxed">"{testimonial.quote}"</p>
                <div className="border-t border-white/40 pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-gray-500">{testimonial.company}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="p-12 text-center" variant="strong">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Join thousands of businesses already using Xtreous to automate their workflows and boost productivity.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg px-8 py-4 text-lg" asChild>
                  <Link to="/register">
                    Start Free Trial
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/60 border-white/40 hover:bg-white/80 px-8 py-4 text-lg">
                  Contact Sales
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
