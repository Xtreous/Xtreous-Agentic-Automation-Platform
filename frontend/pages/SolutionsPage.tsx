import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Headphones, 
  DollarSign, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Calculator,
  MessageSquare,
  CreditCard,
  UserPlus
} from 'lucide-react';

export default function SolutionsPage() {
  const solutions = [
    {
      icon: Building,
      title: "Construction",
      subtitle: "Automated Takeoff & Estimation",
      description: "Revolutionize your construction workflow with AI-powered takeoff software that reduces manual effort by 90% and enables bidding on twice as many projects.",
      benefits: [
        "Fully automated quantity takeoffs from blueprints",
        "Material quantification and cost estimation",
        "Handle last-minute project addendums instantly",
        "Integrate with existing construction management tools"
      ],
      stats: [
        { label: "Time Saved", value: "90%" },
        { label: "More Bids", value: "2x" },
        { label: "Accuracy", value: "98%" }
      ],
      features: [
        { icon: FileText, name: "Blueprint Analysis" },
        { icon: Calculator, name: "Cost Estimation" },
        { icon: TrendingUp, name: "Bid Optimization" }
      ],
      color: "blue"
    },
    {
      icon: Headphones,
      title: "Customer Service",
      subtitle: "AI-Powered Support Automation",
      description: "Transform customer support with AI agents that handle inquiries via email, chat, and WhatsApp, reducing response times by 68% and ticket backlogs by 54%.",
      benefits: [
        "24/7 automated customer support across all channels",
        "Intelligent ticket routing and prioritization",
        "Integration with Zendesk, HubSpot, and CRM systems",
        "Multi-language support and sentiment analysis"
      ],
      stats: [
        { label: "Response Time", value: "68% faster" },
        { label: "Ticket Reduction", value: "54%" },
        { label: "Customer Satisfaction", value: "95%" }
      ],
      features: [
        { icon: MessageSquare, name: "Multi-Channel Support" },
        { icon: Users, name: "Smart Routing" },
        { icon: Clock, name: "24/7 Availability" }
      ],
      color: "green"
    },
    {
      icon: DollarSign,
      title: "Financial Services",
      subtitle: "Compliance & Risk Management",
      description: "Automate financial data processing, compliance checks, and risk management with AI agents that ensure accuracy and regulatory compliance.",
      benefits: [
        "Automated compliance monitoring and reporting",
        "Real-time risk assessment and fraud detection",
        "Document processing and data validation",
        "Integration with banking and accounting systems"
      ],
      stats: [
        { label: "Processing Speed", value: "10x faster" },
        { label: "Compliance Rate", value: "99.9%" },
        { label: "Error Reduction", value: "95%" }
      ],
      features: [
        { icon: CreditCard, name: "Transaction Monitoring" },
        { icon: FileText, name: "Document Processing" },
        { icon: TrendingUp, name: "Risk Analytics" }
      ],
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "Sales & Operations",
      subtitle: "Proposal Generation & Onboarding",
      description: "Accelerate sales cycles with AI agents that research clients, generate tailored proposals, and automate employee onboarding processes.",
      benefits: [
        "Automated client research and proposal generation",
        "Personalized sales communications and follow-ups",
        "Streamlined employee onboarding workflows",
        "Integration with CRM and HR systems"
      ],
      stats: [
        { label: "Sales Cycle", value: "40% shorter" },
        { label: "Proposal Quality", value: "95%" },
        { label: "Onboarding Time", value: "75% faster" }
      ],
      features: [
        { icon: FileText, name: "Proposal Automation" },
        { icon: UserPlus, name: "Onboarding Workflows" },
        { icon: BarChart3, name: "Performance Analytics" }
      ],
      color: "orange"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'purple': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'orange': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-600 hover:bg-blue-700">
              Industry-Specific AI Solutions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tailored AI Agents for
              <span className="text-blue-300 block">Every Industry</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover how Xtreous transforms workflows across construction, customer service, finance, and sales with specialized AI automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                Explore Solutions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {solutions.map((solution, index) => (
              <div key={index} className={`${index % 2 === 1 ? 'lg:flex-row-reverse' : ''} lg:flex lg:items-center lg:gap-16`}>
                <div className="lg:w-1/2 mb-8 lg:mb-0">
                  <Card className={`border-2 ${getColorClasses(solution.color)}`}>
                    <CardHeader>
                      <div className="flex items-center space-x-4 mb-4">
                        <solution.icon className={`h-12 w-12 ${solution.color === 'blue' ? 'text-blue-600' : solution.color === 'green' ? 'text-green-600' : solution.color === 'purple' ? 'text-purple-600' : 'text-orange-600'}`} />
                        <div>
                          <CardTitle className="text-2xl">{solution.title}</CardTitle>
                          <CardDescription className="text-lg font-medium">
                            {solution.subtitle}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6 text-lg">
                        {solution.description}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {solution.stats.map((stat, idx) => (
                          <div key={idx} className="text-center">
                            <div className={`text-2xl font-bold ${solution.color === 'blue' ? 'text-blue-600' : solution.color === 'green' ? 'text-green-600' : solution.color === 'purple' ? 'text-purple-600' : 'text-orange-600'}`}>
                              {stat.value}
                            </div>
                            <div className="text-sm text-gray-600">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {solution.features.map((feature, idx) => (
                          <div key={idx} className="text-center">
                            <feature.icon className={`h-8 w-8 mx-auto mb-2 ${solution.color === 'blue' ? 'text-blue-600' : solution.color === 'green' ? 'text-green-600' : solution.color === 'purple' ? 'text-purple-600' : 'text-orange-600'}`} />
                            <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                          </div>
                        ))}
                      </div>

                      <Button className="w-full">
                        Learn More About {solution.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:w-1/2">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Benefits</h3>
                    {solution.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Industry?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join industry leaders who are already using Xtreous to automate their workflows and drive unprecedented efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Contact Sales Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
