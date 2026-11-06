import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { storageService } from '../src/services/storage.service';
import { SaveProjectDialog } from '../src/components/modals/SaveProjectDialog';
import { LocalProjectLibrary } from '../src/components/storage/LocalProjectLibrary';
import { ExportSb3Modal } from '../src/components/modals/ExportSb3Modal';
import { PreferencesModal } from '../src/components/modals/PreferencesModal';
import { ConfirmationModal } from '../src/components/modals/ConfirmationModal';
import { ArdenaGameSpec, StoredProject } from '../src/types/game.types';

// Mock URL.createObjectURL and URL.revokeObjectURL and Anchor click
beforeAll(() => {
  if (typeof window !== 'undefined') {
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();
    HTMLAnchorElement.prototype.click = jest.fn();
  }
});

const mockSpec: ArdenaGameSpec = {
  title: 'Petualangan Kucing Antariksa',
  genre: 'catching-game',
  description: 'Tangkap bintang di galaksi untuk meraih skor tertinggi.',
  rules: {
    winCondition: 'Raih 10 poin untuk menang!',
    loseCondition: 'Jangan sentuh asteroid.',
    timeLimitSeconds: 60,
  },
  sprites: [
    {
      name: 'KucingAstronot',
      role: 'player',
      costume: 'cat_space',
      initialPosition: { x: 0, y: -100 },
      scripts: [{ trigger: 'when_flag_clicked', action: 'move_with_arrows' }],
    },
    {
      name: 'BintangEmas',
      role: 'collectible',
      costume: 'star',
      initialPosition: { x: 50, y: 120 },
      scripts: [{ trigger: 'when_flag_clicked', action: 'fall_down' }],
    },
  ],
  variables: [{ name: 'Skor', initialValue: 0 }],
  soundEffects: ['collect_coin', 'game_over'],
};

