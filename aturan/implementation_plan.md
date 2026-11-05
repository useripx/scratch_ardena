# Implementation Plan Backend --- Ardena Playground

**Versi:** 1.4
**Tanggal:** 5 November 2026
**Status:** Revisi repository proyek --- menunggu audit read-only dan persetujuan
pemilik proyek untuk mulai BE-00
**Dokumen induk:** `Docs/Implementation_Plan.md` (Implementation Plan
utama v1.4)
**Dokumen terkait:** `Rules/`, `Template/UI/`, `Docs/Task_Status.md`,
`Docs/Decision_Log.md`
**Area:** Backend Service, API, AI Provider Integration, AI Output
Validation, Backend Quality
**Target pelaksana:** Backend Engineer, AI Agent Antigravity, Frontend
Engineer, pengembang Game Generator/Block Mapper, QA/Reviewer
**Pemilik keputusan:** Pemilik proyek Ardena Playground

---

## Riwayat versi

---

  Versi                               Perubahan

---

  1.0                                 Rancangan awal backend, API,
                                      provider, dan tahapan kerja.

  1.1                                 Penambahan ketentuan folder
                                      `Rules/` dan `Template/`.

  1.2                                 Penegasan stack Node.js LTS +
                                      TypeScript + Express secara
                                      langsung, tanpa Laragon.

  1.3                                 Konsolidasi dan pendalaman rencana
                                      pengerjaan BE: keputusan
                                      arsitektur, alur request, kontrak
                                      API, provider/fallback, schema dan
                                      keamanan output, struktur modul,
                                      tahapan rinci, dependency
                                      antar-tahap, pengujian,
                                      operasional, kolaborasi, acceptance
                                      criteria, dan format serah terima.

1.4                                 Penetapan eksplisit repository
                                      utama proyek Ardena Playground
                                      (scratch_ardena) dan repository
                                      upstream/referensi Scratch Editor;
                                      penambahan aturan audit read-only,
                                      pemisahan kepemilikan repository,
                                      serta pembaruan ruang lingkup BE-00.
--------------------------------------------------------------------------

## 1. Ringkasan Eksekutif

Dokumen ini menjadi pedoman kerja Backend Engineering (BE) Ardena
Playground dari analisis sampai serah terima. Backend berfungsi sebagai
lapisan API yang aman antara frontend Scratch Editor dan layanan AI
eksternal. Backend menerima instruksi pengguna, memvalidasi request,
mengorkestrasi provider AI, memeriksa hasil AI, dan mengembalikan data
game terstruktur yang dapat diproses oleh modul Game Generator/Block
Mapper.

Keputusan teknis dasar yang telah disepakati:

1. Backend menggunakan **Node.js LTS + TypeScript + Express**,
   dijalankan langsung tanpa Laragon.
2. Backend merupakan **modular monolith**, bukan microservices.
3. **Gemini adalah provider utama** dan **Groq adalah provider
   fallback**. Keduanya tidak dipanggil paralel untuk request normal.
4. API key dan secret hanya berada di lingkungan backend.
5. MVP tidak menggunakan database server. Data proyek pengguna disimpan
   di browser melalui IndexedDB; LocalStorage hanya untuk preferensi UI
   ringan.
6. Output AI diperlakukan sebagai data tidak tepercaya, divalidasi
   dengan schema dan allowlist, serta tidak boleh dieksekusi sebagai
   kode.
7. API dan schema harus disepakati bersama Frontend dan pengembang
   Block Mapper sebelum implementasi integrasi.
8. Setiap tahap tunduk pada approval gate. Dokumen ini bukan izin
   otomatis untuk coding.

**Repository proyek:** `https://github.com/useripx/scratch_ardena.git` (repository utama).
**Upstream/referensi editor:** `https://github.com/scratchfoundation/scratch-editor`.
Penetapan URL tidak berarti isi repository telah diaudit atau komponen engine telah terintegrasi; verifikasi dilakukan pada BE-00 secara read-only.

Prinsip tata kelola:

- **No Plan, No Code.**
- **No Approval, No Code.**
- **No Evidence, No Completion.**
- AI Agent tidak boleh menyetujui pekerjaannya sendiri.
- Persetujuan satu tahap tidak otomatis menyetujui tahap berikutnya.

## 2. Tujuan dan Hasil yang Diharapkan

### 2.1 Tujuan backend

- Menyediakan endpoint API yang stabil dan terdokumentasi.
- Menjadi perantara aman antara browser dan provider AI.
- Mengelola Gemini dan Groq melalui adapter yang terpisah.
- Menyediakan mekanisme timeout, retry, fallback, dan error
  normalization.
- Menghasilkan respons AI terstruktur sesuai schema yang disepakati.
- Membatasi fitur game pada kemampuan generator Scratch yang
  benar-benar didukung.
- Menyediakan logging, pengujian, dokumentasi, dan bukti yang dapat
  direproduksi.
- Memudahkan pengembangan dan pemeliharaan oleh Backend Engineer
  maupun AI Agent.

### 2.2 Hasil akhir BE MVP

Pada akhir pengerjaan, backend diharapkan:

1. Dapat dijalankan secara lokal dengan instruksi yang terdokumentasi.
2. Memiliki endpoint health, generate game, dan metadata kemampuan
   sesuai kontrak final.
3. Dapat memproses request yang valid dan menolak request tidak valid.
4. Menggunakan Gemini sebagai provider utama.
5. Beralih ke Groq hanya ketika kondisi memenuhi kebijakan fallback.
6. Memvalidasi seluruh output AI sebelum dikirim ke frontend.
7. Tidak membocorkan API key, secret, stack trace, atau informasi
   internal.
8. Memiliki unit test, integration test, contract test, dan failure
   test.
9. Terintegrasi dengan frontend dan Block Mapper melalui kontrak yang
   sama.
10. Memiliki README, OpenAPI, laporan test, panduan operasi, dan daftar
    keterbatasan.
11. Mendapatkan final approval pemilik proyek.

### 2.3 Bukan tujuan backend MVP

- Autentikasi akun dan penyimpanan cloud.
- Database server untuk menyimpan proyek pengguna.
- Marketplace, galeri publik, multiplayer, atau kolaborasi real-time.
- Menjalankan JavaScript atau kode arbitrer yang dihasilkan AI.
- Menghasilkan seluruh kemungkinan proyek Scratch tanpa batasan.
- Menjalankan Gemini dan Groq secara paralel pada jalur normal.
- Microservices, Kubernetes, message broker, atau infrastruktur
  kompleks.
- Melatih model AI sendiri.
- Menjamin aplikasi dapat menghasilkan game ketika internet/provider
  AI tidak tersedia.

## 3. Kedudukan Dokumen dan Tata Kelola

Dokumen backend merupakan turunan dari Implementation Plan utama v1.4.
Jika terdapat konflik, pelaksana wajib berhenti dan meminta keputusan
pemilik proyek. Perubahan terhadap keputusan induk harus dicatat dalam
Decision Log dan disetujui.

### 3.1 Urutan acuan kerja

1. `Rules/` --- aturan universal, approval gate, aturan AI Agent,
   development, keamanan, testing, dan dokumentasi.
2. `Docs/Implementation_Plan.md` --- rencana induk Ardena Playground.
3. `Docs/Implementation_Plan_Backend.md` --- rencana teknis khusus
   backend.
4. `Template/UI/` --- desain UI/UX Google Stitch yang sudah direview
   dan disetujui; digunakan BE untuk memahami state, interaksi,
   loading, error, dan kebutuhan kontrak FE-BE.
5. Dokumen tahap aktif --- task, API Contract, schema, Decision Log,
   Test Report, dan instruksi yang telah disetujui.

### 3.2 Folder `Rules/`

Folder `Rules/` berada di root proyek dan merupakan pedoman wajib lintas
peran. Cakupan minimal:

- `universal-rules.md`
- `approval-gate.md`
- `ai-agent-rules.md`
- `development-rules.md`
- `security-rules.md`
- `testing-evidence-rules.md`
- `documentation-rules.md`

Nama file dapat berubah melalui keputusan proyek, tetapi cakupan aturan
harus tetap tersedia. Backend Engineer dan Antigravity wajib membaca
aturan relevan sebelum bekerja. Jika aturan yang diperlukan belum
tersedia atau belum disetujui, pekerjaan terkait tidak boleh dimulai
dengan membuat aturan pengganti sendiri.

### 3.3 Folder `Template/`

`Template/UI/` menyimpan desain hasil Google Stitch yang sudah
disetujui. Desain ini merupakan acuan frontend, bukan source code
runtime. BE menggunakannya untuk memahami kebutuhan API seperti:

- State generating/loading.
- State hasil AI dan review.
- Error dan recovery.
- Konfirmasi sebelum hasil diterapkan.
- Empty state, notifikasi, dan daftar proyek lokal.

Komponen asli Scratch GUI, Blocks, VM, dan Renderer tetap dipertahankan.
Stitch tidak menggantikan mesin editor Scratch.

### 3.4 Repository resmi proyek dan upstream Scratch

Dua repository berikut memiliki fungsi yang berbeda dan tidak boleh
tertukar.

**A. Repository utama Ardena Playground**

- URL: `https://github.com/useripx/scratch_ardena.git`
- Fungsi: repository utama milik proyek Ardena Playground untuk
  menyimpan dan mengembangkan source code proyek, dokumentasi,
  konfigurasi, serta integrasi komponen.
- Status: URL repository telah ditetapkan oleh Project Owner.
- Kondisi isi, branch aktif, struktur folder, dan status sinkronisasi
  belum dianggap terverifikasi oleh dokumen ini. Semuanya harus
  diperiksa secara read-only saat audit BE-00.

**B. Repository upstream/referensi Scratch Editor**

- URL: `https://github.com/scratchfoundation/scratch-editor`
- Fungsi: repository resmi Scratch Editor yang menjadi upstream atau
  referensi teknis untuk memahami dan mempertahankan ekosistem editor
  Scratch.
- Repository ini bukan repository utama proyek Ardena Playground.
- Scratch GUI/editor dan komponen terkait seperti Scratch VM, Blocks,
  serta Renderer harus diperiksa berdasarkan dependency dan struktur
  aktual repository proyek. Jangan mengasumsikan semuanya merupakan
  submodule, fork terpisah, atau sudah terpasang sebagai folder mandiri.

**Aturan hubungan kedua repository:**

1. `scratch_ardena` adalah titik awal audit dan repository utama untuk
   pekerjaan proyek Ardena Playground.
2. `scratch-editor` adalah upstream/referensi engine/editor, bukan
   lokasi default untuk menyimpan perubahan khusus Ardena Playground.
3. Jangan melakukan commit, push, pull, merge, rebase, checkout,
   reset, clean, atau perubahan Git lainnya pada tahap orientasi/audit
   tanpa instruksi dan approval eksplisit.
4. Jangan mengubah remote, branch, submodule, subtree, atau strategi
   penggabungan upstream tanpa keputusan Project Owner.
5. Jangan menyalin atau mengintegrasikan seluruh repository Scratch
   Editor secara otomatis. Audit struktur dan dependency terlebih
   dahulu, lalu ajukan opsi integrasi beserta konsekuensinya.
6. Jangan mengasumsikan backend harus berada pada root atau folder
   tertentu. Lokasinya ditetapkan setelah pemeriksaan repository
   `scratch_ardena` dan persetujuan BE-00.
7. Jangan menampilkan isi file secret, token, private key, atau nilai
   `.env` dalam laporan. Cukup laporkan keberadaan dan nama variabel
   yang diperlukan tanpa nilainya.
8. Jika repository tidak dapat diakses, laporkan sebagai BLOCKED atau
   UNVERIFIED. Jangan mengarang hasil audit.

### 3.5 Aturan audit repository pada BE-00

Audit awal dimulai dari repository utama
`https://github.com/useripx/scratch_ardena.git` dalam mode read-only.

Audit sekurang-kurangnya mencatat:

- URL remote yang terkonfigurasi (tanpa mempublikasikan kredensial
  yang mungkin tertanam pada URL).
