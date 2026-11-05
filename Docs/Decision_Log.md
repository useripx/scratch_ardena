# Decision Log — Rekaman Keputusan Arsitektur & Teknis Ardena Playground

> **STATUS:** DOKUMEN RESMI KEPUTUSAN PROYEK  
> **OTORITAS PENYETUJU:** Yogi Ario (Project Owner / Lead Developer)  
> **DOKUMEN INDUK:** `Docs/Implementation_Plan.md`, `aturan/universal-rule.md`  

---

## Daftar Keputusan Arsitektur (Architecture Decision Records)

| ID Keputusan | Tanggal | Topik Keputusan | Keputusan yang Disetujui | Status |
|---|---|---|---|---|
| **ADR-001** | 05/11/2026 | Backend Runtime & Language | Node.js LTS + TypeScript (Strict) | **APPROVED** |
| **ADR-002** | 05/11/2026 | Pola Arsitektur Backend | Modular Monolith (Layered Architecture) | **APPROVED** |
| **ADR-003** | 05/11/2026 | Lingkungan Eksekusi Server | Dijalankan langsung via Node.js CLI; Tanpa Laragon / Apache / PHP / MySQL | **APPROVED** |
| **ADR-004** | 05/11/2026 | Strategi Provider AI | Gemini 1.5 Flash (Primary) + Groq Llama 3 (Fallback); Tidak dipanggil paralel | **APPROVED** |
| **ADR-005** | 05/11/2026 | Strategi Penyimpanan MVP | Browser IndexedDB (Proyek) & LocalStorage (Preferensi); Tanpa Database Server | **APPROVED** |
| **ADR-006** | 05/11/2026 | Basis Editor Scratch | Native Scratch Editor (`scratchfoundation/scratch-editor`) via repo `scratch_ardena` | **APPROVED** |
| **ADR-007** | 05/11/2026 | Keamanan Output AI | Untrusted Data; Validasi JSON Schema + Capability Allowlist; Zero Code Execution | **APPROVED** |
| **ADR-008** | 05/11/2026 | Referensi Desain UI/UX | Google Stitch prototype di `template/ardenaplayground/` berstatus Read-Only | **APPROVED** |
| **ADR-009** | 05/11/2026 | Gerbang Implementation Plan | Wajib menyajikan Implementation Plan yang dapat dikomentari PO sebelum pengerjaan apa pun | **APPROVED** |
| **ADR-010** | 05/11/2026 | Perencanaan Proaktif Antar-Tahap | Wajib langsung menyusun Implementation Plan tahap berikutnya segera setelah suatu tahap selesai | **APPROVED** |

---

## Rincian Keputusan

### ADR-001: Backend Runtime & Bahasa Pemrograman
* **Konteks:** Diperlukan backend API yang handal, cepat dikembangkan, dan memiliki ekosistem kuat untuk manipulasi data JSON terstruktur serta komunikasi LLM.
* **Keputusan:** Menggunakan **Node.js LTS** dengan **TypeScript** (mode ketat / *strict*).
* **Rationale:** Menjamin *type-safety*, mengurangi potensi *runtime bug*, serta mempermudah berbagi skema validasi antara request dan response.
* **Pihak Penyetuju:** Yogi Ario.

---

### ADR-002: Pola Arsitektur Backend (Modular Monolith)
* **Konteks:** Menentukan struktur layanan backend untuk fase MVP tanpa kompleksitas operasional berlebih.
* **Keputusan:** Mengadopsi pola **Modular Monolith** dengan pemisahan lapisan (HTTP/API Layer, Application/Use Case Layer, Domain/Schema Layer, Provider Layer, dan Validation Layer).
* **Rationale:** Menghindari *overhead* microservices, Kubernetes, dan RPC di fase MVP, namun tetap menjaga isolasi kode yang rapi agar mudah diuji dan dikembangkan.
* **Pihak Penyetuju:** Yogi Ario.

---

### ADR-003: Lingkungan Eksekusi Server (Tanpa Laragon)
* **Konteks:** Menentukan prasyarat lingkungan lokal untuk menjalankan backend Node.js.
* **Keputusan:** Backend dijalankan langsung menggunakan Node.js CLI (`npm run dev`), **Laragon tidak digunakan**. Apache, PHP, dan MySQL ditiadakan dari prasyarat proyek.
* **Rationale:** Backend murni Express TS tidak membutuhkan modul Apache/PHP/MySQL. Menghilangkan Laragon menyederhanakan onboarding dan mencegah konflik port.
* **Pihak Penyetuju:** Yogi Ario.

---

### ADR-004: Strategi AI Provider (Gemini Primary + Groq Fallback)
* **Konteks:** Layanan AI harus memiliki ketersediaan tinggi namun tetap hemat biaya dan tidak memboroskan kuota.
* **Keputusan:** Menggunakan **Google Gemini 1.5 Flash** sebagai provider utama dan **Groq Llama 3 (llama3-70b-8192)** sebagai provider cadangan. Dilarang memanggil keduanya secara paralel (*no racing calls*).
* **Rationale:** Gemini 1.5 Flash memiliki latensi rendah dan kemampuan pemahaman instruksi yang baik. Groq menyediakan inferensi berkecepatan tinggi saat Gemini mengalami rate limit (HTTP 429), 5xx, atau timeout.
* **Pihak Penyetuju:** Yogi Ario.

