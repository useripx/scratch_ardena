# 🎮 Ardena Playground

> **AI-Assisted Scratch 3.0 Game Generator Web Application**  
> Mengubah instruksi bahasa alami menjadi game berbasis blok Scratch 3.0 yang valid, terstruktur, dan dapat langsung dimainkan atau diedit di Scratch Editor.

---

## 🌟 Ikhtisar Proyek

**Ardena Playground** adalah platform pembuatan game edukatif visual berbasis **Scratch 3.0** yang diperkuat oleh kecerdasan buatan (*AI-assisted visual block programming*). Platform ini dirancang untuk mempermudah anak-anak, pelajar pemula, dan pendidik dalam menuangkan ide game kreatif melalui instruksi teks bahasa alami tanpa terhalang kesulitan sintaksis.

### 🏛️ Prinsip Arsitektur Utama
1. **Decoupled Modular Monolith:** Backend API terisolasi secara bersih dari toolchain frontend Scratch Editor.
2. **Hexa-Cluster AI Cascading:** 48 model AI gratis terdistribusi di 6 penyedia (Google Gemini, Groq, SambaNova, NVIDIA NIM, Cohere v2, OpenRouter) dengan failover sekuensial otomatis demi ketersediaan tinggi tanpa memboroskan kuota (*Kere Hore Architecture*).
3. **Zero Overwrite & Safe Review Gate:** Hasil generasi AI disajikan terlebih dahulu ke layar review bento (*Diff Counters*) dan menjamin tidak ada aset/skrip proyek pengguna yang ditimpa secara tidak sengaja.
4. **Client-Side Persistence (MVP):** Data proyek pengguna tersimpan aman pada browser IndexedDB dengan kemampuan ekspor ke format resmi `.sb3`. **Tanpa ketergantungan database server lokal (No Laragon/MySQL)**.
5. **Zero Secret Leakage:** Kunci API dan token kredensial disamarkan secara dinamis di seluruh lapisan error dan log server.

---

## 🗺️ Roadmap Proyek Master (8 Tahapan)

| Tahap | Deskripsi Tahapan | Status |
|---|---|---|
| **Tahap 01** | Repository Audit, Upstream Feasibility & Stack Selection | ✅ **SELESAI** |
| **Tahap 02** | Desain Antarmuka UI/UX (Google Stitch Prototype — 19 Layar) | ✅ **SELESAI** |
| **Tahap 03** | Persiapan Repository, Git Branching Strategy & Baseline Setup | 🔄 **SEDANG BERJALAN** |
| **Tahap 04** | Implementasi Frontend React (Scratch GUI Adoption) | ⏳ **BERIKUTNYA** |
| **Tahap 05** | Backend AI Service (BE-00 s/d BE-07: API, Adapters, Hardening, QA) | ✅ **SELESAI (100% PASS)** |
| **Tahap 06** | AI Game Generator & Scratch Block Mapping Engine | ⏳ **MENUNGGU** |
| **Tahap 07** | Integrasi Scratch Editor, Local Storage (IndexedDB) & Export (.sb3) | ⏳ **MENUNGGU** |
| **Tahap 08** | Final Hardening, UAT, dan MVP Release | ⏳ **MENUNGGU** |

---

## 🚀 Memulai Layanan Backend (Quickstart)

### 1. Prasyarat Lingkungan
* **Node.js:** Versi LTS (v20.x atau lebih baru disarankan).
* **NPM:** Versi 10.x atau lebih baru.
* **Laragon / PHP / MySQL:** ❌ **Tidak Dibutuhkan**.

### 2. Instalasi & Build
```powershell
# Berpindah ke folder backend
cd backend

# Instalasi dependensi
npm install

# Kompilasi TypeScript
npm run build
```

### 3. Menjalankan Server
```powershell
# Mode Pengembangan (Hot-reload di port 3001)
npm run dev

# Atau Mode Produksi (dari dist/)
npm start
```

### 4. Menjalankan Pengujian Otomatis (100% PASS Gate)
```powershell
# Menjalankan seluruh test suite (65 kasus uji, in-memory mock zero-quota)
npm test

# Menjalankan pengujian dengan laporan Code Coverage (93.49% Statement Coverage)
npm run test:coverage
```

---

## 📂 Struktur Direktori Repositori

```text
ardenaplayground/
├── aturan/                     # Panduan tata kelola kerja & aturan AI Agent
│   ├── universal-rule.md       # Master framework tata kelola proyek
│   ├── AGENTS.md               # Aturan kerja spesifik Ardena Playground
│   └── GEMINI.md               # Indeks ringkas AI Assistant
├── backend/                    # Layanan Modular Monolith Backend API (Node.js/Express/TS)
│   ├── src/                    # Source code backend (app, config, controllers, providers, usecases)
│   ├── tests/                  # Automated test suite (unit, integration, fixtures)
│   └── package.json            # Konfigurasi dependensi backend
├── changelog/                  # Catatan perubahan flat bertimestamp (changelog*.md)
├── Docs/                       # Dokumentasi arsitektur, API contract, SOP, dan ADR
│   ├── backend/                # Spesifikasi teknis backend, Handover, dan Test Report
│   ├── chat/                   # Arsip riwayat dialog sesi pengembangan
│   ├── Decision_Log.md         # Architecture Decision Records (ADR-001 s/d ADR-010)
│   └── Task_Status.md          # Pelacak progres tahapan proyek
├── template/                   # Mockup UI/UX Stitch & referensi aset (READ-ONLY)
└── README.md                   # Dokumentasi utama repositori
```

---

## 📜 Tata Kelola & Kontribusi

Proyek ini dikembangkan di bawah kepemimpinan dan pengawasan penuh **Yogi Ario (Project Owner / Lead Developer)** dengan menjunjung prinsip:

> ***No Plan, No Code. No Approval, No Code. No Evidence, No Completion.***

Branch `main` adalah mahkota produksi yang hanya boleh di-merge oleh Yogi Ario. Seluruh pengembangan fitur dilakukan melalui branch `develop` atau `feature/*`.

---

## 📄 Lisensi
Hak Cipta © 2026 Yogi Ario — Ardena Playground. Dilindungi oleh Undang-Undang.