- Branch aktif dan status working tree.
- Struktur root dan folder yang relevan.
- Keberadaan `Rules/`, `Template/`, `Docs/`, dan dokumentasi rencana.
- Keberadaan Scratch Editor serta cara komponen GUI, VM, Blocks, dan
  Renderer direferensikan.
- Keberadaan backend saat ini, jika ada.
- Manifest dan lockfile yang relevan.
- Versi runtime/toolchain yang dinyatakan oleh konfigurasi.
- Potensi konflik dependency atau toolchain.

Audit tidak boleh mengubah working tree. Jangan memasang dependency
atau menjalankan perintah yang berpotensi memodifikasi lockfile,
cache proyek, konfigurasi, atau file hasil build. Jika suatu pemeriksaan
berpotensi menulis file, minta persetujuan terlebih dahulu.

Hasil audit harus membedakan:

- **Existing:** benar-benar ditemukan dan diverifikasi.
- **Missing:** tidak ditemukan pada area yang diperiksa.
- **Proposed:** baru berupa rancangan dalam dokumen.
- **Unverified:** belum dapat diperiksa atau akses tidak tersedia.

Lokasi backend, strategi integrasi Scratch upstream, dan perubahan
struktur hanya boleh diputuskan setelah temuan audit dibahas dan
disetujui Project Owner.

## 4. Konteks Produk dan Batas Tanggung Jawab

Ardena Playground adalah aplikasi web untuk membantu pengguna membuat
game berbasis Scratch melalui instruksi bahasa alami. Pengguna menulis
ide game, AI menghasilkan rancangan terstruktur, pengguna meninjau
hasil, lalu modul generator memetakannya ke blok Scratch. Pengguna tetap
dapat memeriksa dan mengedit blok secara manual.

### 4.1 Pembagian tanggung jawab

---

  Komponen                Tanggung jawab          Pemilik teknis

---

  Frontend / Scratch GUI  UI, prompt, status      Frontend Engineer
                          proses, review,
                          workspace, preview

  Backend API             HTTP API, validasi      Backend Engineer
                          request, orkestrasi use
                          case, response

  Gemini Adapter          Komunikasi provider     Backend Engineer
                          Gemini

  Groq Adapter            Komunikasi provider     Backend Engineer
                          Groq

  Provider Manager        Pemilihan provider,     Backend Engineer
                          retry, fallback

  Output Validator        Parsing, schema, batas  Backend Engineer
                          nilai, allowlist        bersama Block Mapper

  Game Generator / Block  Mengubah konfigurasi    Pengembang Generator
  Mapper                  game menjadi struktur
                          blok Scratch yang
                          didukung

  Scratch VM / GUI        Menampilkan,            Frontend/Scratch
                          menjalankan, dan        Integration
                          mengedit proyek Scratch

  QA / Reviewer           Verifikasi kontrak,     QA/Reviewer
                          keamanan, integrasi,
                          dan regresi

Pemilik proyek          Persetujuan scope,      Pemilik proyek
                          keputusan, dan final
                          acceptance
----------------------------------------------------------------------------------

### 4.2 Batas backend

Backend tidak menggantikan Scratch GUI, Scratch Blocks, Scratch VM, atau
Scratch Renderer. Backend tidak mengakses IndexedDB browser dan tidak
menyimpan proyek pengguna pada database server dalam MVP. Backend
menghasilkan data terstruktur; frontend/Block Mapper bertanggung jawab
menerapkan data ke workspace setelah review dan persetujuan pengguna.

### 4.3 Alur tingkat tinggi

1. Pengguna memasukkan prompt dan memilih template.
2. Frontend mengirim request ke backend.
3. Backend memeriksa ukuran, format, field, dan batas request.
4. Use case `generate-game` menyiapkan instruksi dan konteks yang
   diizinkan.
5. Provider Manager memanggil Gemini.
6. Jika Gemini gagal dengan kondisi yang memenuhi kebijakan, Provider
   Manager dapat mencoba Groq.
7. Output provider diparsing, dinormalisasi, dan divalidasi.
8. Backend mengembalikan data game atau error aman.
9. Frontend menampilkan hasil untuk direview.
10. Block Mapper memetakan hasil yang disetujui ke blok Scratch.
11. Pengguna dapat menjalankan dan mengedit proyek melalui editor
    Scratch.

## 5. Keputusan Teknologi

---

  Area                    Keputusan               Catatan

---

  Runtime                 Node.js LTS             Versi minor/patch
                                                  dipastikan saat BE-00
                                                  berdasarkan
                                                  kompatibilitas dan
                                                  dukungan resmi.

  Bahasa                  TypeScript              Gunakan strict checking
                                                  sejauh kompatibel
                                                  dengan toolchain.

  HTTP framework          Express                 Tidak mengganti stack
                                                  Scratch Editor.

  Arsitektur              Modular monolith        Satu backend service
                                                  dengan modul terpisah.

  Validasi                JSON Schema atau        Pilih satu pendekatan
                          validator setara        konsisten dan
                                                  dokumentasikan.

  AI utama                Gemini                  Melalui adapter
                                                  backend.

  AI fallback             Groq                    Hanya sesuai fallback
                                                  policy.

  API documentation       OpenAPI                 Menjadi kontrak yang
                                                  direview bersama FE.

  Logging                 Structured logging      Redaksi secret dan data
                                                  sensitif.

  Testing                 Test runner kompatibel  Keputusan paket
                          repository              ditetapkan saat BE-00.

  Database server         Tidak digunakan         IndexedDB untuk proyek
                                                  lokal pada browser.

  Konfigurasi             Environment variables   Secret tidak masuk
                                                  source control.

Deployment              Belum ditentukan        Lokal/development lebih
                                                  dahulu.
---------------------------------------------------------

### 5.1 Keputusan server: Node.js langsung, tanpa Laragon

**Keputusan yang disetujui:** backend menggunakan Node.js LTS +
TypeScript + Express secara langsung, tanpa Laragon.

Alasan:

- Backend menggunakan Node.js, bukan PHP.
- Express menangani routing HTTP; Apache tidak diperlukan sebagai
  server aplikasi backend.
- MVP tidak membutuhkan MySQL/PostgreSQL.
- Mengurangi lapisan konfigurasi yang tidak diperlukan.
- Scratch Editor dan backend berjalan sebagai dua proses development
  yang terpisah.

Konsekuensi:

1. Laragon bukan prasyarat proyek.
2. Apache, PHP, dan MySQL bukan bagian dari backend MVP.
3. Backend dijalankan melalui script package manager yang disepakati,
   misalnya `npm run dev`.
4. Port diatur melalui environment variable. `3001` hanya contoh, bukan
   keputusan port final.
5. Scratch Editor dijalankan dengan toolchain resmi repository Scratch.
6. FE dan BE berkomunikasi melalui HTTP API dan CORS yang dikonfigurasi
   sesuai origin development.
7. Docker, reverse proxy, process manager, dan hosting baru dievaluasi
   pada tahap deployment setelah disetujui.

### 5.2 Prinsip pemilihan dependensi

- Gunakan dependensi minimum yang benar-benar dibutuhkan.
- Periksa kompatibilitas Node.js, lisensi, pemeliharaan, dan keamanan.
- Hindari paket yang menduplikasi fungsi runtime/framework.
- Kunci versi melalui lockfile.
- Jangan melakukan upgrade massal tanpa analisis.
- Catat nama paket, versi, alasan, alternatif, lisensi, dan risiko.
- Jangan menambah ORM/database driver karena MVP tidak menggunakan
  database server.

## 6. Arsitektur Backend

### 6.1 Pola arsitektur

Gunakan modular monolith dengan pemisahan tanggung jawab:

- **HTTP/API layer:** route, controller, middleware, request/response.
- **Application layer:** use case dan orkestrasi alur bisnis.
- **Domain layer:** tipe, schema, aturan domain, dan error internal.
- **Provider layer:** interface, adapter Gemini, adapter Groq,
  provider manager.
- **Validation layer:** validasi request, parsing output, schema
  validation, allowlist.
- **Infrastructure/observability:** konfigurasi environment, logger,
  request ID, dan integrasi teknis.

Controller tidak boleh menjadi tempat seluruh logika AI. Adapter tidak
menentukan kebijakan bisnis fallback. Use case tidak boleh bergantung
langsung pada SDK provider tertentu.

### 6.2 Diagram konseptual

```text
Browser / Frontend (Scratch GUI + AI Panel)
                 |
                 | HTTP request
                 v
           Backend API
                 |
       Middleware & Request ID
                 |
        Request Validation
                 |
        Generate Game Use Case
                 |
          Provider Manager
             /       \
            v         v
         Gemini      Groq
         (utama)   (fallback)
             \       /
              v     v
          Output Parser
                 |
          Schema Validator
                 |
          Capability Allowlist
                 |
          Safe API Response
                 |
                 v
        Frontend Review State
                 |
           Block Mapper
                 |
       Scratch Workspace / VM
```

### 6.3 Struktur direktori konseptual

Struktur final ditetapkan setelah audit repository dan persetujuan
BE-00. Berikut gambaran target, bukan instruksi untuk membuat semua
folder sekaligus.

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── ai.config.ts
│   ├── routes/
│   │   ├── health.routes.ts
│   │   ├── game.routes.ts
│   │   └── meta.routes.ts
│   ├── controllers/
│   │   └── game.controller.ts
│   ├── application/
│   │   └── use-cases/
│   │       └── generate-game.use-case.ts
│   ├── domain/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── errors/
│   ├── providers/
│   │   ├── provider.interface.ts
│   │   ├── provider.manager.ts
│   │   ├── gemini/
│   │   └── groq/
│   ├── validators/
│   ├── middleware/
│   ├── observability/
│   └── utils/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   └── fixtures/
├── openapi/
│   └── openapi.yaml
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### 6.4 Konvensi modul

- Satu modul memiliki satu tanggung jawab utama.
- Import dependency harus mengarah ke lapisan yang sesuai; domain
  tidak bergantung pada Express atau SDK provider.
- Hindari circular dependency.
- Nama file dan simbol mengikuti konvensi repository yang telah
  disetujui.
- Jangan membuat abstraction/interface yang tidak memiliki kebutuhan
  nyata.
- Perubahan struktur harus dijelaskan dalam laporan agent dan
  direview.

## 7. Kontrak API

Kontrak di bawah adalah baseline untuk dibahas pada BE-00. Kontrak baru
berstatus **final** setelah FE, BE, dan pengembang Block Mapper
menyetujuinya dan OpenAPI diperbarui.

### 7.1 Endpoint MVP

---

  Method                  Endpoint                      Tujuan

---

  `GET`                   `/api/v1/health`              Memeriksa backend hidup
                                                        dan siap menerima
                                                        request dasar.

  `POST`                  `/api/v1/games/generate`      Menghasilkan
                                                        konfigurasi game
                                                        terstruktur.

`GET`                   `/api/v1/meta/capabilities`   Menginformasikan
                                                        template/fitur yang
                                                        didukung generator.
---------------------------------------------------------------------------

Health endpoint tidak boleh memanggil provider AI atau menimbulkan
biaya. Jangan mengekspos secret, konfigurasi internal, atau detail akun
provider.

### 7.2 Draft request generate

```json
{
  "prompt": "Buat game menangkap koin dengan karakter yang bergerak ke kiri dan kanan.",
  "template": "catching-game",
  "language": "id",
  "schemaVersion": "1.0"
}
```

Field, batas panjang, nilai enum, dan field opsional harus ditetapkan
dalam OpenAPI dan schema validator. Request harus memiliki batas ukuran
body dan validasi tipe data.

### 7.3 Draft response sukses

```json
{
  "success": true,
  "data": {
    "schemaVersion": "1.0",
    "game": {
      "title": "Petualangan Koin",
      "genre": "catching-game",
      "description": "Tangkap koin yang jatuh.",
      "objects": [],
      "rules": [],
      "controls": []
    }
  },
  "meta": {
    "requestId": "req_example",
    "provider": "gemini"
  }
}
```

Contoh di atas hanya ilustrasi bentuk. Struktur `objects`, `rules`,
`controls`, opcode, parameter, dan relasi harus ditentukan bersama Block
Mapper berdasarkan kemampuan Scratch yang telah diverifikasi. Metadata
provider hanya boleh menampilkan informasi yang aman dan memang
diperlukan.

