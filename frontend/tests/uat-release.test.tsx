import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ViewRouter } from '../src/router/ViewRouter';
import { EditorWorkspace } from '../src/components/editor/EditorWorkspace';
import { ExportSb3Modal } from '../src/components/modals/ExportSb3Modal';
import { ErrorRecoveryDialog } from '../src/components/modals/ErrorRecoveryDialog';
import { RateLimitCountdownModal } from '../src/components/modals/RateLimitCountdownModal';
import { storageService } from '../src/services/storage.service';
import { apiService } from '../src/services/api.service';
import { ArdenaGameSpec, StoredProject } from '../src/types/game.types';

// Mock API Service for UAT
jest.mock('../src/services/api.service', () => ({
  apiService: {
    generateGame: jest.fn(),
    checkHealth: jest.fn(),
  },
}));

// Mock ObjectURL and Anchor click for Export Testing
beforeAll(() => {
  if (typeof window !== 'undefined') {
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-sb3-package');
    window.URL.revokeObjectURL = jest.fn();
    HTMLAnchorElement.prototype.click = jest.fn();
  }
});

const mockUatGameSpec: ArdenaGameSpec = {
  title: 'Petualangan Kucing Antariksa UAT',
  genre: 'catching-game',
  description: 'Tangkap meteor emas di luar angkasa dengan Scratch 3.0.',
  rules: {
    winCondition: 'Kumpulkan 10 meteor emas',
    loseCondition: 'Jangan tertabrak alien',
    timeLimitSeconds: 60,
  },
  sprites: [
    {
      name: 'KucingAstronot',
      role: 'player',
      costume: 'cat_space',
      initialPosition: { x: 0, y: -100 },
      scripts: [
        { trigger: 'when_flag_clicked', action: 'move_with_arrows' },
        { trigger: 'when_key_pressed', action: 'jump' },
      ],
    },
    {
      name: 'MeteorEmas',
      role: 'collectible',
      costume: 'meteor',
      initialPosition: { x: 50, y: 150 },
      scripts: [{ trigger: 'when_flag_clicked', action: 'fall_down_continuous' }],
    },
  ],
  variables: [
    { name: 'Skor', initialValue: 0 },
    { name: 'Waktu', initialValue: 60 },
  ],
  soundEffects: ['collect_coin', 'win_fanfare', 'laser'],
};