describe('Frontend Storage & IndexedDB Sub-Fase FE-05', () => {
  beforeEach(async () => {
    await storageService.clearAllData();
  });

  // TEST-FE05-01: StorageService Unit Tests
  describe('1. StorageService Operations', () => {
    it('harus membuat entitas StoredProject dari ArdenaGameSpec dengan statistik akurat', () => {
      const project = storageService.createProjectFromSpec(mockSpec);
      expect(project.id).toMatch(/^proj-/);
      expect(project.title).toBe('Petualangan Kucing Antariksa');
      expect(project.category).toBe('arcade');
      expect(project.stats.spriteCount).toBe(2);
      expect(project.stats.blockCount).toBe(2);
      expect(project.stats.variableCount).toBe(1);
      expect(project.stats.soundCount).toBe(2);
    });

    it('harus menyimpan, mengambil, dan memperbarui proyek secara persisten', async () => {
      const initial = storageService.createProjectFromSpec(mockSpec);
      const saved = await storageService.saveProject(initial);
      expect(saved.id).toBe(initial.id);

      const retrieved = await storageService.getProject(saved.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.title).toBe('Petualangan Kucing Antariksa');

      // Update
      const updated = await storageService.saveProject({
        ...saved,
        title: 'Petualangan Kucing Antariksa v2',
      });
      expect(updated.title).toBe('Petualangan Kucing Antariksa v2');

      const all = await storageService.getProjects();
      expect(all.length).toBe(1);
      expect(all[0].title).toBe('Petualangan Kucing Antariksa v2');
    });

    it('harus menduplikasi proyek dengan judul berakhiran (Salinan)', async () => {
      const initial = storageService.createProjectFromSpec(mockSpec);
      await storageService.saveProject(initial);

      const duplicated = await storageService.duplicateProject(initial.id);
      expect(duplicated.id).not.toBe(initial.id);
      expect(duplicated.title).toBe('Petualangan Kucing Antariksa (Salinan)');

      const all = await storageService.getProjects();
      expect(all.length).toBe(2);
    });

    it('harus menghapus proyek dari penyimpanan', async () => {
      const initial = storageService.createProjectFromSpec(mockSpec);
      await storageService.saveProject(initial);

      const success = await storageService.deleteProject(initial.id);
      expect(success).toBe(true);

      const retrieved = await storageService.getProject(initial.id);
      expect(retrieved).toBeNull();
    });

    it('harus mengekspor paket .sb3 menggunakan JSZip dengan MIME application/x.scratch.sb3', async () => {
      const initial = storageService.createProjectFromSpec(mockSpec);
      const blob = await storageService.exportProjectToSb3(initial);

      expect(blob).toBeTruthy();
      expect(blob.type).toBe('application/x.scratch.sb3');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('harus menyimpan dan memuat preferensi pengguna', async () => {
      const defaultPrefs = await storageService.getPreferences();
      expect(defaultPrefs.theme).toBe('light');
      expect(defaultPrefs.soundEffectsEnabled).toBe(true);

      const updated = await storageService.savePreferences({
        soundEffectsEnabled: false,
        autoSaveIntervalSeconds: 30,
      });
      expect(updated.soundEffectsEnabled).toBe(false);
      expect(updated.autoSaveIntervalSeconds).toBe(30);

      const reloaded = await storageService.getPreferences();
      expect(reloaded.soundEffectsEnabled).toBe(false);
      expect(reloaded.autoSaveIntervalSeconds).toBe(30);
    });

    it('harus mengekspor seluruh proyek dalam format JSON cadangan', async () => {
      const proj = storageService.createProjectFromSpec(mockSpec);
      await storageService.saveProject(proj);

      const jsonString = await storageService.exportAllProjectsAsJson();
      const parsed = JSON.parse(jsonString);
      expect(parsed.app).toBe('Ardena Playground');
      expect(parsed.projectsCount).toBe(1);
      expect(parsed.projects[0].title).toBe('Petualangan Kucing Antariksa');
    });
  });

  // TEST-FE05-02: SaveProjectDialog (UI 12)
  describe('2. SaveProjectDialog (UI 12)', () => {
    it('harus memvalidasi judul kosong dan membatasi panjang 60 karakter', async () => {
      const onSaveMock = jest.fn();
      render(
        <SaveProjectDialog
          isOpen={true}
          initialTitle=""
          onSave={onSaveMock}
          onClose={jest.fn()}
        />
      );

      const submitBtn = screen.getByRole('button', { name: /Simpan ke Browser/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/Nama proyek tidak boleh kosong/i)).toBeTruthy();
      expect(onSaveMock).not.toHaveBeenCalled();
    });

    it('harus memanggil callback onSave saat form disubmit dengan judul valid', async () => {
      const onSaveMock = jest.fn();
      const onCloseMock = jest.fn();
      render(
        <SaveProjectDialog
          isOpen={true}
          initialTitle="Petualangan Labirin Baru"
          initialCategory="puzzle"
          onSave={onSaveMock}
          onClose={onCloseMock}
        />
      );

      const submitBtn = screen.getByRole('button', { name: /Simpan ke Browser/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onSaveMock).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Petualangan Labirin Baru',
            category: 'puzzle',
          })
        );
        expect(onCloseMock).toHaveBeenCalled();
      });
    });
  });

  // TEST-FE05-03: LocalProjectLibrary (UI 13)
  describe('3. LocalProjectLibrary (UI 13)', () => {
    it('harus menampilkan kartu proyek, filter kategori, dan pencarian', async () => {
      const proj1 = storageService.createProjectFromSpec(mockSpec, 'Kucing Galaksi');
      proj1.category = 'arcade';
      await storageService.saveProject(proj1);

      const proj2 = storageService.createProjectFromSpec(mockSpec, 'Labirin Keju');
      proj2.category = 'puzzle';
      await storageService.saveProject(proj2);

      const onOpenMock = jest.fn();
      render(
        <LocalProjectLibrary
          onOpenProject={onOpenMock}
          onNewProject={jest.fn()}
          onBack={jest.fn()}
        />
      );

      // Cari proyek yang dirender
      expect(await screen.findByText('Kucing Galaksi')).toBeTruthy();
      expect(screen.getByText('Labirin Keju')).toBeTruthy();

      // Filter kategori Arcade
      const arcadeBtn = screen.getByRole('button', { name: /Arcade \(1\)/i });
      fireEvent.click(arcadeBtn);

      expect(screen.getByText('Kucing Galaksi')).toBeTruthy();
      expect(screen.queryByText('Labirin Keju')).toBeNull();

      // Search
      const searchInput = screen.getByPlaceholderText(/Cari nama atau tag/i);
      fireEvent.change(searchInput, { target: { value: 'Kucing' } });
      expect(screen.getByText('Kucing Galaksi')).toBeTruthy();
    });

    it('harus memicu callback onOpenProject saat tombol Buka diklik', async () => {
      const proj = storageService.createProjectFromSpec(mockSpec, 'Game Uji');
      await storageService.saveProject(proj);

      const onOpenMock = jest.fn();
      render(
        <LocalProjectLibrary
          onOpenProject={onOpenMock}
          onNewProject={jest.fn()}
          onBack={jest.fn()}
        />
      );

      const openBtn = await screen.findByRole('button', { name: /^Buka$/i });
      fireEvent.click(openBtn);

      expect(onOpenMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Game Uji' })
      );
    });
  });

  // TEST-FE05-04: ExportSb3Modal (UI 14)
  describe('4. ExportSb3Modal (UI 14)', () => {
    it('harus merender rincian aset dan memicu unduhan paket .sb3', async () => {
      const proj = storageService.createProjectFromSpec(mockSpec);
      render(
        <ExportSb3Modal
          isOpen={true}
          project={proj}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText(/2 Objek Aktif/i)).toBeTruthy();
      expect(screen.getByText(/1 Monitor Skor/i)).toBeTruthy();
      expect(screen.getByText(/2 Sound Clips/i)).toBeTruthy();

      const downloadBtn = screen.getByRole('button', { name: /Unduh Paket \.sb3 Sekarang/i });
      fireEvent.click(downloadBtn);

      expect(await screen.findByText(/File berhasil dikemas dan diunduh/i)).toBeTruthy();
    });
  });

  // TEST-FE05-05: PreferencesModal & ConfirmationModal (UI 15 & UI 17)
  describe('5. PreferencesModal & ConfirmationModal (UI 15 & UI 17)', () => {
    it('harus dapat berpindah antar tab pengaturan pada PreferencesModal', async () => {
      render(
        <PreferencesModal
          isOpen={true}
          onClose={jest.fn()}
          onResetData={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Ardena AI Gateway Aktif/i)).toBeTruthy();
      });

      // Pindah ke tab Penyimpanan
      const storageTab = screen.getByRole('button', { name: /Penyimpanan & IndexedDB/i });
      fireEvent.click(storageTab);
      expect(screen.getByText(/Interval Simpan Otomatis/i)).toBeTruthy();

      // Pindah ke tab Tampilan
      const displayTab = screen.getByRole('button', { name: /Tampilan & Aksesibilitas/i });
      fireEvent.click(displayTab);
      expect(screen.getByText(/Efek Suara Antarmuka/i)).toBeTruthy();

      // Pindah ke tab Privasi
      const aboutTab = screen.getByRole('button', { name: /Privasi & Tentang/i });
      fireEvent.click(aboutTab);
      expect(screen.getByText(/Komitmen Privasi & Zero Telemetry/i)).toBeTruthy();
    });

    it('harus memvalidasi konfirmasi dan pembatalan pada ConfirmationModal', async () => {
      const onConfirmMock = jest.fn();
      const onCancelMock = jest.fn();

      render(
        <ConfirmationModal
          isOpen={true}
          title="Hapus Proyek Ini?"
          message="Data akan hilang selamanya."
          confirmLabel="Hapus Permanen"
          cancelLabel="Batalkan"
          isDestructive={true}
          onConfirm={onConfirmMock}
          onCancel={onCancelMock}
        />
      );

      expect(screen.getByText('Hapus Proyek Ini?')).toBeTruthy();
      expect(screen.getByText('Data akan hilang selamanya.')).toBeTruthy();

      fireEvent.click(screen.getByRole('button', { name: 'Batalkan' }));
      expect(onCancelMock).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Hapus Permanen' }));
      await waitFor(() => {
        expect(onConfirmMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});

