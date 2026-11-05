# Changelog — 05 November 2026 (04:00 PM)

> **TAHAP:** BE-06 (Hardening, Integrasi Antar-Modul & Quality Assurance)  
> **OTORITAS PENYETUJU:** Yogi Ario (Project Owner / Lead Developer)  
> **STATUS:** SELESAI (100% PASS — 65 Kasus Uji Lulus, 93.49% Statement Coverage, 0 Gagal)  

---

## 1. Ringkasan Perubahan & Implementasi

Pada tahap BE-06, dilakukan pengerasan sistem (*hardening*), pengujian integrasi antar-modul, serta jaminan mutu (*QA*) menyeluruh sebelum memasuki tahap serah terima dokumentasi backend (BE-07):

1. **Penerapan Batas Payload Standar Global (10 MB):**
   - Mengadopsi instruksi Yogi Ario terkait Standar API Global vibe coding & blok programming: batas body request Express dipasang pada **10 MB** (`express.json({ limit: '10mb' })`).
   - Batas ini secara presisi mencakup teks prompt dan siap menampung struktur aset/proyek Scratch (`project.json` batas Scratch Foundation adalah 10 MB per aset).
2. **Penanganan Terpadu HTTP 413 Payload Too Large:**
   - Memperbarui `src/middleware/error.middleware.ts` untuk menangkap `entity.too.large` dan mengembalikan respons terstandarisasi dengan kode domain `PAYLOAD_TOO_LARGE`.
3. **Pengerasan Mutlak Zero Secret Leakage (Dinamis):**
   - Memperluas `sanitizeErrorMessage` di `src/providers/gemini/gemini.error.ts` untuk tidak hanya mengandalkan regex pola vendor (Google, Groq, NVIDIA, OpenRouter, Bearer header), melainkan juga melakukan redaksi dinamis terhadap seluruh nilai kunci aktif di konfigurasi lingkungan (`config.*ApiKey`).
   - Menerapkan `sanitizeErrorMessage` pada `console.error` di server middleware, menjamin tidak ada token rahasia yang pernah terekspos ke terminal atau server log.
4. **Header Ketahanan Retry-After:**
   - Memasang header respons `Retry-After: 15` saat terjadi pemadaman provider total (HTTP 502 / `AI_PROVIDER_UNAVAILABLE`), memberi sinyal jeda yang jelas bagi klien.
5. **Skrip Code Coverage & Hardening Test Suite:**
   - Menambahkan skrip `"test:coverage": "jest --runInBand --coverage"` pada `package.json`.
   - Mengimplementasikan `tests/integration/hardening.test.ts` (12 skenario pengujian baru) untuk menguji:
     - Penolakan payload > 10 MB (HTTP 413).
     - Audit Zero Secret Leakage across vendors (Google, Groq, NVIDIA, OpenRouter, Bearer header, dynamic env keys).
     - Simulasi pemadaman 6 cluster AI (HTTP 502 All-Fail).
     - Simulasi cascading timeout total > 45s (HTTP 504).
     - Kepatuhan CORS origin dev Scratch Editor (`http://localhost:8601` dan `http://localhost:3000`).
     - Resiliensi terhadap malformed JSON dan parameter invalid.

---

## 2. Berkas yang Dibuat / Dimodifikasi

| Path Berkas | Status | Deskripsi Singkat |
|---|---|---|
| `backend/src/app.ts` | **MODIFIKASI** | Pemasangan batas body parser `10mb`. |
| `backend/src/middleware/error.middleware.ts` | **MODIFIKASI** | Penanganan HTTP 413, sanitasi log server, dan header `Retry-After: 15`. |
| `backend/src/providers/gemini/gemini.error.ts` | **MODIFIKASI** | Redaksi dinamis seluruh token aktif konfigurasi environment. |
| `backend/src/validators/request.validator.ts` | **MODIFIKASI** | Harmonisasi template allowlist dengan menambahkan alias `'maze-adventure'`. |
| `backend/package.json` | **MODIFIKASI** | Penambahan skrip `test:coverage`. |
| `backend/tests/integration/hardening.test.ts` | **BARU** | Test suite terpadu pengerasan keamanan, audit secret, dan fault tolerance. |
| `Docs/Task_Status.md` | **MODIFIKASI** | Pembaruan status BE-06 menjadi DONE. |

---

## 3. Bukti Verifikasi Kepatuhan (100% Automated Testing Gate)

