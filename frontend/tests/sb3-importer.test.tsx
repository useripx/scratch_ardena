import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JSZip from 'jszip';
import { storageService } from '../src/services/storage.service';
import { ImportSb3ConfirmModal } from '../src/components/modals/ImportSb3ConfirmModal';
import { I18nProvider } from '../src/contexts/I18nContext';

describe('Sub-Fase 09-C: Drag-and-Drop .sb3 Inspector & Importer', () => {
  describe('1. storageService.importProjectFromSb3 Unit Tests', () => {
    it('berhasil membedah dan mengimpor paket .sb3 valid menjadi StoredProject', async () => {
      // Siapkan mock Scratch 3.0 project.json
      const mockProjectJson = {
        targets: [
          {
            isStage: true,
            name: 'Stage',
            variables: {
              'var_score_id': ['Skor', 0],
              'var_lives_id': ['Nyawa', 3],
            },
            costumes: [{ name: 'backdrop1' }],
            currentCostume: 0,
            blocks: {},
          },
          {
            isStage: false,
            name: 'KucingScratch',
            x: 10,
            y: 20,
            costumes: [{ name: 'kucing_lari' }],
            currentCostume: 0,
            blocks: {
              'b1': { opcode: 'event_whenflagclicked' },
              'b2': { opcode: 'motion_movesteps' },
            },
          },
          {
            isStage: false,
            name: 'ApelMerah',
            x: -50,
            y: 100,
            costumes: [{ name: 'apel' }],
            currentCostume: 0,
            blocks: {
              'b3': { opcode: 'control_forever' },
            },
          },
        ],
        monitors: [],
        meta: { semver: '3.0.0' },
      };

      const zip = new JSZip();
      zip.file('project.json', JSON.stringify(mockProjectJson));
      const blob = await zip.generateAsync({ type: 'blob' });

      // Simulasikan file dengan nama custom
      const file = new File([blob], 'GamePetualanganKucing.sb3', {
        type: 'application/x.scratch.sb3',
      });

      const result = await storageService.importProjectFromSb3(file);

      expect(result).toBeDefined();
      expect(result.project.title).toBe('GamePetualanganKucing');
      expect(result.spriteCount).toBe(2);
      expect(result.blockCount).toBe(3);
      expect(result.project.gameSpec.sprites.length).toBe(2);
      expect(result.project.gameSpec.sprites[0].name).toBe('KucingScratch');
      expect(result.project.gameSpec.sprites[1].name).toBe('ApelMerah');
      expect(result.project.gameSpec.variables.length).toBe(2);
      expect(result.project.tags).toContain('imported');
    });

    it('menolak arsip ZIP yang tidak memiliki project.json dengan pesan error jelas', async () => {
      const zip = new JSZip();
      zip.file('dummy.txt', 'Bukan file scratch');
      const blob = await zip.generateAsync({ type: 'blob' });

      await expect(storageService.importProjectFromSb3(blob)).rejects.toThrow(
        'Format berkas .sb3 tidak valid: berkas "project.json" tidak ditemukan di dalam paket.'
      );
    });

    it('menolak project.json yang korup atau tidak memuat array targets', async () => {
      const zip = new JSZip();
      zip.file('project.json', JSON.stringify({ invalidStructure: true }));
      const blob = await zip.generateAsync({ type: 'blob' });

      await expect(storageService.importProjectFromSb3(blob)).rejects.toThrow(
        'Struktur berkas .sb3 tidak kompatibel: properti "targets" tidak ditemukan.'
      );
    });
  });

  describe('2. ImportSb3ConfirmModal Component (Opsi A Dialog)', () => {
    it('merender dialog konfirmasi dengan rincian file dan nama proyek aktif', () => {
      const onSaveAndOpen = jest.fn();
      const onOpenWithoutSave = jest.fn();
      const onClose = jest.fn();

      render(
        <I18nProvider initialLocale="id">
          <ImportSb3ConfirmModal
            isOpen={true}
            fileName="ProyekBaru.sb3"
            fileSize={1024 * 50} // 50 KB
            currentProjectTitle="Game Sedang Berjalan"
            onSaveAndOpen={onSaveAndOpen}
            onOpenWithoutSave={onOpenWithoutSave}
            onClose={onClose}
          />
        </I18nProvider>
      );

      // Pastikan nama file dan proyek aktif muncul
      expect(screen.getByText(/ProyekBaru\.sb3/)).toBeTruthy();
      expect(screen.getByText(/Game Sedang Berjalan/)).toBeTruthy();
      expect(screen.getByText(/50\.0 KB/)).toBeTruthy();

      // Klik "Simpan & Buka Baru"
      const saveAndOpenBtn = screen.getByText(/Simpan & Buka Baru/);
      fireEvent.click(saveAndOpenBtn);
      expect(onSaveAndOpen).toHaveBeenCalledTimes(1);

      // Klik "Langsung Buka"
      const openWithoutSaveBtn = screen.getByText(/Langsung Buka/);
      fireEvent.click(openWithoutSaveBtn);
      expect(onOpenWithoutSave).toHaveBeenCalledTimes(1);

      // Klik "Batal"
      const cancelBtn = screen.getByText('Batal');
      fireEvent.click(cancelBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('tidak merender apa pun saat isOpen bernilai false', () => {
      const { container } = render(
        <I18nProvider initialLocale="id">
          <ImportSb3ConfirmModal
            isOpen={false}
            fileName="ProyekBaru.sb3"
            fileSize={100}
            currentProjectTitle="Game"
            onSaveAndOpen={jest.fn()}
            onOpenWithoutSave={jest.fn()}
            onClose={jest.fn()}
          />
        </I18nProvider>
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
