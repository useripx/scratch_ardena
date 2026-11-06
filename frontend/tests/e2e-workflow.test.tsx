import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ViewRouter } from '../src/router/ViewRouter';
import { EditorWorkspace } from '../src/components/editor/EditorWorkspace';
import { PreferencesModal } from '../src/components/modals/PreferencesModal';
import { RateLimitCountdownModal } from '../src/components/modals/RateLimitCountdownModal';
import { apiService, GenerateGameResult } from '../src/services/api.service';
import { storageService } from '../src/services/storage.service';
import { toast } from '../src/services/toast.service';
import { ArdenaGameSpec } from '../src/types/game.types';

// Mock Browser Environment APIs for JSDOM
beforeAll(() => {
  if (typeof window !== 'undefined') {
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-sb3-url');
    window.URL.revokeObjectURL = jest.fn();
    HTMLAnchorElement.prototype.click = jest.fn();
  }
});

const MOCK_GENERATED_GAME: ArdenaGameSpec = {
  title: 'Petualangan Komet Emas AI',
  genre: 'catching-game',
  description: 'Tangkap komet berkilau di galaksi dan raih skor tertinggi.',
  rules: {
    winCondition: 'Kumpulkan 100 poin sebelum waktu habis!',
    loseCondition: 'Waktu 60 detik habis.',
    timeLimitSeconds: 60,
  },
  sprites: [
    {
      name: 'KucingAstronot',
      role: 'player',
      costume: 'cat_space',
      initialPosition: { x: 0, y: -120 },
      scripts: [{ trigger: 'when_green_flag_clicked', action: 'move_with_arrows' }],
    },
    {
      name: 'KometEmas',
      role: 'collectible',
      costume: 'golden_comet',
      initialPosition: { x: 50, y: 150 },
      scripts: [{ trigger: 'when_green_flag_clicked', action: 'glide_down' }],
    },
  ],
  variables: [{ name: 'SkorKomet', initialValue: 0 }],
  soundEffects: ['ding.wav', 'victory.wav'],
};

const MOCK_GENERATE_RESULT: GenerateGameResult = {
  schemaVersion: '1.0',
  game: MOCK_GENERATED_GAME,
  diffCounters: {
    spritesCount: 2,
    variablesCount: 1,
    sfxCount: 2,
    blocksCount: 4,
    overwrittenBlocksCount: 0,
  },
  meta: {
    provider: 'gemini',
    modelUsed: 'gemini-2.0-flash',
    durationMs: 850,
    requestId: 'req-mock-123',
  },
};

