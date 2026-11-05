import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { WelcomeLandingView } from '../components/landing/WelcomeLandingView';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';
import { ProjectHomeView } from '../components/home/ProjectHomeView';
import { StartModeSelector, StartMode } from '../components/starter/StartModeSelector';
import { TemplateCatalogView } from '../components/templates/TemplateCatalogView';
import { EditorWorkspace } from '../components/editor/EditorWorkspace';
import { apiService } from '../services/api.service';
import { SupportedTemplateKey } from '../types/game.types';

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
  const [activeTemplateId, setActiveTemplateId] = useState<SupportedTemplateKey | undefined>(undefined);
  const [activeProjectName, setActiveProjectName] = useState('Proyek Game Baru');

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
    } else if (mode === 'ai-prompt') {
      setActiveProjectName('Game Ide AI');
      setActiveTemplateId(undefined);
      if (onEnterEditor) onEnterEditor(mode);
      else setCurrentView('editor');
    } else {
      setActiveProjectName('Game Scratch Kosong');
      setActiveTemplateId(undefined);
      if (onEnterEditor) onEnterEditor(mode);
      else setCurrentView('editor');
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplateId(templateId as SupportedTemplateKey);
    setActiveProjectName(`Game Template (${templateId})`);
    if (onEnterEditor) {
      onEnterEditor('template', templateId);
    } else {
      setCurrentView('editor');
    }
  };

  // If in editor view, render full-screen workspace with EditorTopNav
  if (currentView === 'editor') {
    return (
      <EditorWorkspace
        initialProjectName={activeProjectName}
        initialTemplateId={activeTemplateId}
        onBackToHome={() => setCurrentView('home')}
      />
    );
  }

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
              setActiveProjectName(`Proyek #${projId}`);
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
