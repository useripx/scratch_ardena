# Design Review Report — Tahap 02 (Desain UI/UX Google Stitch)

**Proyek:** Ardena Playground (Nama Kerja Sementara)  
**Versi Acuan:** Implementation Plan v1.4 (5 November 2026)  
**Dokumen:** `Docs/design/Design_Review.md`  
**Status Gate:** `REVIEW` (Siap diajukan untuk Approval Pemilik Proyek)  
**Tanggal Evaluasi:** Maret 2025  

---

## 1. Ringkasan Eksekutif & Pencapaian Tahap 02

Sesuai ketentuan **Tahap 02: Desain UI/UX Seluruh Halaman dengan Google Stitch** dalam *Implementation Plan v1.4*, seluruh perancangan antarmuka telah diselesaikan tanpa penulisan kode produksi (No Code Phase). 

Total **18 spesifikasi layar (UI-01 s/d UI-18)** telah berhasil dirancang, dipetakan ke alur pengguna (*User Journey*), serta memenuhi batasan ketat integrasi monorepo `scratch-editor` dan prinsip kedaulatan data lokal (*100% Client-Side Persistence via IndexedDB*).

| Metrik Evaluasi | Target Spec v1.4 | Hasil Aktual Tahap 02 | Status |
|---|---|---|---|
| **Cakupan Layar P1** | 16 Layar | 16 Layar Dirancang | **100% PASS** |
| **Cakupan Layar P2** | 2 Layar (UI-15, UI-16) | 2 Layar Dirancang | **100% PASS** |
| **Total Layar Selesai** | 18 Layar | 18 Layar Selesai Terintegrasi | **100% PASS** |
| **Design System Tokens** | Terdefinisi di DESIGN.md | Creative Studio Workspace | **PASS** |
| **Aset Logo Proyek** | Menggunakan Logo Pemilik | Terintegrasi (Logo.jpeg) | **PASS** |
| **Batasan Scratch-Native** | Tidak mengganti blok/VM asli | Shell & Wrapper Terisolasi | **PASS** |
| **Fitur Non-MVP** | Dilarang (Cloud/Login/Pay) | Bersih dari fitur Non-MVP | **PASS** |

---

## 2. Inventaris Layar & Tinjauan Artefak

Setiap layar telah dievaluasi terhadap tujuan desain, hierarki informasi, dan mekanisme proteksi data pengguna:

| ID Layar | Judul Layar | Tipe Shell & Layout | Fungsi & Karakteristik Utama | Status Verifikasi |
|---|---|---|---|---|
| **UI-01** | Welcome / Landing Page | Web Standard (Top Bar + Footer) | Headline edukatif, pengenalan konsep AI Copilot + Scratch, CTA "Mulai Sekarang" & "Pelajari Lebih Dulu". Wordmark dan logo terpasang rapi. | **Selesai (P1)** |
| **UI-02** | Onboarding / Panduan Awal | Web Standard | 4 langkah visual: Tulis Ide & Cerita → AI Merakit Balok → Uji Game di Stage → Eksplorasi & Modifikasi Mandiri. | **Selesai (P1)** |
| **UI-03** | Beranda / Project Home | Web Dashboard (Sidebar + Top Bar) | Dashboard utama, sambutan hangat, 3 kartu aksi cepat, galeri proyek lokal terakhir, indikator kapasitas IndexedDB. | **Selesai (P1)** |
| **UI-04** | Pilih Cara Memulai | Web Dashboard | Modal/Layar pemilihan alur: Buat dari Nol dengan AI Copilot, Pilih Template Siap Pakai, atau Proyek Kosong Standar. | **Selesai (P1)** |
| **UI-05** | Pilih Template Game | Web Dashboard | Katalog template MVP teruji: *Catching Game*, *Maze Game*, dan *Space Shooter* lengkap dengan tingkat kesulitan dan tag logika. | **Selesai (P1)** |
| **UI-06** | Editor Utama (Scratch + Copilot) | Editor Standard (Full Canvas) | Komposisi inti editor: Top bar Ardena, integrasi Scratch GUI asli (Workspace, Stage, Sprite Strip), serta Panel AI Copilot kanan yang dapat di-collapse. | **Selesai (P1)** |
| **UI-07** | Panel AI / Prompt (Bagian UI-06) | Docked Panel Kanan | Tab *Buat*, *Ubah*, dan *Jelaskan*; validasi panjang teks prompt; tombol *Generate Game* dengan indikator status siap. | **Selesai (P1)** |
| **UI-08** | Generating State (Indikator AI) | Modal/Overlay Kontekstual | Progress bertahap transparan: Parsing Natural Language → AST Schema Verification → Mapping Balok Scratch. Tombol batalkan generasi yang aman. | **Selesai (P1)** |
| **UI-09** | Review Hasil AI | Modal Pratinjau Kritis | Ringkasan terstruktur logika game sebelum diterapkan: Judul, genre, aktor sprite, tujuan, aturan, kontrol keyboard, dan opsi *Terapkan* vs *Buat Ulang*. | **Selesai (P1)** |
| **UI-10** | Editor Terisi (Hasil Siap Diuji) | Editor Standard (Full Canvas) | Kanvas Scratch terisi balok hasil AI, banner hijau konfirmasi integrasi sukses, panggung siap dimainkan langsung. | **Selesai (P1)** |
| **UI-11** | Error dan Pemulihan (Safe Recovery) | Web Standard (Overlay Safe State) | Dialog penanganan kegagalan manusiawi: fallback Gemini ke Groq, syntax error AST, opsi revisi prompt tanpa kehilangan pekerjaan kanvas. | **Selesai (P1)** |
| **UI-12** | Simpan Proyek Lokal | Web Standard (Modal Simpan) | Form nama proyek, validasi karakter, status penyimpanan IndexedDB lokal, status simpan otomatis (*Auto-saved*). | **Selesai (P1)** |
| **UI-13** | Daftar Proyek Lokal | Web Dashboard (Sidebar + Top Bar) | File manager IndexedDB: pencarian, filter kategori, kartu proyek dengan metrik logika (Sprite, Balok, Variabel, Memori), dan menu titik tiga. | **Selesai (P1)** |
| **UI-14** | Ekspor Proyek (.sb3) | Web Standard (Modal Ekspor) | Konfirmasi ekspor berkas biner `.sb3` resmi yang kompatibel 100% dengan MIT Scratch Web dan Desktop. | **Selesai (P1)** |
| **UI-15** | Pengaturan (Settings & Preferences) | Web Dashboard (Sidebar + Top Bar) | Preferensi provider AI (Gemini Flash vs Groq Llama-3), validasi AST, frame rate panggung (30/60 FPS), kuota IndexedDB, kontras tinggi balok. | **Selesai (P2)** |
| **UI-16** | Bantuan & Panduan Balok | Web Dashboard (Sidebar + Top Bar) | Edukasi cara merumuskan prompt efektif (Spesifik 2D), kamus balok Scratch 3.0 yang didukung, status bebas cloud, dan accordion FAQ. | **Selesai (P2)** |
| **UI-17** | Dialog Konfirmasi | Web Standard (Modal Scrim) | 3 protokol konfirmasi pengaman anak: Dialog Hapus Permanen (dengan 2-step checkbox safety gate), Keluar Editor, dan Terapkan Balok AI. | **Selesai (P1)** |
| **UI-18** | Empty State & Notifikasi Global | Web Dashboard (Sidebar + Top Bar) | Zero-data empty state ramah anak saat IndexedDB kosong, penanganan pencarian nihil, serta 4 varian toast overlay non-intrusif (WCAG 2.1 AA). | **Selesai (P1)** |