describe('End-to-End User Journey Verification (FE-07: UI 01 s/d UI 19)', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await storageService.clearAllData();
    toast.clearAll();
    jest.clearAllMocks();

    // Default: Mock checkHealth to succeed
    jest.spyOn(apiService, 'checkHealth').mockResolvedValue({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: 120,
    } as any);

    // Default: Mock getCapabilities to succeed
    jest.spyOn(apiService, 'getCapabilities').mockResolvedValue({
      service: 'ardena-backend',
      version: '1.0.0',
      templates: [
        { key: 'catching-game', name: 'Tangkap Bintang', description: 'Game tangkap bintang' },
        { key: 'maze-adventure', name: 'Labirin Misterius', description: 'Game labirin' },
        { key: 'space-shooter', name: 'Tembak Antariksa', description: 'Game aksi antariksa' },
      ],
      models: ['gemini-2.0-flash'],
      features: ['hexa-cluster', 'zero-overwrite', 'sb3-export'],
    } as any);
  });

  // TEST-FE07-01: Journey 1
  // Landing (UI 01) -> Onboarding (UI 02) -> Start Mode (UI 04) -> Blank Editor (UI 06, UI 07) -> Help Modal (UI 16)
  describe('1. Journey 1: Onboarding Pemula & Eksplorasi Editor (UI 01, UI 02, UI 04, UI 06, UI 07, UI 16)', () => {
    it('harus menyelesaikan onboarding langkah 1-3, membuka mode selector, masuk ke editor kosong, dan melihat panduan balok', async () => {
      render(<ViewRouter initialView="landing" />);

      // UI 01: Welcome Landing View
      expect(
        screen.getByText(/Wujudkan Ide Game Impianmu Jadi Nyata/i)
      ).toBeTruthy();
      expect(screen.getByText(/Mulai Sekarang — Gratis/i)).toBeTruthy();

      // Klik tombol CTA utama
      fireEvent.click(screen.getByText(/Mulai Sekarang — Gratis/i));

      // UI 02: Onboarding Modal muncul karena belum pernah onboarding
      await waitFor(() => {
        expect(screen.getByText(/Tulis Ide Game dalam Bahasa Apapun/i)).toBeTruthy();
      });

      // Step 1 -> Klik Lanjut
      fireEvent.click(screen.getByText('Lanjut'));

      // Step 2
      await waitFor(() => {
        expect(screen.getByText(/Review Hasil AI Tanpa Rasa Takut/i)).toBeTruthy();
      });
      fireEvent.click(screen.getByText('Lanjut'));

      // Step 3
      await waitFor(() => {
        expect(screen.getByText(/Mainkan & Modifikasi di Scratch Asli/i)).toBeTruthy();
      });

      // Selesaikan Onboarding (Tombol: 🚀 Mulai Berkreasi)
      fireEvent.click(screen.getByText(/Mulai Berkreasi/i));

      // Verifikasi status tersimpan di localStorage
      expect(localStorage.getItem('ardena_onboarding_completed')).toBe('true');

      // UI 04: StartModeSelector terbuka otomatis
      await waitFor(() => {
        expect(screen.getByText(/Pilih Cara Memulai Game Baru/i)).toBeTruthy();
      });

      // Pilih mode kanvas kosong Scratch murni (Editor Kosong)
      const blankBtn = screen.getByText('Editor Kosong');
      expect(blankBtn).toBeTruthy();
      fireEvent.click(blankBtn);

      // UI 06 & UI 07: Editor Workspace & Creative Studio Kanvas
      await waitFor(() => {
        expect(screen.getByText('Game Scratch Kosong')).toBeTruthy();
        expect(screen.getByText(/Tersimpan \(IndexedDB\)/i)).toBeTruthy();
      });

      // Verifikasi komponen panggung (Stage) dan palet kategori balok
      expect(screen.getByText(/Panggung Scratch/i)).toBeTruthy();
      expect(screen.getByTitle('Gerakan')).toBeTruthy();
      expect(screen.getByTitle('Kejadian')).toBeTruthy();
      expect(screen.getByTitle('Kontrol')).toBeTruthy();
      expect(screen.getByTitle('Variabel')).toBeTruthy();
      expect(screen.getByText('Palet Balok Scratch 3.0')).toBeTruthy();

      // Buka Pusat Bantuan Glosarium Balok Resmi Scratch Foundation (UI 16)
      const helpBtn = screen.getByTitle('Panduan Balok & Bantuan');
      expect(helpBtn).toBeTruthy();
      fireEvent.click(helpBtn);

      // Verifikasi UI 16 (BlockHelpGuideModal) terbuka
      await waitFor(() => {
        expect(screen.getByText(/Pusat Bantuan & Panduan Balok Scratch 3.0/i)).toBeTruthy();
        expect(screen.getByText(/Glosarium Balok Scratch 3.0/i)).toBeTruthy();
      });

      // Klik tab Glosarium Balok Scratch 3.0
      fireEvent.click(screen.getByText(/Glosarium Balok Scratch 3.0/i));
      await waitFor(() => {
        expect(screen.getAllByText(/gerak \(10\) langkah/i).length).toBeGreaterThanOrEqual(1);
      });

      // Tutup modal panduan
      fireEvent.click(screen.getByText('Tutup Panduan'));
      await waitFor(() => {
        expect(screen.queryByText(/Pusat Bantuan & Panduan Balok Scratch 3.0/i)).toBeNull();
      });
    });
  });

  // TEST-FE07-02: Journey 2
  // Template Catalog (UI 05) -> Editor (UI 06) -> Prompt AI -> Generating (UI 08) -> Review Gate (UI 09) -> Playtest Banner (UI 10)
  describe('2. Journey 2: Kreasi Game via AI Copilot & Zero Overwrite Review Gate (UI 05, UI 06, UI 08, UI 09, UI 10)', () => {
    it('harus memilih template, mengirim prompt ke AI copilot, menampilkan progress overlay, memvalidasi diff bento box, dan mengaktifkan banner playtest', async () => {
      jest.spyOn(apiService, 'generateGame').mockResolvedValue(MOCK_GENERATE_RESULT);

      render(<ViewRouter initialView="templates" />);

      // UI 05: Template Catalog View
      await waitFor(() => {
        expect(screen.getByText(/Katalog Template Game Resmi/i)).toBeTruthy();
        expect(screen.getByText(/Catching Game/i)).toBeTruthy();
      });

      // Klik "Gunakan Template" pada Catching Game
      const useTemplateBtns = screen.getAllByText(/Gunakan Template/i);
      fireEvent.click(useTemplateBtns[0]);

      // UI 06: Masuk ke Editor Workspace dengan template aktif
      await waitFor(() => {
        expect(screen.getByText(/Game Template \(catching-game\)/i)).toBeTruthy();
      });

      // Temukan panel AI Copilot di sebelah kanan (Opsi A: Right Dock)
      expect(screen.getByText('Ardena AI Copilot')).toBeTruthy();
      const promptInput = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(promptInput).toBeTruthy();

      // Isi prompt
      fireEvent.change(promptInput, {
        target: { value: 'Tambahkan komet emas yang bernilai 5 poin jika ditangkap' },
      });

      // Klik tombol generate game Scratch
      const generateBtn = screen.getByText(/Generate Game Scratch/i);
      fireEvent.click(generateBtn);

      // UI 08: Indikator Proses AI (GeneratingOverlay / Sedang Merakit)
      await waitFor(() => {
        expect(screen.getByText(/Menganalisis Ide Cerita/i)).toBeTruthy();
      });

      // Tunggu respons backend & UI 09: ReviewGateModal terbuka
      await waitFor(() => {
        expect(screen.getByText(/Review Hasil AI Copilot • Zero Overwrite Gate/i)).toBeTruthy();
      });

      // Verifikasi Bento Box Counters (UI 09)
      expect(screen.getByText('0 (Aman)')).toBeTruthy();
      expect(screen.getByText('+2 Baru')).toBeTruthy();
      expect(screen.getByText('+4 Balok')).toBeTruthy();
      expect(screen.getByText('+1 Global')).toBeTruthy();

      // Klik "Terapkan ke Editor"
      const applyBtn = screen.getByRole('button', { name: /Terapkan ke Editor/i });
      fireEvent.click(applyBtn);

      // UI 10: ReviewGate tertutup & ReadyPlaytestBanner muncul
      await waitFor(() => {
        expect(screen.queryByText(/Review Hasil AI Copilot • Zero Overwrite Gate/i)).toBeNull();
        expect(screen.getByText(/Balok Berhasil Dihasilkan!/i)).toBeTruthy();
      });

      // Klik tombol Playtest
      const playtestBtn = screen.getByRole('button', { name: /Playtest/i });
      fireEvent.click(playtestBtn);

      // Panggung kini aktif berjalan
      await waitFor(() => {
        expect(screen.getByText('Sedang Berjalan')).toBeTruthy();
      });
    });
  });

  // TEST-FE07-03: Journey 3
  // Editor -> Save Modal (UI 12) -> Toast (UI 18) -> Project Library (UI 13) -> Export Modal (UI 14) -> Delete (UI 17) -> Undo Toast
  describe('3. Journey 3: Penyimpanan Offline, Pustaka Proyek, Ekspor .sb3, & Pemulihan Undo (UI 12, UI 13, UI 14, UI 17, UI 18)', () => {
    it('harus menyimpan game ke IndexedDB, menampilkannya di pustaka, mengekspor berkas .sb3, serta menghapus dengan opsi Undo', async () => {
      // 1. Render Editor Workspace dan Simpan Proyek (UI 12)
      const handleBackToHome = jest.fn();
      const { unmount } = render(
        <EditorWorkspace
          initialProjectName="Kucing Pemburu Galaksi"
          onBackToHome={handleBackToHome}
        />
      );

      // Klik tombol Simpan di TopNav
      const saveBtn = screen.getByTitle('Simpan Proyek ke Browser');
      fireEvent.click(saveBtn);

      // UI 12: SaveProjectDialog terbuka
      await waitFor(() => {
        expect(screen.getByText(/Simpan Proyek ke Browser/i)).toBeTruthy();
      });

      // Ubah judul
      const titleInput = screen.getByDisplayValue('Kucing Pemburu Galaksi');
      fireEvent.change(titleInput, { target: { value: 'Kucing Pemburu Galaksi Final' } });

      // Klik tombol Simpan ke Browser
      const confirmSaveBtn = screen.getByRole('button', { name: /Simpan ke Browser/i });
      fireEvent.click(confirmSaveBtn);

      // UI 18: Toast Notifikasi sukses tersimpan muncul
      await waitFor(() => {
        expect(screen.getByText(/Proyek Berhasil Disimpan/i)).toBeTruthy();
      });

      // Unmount editor workspace sebelum membuka pustaka
      unmount();

      // 2. Navigasi ke Pustaka Proyek Lokal (UI 13)
      render(<ViewRouter initialView="library" />);

      await waitFor(() => {
        expect(screen.getByText('Pustaka Proyek Lokal')).toBeTruthy();
        expect(screen.getByText('Kucing Pemburu Galaksi Final')).toBeTruthy();
      });

      // Uji fitur Filter/Search di pustaka
      const searchInput = screen.getByPlaceholderText(/Cari nama atau tag/i);
      fireEvent.change(searchInput, { target: { value: 'NonExistentProject' } });
      await waitFor(() => {
        expect(screen.getByText(/Tidak Ada Proyek yang Cocok/i)).toBeTruthy();
      });

      fireEvent.change(searchInput, { target: { value: 'Kucing' } });
      await waitFor(() => {
        expect(screen.getByText('Kucing Pemburu Galaksi Final')).toBeTruthy();
      });

      // 3. Uji Ekspor Proyek .sb3 (UI 14)
      const exportIconBtn = screen.getByTitle('Ekspor .sb3');
      fireEvent.click(exportIconBtn);

      // UI 14: ExportSb3Modal terbuka
      await waitFor(() => {
        expect(screen.getByText(/Ekspor Proyek ke Scratch 3.0 \(\.sb3\)/i)).toBeTruthy();
        expect(screen.getByText(/100% Valid Scratch 3.0 AST & VM Compatible/i)).toBeTruthy();
      });

      // Klik Unduh Berkas .sb3 Asli
      const downloadSb3Btn = screen.getByText(/Unduh Paket \.sb3 Sekarang/i);
      fireEvent.click(downloadSb3Btn);

      await waitFor(() => {
        expect(window.URL.createObjectURL).toHaveBeenCalled();
        expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
      });

      // Tutup modal ekspor
      const closeExportBtn = screen.getByText('Tutup');
      fireEvent.click(closeExportBtn);

      // 4. Uji Dialog Konfirmasi Hapus (UI 17) & Pemulihan Undo (UI 18)
      const deleteIconBtn = screen.getByTitle('Hapus Proyek');
      fireEvent.click(deleteIconBtn);

      // UI 17: ConfirmationModal terbuka
      await waitFor(() => {
        expect(screen.getByText(/Hapus Proyek dari Penyimpanan Browser\?/i)).toBeTruthy();
        expect(screen.getByText(/Hapus Permanen/i)).toBeTruthy();
      });

      // Klik konfirmasi hapus
      fireEvent.click(screen.getByText(/Hapus Permanen/i));

      // Verifikasi proyek terhapus dari tampilan
      await waitFor(() => {
        expect(screen.queryByText(/Hapus Proyek dari Penyimpanan Browser\?/i)).toBeNull();
        expect(screen.getByText(/Belum Ada Proyek Tersimpan/i)).toBeTruthy();
      });

      // UI 18: Toast Undo muncul dengan tombol 'Batal / Undo'
      await waitFor(() => {
        expect(screen.getByText(/Proyek Dihapus/i)).toBeTruthy();
        expect(screen.getByText(/Batal \/ Undo/i)).toBeTruthy();
      });

      // Klik 'Batal / Undo' untuk memulihkan proyek
      fireEvent.click(screen.getByText(/Batal \/ Undo/i));

      // Verifikasi proyek berhasil dipulihkan kembali ke pustaka
      await waitFor(() => {
        expect(screen.getByText(/Proyek Dipulihkan/i)).toBeTruthy();
        expect(screen.getByText('Kucing Pemburu Galaksi Final')).toBeTruthy();
      });
    });
  });

  // TEST-FE07-04: Journey 4
  // Resiliensi Error: Safe Error Recovery (UI 11) & Rate Limit Countdown (UI 19)
  describe('4. Journey 4: Resiliensi Error & Rate Limit Countdown (UI 11, UI 15, UI 19)', () => {
    it('harus menampilkan ErrorRecoveryDialog jika backend port 3001 tidak merespons', async () => {
      // Mock kegagalan backend port 3001
      jest.spyOn(apiService, 'generateGame').mockRejectedValueOnce({
        code: 'NETWORK_ERROR',
        message: 'Koneksi ke backend gagal. Pastikan port 3001 aktif.',
      });

      render(
        <EditorWorkspace
          initialProjectName="Tes Resiliensi Error"
          onBackToHome={jest.fn()}
        />
      );

      const promptInput = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(promptInput, { target: { value: 'Buat game aksi luar angkasa' } });

      const generateBtn = screen.getByText(/Generate Game Scratch/i);
      fireEvent.click(generateBtn);

      // UI 11: ErrorRecoveryDialog muncul dengan pesan ramah pemula
      await waitFor(() => {
        expect(screen.getByText(/Pusat Bantuan & Pemulihan Cepat/i)).toBeTruthy();
        expect(screen.getByText(/Koneksi ke Server Terputus/i)).toBeTruthy();
        expect(screen.getAllByText(/port 3001/i).length).toBeGreaterThanOrEqual(1);
      });

      // Klik Tutup pada dialog error
      fireEvent.click(screen.getByText('Tutup'));
      await waitFor(() => {
        expect(screen.queryByText(/Pusat Bantuan & Pemulihan Cepat/i)).toBeNull();
      });
    });

    it('harus menghitung mundur di RateLimitCountdownModal (UI 19) dan membuka kunci setelah timer selesai', () => {
      jest.useFakeTimers();

      const handleRetry = jest.fn();
      const handleClose = jest.fn();

      render(
        <RateLimitCountdownModal
          isOpen={true}
          initialSeconds={15}
          onRetry={handleRetry}
          onClose={handleClose}
        />
      );

      // UI 19: RateLimitCountdownModal muncul
      expect(screen.getByText(/Pendinginan Kuota AI/i)).toBeTruthy();
      expect(screen.getByText(/Free API/i)).toBeTruthy();
      expect(screen.getByText('detik')).toBeTruthy();

      // Tombol masih terkunci saat hitung mundur
      const disabledBtn = screen.getByRole('button', { name: /Tunggu \(15s\)/i });
      expect((disabledBtn as HTMLButtonElement).disabled).toBe(true);

      // Majukan timer 15 detik
      act(() => {
        jest.advanceTimersByTime(15000);
      });

      // Tombol aktif seketika timer mencapai 0
      const activeBtn = screen.getByRole('button', { name: /Coba Lagi Sekarang/i });
      expect((activeBtn as HTMLButtonElement).disabled).toBe(false);

      fireEvent.click(activeBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('harus merender modal Preferensi Studio (UI 15) dengan 4 tab konfigurasi', async () => {
      const handleClose = jest.fn();
      render(<PreferencesModal isOpen={true} onClose={handleClose} />);

      // UI 15: Preferences Modal
      expect(screen.getByText(/Pengaturan & Preferensi Studio/i)).toBeTruthy();
      expect(screen.getByText(/Mesin AI & Gateway/i)).toBeTruthy();
      expect(screen.getByText(/Penyimpanan & IndexedDB/i)).toBeTruthy();
      expect(screen.getByText(/Tampilan & Aksesibilitas/i)).toBeTruthy();
      expect(screen.getByText(/Privasi & Tentang/i)).toBeTruthy();

      // Verifikasi tab Privasi & Tentang
      fireEvent.click(screen.getByText(/Privasi & Tentang/i));
      await waitFor(() => {
        expect(screen.getByText(/Ardena Playground Web v1.0.0-rc1/i)).toBeTruthy();
        expect(screen.getByText(/Scratch 3.0 Compatible/i)).toBeTruthy();
      });

      // Klik Selesai
      fireEvent.click(screen.getByText('Selesai'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
