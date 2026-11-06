import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ReviewGateModal } from '../src/components/modals/ReviewGateModal';
import { ErrorRecoveryDialog } from '../src/components/modals/ErrorRecoveryDialog';
import { RateLimitCountdownModal } from '../src/components/modals/RateLimitCountdownModal';
import { EditorWorkspace } from '../src/components/editor/EditorWorkspace';
import { apiService } from '../src/services/api.service';
import { ArdenaGameSpec, ApiClientError } from '../src/types/game.types';

const MOCK_GAME_SPEC: ArdenaGameSpec = {
  title: 'Labirin Kucing Mistis',
  genre: 'maze-adventure',
  description: 'Bantu kucing mencari jalan keluar dari labirin berhantu',
  sprites: [
    {
      name: 'Kucing Hero',
      role: 'player',
      costume: 'cat.png',
      initialPosition: { x: -150, y: -100 },
      scripts: [{ trigger: 'when_green_flag_clicked', action: 'move' }],
    },
    {
      name: 'Hantu Patroli',
      role: 'obstacle',
      costume: 'ghost.png',
      initialPosition: { x: 50, y: 50 },
      scripts: [{ trigger: 'when_green_flag_clicked', action: 'patrol' }],
    },
    {
      name: 'Kunci Emas',
      role: 'collectible',
      costume: 'key.png',
      initialPosition: { x: 150, y: 100 },
      scripts: [{ trigger: 'when_green_flag_clicked', action: 'wait_pickup' }],
    },
  ],
  variables: [{ name: 'Kunci', initialValue: 0 }],
  rules: {
    winCondition: 'Mengumpulkan 1 Kunci Emas',
    loseCondition: 'Tertangkap Hantu Patroli',
  },
  soundEffects: ['meow.wav', 'victory.wav'],
};

