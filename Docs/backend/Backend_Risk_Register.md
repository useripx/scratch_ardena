# Backend Risk Register — Ardena Playground

> **STATUS:** BASELINE RISK REGISTER (BE-00)  
> **OTORITAS:** Yogi Ario (Project Owner / Lead Developer)  
> **TANGGAL:** 05 November 2026  

---

## 1. Matriks Risiko Teknis Backend

| ID Risiko | Kategori Risiko | Probabilitas | Dampak | Tingkat Risiko | Strategi Mitigasi | Status |
|---|---|---|---|---|---|---|
| **RSK-01** | Kuota API Habis / Rate Limit (HTTP 429) | Sedang | Tinggi | **TINGGI** | Penerapan fallback otomatis terkontrol ke Groq Llama 3 dan countdown backoff timer pada UI klien. | **MITIGATED** (By Design) |
| **RSK-02** | Halusinasi LLM & Format JSON Malformed | Sedang | Tinggi | **TINGGI** | Validasi JSON Schema bertingkat, penegakan Capability Allowlist, dan temperature rendah (0.2). | **MITIGATED** (By Design) |
| **RSK-03** | Kebocoran Kunci Rahasia API (Google / Groq) | Rendah | Kritis | **KRITIS** | Kunci hanya disimpan di `.env` backend, masking otomatis pada logger, dan berkas kredensial dilindungi `.gitignore`. | **CONTROLLED** |
| **RSK-04** | Timeout Beruntun (*Cascading Latency*) | Sedang | Sedang | **SEDANG** | Penetapan batas waktu keras (15s per provider, 30s total request), larangan pemanggilan paralel. | **MITIGATED** (By Design) |
| **RSK-05** | Perbedaan Kontrak Skema Frontend - Backend | Rendah | Tinggi | **TINGGI** | Spesifikasi OpenAPI tunggal di `Docs/backend/API_Contract.md` dan contract test otomatis sebelum integrasi. | **CONTROLLED** |
| **RSK-06** | Kerusakan Toolchain Asli Scratch Editor | Rendah | Kritis | **KRITIS** | Pemisahan repository yang tegas; backend berdiri sebagai layanan terpisah tanpa mengutak-atik Webpack Scratch GUI. | **CONTROLLED** |
| **RSK-07** | Eksekusi Kode Arbitrer dari Output AI | Sangat Rendah| Kritis | **KRITIS** | Penolakan mutlak fungsi `eval()`, hanya data JSON terstruktur yang diteruskan ke Block Mapper. | **PREVENTED** (Zero Tolerance) |

---

## 2. Rencana Tindakan Kontinjensi

1. **Jika Gemini Mengalami Outage Total:**
   * Sistem secara otomatis mengalihkan seluruh traffic generasi ke Groq Llama 3 tanpa intervensi manual pengembang.
2. **Jika Output AI Mengandung Opcode Asing:**
   * Sistem melempar error `VM_WHITELIST_VALIDATION_FAILED` ke log dan mengembalikan HTTP 422 ke frontend tanpa menginjeksi blok berbahaya ke kanvas Scratch. Proyek pengguna di IndexedDB tetap 100% utuh (*zero dirty writes*).
3. **Jika Terjadi Indikasi Kebocoran Kunci:**
   * Kunci API langsung dicabut dan dirotasi pada konsol Google AI Studio / Groq, lalu `.env` diperbarui dengan nilai baru.

