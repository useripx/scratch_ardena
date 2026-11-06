import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { storageService } from '../src/services/storage.service';
import { EditorTopNav } from '../src/components/editor/EditorTopNav';
import { AICopilotPanel } from '../src/components/editor/AICopilotPanel';
import { RateLimitCountdownModal } from '../src/components/modals/RateLimitCountdownModal';
import { EditorWorkspace } from '../src/components/editor/EditorWorkspace';
import { apiService } from '../src/services/api.service';
import {
  INITIAL_WELCOME_CREDITS,
  DAILY_REFRESH_CREDITS,
  AI_ACTION_CREDIT_COSTS,
} from '../src/types/game.types';

// Mock API service for integration tests
jest.mock('../src/services/api.service', () => ({
  apiService: {
    generateGame: jest.fn(),
  },
}));

describe('AI Agent Credit Economy & Live Integration (Tahap 05/06)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await storageService.clearAllData();
    await storageService.resetCredits();
  });

  describe('1. StorageService Credit Wallet Operations', () => {
    it('harus menginisialisasi saldo awal 5.500 poin untuk pengguna baru', async () => {
      const credits = await storageService.getCredits();
      expect(credits.balance).toBe(INITIAL_WELCOME_CREDITS);
      expect(credits.balance).toBe(5500);
      expect(credits.history?.length).toBeGreaterThanOrEqual(1);
      expect(credits.history?.[0]?.type).toBe('welcome');
      expect(credits.history?.[0]?.amount).toBe(5500);
    });

    it('tidak boleh menambah saldo harian berulang kali pada hari yang sama', async () => {
      const firstCall = await storageService.getCredits();
      expect(firstCall.balance).toBe(5500);

      const secondCall = await storageService.getCredits();
      expect(secondCall.balance).toBe(5500);
      expect((secondCall.history || []).filter((h) => h.type === 'daily_refresh').length).toBe(0);
    });

    it('harus otomatis menambah +500 poin harian ketika tanggal berubah (hari baru)', async () => {
      // Simulasikan pengguna membuka web kemarin dengan saldo sisa 3000
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      await storageService.saveCredits({
        balance: 3000,
        lastDailyCreditDate: yesterday,
        totalCreditsEarned: 3000,
        totalCreditsSpent: 0,
        history: [
          {
            id: 'mock-1',
            timestamp: new Date().toISOString(),
            amount: 3000,
            type: 'welcome',
            description: 'Saldo kemarin',
          },
        ],
      });

      // Panggil getCredits hari ini -> harus otomatis dapat +500 poin
      const refreshed = await storageService.getCredits();
      expect(refreshed.balance).toBe(3000 + DAILY_REFRESH_CREDITS);
      expect(refreshed.balance).toBe(3500);
      expect((refreshed.history || []).some((h) => h.type === 'daily_refresh' && h.amount === 500)).toBe(true);
    });

    it('harus memotong saldo dengan benar saat aksi AI dipanggil', async () => {
      // Potong 100 poin (mode buat)
      const resBuat = await storageService.deductCredits(AI_ACTION_CREDIT_COSTS.buat, 'Buat Game Arcade');
      expect(resBuat.success).toBe(true);
      expect(resBuat.balance).toBe(5500 - 100);

      // Potong 50 poin (mode ubah)
      const resUbah = await storageService.deductCredits(AI_ACTION_CREDIT_COSTS.ubah, 'Ubah gravitasi');
      expect(resUbah.success).toBe(true);
      expect(resUbah.balance).toBe(5400 - 50);

      // Potong 20 poin (mode jelaskan)
      const resJelaskan = await storageService.deductCredits(AI_ACTION_CREDIT_COSTS.jelaskan, 'Jelaskan kontrol');
      expect(resJelaskan.success).toBe(true);
      expect(resJelaskan.balance).toBe(5350 - 20);
    });

    it('harus menolak pemotongan jika saldo tidak mencukupi (insufficient credits)', async () => {
      // Set saldo ke 40 poin
      await storageService.saveCredits({
        balance: 40,
        lastDailyCreditDate: new Date().toISOString().split('T')[0],
        totalCreditsEarned: 40,
        totalCreditsSpent: 0,
        history: [],
      });

      // Coba potong 100 poin
      const res = await storageService.deductCredits(100, 'Aksi melebihi saldo');
      expect(res.success).toBe(false);
      expect(res.balance).toBe(40); // Saldo tetap utuh
    });

    it('harus dapat menambah saldo secara manual via addCredits', async () => {
      const added = await storageService.addCredits(1000, 'Bonus Event');
      expect(added.balance).toBe(5500 + 1000);
      expect(added.balance).toBe(6500);
    });
  });

  describe('2. UI Integration: EditorTopNav & AICopilotPanel', () => {
    it('harus merender lencana saldo kredit di EditorTopNav', () => {
      render(
        <EditorTopNav
          projectName="Proyek Uji"
          onRenameProject={jest.fn()}
          onBackToHome={jest.fn()}
          isCopilotOpen={true}
          onToggleCopilot={jest.fn()}
          isPlaying={false}
          onTogglePlay={jest.fn()}
          onStop={jest.fn()}
          onSaveProject={jest.fn()}
          onExportSb3={jest.fn()}
          onOpenPreferences={jest.fn()}
          onOpenHelp={jest.fn()}
          creditsBalance={5500}
        />
      );

      expect(screen.getByText('5.500')).toBeTruthy();
      expect(screen.getByTitle(/Saldo Kredit AI Agen/i)).toBeTruthy();
    });

    it('harus menampilkan saldo dan badge biaya aksi di AICopilotPanel', () => {
      render(
        <AICopilotPanel
          isOpen={true}
          onClose={jest.fn()}
          onGenerate={jest.fn()}
          creditsBalance={5500}
        />
      );

      // Saldo badge di header copilot
      expect(screen.getByText(/5\.500 Poin/)).toBeTruthy();

      // Badge biaya pada tab mode
      expect(screen.getByText(/Buat \(-100\)/)).toBeTruthy();
      expect(screen.getByText(/Ubah \(-50\)/)).toBeTruthy();
      expect(screen.getByText(/Jelaskan \(-20\)/)).toBeTruthy();

      // Tombol submit harus menampilkan biaya mode buat (-100 Poin)
      expect(screen.getByText(/Generate Game Scratch \(-100 Poin\)/i)).toBeTruthy();
    });

    it('harus berganti label tombol submit sesuai tab mode yang aktif di AICopilotPanel', () => {
      render(
        <AICopilotPanel
          isOpen={true}
          onClose={jest.fn()}
          onGenerate={jest.fn()}
          creditsBalance={5500}
        />
      );

      // Klik tab Ubah Game
      const ubahTab = screen.getByText(/Ubah \(-50\)/i);
      fireEvent.click(ubahTab);
      expect(screen.getByText(/Terapkan Modifikasi \(-50 Poin\)/i)).toBeTruthy();

      // Klik tab Tanya Tutor
      const jelaskanTab = screen.getByText(/Jelaskan \(-20\)/i);
      fireEvent.click(jelaskanTab);
      expect(screen.getByText(/Tanya Tutor AI \(-20 Poin\)/i)).toBeTruthy();
    });
  });

  describe('3. RateLimitCountdownModal & Credit Exhaustion UI', () => {
    it('harus merender modal penanganan kuota habis dengan saldo sisa', () => {
      render(
        <RateLimitCountdownModal
          isOpen={true}
          initialSeconds={0}
          title="Kredit AI Kamu Sedang Habis"
          description="Aksi ini membutuhkan 100 poin, tetapi saldo tersisa 40 poin."
          creditsRemaining={40}
          onRetry={jest.fn()}
          onClose={jest.fn()}
        />
      );

      expect(screen.getAllByText('Kredit AI Kamu Sedang Habis').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Aksi ini membutuhkan 100 poin/i)).toBeTruthy();
      expect(screen.getByText('🪙 40 Poin')).toBeTruthy();
    });
  });

  describe('4. Full EditorWorkspace Credit Deduction Flow', () => {
    it('harus memotong saldo kredit saat AI Copilot mengirim prompt', async () => {
      (apiService.generateGame as jest.Mock).mockResolvedValueOnce({
        game: {
          title: 'Game Luar Angkasa',
          genre: 'arcade',
          description: 'Game seru luar angkasa',
          rules: { winCondition: 'Skor 10', loseCondition: 'Kalah' },
          sprites: [],
          variables: [],
          soundEffects: [],
        },
        diffCounters: { added: 5, modified: 0, deleted: 0 },
        meta: { provider: 'gemini', modelUsed: 'gemini-1.5-flash', durationMs: 500, requestId: 'req-1' },
      });

      render(<EditorWorkspace onBackToHome={jest.fn()} />);

      // Tunggu kredit awal dimuat
      await waitFor(() => {
        expect(screen.getAllByText('5.500').length).toBeGreaterThanOrEqual(1);
      });

      // Masukkan teks prompt
      const input = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(input, {
        target: { value: 'Buat game pesawat menembak asteroid' },
      });

      // Klik tombol Buat Game Sekarang (-100 Poin)
      const submitBtn = screen.getByText(/Generate Game Scratch \(-100 Poin\)/i);
      fireEvent.click(submitBtn);

      // Saldo di storage harus berkurang 100 (menjadi 5.400)
      await waitFor(async () => {
        const creds = await storageService.getCredits();
        expect(creds.balance).toBe(5400);
      });
    });

    it('harus memblokir permintaan dan menampilkan modal jika kredit tidak mencukupi', async () => {
      // Simulasikan saldo kredit hanya 10 poin
      await storageService.saveCredits({
        balance: 10,
        lastDailyCreditDate: new Date().toISOString().split('T')[0],
        totalCreditsEarned: 10,
        totalCreditsSpent: 0,
        history: [],
      });

      render(<EditorWorkspace onBackToHome={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
      });

      // Tulis prompt
      const input = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(input, {
        target: { value: 'Buat game baru' },
      });

      const submitBtn = screen.getByText(/Generate Game Scratch \(-100 Poin\)/i);
      fireEvent.click(submitBtn);

      // apiService.generateGame TIDAK boleh dipanggil
      expect(apiService.generateGame).not.toHaveBeenCalled();

      // Modal penanganan kuota habis harus muncul
      await waitFor(() => {
        expect(screen.getAllByText('Kredit AI Kamu Sedang Habis').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/🪙 10 Poin/i).length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});

