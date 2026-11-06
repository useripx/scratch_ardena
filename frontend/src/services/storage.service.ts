/**
 * Client-Side Storage Service (IndexedDB & JSZip Exporter)
 * 100% Offline, Zero Server Database.
 * Menyimpan data proyek dan preferensi pengguna langsung di browser klien.
 */

import JSZip from 'jszip';
import {
  StoredProject,
  UserPreferences,
  DEFAULT_USER_PREFERENCES,
  ArdenaGameSpec,
  calculateDiffCounters,
  UserCredits,
  DEFAULT_USER_CREDITS,
  INITIAL_WELCOME_CREDITS,
  DAILY_REFRESH_CREDITS,
} from '../types/game.types';
import { toast } from './toast.service';

const DB_NAME = 'ardena_playground_db';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_PREFERENCES = 'preferences';

class StorageService {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  // Fallback in-memory map untuk lingkungan tanpa IndexedDB (misal: Unit Test atau Private Window ketat)
  private memoryProjects: Map<string, StoredProject> = new Map();
  private memoryPreferences: UserPreferences = { ...DEFAULT_USER_PREFERENCES };
  private memoryCredits: UserCredits = {
    ...DEFAULT_USER_CREDITS,
    lastDailyCreditDate: new Date().toISOString().split('T')[0],
  };