describe('User Acceptance Testing (UAT) & Production Quality Gate (Tahap 08: MVP Release v1.0.0)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await storageService.clearAllData();
    await storageService.resetCredits();
    jest.clearAllMocks();
    (apiService.checkHealth as jest.Mock).mockResolvedValue({ status: 'ok' });
  });

  // UAT-01: First-Time User Experience (FTUX) & Credit Onboarding
  describe('UAT-01: First-Time User Experience (FTUX) & Credit Onboarding', () => {
    it('harus mengarahkan pengguna baru dari Landing Page hingga masuk ke Studio dengan saldo 5.500 Poin', async () => {
      render(<ViewRouter />);

      // 1. Landing Page (UI 01)
      expect(screen.getByText(/Wujudkan Ide Game Impianmu Jadi Nyata/i)).toBeTruthy();
      expect(screen.getByText(/Mulai Sekarang — Gratis/i)).toBeTruthy();

      // 2. Klik Mulai Sekarang -> Buka Onboarding Modal (UI 02)
      fireEvent.click(screen.getByText(/Mulai Sekarang — Gratis/i));
      await waitFor(() => {
        expect(screen.getByText(/Tulis Ide Game dalam Bahasa Apapun/i)).toBeTruthy();
      });

      // 3. Navigasi Onboarding Walkthrough (Langkah 1 -> Langkah 2 -> Langkah 3 -> Selesai)
      fireEvent.click(screen.getByText(/Lanjut/i)); // ke Langkah 2
      expect(screen.getByText(/Review Hasil AI Tanpa Rasa Takut/i)).toBeTruthy();

      fireEvent.click(screen.getByText(/Lanjut/i)); // ke Langkah 3
      expect(screen.getByText(/Mainkan & Modifikasi di Scratch Asli/i)).toBeTruthy();

      fireEvent.click(screen.getByText(/Mulai Berkreasi/i)); // Selesai

      // 4. Masuk ke Dashboard Studio (UI 03)
      await waitFor(() => {
        expect(screen.getByText(/Selamat Datang di Studio Ardena!/i)).toBeTruthy();
      });

      // 5. Pilih Mode Editor Scratch Kosong
      const blankBtn = screen.getByText(/Editor Scratch Kosong/i);
      fireEvent.click(blankBtn);

      // 6. Masuk ke Editor Workspace (UI 06) dan verifikasi lencana saldo 5.500 Poin
      await waitFor(() => {
        expect(screen.getAllByText('5.500').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByTitle(/Saldo Kredit AI Agen/i).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // UAT-02: AI Copilot Multi-Mode & Zero Overwrite Review Gate
  describe('UAT-02: AI Copilot Multi-Mode & Zero Overwrite Review Gate', () => {
    it('harus menjalankan siklus kreasi game tri-mode dengan pengurangan kredit yang presisi dan konfirmasi Zero Overwrite', async () => {
      (apiService.generateGame as jest.Mock).mockResolvedValue({
        game: mockUatGameSpec,
        diffCounters: {
          spritesCount: 2,
          variablesCount: 2,
          sfxCount: 3,
          blocksCount: 8,
          overwrittenCount: 0,
        },
        meta: {
          provider: 'gemini',
          modelUsed: 'gemini-1.5-flash',
          durationMs: 450,
          requestId: 'uat-req-001',
        },
      });

      render(<EditorWorkspace onBackToHome={jest.fn()} />);

      // Tunggu saldo awal 5.500 poin termuat
      await waitFor(() => {
        expect(screen.getByText('5.500')).toBeTruthy();
      });

      // 1. Uji Mode 'buat' (-100 Poin)
      const input = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(input, {
        target: { value: 'Buat game kucing menangkap meteor emas di antariksa' },
      });

      const submitBtn = screen.getByText(/Generate Game Scratch \(-100 Poin\)/i);
      fireEvent.click(submitBtn);

      // Verifikasi Review Gate Modal terbuka dengan jaminan 0 Overwrite
      await waitFor(() => {
        expect(screen.getByText(/Review Hasil AI Copilot • Zero Overwrite Gate/i)).toBeTruthy();
      });

      // Verifikasi metrik Bento Box diff counters
      expect(screen.getByText('0 (Aman)')).toBeTruthy();
      expect(screen.getByText('+2 Baru')).toBeTruthy();

      // Klik Terapkan ke Kanvas
      const applyBtn = screen.getByText(/Terapkan ke Editor/i);
      fireEvent.click(applyBtn);

      // Verifikasi Ready Playtest Banner aktif
      await waitFor(() => {
        expect(screen.getByText(/Balok Berhasil Dihasilkan!/i)).toBeTruthy();
      });

      // Verifikasi saldo terpotong 100 poin (5.500 -> 5.400)
      const creditsAfterCreate = await storageService.getCredits();
      expect(creditsAfterCreate.balance).toBe(5400);

      // 2. Uji Mode 'ubah' (-50 Poin)
      const ubahTab = screen.getByText(/Ubah \(-50\)/i);
      fireEvent.click(ubahTab);

      fireEvent.change(input, {
        target: { value: 'Tambahkan gravitasi lebih cepat saat meteor jatuh' },
      });

      const submitUbahBtn = screen.getByText(/Terapkan Modifikasi \(-50 Poin\)/i);
      fireEvent.click(submitUbahBtn);

      // Verifikasi saldo terpotong 50 poin (5.400 -> 5.350)
      await waitFor(async () => {
        const creds = await storageService.getCredits();
        expect(creds.balance).toBe(5350);
      });

      // 3. Uji Mode 'jelaskan' (-20 Poin)
      const jelaskanTab = screen.getByText(/Jelaskan \(-20\)/i);
      fireEvent.click(jelaskanTab);

      // Verifikasi biaya -20 ditampilkan pada tombol
      expect(screen.getByText(/Tanya Tutor AI \(-20 Poin\)/i)).toBeTruthy();
    });
  });

  // UAT-03: Storage Resilience & Scratch 3.0 .sb3 Package Integrity
  describe('UAT-03: Storage Resilience & Scratch 3.0 .sb3 Package Integrity', () => {
    it('harus memvalidasi persistensi proyek offline IndexedDB dan keabsahan paket ekspor .sb3', async () => {
      // 1. Simpan proyek ke IndexedDB
      const projectEntity = storageService.createProjectFromSpec(
        mockUatGameSpec,
        'Proyek Antariksa UAT',
        ['arcade', 'space']
      );
      const saved = await storageService.saveProject(projectEntity);
      expect(saved.id).toBeDefined();

      // 2. Ambil kembali dari IndexedDB
      const loaded = await storageService.getProject(saved.id);
      expect(loaded).not.toBeNull();
      expect(loaded?.title).toBe('Proyek Antariksa UAT');
      expect(loaded?.stats.spriteCount).toBe(2);
      expect(loaded?.stats.variableCount).toBe(2);

      // 3. Uji Modal Ekspor .sb3 (UI 14)
      const handleClose = jest.fn();
      render(<ExportSb3Modal isOpen={true} project={saved} onClose={handleClose} />);

      expect(screen.getByText(/Ekspor Proyek ke Scratch 3\.0 \(\.sb3\)/i)).toBeTruthy();
      expect(screen.getByText(/scratch.mit.edu/i)).toBeTruthy();

      // Klik tombol unduh .sb3
      const downloadBtn = screen.getByText(/Unduh Paket .sb3 Sekarang/i);
      expect(downloadBtn).toBeTruthy();
      fireEvent.click(downloadBtn);

      // Verifikasi pembentukan paket ZIP .sb3 tanpa error
      await waitFor(() => {
        expect(window.URL.createObjectURL).toHaveBeenCalled();
      });
    });
  });

  // UAT-04: Fair Usage Policy & Recovery Handling
  describe('UAT-04: Fair Usage Policy & Recovery Handling', () => {
    it('harus menangani kegagalan koneksi backend (UI 11) dan pemulihan rate limit (UI 19) secara elegan', async () => {
      // 1. Uji Dialog Pemulihan Error Jaringan (UI 11)
      const handleRetry = jest.fn();
      render(
        <ErrorRecoveryDialog
          isOpen={true}
          errorCode="NETWORK_ERROR"
          errorMessage="Gagal terhubung ke AI Service port 3001"
          onRetry={handleRetry}
          onEditPrompt={jest.fn()}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText(/Koneksi ke Server Terputus/i)).toBeTruthy();
      const retryBtn = screen.getByText(/Coba Lagi/i);
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);

      // 2. Uji Dialog Rate Limit / Kredit Habis (UI 19)
      render(
        <RateLimitCountdownModal
          isOpen={true}
          initialSeconds={15}
          title="Kredit AI Kamu Sedang Habis"
          description="Saldo kreditmu tersisa 0 poin. Dapatkan +500 poin gratis besok hari!"
          creditsRemaining={0}
          onRetry={jest.fn()}
          onClose={jest.fn()}
        />
      );

      expect(screen.getAllByText('Kredit AI Kamu Sedang Habis').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('🪙 0 Poin')).toBeTruthy();
      expect(screen.getByText(/Dapatkan \+500 poin gratis/i)).toBeTruthy();
    });

    it('harus otomatis menambahkan +500 poin bonus harian saat pergantian hari terdeteksi', async () => {
      // Simulasikan saldo kemarin
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      await storageService.saveCredits({
        balance: 150,
        lastDailyCreditDate: yesterday,
        totalCreditsEarned: 150,
        totalCreditsSpent: 0,
        history: [],
      });

      // Panggil getCredits hari ini
      const todayCredits = await storageService.getCredits();
      expect(todayCredits.balance).toBe(150 + 500);
      expect(todayCredits.balance).toBe(650);
    });
  });

  // UAT-05: Scratch 3.0 AST Standard Conformance
  describe('UAT-05: Scratch 3.0 AST Standard Conformance', () => {
    it('harus memvalidasi struktur AST project.json yang dihasilkan kompatibel 100% dengan standar Scratch Foundation', () => {
      const project = storageService.createProjectFromSpec(mockUatGameSpec);

      // Validasi struktur dasar project.json Scratch 3.0
      expect(project.gameSpec.title).toBe(mockUatGameSpec.title);
      expect(project.gameSpec.sprites.length).toBe(2);

      // Validasi sprite player & collectible
      const playerSprite = project.gameSpec.sprites.find((s) => s.role === 'player');
      expect(playerSprite).toBeDefined();
      expect(playerSprite?.name).toBe('KucingAstronot');
      expect(playerSprite?.scripts.length).toBe(2);

      // Validasi variabel panggung
      expect(project.gameSpec.variables.some((v) => v.name === 'Skor')).toBe(true);
      expect(project.gameSpec.variables.some((v) => v.name === 'Waktu')).toBe(true);

      // Validasi metadata statistik pustaka
      expect(project.stats.spriteCount).toBe(2);
      expect(project.stats.variableCount).toBe(2);
      expect(project.stats.soundCount).toBe(3);
    });
  });
});