### 7.4 Draft response error

```json
{
  "success": false,
  "error": {
    "code": "AI_PROVIDER_UNAVAILABLE",
    "message": "Layanan AI sementara tidak tersedia.",
    "retryable": true
  },
  "meta": {
    "requestId": "req_example"
  }
}
```

Ketentuan:

- Kode error stabil dan terdokumentasi.
- Pesan untuk pengguna aman dan mudah dipahami.
- Detail teknis hanya berada di log server yang disanitasi.
- Jangan mengirim stack trace, API key, prompt internal, atau detail
  infrastruktur.
- Status HTTP dan error code harus konsisten.

### 7.5 Kategori status HTTP

Pemetaan final dikunci di OpenAPI, dengan baseline:

  Kategori   Penggunaan

---

  2xx        Request berhasil diproses.
  400        Request tidak valid atau field tidak memenuhi aturan.
  413        Ukuran request melebihi batas.
  429        Batas request backend tercapai.
  502/503    Provider gagal atau tidak tersedia.
  504        Timeout pada pemrosesan upstream.
  500        Kesalahan internal yang tidak terduga.

Jangan mengembalikan status sukses jika output AI gagal divalidasi.

### 7.6 Kesepakatan FE-BE-Generator

Sebelum implementasi generate endpoint:

- Field request dan response disepakati.
- Schema version ditentukan.
- Template ID dan daftar fitur didukung ditetapkan.
- Error code dan status HTTP disepakati.
- Batas request, timeout, dan perilaku loading/cancel dibahas.
- Block Mapper mengonfirmasi bentuk data yang dapat dipetakan.
- OpenAPI dan schema menjadi satu acuan, bukan dokumen yang saling
  berbeda.
- Contract test disiapkan untuk mencegah drift.

## 8. Integrasi AI Provider

### 8.1 Gemini sebagai provider utama

Adapter Gemini bertanggung jawab untuk:

- Membentuk request berdasarkan konfigurasi yang disetujui.
- Mengirim instruksi sistem dan prompt pengguna dengan batasan jelas.
- Menetapkan parameter generasi dan batas output.
- Menerapkan timeout.
- Memetakan error SDK/API ke kategori error internal.
- Mengembalikan hasil provider ke parser/validator, bukan langsung ke
  frontend.

Model ID, SDK, dan format structured output harus diverifikasi pada
waktu implementasi. Jangan mengasumsikan nama model atau fitur provider
tetap tersedia tanpa pemeriksaan.

### 8.2 Groq sebagai provider fallback

Adapter Groq menerapkan interface internal yang sama dengan Gemini. Groq
digunakan hanya ketika Provider Manager memutuskan kegagalan Gemini
memenuhi kebijakan fallback. Hasil Groq tetap melewati parser dan
validator yang sama.

### 8.3 Interface internal

Contoh konseptual:

```ts
export interface AIProvider {
  readonly name: string;

  generate(
    input: GenerateGameInput
  ): Promise<ProviderGenerationResult>;
}
```

Nama tipe dan bentuk final mengikuti desain BE-00. Jangan menyalin
contoh tanpa menyesuaikan kebutuhan dan SDK aktual.

### 8.4 Kebijakan retry dan fallback

---

  Kondisi                             Tindakan

---

  Gemini timeout                      Retry terbatas, lalu evaluasi
                                      fallback.

  Gangguan jaringan sementara         Retry terbatas, lalu evaluasi
                                      fallback.

  HTTP 429                            Hormati `Retry-After` jika
                                      tersedia; fallback sesuai batas dan
                                      kebijakan.

  HTTP 5xx provider                   Retry terbatas, lalu fallback.

  API key invalid/unauthorized        Hentikan retry berulang; tandai
                                      konfigurasi bermasalah.

  Request client tidak valid          Kembalikan 4xx; jangan panggil
                                      provider/fallback.

  Respons AI gagal schema             Tolak; satu upaya perbaikan
                                      terkontrol hanya jika disetujui dan
                                      dibatasi.

Gemini dan Groq gagal               Hentikan proses dan kembalikan
                                      error aman.
-------------------------------------------------

Aturan dasar:

1. Satu request hanya menggunakan satu provider pada satu waktu.
2. Gemini dicoba terlebih dahulu.
3. Maksimal satu retry per provider sebagai nilai awal perencanaan;
   angka final ditetapkan melalui pengujian dan persetujuan.
4. Jangan retry untuk kesalahan input client.
5. Hindari retry berlapis pada HTTP client, adapter, dan Provider
   Manager.
6. Semua retry harus dibatasi oleh timeout total request.
7. Fallback tidak boleh menyebabkan loop.
8. Catat provider, kategori error, durasi, dan keputusan fallback tanpa
   merekam secret.
9. Jangan memanggil Gemini dan Groq secara paralel untuk request
   normal.
10. Jangan mengulang request yang berpotensi menimbulkan biaya tanpa
    batas.

### 8.5 Konfigurasi environment

Contoh nama variabel; nilai dan default ditentukan saat BE-00:

```env
NODE_ENV=development
PORT=3001
CORS_ORIGINS=

GEMINI_API_KEY=
GEMINI_MODEL=

GROQ_API_KEY=
GROQ_MODEL=

AI_REQUEST_TIMEOUT_MS=
AI_MAX_OUTPUT_TOKENS=
AI_MAX_RETRIES_PER_PROVIDER=
AI_MAX_PROMPT_LENGTH=
AI_MAX_REQUEST_BODY_BYTES=
```

Ketentuan:

- `.env` tidak boleh masuk repository.
- `.env.example` hanya berisi nama variabel dan placeholder kosong.
- Jangan menaruh secret di source code, frontend, screenshot, laporan,
  atau commit.
- Validasi konfigurasi saat startup.
- Error konfigurasi tidak boleh mencetak nilai secret.
- Jika key terekspos, hentikan penggunaannya dan lakukan rotasi.
- Jangan pernah meminta pengguna menempelkan key ke chat atau prompt
  agent.

## 9. Schema Output AI dan Batas Kemampuan Generator

### 9.1 Prinsip utama

Output AI adalah data tidak tepercaya. HTTP 200 dari provider tidak
membuktikan hasilnya benar, valid, aman, atau kompatibel dengan Scratch.

### 9.2 Tahapan validasi

1. Periksa status dan struktur respons provider.
2. Ekstrak bagian konten yang diharapkan.
3. Parse JSON secara aman.
4. Validasi terhadap schema versi yang disepakati.
5. Validasi enum, panjang string, angka, dan jumlah elemen.
6. Validasi template dan fitur terhadap capability allowlist.
7. Validasi nama blok/opcode dan parameter yang didukung.
8. Normalisasi nilai yang diizinkan.
9. Tolak field atau fitur yang tidak dikenal sesuai kebijakan schema.
10. Kembalikan hanya data yang lolos seluruh pemeriksaan.

### 9.3 Allowlist kemampuan

MVP memulai dari tiga template:

- Catching Game.
- Maze Game.
- Space Shooter.

Setiap template harus memiliki daftar kemampuan yang disepakati,
misalnya jenis objek, kontrol, aturan permainan, kondisi menang/kalah,
skor, dan interaksi yang benar-benar dapat dipetakan ke blok Scratch.
Daftar ini bukan asumsi bebas Backend Engineer; pengembang Block Mapper
harus mengonfirmasi dukungannya.

### 9.4 Larangan keamanan output

- Dilarang menggunakan `eval`, `Function`, `exec`, atau mekanisme
  sejenis untuk menjalankan output AI.
- Dilarang menerima JavaScript arbitrer sebagai definisi game.
- Dilarang mempercayai opcode/nama blok yang tidak ada di allowlist.
- Batasi jumlah objek, aturan, blok, dan panjang teks.
- Jangan menerapkan output yang gagal validasi.
- Jangan menimpa proyek aktif ketika generasi gagal.
- Jangan mengubah output AI menjadi perintah sistem atau shell.
- Simpan fixture valid dan invalid untuk regression test.

### 9.5 Versi schema

- Setiap output memiliki `schemaVersion`.
- Perubahan schema dicatat di Decision Log.
- FE dan Block Mapper harus menyatakan versi yang kompatibel.
- Versi yang tidak didukung ditolak secara aman.
- Perubahan breaking harus melalui review dan versioning yang
  disetujui.

## 10. Keamanan, Privasi, dan Reliability

### 10.1 Keamanan API

- API key hanya berada di environment backend.
- Validasi semua input client.
- Batasi ukuran body, panjang prompt, dan jumlah request.
- Atur CORS hanya untuk origin yang disetujui pada environment
  terkait.
- Jangan menampilkan stack trace kepada client.
- Jangan mencatat token, secret, header sensitif, atau nilai
  environment.
- Gunakan HTTPS ketika deployment publik.
- Lakukan dependency audit dan secret scan.
- Jangan menambahkan autentikasi buatan sendiri tanpa kebutuhan dan
  persetujuan.

### 10.2 Privasi

- MVP tidak membutuhkan akun pengguna.
- Jangan mengumpulkan identitas atau data pribadi yang tidak
  diperlukan.
- Beri tahu pengguna bahwa prompt dikirim ke provider AI eksternal.
- Jangan menyatakan proses sepenuhnya offline; Gemini/Groq memerlukan
  koneksi internet.
- Jangan mengirim isi proyek yang tidak dibutuhkan untuk generasi.
- Tetapkan retensi log sebelum deployment publik.
- Jangan menyimpan prompt lengkap secara default jika tidak
  dibutuhkan.

### 10.3 Reliability

- Timeout provider dan timeout total request harus ditentukan.
- Retry dibatasi dan tidak boleh membentuk loop.
- Error provider dinormalisasi.
- Fallback hanya sesuai kebijakan.
- Health endpoint tidak memanggil AI.
- Server menangani shutdown secara wajar.
- Request ID dipakai untuk menelusuri satu request.
- Kegagalan generasi tidak boleh merusak atau menimpa proyek lokal
  pengguna.

## 11. Logging dan Observability

### 11.1 Data log minimum

- Timestamp.
- Request ID.
- Endpoint dan method.
- Durasi request.
- Status akhir.
- Provider yang digunakan.
- Apakah fallback terjadi.
- Kategori error.
- Informasi ukuran request/response secara agregat jika diperlukan.

### 11.2 Data yang dilarang dicatat

- API key, token, dan secret.
- Header otorisasi.
- Isi environment.
- Prompt lengkap secara default.
- Data pribadi yang tidak diperlukan.
- Respons provider mentah tanpa redaksi, kebutuhan, dan kebijakan
  retensi yang jelas.

### 11.3 Metrik minimum

- Jumlah request berhasil/gagal.
- Latensi backend.
- Latensi per provider.
- Jumlah timeout dan rate limit.
- Jumlah fallback.
- Jumlah output gagal validasi.
- Perkiraan token jika provider menyediakannya dan aman dicatat.

MVP tidak harus memakai platform monitoring eksternal. Pilih
observability minimum yang proporsional dengan skala lokal/development.

## 12. Tahapan Pengerjaan Backend

Setiap tahap memiliki tujuan, pekerjaan, deliverable, dependency, dan
acceptance criteria. Status tahap tidak otomatis berubah menjadi boleh
dikerjakan hanya karena tercantum dalam dokumen.

### BE-00 --- Analisis, Audit, dan Persetujuan Desain

**Tujuan:** mengunci kebutuhan, batas sistem, kontrak, dan desain
sebelum coding.

**Pekerjaan:**

- Membaca seluruh aturan relevan pada `Rules/`.
- Membaca Implementation Plan utama dan backend.
- Memulai audit read-only dari repository utama Ardena Playground:
  `https://github.com/useripx/scratch_ardena.git`.
- Memeriksa repository upstream/referensi Scratch Editor:
  `https://github.com/scratchfoundation/scratch-editor`.
- Memetakan bagaimana Scratch Editor, GUI, VM, Blocks, dan Renderer
  direferensikan atau diintegrasikan dalam repository utama.
- Menentukan opsi lokasi backend berdasarkan struktur aktual
  repository utama; tidak mengasumsikan lokasi atau membuat folder.