  private isIndexedDBAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  }

  private async openDB(): Promise<IDBDatabase | null> {
    if (!this.isIndexedDBAvailable()) {
      return null;
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
            const projectStore = db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
            projectStore.createIndex('by_updatedAt', 'updatedAt', { unique: false });
            projectStore.createIndex('by_category', 'category', { unique: false });
            projectStore.createIndex('by_title', 'title', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORE_PREFERENCES)) {
            db.createObjectStore(STORE_PREFERENCES, { keyPath: 'key' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('[StorageService] Gagal membuka IndexedDB, menggunakan memori fallback.');
          resolve(null);
        };
      } catch (err) {
        console.warn('[StorageService] Error inisialisasi IndexedDB:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  /**
   * Mengambil semua daftar proyek yang tersimpan secara lokal.
   */
  async getProjects(): Promise<StoredProject[]> {
    const db = await this.openDB();
    if (!db) {
      return Array.from(this.memoryProjects.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_PROJECTS, 'readonly');
        const store = tx.objectStore(STORE_PROJECTS);
        const request = store.getAll();

        request.onsuccess = () => {
          const projects = (request.result || []) as StoredProject[];
          projects.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          resolve(projects);
        };

        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Mengambil proyek spesifik berdasarkan ID.
   */
  async getProject(id: string): Promise<StoredProject | null> {
    const db = await this.openDB();
    if (!db) {
      return this.memoryProjects.get(id) || null;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_PROJECTS, 'readonly');
        const store = tx.objectStore(STORE_PROJECTS);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve((request.result as StoredProject) || null);
        };

        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Menyimpan atau memperbarui proyek ke IndexedDB.
   */
  async saveProject(project: StoredProject): Promise<StoredProject> {
    const updatedProject: StoredProject = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    const db = await this.openDB();
    if (!db) {
      this.memoryProjects.set(updatedProject.id, updatedProject);
      return updatedProject;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_PROJECTS, 'readwrite');
        const store = tx.objectStore(STORE_PROJECTS);
        const request = store.put(updatedProject);

        request.onsuccess = () => resolve(updatedProject);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Menghapus proyek dari IndexedDB secara permanen.
   */
  async deleteProject(id: string): Promise<boolean> {
    const db = await this.openDB();
    if (!db) {
      return this.memoryProjects.delete(id);
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_PROJECTS, 'readwrite');
        const store = tx.objectStore(STORE_PROJECTS);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Menduplikasi proyek yang ada dengan ID baru dan akhiran judul "(Salinan)".
   */
  async duplicateProject(id: string): Promise<StoredProject> {
    const original = await this.getProject(id);
    if (!original) {
      throw new Error(`Proyek dengan ID ${id} tidak ditemukan untuk diduplikasi.`);
    }

    const newId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const duplicated: StoredProject = {
      ...original,
      id: newId,
      title: `${original.title} (Salinan)`.slice(0, 60),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.saveProject(duplicated);
  }

  /**
   * Mengambil preferensi pengguna.
   */
  async getPreferences(): Promise<UserPreferences> {
    const db = await this.openDB();
    if (!db) {
      return { ...this.memoryPreferences };
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_PREFERENCES, 'readonly');
        const store = tx.objectStore(STORE_PREFERENCES);
        const request = store.get('user_settings');

        request.onsuccess = () => {
          if (request.result && request.result.value) {
            resolve({ ...DEFAULT_USER_PREFERENCES, ...request.result.value });
          } else {
            resolve({ ...DEFAULT_USER_PREFERENCES });
          }
        };

        request.onerror = () => resolve({ ...DEFAULT_USER_PREFERENCES });
      } catch {
        resolve({ ...DEFAULT_USER_PREFERENCES });
      }
    });
  }

  /**
   * Menyimpan pembaruan preferensi pengguna.
   */
  async savePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences();
    const updated: UserPreferences = { ...current, ...prefs };

    const db = await this.openDB();
    if (!db) {
      this.memoryPreferences = updated;
      return updated;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_PREFERENCES, 'readwrite');
        const store = tx.objectStore(STORE_PREFERENCES);
        const request = store.put({ key: 'user_settings', value: updated });

        request.onsuccess = () => resolve(updated);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Mengambil saldo kredit pengguna saat ini dan otomatis menambahkan +500 poin jika hari baru.
   */
  async getCredits(): Promise<UserCredits> {
    const today = new Date().toISOString().split('T')[0];
    const db = await this.openDB();

    let rawCredits: UserCredits;
    if (!db) {
      rawCredits = { ...this.memoryCredits };
    } else {
      rawCredits = await new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_PREFERENCES, 'readonly');
          const store = tx.objectStore(STORE_PREFERENCES);
          const request = store.get('user_credits');

          request.onsuccess = () => {
            if (request.result && request.result.value) {
              resolve(request.result.value);
            } else {
              resolve({
                ...DEFAULT_USER_CREDITS,
                lastDailyCreditDate: today,
              });
            }
          };
          request.onerror = () =>
            resolve({ ...DEFAULT_USER_CREDITS, lastDailyCreditDate: today });
        } catch {
          resolve({ ...DEFAULT_USER_CREDITS, lastDailyCreditDate: today });
        }
      });
    }

    if (!rawCredits.history) {
      rawCredits.history = [
        {
          id: 'tx-welcome',
          timestamp: new Date().toISOString(),
          amount: INITIAL_WELCOME_CREDITS,
          type: 'welcome',
          description: 'Bonus Saldo Selamat Datang',
        },
      ];
    }

    // Jika belum ada tanggal atau berganti hari -> Berikan +500 Poin Gratis Harian
    if (!rawCredits.lastDailyCreditDate) {
      rawCredits.lastDailyCreditDate = today;
      await this.saveCredits(rawCredits);
    } else if (rawCredits.lastDailyCreditDate !== today) {
      rawCredits.balance += DAILY_REFRESH_CREDITS;
      rawCredits.totalCreditsEarned += DAILY_REFRESH_CREDITS;
      rawCredits.lastDailyCreditDate = today;
      rawCredits.history.unshift({
        id: `tx-daily-${Date.now()}`,
        timestamp: new Date().toISOString(),
        amount: DAILY_REFRESH_CREDITS,
        type: 'daily_refresh',
        description: 'Bonus Hadiah Harian AI',
      });
      await this.saveCredits(rawCredits);
      toast.info(
        '🎁 Kredit Harian Masuk!',
        `+${DAILY_REFRESH_CREDITS} Poin AI gratis telah otomatis ditambahkan ke saldo Anda.`
      );
    }

    return rawCredits;
  }

  /**
   * Menyimpan saldo kredit pengguna.
   */
  async saveCredits(credits: UserCredits): Promise<UserCredits> {
    const db = await this.openDB();
    if (!db) {
      this.memoryCredits = { ...credits };
      return credits;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_PREFERENCES, 'readwrite');
        const store = tx.objectStore(STORE_PREFERENCES);
        const request = store.put({ key: 'user_credits', value: credits });

        request.onsuccess = () => resolve(credits);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Memotong kredit untuk aksi AI. Mengembalikan status sukses dan sisa saldo.
   */
  async deductCredits(
    cost: number,
    reason?: string
  ): Promise<{ success: boolean; remaining: number; balance: number }> {
    const credits = await this.getCredits();
    if (credits.balance < cost) {
      return { success: false, remaining: credits.balance, balance: credits.balance };
    }

    credits.balance -= cost;
    credits.totalCreditsSpent += cost;
    if (!credits.history) credits.history = [];
    credits.history.unshift({
      id: `tx-cost-${Date.now()}`,
      timestamp: new Date().toISOString(),
      amount: -cost,
      type: 'action_cost',
      description: reason || 'Pemakaian AI Copilot',
    });
    await this.saveCredits(credits);
    return { success: true, remaining: credits.balance, balance: credits.balance };
  }

  /**
   * Menambahkan kredit (misal dari bonus / voucher).
   */
  async addCredits(amount: number, reason?: string): Promise<UserCredits> {
    const credits = await this.getCredits();
    credits.balance += amount;
    credits.totalCreditsEarned += amount;
    if (!credits.history) credits.history = [];
    credits.history.unshift({
      id: `tx-add-${Date.now()}`,
      timestamp: new Date().toISOString(),
      amount,
      type: 'bonus',
      description: reason || 'Penambahan Kredit Manual',
    });
    return this.saveCredits(credits);
  }

  /**
   * Reset kredit ke saldo awal sambutan (5500 poin).
   */
  async resetCredits(): Promise<UserCredits> {
    const today = new Date().toISOString().split('T')[0];
    const initial: UserCredits = {
      balance: INITIAL_WELCOME_CREDITS,
      lastDailyCreditDate: today,
      totalCreditsEarned: INITIAL_WELCOME_CREDITS,
      totalCreditsSpent: 0,
      history: [
        {
          id: 'tx-welcome',
          timestamp: new Date().toISOString(),
          amount: INITIAL_WELCOME_CREDITS,
          type: 'welcome',
          description: 'Bonus Saldo Selamat Datang',
        },
      ],
    };
    return this.saveCredits(initial);
  }

  /**
   * Menghapus semua proyek dan preferensi lokal (Reset).
   */
  async clearAllData(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    this.memoryProjects.clear();
    this.memoryPreferences = { ...DEFAULT_USER_PREFERENCES };
    this.memoryCredits = {
      ...DEFAULT_USER_CREDITS,
      lastDailyCreditDate: today,
      history: [
        {
          id: 'tx-welcome',
          timestamp: new Date().toISOString(),
          amount: INITIAL_WELCOME_CREDITS,
          type: 'welcome',
          description: 'Bonus Saldo Selamat Datang',
        },
      ],
    };

    const db = await this.openDB();
    if (!db) return;

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction([STORE_PROJECTS, STORE_PREFERENCES], 'readwrite');
        tx.objectStore(STORE_PROJECTS).clear();
        tx.objectStore(STORE_PREFERENCES).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Ekspor seluruh pustaka proyek sebagai teks JSON backup.
   */
  async exportAllProjectsAsJson(): Promise<string> {
    const projects = await this.getProjects();
    const backupPayload = {
      app: 'Ardena Playground',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projectsCount: projects.length,
      projects,
    };
    return JSON.stringify(backupPayload, null, 2);
  }

  /**
   * Mengemas proyek game menjadi berkas `.sb3` berstandar Scratch 3.0 via JSZip.
   */
  async exportProjectToSb3(project: StoredProject): Promise<Blob> {
    const zip = new JSZip();

    // 1. Siapkan AST Scratch 3.0 (project.json)
    const scratchAst = this.buildScratchAst(project);
    zip.file('project.json', JSON.stringify(scratchAst, null, 2));

    // 2. Dummy SVG Costumes agar Scratch Editor dapat merender objek tanpa corrupt
    const dummySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#006194"/></svg>`;
    const dummyBackdropSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f0f4f8"/></svg>`;

    zip.file('cd21514d0531fdffb22204e0ec5ed84a.svg', dummySvg);
    zip.file('bcf454acf82e4504149f7ffe07081dbc.svg', dummyBackdropSvg);

    // 3. Generate Blob ZIP berformat .sb3
    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/x.scratch.sb3',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    return blob;
  }

  /**
   * Helper internal untuk mengonversi ArdenaGameSpec menjadi AST Scratch 3.0 kompatibel.
   */
  private buildScratchAst(project: StoredProject): Record<string, unknown> {
    const game = project.gameSpec;

    // Target 1: Stage (Backdrop panggung)
    const stageTarget = {
      isStage: true,
      name: 'Stage',
      variables: {} as Record<string, [string, number | string]>,
      lists: {},
      broadcasts: {},
      blocks: {},
      comments: {},
      currentCostume: 0,
      costumes: [
        {
          name: 'backdrop1',
          dataFormat: 'svg',
          assetId: 'bcf454acf82e4504149f7ffe07081dbc',
          md5ext: 'bcf454acf82e4504149f7ffe07081dbc.svg',
          rotationCenterX: 240,
          rotationCenterY: 180,
        },
      ],
      sounds: [],
      volume: 100,
      layerOrder: 0,
    };

    // Daftarkan variabel game ke panggung
    if (game.variables) {
      game.variables.forEach((v, index) => {
        stageTarget.variables[`var_${index}`] = [v.name, v.initialValue];
      });
    }

    // Target 2..N: Sprites
    const spriteTargets = (game.sprites || []).map((sprite, sIndex) => {
      const blocks: Record<string, unknown> = {};

      // Sederhana: Buat blok awal Event "when green flag clicked"
      const eventBlockId = `block_flag_${sIndex}`;
      blocks[eventBlockId] = {
        opcode: 'event_whenflagclicked',
        next: null,
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 48,
        y: 48 + sIndex * 80,
      };

      return {
        isStage: false,
        name: sprite.name || `Sprite${sIndex + 1}`,
        variables: {},
        lists: {},
        broadcasts: {},
        blocks,
        comments: {},
        currentCostume: 0,
        costumes: [
          {
            name: sprite.costume || 'costume1',
            dataFormat: 'svg',
            assetId: 'cd21514d0531fdffb22204e0ec5ed84a',
            md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg',
            rotationCenterX: 50,
            rotationCenterY: 50,
          },
        ],
        sounds: [],
        volume: 100,
        layerOrder: sIndex + 1,
        visible: true,
        x: sprite.initialPosition?.x ?? 0,
        y: sprite.initialPosition?.y ?? 0,
        size: 100,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
      };
    });

    return {
      targets: [stageTarget, ...spriteTargets],
      monitors: [],
      extensions: [],
      meta: {
        semver: '3.0.0',
        vm: '0.2.0',
        agent: 'Ardena Playground Scratch AI Generator v1.0',
      },
    };
  }

  /**
   * Helper pembuat instance StoredProject baru dari ArdenaGameSpec.
   */
  createProjectFromSpec(
    gameSpec: ArdenaGameSpec,
    title?: string,
    tags: string[] = ['AI-Generated']
  ): StoredProject {
    const diff = calculateDiffCounters(gameSpec);
    const category = (
      gameSpec.genre === 'catching-game'
        ? 'arcade'
        : gameSpec.genre === 'maze-adventure' || gameSpec.genre === 'maze-game'
        ? 'puzzle'
        : gameSpec.genre === 'space-shooter'
        ? 'shooter'
        : 'lainnya'
    ) as StoredProject['category'];

    return {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: (title || gameSpec.title || 'Proyek Tanpa Judul').slice(0, 60),
      category,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      gameSpec,
      stats: {
        spriteCount: diff.spritesCount,
        blockCount: diff.blocksCount,
        variableCount: diff.variablesCount,
        soundCount: diff.sfxCount,
        estimatedSizeBytes: JSON.stringify(gameSpec).length * 2 + 1024,
      },
    };
  }
}

export const storageService = new StorageService();

