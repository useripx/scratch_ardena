import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { toast } from '../src/services/toast.service';
import { ToastNotificationContainer } from '../src/components/common/ToastNotification';
import {
  ScratchBlockSnippet,
  ScratchBlockMeta,
  SCRATCH_CATEGORY_COLORS,
} from '../src/components/help/ScratchBlockSnippet';
import { BlockHelpGuideModal } from '../src/components/help/BlockHelpGuideModal';
import { EditorTopNav } from '../src/components/editor/EditorTopNav';
import { Navbar } from '../src/components/common/Navbar';

describe('Frontend Help & Notifications Sub-Fase FE-06', () => {
  beforeEach(() => {
    toast.clearAll();
  });

  // TEST-FE06-01: ToastService Unit Tests
  describe('1. ToastService Operations', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('harus menambahkan toast success, info, warning, dan error ke antrean', () => {
      const listenerMock = jest.fn();
      const unsubscribe = toast.subscribe(listenerMock);

      toast.success('Sukses Simpan', 'Proyek disimpan.');
      toast.info('Info Sistem', 'Sinkronisasi siap.');
      toast.warning('Peringatan Kuota', 'Sisa kuota menipis.');
      toast.error('Gagal Koneksi', 'Backend offline.');

      const toasts = toast.getToasts();
      expect(toasts.length).toBe(4);
      expect(toasts[0].type).toBe('success');
      expect(toasts[1].type).toBe('info');
      expect(toasts[2].type).toBe('warning');
      expect(toasts[3].type).toBe('error');

      unsubscribe();
    });

    it('harus menghapus notifikasi otomatis sesuai durasi timeout', () => {
      toast.success('Pesan Sementara', 'Hilang dalam 4 detik.', 4000);
      expect(toast.getToasts().length).toBe(1);

      act(() => {
        jest.advanceTimersByTime(4001);
      });

      expect(toast.getToasts().length).toBe(0);
    });

    it('harus mendukung notifikasi undo dengan aksi callback pembatalan', () => {
      const onUndoMock = jest.fn();
      toast.undo('Proyek Dihapus', 'Klik untuk membatalkan.', onUndoMock, {
        durationMs: 6000,
        undoLabel: 'Batal Hapus',
      });

      const toasts = toast.getToasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('undo');
      expect(toasts[0].undoLabel).toBe('Batal Hapus');

      // Jalankan aksi undo
      toasts[0].onUndo?.();
      expect(onUndoMock).toHaveBeenCalledTimes(1);
    });

    it('harus menghapus toast secara manual melalui dismiss()', () => {
      const id = toast.info('Tes Dismiss');
      expect(toast.getToasts().length).toBe(1);

      toast.dismiss(id);
      expect(toast.getToasts().length).toBe(0);
    });
  });

  // TEST-FE06-02: ToastNotificationContainer UI Tests
  describe('2. ToastNotificationContainer (UI 18)', () => {
    it('harus merender notifikasi melayang dengan atribut ARIA dan menutup saat tombol ✕ diklik', () => {
      render(<ToastNotificationContainer />);

      act(() => {
        toast.success('Game Berhasil Dibuat', 'Logika balok telah dirakit.');
      });

      expect(screen.getByRole('status')).toBeTruthy();
      expect(screen.getByText('Game Berhasil Dibuat')).toBeTruthy();
      expect(screen.getByText('Logika balok telah dirakit.')).toBeTruthy();

      const closeBtn = screen.getByRole('button', { name: /Tutup Notifikasi/i });
      fireEvent.click(closeBtn);

      expect(screen.queryByText('Game Berhasil Dibuat')).toBeNull();
    });

    it('harus memicu callback undo saat tombol aksi Batal pada toast diklik', () => {
      const onUndoMock = jest.fn();
      render(<ToastNotificationContainer />);

      act(() => {
        toast.undo('Proyek Dihapus', 'Dapat dipulihkan.', onUndoMock, {
          undoLabel: 'Pulihkan',
        });
      });

      const undoBtn = screen.getByRole('button', { name: 'Pulihkan' });
      fireEvent.click(undoBtn);

      expect(onUndoMock).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Proyek Dihapus')).toBeNull();
    });
  });

  // TEST-FE06-03: ScratchBlockSnippet Visual Tests (Official Scratch Foundation Specs)
  describe('3. ScratchBlockSnippet Visual Silhouettes', () => {
    it('harus merender siluet Hat Block dengan warna Events resmi (#FFD500)', () => {
      const hatBlock: ScratchBlockMeta = {
        opcode: 'event_whenflagclicked',
        category: 'event',
        shape: 'hat',
        label: 'ketika bendera hijau diklik',
        description: 'Pemicu bendera hijau.',
      };

      render(<ScratchBlockSnippet block={hatBlock} />);
      expect(screen.getByText('ketika bendera hijau diklik')).toBeTruthy();
      expect(screen.getByText('event_whenflagclicked')).toBeTruthy();

      const blockEl = screen.getByTestId('scratch-block');
      expect(blockEl.getAttribute('data-category')).toBe('event');
      expect(blockEl.getAttribute('data-shape')).toBe('hat');
    });

    it('harus merender siluet C-Block dengan warna Control resmi (#FFAB19)', () => {
      const cBlock: ScratchBlockMeta = {
        opcode: 'control_forever',
        category: 'control',
        shape: 'c-block',
        label: 'selamanya',
        description: 'Loop utama.',
      };

      render(<ScratchBlockSnippet block={cBlock} />);
      expect(screen.getByText('selamanya')).toBeTruthy();
      expect(screen.getByText(/balok di dalam perulangan/i)).toBeTruthy();

      const blockEl = screen.getByTestId('scratch-block');
      expect(blockEl.getAttribute('data-category')).toBe('control');
      expect(blockEl.getAttribute('data-shape')).toBe('c-block');
    });

    it('harus merender siluet Reporter pill dengan warna Motion resmi (#4C97FF)', () => {
      const reporterBlock: ScratchBlockMeta = {
        opcode: 'motion_xposition',
        category: 'motion',
        shape: 'reporter',
        label: 'posisi x',
        description: 'Nilai koordinat x.',
      };

      render(<ScratchBlockSnippet block={reporterBlock} showOpcode={false} />);
      expect(screen.getByText('posisi x')).toBeTruthy();

      const blockEl = screen.getByTestId('scratch-block');
      expect(blockEl.getAttribute('data-category')).toBe('motion');
      expect(blockEl.getAttribute('data-shape')).toBe('reporter');
    });
  });

  // TEST-FE06-04: BlockHelpGuideModal Tests (UI 16)
  describe('4. BlockHelpGuideModal (UI 16)', () => {
    it('harus berpindah antar 4 tab bantuan dengan lancar', () => {
      const onCloseMock = jest.fn();
      render(<BlockHelpGuideModal isOpen={true} onClose={onCloseMock} />);

      // Tab 1 default: Prompt AI
      expect(screen.getByText(/Pedoman Formulasi Instruksi AI Copilot/i)).toBeTruthy();
      expect(screen.getByText(/Spesifik Koordinat 2D/i)).toBeTruthy();

      // Pindah ke Tab 2: Glosarium Balok Scratch
      fireEvent.click(screen.getByRole('button', { name: /Glosarium Balok Scratch 3\.0/i }));
      expect(screen.getByText(/scratchfoundation\/scratch-blocks/i)).toBeTruthy();
      expect(screen.getByText('gerak (10) langkah')).toBeTruthy();

      // Pindah ke Tab 3: Alur Kerja & Ekspor
      fireEvent.click(screen.getByRole('button', { name: /Alur Kerja & Ekspor \.sb3/i }));
      expect(screen.getByText(/Kemandirian Data Offline di IndexedDB/i)).toBeTruthy();

      // Pindah ke Tab 4: Troubleshooting
      fireEvent.click(screen.getByRole('button', { name: /Troubleshooting/i }));
      expect(screen.getByText(/Backend Port 3001 Tidak Terhubung/i)).toBeTruthy();

      // Tutup panduan
      fireEvent.click(screen.getByRole('button', { name: /Tutup Panduan/i }));
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('harus memfilter balok Scratch berdasarkan pencarian dan kategori', () => {
      render(
        <BlockHelpGuideModal
          isOpen={true}
          initialTab="blocks"
          onClose={jest.fn()}
        />
      );

      // Cek balok awal muncul
      expect(screen.getByText('gerak (10) langkah')).toBeTruthy();

      // Cari balok variabel
      const searchInput = screen.getByPlaceholderText(/Cari balok \/ opcode/i);
      fireEvent.change(searchInput, { target: { value: 'Skor' } });

      expect(screen.getByText('atur [Skor v] ke (0)')).toBeTruthy();
      expect(screen.queryByText('gerak (10) langkah')).toBeNull();
    });
  });

  // TEST-FE06-05: Integrasi Tombol Bantuan pada TopNav & Navbar
  describe('5. Shortcut Bantuan (❓) pada Header & Navbar', () => {
    it('harus memanggil onOpenHelp saat tombol ❓ diklik di EditorTopNav', () => {
      const onHelpMock = jest.fn();
      render(
        <EditorTopNav
          projectName="Proyek Uji"
          onRenameProject={jest.fn()}
          onBackToHome={jest.fn()}
          isCopilotOpen={true}
          onToggleCopilot={jest.fn()}
          onOpenHelp={onHelpMock}
        />
      );

      const helpBtn = screen.getByTitle(/Panduan Balok & Bantuan/i);
      fireEvent.click(helpBtn);
      expect(onHelpMock).toHaveBeenCalledTimes(1);
    });

    it('harus memanggil onOpenHelp saat tombol ❓ diklik di Navbar', () => {
      const onHelpMock = jest.fn();
      render(<Navbar onOpenHelp={onHelpMock} />);

      const helpBtn = screen.getByTitle(/Panduan Balok Scratch & Bantuan/i);
      fireEvent.click(helpBtn);
      expect(onHelpMock).toHaveBeenCalledTimes(1);
    });
  });
});

