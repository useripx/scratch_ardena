# Changelog — 06 November 2026 (11:00 AM)

## 📌 Ringkasan Sprint: Penutupan Tahap 04 (Sub-Fase FE-07 — Hardening, E2E User Journey Verification, & Polish Final Frontend)

### 🏷️ Status Rilis:
- **Versi Frontend:** `v1.0.0-rc1 (Scratch 3.0 Compatible)`
- **Cabang Git:** `develop` (dari `feature/FE-07-frontend-hardening`)
- **Hasil Pengujian Otomatis:**
  - Frontend Test Suites: **7 passed, 7 total (60/60 tests passed, 100% PASS)**
  - Backend Test Suites: **9 passed, 9 total (65/65 tests passed, 100% PASS)**
  - Total Seluruh Sistem: **125 tests passed across 16 test suites (100% PASS)**
  - Frontend Lines Coverage: **72.32%**
  - Kompilasi TypeScript: **0 ERROR** pada `frontend/` dan `backend/`

---

### 🚀 Komponen & Fitur Baru yang Diimplementasikan:

1. **Pembaruan Identitas & Versi Produksi:**
   - Menyematkan badge versi `v1.0.0-rc1 (Scratch 3.0 Compatible)` pada komponen `<Footer.tsx>`.
   - Menyelaraskan identitas rilis versi pada `<PreferencesModal.tsx>` (Tab Privasi & Tentang Kami).

2. **Pengujian End-to-End User Journey Komprehensif (`frontend/tests/e2e-workflow.test.tsx`):**
   - **TEST-FE07-01 (Journey 1):** Validasi alur pengguna baru dari Landing Page (UI 01) ➔ Menyelesaikan Onboarding Walkthrough 3 langkah (UI 02) ➔ Pemilihan Mode Mulai (UI 04) ➔ Masuk ke Editor Kosong Scratch (UI 06, UI 07) ➔ Membuka Pusat Bantuan Glosarium Balok Scratch 3.0 Resmi (UI 16).
   - **TEST-FE07-02 (Journey 2):** Validasi alur kreasi game dari Katalog Template (UI 05) ➔ Editor dengan template aktif (UI 06) ➔ Formulasi prompt AI di Copilot Panel (Right Dock) ➔ Indikator proses 4-tahap Generating State (UI 08) ➔ Review Gate Bento Box dengan jaminan 0 Overwrite (UI 09) ➔ Ready Playtest Banner (UI 10) ➔ Menjalankan simulasi panggung permainan.
   - **TEST-FE07-03 (Journey 3):** Validasi alur penyimpanan offline peramban ke IndexedDB (UI 12) ➔ Toast notifikasi sukses (UI 18) ➔ Manajemen pustaka proyek lokal (UI 13) ➔ Ekspor paket `.sb3` standar Scratch 3.0 via JSZip (UI 14) ➔ Dialog konfirmasi penghapusan proyek (UI 17) ➔ Pemulihan proyek via Undo Toast 6 detik (UI 18).
   - **TEST-FE07-04 (Journey 4):** Validasi resiliensi kesalahan koneksi backend port 3001 dengan dialog panduan ramah pemula (UI 11) ➔ Modal hitung mundur rate limit 15 detik dengan penguncian tombol otomatis (UI 19) ➔ Pengaturan & Preferensi Studio 4 Tab (UI 15).

3. **Verifikasi Keselarasan 19 Prototipe Google Stitch:**
   - Seluruh 19 layar Google Stitch (`template/ardenaplayground/` UI 01 s/d UI 19) telah divalidasi dan terbukti terintegrasi tanpa celah (*seamless*).

---

### 📂 Berkas yang Dimodifikasi & Dibuat:
- `M` `frontend/src/components/common/Footer.tsx` (Update version badge ke `v1.0.0-rc1`)
- `M` `frontend/src/components/modals/PreferencesModal.tsx` (Update app version string)
- `A` `frontend/tests/e2e-workflow.test.tsx` (6 kasus uji E2E integrasi komprehensif)
- `M` `Docs/Task_Status.md` (Pembaruan status FE-07 & penyelesaian Tahap 04 menjadi DONE 100%)
- `M` `Docs/chat/riwayat06112026.md` (Dokumentasi sesi dialog dan resolusi konflik merge)
- `A` `changelog/changelog11am06112026.md` (Dokumen changelog rilis sub-fase FE-07)