- Memastikan toolchain Scratch tetap memakai toolchain resminya.
- Menetapkan batas tanggung jawab FE, BE, provider, dan Block Mapper.
- Menyepakati endpoint, request/response, error code, status HTTP, dan
  schema version.
- Menetapkan daftar template dan capability allowlist bersama Block
  Mapper.
- Menetapkan model/provider ID setelah verifikasi.
- Menetapkan timeout, retry, ukuran request, batas prompt, dan batas
  output.
- Membuat diagram arsitektur dan alur data.
- Menyusun risk register dan daftar keputusan terbuka.

**Deliverable:**

- `Docs/backend/Backend_Architecture.md`
- `Docs/backend/API_Contract.md`
- `Docs/backend/AI_Output_Schema.md`
- `Docs/backend/Provider_Strategy.md`
- `Docs/backend/Backend_Risk_Register.md`
- Pembaruan `Docs/Decision_Log.md` dan `Docs/Task_Status.md`

**Acceptance criteria:**

- Tanggung jawab setiap komponen jelas.
- Repository utama `scratch_ardena` telah diaudit secara read-only
  atau hambatan aksesnya telah didokumentasikan.
- Peran repository utama dan upstream Scratch Editor tidak tertukar.
- Cara Scratch Editor/engine direferensikan di repository utama
  telah dipetakan berdasarkan bukti.
- Lokasi backend dan cara menjalankan dua proses dev dipahami.
- API dan schema direview FE serta Block Mapper.
- Provider, fallback, batas request, dan keamanan disepakati.
- Tidak ada keputusan kritis yang masih diasumsikan.
- Pemilik proyek memberi approval untuk desain BE-00.

**Larangan:** tidak ada coding, instalasi dependensi, atau pemanggilan
provider berbayar pada tahap analisis ini kecuali ada persetujuan
terpisah yang eksplisit.

### BE-01 --- Fondasi Service Node.js

**Dependency:** BE-00 disetujui.

**Tujuan:** menyiapkan service minimal yang dapat dijalankan dan diuji.

**Pekerjaan:**

- Membuat lokasi backend sesuai keputusan audit.
- Memilih versi Node.js LTS yang kompatibel.
- Inisialisasi TypeScript dan Express.
- Menyiapkan script development, build, start, dan test.
- Menyiapkan konfigurasi environment dan validasi startup.
- Menyiapkan `.gitignore` dan `.env.example`.
- Menyiapkan middleware request ID dan error handler.
- Menyiapkan health endpoint.
- Menyiapkan CORS sesuai origin development yang disetujui.
- Menyiapkan logging dasar.
- Menulis README cara menjalankan backend.

**Deliverable:** backend skeleton, `package.json`, lockfile,
`tsconfig.json`, `.env.example`, README, Environment Report, Baseline
Test Report.

**Acceptance criteria:**

- Backend berjalan lokal sesuai README.
- Build TypeScript berhasil.
- Health endpoint berfungsi tanpa memanggil provider.
- Konfigurasi wajib divalidasi saat startup.
- Tidak ada secret dalam repository.
- Test dasar dapat dijalankan.
- Tidak ada perubahan pada toolchain Scratch tanpa izin.

### BE-02 --- API Layer dan Validation Request

**Dependency:** BE-01 disetujui.

**Tujuan:** membangun lapisan HTTP sesuai kontrak final.

**Pekerjaan:**

- Finalisasi dan implementasi OpenAPI yang telah disetujui.
- Membuat route dan controller endpoint MVP.
- Mengimplementasikan request validation.
- Mengimplementasikan batas ukuran body dan panjang prompt.
- Mengimplementasikan error response konsisten.
- Menambahkan capability metadata jika kontrak final mengharuskannya.
- Menambahkan unit dan contract test.
- Memastikan request invalid tidak mencapai provider.

**Acceptance criteria:**

- Endpoint sesuai OpenAPI.
- Request valid diterima.
- Request invalid ditolak dengan status dan error yang benar.
- Ukuran request dibatasi.
- Error tidak membocorkan informasi internal.
- Contract test lulus.

### BE-03 --- Gemini Adapter

**Dependency:** BE-02 disetujui; konfigurasi key tersedia secara aman
dan penggunaan API telah disetujui.

**Tujuan:** mengintegrasikan provider utama secara terisolasi.

**Pekerjaan:**

- Memverifikasi dokumentasi, SDK, model ID, dan dukungan structured
  output yang tersedia.
- Menetapkan interface provider.
- Mengimplementasikan adapter Gemini.
- Mengatur timeout, batas output, dan parameter generasi.
- Menormalisasi error.
- Memisahkan parsing dari adapter.
- Membuat mock test untuk menghindari pemanggilan API berbayar pada
  seluruh test.
- Menyiapkan smoke test provider yang dijalankan secara terkontrol.

**Acceptance criteria:**

- Secret aman dan tidak terekspos.
- Adapter sesuai interface internal.
- Timeout dan error teruji.
- Respons tidak langsung diteruskan ke frontend.
- Test mock lulus.
- Bukti smoke test tersedia bila pemanggilan provider disetujui.

### BE-04 --- Groq Adapter dan Provider Manager

**Dependency:** BE-03 disetujui.

**Tujuan:** menyediakan fallback yang terkendali.

**Pekerjaan:**

- Memverifikasi SDK/model Groq saat implementasi.
- Mengimplementasikan adapter Groq.
- Menyamakan interface adapter dengan Gemini.
- Mengimplementasikan Provider Manager.
- Mengimplementasikan retry/fallback policy.
- Memastikan tidak ada retry berlapis.
- Mencatat alasan fallback secara aman.
- Menguji seluruh kategori error provider.

**Acceptance criteria:**

- Gemini tetap provider utama.
- Groq hanya digunakan sesuai fallback policy.
- Request normal tidak memanggil kedua provider paralel.
- Retry memiliki batas dan timeout total.
- Kegagalan dua provider menghasilkan error aman.
- Secret tidak muncul di log.

### BE-05 --- Generate Game Use Case dan Output Validation

**Dependency:** BE-02, BE-03, BE-04 serta schema/capability dari Block
Mapper disetujui.

**Tujuan:** menghasilkan konfigurasi game terstruktur yang kompatibel
dengan generator.

**Pekerjaan:**

- Menyusun prompt template yang terversi dan direview.
- Mengimplementasikan use case generate game.
- Mengimplementasikan parser output provider.
- Mengimplementasikan schema validator.
- Mengimplementasikan allowlist template, fitur, dan opcode yang
  disepakati.
- Membatasi jumlah objek, aturan, teks, dan parameter.
- Menangani output malformed atau tidak sesuai schema.
- Menyiapkan fixture untuk Catching Game, Maze Game, dan Space
  Shooter.
- Berkoordinasi dengan Block Mapper untuk uji kompatibilitas.
- Memastikan tidak ada kode bebas yang dieksekusi.

**Acceptance criteria:**

- Output valid sesuai schema.
- Fitur tidak didukung ditolak atau ditangani sesuai kebijakan.
- Hasil dapat diproses Block Mapper.
- Output invalid tidak diterapkan.
- Kegagalan generasi tidak merusak proyek pengguna.
- Regression fixture tersedia.

### BE-06 --- Hardening, Integrasi, dan QA

**Dependency:** BE-05 disetujui.

**Tujuan:** memverifikasi backend dalam integrasi aplikasi.

**Pekerjaan:**

- Menjalankan unit, integration, contract, dan failure test.
- Melakukan contract test bersama FE dan Block Mapper.
- Memverifikasi CORS dan environment.
- Memverifikasi batas request dan rate limiting sesuai target.
- Memverifikasi logging dan redaksi.
- Memverifikasi timeout, retry, dan fallback.
- Menguji provider gagal dan output AI tidak valid.
- Memeriksa dependency, lisensi, dan secret exposure.
- Memeriksa regresi endpoint.
- Memperbarui dokumentasi berdasarkan implementasi nyata.

**Acceptance criteria:**

- FE dapat memakai API sesuai kontrak.
- State loading, sukses, dan error dapat ditangani FE.
- Block Mapper menerima schema yang disepakati.
- Tidak ada secret terekspos.
- Skenario utama dan kegagalan teruji.
- Risiko tersisa terdokumentasi dan diterima reviewer.

### BE-07 --- Dokumentasi, Operasional, dan Serah Terima

**Dependency:** BE-06 disetujui.

**Tujuan:** menyerahkan backend yang dapat dijalankan, diuji, dan
dipelihara.

**Pekerjaan:**

- Melengkapi README.
- Melengkapi OpenAPI dan schema.
- Mendokumentasikan environment variables tanpa nilai secret.
- Mendokumentasikan cara menjalankan backend dan test.
- Mendokumentasikan provider/fallback policy.
- Mendokumentasikan error code dan troubleshooting.
- Membuat Test Report dan Handover.
- Mencatat keterbatasan, known issues, dan pekerjaan lanjutan.
- Melakukan review final bersama pemilik proyek.

**Deliverable:**

- `Backend_Handover.md`
- `Backend_Test_Report.md`
- `Backend_Operations_Guide.md`
- `Known_Issues.md`
- OpenAPI dan schema final
- Daftar file/perubahan dan bukti test

**Acceptance criteria:**

- Pengembang lain dapat menjalankan service dari dokumentasi.
- Konfigurasi dijelaskan tanpa membocorkan secret.
- Test dapat direproduksi.
- Tidak ada blocker tersembunyi.
- Pemilik proyek memberikan final approval.

## 13. Strategi Pengujian

### 13.1 Unit test

Mencakup request validator, schema validator, parser, error mapper,
Provider Manager, retry/fallback policy, environment config, dan
generate-game use case.

### 13.2 Integration test

Mencakup HTTP route ke controller/use case, use case ke mock provider,
Provider Manager ke adapter mock, validasi output sampai response API,
request ID, dan error handling.

### 13.3 Contract test

Mencakup kesesuaian request/response dengan OpenAPI, error format,
schema version, enum, field wajib, capability, dan kesepakatan FE/Block
Mapper.

### 13.4 Failure test minimum

- Gemini timeout.
- Gemini rate limit.
- Gemini server error.
- Gemini key invalid.
- Groq timeout.
- Kedua provider tidak tersedia.
- Respons provider bukan JSON.
- JSON valid tetapi schema salah.
- Prompt kosong/terlalu panjang.
- Template tidak dikenal.
- Fitur game tidak didukung.
- Ukuran request melebihi batas.
- Client memutus koneksi.
- Environment variable wajib tidak tersedia.
- Output berisi field/opcode yang tidak diizinkan.

### 13.5 Aturan bukti test

Setiap laporan test mencantumkan:

- Tanggal dan environment.
- Commit/versi yang diuji.
- Perintah yang dijalankan.
- Hasil PASS/FAIL/BLOCKED/NOT RUN.
- Ringkasan log atau screenshot yang relevan.
- Bug yang ditemukan.
- Risiko yang belum selesai.

Jangan menyatakan PASS jika test tidak benar-benar dijalankan. Jangan
menyembunyikan test yang gagal atau menghapus test untuk membuat build
tampak berhasil.

## 14. Pedoman Kerja Backend Engineer dan Antigravity

### 14.1 Kewenangan

Engineer/Agent boleh membaca kode dan dokumen, menganalisis, mengusulkan
desain, membuat rencana, mengimplementasikan scope yang disetujui,
menjalankan test yang diizinkan, dan melaporkan bukti.

Engineer/Agent tidak boleh mengubah scope, mengganti stack, menambah
layanan, mengubah file di luar scope, melakukan deployment, menggunakan
API berbayar, atau melanjutkan tahap tanpa approval yang sesuai.

### 14.2 Protokol wajib setiap task

1. Baca aturan relevan pada `Rules/`.
2. Baca Implementation Plan utama dan backend.
3. Periksa Task Status dan approval terakhir.
4. Periksa artefak `Template/UI/` jika pekerjaan menyentuh perilaku
   UI/API.
5. Periksa kontrak API dan schema yang telah disetujui.
6. Nyatakan pemahaman, scope, asumsi, risiko, dan file yang mungkin
   terdampak.
