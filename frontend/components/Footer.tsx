import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Bot className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">Xtreous</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Leading the future of business automation with self-learning AI agents that transform workflows and enhance operational efficiency.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">contact@xtreous.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">San Francisco, CA</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Solutions</h3>
            <ul className="space-y-2">
              <li><Link to="/solutions" className="text-gray-300 hover:text-white transition-colors">Construction</Link></li>
              <li><Link to="/solutions" className="text-gray-300 hover:text-white transition-colors">Customer Service</Link></li>
              <li><Link to="/solutions" className="text-gray-300 hover:text-white transition-colors">Financial Services</Link></li>
              <li><Link to="/solutions" className="text-gray-300 hover:text-white transition-colors">Sales & Operations</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/agents" className="text-gray-300 hover:text-white transition-colors">AI Agents</Link></li>
              <li><Link to="/workflows" className="text-gray-300 hover:text-white transition-colors">Workflows</Link></li>
              <li><Link to="/integrations" className="text-gray-300 hover:text-white transition-colors">Integrations</Link></li>
              <li><Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Xtreous. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
}