describe('Frontend Review Gate & Error Recovery — Sub-Fase FE-04', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST-FE04-01 & TEST-FE04-02: ReviewGateModal
  describe('1. ReviewGateModal (UI 09)', () => {
    it('harus merender bento box diff counters, deskripsi naratif, dan memicu tombol aksi', () => {
      const handleApply = jest.fn();
      const handleRegenerate = jest.fn();
      const handleClose = jest.fn();

      render(
        <ReviewGateModal
          isOpen={true}
          gameSpec={MOCK_GAME_SPEC}
          diffCounters={{
            spritesCount: 3,
            variablesCount: 1,
            sfxCount: 2,
            blocksCount: 3,
            overwrittenBlocksCount: 0,
          }}
          promptText="Buat game labirin kucing mencari kunci"
          onApply={handleApply}
          onRegenerate={handleRegenerate}
          onClose={handleClose}
        />
      );

      // Verifikasi Prompt
      expect(
        screen.getByText(/Buat game labirin kucing mencari kunci/i)
      ).toBeTruthy();

      // Verifikasi Bento Box Diff Counters
      expect(screen.getByText('+3 Baru')).toBeTruthy();
      expect(screen.getByText('+1 Global')).toBeTruthy();
      expect(screen.getByText('+2 Efek')).toBeTruthy();
      expect(screen.getByText('+3 Balok')).toBeTruthy();
      expect(screen.getByText('0 (Aman)')).toBeTruthy();

      // Verifikasi Detail Aturan
      expect(screen.getByText(/Labirin Kucing Mistis/i)).toBeTruthy();
      expect(screen.getByText(/Mengumpulkan 1 Kunci Emas/i)).toBeTruthy();
      expect(screen.getByText(/Tertangkap Hantu Patroli/i)).toBeTruthy();

      // Klik tombol Regenerate
      const regenBtn = screen.getByText(/Buat Ulang \(Regenerate\)/i);
      fireEvent.click(regenBtn);
      expect(handleRegenerate).toHaveBeenCalledTimes(1);

      // Klik tombol Terapkan
      const applyBtn = screen.getByText(/Terapkan ke Editor/i);
      fireEvent.click(applyBtn);
      expect(handleApply).toHaveBeenCalledTimes(1);

      // Klik tombol Batal
      const cancelBtn = screen.getByText(/Batal \/ Kembali/i);
      fireEvent.click(cancelBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  // TEST-FE04-03: ErrorRecoveryDialog
  describe('2. ErrorRecoveryDialog (UI 11)', () => {
    it('harus memetakan error code PAYLOAD_TOO_LARGE dengan penjelasan instruksi panjang', () => {
      const handleClose = jest.fn();
      const handleRetry = jest.fn();

      render(
        <ErrorRecoveryDialog
          isOpen={true}
          errorCode="PAYLOAD_TOO_LARGE"
          onRetry={handleRetry}
          onClose={handleClose}
        />
      );

      expect(screen.getByText(/Instruksi Terlalu Panjang/i)).toBeTruthy();
      expect(screen.getByText(/batas payload 10 MB/i)).toBeTruthy();

      const retryBtn = screen.getByText(/Coba Lagi/i);
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('harus memetakan error code INVALID_REQUEST_BODY dengan tips kata kerja aksi', () => {
      render(
        <ErrorRecoveryDialog
          isOpen={true}
          errorCode="INVALID_REQUEST_BODY"
          errorMessage="Prompt terlalu pendek"
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText(/Format Prompt Belum Sesuai/i)).toBeTruthy();
      expect(screen.getByText(/menangkap/i)).toBeTruthy();
    });

    it('harus memetakan error code NETWORK_ERROR dengan saran periksa server port 3001', () => {
      render(
        <ErrorRecoveryDialog
          isOpen={true}
          errorCode="NETWORK_ERROR"
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText(/Koneksi ke Server Terputus/i)).toBeTruthy();
      expect(screen.getAllByText(/port 3001/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  // TEST-FE04-04: RateLimitCountdownModal
  describe('3. RateLimitCountdownModal (UI 19)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('harus menghitung mundur dari detik awal ke 0 dan membuka tombol retry', () => {
      const handleRetry = jest.fn();
      const handleClose = jest.fn();

      render(
        <RateLimitCountdownModal
          isOpen={true}
          initialSeconds={3}
          onRetry={handleRetry}
          onClose={handleClose}
        />
      );

      expect(screen.getByText(/Pendinginan Kuota AI/i)).toBeTruthy();
      expect(screen.getByText(/03/)).toBeTruthy();

      // Tombol masih terkunci saat hitung mundur berjalan
      const disabledBtn = screen.getByRole('button', { name: /Tunggu \(3s\)/i });
      expect((disabledBtn as HTMLButtonElement).disabled).toBe(true);

      // Percepat waktu 3 detik
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Tombol aktif seketika timer 0
      const activeBtn = screen.getByRole('button', {
        name: /Coba Lagi Sekarang/i,
      });
      expect((activeBtn as HTMLButtonElement).disabled).toBe(false);

      fireEvent.click(activeBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  // TEST-FE04-05: End-to-End Zero Overwrite Flow di EditorWorkspace
  describe('4. Alur Integrasi Review Gate di EditorWorkspace', () => {
    it('harus membuka ReviewGateModal setelah generasi sukses dan menampilkan Playtest Banner hanya setelah dikonfirmasi', async () => {
      jest.spyOn(apiService, 'generateGame').mockResolvedValue({
        schemaVersion: '1.0',
        game: MOCK_GAME_SPEC,
        diffCounters: {
          spritesCount: 3,
          variablesCount: 1,
          sfxCount: 2,
          blocksCount: 3,
          overwrittenBlocksCount: 0,
        },
        meta: {
          provider: 'gemini',
          modelUsed: 'gemini-2.5-flash',
          durationMs: 300,
          requestId: 'test-review-gate-id',
        },
      });

      render(
        <EditorWorkspace
          initialProjectName="Editor Uji Coba"
          onBackToHome={jest.fn()}
        />
      );

      // Isi prompt dan submit
      const textarea = screen.getByPlaceholderText(/Jelaskan ceritamu/i);
      fireEvent.change(textarea, {
        target: { value: 'Game labirin kucing mistis' },
      });
      fireEvent.click(screen.getByText(/Generate Game Scratch/i));

      // Menunggu modal ReviewGateModal (UI 09) terbuka
      await waitFor(() => {
        expect(
          screen.getByText(/Review Hasil AI Copilot • Zero Overwrite Gate/i)
        ).toBeTruthy();
      });

      // Banner playtest belum muncul sebelum ditekan "Terapkan ke Editor"
      expect(screen.queryByText(/Siap Diuji/i)).toBeNull();

      // Tekan tombol "Terapkan ke Editor"
      fireEvent.click(screen.getByText(/Terapkan ke Editor/i));

      // Modal tertutup dan ReadyPlaytestBanner (UI 10) muncul di panggung!
      await waitFor(() => {
        expect(
          screen.getByText(/Labirin Kucing Mistis Siap Diuji/i)
        ).toBeTruthy();
      });
    });

    it('harus membuka RateLimitCountdownModal jika backend mengembalikan error dengan retryAfterSeconds', async () => {
      const rateLimitError = new ApiClientError({
        message: 'Cascading cooldown active',
        code: 'AI_PROVIDER_ERROR',
        statusCode: 502,
        retryable: true,
        retryAfterSeconds: 15,
      });
      jest.spyOn(apiService, 'generateGame').mockRejectedValue(rateLimitError);

      render(
        <EditorWorkspace
          initialProjectName="Editor Uji Rate Limit"
          onBackToHome={jest.fn()}
        />
      );

      const textarea = screen.getByPlaceholderText(/Jelaskan ceritamu/i);
      fireEvent.change(textarea, {
        target: { value: 'Uji rate limit cascading' },
      });
      fireEvent.click(screen.getByText(/Generate Game Scratch/i));

      // Modal Rate Limit Countdown (UI 19) harus terbuka otomatis
      await waitFor(() => {
        expect(screen.getByText(/Pendinginan Kuota AI/i)).toBeTruthy();
      });
    });
  });
});
