import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { WelcomeLandingView } from '../components/landing/WelcomeLandingView';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';
import { ProjectHomeView } from '../components/home/ProjectHomeView';
import { StartModeSelector, StartMode } from '../components/starter/StartModeSelector';
import { TemplateCatalogView } from '../components/templates/TemplateCatalogView';
import { apiService } from '../services/api.service';

export type AppView = 'landing' | 'home' | 'templates' | 'editor';

export interface ViewRouterProps {
  initialView?: AppView;
  onEnterEditor?: (mode: StartMode, templateId?: string) => void;
}

export const ViewRouter: React.FC<ViewRouterProps> = ({
  initialView = 'landing',
  onEnterEditor,
}) => {
  const [currentView, setCurrentView] = useState<AppView>(initialView);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isStartModeOpen, setIsStartModeOpen] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);

  // Health check on mount
  useEffect(() => {
    let isMounted = true;
    apiService
      .checkHealth()
      .then(() => {
        if (isMounted) setIsBackendHealthy(true);
      })
      .catch(() => {
        if (isMounted) setIsBackendHealthy(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle "Mulai Sekarang" from Landing (Decision Option A)
  const handleStartFromLanding = () => {
    let hasCompletedOnboarding = false;
    try {
      hasCompletedOnboarding =
        localStorage.getItem('ardena_onboarding_completed') === 'true';
    } catch {
      // LocalStorage access fallback
    }

    if (!hasCompletedOnboarding) {
      setIsOnboardingOpen(true);
    } else {
      setIsStartModeOpen(true);
    }
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
    setCurrentView('home');
    setIsStartModeOpen(true);
  };

  const handleSelectStartMode = (mode: StartMode) => {
    setIsStartModeOpen(false);
    if (mode === 'template') {
      setCurrentView('templates');
    } else {
      if (onEnterEditor) {
        onEnterEditor(mode);
      } else {
        setCurrentView('editor');
      }
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    if (onEnterEditor) {
      onEnterEditor('template', templateId);
    } else {
      setCurrentView('editor');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb] text-[#191c1e]">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as AppView)}
        onOpenStudio={() => setCurrentView('home')}
        isBackendHealthy={isBackendHealthy}
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col">
        {currentView === 'landing' && (
          <WelcomeLandingView
            onStartCreation={handleStartFromLanding}
            onExploreTemplates={() => setCurrentView('templates')}
          />
        )}

        {currentView === 'home' && (
          <ProjectHomeView
            onCreateFromPrompt={() => setIsStartModeOpen(true)}
            onOpenTemplates={() => setCurrentView('templates')}
            onOpenBlankEditor={() => handleSelectStartMode('blank')}
            onOpenProject={(projId) => {
              if (onEnterEditor) onEnterEditor('blank', projId);
              else setCurrentView('editor');
            }}
          />
        )}

        {currentView === 'templates' && (
          <TemplateCatalogView
            onSelectTemplate={handleSelectTemplate}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'editor' && (
          <div className="w-full min-h-screen pt-24 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 text-4xl flex items-center justify-center mb-4 text-[#006194]">
              🧩
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Editor Scratch Workspace (FE-03 Target)
            </h2>
            <p className="text-sm text-gray-600 max-w-md mb-6 leading-relaxed">
              Modul Scratch GUI v3.x dengan panel AI Copilot akan diintegrasikan pada sub-fase FE-03 & FE-04.
            </p>
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className="px-6 py-2.5 rounded-xl bg-[#006194] text-white text-sm font-bold shadow-md hover:bg-[#007bb9]"
            >
              Kembali ke Dashboard Studio
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Onboarding Walkthrough Modal (UI 02) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* Start Mode Selector Modal (UI 04) */}
      <StartModeSelector
        isOpen={isStartModeOpen}
        onClose={() => setIsStartModeOpen(false)}
        onSelectMode={handleSelectStartMode}
      />
    </div>
  );
};