---

### ADR-005: Strategi Penyimpanan Data Fase MVP (Tanpa Database Server)
* **Konteks:** Mengelola penyimpanan proyek game pengguna dengan gesekan minimal bagi pemula.
* **Keputusan:** Menggunakan **IndexedDB** pada browser untuk menyimpan file game/proyek secara lokal dan **LocalStorage** untuk preferensi UI. Tidak menggunakan PostgreSQL, MongoDB, atau MySQL.
* **Rationale:** Menghilangkan biaya hosting database, autentikasi cloud yang rumit, dan kekhawatiran privasi data anak/pengguna pada fase MVP.
* **Pihak Penyetuju:** Yogi Ario.

---

### ADR-006: Basis Editor Scratch & Toolchain Resmi
* **Konteks:** Menghadirkan kanvas editor Scratch yang kompatibel penuh dengan proyek `.sb3`.
* **Keputusan:** Menggunakan repository resmi `scratchfoundation/scratch-editor` sebagai referensi engine dan repository `https://github.com/useripx/scratch_ardena.git` sebagai repositori utama proyek. Toolchain bawaan (Webpack/Babel pada GUI) dipertahankan tanpa dipaksakan migrasi ke Vite.
* **Rationale:** Menjaga stabilitas engine Scratch VM, Blocks, dan Renderer agar tidak mengalami regresi dependensi.
* **Pihak Penyetuju:** Yogi Ario.

---

### ADR-007: Keamanan & Validasi Output AI
* **Konteks:** LLM berpotensi mengalami halusinasi atau menghasilkan atribut/sintaks yang tidak didukung atau berbahaya.
* **Keputusan:** Respons AI diperlakukan sebagai **data tidak tepercaya (*untrusted data*)**. Output diparsing, divalidasi terhadap JSON Schema (`schemaVersion`), dan diperiksa terhadap **Capability Allowlist** 3 template MVP (*Catching*, *Maze*, *Space Shooter*). Larangan mutlak terhadap eksekusi kode arbitrer (`eval`, `new Function`).
* **Rationale:** Menjamin keamanan aplikasi dan mencegah rusaknya kanvas editor Scratch akibat opcode yang tidak dikenal.
* **Pihak Penyetuju:** Yogi Ario.

---

### ADR-008: Acuan Desain Antarmuka Google Stitch
* **Konteks:** Referensi tampilan dan alur UX yang telah disetujui di folder `template/ardenaplayground/`.
* **Keputusan:** Menetapkan seluruh prototipe visual Google Stitch sebagai acuan resmi antarmuka frontend berstatus **READ-ONLY**. Kode HTML prototipe adalah acuan layout, bukan pengganti runtime React Scratch.
* **Rationale:** Memastikan konsistensi tampilan dan panduan implementasi state loading, review, dan error recovery tanpa merusak file aset mentah.
* **Pihak Penyetuju:** Yogi Ario.

---

### ADR-009: Kewajiban Implementation Plan yang Dapat Dikomentari Sebelum Pengerjaan Apa Pun
* **Konteks:** Menjaga transparansi, kontrol penuh Project Owner, dan mencegah tindakan sepihak AI Agent atau pengembang.
* **Keputusan:** Sebelum mengeksekusi tindakan atau perubahan apa pun (analisis lanjutan, restrukturisasi direktori, pembuatan file, instalasi paket, maupun penulisan kode), AI Agent **wajib menyajikan dokumen Implementation Plan yang terstruktur agar dapat dikomentari, ditinjau, dan diberi revisi langsung oleh Yogi Ario.** Pengerjaan teknis hanya boleh dijalankan setelah komentar dan persetujuan eksplisit diberikan.
* **Rationale:** Memastikan Yogi Ario memegang kendali penuh atas arah pengerjaan teknis sebelum satu baris kode pun dieksekusi.
* **Pihak Penyetuju:** Yogi Ario.

---

### ADR-010: Perencanaan Proaktif Antar-Tahap (Proactive Sequential Planning)
* **Konteks:** Menjaga kelancaran alur kerja (*development momentum*) tanpa jeda atau kebingungan setelah suatu tahapan selesai diuji 100% PASS.
* **Keputusan:** Segera setelah suatu tahapan selesai diimplementasikan, diverifikasi 100% PASS (0 Gagal / 0 Error), dan dicatat pada changelog serta task tracker, AI Agent **wajib secara otomatis dan proaktif langsung menyusun dokumen Implementation Plan untuk tahapan berikutnya** (dalam format artefak yang dapat dikomentari), lalu meminta persetujuan Yogi Ario sebelum melangkah ke eksekusi kode tahap selanjutnya.
* **Rationale:** Menghilangkan jeda (*downtime*) komunikasi, menjaga arah roadmap tetap jelas di setiap langkah, dan memastikan Project Owner selalu memiliki rencana siap tinjau tanpa harus meminta manual.
* **Pihak Penyetuju:** Yogi Ario.


