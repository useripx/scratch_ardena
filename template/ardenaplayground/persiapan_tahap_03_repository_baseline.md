# Persiapan & Rencana Eksekusi Tahap 03 — Repository Baseline

**Proyek:** Ardena Playground  
**Dokumen Acuan:** `Implementation_Plan_Ardena_Playground_v1.4.md` (Tahap 03)  
**Dokumen Output:** `Docs/tahap/tahap-03/Environment_Report.md` & `Docs/tahap/tahap-03/Baseline_Test_Report.md`  
**Status Gate:** `PLANNING & SPECIFICATION`  

---

## 1. Tujuan & Batasan Ketat Tahap 03

Sesuai dengan ketentuan **Tahap 03: Persiapan Repository dan Baseline** dalam *Implementation Plan v1.4*, tujuan utama tahapan ini adalah menyiapkan lingkungan pengembangan yang reproduktif dan memverifikasi kesehatan kode sumber bawaan (*upstream*) **tanpa mengubah perilaku aplikasi atau menuliskan fitur baru**.

### 1.1 Aturan Emas Tahap 03 (Zero Feature Modification):
- **Tidak Ada Coding Fitur**: Belum ada penulisan komponen Ardena Copilot, modifikasi state, atau integrasi API backend.
- **Isolasi Monorepo Asli**: Mengikuti struktur npm workspaces monorepo resmi `scratchfoundation/scratch-editor`.
- **Reproduktibilitas Toolchain**: Mematuhi versi Node.js/npm bawaan, Webpack, dan tidak memaksakan toolchain baru (seperti Vite) ke paket `scratch-gui`.
- **Pencatatan Baseline**: Mendokumentasikan status lulus/gagal seluruh suite pengujian bawaan upstream agar regresi upstream tidak tertukar dengan modifikasi masa depan.

---

## 2. Checklist Langkah Kerja Tahap 03

### Langkah 1: Kloning & Penentuan Baseline Commit SHA
- **Repository Sumber:** `https://github.com/scratchfoundation/scratch-editor`
- **Tugas:**
  - Melakukan clone repository ke lingkungan kerja lokal.
  - Memeriksa file manifesto root: `.nvmrc`, `package.json`, `lerna.json` / workspace configuration, serta `package-lock.json`.
  - Mengunci dan mencatat **Commit SHA / Git Tag dasar** yang digunakan sebagai titik tumpu (misal: branch `develop` atau release tag stabil terbaru).

### Langkah 2: Audit Lingkungan Runtime & Instalasi Dependensi
- **Verifikasi Versi Node.js & npm:**
  - Memastikan versi Node.js aktif sesuai dengan file `.nvmrc` monorepo.
  - Menjalankan `npm ci` atau `npm install` murni menggunakan lockfile bawaan upstream tanpa memperbarui dependensi massal.
- **Verifikasi Workspace Packages:**
  - Memastikan keterhubungan internal workspace (`packages/scratch-gui`, `packages/scratch-vm`, `packages/scratch-render`, `packages/scratch-parser`, dll.).

### Langkah 3: Baseline Build & Development Server Verification
- **Verifikasi Build:**
  - Menjalankan script build resmi: `npm run build` pada root atau masing-masing workspace.
  - Memastikan output berkas biner/bundle `dist` terbentuk tanpa kegagalan kompilasi.
- **Verifikasi Dev Server:**
  - Menjalankan development server bawaan (misal: `npm start` pada `scratch-gui`).
  - Membuka peramban lokal (`http://localhost:8601`) untuk melakukan **Smoke Test manual**:
    1. Kanvas workspace Scratch Blocks dapat dimuat dan di-drag-and-drop.
    2. Stage WebGL merender sprite default (Kucing Scratch).
    3. Tombol bendera hijau dan tombol stop berfungsi.
    4. Audio engine Scratch menghasilkan suara tanpa error console.

### Langkah 4: Baseline Automated Test & Verifikasi Pengujian
- **Eksekusi Pengujian Otomatis:**
  - Unit Tests: `npm test` (Jest / Vitest sesuai paket).
  - Linter: `npm run lint` (ESLint).
  - Integration / E2E: Menjalankan Playwright / Jest Puppeteer jika didefinisikan upstream.
- **Analisis & Pelaporan:**
  - Memisahkan hasil pengujian: mencatat test yang **PASS**, serta menandai jika ada test upstream yang sudah **FAIL/SKIPPED** dari sononya.
  - Mendokumentasikan seluruh log ke `Docs/tahap/tahap-03/Baseline_Test_Report.md`.

### Langkah 5: Penyiapan Branching Strategy & Tata Kelola Git
- **Branch Kerja Utama:**
  - `upstream/main` atau `upstream/develop`: Mencerminkan kode asli Scratch tanpa sentuhan.
  - `baseline-clean`: Snapshot stabil setelah verifikasi build dan test lolos.
  - `ardena/develop`: Branch pangkalan integrasi fitur Ardena untuk Tahap 04 dst.
- **Konvensi Commit:**
  - Mengikuti standar *Conventional Commits*: `feat(gui):`, `fix(vm):`, `chore(deps):`, `docs:`.

---

## 3. Matriks Kriteria Penerimaan (Approval Gate Tahap 03)

| Komponen Evaluasi | Kriteria Kelulusan | Output Dokumen |
|---|---|---|
| **Upstream Commit** | SHA commit dasar tercatat dan terkunci | `Environment_Report.md` |
| **Clean Install** | Dependensi terpasang tanpa konflik lockfile | `Environment_Report.md` |
| **Development Build** | Scratch GUI dev server berjalan normal (Smoke Test OK) | `Environment_Report.md` |
| **Automated Suite** | Seluruh test suite baseline terekam hasilnya (PASS/FAIL) | `Baseline_Test_Report.md` |
| **Branching & Rules** | Branch `ardena/develop` siap digunakan untuk Tahap 04 | Git Log / Workspace |

---

## 4. Kesiapan Menuju Tahap 04 (Frontend Implementation)

Setelah seluruh langkah verifikasi Tahap 03 selesai dan disetujui melalui **Approval Gate**, tim pengembangan memiliki kepastian 100% bahwa baseline runtime Scratch stabil dan siap untuk diintegrasikan dengan 18 rancangan layar Google Stitch pada **Tahap 04: Implementasi Kode Frontend**.