7. Susun rencana langkah kerja dan acceptance criteria.
8. Tunggu approval jika belum ada.
9. Implementasikan hanya scope yang disetujui.
10. Jalankan test yang relevan dan catat perintah serta hasilnya.
11. Tinjau diff dan pastikan tidak ada perubahan tidak terkait.
12. Perbarui dokumentasi, Task Status, dan Decision Log jika diperlukan.
13. Laporkan hasil dan tunggu reviewer/pemilik proyek.

Jika instruksi task bertentangan dengan Rules atau dokumen induk, agent
harus berhenti dan meminta klarifikasi.

### 14.3 Format laporan agent

```text
TASK ID:
Tahap:
Status: PLANNED / IN PROGRESS / BLOCKED / REVIEW / DONE
Approval reference:

1. Ringkasan pekerjaan
2. Scope yang disetujui
3. Aturan dan dokumen yang dibaca
4. File yang dibuat/diubah
5. Alasan perubahan
6. Perintah yang dijalankan
7. Hasil test: PASS / FAIL / BLOCKED / NOT RUN
8. Bukti/log
9. Risiko dan keterbatasan
10. Keputusan yang dibutuhkan
11. Rekomendasi langkah berikutnya
```

Status `NOT RUN` bukan PASS. Status `BLOCKED` harus menjelaskan penyebab
dan keputusan yang dibutuhkan. Agent tidak boleh mengubah status menjadi
DONE tanpa bukti dan review.

## 15. Kolaborasi Antarperan

  Aktivitas                    BE   FE   Block Mapper   QA   Pemilik proyek

---

  Audit lokasi dan toolchain   R    C    C              C    A
  API contract                 R    C    C              C    A
  Output schema                R    C    C/R            C    A
  Provider integration         R    I    I              C    A
  UI loading/error mapping     C    R    I              C    A
  Block capability allowlist   C    C    R              C    A
  Backend testing              R    C    C              R    A
  Final acceptance             C    C    C              R    A

Keterangan: R = Responsible, A = Accountable/approval, C = Consulted, I
= Informed. Pemilik proyek tetap pemegang keputusan akhir.

## 16. Dokumentasi dan Status Pekerjaan

Dokumen kerja backend yang disarankan:

```text
Docs/
├── Implementation_Plan.md
├── Implementation_Plan_Backend.md
├── Task_Status.md
├── Decision_Log.md
└── backend/
    ├── Backend_Architecture.md
    ├── API_Contract.md
    ├── AI_Output_Schema.md
    ├── Provider_Strategy.md
    ├── Backend_Risk_Register.md
    ├── Backend_Test_Report.md
    ├── Backend_Operations_Guide.md
    ├── Backend_Handover.md
    └── Known_Issues.md
```

Lokasi dan nama final mengikuti aturan dokumentasi proyek. Jangan
membuat dokumen duplikat atau mengubah dokumen induk tanpa scope dan
approval.

Setiap task pada `Task_Status.md` minimal memiliki ID, tahap, deskripsi,
PIC, dependency, status, approval reference, deliverable, acceptance
criteria, bukti, dan catatan blocker.

Setiap keputusan penting pada `Decision_Log.md` mencatat ID, tanggal,
konteks, opsi, keputusan, alasan, dampak, pihak yang menyetujui, dan
dokumen terdampak.

## 17. Risk Register Awal

---

  Risiko                  Dampak                  Mitigasi

---

  Model/provider berubah  Generasi gagal          Verifikasi model saat
  atau tidak tersedia                             implementasi, adapter
                                                  terisolasi, fallback
                                                  terukur.

  Rate limit/kuota habis  Layanan tidak tersedia  Timeout, retry
                                                  terbatas, error aman,
                                                  pemantauan penggunaan.

  Output AI tidak sesuai  Block Mapper gagal      Parser, schema
  schema                                          validation, allowlist,
                                                  fixture regression.

  Output AI berisi        Risiko keamanan         Tidak mengeksekusi
  instruksi/kode                                  output, strict schema,
  berbahaya                                       allowlist.

  Kontrak FE-BE berbeda   Integrasi gagal         OpenAPI tunggal,
                                                  contract test, review
                                                  bersama.

  Retry berlebihan        Biaya/latensi meningkat Batas retry dan timeout
                                                  total.

  Secret masuk            Kebocoran kredensial    Environment, redaksi,
  repository/log                                  secret scan, rotasi
                                                  key.

  Perubahan toolchain     Editor rusak            Audit awal, jangan
  Scratch                                         mengganti toolchain
                                                  resmi.

  Scope bertambah tanpa   Waktu dan kompleksitas  Approval gate dan
  kontrol                 meningkat               change request.

Test tidak mewakili     Bug lolos               Unit, integration,
  kondisi nyata                                   contract, failure, dan
                                                  smoke test terkontrol.
------------------------------------------------------------------------

## 18. Approval Gate dan Change Control

Setiap tahap melewati empat checkpoint:

1. **Planning Approval** --- scope, rencana, dependency, risiko, dan
   acceptance criteria disetujui.
2. **Implementation Review** --- perubahan kode diperiksa terhadap
   scope.
3. **Testing Verification** --- bukti pengujian diperiksa.
4. **Final Approval** --- pemilik proyek menerima hasil tahap.

Persetujuan rencana tidak otomatis memberikan izin implementasi jika
approval implementasi belum diberikan. Persetujuan satu tahap tidak
otomatis mengizinkan tahap berikutnya.

Perubahan scope harus diajukan dengan:

- Alasan perubahan.
- Manfaat dan risiko.
- Dampak pada arsitektur/API/schema.
- File dan modul terdampak.
- Dampak waktu/dependency.
- Rencana pengujian.
- Keputusan pemilik proyek.

### 18.1 Formulir persetujuan tahap

```text
Nama tahap:
Tujuan:
Ruang lingkup:
Di luar ruang lingkup:
Deliverable:
Dependency:
Acceptance criteria:
Risiko:
File/area yang boleh diubah:
File/area yang dilarang diubah:
Reviewer:
Status approval:
Tanggal:
Catatan:
```

## 19. Kriteria Selesai Backend MVP

- [ ]  Backend berjalan sesuai README.
- [ ]  Node.js LTS + TypeScript + Express digunakan sesuai keputusan.
- [ ]  Tidak ada ketergantungan Laragon/Apache/PHP/MySQL untuk backend
  MVP.
- [ ]  Endpoint yang disetujui berfungsi.
- [ ]  OpenAPI, schema, dan implementasi sinkron.
- [ ]  Request validation dan error handling berfungsi.
- [ ]  Gemini adapter berfungsi.
- [ ]  Groq fallback berfungsi sesuai kebijakan.
- [ ]  Retry dan timeout dibatasi.
- [ ]  Output AI divalidasi terhadap schema dan allowlist.
- [ ]  Tidak ada eksekusi kode arbitrer dari output AI.
- [ ]  API key tidak terekspos.
- [ ]  Logging aman dan dapat ditelusuri.
- [ ]  Unit, integration, contract, dan failure test tersedia serta
  hasilnya tercatat.
- [ ]  Integrasi FE dan Block Mapper diverifikasi.
- [ ]  Dokumentasi operasi dan serah terima lengkap.
- [ ]  Risiko dan known issues dinyatakan.
- [ ]  Tidak ada blocker tersembunyi.
- [ ]  Pemilik proyek memberikan final approval.

## 20. Status Awal dan Pernyataan Batas Dokumen

---

  Item                                Status

---

  Stack Node.js LTS + TypeScript +    Keputusan disetujui
  Express tanpa Laragon

  Modular monolith                    Baseline arsitektur

  Gemini utama / Groq fallback        Keputusan produk/teknis

  Database server MVP                 Tidak digunakan

  Repository utama proyek             URL ditetapkan:
                                      https://github.com/useripx/
                                      scratch_ardena.git

  Upstream/referensi Scratch Editor   URL ditetapkan:
                                      https://github.com/scratchfoundation/
                                      scratch-editor

  Kondisi aktual repository           Belum diverifikasi melalui audit
                                      read-only

  Lokasi backend di repository        Menunggu audit dan persetujuan
                                      BE-00

  API contract                        Baseline; perlu finalisasi bersama
                                      FE dan Block Mapper

  AI output schema                    Perlu finalisasi bersama Block
                                      Mapper

  Model ID dan SDK provider           Diverifikasi saat implementasi

  Struktur direktori                  Konseptual; menunggu audit

  Rules/ dan Template/                Wajib menjadi acuan; keberadaan
                                      aktual harus diverifikasi

  Coding backend                      Belum dimulai

  Integrasi provider                  Belum dimulai

  Testing implementasi                Belum dimulai

Approval untuk memulai BE-00        Belum diberikan melalui dokumen ini
-----------------------------------------------------------------------

**Pernyataan akhir:** v1.4 adalah revisi terkontrol dari rencana backend
v1.3. Revisi ini menetapkan URL repository utama Ardena Playground dan
repository upstream/referensi Scratch Editor, serta memperjelas aturan
audit read-only dan pemisahan fungsi keduanya. Revisi ini tidak mengubah
keputusan stack backend yang telah disepakati. Dokumen ini tidak mengklaim bahwa
backend telah dibuat, diuji, atau terintegrasi. Dokumen ini juga tidak
memberikan izin otomatis untuk coding, instalasi dependensi, pemanggilan
API berbayar, perubahan repository, deployment, atau memulai tahap
berikutnya. Seluruh tindakan harus mengikuti Rules, approval gate, dan
keputusan pemilik proyek.

---

**Akhir dokumen --- Implementation Plan Backend Ardena Playground v1.4


# Implementation Plan Backend --- Ardena Playground

**Versi:** 1.0
**Tanggal:** 5 November 2026
**Status:** Draft persiapan --- menunggu review dan persetujuan pemilik
proyek
**Dokumen induk:** `Implementation_Plan_Ardena_Playground_v1.4.md`
**Area:** Backend Service, AI Provider Integration, API Contract, dan
Backend Quality
**Target pelaksana:** Backend Engineer, AI Agent Antigravity, dan
pengembang pendukung

---

## 1. Tujuan Dokumen

Dokumen ini menjadi pedoman teknis dan tata kelola untuk merencanakan,
mengimplementasikan, menguji, dan menyerahkan komponen backend Ardena
Playground.

Dokumen ini dibuat agar seluruh pengembang---baik manusia maupun AI
coding agent---bekerja berdasarkan arsitektur dan kontrak yang sama.
Setiap keputusan teknis harus dapat ditelusuri, setiap perubahan harus
memiliki alasan, dan setiap klaim selesai harus disertai bukti.

Dokumen ini merupakan turunan dari Implementation Plan utama v1.4. Jika
terdapat perbedaan, keputusan pada dokumen induk dan keputusan terbaru
yang telah disetujui pemilik proyek menjadi acuan. Perubahan terhadap
keputusan induk harus dicatat dalam Decision Log dan memperoleh
persetujuan.

### 1.1 Sasaran backend

1. Menyediakan API backend yang menjadi perantara aman antara frontend
   dan layanan AI.
2. Mengelola integrasi Gemini sebagai provider utama dan Groq sebagai
   provider cadangan.
3. Menghasilkan respons AI dalam format data terstruktur yang dapat
   divalidasi.
4. Mencegah API key, secret, dan konfigurasi sensitif terekspos ke
   browser atau repository.
5. Menangani timeout, retry, rate limit, error provider, dan fallback
   secara terukur.
6. Menyediakan kontrak API yang stabil untuk frontend dan modul
   generator Scratch.
7. Menyediakan logging, pengujian, dokumentasi, serta bukti operasional
   yang dapat diperiksa.

### 1.2 Bukan tujuan backend MVP

- Menyimpan akun pengguna atau menyediakan autentikasi cloud.
- Menyimpan proyek pengguna pada database server.
- Menjalankan kode JavaScript bebas yang dihasilkan AI.
- Menghasilkan seluruh struktur proyek Scratch tanpa batasan.
- Menjalankan Gemini dan Groq secara paralel untuk setiap permintaan
  normal.
- Membangun microservices, Kubernetes, message broker, atau
  infrastruktur berlebihan.
- Menyediakan marketplace, multiplayer, atau kolaborasi real-time.

---

## 2. Konteks Produk dan Batas Tanggung Jawab

