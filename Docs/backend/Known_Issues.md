# Known Issues & Technical Constraints — Ardena Playground Backend

> **DOKUMEN CATATAN BATASAN TEKNIS & MITIGASI (BE-07)**  
> **PROYEK:** Ardena Playground  
> **OTORITAS PENYETUJU:** Yogi Ario (Project Owner / Lead Developer)  
> **STATUS:** AKTIF  

---

## 1. Pendahuluan

Dokumen ini mendokumentasikan batasan teknis (*technical constraints*), karakteristik operasional (*known behaviors*), serta rekomendasi mitigasi untuk fase MVP Ardena Playground. Catatan ini berfungsi sebagai panduan troubleshooting bagi tim pengembang dan QA.

---

## 2. Matriks Batasan Teknis & Mitigasi

| ID | Kategori | Deskripsi Batasan Teknis | Dampak Operasional | Rekomendasi Mitigasi |
|---|---|---|---|---|
| **ISSUE-01** | Penyimpanan Data | Ketiadaan database server terpusat (MySQL/PostgreSQL) pada MVP (Sesuai ADR-005). | Proyek game pengguna disimpan pada IndexedDB lokal browser. Jika cache browser dibersihkan, proyek lokal dapat hilang. | Frontend wajib menyediakan fitur "Export to .sb3" yang menonjol agar pengguna dapat menyimpan salinan file fisik ke komputernya. |
| **ISSUE-02** | Latensi Cascading | Waktu respons meningkat saat terjadi failover berantai antar-cluster. | Jika Cluster 1 (Gemini) mengalami limit dan berpindah ke Cluster 2/3 (Groq/SambaNova), latensi respons dapat mencapai 5–15 detik. | Frontend menampilkan state loading dinamis dengan pesan informatif: *"Sedang mengoptimalkan logika game dengan AI alternatif..."*. |
| **ISSUE-03** | Validasi Prompt | Panjang teks prompt dibatasi antara 5 s/d 1.000 karakter. | Prompt teks di luar rentang ini ditolak oleh Zod dengan status HTTP 400 `INVALID_REQUEST_BODY`. | Text area pada panel ide Scratch GUI wajib memiliki counter karakter real-time `(n / 1000)` dan tombol generate disabled jika < 5 karakter. |
| **ISSUE-04** | Ketergantungan Internet | Fitur AI Game Generator membutuhkan konektivitas internet aktif. | Pengguna tidak dapat membuat game dari prompt saat koneksi internet terputus (offline). | Jika request gagal karena network error, frontend mengarahkan pengguna ke mode Scratch Editor manual offline. |
| **ISSUE-05** | Allowlist Opcode | Output game hanya mengizinkan blok logika resmi Scratch 3.0. | Permintaan prompt untuk kode JavaScript mentah, backend API eksternal, atau script dinamis ditolak oleh `capability.validator.ts`. | Penegakan ini adalah fitur keamanan (*security feature*) untuk menjamin proyek Scratch dapat dieksekusi 100% aman di lingkungan sekolah/anak. |

---

## 3. Catatan Edge Case & Pemulihan Sistem

1. **Pemadaman Serentak 6 Cluster AI (HTTP 502):**
   - Sangat jarang terjadi, namun dimungkinkan jika seluruh penyedia AI global mengalami gangguan jaringan serentak.
   - Klien akan menerima header `Retry-After: 15`. Sistem tidak melakukan retry agresif agar tidak memicu pemblokiran IP oleh firewall vendor.
2. **Karakter Unicode Khusus pada Prompt:**
   - Prompt mendukung karakter emoji, aksara non-Latin, dan simbol bacaan standar. Seluruh karakter telah divalidasi aman dari celah *prototype pollution* dan *SQL/script injection*.

