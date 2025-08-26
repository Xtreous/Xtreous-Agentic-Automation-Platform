import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './components/AuthProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SolutionsPage from './pages/SolutionsPage';
import DashboardPage from './pages/DashboardPage';
import AgentsPage from './pages/AgentsPage';
import TasksPage from './pages/TasksPage';
import WorkflowsPage from './pages/WorkflowsPage';
import CollaborationsPage from './pages/CollaborationsPage';
import TrainingPage from './pages/TrainingPage';
import IntegrationsPage from './pages/IntegrationsPage';
import MarketplacePage from './pages/MarketplacePage';
import MarketplaceAgentPage from './pages/MarketplaceAgentPage';
import MarketplaceComparePage from './pages/MarketplaceComparePage';
import ProfilePage from './pages/ProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
import { DeploymentPage } from './pages/DeploymentPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppInner() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/collaborations" element={<CollaborationsPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/:id" element={<MarketplaceAgentPage />} />
            <Route path="/marketplace/compare" element={<MarketplaceComparePage />} />
            <Route path="/deployments" element={<DeploymentPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </QueryClientProvider>
  );
}
