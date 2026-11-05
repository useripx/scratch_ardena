# API Contract — Ardena Playground Backend

> **STATUS:** BASELINE CONTRACT (BE-00)  
> **VERSI KONTRAK:** 1.0  
> **FORMAT:** RESTful JSON  
> **OTORITAS PENYETUJU:** Yogi Ario (Project Owner)  

---

## 1. Daftar Endpoint MVP

| Method | Endpoint | Fungsi | Memanggil AI? |
|---|---|---|---|
| `GET` | `/api/v1/health` | Health check kesiapan server | **TIDAK** (Gratis & Cepat) |
| `POST` | `/api/v1/games/generate` | Generasi konfigurasi game terstruktur | **YA** (Gemini / Groq) |
| `GET` | `/api/v1/meta/capabilities` | Daftar template dan fitur Scratch yang didukung | **TIDAK** |

---

## 2. Rincian Endpoint

### 2.1 Health Check Endpoint
* **Method:** `GET`
* **Path:** `/api/v1/health`
* **Headers:** Bebas
* **Fungsi:** Memeriksa apakah backend Express hidup, siap menerima koneksi, dan konfigurasi lingkungan dasar telah tervalidasi.
* **Response Sukses (HTTP 200):**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-05T11:00:00.000Z",
    "version": "1.0.0",
    "uptimeSeconds": 124.5
  }
  ```

---

### 2.2 Generate Game Endpoint
* **Method:** `POST`
* **Path:** `/api/v1/games/generate`
* **Headers Wajib:**
  * `Content-Type: application/json`
  * `X-Request-ID: <uuid-opsional>` (jika tidak dikirim oleh client, dibuat otomatis oleh backend)
* **Batas Ukuran Payload:** Maksimum `1 MB`

#### Request Body
```json
{
  "prompt": "Buat rintangan asteroid jatuh dari atas secara acak. Jika kucing astronot mengenainya, putar suara ledakan dan kurangi nyawa sebanyak 1.",
  "template": "space-shooter",
  "language": "id",
  "schemaVersion": "1.0"
}
```

#### Aturan Validasi Input:
* `prompt` (*string, wajib*): Minimum 5 karakter, maksimum 500 karakter (toleransi sistem hingga 1.000 karakter). Tidak boleh hanya spasi kosong.
* `template` (*string, wajib*): Enum yang didukung:
  * `"catching-game"`
  * `"maze-game"`
  * `"space-shooter"`
  * `"custom"` (mode bebas berbasis komponen inti)
* `language` (*string, opsional*): `"id"` (default) atau `"en"`.
* `schemaVersion` (*string, wajib*): `"1.0"`.

#### Response Sukses (HTTP 200)
```json
{
  "success": true,
  "data": {
    "schemaVersion": "1.0",
    "game": {
      "title": "Petualangan Kucing Antariksa",
      "genre": "space-shooter",
      "description": "Hindari asteroid yang berjatuhan dan pertahankan nyawa kucing astronot!"
    },
    "delta": {
      "newSpritesCount": 1,
      "globalVariablesCount": 1,
      "sfxCount": 1,
      "logicBlocksCount": 8,
      "overwrittenBlocksCount": 0
    },
    "objects": [
      {
        "id": "sprite_asteroid",
        "name": "Asteroid Rintangan",
        "role": "obstacle",
        "initialPosition": { "x": 0, "y": 180 },
        "speed": { "min": -5, "max": -9 },
        "costumes": ["batu_utuh", "batu_pecah"]
      }
    ],
    "variables": [
      {
        "name": "nyawa",
        "type": "global",
        "initialValue": 3
      }
    ],
    "rules": [
      {
        "event": "when_flag_clicked",
        "action": "spawn_repeatedly",
        "target": "sprite_asteroid"
      },
      {
        "event": "collision_detected",
        "actor": "sprite_cat",
        "target": "sprite_asteroid",
        "action": "play_sound_and_decrease_health",
        "sfx": "explosion.wav",
        "variableChange": { "name": "nyawa", "amount": -1 }
      }
    ],
    "controls": [
      {
        "key": "arrow_left",
        "action": "move_x",
        "value": -10
      },
      {
        "key": "arrow_right",
        "action": "move_x",
        "value": 10
      }
    ]
  },
  "meta": {
    "requestId": "req_8f1c3e4a",
    "provider": "gemini",
    "fallbackUsed": false,
    "latencyMs": 142
  }
}
```

---

### 2.3 Standar Response Error

Semua response error mengikuti struktur seragam:
```json
{
  "success": false,
  "error": {
    "code": "AI_PROVIDER_UNAVAILABLE",
    "message": "Layanan AI sementara tidak tersedia. Silakan coba sesaat lagi.",
    "retryable": true,
    "retryAfterSeconds": 8
  },
  "meta": {
    "requestId": "req_8f1c3e4a"
  }
}
```

#### Daftar Kode Error Resmi:

| HTTP Status | Error Code | Keterangan & Tindakan Frontend |
|---|---|---|
| `400` | `INVALID_REQUEST_BODY` | Field wajib hilang, panjang melebihi batas, atau enum tidak valid. Tampilkan pesan kesalahan form. |
| `413` | `PAYLOAD_TOO_LARGE` | Ukuran request melebihi 1 MB. Tampilkan instruksi perkecil ukuran request. |
| `422` | `OUTPUT_SCHEMA_INVALID` | AI mengembalikan format yang gagal divalidasi skema. Tawarkan coba ulang (*retry*). |
| `429` | `RATE_LIMIT_EXCEEDED` | Batas kecepatan request tercapai. Frontend menampilkan hitung mundur (*countdown timer*). |
| `502` | `AI_PROVIDER_UNAVAILABLE` | Gemini dan Groq gagal dihubungi / jaringan eksternal bermasalah. |
| `504` | `AI_TIMEOUT` | Waktu tunggu pemrosesan melebihi 30 detik. Sistem membatalkan request secara aman. |
| `500` | `INTERNAL_SERVER_ERROR` | Kesalahan internal server tak terduga. Stack trace disanitasi dan tidak dikirim ke klien. |

---

### 2.4 Metadata Capabilities Endpoint
* **Method:** `GET`
* **Path:** `/api/v1/meta/capabilities`
* **Fungsi:** Mengambil katalog template aktif, fitur Scratch yang didukung, dan versi skema aktif.
* **Response Sukses (HTTP 200):**
  ```json
  {
    "supportedSchemaVersions": ["1.0"],
    "templates": [
      { "id": "catching-game", "name": "Catching Game", "difficulty": "pemula" },
      { "id": "maze-game", "name": "Maze Adventure", "difficulty": "pemula" },
      { "id": "space-shooter", "name": "Space Shooter Core", "difficulty": "menengah" }
    ],
    "maxPromptLength": 500
  }
  ```