### 3.1 Hasil Automated Test Suite & Code Coverage
```text
PASS tests/integration/hardening.test.ts
PASS tests/unit/adapters.test.ts
PASS tests/unit/provider.manager.test.ts
PASS tests/unit/game.routes.test.ts
PASS tests/unit/health.test.ts
PASS tests/unit/gemini.adapter.test.ts
PASS tests/unit/generate-game.usecase.test.ts
PASS tests/unit/output.validator.test.ts
PASS tests/unit/validator.test.ts

---------------------------------|---------|----------|---------|---------|-------------------
File                             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------------------|---------|----------|---------|---------|-------------------
All files                        |   93.49 |    70.67 |   92.85 |      94 |                   
 src                             |     100 |      100 |     100 |     100 |                   
  app.ts                         |     100 |      100 |     100 |     100 |                   
 src/config                      |   88.23 |     90.9 |      75 |   88.23 |                   
  ai.config.ts                   |     100 |      100 |     100 |     100 |                   
  env.ts                         |    87.5 |     90.9 |      75 |    87.5 | 27,46             
 src/controllers                 |   96.15 |       50 |     100 |   96.15 |                   
  game.controller.ts             |   94.73 |       50 |     100 |   94.73 | 12                
  health.controller.ts           |     100 |      100 |     100 |     100 |                   
  meta.controller.ts             |     100 |       50 |     100 |     100 | 9                 
 src/middleware                  |     100 |    87.87 |     100 |     100 |                   
  cors.middleware.ts             |     100 |      100 |     100 |     100 |                   
  error.middleware.ts            |     100 |       84 |     100 |     100 | 8-34,60,78        
  request-id.middleware.ts       |     100 |      100 |     100 |     100 |                   
 src/providers                   |   96.77 |    58.82 |     100 |   96.66 |                   
  provider.manager.ts            |   96.77 |    58.82 |     100 |   96.66 | 31                
 src/providers/cohere            |   78.78 |     43.1 |   85.71 |   80.95 |                   
  cohere.adapter.ts              |   78.78 |     43.1 |   85.71 |   80.95 | 52,94-129,187-239 
 src/providers/gemini            |   98.66 |       84 |     100 |   98.64 |                   
  gemini.adapter.ts              |     100 |    76.92 |     100 |     100 | 30-32,53-68,123   
  gemini.error.ts                |   96.87 |    91.66 |     100 |   96.87 | 73                
 src/providers/groq              |     100 |    71.42 |     100 |     100 |                   
  groq.adapter.ts                |     100 |    71.42 |     100 |     100 | 19-24,26          
 src/providers/nvidia            |     100 |    64.28 |     100 |     100 |                   
  nvidia.adapter.ts              |     100 |    64.28 |     100 |     100 | 16-28             
 src/providers/openai-compatible |   87.09 |       74 |   71.42 |   88.13 |                   
  openai-compatible.adapter.ts   |   87.09 |       74 |   71.42 |   88.13 | 84,122,155-233    
 src/providers/openrouter        |     100 |    71.42 |     100 |     100 |                   
  openrouter.adapter.ts          |     100 |    71.42 |     100 |     100 | 16-24,28          
 src/providers/sambanova         |     100 |    78.57 |     100 |     100 |                   
  sambanova.adapter.ts           |     100 |    78.57 |     100 |     100 | 16-24             
 src/routes                      |     100 |      100 |     100 |     100 |                   
  game.routes.ts                 |     100 |      100 |     100 |     100 |                   
  health.routes.ts               |     100 |      100 |     100 |     100 |                   
  meta.routes.ts                 |     100 |      100 |     100 |     100 |                   
 src/usecases                    |   95.65 |    72.22 |     100 |   95.65 |                   
  generate-game.usecase.ts       |   95.65 |    72.22 |     100 |   95.65 | 101,139           
 src/validators                  |   98.03 |    71.42 |     100 |   97.91 |                   
  capability.validator.ts        |   95.45 |       75 |     100 |      95 | 111               
  output.validator.ts            |     100 |      100 |     100 |     100 |                   
  request.validator.ts           |     100 |    66.66 |     100 |     100 | 53-56             
---------------------------------|---------|----------|---------|---------|-------------------

Test Suites: 9 passed, 9 total
Tests:       65 passed, 65 total
Snapshots:   0 total
Time:        13.321 s
Ran all test suites.
```

### 3.2 Hasil Kompilasi TypeScript (`npm run build`)
```text
> ardena-playground-backend@1.0.0 build
> tsc
(Exit code 0 — Bebas error kompilasi, build dist/ mutakhir dan valid)
```