---

## 3. Evaluasi Kepatuhan Arsitektur & Prinsip Desain

### 3.1 Isolasi Komponen Scratch Asli (Kepatuhan Monorepo `scratch-editor`)
- **Hasil Audit Desain:** Desain Ardena Playground **tidak menggambar ulang atau mengganti** blok kode Scratch, panggung canvas WebGL Scratch VM, atau pustaka sprite asli.
- **Pola Integrasi:** Antarmuka Ardena bertindak sebagai *shell pembungkus* (top bar, collapsible side drawer untuk AI Copilot, dan modal dialog). Hal ini menjamin kelancaran Tahap 04 ketika memetakan desain ke paket `@scratch/scratch-gui` tanpa memicu regresi runtime.

### 3.2 Kedaulatan & Keamanan Data Pengguna (Zero Cloud Auth / IndexedDB Only)
- Seluruh layar konsisten tidak menyertakan elemen login sosial, registrasi akun, sinkronisasi server, atau sistem pembayaran.
- Layar UI-03, UI-12, UI-13, UI-15, dan UI-18 secara aktif mengedukasi pengguna mengenai penyimpanan lokal di browser dan menyarankan pencadangan berkala via format `.sb3` atau `.zip`.
- Layar pengaturan (UI-15) menegaskan bahwa API Key backend tidak pernah dibocorkan atau disimpan di sisi peramban klien.

### 3.3 Aksesibilitas & Ramah Semua Usia (Inklusif & Ramah Siswa)
- **Kontras Warna & Tipografi:** Menggunakan font *Plus Jakarta Sans* yang mudah dibaca dengan hierarki yang jelas dan kontras rasio memenuhi standar WCAG 2.1 AA.
- **Pencegahan Aksi Impulsif Anak:** Pada UI-17 (Dialog Hapus), tombol eksekusi dikunci (*disabled*) hingga kotak centang persetujuan dicentang secara sadar, mencegah terhapusnya karya siswa secara tidak sengaja.
- **Umpan Balik Non-Intrusif:** Notifikasi toast pada UI-18 diletakkan di sudut kanan bawah (`z-index: 60`) agar tidak menutupi stage permainan (480×360 px) maupun area penyusunan balok.

---

## 4. Rekomendasi Teknis untuk Tahap Selanjutnya

1. **Kelayakan Responsive Desktop-First:**
   - Editor Utama (UI-06) dioptimalkan secara ketat untuk resolusi desktop (≥ 1280px) karena kebutuhan ruang kerja Scratch Blocks dan Stage.
   - Pada layar tablet, drawer Copilot direkomendasikan dapat di-*toggle* menjadi modal overlay agar kanvas blok tetap leluasa.
2. **Kesiapan Approval Gate Tahap 02:**
   - Semua deliverable desain telah tersedia dan terdokumentasi.
   - Tahap 02 siap dinyatakan **SELESAI (APPROVED)** oleh pemilik proyek, sehingga proyek dapat melangkah ke **Tahap 03 — Persiapan Repository dan Baseline**.

---

## 5. Lembar Persetujuan (Approval Gate)

- **Tahap:** Tahap 02 — Desain UI/UX Seluruh Halaman dengan Google Stitch  
- **Status Rekomendasi:** `APPROVED FOR NEXT STAGE`  
- **Langkah Berikutnya:** Memulai Tahap 03 (Clone repository, baseline build/test Scratch GUI & VM, penyiapan branch kerja).