Ardena Playground adalah aplikasi web untuk membantu pengguna membuat
game berbasis Scratch melalui instruksi bahasa alami. Backend menerima
permintaan dari frontend, meneruskan instruksi yang telah divalidasi ke
provider AI, memeriksa hasilnya, lalu mengembalikan konfigurasi
terstruktur kepada frontend.

Backend **tidak** bertugas menggantikan Scratch GUI, Scratch Blocks,
Scratch VM, atau Scratch Renderer. Pemetaan konfigurasi menjadi blok
Scratch dan penerapan hasil ke workspace merupakan tanggung jawab modul
generator/integrasi Scratch yang berkoordinasi dengan frontend.

### 2.1 Batas sistem

---

  Komponen                Tanggung jawab utama    Pemilik teknis

---

  Frontend / Scratch GUI  UI, prompt input,       Frontend Engineer
                          review hasil,
                          workspace, preview

  Backend API             Validasi request,       Backend Engineer
                          orkestrasi, respons API

  Gemini Adapter          Komunikasi dengan       Backend Engineer
                          Gemini

  Groq Adapter            Komunikasi dengan Groq  Backend Engineer

  Provider Manager        Pemilihan provider,     Backend Engineer
                          retry, fallback

  AI Output Validator     Validasi struktur dan   Backend Engineer
                          batas data

  Game Generator / Block  Mengubah konfigurasi    Pengembang modul
  Mapper                  menjadi struktur        generator
                          Scratch yang didukung

  Scratch VM / GUI        Menjalankan dan         Scratch integration /
                          mengedit proyek Scratch Frontend Engineer

QA                      Verifikasi API,         QA / Reviewer
                          integrasi, keamanan,
                          dan regresi
-----------------------------------------------------------------------------------

Batas ini merupakan pembagian tanggung jawab awal. Penyesuaian setelah
audit repository harus dicatat dan disetujui.

### 2.2 Prinsip komunikasi antarkomponen

- Frontend hanya berkomunikasi dengan backend melalui kontrak API yang
  terdokumentasi.
- Frontend tidak boleh menyimpan API key Gemini atau Groq.
- Backend mengembalikan data, bukan source code yang langsung
  dieksekusi.
- Frontend menampilkan ringkasan dan meminta konfirmasi sebelum hasil
  diterapkan ke proyek aktif.
- Backend tidak mengakses atau mengubah IndexedDB milik browser.
- Backend tidak menganggap respons provider AI sebagai data tepercaya.

---

## 3. Keputusan Teknologi Backend

---

  Area                    Keputusan awal          Ketentuan

---

  Runtime                 Node.js                 Versi ditetapkan
                                                  setelah pemeriksaan
                                                  kompatibilitas

  Bahasa                  TypeScript              Strict mode dianjurkan

  Framework HTTP          Express                 Gunakan middleware yang
                                                  terukur

  Validasi                JSON Schema atau        Satu skema menjadi
                          validator setara        kontrak resmi

  AI utama                Gemini                  Melalui adapter

  AI fallback             Groq                    Dipakai sesuai aturan
                                                  fallback

  Konfigurasi             Environment variables   Secret tidak masuk
                                                  source control

  Logging                 Logger terstruktur      Redaksi secret dan
                                                  prompt sensitif

  Testing                 Test runner sesuai      Unit, integration,
                          keputusan repository    contract
                          backend

  Dokumentasi API         OpenAPI                 Kontrak harus sinkron
                                                  dengan implementasi

  Database server         Tidak digunakan pada    Tidak menambah
                          MVP                     MySQL/PostgreSQL tanpa
                                                  persetujuan

Deployment              Lokal/development       Target hosting
                          terlebih dahulu         ditentukan kemudian
---------------------------------------------------------------------

### 3.1 Prinsip pemilihan dependensi

1. Pilih dependensi minimum yang memenuhi kebutuhan.
2. Periksa versi, lisensi, aktivitas pemeliharaan, dan kompatibilitas
   sebelum menambahkan paket.
3. Hindari dependensi yang menduplikasi fungsi framework atau runtime.
4. Kunci versi melalui lockfile.
5. Jangan melakukan pembaruan massal tanpa alasan dan persetujuan.
6. Catat dependensi baru, tujuan, risiko, dan alternatifnya.

---

## 4. Arsitektur Backend yang Dituju

Backend menggunakan pendekatan **modular monolith**. Setiap modul
memiliki tanggung jawab jelas, tetapi MVP tetap dijalankan sebagai satu
layanan backend.

### 4.1 Alur permintaan

1. Pengguna menulis prompt pada frontend.
2. Frontend mengirim request ke endpoint backend.
3. Middleware memeriksa ukuran request, format, dan batas penggunaan.
4. Request validator memeriksa field dan aturan input.
5. Application service menjalankan use case pembuatan game.
6. Provider Manager memilih Gemini sebagai provider utama.
7. Adapter mengirim permintaan dengan timeout dan batas output.
8. Jika terjadi kegagalan yang memenuhi kebijakan fallback, Provider
   Manager mencoba Groq.
9. Respons provider diparsing dan divalidasi terhadap schema.
10. Backend mengembalikan konfigurasi terstruktur dan metadata yang
    aman.
11. Frontend menampilkan hasil untuk direview pengguna.
12. Modul generator frontend memetakan konfigurasi ke blok Scratch
    setelah validasi dan persetujuan pengguna.

### 4.2 Diagram alur konseptual

```text
Frontend (Scratch GUI + AI Panel)
             |
             v
       Backend API
             |
       Request Validation
             |
       Application Service
             |
       Provider Manager
          /       \
         v         v
      Gemini      Groq
       (utama)   (fallback)
          \       /
           v     v
       Output Parser
             |
       Schema Validator
             |
       Safe API Response
             |
             v
Frontend Review -> Block Mapper -> Scratch Workspace / VM
```

### 4.3 Prinsip arsitektur

- Pisahkan HTTP layer, application/use-case layer, provider adapter,
  domain/schema, dan infrastructure.
- Controller tidak boleh berisi seluruh logika provider.
- Provider adapter tidak boleh menentukan kebijakan bisnis fallback
  sendiri.
- Validasi dilakukan pada batas masuk dan keluar sistem.
- Error internal tidak boleh membocorkan stack trace atau secret
  kepada client.
- Jangan membuat abstraksi berlebihan sebelum terdapat kebutuhan
  nyata.

### 4.4 Struktur direktori konseptual

Struktur berikut adalah usulan awal dan wajib disesuaikan setelah
keputusan lokasi backend disetujui.

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── provider.config.ts
│   ├── routes/
│   │   └── game.routes.ts
│   ├── controllers/
│   │   └── game.controller.ts
│   ├── application/
│   │   └── use-cases/
│   │       └── generate-game.use-case.ts
│   ├── domain/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── errors/
│   ├── providers/
│   │   ├── provider.interface.ts
│   │   ├── provider.manager.ts
│   │   ├── gemini/
│   │   └── groq/
│   ├── validators/
│   ├── middleware/
│   ├── observability/
│   └── utils/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
├── openapi/
│   └── openapi.yaml
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

Jangan membuat seluruh direktori sekaligus sebelum struktur disetujui.
Buat hanya struktur yang diperlukan untuk tahap yang sedang dikerjakan.

---

## 5. Kontrak API Awal

Kontrak berikut merupakan rancangan awal untuk diselaraskan bersama
frontend. Kontrak belum dianggap final sampai FE dan BE menyetujuinya.

### 5.1 Endpoint MVP

---

  Method                  Endpoint                      Fungsi

---

  GET                     `/api/v1/health`              Memeriksa status
                                                        layanan backend

  POST                    `/api/v1/games/generate`      Meminta konfigurasi
                                                        game dari AI

GET                     `/api/v1/meta/capabilities`   Menampilkan kemampuan
                                                        generator yang didukung
-------------------------------------------------------------------------------

Endpoint status provider tidak boleh mengungkap secret, detail akun,
atau informasi internal yang tidak dibutuhkan pengguna.

### 5.2 Contoh request generate

```json
{
  "prompt": "Buat game menangkap koin dengan karakter yang bergerak ke kiri dan kanan.",
  "template": "catching-game",
  "language": "id",
  "schemaVersion": "1.0"
}
```

Field wajib, opsional, panjang maksimum, dan enum final harus ditetapkan
dalam OpenAPI dan schema validator.

### 5.3 Contoh respons sukses

```json
{
  "success": true,
  "data": {
    "schemaVersion": "1.0",
    "game": {
      "title": "Petualangan Koin",
      "genre": "catching-game",
      "description": "Tangkap koin yang jatuh untuk mendapatkan skor."
    },
    "objects": [],
    "rules": [],
    "controls": [],
    "supportedFeatures": []
  },
  "meta": {
    "requestId": "req_example",
    "provider": "primary",
    "fallbackUsed": false
  }
}
```

Contoh tersebut hanya ilustrasi bentuk respons. Field objek, aturan,
kontrol, dan fitur harus ditetapkan dalam schema resmi bersama
pengembang block mapper. Jangan menganggap contoh ini sebagai kontrak
final.

### 5.4 Format error

```json
{
  "success": false,
  "error": {
    "code": "AI_PROVIDER_UNAVAILABLE",
    "message": "Layanan AI sementara tidak tersedia.",
    "retryable": true
  },
  "meta": {
    "requestId": "req_example"
  }
}
```

Ketentuan: - Gunakan kode error stabil dan terdokumentasi. - Pesan untuk
pengguna harus aman dan mudah dipahami. - Detail teknis dicatat pada log
server yang telah disanitasi. - Jangan mengirim API key, prompt
internal, stack trace, atau detail infrastruktur.

### 5.5 Persyaratan kontrak FE-BE

- Field dan tipe data disepakati bersama.
- Versi schema dicantumkan.
- Format error konsisten.
- Timeout dan batas ukuran request terdokumentasi.
- Perubahan breaking harus menaikkan versi kontrak atau mengikuti
  kebijakan versioning yang disetujui.
- Contract test harus memeriksa kesesuaian implementasi dengan
  OpenAPI/schema.

---

## 6. Integrasi Provider AI

### 6.1 Gemini --- provider utama

Tanggung jawab adapter: - Membentuk request berdasarkan konfigurasi yang
disetujui. - Mengirim prompt sistem dan prompt pengguna dengan batasan
yang jelas. - Mengatur batas output dan parameter generasi. - Mengelola
timeout. - Memetakan error provider ke error internal yang konsisten. -
Mengembalikan hasil mentah ke lapisan parser, bukan langsung ke
frontend.

### 6.2 Groq --- provider fallback

Groq digunakan jika kegagalan Gemini memenuhi kebijakan fallback.
Adapter Groq harus memenuhi interface internal yang sama agar hasil
kedua provider dapat diproses oleh validator yang sama.

### 6.3 Interface provider

Konsep interface:

```ts
export interface AIProvider {
  readonly name: string;

  generate(
    input: GenerateGameInput
  ): Promise<ProviderGenerationResult>;
}
```

Nama tipe dan bentuk final harus mengikuti implementasi aktual. Jangan
menyalin contoh secara membabi buta.

### 6.4 Kebijakan fallback

Fallback bukan berarti setiap error harus langsung berpindah provider.

---

  Kondisi                             Tindakan awal

---

  Timeout Gemini                      Retry terbatas, lalu evaluasi
                                      fallback

  Gangguan jaringan sementara         Retry terbatas, lalu evaluasi
                                      fallback

  HTTP 429 / rate limit               Ikuti retry-after jika tersedia;
                                      fallback sesuai kebijakan

  HTTP 5xx provider                   Retry terbatas, lalu fallback

  API key tidak valid                 Hentikan percobaan berulang; tandai
                                      konfigurasi bermasalah

  Request tidak valid dari client     Jangan fallback; kembalikan 4xx

  Respons AI tidak sesuai schema      Satu perbaikan/ulang terkontrol
                                      bila disetujui; jika gagal, catat

Kedua provider gagal                Hentikan proses dan kembalikan
                                      error aman
------------------------------------------------

