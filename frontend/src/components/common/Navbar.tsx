import React from 'react';

export interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  onOpenStudio?: () => void;
  isBackendHealthy?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView = 'landing',
  onNavigate,
  onOpenStudio,
  isBackendHealthy = true,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#f7f9fb]/90 backdrop-blur-md border-b border-gray-200/60 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Wordmark */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => onNavigate?.('landing')}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200 flex items-center justify-center p-1">
            <img
              src="assets/logo.png"
              alt="Ardena Playground Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback SVG if image not found
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#191c1e] flex items-center gap-1.5">
              Ardena <span className="text-[#006194]">Playground</span>
            </span>
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">
              Scratch 3.0 AI Game Studio
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#eceef0] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onNavigate?.('landing')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentView === 'landing'
                ? 'bg-white text-[#006194] shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            Beranda
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentView === 'home'
                ? 'bg-white text-[#006194] shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            Dashboard Studio
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('templates')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentView === 'templates'
                ? 'bg-white text-[#006194] shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            Template Game
          </button>
        </nav>

        {/* Right Actions & Health Status */}
        <div className="flex items-center gap-3">
          {/* AI Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-[#006194]">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendHealthy
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-500'
              }`}
            />
            <span>{isBackendHealthy ? 'Hexa-Cluster AI Siap' : 'AI Offline'}</span>
          </div>

          <button
            type="button"
            onClick={onOpenStudio || (() => onNavigate?.('home'))}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#006194] text-white text-sm font-bold shadow-md hover:bg-[#007bb9] hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <span>🚀 Buka Studio</span>
          </button>
        </div>
      </div>
    </header>
  );
};
