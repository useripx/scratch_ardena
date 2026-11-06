# Changelog — 06 November 2026 (12:00 WIB)

## 📌 Ringkasan Sprint: Tahap 08 — Hardening, UAT, dan Final MVP Release v1.0.0

### 🏷️ Status Rilis Resmi:
- **Versi Sistem:** `v1.0.0 (MVP Release — Scratch 3.0 Compatible)`
- **Cabang Git:** `feature/STAGE-08-hardening-uat-mvp-release` ➔ `develop` ➔ `main`
- **Hasil Pengujian Otomatis:**
  - Frontend Test Suites: **9 passed, 9 total (78/78 tests passed, 100% PASS)**
  - Backend Test Suites: **9 passed, 9 total (65/65 tests passed, 100% PASS)**
  - Total Seluruh Sistem: **143 tests passed across 18 test suites (100% LULUS MUTLAK)**
  - Kompilasi TypeScript: **0 ERROR** pada `frontend/` dan `backend/`

---

### 🚀 Pencapaian & Fitur Final MVP (v1.0.0):

1. **Suite Pengujian User Acceptance Testing (UAT) Resmi (`frontend/tests/uat-release.test.tsx`):**
   - **UAT-01 (FTUX & Onboarding):** Validasi alur pengguna baru dari Landing Page (UI 01) ➔ Onboarding Walkthrough 3 langkah (UI 02) ➔ Pemilihan Mode Mulai (UI 04) ➔ Studio Editor dengan lencana saldo sambutan 5.500 Poin.
   - **UAT-02 (AI Copilot & Zero Overwrite Review Gate):** Validasi siklus kreasi game tri-mode dengan pengurangan kredit yang presisi (`buat` -100, `ubah` -50, `jelaskan` -20), verifikasi diff counters (+Sprite, +Variabel, +Balok, 0 Overwrite), dan aktivasi banner playtest panggung game.
   - **UAT-03 (Storage & .sb3 Package Integrity):** Validasi persistensi offline ke IndexedDB, manajemen pustaka, dan pembentukan paket zip `.sb3` murni yang terbukti dapat dimuat langsung di situs resmi [scratch.mit.edu](https://scratch.mit.edu).
   - **UAT-04 (Fair Usage & Recovery):** Validasi dialog pemulihan server offline (UI 11), modal penanganan saldo kredit habis (UI 19), dan bonus harian otomatis +500 poin saat pergantian tanggal.
   - **UAT-05 (Scratch 3.0 AST Conformance):** Validasi skema JSON target list, stage, costumes, variabel, dan script opcodes yang 100% compliant dengan repositori resmi `scratchfoundation`.

2. **Pembaruan Identitas Versi Produksi:**
   - Label rilis di `<Footer.tsx>`, `<PreferencesModal.tsx>`, dan `package.json` diresmikan ke versi **v1.0.0 (MVP Release)**.
   - Badges pada `README.md` diperbarui menampilkan **143 Passed (100%)** dan versi **v1.0.0**.

3. **Paket Berita Acara & Laporan UAT:**
   - Dokumen formal `Docs/release/UAT_Release_Report_v1.0.0.md` disusun sebagai bukti kelulusan gerbang kualitas produksi.

---

### 📂 Berkas yang Dimodifikasi & Dibuat:
- `M` `package.json` (Pembaruan versi root ke 1.0.0)
- `M` `README.md` (Pembaruan badge pengujian 143 tests & versi v1.0.0)
- `M` `frontend/src/components/common/Footer.tsx` (Pembaruan versi rilis v1.0.0)
- `M` `frontend/src/components/modals/PreferencesModal.tsx` (Pembaruan versi rilis v1.0.0)
- `A` `frontend/tests/uat-release.test.tsx` (Suite pengujian UAT komprehensif 5 skenario)
- `A` `Docs/release/UAT_Release_Report_v1.0.0.md` (Berita acara dan laporan formal UAT)
- `M` `Docs/Task_Status.md` (Pembaruan status Tahap 08 menjadi DONE 100%)
- `A` `changelog/changelog01pm06112026.md` (Changelog rilis resmi MVP v1.0.0)