Aturan operasional: 1. Satu provider digunakan untuk satu permintaan
pada satu waktu. 2. Gemini dicoba terlebih dahulu. 3. Maksimal satu
retry per provider sebagai default awal, kecuali hasil pengujian dan
persetujuan menetapkan kebijakan lain. 4. Jangan melakukan retry untuk
kesalahan input client. 5. Hindari retry berlapis pada adapter, manager,
dan HTTP client secara bersamaan. 6. Catat provider yang dicoba,
kategori error, durasi, dan hasil fallback tanpa merekam secret. 7.
Jangan menjalankan Gemini dan Groq secara paralel pada jalur normal. 8.
Batas retry, timeout, dan retry-after harus dapat dikonfigurasi dengan
nilai aman.

### 6.5 Konfigurasi provider

Gunakan environment variables. Contoh nama variabel:

```env
NODE_ENV=development
PORT=3001

GEMINI_API_KEY=
GEMINI_MODEL=

GROQ_API_KEY=
GROQ_MODEL=

AI_REQUEST_TIMEOUT_MS=
AI_MAX_OUTPUT_TOKENS=
AI_MAX_RETRIES_PER_PROVIDER=
```

Ketentuan: - `.env` masuk `.gitignore`. - `.env.example` hanya berisi
nama variabel dan placeholder kosong. - Jangan pernah menaruh secret
pada source code, frontend, screenshot, laporan, atau commit. - Validasi
konfigurasi saat startup. - Jangan menampilkan nilai secret ketika
konfigurasi gagal. - Rotasi key jika pernah terekspos.

---

## 7. Kontrak Output AI dan Validasi

Output AI adalah **data tidak tepercaya**. Keberhasilan HTTP dari
provider tidak berarti hasilnya valid atau aman.

### 7.1 Lapisan validasi

1. Validasi format respons provider.
2. Ekstraksi konten terstruktur.
3. Parsing JSON secara aman.
4. Validasi JSON Schema.
5. Validasi enum, batas jumlah objek, panjang teks, dan nilai numerik.
6. Validasi fitur terhadap allowlist kemampuan generator.
7. Normalisasi data yang diperbolehkan.
8. Kembalikan hasil yang lolos validasi.

### 7.2 Aturan keamanan output

- Jangan menggunakan `eval`, `Function`, `exec`, atau mekanisme
  sejenis untuk menjalankan keluaran AI.
- Jangan menerima JavaScript arbitrer sebagai definisi game.
- Jangan mempercayai nama blok/opcode yang tidak ada pada allowlist.
- Batasi jumlah sprite, objek, aturan, blok, dan panjang teks sesuai
  kemampuan yang telah diuji.
- Tolak field yang tidak dikenal kecuali schema secara eksplisit
  mengizinkannya.
- Jangan menerapkan hasil yang gagal validasi.
- Jangan menimpa proyek aktif ketika proses generasi gagal.
- Simpan fixture respons valid dan tidak valid untuk regression test.

### 7.3 Versi schema

- Setiap kontrak output memiliki `schemaVersion`.
- Perubahan schema dicatat dalam Decision Log.
- Frontend dan block mapper harus menggunakan versi yang kompatibel.
- Respons dengan versi yang tidak didukung harus ditolak secara aman.

---

## 8. Keamanan, Privasi, dan Reliability

### 8.1 Keamanan dasar

- API key hanya berada pada environment backend.
- Batasi ukuran body request.
- Validasi semua input client.
- Terapkan rate limiting yang sesuai untuk deployment.
- Terapkan CORS berdasarkan origin yang diizinkan pada environment
  terkait.
- Gunakan HTTPS pada deployment publik.
- Jangan menampilkan stack trace kepada client.
- Jangan mencatat secret, token, atau header otorisasi.
- Hindari menyimpan prompt lengkap jika tidak diperlukan untuk
  debugging.
- Terapkan dependency audit dan secret scan.

### 8.2 Privasi pengguna

- MVP tidak membutuhkan akun pengguna.
- Jangan mengumpulkan identitas atau data pribadi yang tidak
  diperlukan.
- Berikan informasi bahwa prompt dapat dikirim ke provider AI
  eksternal.
- Jangan menjanjikan pemrosesan sepenuhnya offline karena integrasi
  Gemini/Groq membutuhkan koneksi internet.
- Hindari mengirim isi proyek atau dokumen lain ke provider jika tidak
  dibutuhkan.
- Tetapkan kebijakan retensi log sebelum deployment publik.

### 8.3 Reliability

- Timeout wajib ditentukan.
- Error provider dinormalisasi.
- Retry dibatasi dan tidak boleh menghasilkan loop.
- Fallback hanya mengikuti kebijakan.
- Health endpoint tidak boleh memicu biaya AI.
- Shutdown server harus menangani koneksi aktif secara wajar.
- Request ID digunakan untuk menelusuri satu permintaan di log.

---

## 9. Observability dan Logging

Log minimal yang dianjurkan: - Timestamp. - Request ID. - Nama
endpoint. - Durasi request. - Provider yang digunakan. - Apakah fallback
terjadi. - Kategori error. - Status akhir. - Ukuran request/response
secara agregat jika diperlukan.

Jangan mencatat: - API key atau token autentikasi. - Header sensitif. -
Secret environment. - Prompt lengkap secara default. - Data pribadi yang
tidak diperlukan. - Respons provider mentah tanpa kebijakan redaksi dan
retensi.

Metrik minimum: - Jumlah request berhasil/gagal. - Latensi backend. -
Latensi per provider. - Jumlah timeout dan rate limit. - Jumlah
fallback. - Jumlah respons gagal validasi. - Perkiraan penggunaan token
jika provider menyediakan data tersebut.

---

## 10. Tahapan Pengerjaan Backend

Setiap tahap berikut harus mengikuti approval gate. Tahap tidak otomatis
boleh dimulai hanya karena tercantum pada dokumen.

### Tahap BE-00 --- Analisis dan Persetujuan Desain Backend

**Tujuan:** menyepakati kebutuhan dan rancangan sebelum coding.

Pekerjaan: - \[ \] Pelajari Implementation Plan utama v1.4. - \[ \]
Pelajari hasil audit repository dan keputusan lokasi backend. - \[ \]
Tetapkan kebutuhan API bersama FE. - \[ \] Tetapkan kontrak JSON bersama
pengembang generator/block mapper. - \[ \] Review kebutuhan Gemini dan
Groq. - \[ \] Tetapkan batas timeout, retry, token, dan ukuran
request. - \[ \] Buat diagram arsitektur dan alur data. - \[ \] Buat
daftar risiko dan keputusan terbuka.

Output: - `Docs/backend/Backend_Architecture.md` -
`Docs/backend/API_Contract.md` - `Docs/backend/Provider_Strategy.md` -
`Docs/backend/Backend_Risk_Register.md`

Kriteria persetujuan: - Tanggung jawab FE, BE, dan generator jelas. -
Kontrak API dan output AI direview pihak terkait. - Tidak ada keputusan
kritis yang masih diasumsikan. - Pemilik proyek menyetujui rencana
backend.

**Larangan:** belum ada implementasi kode.

### Tahap BE-01 --- Persiapan Fondasi Backend

**Tujuan:** menyiapkan kerangka service minimal dan dapat dijalankan.

Pekerjaan: - \[ \] Buat lokasi backend sesuai keputusan repository. - \[
\] Inisialisasi Node.js dan TypeScript sesuai versi yang disetujui. - \[
\] Siapkan Express. - \[ \] Siapkan konfigurasi environment. - \[ \]
Siapkan error handler dan request ID. - \[ \] Siapkan health endpoint. -
\[ \] Siapkan script dev, build, dan test. - \[ \] Siapkan lint/format
bila disetujui. - \[ \] Buat README cara menjalankan service.

Output: - Backend skeleton. - `.env.example`. - `README.md`. -
`Environment_Report.md`. - `Baseline_Test_Report.md`.

Kriteria persetujuan: - Service dapat dijalankan secara lokal. - Health
endpoint berfungsi. - Build dan test dasar tercatat. - Secret tidak
berada di repository. - Tidak ada integrasi provider sebelum fondasi
disetujui.

### Tahap BE-02 --- API Contract dan Validation Layer

**Tujuan:** menyediakan API dan validasi request/response.

Pekerjaan: - \[ \] Finalisasi OpenAPI. - \[ \] Implementasikan endpoint
MVP yang disetujui. - \[ \] Implementasikan request validation. - \[ \]
Implementasikan format error konsisten. - \[ \] Implementasikan batas
ukuran request. - \[ \] Implementasikan capability metadata bila
diperlukan. - \[ \] Buat unit test dan contract test.

Kriteria persetujuan: - Request valid diterima. - Request invalid
ditolak dengan status dan error yang benar. - Format response sesuai
kontrak. - Tidak ada detail internal bocor. - FE dapat menguji integrasi
memakai kontrak yang sama.

### Tahap BE-03 --- Gemini Adapter

**Tujuan:** mengintegrasikan provider utama secara terisolasi.

Pekerjaan: - \[ \] Verifikasi SDK/API dan model yang benar-benar
tersedia. - \[ \] Implementasikan interface provider. - \[ \]
Implementasikan adapter Gemini. - \[ \] Terapkan timeout dan batas
output. - \[ \] Normalisasi error. - \[ \] Parsing respons provider. -
\[ \] Buat mock test agar test tidak selalu memanggil API berbayar.

Kriteria persetujuan: - Konfigurasi secret aman. - Request dan response
sesuai adapter contract. - Timeout dan error teruji. - Respons provider
tidak langsung dikirim tanpa validasi. - Bukti pengujian tersedia.

### Tahap BE-04 --- Groq Adapter dan Provider Manager

**Tujuan:** menyediakan fallback yang terkendali.

Pekerjaan: - \[ \] Implementasikan adapter Groq. - \[ \] Samakan
interface dengan Gemini. - \[ \] Implementasikan Provider Manager. - \[
\] Terapkan aturan retry dan fallback. - \[ \] Hindari retry berlapis. -
\[ \] Catat alasan fallback secara aman. - \[ \] Buat test untuk setiap
kategori kegagalan.

Kriteria persetujuan: - Gemini menjadi provider utama. - Groq hanya
digunakan sesuai kebijakan. - Tidak ada pemanggilan paralel pada jalur
normal. - Kegagalan kedua provider ditangani dengan aman. - Tidak ada
secret pada log.

### Tahap BE-05 --- AI Game Generation Use Case

**Tujuan:** menghasilkan konfigurasi game terstruktur yang kompatibel
dengan schema.

Pekerjaan: - \[ \] Finalisasi prompt template. - \[ \] Implementasikan
use case generate game. - \[ \] Implementasikan parser dan validator. -
\[ \] Implementasikan batas jumlah dan ukuran data. - \[ \]
Implementasikan penanganan output tidak valid. - \[ \] Siapkan fixture
untuk tiga template MVP: Catching Game, Maze Game, Space Shooter. - \[
\] Koordinasikan schema dengan block mapper. - \[ \] Pastikan output
tidak berisi kode bebas yang dieksekusi.

Kriteria persetujuan: - Output valid terhadap schema. - Output tidak
dikenal ditolak atau ditangani sesuai aturan. - Hanya fitur yang
didukung yang dapat lolos. - Kegagalan generasi tidak merusak proyek
pengguna. - Hasil dapat diproses oleh modul generator yang disepakati.

### Tahap BE-06 --- Hardening dan Integrasi FE

**Tujuan:** memastikan backend siap diintegrasikan dengan frontend.

Pekerjaan: - \[ \] Jalankan integration test. - \[ \] Jalankan contract
test bersama FE. - \[ \] Verifikasi CORS dan konfigurasi environment. -
\[ \] Verifikasi rate limiting dan batas request. - \[ \] Verifikasi
logging dan redaksi. - \[ \] Verifikasi timeout dan fallback. - \[ \]
Uji skenario provider gagal. - \[ \] Periksa dependency dan secret. - \[
\] Perbarui dokumentasi API.

Kriteria persetujuan: - FE dapat menggunakan API sesuai kontrak. - Error
dan loading dapat ditangani FE. - Tidak ada secret terekspos. - Skenario
utama dan kegagalan teruji. - Risiko tersisa terdokumentasi.

### Tahap BE-07 --- Dokumentasi dan Serah Terima Backend

