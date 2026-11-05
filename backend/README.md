# Ardena Playground — Backend Service

Layanan backend API berbasis **Node.js LTS, Express, dan TypeScript** yang bertindak sebagai jembatan komunikasi aman antara frontend **Ardena Playground (Scratch Editor)** dengan AI Provider (Google Gemini & Groq).

---

## 🛠️ Stack Teknologi

- **Runtime:** Node.js LTS
- **Bahasa:** TypeScript (Strict Mode)
- **Framework HTTP:** Express
- **Arsitektur:** Modular Monolith
- **Tanpa Database Server (MVP):** Penyimpanan proyek dikelola oleh browser (IndexedDB).
- **Tanpa Laragon:** Dijalankan langsung melalui terminal Node.js.

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Masuk ke Direktori Backend
```bash
cd backend
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan
Salin berkas template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi port dan kredensial jika diperlukan.

### 4. Menjalankan di Mode Development
```bash
npm run dev
```
Server akan aktif di `http://localhost:3001`.

### 5. Memeriksa Endpoint Health
Buka peramban atau jalankan perintah:
```bash
curl http://localhost:3001/api/v1/health
```
Respons yang diharapkan:
```json
{
  "status": "healthy",
  "timestamp": "2026-11-05T11:00:00.000Z",
  "version": "1.0.0",
  "uptimeSeconds": 10
}
```

---

## 🧪 Menjalankan Pengujian Otomatis

Untuk menjalankan seluruh test suite otomatis:
```bash
npm test
```

Untuk memverifikasi kompilasi build TypeScript:
```bash
npm run build
```

---

## 📁 Struktur Direktori

```text
backend/
├── src/
│   ├── app.ts                         # Konfigurasi Express app & middleware
│   ├── server.ts                      # Entry point listener & graceful shutdown
│   ├── config/
│   │   └── env.ts                     # Validasi konfigurasi environment
│   ├── routes/
│   │   └── health.routes.ts           # Rute /api/v1/health
│   ├── controllers/
│   │   └── health.controller.ts       # Controller logic health check
│   └── middleware/
│       ├── request-id.middleware.ts   # Pembangkit X-Request-ID
│       ├── cors.middleware.ts         # Whitelist origin Scratch GUI
│       └── error.middleware.ts        # Error handler & 404 handler
├── tests/
│   └── unit/
│       └── health.test.ts             # Unit test otomatis
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

