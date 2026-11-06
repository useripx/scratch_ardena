# Changelog — 06 November 2026 (11:45 WIB)

## 📌 Ringkasan Sprint: Tahap 07 Live Integration & AI Agent Credit Economy (INT-01)

### 🏷️ Status Rilis:
- **Versi Sistem:** `v1.0.0-rc1 (Scratch 3.0 Compatible)`
- **Cabang Git:** `feature/INT-01-live-runtime-integration` ➔ `develop`
- **Hasil Pengujian Otomatis:**
  - Frontend Test Suites: **8 passed, 8 total (72/72 tests passed, 100% PASS)**
  - Backend Test Suites: **9 passed, 9 total (65/65 tests passed, 100% PASS)**
  - Total Seluruh Sistem: **137 tests passed across 17 test suites (100% PASS)**
  - Kompilasi TypeScript: **0 ERROR** (`tsc` lulus tanpa celah pada `frontend/` dan `backend/`)

---

### 🚀 Komponen & Fitur Baru yang Diimplementasikan:

1. **Orkestrasi Repositori Root (`package.json`):**
   - Menambahkan berkas root `package.json` untuk menjalankan seluruh subsistem secara terpadu:
     - `npm run dev:backend` ➔ Menjalankan Express backend port 3001.
     - `npm run test` ➔ Menjalankan seluruh 137 unit & integrasi test suite (backend & frontend).
     - `npm run build` ➔ Menjalankan kompilasi TypeScript ganda frontend & backend.

2. **Ekonomi Kredit AI Agen Ramah Pemula (*Fair Usage Policy*):**
   - **Aturan Kredit Akun Baru:** Setiap pengguna baru otomatis mendapatkan saldo sambutan **5.500 Poin** (cukup untuk menghasilkan 55 game Scratch baru secara gratis).
   - **Hadiah Harian Otomatis:** Setiap pergantian hari (pengecekan tanggal `YYYY-MM-DD` lokal di peramban), sistem otomatis menambahkan **+500 Poin gratis** ke saldo pengguna dan menampilkan toast notifikasi perayaan (*"🎁 Kredit Harian Masuk!"*).
   - **Hirarki Biaya Aksi AI Tri-Mode:**
     - Mode `buat` (Kreasi game baru dari nol): **100 Poin**.
     - Mode `ubah` (Modifikasi mekanika/aturan game): **50 Poin**.
     - Mode `jelaskan` (Tanya tutor logika balok Scratch): **20 Poin**.
   - **Pencegahan Pemakaian Berlebih (UI 19):** Jika saldo poin tidak mencukupi, permintaan AI dicegah sebelum menyentuh API, dan modal penanganan kuota ramah pemula ditampilkan memberitahukan sisa saldo dan kepastian penambahan +500 poin besok hari, sembari menegaskan bahwa penyusunan balok manual di kanvas Scratch tetap 100% gratis selamanya.

3. **Komponen Visual Dompet Kredit di Editor Workspace:**
   - **Lencana Topbar (`EditorTopNav.tsx`):** Menampilkan lencana saldo kredit (`🪙 5.500 Poin`) dengan format angka lokal Indonesia (`5.500`).
   - **Header & Tab Biaya AI Copilot (`AICopilotPanel.tsx`):** Menampilkan badge saldo di header dock, tag biaya pada setiap tab mode (`-100`, `-50`, `-20`), serta label dinamis pada tombol eksekusi (`Generate Game Scratch (-100 Poin)`, `Terapkan Modifikasi (-50 Poin)`, `Tanya Tutor AI (-20 Poin)`).

4. **Suite Pengujian Dompet Kredit Komprehensif (`frontend/tests/credit-wallet.test.tsx`):**
   - 12 kasus uji otomatis baru mencakup: inisialisasi saldo 5.500, pencegahan duplikasi refresh harian, deteksi hari baru & penambahan +500 poin, pemotongan saldo tri-mode, penolakan transaksi saat saldo kurang, penambahan manual, rendering lencana topbar & copilot, serta pencegahan permintaan API saat kredit habis.

---

### 📂 Berkas yang Dimodifikasi & Dibuat:
- `A` `package.json` (Root orchestrator untuk dev, build, dan test)
- `A` `frontend/.env.example` (Template konfigurasi URL API port 3001)
- `M` `frontend/src/types/game.types.ts` (Definisi `UserCredits`, `CreditTransaction`, konstanta kredit)
- `M` `frontend/src/services/storage.service.ts` (Implementasi dompet kredit, riwayat transaksi, refresh harian)
- `M` `frontend/src/components/editor/EditorTopNav.tsx` (Lencana saldo kredit di topbar studio)
- `M` `frontend/src/components/editor/AICopilotPanel.tsx` (Lencana saldo & indikator biaya mode)
- `M` `frontend/src/components/editor/EditorWorkspace.tsx` (Integrasi pemotongan kredit & pencegahan UI 19)
- `M` `frontend/src/components/modals/RateLimitCountdownModal.tsx` (Dukungan pesan kredit habis dinamis)
- `A` `frontend/tests/credit-wallet.test.tsx` (Suite pengujian otomatis dompet kredit AI)
- `M` `Docs/Task_Status.md` (Pembaruan status Tahap 07 DONE & persiapan Tahap 08)
- `A` `changelog/changelog12pm06112026.md` (Dokumentasi changelog rilis INT-01)

