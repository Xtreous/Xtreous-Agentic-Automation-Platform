import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';
import { GlassCard } from './GlassCard';

export default function Footer() {
  return (
    <footer className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard className="p-8" variant="strong">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Xtreous
                </span>
              </div>
              <p className="text-gray-600 max-w-md leading-relaxed">
                Leading the future of business automation with self-learning AI agents that transform workflows and enhance operational efficiency.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="h-4 w-4 text-purple-600" />
                  <span>contact@xtreous.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <a href="#" className="p-2 rounded-lg bg-white/60 hover:bg-white/80 text-gray-600 hover:text-purple-600 transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-white/60 hover:bg-white/80 text-gray-600 hover:text-purple-600 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-white/60 hover:bg-white/80 text-gray-600 hover:text-purple-600 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Solutions</h3>
              <div className="space-y-2">
                <Link to="/solutions" className="block text-gray-600 hover:text-purple-600 transition-colors">Construction</Link>
                <Link to="/solutions" className="block text-gray-600 hover:text-purple-600 transition-colors">Customer Service</Link>
                <Link to="/solutions" className="block text-gray-600 hover:text-purple-600 transition-colors">Financial Services</Link>
                <Link to="/solutions" className="block text-gray-600 hover:text-purple-600 transition-colors">Sales & Operations</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Platform</h3>
              <div className="space-y-2">
                <Link to="/agents" className="block text-gray-600 hover:text-purple-600 transition-colors">AI Agents</Link>
                <Link to="/workflows" className="block text-gray-600 hover:text-purple-600 transition-colors">Workflows</Link>
                <Link to="/integrations" className="block text-gray-600 hover:text-purple-600 transition-colors">Integrations</Link>
                <Link to="/dashboard" className="block text-gray-600 hover:text-purple-600 transition-colors">Dashboard</Link>
                <Link to="/marketplace" className="block text-gray-600 hover:text-purple-600 transition-colors">Marketplace</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/40 mt-8 pt-8 text-center">
            <p className="text-gray-500">
              © 2025 Xtreous. All rights reserved. | 
              <Link to="/privacy" className="hover:text-purple-600 transition-colors ml-1">Privacy Policy</Link> | 
              <Link to="/terms" className="hover:text-purple-600 transition-colors ml-1">Terms of Service</Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </footer>
  );
}
