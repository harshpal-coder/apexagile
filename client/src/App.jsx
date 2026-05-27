import React, { useEffect } from 'react';
import { usePath, navigate } from './utils/router';
import { useAuthStore } from './context/useAuthStore';
import { useWorkspaceStore } from './context/useWorkspaceStore';

// Layout & Pages
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import KanbanBoardPage from './pages/KanbanBoardPage';
import SprintPage from './pages/SprintPage';
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import TimelinePage from './pages/TimelinePage';
import SaaSUpgradeModal from './components/SaaSUpgradeModal';

export default function App() {
  const path = usePath();
  const { isAuthenticated, getProfile, loading } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();

  // Load profile on start
  useEffect(() => {
    getProfile();
  }, []);

  // Loading Skeleton while resolving session JWT
  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg text-slate-100">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Restoring Agile Workspace...</p>
        </div>
      </div>
    );
  }

  // Routing Tree
  const renderContent = () => {
    switch (path) {
      // Public Marketing & Auth
      case '/':
        return <LandingPage />;
      case '/login':
        return <LoginPage />;
      case '/register':
        return <RegisterPage />;

      // Protected Platform Dashboard Pages
      default:
        // Redirect if not signed in
        if (!isAuthenticated) {
          // Force async transition to prevent infinite React loops
          setTimeout(() => navigate('/login'), 10);
          return null;
        }

        return (
          <DashboardLayout>
            {(() => {
              switch (path) {
                case '/dashboard':
                  return <DashboardPage />;
                case '/projects':
                  return <ProjectsPage />;
                case '/board':
                  return <KanbanBoardPage />;
                case '/sprint':
                  return <SprintPage />;
                case '/timeline':
                  return <TimelinePage />;
                case '/team':
                  return <TeamPage />;
                case '/profile':
                  return <ProfilePage />;
                case '/settings':
                  return <SettingsPage />;
                default:
                  return <DashboardPage />;
              }
            })()}
          </DashboardLayout>
        );
    }
  };

  return (
    <>
      {renderContent()}
      <SaaSUpgradeModal />
    </>
  );
}
