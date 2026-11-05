import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditorWorkspace } from '../src/components/editor/EditorWorkspace';
import { AICopilotPanel } from '../src/components/editor/AICopilotPanel';
import { GeneratingOverlay } from '../src/components/editor/GeneratingOverlay';
import { ReadyPlaytestBanner } from '../src/components/editor/ReadyPlaytestBanner';
import { apiService } from '../src/services/api.service';
import { ArdenaGameSpec } from '../src/types/game.types';

const MOCK_GAME_SPEC: ArdenaGameSpec = {
  title: 'Petualangan Luar Angkasa AI',
  genre: 'catching-game',
  description: 'Tangkap bintang di galaksi',
  sprites: [
    {
      name: 'Astronot',
      role: 'player',
      costume: 'astronaut.png',
      initialPosition: { x: 0, y: -100 },
      scripts: [{ trigger: 'when_green_flag_clicked', action: 'forever_move' }],
    },
    {
      name: 'Bintang',
      role: 'collectible',
      costume: 'star.png',
      initialPosition: { x: 50, y: 150 },
      scripts: [{ trigger: 'when_green_flag_clicked', action: 'fall_down' }],
    },
  ],
  variables: [{ name: 'Skor', initialValue: 0 }],
  rules: {
    winCondition: 'Skor mencapai 100',
    loseCondition: 'Waktu habis',
  },
  soundEffects: ['tangkap.wav'],
};

