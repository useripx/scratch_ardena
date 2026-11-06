import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WelcomeLandingView } from '../src/components/landing/WelcomeLandingView';
import { OnboardingModal } from '../src/components/onboarding/OnboardingModal';
import { ProjectHomeView } from '../src/components/home/ProjectHomeView';
import { StartModeSelector } from '../src/components/starter/StartModeSelector';
import { TemplateCatalogView } from '../src/components/templates/TemplateCatalogView';
import { ViewRouter } from '../src/router/ViewRouter';
import { apiService } from '../src/services/api.service';

describe('Frontend Ardena UI Components — Sub-Fase FE-02', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // TEST-FE02-01: WelcomeLandingView
  describe('1. WelcomeLandingView (UI 01)', () => {
    it('harus merender elemen hero, headline, dan memicu callback saat tombol diklik', () => {
      const handleStartCreation = jest.fn();
      const handleExploreTemplates = jest.fn();

      render(
        <WelcomeLandingView
          onStartCreation={handleStartCreation}
          onExploreTemplates={handleExploreTemplates}
        />
      );

      // Verifikasi headline
      expect(
        screen.getByText(/Wujudkan Ide Game Impianmu Jadi Nyata/i)
      ).toBeTruthy();

      // Verifikasi tombol CTA
      const startBtn = screen.getByText(/Mulai Sekarang — Gratis/i);
      expect(startBtn).toBeTruthy();
      fireEvent.click(startBtn);
      expect(handleStartCreation).toHaveBeenCalledTimes(1);

      // Verifikasi tombol template
      const templateBtn = screen.getByText(/Jelajahi Template Game/i);
      fireEvent.click(templateBtn);
      expect(handleExploreTemplates).toHaveBeenCalledTimes(1);

      // Verifikasi mockup studio tri-pane
      expect(screen.getByText(/Hexa-Cluster AI Aktif/i)).toBeTruthy();
      expect(screen.getByText(/ketika bendera hijau diklik/i)).toBeTruthy();
    });
  });

  // TEST-FE02-02: OnboardingModal
  describe('2. OnboardingModal (UI 02)', () => {
    it('harus menavigasi langkah 1 ke 2 ke 3 dan menyimpan status onboarding di localStorage', () => {
      const handleClose = jest.fn();
      const handleComplete = jest.fn();

      render(
        <OnboardingModal
          isOpen={true}
          onClose={handleClose}
          onComplete={handleComplete}
        />
      );

      // Langkah 1
      expect(screen.getByText(/Langkah 1/i)).toBeTruthy();
      expect(
        screen.getByText(/Tulis Ide Game dalam Bahasa Apapun/i)
      ).toBeTruthy();

      // Klik Lanjut -> Langkah 2
      const nextBtn = screen.getByText(/Lanjut/i);
      fireEvent.click(nextBtn);
      expect(screen.getByText(/Langkah 2/i)).toBeTruthy();
      expect(
        screen.getByText(/Review Hasil AI Tanpa Rasa Takut/i)
      ).toBeTruthy();

      // Klik Lanjut -> Langkah 3
      fireEvent.click(screen.getByText(/Lanjut/i));
      expect(screen.getByText(/Langkah 3/i)).toBeTruthy();
      expect(
        screen.getByText(/Mainkan & Modifikasi di Scratch Asli/i)
      ).toBeTruthy();

      // Tombol berubah menjadi "Mulai Berkreasi"
      const finishBtn = screen.getByText(/Mulai Berkreasi/i);
      fireEvent.click(finishBtn);

      expect(handleComplete).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('ardena_onboarding_completed')).toBe('true');
    });

    it('harus langsung menyelesaikan onboarding saat tombol "Lewati Panduan" diklik', () => {
      const handleClose = jest.fn();
      const handleComplete = jest.fn();

      render(
        <OnboardingModal
          isOpen={true}
          onClose={handleClose}
          onComplete={handleComplete}
        />
      );

      const skipBtn = screen.getByText(/Lewati Panduan/i);
      fireEvent.click(skipBtn);

      expect(handleComplete).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('ardena_onboarding_completed')).toBe('true');
    });
  });

  // TEST-FE02-03: ProjectHomeView
  describe('3. ProjectHomeView (UI 03)', () => {
    it('harus merender banner studio, kartu aksi cepat, dan empty state proyek lokal', () => {
      const handleCreate = jest.fn();
      const handleTemplates = jest.fn();
      const handleBlank = jest.fn();

      render(
        <ProjectHomeView
          onCreateFromPrompt={handleCreate}
          onOpenTemplates={handleTemplates}
          onOpenBlankEditor={handleBlank}
        />
      );

      expect(
        screen.getByText(/Selamat Datang di Studio Ardena!/i)
      ).toBeTruthy();

      // Empty state
      expect(
        screen.getByText(/Belum Ada Game yang Disimpan/i)
      ).toBeTruthy();

      // Klik aksi cepat prompt
      const promptCard = screen.getByText(/Ide Alami AI Copilot/i);
      fireEvent.click(promptCard);
      expect(handleCreate).toHaveBeenCalled();

      // Klik aksi template
      const templateCard = screen.getByText(/Template Teruji/i);
      fireEvent.click(templateCard);
      expect(handleTemplates).toHaveBeenCalled();
    });

    it('harus menampilkan kartu proyek tersimpan jika tersedia di storage', () => {
      const savedProjects = [
        {
          id: 'proj-1',
          name: 'Game Tangkap Apel Saya',
          lastModified: '05/11/2026',
          spriteCount: 2,
        },
      ];
      localStorage.setItem(
        'ardena_saved_projects_meta',
        JSON.stringify(savedProjects)
      );

      const handleOpenProject = jest.fn();

      render(
        <ProjectHomeView
          onCreateFromPrompt={jest.fn()}
          onOpenTemplates={jest.fn()}
          onOpenBlankEditor={jest.fn()}
          onOpenProject={handleOpenProject}
        />
      );

      expect(screen.getByText('Game Tangkap Apel Saya')).toBeTruthy();
      expect(screen.getByText(/2 Sprite/i)).toBeTruthy();

      // Klik buka proyek
      fireEvent.click(screen.getByText('Game Tangkap Apel Saya'));
      expect(handleOpenProject).toHaveBeenCalledWith('proj-1');
    });
  });

  // TEST-FE02-04: StartModeSelector
  describe('4. StartModeSelector (UI 04)', () => {
    it('harus merender 3 pilihan mode dan memanggil callback mode yang dipilih', () => {
      const handleSelectMode = jest.fn();
      const handleClose = jest.fn();

      render(
        <StartModeSelector
          isOpen={true}
          onClose={handleClose}
          onSelectMode={handleSelectMode}
        />
      );

      expect(screen.getByText(/Pilih Cara Memulai Game Baru/i)).toBeTruthy();

      // Klik mode AI prompt
      fireEvent.click(screen.getByText(/Mulai dari Ide AI/i));
      expect(handleSelectMode).toHaveBeenCalledWith('ai-prompt');

      // Klik mode template
      fireEvent.click(screen.getByText(/Mulai dari Template/i));
      expect(handleSelectMode).toHaveBeenCalledWith('template');

      // Klik mode blank
      fireEvent.click(screen.getByText(/Editor Kosong/i));
      expect(handleSelectMode).toHaveBeenCalledWith('blank');
    });
  });

  // TEST-FE02-05: TemplateCatalogView
  describe('5. TemplateCatalogView (UI 05)', () => {
    it('harus memuat dan merender 3 template resmi serta memfilter berdasarkan pencarian', async () => {
      const handleSelect = jest.fn();
      jest.spyOn(apiService, 'getCapabilities').mockResolvedValue({
        supportedSchemaVersions: ['1.0'],
        templates: [
          {
            key: 'catching-game',
            name: 'Catching Game',
            genre: 'Arcade',
            description: 'Test catch',
            allowedRoles: [],
            allowedControls: [],
          },
        ],
      });

      render(<TemplateCatalogView onSelectTemplate={handleSelect} />);

      // Tunggu render template
      await waitFor(() => {
        expect(screen.getByText(/Catching Game \(Tangkap Apel\)/i)).toBeTruthy();
      });
      expect(screen.getByText(/Maze Adventure/i)).toBeTruthy();
      expect(screen.getByText(/Space Shooter/i)).toBeTruthy();

      // Filter pencarian
      const searchInput = screen.getByPlaceholderText(/Cari template game.../i);
      fireEvent.change(searchInput, { target: { value: 'Apel' } });

      expect(screen.getByText(/Catching Game/i)).toBeTruthy();
      expect(screen.queryByText(/Space Shooter/i)).toBeNull();

      // Klik tombol gunakan template
      const useBtns = screen.getAllByText(/Gunakan Template Ini/i);
      fireEvent.click(useBtns[0]);
      expect(handleSelect).toHaveBeenCalledWith('catching-game');
    });
  });

  // TEST-FE02-06: ViewRouter
  describe('6. ViewRouter (Integrasi Antar-Layar)', () => {
    it('harus mengontrol alur transisi dari Landing ke Onboarding ke Home ke Templates', async () => {
      jest.spyOn(apiService, 'checkHealth').mockResolvedValue({
        status: 'ok',
        timestamp: '2026-11-05T17:00:00Z',
        uptime: 120,
        service: 'ardena-backend',
        version: '1.0.0',
      });

      render(<ViewRouter initialView="landing" />);

      // Awalnya di landing page
      expect(
        screen.getByText(/Wujudkan Ide Game Impianmu Jadi Nyata/i)
      ).toBeTruthy();

      // Klik "Mulai Sekarang" (pertama kali, belum pernah onboarding)
      fireEvent.click(screen.getByText(/Mulai Sekarang — Gratis/i));

      // Modal onboarding terbuka
      expect(screen.getByText(/Langkah 1/i)).toBeTruthy();

      // Selesaikan onboarding
      fireEvent.click(screen.getByText(/Lewati Panduan/i));

      // Berpindah ke Dashboard Home & modal StartMode terbuka
      await waitFor(() => {
        expect(
          screen.getByText(/Selamat Datang di Studio Ardena!/i)
        ).toBeTruthy();
      });
      expect(screen.getByText(/Pilih Cara Memulai Game Baru/i)).toBeTruthy();

      // Pilih mode template
      fireEvent.click(screen.getByText(/Mulai dari Template/i));

      // Berpindah ke katalog template
      await waitFor(() => {
        expect(
          screen.getByText(/Katalog Template Game Resmi/i)
        ).toBeTruthy();
      });
    });
  });
});