**Tujuan:** menyerahkan backend yang dapat dijalankan dan dipelihara.

Pekerjaan: - \[ \] Lengkapi README. - \[ \] Lengkapi OpenAPI. - \[ \]
Dokumentasikan environment variables. - \[ \] Dokumentasikan cara
menjalankan test. - \[ \] Dokumentasikan kebijakan provider. - \[ \]
Dokumentasikan error code. - \[ \] Buat laporan pengujian. - \[ \] Buat
daftar keterbatasan dan pekerjaan lanjutan. - \[ \] Minta final
approval.

Output: - `Backend_Handover.md` - `Backend_Test_Report.md` -
`Backend_Operations_Guide.md` - `Known_Issues.md`

Kriteria persetujuan: - Pengembang lain dapat menjalankan service dari
dokumentasi. - Semua konfigurasi yang dibutuhkan dijelaskan tanpa
mengungkap secret. - Hasil test dapat direproduksi. - Tidak ada bug
blocker yang belum dinyatakan. - Pemilik proyek menyetujui serah terima.

---

## 11. Strategi Pengujian

### 11.1 Unit test

Mencakup: - Request validator. - Schema validator. - Parser. - Error
mapper. - Provider Manager. - Retry/fallback policy. - Use case generate
game.

### 11.2 Integration test

Mencakup: - HTTP route ke controller/use case. - Use case ke mock
provider. - Provider Manager ke adapter mock. - Validasi output sampai
respons API. - Error handling dan request ID.

### 11.3 Contract test

Mencakup: - Request sesuai OpenAPI. - Response sukses sesuai schema. -
Response error sesuai format. - Versi schema dikenali. - Field wajib dan
enum konsisten dengan FE dan block mapper.

### 11.4 Failure test

Skenario minimum: - Gemini timeout. - Gemini rate limit. - Gemini server
error. - Gemini key invalid. - Groq timeout. - Kedua provider tidak
tersedia. - Respons AI bukan JSON. - JSON valid tetapi schema salah. -
Prompt kosong atau terlalu panjang. - Fitur game tidak didukung. -
Request dibatalkan atau koneksi client terputus.

### 11.5 Aturan bukti pengujian

Setiap laporan test harus mencantumkan: - Tanggal dan lingkungan
pengujian. - Commit yang diuji. - Perintah yang dijalankan. - Hasil
PASS/FAIL. - Log atau screenshot yang relevan. - Bug yang ditemukan. -
Risiko yang belum diselesaikan.

Jangan menyatakan test PASS jika test tidak benar-benar dijalankan.

---

## 12. Pedoman Kerja AI Agent Antigravity

Antigravity dan AI coding agent lain diperlakukan sebagai pelaksana
teknis yang berada di bawah tata kelola proyek. Agent bukan pemilik
keputusan dan tidak memiliki kewenangan untuk menyetujui pekerjaannya
sendiri.

### 12.1 Peran agent

Agent boleh: - Membaca dokumen dan source code yang relevan. - Melakukan
analisis dan mengajukan rencana. - Mengusulkan arsitektur dan
alternatif. - Menulis kode setelah memperoleh approval yang sesuai. -
Menjalankan test yang diizinkan. - Menganalisis error dan mengusulkan
perbaikan. - Membuat laporan perubahan dan bukti test. - Menandai risiko
dan ketidakpastian.

Agent tidak boleh: - Memulai coding sebelum rencana dan tahap
disetujui. - Mengubah scope tanpa persetujuan. - Mengubah file di luar
cakupan tugas tanpa izin. - Mengganti stack atau menambah layanan
infrastruktur atas inisiatif sendiri. - Menghapus test untuk membuat
build tampak berhasil. - Mengarang hasil test atau menyatakan selesai
tanpa bukti. - Menaruh secret pada file, log, prompt, atau commit. -
Menyetujui hasil pekerjaannya sendiri. - Melanjutkan ke tahap berikutnya
tanpa final approval.

### 12.2 Protokol kerja agent

Untuk setiap tugas: 1. Baca dokumen induk dan dokumen backend terkait.
2. Periksa status task dan approval terbaru. 3. Nyatakan pemahaman,
ruang lingkup, asumsi, dan file yang diperkirakan terdampak. 4. Buat
rencana langkah kerja sebelum perubahan. 5. Tunggu approval jika tugas
belum disetujui. 6. Implementasikan hanya ruang lingkup yang disetujui.
7. Jalankan test yang relevan. 8. Tinjau diff dan pastikan tidak ada
perubahan tidak terkait. 9. Laporkan file yang dibuat/diubah, alasan,
test, hasil, dan risiko. 10. Tunggu reviewer/pemilik proyek melakukan
pemeriksaan.

### 12.3 Format laporan agent

Setiap tugas harus menghasilkan laporan dengan format:

```text
TASK ID:
Tahap:
Status:
Approval referensi:

1. Ringkasan pekerjaan
2. Ruang lingkup yang disetujui
3. File yang dibaca
4. File yang dibuat/diubah
5. Alasan setiap perubahan
6. Perintah yang dijalankan
7. Hasil test (PASS/FAIL/BLOCKED/NOT RUN)
8. Bukti/log
9. Risiko dan keterbatasan
10. Hal yang membutuhkan keputusan manusia
11. Rekomendasi langkah berikutnya
```

Status `NOT RUN` tidak boleh ditulis sebagai PASS. Status `BLOCKED`
harus disertai penyebab dan kebutuhan tindakan.

---

## 13. Kolaborasi Backend, Frontend, Generator, dan QA

### 13.1 Aturan kolaborasi

- Backend tidak boleh mengubah kontrak API secara sepihak setelah
  disetujui.
- Frontend tidak boleh mengasumsikan field respons yang belum ada pada
  schema.
- Generator tidak boleh menggunakan opcode atau fitur yang belum masuk
  allowlist.
- QA menguji berdasarkan acceptance criteria, bukan asumsi
  implementasi.
- Perubahan kontrak harus dikomunikasikan dan disetujui pihak
  terdampak.
- Setiap keputusan lintas bagian dicatat dalam Decision Log.

### 13.2 Matriks tanggung jawab awal

  Aktivitas              BE   FE   Generator   QA   Pemilik

---

  Desain API             R    C    C           C    A
  Provider adapter       R    I    I           C    A
  UI prompt dan review   C    R    C           C    A
  Output schema          R    C    R           C    A
  Block mapping          C    C    R           C    A
  Pengujian integrasi    R    R    R           R    A
  Persetujuan tahap      I    I    I           C    A

Keterangan: **R** = Responsible, **A** = Accountable, **C** = Consulted,
**I** = Informed. Matriks final ditetapkan setelah nama dan kapasitas
anggota tim dikonfirmasi.

---

## 14. Dokumentasi dan Pelacakan Perubahan

Dokumen yang perlu dipelihara:

```text
Docs/
├── Implementation_Plan.md
├── Implementation_Plan_Backend.md
├── Task_Status.md
├── Decision_Log.md
├── Risk_Register.md
├── Test_Report.md
└── backend/
    ├── Backend_Architecture.md
    ├── API_Contract.md
    ├── Provider_Strategy.md
    ├── Backend_Risk_Register.md
    ├── Backend_Test_Report.md
    ├── Backend_Operations_Guide.md
    └── Backend_Handover.md
```

Aturan: - Jangan mengubah dokumen induk secara diam-diam. - Catat
keputusan baru dengan tanggal, alasan, dampak, dan pemberi
persetujuan. - Setiap task memiliki ID unik. - Setiap perubahan kode
dapat ditelusuri ke task dan approval. - Simpan hasil test dan laporan
pada lokasi yang disepakati.

---

## 15. Risiko Backend

---

  Risiko                  Dampak                  Mitigasi

---

  API provider berubah    Generasi gagal          Adapter terisolasi dan
                                                  uji kompatibilitas

  Kuota/rate limit        Request tertunda/gagal  Batas penggunaan, retry
                                                  terbatas, fallback

  Output AI tidak valid   Generator gagal         Parser, schema,
                                                  allowlist

  Secret terekspos        Penyalahgunaan API      Environment secret,
                                                  redaksi, secret scan

  Retry berlebihan        Biaya dan latensi       Satu kebijakan retry
                          meningkat               terpusat

  Kontrak FE-BE berbeda   Integrasi gagal         OpenAPI dan contract
                                                  test

  Schema berubah sepihak  Data tidak kompatibel   Versioning dan approval

  Log menyimpan data      Risiko privasi          Minimasi dan redaksi
  sensitif                                        log

  Dependensi rentan       Risiko keamanan         Audit dan pembaruan
                                                  terkontrol

Agent mengubah scope    Kerusakan/pekerjaan     Approval gate dan diff
                          ulang                   review
--------------------------------------------------------

---

## 16. Approval Gate dan Status

Setiap tahap wajib melewati empat gerbang:

1. **Planning Approval** --- ruang lingkup, rencana, dan acceptance
   criteria disetujui.
2. **Implementation Review** --- perubahan kode diperiksa terhadap
   rencana.
3. **Testing Verification** --- bukti pengujian diverifikasi.
4. **Final Approval** --- pemilik proyek mengizinkan tahap berikutnya.

Status yang digunakan: - `Pending` - `In Progress` - `Review` -
`Approved` - `Rejected` - `Blocked`

### 16.1 Prinsip wajib

- **No Plan, No Code.**
- **No Approval, No Code.**
- **No Evidence, No Completion.**
- AI coding agent tidak boleh menyetujui pekerjaannya sendiri.
- Persetujuan satu tahap tidak otomatis menyetujui seluruh tahap
  berikutnya.
- Persetujuan dokumen ini tidak otomatis memberi izin untuk mengubah
  repository.
- Perubahan scope, stack, kontrak, dan kebijakan keamanan memerlukan
  persetujuan.
- Jika ada ketidakjelasan, agent harus berhenti dan meminta keputusan,
  bukan menebak.

### 16.2 Formulir persetujuan tahap

```text
Nama tahap:
Ruang lingkup:
Deliverable:
Acceptance criteria:
Risiko:
File/area yang boleh diubah:
File/area yang dilarang diubah:
Reviewer:
Status approval:
Tanggal:
Catatan:
```

---

## 17. Kriteria Selesai Backend MVP

Backend MVP dapat dinyatakan selesai jika seluruh hal berikut terbukti:

- [ ]  Service dapat dijalankan sesuai dokumentasi.
- [ ]  Endpoint yang disepakati berfungsi.
- [ ]  Kontrak OpenAPI dan implementasi sinkron.
- [ ]  Gemini adapter berfungsi.
- [ ]  Groq fallback berfungsi sesuai kebijakan.
- [ ]  Retry dan timeout dibatasi.
- [ ]  Output AI divalidasi dengan schema dan allowlist.
- [ ]  Tidak ada eksekusi kode arbitrer dari output AI.
- [ ]  API key tidak terekspos.
- [ ]  Logging aman dan dapat ditelusuri.
- [ ]  Unit, integration, contract, dan failure test tersedia serta
  hasilnya tercatat.
- [ ]  Integrasi FE dan generator berhasil diverifikasi.
- [ ]  Dokumentasi operasi dan serah terima lengkap.
- [ ]  Tidak ada blocker yang belum dinyatakan.
- [ ]  Pemilik proyek memberikan final approval.

---

## 18. Status Awal Dokumen

  Item                      Status

---

  Dokumen backend           Draft v1.0
  Arsitektur backend        Usulan, menunggu review
  Kontrak API               Draft, perlu sinkronisasi FE dan generator
  Schema output AI          Belum final
  Model/provider ID         Harus diverifikasi saat implementasi
  Struktur direktori        Konseptual, menunggu keputusan lokasi
  Coding backend            Belum dimulai
  Integrasi API             Belum dimulai
  Approval pemilik proyek   Belum diberikan

**Pernyataan akhir:** dokumen ini adalah pedoman persiapan dan dasar
review backend Ardena Playground. Dokumen tidak memberikan izin otomatis
untuk coding, instalasi dependensi, pemanggilan API berbayar, perubahan
repository, atau deployment. Seluruh tindakan tersebut harus mengikuti
approval gate yang berlaku.