describe('Frontend Scratch Editor & AI Copilot — Sub-Fase FE-03', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST-FE03-01: EditorTopNav & EditorWorkspace Layout
  describe('1. EditorWorkspace (UI 06)', () => {
    it('harus merender topbar navigasi, nama proyek, kontrol play/stop, dan dock Copilot', () => {
      const handleBack = jest.fn();

      render(
        <EditorWorkspace
          initialProjectName="Petualangan Luar Angkasa"
          onBackToHome={handleBack}
        />
      );

      // Verifikasi Topbar
      expect(screen.getByText('Petualangan Luar Angkasa')).toBeTruthy();
      expect(screen.getByText(/Tersimpan \(IndexedDB\)/i)).toBeTruthy();

      // Klik tombol kembali
      const backBtn = screen.getByText('Dashboard');
      fireEvent.click(backBtn);
      expect(handleBack).toHaveBeenCalledTimes(1);

      // Toggle Play/Stop
      const playBtn = screen.getByTitle(/Mulai Game/i);
      fireEvent.click(playBtn);
      expect(screen.getByText('Sedang Berjalan')).toBeTruthy();

      const stopBtn = screen.getByTitle(/Hentikan Game/i);
      fireEvent.click(stopBtn);
      expect(screen.getByText('Siap')).toBeTruthy();

      // Toggle Panel AI Copilot
      const toggleCopilotBtn = screen.getByRole('button', { name: /AI Copilot/i });
      fireEvent.click(toggleCopilotBtn);
      // Panel ditutup
      expect(screen.queryByLabelText('Panel AI Copilot')).toBeNull();
    });
  });

  // TEST-FE03-02 & TEST-FE03-03: AICopilotPanel Tabs & Prompt Chips
  describe('2. AICopilotPanel (Dock Kanan)', () => {
    it('harus mengganti tab mode (Buat, Ubah, Jelaskan) dengan benar', () => {
      const handleGenerate = jest.fn();
      const handleClose = jest.fn();

      render(
        <AICopilotPanel
          isOpen={true}
          onClose={handleClose}
          onGenerate={handleGenerate}
        />
      );

      // Mode awal adalah Buat
      expect(screen.getByText(/Ide Permainan Baru/i)).toBeTruthy();

      // Klik tab Ubah
      fireEvent.click(screen.getByText(/🛠️ Ubah/i));
      expect(screen.getByText(/Instruksi Modifikasi/i)).toBeTruthy();

      // Klik tab Jelaskan
      fireEvent.click(screen.getByText(/📖 Jelaskan/i));
      expect(screen.getByText(/Pertanyaan Logika Balok/i)).toBeTruthy();
    });

    it('harus mengisi prompt saat tombol inspirasi cepat diklik', () => {
      const handleGenerate = jest.fn();

      render(
        <AICopilotPanel
          isOpen={true}
          onClose={jest.fn()}
          onGenerate={handleGenerate}
        />
      );

      const chip = screen.getByText(/Buat game astronot menangkap bintang/i);
      fireEvent.click(chip);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toContain('Buat game astronot menangkap bintang');

      // Submit form
      const submitBtn = screen.getByText(/Generate Game Scratch/i);
      fireEvent.click(submitBtn);

      expect(handleGenerate).toHaveBeenCalledWith(
        expect.stringContaining('Buat game astronot menangkap bintang'),
        undefined
      );
    });
  });

  // TEST-FE03-04: GeneratingOverlay 4-Stage Progress & Abort
  describe('3. GeneratingOverlay (UI 08)', () => {
    it('harus menampilkan tahapan proses AI dan memanggil callback pembatalan', () => {
      const handleAbort = jest.fn();

      render(
        <GeneratingOverlay
          isOpen={true}
          onAbort={handleAbort}
          minStageDurationMs={50}
        />
      );

      expect(screen.getByRole('alert')).toBeTruthy();
      expect(screen.getByText(/Menganalisis Ide Cerita/i)).toBeTruthy();
      expect(screen.getByText(/Hexa-Cluster AI Cascading/i)).toBeTruthy();

      // Klik batalkan
      const abortBtn = screen.getByText(/Batalkan Proses/i);
      fireEvent.click(abortBtn);
      expect(handleAbort).toHaveBeenCalledTimes(1);
    });
  });

  // TEST-FE03-05: ReadyPlaytestBanner Diff Counters
  describe('4. ReadyPlaytestBanner (UI 10)', () => {
    it('harus menampilkan bento Diff Counters dan tombol Playtest saat aktif', () => {
      const handlePlaytest = jest.fn();
      const handleDismiss = jest.fn();

      render(
        <ReadyPlaytestBanner
          isVisible={true}
          gameTitle="Game Menangkap Apel"
          diffCounters={{
            spritesCount: 2,
            variablesCount: 1,
            sfxCount: 1,
            blocksCount: 4,
            overwrittenBlocksCount: 0,
          }}
          onPlaytest={handlePlaytest}
          onDismiss={handleDismiss}
        />
      );

      expect(screen.getByText(/Game Menangkap Apel Siap Diuji/i)).toBeTruthy();
      expect(screen.getByText(/\+2 Sprite/i)).toBeTruthy();
      expect(screen.getByText(/\+4 Balok/i)).toBeTruthy();
      expect(screen.getByText(/0 Overwrite/i)).toBeTruthy();

      // Klik tombol Playtest
      const playtestBtn = screen.getByText(/Playtest/i);
      fireEvent.click(playtestBtn);
      expect(handlePlaytest).toHaveBeenCalledTimes(1);

      // Klik tombol Dismiss
      const dismissBtn = screen.getByTitle(/Tutup Notifikasi/i);
      fireEvent.click(dismissBtn);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  // TEST-FE03-06: End-to-End AI Generation di Workspace
  describe('5. End-to-End Game Generation di EditorWorkspace', () => {
    it('harus memanggil apiService.generateGame, menampilkan overlay, dan memunculkan banner ready', async () => {
      jest.spyOn(apiService, 'generateGame').mockResolvedValue({
        schemaVersion: '1.0',
        game: MOCK_GAME_SPEC,
        diffCounters: {
          spritesCount: 2,
          variablesCount: 1,
          sfxCount: 1,
          blocksCount: 2,
          overwrittenBlocksCount: 0,
        },
        meta: {
          provider: 'gemini',
          modelUsed: 'gemini-2.5-flash',
          durationMs: 450,
          requestId: 'test-req-id-123',
        },
      });

      const handleGameGenerated = jest.fn();

      render(
        <EditorWorkspace
          initialProjectName="Proyek Tes AI"
          onBackToHome={jest.fn()}
          onGameGenerated={handleGameGenerated}
        />
      );

      // Isi prompt
      const textarea = screen.getByPlaceholderText(/Jelaskan ceritamu/i);
      fireEvent.change(textarea, {
        target: { value: 'Buat game astronot menangkap komet' },
      });

      // Klik generate
      const generateBtn = screen.getByText(/Generate Game Scratch/i);
      fireEvent.click(generateBtn);

      // Menunggu selesai generate
      await waitFor(() => {
        expect(apiService.generateGame).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: 'Buat game astronot menangkap komet',
            template: 'catching-game',
            schemaVersion: '1.0',
          })
        );
      });

      // Banner playtest muncul dengan judul game hasil AI
      await waitFor(() => {
        expect(
          screen.getByText(/Petualangan Luar Angkasa AI Siap Diuji/i)
        ).toBeTruthy();
      });

      expect(handleGameGenerated).toHaveBeenCalledTimes(1);
    });
  });
});
