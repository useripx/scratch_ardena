# Implementation Plan --- Ardena Playground

**Versi:** 1.4\
**Tanggal:** 5 November 2026\
**Status:** FINAL untuk spesifikasi UI/UX Google Stitch; persetujuan proyek tetap mengikuti approval gate\
**Tahap aktif:** Perencanaan dan desain UI/UX seluruh halaman
menggunakan Google Stitch\
**Larangan:** Belum ada coding, perubahan repository, instalasi
dependensi, atau integrasi API.

> **Ardena Playground** digunakan sebagai nama kerja sementara untuk
> seluruh dokumen dan rancangan saat ini. Nama ini masih dapat diubah di
> kemudian hari. Logo belum tersedia pada tahap perencanaan; pemilik
> proyek akan mengunggah file logo sendiri untuk digunakan pada desain
> dan implementasi setelah diterima.

------------------------------------------------------------------------

## 1. Ringkasan Proyek

Ardena Playground adalah aplikasi web pembuatan game edukatif/kreatif
berbasis Scratch. Pengguna menuliskan ide game dalam bahasa alami. AI
membantu mengubah ide tersebut menjadi konfigurasi game terstruktur yang
kemudian dipetakan ke blok Scratch. Pengguna tetap dapat melihat,
mempelajari, dan mengedit blok secara manual.

### 1.1 Tujuan MVP

1.  Menyediakan antarmuka web yang mudah dipahami pengguna dari berbagai
    usia.
2.  Mengintegrasikan panel AI ke pengalaman Scratch Editor.
3.  Menghasilkan konfigurasi game terstruktur melalui Gemini atau Groq.
4.  Memvalidasi konfigurasi sebelum diterjemahkan ke proyek Scratch.
5.  Menampilkan blok hasil generasi di editor Scratch.
6.  Menjalankan game menggunakan Scratch VM.
7.  Menyimpan proyek secara lokal di browser.
8.  Mengekspor proyek ke format `.sb3`.

### 1.2 Prinsip Produk

-   AI membantu pengguna belajar, bukan menyembunyikan logika program.
-   Hasil AI harus dapat diperiksa dan diedit.
-   Fitur inti tetap berfungsi tanpa pemanggilan AI setelah proyek
    dibuat.
-   Proyek pengguna disimpan lokal pada MVP.
-   Tidak mengumpulkan data pribadi yang tidak diperlukan.
-   Antarmuka harus responsif, jelas, dan dapat diakses.

### 1.3 Batasan MVP

**Termasuk:** - Editor Scratch yang dimodifikasi. - Panel prompt AI. -
Pemilihan template game terbatas. - Gemini sebagai provider utama dan
Groq sebagai fallback. - Validasi JSON. - Generator/mapper blok yang
dibatasi pada fitur yang telah diuji. - Preview game, penyimpanan lokal,
dan ekspor `.sb3`.

**Tidak termasuk:** - Akun pengguna dan sinkronisasi cloud. -
Marketplace atau galeri publik. - Multiplayer dan kolaborasi
real-time. - Pembuatan aset gambar AI bebas. - Game 3D. - Pelatihan
model AI sendiri. - Sistem pembayaran. - Moderasi komunitas publik.

------------------------------------------------------------------------

## 2. Keputusan Produk dan Teknologi

  ------------------------------------------------------------------------
  Area             Keputusan saat ini                   Catatan
  ---------------- ------------------------------------ ------------------
  Nama produk      Sementara                            Belum dikunci

  Platform         Web                                  Berjalan di
                                                        browser modern

  Target           Semua usia                           Desain inklusif;
                                                        keselamatan anak
                                                        tetap
                                                        diprioritaskan

  Fondasi editor   `scratchfoundation/scratch-editor`   Monorepo resmi

  GUI              `@scratch/scratch-gui` di dalam      Dimodifikasi
                   monorepo                             secara terukur

  Runtime          `@scratch/scratch-vm`                Dipertahankan

  Rendering        Scratch Renderer                     Dipertahankan

  Frontend         React                                Scratch GUI
  tambahan                                              sendiri berbasis
                                                        React

  Bahasa pada      JavaScript/JSX sesuai konvensi paket Jangan migrasikan
  Scratch GUI                                           ke TypeScript
                                                        tanpa keputusan
                                                        khusus

  Bahasa modul     TypeScript jika memang diperlukan    Ikuti standar repo
  baru                                                  untuk paket baru

  Build Scratch    Webpack bawaan                       Jangan mengganti
  GUI                                                   dengan Vite

  Backend          Node.js + TypeScript + Express       Aplikasi layanan
                                                        terpisah

  AI               Gemini utama, Groq cadangan          Satu provider per
                                                        permintaan;
                                                        fallback bila
                                                        perlu

  Validasi         JSON Schema atau validator setara    Validasi pada
                                                        batas sistem

  Penyimpanan      IndexedDB                            Data proyek dan
  proyek                                                metadata

  Preferensi UI    LocalStorage                         Hanya preferensi
                                                        ringan

  Database server  Tidak digunakan pada MVP             Tidak ada
                                                        MySQL/PostgreSQL

  Desain UI/UX     Google Stitch                        Alat desain, bukan
                                                        runtime aplikasi

  Version control  Git                                  Branch dan commit
                                                        terkontrol
  ------------------------------------------------------------------------

### 2.1 Aturan kompatibilitas repository Scratch

Repository sumber: - https://github.com/scratchfoundation/scratch-editor

Ketentuan yang harus diikuti:

1.  Gunakan monorepo `scratch-editor`, bukan repository `scratch-gui`
    atau `scratch-vm` lama yang sudah dipindahkan/diarsipkan.
2.  Pertahankan struktur npm workspaces dan package boundaries.
3.  Jangan mengganti versi Node.js, npm, atau dependensi inti sebelum
    membaca `.nvmrc`, `package.json`, lockfile, dan panduan repository
    pada commit yang dipilih.
4.  Ikuti toolchain masing-masing paket. `scratch-gui` menggunakan
    JavaScript/JSX dan Webpack serta pengujian Jest/Playwright sesuai
    konfigurasi paket. Jangan memaksakan Vite ke paket ini.
5.  Modul baru boleh menggunakan TypeScript/Vite/Vitest jika sesuai
    pedoman repository dan tidak memaksa migrasi paket lama.
6.  Jalankan perintah build/test yang benar-benar didefinisikan oleh
    commit repository yang dipilih.
7.  Jangan mengedit atau menghapus package inti Scratch secara luas.
    Utamakan integrasi yang terisolasi dan perubahan sekecil mungkin.
8.  Catat commit SHA atau tag dasar yang dipakai agar pengembangan dapat
    direproduksi.

**Catatan:** detail repository dapat berubah. Audit Tahap 01 wajib
memeriksa ulang file aktual pada commit yang akan digunakan sebelum
implementasi.

------------------------------------------------------------------------

## 3. Peran Google Stitch dalam Pengembangan Frontend

**Klarifikasi ruang lingkup:** yang dimaksud pekerjaan FE pada tahap ini
adalah **merancang UI/UX seluruh halaman aplikasi menggunakan Google
Stitch**, bukan langsung menulis kode React. Seluruh halaman, alur
navigasi, komponen, dan state antarmuka harus dirancang serta direview
terlebih dahulu. Implementasi desain menjadi kode React/JSX dilakukan
pada tahap coding frontend yang terpisah, setelah desain disetujui dan
approval implementasi diberikan.

Google Stitch digunakan pada tahap desain UI/UX untuk menghasilkan
eksplorasi layar, prototipe visual, dan arahan design system.

Referensi: - https://stitch.withgoogle.com/ -
https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/ -
https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/

### 3.1 Stitch bukan pengganti Scratch GUI

Stitch tidak akan: - Menggantikan Scratch Blocks. - Menggantikan Scratch
VM atau renderer. - Menjalankan proyek Scratch. - Menjadi backend AI
aplikasi. - Menjadi tempat penyimpanan proyek pengguna. - Menentukan
sendiri arsitektur runtime.

Stitch digunakan untuk merancang lapisan antarmuka produk, misalnya
halaman awal, dashboard lokal, panel AI, dialog, onboarding, dan
penataan area kerja. Area editor Scratch yang kompleks harus tetap
menggunakan komponen dan perilaku asli Scratch.

### 3.2 Ketentuan logo dan identitas visual

-   Nama yang digunakan sementara pada desain adalah **Ardena
    Playground**.
-   Logo final akan disediakan dan diunggah oleh pemilik proyek.
-   Jangan membuat, menggambar ulang, atau memilih logo final secara
    mandiri.
-   Sebelum file logo diterima, gunakan teks **Ardena Playground**
    sebagai wordmark sementara atau placeholder netral.
-   Jangan mengunci warna merek berdasarkan asumsi dari logo yang belum
    diterima.
-   Setelah logo diunggah, periksa format file, transparansi, resolusi,
    keterbacaan pada ukuran kecil, dan variasi latar terang/gelap.
-   Jika file yang diunggah memiliki beberapa variasi, minta pemilik
    proyek menentukan versi utama sebelum implementasi.
-   Simpan file logo yang disetujui pada direktori aset branding yang
    ditetapkan setelah audit repository. Jangan memindahkan atau
    mengganti aset Scratch bawaan yang tidak terkait.

### 3.3 Alur desain ke implementasi

1.  Gunakan nama kerja **Ardena Playground** secara konsisten.
2.  Buat Design Brief, sitemap, user journey, dan inventaris seluruh
    halaman.
3.  Tunggu file logo dari pemilik proyek. Sebelum diterima, gunakan
    wordmark teks sementara.
4.  Setelah logo diterima, gunakan file logo yang disetujui di Google
    Stitch dan sesuaikan design system.
5.  Rancang seluruh halaman dan state UI/UX di Google Stitch.
6.  Review alur navigasi, hierarki informasi, aksesibilitas,
    responsivitas, dan kesesuaian dengan Scratch.
7.  Pilih arah desain dan minta persetujuan pemilik proyek.
8.  Ekspor desain, aset, screenshot, kode referensi, dan/atau
    `DESIGN.md` jika tersedia.
9.  Simpan ekspor sebagai artefak desain; jangan langsung menimpa source
    code Scratch.
10. Setelah desain seluruh halaman disetujui, petakan desain ke komponen
    aktual `scratch-gui`.
11. Implementasikan source code frontend hanya pada tahap coding yang
    memperoleh approval.
12. Bandingkan hasil implementasi dengan desain yang telah disetujui.

Kode hasil ekspor Stitch adalah referensi desain/prototipe, bukan kode
produksi yang otomatis benar. Kode harus disesuaikan dengan struktur
repository, aksesibilitas, state management, responsivitas, dan
toolchain Scratch.

### 3.4 Inventaris halaman UI/UX yang wajib dirancang

Google Stitch harus digunakan untuk merancang semua halaman dan tampilan
berikut. Daftar ini merupakan cakupan desain MVP. Perubahan cakupan
harus dicatat dan disetujui.

  ------------------------------------------------------------------------
  ID                Halaman/tampilan   Isi dan fungsi    Prioritas
                                       utama             
  ----------------- ------------------ ----------------- -----------------
  UI-01             Welcome / Landing  Identitas Ardena  P1
                                       Playground,       
                                       penjelasan        
                                       singkat, tombol   
                                       mulai             

  UI-02             Onboarding /       Cara membuat      P1
                    Panduan awal       game, pengenalan  
                                       prompt dan blok   
                                       Scratch           

  UI-03             Beranda / Project  Mulai proyek      P1
                    Home               baru, lanjutkan   
                                       proyek terakhir,  
                                       daftar proyek     
                                       lokal             

  UI-04             Pilih cara memulai Mulai dari prompt P1
                                       AI atau memilih   
                                       template game     

  UI-05             Pilih template     Catching Game,    P1
                                       Maze Game, Space  
                                       Shooter dan       
                                       deskripsi         

  UI-06             Editor utama       Komposisi area    P1
                                       Scratch, blok,    
                                       stage, sprite,    
                                       kontrol, dan      
                                       panel AI          

  UI-07             Panel AI / Prompt  Input prompt,     P1
                                       contoh prompt,    
                                       batasan input,    
                                       tombol generate   

  UI-08             Generating state   Indikator proses, P1
                                       status generasi,  
                                       opsi batal jika   
                                       didukung          

  UI-09             Review hasil AI    Ringkasan         P1
                                       karakter, aturan, 
                                       kontrol, objek,   
                                       dan perubahan     
                                       sebelum           
                                       diterapkan        

  UI-10             Hasil generate /   Blok hasil AI     P1
                    Editor terisi      terlihat di       
                                       workspace dan     
                                       game siap diuji   

  UI-11             Error dan          Prompt tidak      P1
                    pemulihan          didukung, JSON    
                                       tidak valid,      
                                       provider gagal,   
                                       fallback gagal,   
                                       dan cara mencoba  
                                       kembali           

  UI-12             Simpan proyek      Status            P1
                                       penyimpanan       
                                       lokal, nama       
                                       proyek,           
                                       konfirmasi        
                                       perubahan         

  UI-13             Daftar proyek      Buka, rename,     P1
                    lokal              hapus, dan        
                                       informasi proyek  

  UI-14             Export proyek      Konfirmasi ekspor P1
                                       `.sb3` dan hasil  
                                       ekspor            

  UI-15             Pengaturan         Preferensi dasar, P2
                                       informasi         
                                       privasi,          
                                       informasi         
                                       provider tanpa    
                                       menampilkan       
                                       secret            

  UI-16             Bantuan / Panduan  Panduan editor,   P2
                    blok               prompt, blok, dan 
                                       troubleshooting   

  UI-17             Dialog konfirmasi  Hapus proyek,     P1
                                       keluar dengan     
                                       perubahan belum   
                                       tersimpan,        
                                       terapkan hasil AI 

  UI-18             Empty state dan    Belum ada         P1
                    notifikasi         proyek/hasil,     
                                       sukses,           
                                       peringatan, dan   
                                       kegagalan         
  ------------------------------------------------------------------------

### 3.5 Deliverable desain untuk setiap halaman

Setiap halaman UI-01 sampai UI-18 harus memiliki:

-   Tujuan halaman dan kebutuhan pengguna.
-   Layout desktop dan perilaku responsif yang realistis.
-   Komponen utama dan hierarki informasi.
-   Aksi/tombol dan hasil interaksinya.
-   Navigasi masuk dan keluar.
-   State default serta state loading, empty, error, success,
    confirmation, dan disabled bila relevan.
-   Aturan validasi input.
-   Catatan aksesibilitas dan keterbacaan.
-   Keterangan komponen Scratch asli yang tidak boleh diganti.
-   Screenshot atau tautan hasil desain Stitch.
-   Status review dan persetujuan.

**Catatan integrasi editor:** UI-06 adalah rancangan komposisi halaman
di sekitar Scratch GUI. Google Stitch tidak diminta menggambar ulang
Scratch Blocks, stage, sprite library, atau kontrol runtime sebagai
pengganti komponen asli. Desain hanya menunjukkan tata letak dan
hubungan antarkomponen. Komponen editor sebenarnya tetap berasal dari
Scratch.

### 3.6 Design system

Sebelum menyelesaikan seluruh halaman, tetapkan dan dokumentasikan:

-   Warna dasar, aksen, status, dan aturan kontras.
-   Tipografi, skala teks, dan hierarki heading.
-   Spacing, grid, radius, border, dan elevation.
-   Tombol, input, textarea, select, dialog, tooltip, toast, tab, dan
    panel.
-   Ikon dan aturan penggunaannya.
-   Variasi light/dark hanya jika disetujui untuk MVP.
-   Aturan logo dan wordmark sementara.
-   Breakpoint dan perilaku layout.
-   Fokus keyboard, hover, disabled, dan focus-visible.

Simpan aturan pada `Docs/design/DESIGN.md` atau dokumen design system
setara yang disetujui.



### 3.6A Arah visual final untuk konsep UI v1.4

Arah visual yang digunakan sebagai acuan awal Google Stitch adalah **Modern Creative Workspace**: antarmuka kreatif yang terasa ramah untuk pemula, tetapi tetap memiliki struktur workspace profesional. Referensi visualnya adalah konsep mockup Ardena Playground yang telah dibahas dan disetujui sebagai arah visual awal.

**Karakter visual:**
- Dominan ungu/indigo sebagai warna identitas antarmuka sementara, dengan aksen biru, cyan, kuning, dan oranye untuk membedakan aksi atau kategori.
- Latar utama terang, panel putih atau lavender sangat muda, sidebar indigo gelap, garis pemisah lembut, sudut komponen membulat, dan bayangan tipis seperlunya.
- Tipografi sans-serif yang jelas, modern, mudah dibaca, dan memiliki hierarki konsisten.
- Ilustrasi edukatif dan elemen dekoratif boleh digunakan secara terbatas pada Welcome, Onboarding, Empty State, dan halaman bantuan; jangan sampai mengganggu area kerja.
- Tombol aksi utama seperti **Generate Game** harus terlihat jelas. Aksi berisiko seperti hapus proyek menggunakan gaya sekunder dan konfirmasi.
- Gunakan ikon yang konsisten dan label teks untuk aksi penting. Jangan mengandalkan ikon saja.
- Desain harus terasa menyenangkan untuk semua usia, bukan kekanak-kanakan dan bukan dashboard korporat yang kaku.

**Palet konsep sementara (bukan identitas merek final):**
- Primary: ungu/indigo.
- Secondary: biru.
- Accent: cyan dan kuning/oranye.
- Background: putih dan lavender sangat muda.
- Text: navy/abu gelap dengan kontras memadai.
- Status: hijau untuk berhasil, amber untuk peringatan, merah untuk error.

Nilai warna, font, radius, spacing, dan breakpoint final harus dipilih serta dicatat dalam design system Stitch. Jangan menganggap palet ini sebagai warna logo atau merek permanen. Logo tetap menunggu aset dari pemilik proyek.

### 3.6B Struktur layout aplikasi utama

Gunakan struktur navigasi yang konsisten pada halaman aplikasi setelah Welcome/Onboarding:

1. **Sidebar kiri:** wordmark teks sementara, navigasi Beranda, Proyek Saya, Template, Buat Baru, dan Bantuan. Pada halaman editor, sidebar dapat dipadatkan agar ruang kerja Scratch tetap luas.
2. **Top bar:** nama produk, menu File/Edit/Tutorial atau menu yang relevan, nama proyek aktif, status penyimpanan, dan akses AI Copilot/pengaturan akun lokal jika diperlukan. Jangan membuat fitur akun/login karena tidak termasuk MVP.
3. **Area konten:** dashboard, daftar template, daftar proyek, pengaturan, atau editor sesuai halaman.
4. **Panel kontekstual kanan:** AI Copilot pada editor. Panel dapat ditampilkan/disembunyikan dan tidak boleh menutupi kontrol penting Scratch.
5. **Feedback global:** toast/notifikasi, dialog konfirmasi, indikator proses, empty state, dan error state menggunakan pola desain yang konsisten.

### 3.6C Spesifikasi komposisi Editor Utama (UI-06)

UI-06 adalah layar terpenting dan harus menjadi fokus utama eksplorasi Stitch. Gunakan layout desktop sebagai prioritas karena Scratch Editor membutuhkan ruang kerja yang lebar.

**Komposisi yang direkomendasikan:**
- **Header/top bar:** wordmark Ardena Playground sementara, menu File/Edit/Tutorial, nama proyek (misalnya “Untitled Project”), status simpan, tombol AI Copilot, dan kontrol jendela/akun visual seperlunya.
- **Navigasi vertikal kiri:** kategori kerja seperti Kode, Kostum, Suara, dan Aset. Jika kategori tersebut sudah disediakan Scratch GUI, pertahankan mekanisme aslinya.
- **Panel kategori dan blok Scratch:** area pencarian blok, kategori blok berwarna, serta daftar blok asli Scratch. Jangan menggambar blok palsu sebagai pengganti komponen runtime.
- **Workspace tengah:** ruang utama untuk menyusun blok Scratch. Workspace harus memperoleh ruang paling besar dan tetap dapat di-scroll/zoom sesuai perilaku Scratch.
- **Stage/preview:** tampilkan panggung permainan dan kontrol jalankan/berhenti dengan mempertahankan komponen asli Scratch.
- **Sprite/asset strip:** daftar sprite dan kontrol tambah/pilih sprite sesuai kemampuan Scratch.
- **AI Copilot kanan:** tab atau mode **Buat**, **Ubah**, dan **Jelaskan**; textarea prompt; penghitung karakter bila dibutuhkan; tombol Generate Game; contoh prompt; status generasi; serta pesan error/retry.
- **Review sebelum menerapkan:** hasil AI harus ditinjau dahulu, menampilkan ringkasan judul game, genre, karakter/sprite, tujuan, kontrol, objek, aturan, dan perubahan yang akan diterapkan. Sediakan aksi “Terapkan ke Editor” dan “Buat Ulang”.

**Perilaku penting:**
- Panel AI bisa collapse/expand. Saat layar sempit, panel dapat menjadi drawer atau tab; jangan menumpuk tiga kolom hingga workspace tidak dapat digunakan.
- Beri pemisah visual yang jelas antara area Scratch asli dan panel tambahan Ardena.
- Jangan membuat ulang Scratch Blocks, Stage, Sprite Library, toolbar runtime, atau mekanisme workspace dalam desain Stitch. Stitch hanya mendesain layout pembungkus, panel tambahan, navigasi, dan gaya komponen produk.
- Pengguna harus dapat menutup panel AI dan tetap menggunakan editor Scratch.
- Hasil AI tidak langsung menimpa workspace aktif. Selalu tampilkan review dan konfirmasi penerapan.

### 3.6D Spesifikasi isi dan perilaku setiap layar untuk Stitch

Gunakan daftar berikut sebagai brief per layar. Setiap layar wajib dibuat sebagai frame/halaman terpisah yang saling terhubung dalam prototype Stitch.

| ID | Nama layar | Struktur dan konten yang wajib tampak | Aksi utama dan state |
|---|---|---|---|
| UI-01 | Welcome / Landing | Wordmark teks, headline singkat, deskripsi produk, ilustrasi edukatif opsional, tombol Mulai Sekarang dan Pelajari Lebih Dulu | Masuk onboarding; state awal dan hover/focus |
| UI-02 | Onboarding | Pengenalan alur ide → AI → blok Scratch → uji game; ilustrasi/preview; indikator langkah | Berikutnya, Kembali, Lewati, Selesai; progress tiap langkah |
| UI-03 | Beranda / Dashboard | Sapaan, aksi Buat dengan AI / Mulai dari Template / Proyek Kosong, proyek terakhir, ringkasan jumlah proyek lokal | Buat baru, buka proyek, lihat semua; empty state jika belum ada proyek |
| UI-04 | Pilih Cara Memulai | Kartu pilihan Buat dengan AI, Mulai dari Template, Proyek Kosong | Navigasi ke prompt, template, atau editor kosong |
| UI-05 | Pilih Template | Kartu Catching Game, Maze Game, Space Shooter; thumbnail, deskripsi, tingkat kesulitan, tombol gunakan | Pilih template, preview ringkas, state pencarian/filter dan tidak ditemukan |
| UI-06 | Editor Utama | Header, panel kategori/blok Scratch, workspace, stage, sprite strip, AI Copilot kanan | Jalankan/berhenti, edit blok, buka/tutup Copilot, simpan, export; state proyek belum tersimpan |
| UI-07 | AI Copilot / Prompt | Tab Buat/Ubah/Jelaskan, textarea prompt, contoh prompt, batasan/validasi, tombol Generate Game | Generate; validasi prompt kosong/terlalu panjang; state siap dan disabled |
| UI-08 | Generating | Status proses bertahap, indikator progress yang tidak mengklaim persentase palsu, pesan proses, tombol batal jika didukung | Menunggu, batal jika aman; state loading dan provider fallback |
| UI-09 | Review Hasil AI | Ringkasan game, tujuan, karakter, objek, kontrol, aturan, daftar perubahan, peringatan fitur yang tidak didukung | Terapkan ke Editor, Buat Ulang, Kembali/Edit Prompt; konfirmasi sebelum apply |
| UI-10 | Editor Terisi | Editor UI-06 dengan hasil blok sudah dimuat, status berhasil, petunjuk untuk menguji dan mengedit | Jalankan game, edit manual, simpan; state sukses |
| UI-11 | Error dan Pemulihan | Pesan yang manusiawi untuk prompt tidak didukung, respons AI invalid, koneksi/provider gagal, fallback gagal, mapping gagal, storage/export gagal | Coba Lagi, Edit Prompt, Kembali; tampilkan kode/ID error teknis hanya bila berguna |
| UI-12 | Simpan Proyek | Dialog nama proyek, status penyimpanan lokal, informasi perubahan belum tersimpan | Simpan, Batal; validasi nama dan konflik nama bila relevan |
| UI-13 | Daftar Proyek Lokal | Pencarian, urutan/filter, kartu/list proyek, thumbnail, nama, waktu terakhir diubah | Buka, Rename, Hapus; empty state dan konfirmasi hapus |
| UI-14 | Export Proyek | Dialog ekspor, nama file, format `.sb3`, keterangan lokasi unduhan browser | Export, Batal, state berhasil/gagal |
| UI-15 | Pengaturan | Tab Umum, AI & Provider, Tampilan, Penyimpanan, Tentang; bahasa/tema hanya jika masuk MVP | Simpan preferensi; jangan pernah menampilkan API key penuh atau menyediakan pengaturan server yang tidak tersedia |
| UI-16 | Bantuan / Panduan Blok | Panduan mulai, cara menulis prompt, mengenal workspace, kategori blok, FAQ dan troubleshooting | Buka topik, kembali ke editor; konten mudah dipindai |
| UI-17 | Dialog Konfirmasi | Dialog konsisten untuk hapus proyek, keluar dengan perubahan belum disimpan, dan menerapkan hasil AI | Konfirmasi/Batal; jelaskan dampak tindakan secara eksplisit |
| UI-18 | Empty State & Notifikasi | Belum ada proyek, pencarian kosong, sukses simpan/export, peringatan, error toast, status AI | CTA kontekstual; notifikasi tidak menutupi workspace atau hilang terlalu cepat |

### 3.6E Aturan responsive dan aksesibilitas

- **Desktop (prioritas utama):** seluruh komposisi editor tiga area dapat terlihat: blok/workspace, stage, dan AI Copilot. Pastikan workspace tetap menjadi area dominan.
- **Tablet:** navigasi kiri dapat dipadatkan; AI Copilot menjadi panel yang dapat dibuka/tutup; stage dan workspace tetap dapat diakses tanpa tumpang tindih.
- **Mobile:** jangan menjanjikan pengalaman authoring Scratch penuh jika belum terbukti layak. Rancang tampilan informatif/responsif untuk Welcome, Dashboard, Template, Proyek, Bantuan, dan Settings. Untuk Editor, tampilkan pesan/penjelasan bila ukuran layar tidak mendukung pengalaman penuh atau sediakan layout terbatas yang akan divalidasi melalui feasibility test.
- Semua kontrol interaktif memiliki focus state, label yang jelas, ukuran target sentuh memadai, dan kontras teks yang layak.
- Status tidak boleh dibedakan hanya dengan warna; gunakan ikon dan teks.
- Perhatikan reduced motion dan hindari animasi dekoratif berlebihan.

### 3.6F Master prompt Google Stitch (gunakan sebagai prompt dasar)

Salin prompt berikut ke Google Stitch sebagai brief induk. Buat layar secara bertahap dan jangan meminta Stitch menghasilkan seluruh aplikasi dalam satu kali generasi.

> Design a complete, polished, responsive web application UI/UX for **Ardena Playground**, a beginner-friendly creative game-making workspace that combines the real Scratch visual programming editor with an AI Copilot. The product is for users of all ages. The experience should feel like a modern creative workspace: friendly, clear, playful but not childish, and structured like a high-quality productivity application.
>
> **Visual direction:** use a provisional purple/indigo-led interface with a light background, white and very pale lavender surfaces, subtle borders and shadows, rounded cards and controls, clear sans-serif typography, and restrained blue, cyan, yellow, and orange accents. Use a dark indigo left sidebar and a clean light content canvas. Keep spacing generous and hierarchy obvious. This is a provisional UI palette, not a finalized logo or permanent brand identity. Until the owner supplies a logo, use only a simple text wordmark “Ardena Playground”; do not invent or draw a logo.
>
> **Product flow:** Welcome → Onboarding → Dashboard → Choose how to start → Choose template or enter an AI prompt → Main Scratch editor with AI Copilot → AI generation state → Review AI result → Apply to Scratch editor → Test and manually edit the game → Save locally → Export as `.sb3`.
>
> **Critical editor constraint:** the application integrates the actual Scratch GUI, Scratch Blocks, Scratch VM, stage, sprite selector, and runtime controls. Do not redesign or replace Scratch’s real block workspace, stage, sprite library, or runtime controls with fake mock components. Design the surrounding product shell, navigation, AI Copilot panel, dialogs, project screens, and the layout relationship around the native Scratch editor. The editor workspace must remain large and usable.
>
> **Main editor composition:** top bar with temporary text wordmark, File/Edit/Tutorial menus, project title and save status, plus an AI Copilot toggle; compact left navigation; native Scratch category/block area and workspace; native stage and sprite controls; and a right-side AI Copilot panel. The Copilot has three modes: “Buat”, “Ubah”, and “Jelaskan”, a prompt textarea, example prompts, a prominent “Generate Game” action, clear loading/error states, and a review step before any AI result is applied. The Copilot panel can collapse or open as a drawer on smaller screens. Never apply generated changes silently or overwrite the active project without confirmation.
>
> **MVP templates:** Catching Game, Maze Game, and Space Shooter. **MVP storage:** local browser storage only; show local project management and `.sb3` export. Do not invent login, cloud sync, marketplace, multiplayer, payments, or public sharing features.
>
> Create a consistent design system and connected prototype. Include desktop-first editor layouts and responsive behavior for tablet and mobile. Provide empty, loading, success, error, disabled, confirmation, and no-search-results states where relevant. Use accessible contrast, visible keyboard focus, clear labels, and readable touch targets. Keep every screen visually consistent and use reusable components.
>
> Deliver separate, clearly named frames for all screens UI-01 through UI-18 as defined in the supplied screen inventory. Do not omit secondary screens such as error recovery, save/export dialogs, settings, help, confirmation dialogs, empty states, and notifications. The result should visually follow the supplied Ardena Playground reference concept while respecting all Scratch-native component boundaries.

### 3.6G Cara kerja di Google Stitch dan aturan review

1. Masukkan Master Prompt dan Design Brief sebagai konteks proyek.
2. Buat terlebih dahulu Design System dan UI-01 Welcome untuk menguji arah visual.
3. Review arah visual sebelum melanjutkan. Jika tidak sesuai, revisi token warna, tipografi, spacing, dan komponen dasar terlebih dahulu.
4. Buat UI-02 sampai UI-05 sebagai alur masuk dan pemilihan proyek.
5. Buat UI-06 sebagai prioritas tertinggi. Validasi komposisi editor dan batas Scratch-native sebelum membuat layar turunan.
6. Buat UI-07 sampai UI-10 untuk alur AI generation dan review.
7. Buat UI-11 sampai UI-18 untuk manajemen proyek, bantuan, pengaturan, dialog, dan state.
8. Hubungkan seluruh frame dengan navigasi prototype yang masuk akal.
9. Periksa konsistensi komponen dan responsivitas; jangan menerima layar yang hanya cantik sebagai gambar tetapi tidak memiliki alur interaksi.
10. Ekspor screenshot, tautan prototype, design tokens, dan aset yang memang disetujui. Catat keterbatasan hasil Stitch.
11. Lakukan review bersama pemilik proyek. Revisi sampai seluruh layar P1 dan layar P2 yang disepakati selesai.
12. Tandai desain `Approved` hanya setelah pemilik proyek memberi persetujuan eksplisit.

**Kriteria penerimaan hasil Stitch:** 18 layar terinventarisasi; seluruh alur utama saling terhubung; UI-06 mempertahankan batas komponen Scratch; panel AI memiliki mode Buat/Ubah/Jelaskan; hasil AI melewati review sebelum diterapkan; tampilan desktop dan tablet ditinjau; state penting tersedia; dan tidak ada fitur di luar MVP yang disisipkan tanpa keputusan.


### 3.7 Artefak desain yang wajib disimpan

-   `Docs/design/Design_Brief.md`
-   `Docs/design/Screen_Inventory.md`
-   `Docs/design/Design_Review.md`
-   `Docs/design/DESIGN.md` jika tersedia/dihasilkan
-   `Docs/design/stitch-exports/` untuk ekspor yang disetujui
-   Screenshot atau tautan layar Stitch yang disetujui
-   Catatan keputusan desain

Jangan menyimpan API key, data pribadi pengguna, atau data sensitif
dalam prompt maupun artefak desain.

------------------------------------------------------------------------

## 4. Ruang Lingkup Frontend MVP

### 4.1 Pemetaan layar desain ke implementasi frontend

Daftar FE-01 sampai FE-08 di bawah adalah pengelompokan pekerjaan implementasi, bukan inventaris layar baru. Inventaris desain yang menjadi sumber kebenaran tetap UI-01 sampai UI-18 pada Bagian 3.4 dan 3.6D. Satu modul frontend dapat mencakup beberapa layar UI, dan satu layar UI dapat menggunakan beberapa komponen Scratch-native.

### 4.2 Layar yang direncanakan

  -----------------------------------------------------------------------
  ID                Layar             Fungsi            Prioritas
  ----------------- ----------------- ----------------- -----------------
  FE-01             Landing/Welcome   Menjelaskan       P1
                                      produk dan        
                                      memulai proyek    

  FE-02             Project Start     Memilih template  P1
                                      atau mulai dari   
                                      prompt            

  FE-03             Main Editor       Area kerja utama  P1
                                      Scratch yang      
                                      dimodifikasi      

  FE-04             AI Prompt Panel   Menulis instruksi P1
                                      dan melihat       
                                      status generasi   

  FE-05             Generation Review Meninjau          P1
                                      ringkasan hasil   
                                      AI sebelum        
                                      diterapkan        

  FE-06             Local Projects    Membuka,          P1
                                      mengganti nama,   
                                      dan menghapus     
                                      proyek lokal      

  FE-07             Help/Block Guide  Penjelasan        P2
                                      singkat untuk     
                                      membantu pemula   

  FE-08             Settings          Preferensi dasar  P2
                                      dan informasi     
                                      privasi           
  -----------------------------------------------------------------------

### 4.3 Komposisi layar editor

Layar editor direncanakan memiliki:

-   Header: identitas produk sementara, nama proyek, status simpan.
-   Area utama: Scratch Blocks dan kategori blok.
-   Stage/preview: menjalankan game.
-   Sprite/asset controls: menggunakan mekanisme Scratch yang sudah
    tersedia.
-   Panel AI: prompt, template, generate, status, dan pesan kesalahan.
-   Review hasil: ringkasan perubahan sebelum diterapkan.
-   Aksi proyek: simpan lokal, buka, dan ekspor.

**Batasan desain:** jangan membuat ulang workspace blok, stage, sprite
selector, atau kontrol runtime dari nol. Gunakan komponen Scratch yang
ada dan modifikasi layout di sekitarnya secara hati-hati.

### 4.4 Prinsip UI/UX

-   Bahasa sederhana dan ramah pemula.
-   Ikon disertai label untuk aksi penting.
-   Kontras warna memenuhi praktik aksesibilitas.
-   Ukuran tombol dan area klik nyaman.
-   Status loading, sukses, kosong, dan error jelas.
-   Pengguna selalu tahu kapan AI sedang bekerja.
-   Tidak ada aksi AI yang menghapus atau menimpa proyek tanpa
    konfirmasi.
-   Editor tetap dapat digunakan tanpa AI.
-   Tata letak mendukung desktop terlebih dahulu; tablet dipertimbangkan
    setelah uji kelayakan Scratch Editor.
-   Jangan mengasumsikan editor Scratch akan nyaman di layar ponsel.

------------------------------------------------------------------------

## 5. Rencana Tahapan Implementasi

Setiap tahap memiliki planning approval, implementation review, testing
verification, dan final approval. Tahap berikutnya tidak boleh dimulai
sebelum tahap sebelumnya disetujui.

### Tahap 01 --- Repository Audit dan Feasibility

**Tujuan:** memahami repository dan memastikan cara integrasi yang benar
sebelum desain maupun coding terikat pada asumsi teknis.

Tugas: - \[ \] Tentukan branch/tag/commit dasar `scratch-editor`. - \[
\] Periksa README, AGENTS.md, LICENSE, TRADEMARK, `.nvmrc`, root
`package.json`, lockfile. - \[ \] Periksa struktur
`packages/scratch-gui`. - \[ \] Petakan entry point, layout, state
management, style system, dan test setup GUI. - \[ \] Periksa hubungan
GUI, VM, renderer, storage, dan project serialization. - \[ \]
Identifikasi extension point yang aman untuk panel AI. - \[ \]
Identifikasi cara memasukkan perubahan blok ke workspace dan VM. - \[ \]
Periksa proses load/save/export proyek. - \[ \] Audit lisensi dan
kewajiban distribusi. - \[ \] Catat risiko fork, upstream merge, dan
pemeliharaan. - \[ \] Buat keputusan apakah fork monorepo penuh atau
strategi lain yang paling aman.

Output: - `Docs/tahap/tahap-01/Repository_Audit.md` -
`Docs/tahap/tahap-01/Architecture_Map.md` -
`Docs/tahap/tahap-01/License_Review.md` -
`Docs/tahap/tahap-01/Feasibility_Report.md`

Kriteria approval: - Commit dasar tercatat. - Toolchain dan perintah
build/test terverifikasi. - Titik integrasi GUI dan VM dipahami. -
Strategi modifikasi tidak merusak package boundaries. - Risiko lisensi
dan branding ditinjau. - Tidak ada asumsi teknis kritis yang belum
dijawab.

Pengujian/verifikasi: - Audit dokumentasi dan manifest. - Verifikasi
command berdasarkan script aktual. - Verifikasi dependency dan
lisensi. - Review peta arsitektur. - Tidak ada coding fitur.

### Tahap 02 --- Desain UI/UX Seluruh Halaman dengan Google Stitch

**Tujuan:** menghasilkan rancangan UI/UX lengkap untuk seluruh halaman
MVP sebelum implementasi kode frontend dimulai.

**Penting:** tahap ini adalah pekerjaan desain FE, bukan coding FE.
Tidak ada React/JSX yang diimplementasikan pada tahap ini.

Tugas: - \[ \] Buat Design Brief dan sitemap. - \[ \] Buat user journey
dari pengguna pertama kali sampai membuat, mengedit, menyimpan, dan
mengekspor game. - \[ \] Buat inventaris seluruh halaman UI-01 sampai
UI-18. - \[ \] Rancang semua halaman P1 di Google Stitch. - \[ \]
Rancang halaman P2 atau dokumentasikan alasan jika ditunda. - \[ \]
Rancang state loading, empty, error, success, confirmation, dan disabled
yang relevan. - \[ \] Rancang navigasi dan hubungan antarhalaman. - \[
\] Buat design system: warna, tipografi, spacing, komponen, ikon,
breakpoint, dan aksesibilitas. - \[ \] Minta pemilik proyek mengunggah
logo Ardena Playground. - \[ \] Sebelum logo diterima, gunakan wordmark
teks sementara; jangan membuat logo sendiri. - \[ \] Setelah logo
diterima, periksa file dan gunakan hanya aset yang disetujui. - \[ \]
Pastikan halaman editor mempertahankan area dan perilaku Scratch asli. -
\[ \] Review seluruh layar dan alur. - \[ \] Revisi desain berdasarkan
review. - \[ \] Minta persetujuan pemilik proyek untuk keseluruhan
desain UI/UX.

Output: - `Docs/design/Design_Brief.md` -
`Docs/design/Screen_Inventory.md` - `Docs/design/User_Journey.md` -
`Docs/design/Brand_Assets.md` - `Docs/design/DESIGN.md` -
`Docs/design/Design_Review.md` - `Docs/design/stitch-exports/` berisi
ekspor/screenshot seluruh halaman yang disetujui.

Kriteria approval: - Semua halaman P1 telah dirancang. - Semua halaman
P2 telah dirancang atau penundaannya disetujui. - Seluruh alur utama
dapat ditelusuri dari desain. - State antarmuka utama telah dirancang. -
Design system terdokumentasi. - Logo yang diunggah telah digunakan dan
disetujui, atau status placeholder dicatat jika logo belum tersedia. -
Komposisi editor tidak menggantikan komponen Scratch asli. - Pemilik
proyek menyetujui keseluruhan desain.

Pengujian/verifikasi: - Review visual setiap halaman. - Walkthrough user
journey. - Review konsistensi komponen. - Pemeriksaan kontras,
keterbacaan, fokus, dan ukuran area klik. - Review layout desktop dan
ukuran tablet yang relevan. - Review kesesuaian rancangan editor dengan
Scratch GUI. - Tidak ada implementasi source code pada tahap ini.

### Tahap 03 --- Persiapan Repository dan Baseline

**Tujuan:** menyiapkan lingkungan pengembangan yang reproduktif tanpa
mengubah perilaku aplikasi.

Tugas: - \[ \] Clone/fork repository sesuai keputusan Tahap 01. - \[ \]
Simpan commit upstream dasar. - \[ \] Ikuti versi Node/npm repository. -
\[ \] Install dependensi dengan package manager dan lockfile yang
sesuai. - \[ \] Jalankan aplikasi Scratch tanpa modifikasi. - \[ \]
Jalankan build dan test baseline yang relevan. - \[ \] Catat hasil dan
masalah baseline. - \[ \] Siapkan branch kerja dan aturan commit. - \[
\] Siapkan dokumentasi status dan keputusan.

Output: - `Docs/tahap/tahap-03/Environment_Report.md` -
`Docs/tahap/tahap-03/Baseline_Test_Report.md`

Kriteria approval: - Aplikasi asli dapat dijalankan. - Build baseline
berhasil atau kegagalan upstream terdokumentasi. - Test baseline
dijalankan dan hasilnya dicatat. - Versi runtime dan dependensi
tercatat. - Tidak ada perubahan fitur yang belum disetujui.

Pengujian: - Clean install. - Start development server. - Build. -
Test/lint sesuai paket. - Smoke test editor, workspace, stage, dan VM.

### Tahap 04 --- Implementasi Kode Frontend

**Tujuan:** menerapkan desain seluruh halaman yang telah disetujui dari
Google Stitch ke Scratch GUI/React. Tahap ini adalah coding FE dan
berbeda dari Tahap 02 yang hanya merancang UI/UX.

Tugas: - \[ \] Petakan desain ke komponen dan file aktual setelah
audit. - \[ \] Terapkan branding sementara tanpa melanggar kebijakan
merek Scratch. - \[ \] Implementasikan panel AI. - \[ \] Implementasikan
prompt input dan tombol generate. - \[ \] Implementasikan status
loading/error/success. - \[ \] Implementasikan review hasil AI. - \[ \]
Implementasikan navigasi proyek lokal. - \[ \] Terapkan responsivitas
yang telah disetujui. - \[ \] Pertahankan kontrol dan interaksi asli
Scratch. - \[ \] Tambahkan test untuk komponen baru.

Kriteria approval: - Desain disetujui telah diterapkan. - Workspace
Scratch tetap berfungsi. - Stage dan kontrol runtime tetap berfungsi. -
Panel AI dapat dibuka/tutup tanpa merusak editor. - Tidak ada secret di
bundle frontend. - Perubahan terisolasi dan terdokumentasi.

Pengujian: - Unit test komponen baru. - UI integration test. - Smoke
test editor. - Regression test fungsi Scratch. - Visual review terhadap
desain Stitch. - Responsive dan accessibility review.

### Tahap 05 --- Backend AI Service

**Tujuan:** menyediakan layanan AI yang aman dan sederhana.

Stack usulan: - Node.js. - TypeScript. - Express. - Adapter Gemini. -
Adapter Groq. - Provider Manager.

Tugas: - \[ \] Buat service backend terpisah dari package Scratch GUI. -
\[ \] Definisikan endpoint minimal untuk generate game. - \[ \] Buat
validasi input dan batas ukuran prompt. - \[ \] Simpan API Key pada
environment server. - \[ \] Buat adapter Gemini. - \[ \] Buat adapter
Groq. - \[ \] Buat fallback yang terkontrol. - \[ \] Buat timeout dan
retry terbatas. - \[ \] Batasi token/output. - \[ \] Redaksi secret dan
data sensitif dari log. - \[ \] Dokumentasikan konfigurasi lokal.

Kriteria approval: - API Key tidak pernah dikirim ke browser. - Provider
dapat dipilih melalui konfigurasi server. - Fallback hanya terjadi
sesuai aturan. - Timeout dan error ditangani. - Input divalidasi. - Log
tidak membocorkan secret.

Pengujian: - Unit test adapter. - Mock provider test. - Valid/invalid
request. - Timeout dan rate-limit simulation. - Fallback test. - Secret
scan.

### Tahap 06 --- AI Game Generator dan Block Mapping

**Tujuan:** mengubah prompt menjadi konfigurasi game yang aman dan dapat
diproses.

Template awal: 1. Catching Game. 2. Maze Game. 3. Space Shooter.

Tugas: - \[ \] Definisikan kontrak JSON versi pertama. - \[ \]
Definisikan JSON Schema. - \[ \] Buat prompt template hemat token. - \[
\] Buat parser dan validator. - \[ \] Buat template lokal untuk game
dasar. - \[ \] Buat mapping konfigurasi ke struktur proyek Scratch. - \[
\] Batasi blok/opcode yang didukung. - \[ \] Tangani instruksi yang
tidak didukung. - \[ \] Buat preview ringkasan sebelum penerapan. - \[
\] Simpan contoh input-output sebagai test fixture.

Kriteria approval: - Respons AI sesuai schema. - Data tidak dikenal
ditolak atau ditangani dengan aman. - Hanya blok yang didukung yang
dihasilkan. - Hasil mapping dapat dimuat oleh Scratch. - Kegagalan
generator tidak merusak proyek aktif. - Tidak ada eksekusi kode arbitrer
dari output AI.

Pengujian: - Schema test. - Parser test. - Mapping test. - Template
regression test. - Invalid response test. - Test proyek hasil mapping
pada VM.

### Tahap 07 --- Integrasi Editor, Local Storage, dan Export

**Tujuan:** memastikan alur dari prompt sampai proyek yang dapat diedit
dan disimpan.

Tugas: - \[ \] Terapkan hasil mapping ke workspace Scratch. - \[ \]
Pastikan workspace dan VM sinkron. - \[ \] Pastikan pengguna dapat
mengedit blok secara manual. - \[ \] Pastikan preview mencerminkan
perubahan. - \[ \] Simpan proyek ke IndexedDB. - \[ \] Simpan preferensi
ringan ke LocalStorage. - \[ \] Implementasikan daftar proyek lokal. -
\[ \] Implementasikan buka, rename, dan hapus proyek. - \[ \]
Implementasikan export `.sb3` melalui mekanisme Scratch yang benar. - \[
\] Uji impor ulang file hasil export.

Kriteria approval: - Proyek dapat dimainkan. - Edit manual berpengaruh
pada runtime. - Proyek tetap tersedia setelah browser ditutup/dibuka. -
Proyek dapat dibuka ulang. - Export dapat dibuka kembali di Scratch. -
Kegagalan storage/export ditampilkan dengan jelas.

Pengujian: - VM execution. - Workspace edit test. - IndexedDB CRUD. -
Reload persistence. - Export/import round-trip. - Storage quota dan
error handling.

### Tahap 08 --- Hardening, UAT, dan MVP Release

**Tujuan:** memastikan kualitas, keamanan, dan kesiapan rilis.

Tugas: - \[ \] Jalankan seluruh regression test. - \[ \] Uji browser
yang ditargetkan. - \[ \] Uji performa pada perangkat menengah. - \[ \]
Uji batas penggunaan AI. - \[ \] Review keamanan prompt dan output. - \[
\] Review privasi untuk pengguna semua usia. - \[ \] Periksa lisensi,
atribusi, dan merek. - \[ \] Selesaikan bug kritis/tinggi. - \[ \] Buat
panduan pengguna. - \[ \] Buat panduan instalasi dan pengembangan. - \[
\] Buat release notes. - \[ \] Minta persetujuan rilis.

Kriteria approval: - Semua skenario P1 lulus. - Tidak ada bug blocker
atau keamanan kritis terbuka. - Data proyek lokal tidak hilang pada alur
normal. - Export/import berhasil. - API Key aman. - Penggunaan AI
memiliki batas. - Lisensi dan branding sudah ditinjau. - Dokumentasi
rilis tersedia.

Pengujian: - End-to-end test. - Regression test. - Security review. -
Privacy review. - Performance smoke test. - User Acceptance Testing.

------------------------------------------------------------------------

## 6. Kontrak Integrasi Antarbagian

### 6.1 Alur data

1.  Pengguna memasukkan prompt pada Frontend.
2.  Frontend mengirim permintaan ke Backend.
3.  Backend memvalidasi input.
4.  Provider Manager memilih Gemini.
5.  Jika kegagalan provider memenuhi aturan fallback, sistem mencoba
    Groq.
6.  Backend mengembalikan JSON terstruktur.
7.  Frontend memvalidasi respons kembali.
8.  Pengguna meninjau ringkasan hasil.
9.  Generator menerjemahkan konfigurasi menjadi struktur proyek Scratch
    yang didukung.
10. Scratch GUI/VM memuat proyek.
11. Pengguna dapat mengedit dan menjalankan game.
12. Proyek disimpan lokal atau diekspor.

### 6.2 Prinsip keamanan output AI

-   Output AI adalah data tidak tepercaya.
-   Jangan menggunakan `eval`, `Function`, atau mengeksekusi JavaScript
    bebas dari respons AI.
-   Gunakan schema allowlist.
-   Batasi opcode, field, input, ukuran, dan jumlah objek yang didukung.
-   Jangan menerapkan hasil AI sebelum validasi dan konfirmasi yang
    diperlukan.
-   Jangan menimpa proyek aktif ketika proses generate gagal.

### 6.3 Strategi hemat token

-   Satu permintaan AI menghasilkan satu konfigurasi game.
-   Gunakan template lokal untuk pola yang berulang.
-   Batasi panjang prompt dan output.
-   Gunakan JSON ringkas.
-   Jangan mengirim seluruh isi proyek Scratch ke AI jika tidak
    diperlukan.
-   Jangan memanggil AI untuk interaksi runtime biasa.
-   Cache hasil hanya jika prompt, versi schema, template, dan parameter
    relevan sama.
-   Retry maksimal satu kali per provider kecuali keputusan teknis baru
    disetujui.
-   Jangan menjalankan Gemini dan Groq bersamaan untuk satu permintaan
    normal.

------------------------------------------------------------------------

## 7. Struktur Dokumentasi dan Repository

Struktur ini adalah target dokumentasi proyek. Struktur aktual source
code harus mengikuti monorepo Scratch setelah audit, bukan memaksakan
layout baru yang bertentangan.

``` text
project-root/
├── Docs/
│   ├── Implementation_Plan.md
│   ├── Project_Analysis.md
│   ├── Architecture_Document.md
│   ├── Task_Status.md
│   ├── Decision_Log.md
│   ├── Risk_Register.md
│   ├── Test_Report.md
│   ├── Rules/
│   │   ├── universal-rules.md
│   │   ├── coding-rules.md
│   │   ├── ai-rules.md
│   │   └── approval-gate.md
│   ├── design/
│   │   ├── Design_Brief.md
│   │   ├── Screen_Inventory.md
│   │   ├── Design_Review.md
│   │   ├── DESIGN.md
│   │   └── stitch-exports/
│   └── tahap/
│       ├── tahap-01/
│       ├── tahap-02/
│       ├── tahap-03/
│       ├── tahap-04/
│       ├── tahap-05/
│       ├── tahap-06/
│       ├── tahap-07/
│       └── tahap-08/
│
├── [Scratch Editor monorepo files and packages]
│
└── [Backend service location decided after repository audit]
```

Jangan membuat folder atau memindahkan package sebelum Tahap 01 dan
approval struktur.

------------------------------------------------------------------------

## 8. Approval Gate dan Tata Kelola

Setiap tahap harus melewati empat gerbang:

1.  **Planning Approval:** ruang lingkup dan tugas disetujui.
2.  **Implementation Review:** perubahan diperiksa terhadap rencana.
3.  **Testing Verification:** bukti pengujian tersedia.
4.  **Final Approval:** pemilik proyek mengizinkan tahap berikutnya.

### Status pekerjaan

-   `Pending`
-   `In Progress`
-   `Review`
-   `Approved`
-   `Rejected`
-   `Blocked`

### Aturan wajib

-   No Plan, No Code.
-   No Approval, No Code.
-   No Evidence, No Completion.
-   AI coding agent tidak boleh menyetujui pekerjaannya sendiri.
-   Perubahan scope wajib dicatat di Decision Log.
-   Setiap perubahan harus menyebut file yang diubah dan alasannya.
-   Jangan mengubah package Scratch yang tidak relevan.
-   Jangan memperbarui dependensi massal tanpa persetujuan.
-   Jangan menyimpan API Key di repository.
-   Jika test baseline gagal karena upstream, catat dan pisahkan dari
    regresi perubahan kita.

### Template bukti tahap

Setiap tahap harus menghasilkan: - Daftar tugas dan status. - Daftar
file yang dibuat/diubah. - Commit ID. - Perintah test yang dijalankan. -
Hasil PASS/FAIL. - Screenshot/log jika relevan. - Risiko tersisa. -
Permintaan approval.

------------------------------------------------------------------------

## 9. Risiko Utama

  -----------------------------------------------------------------------
  Risiko                  Dampak                  Mitigasi
  ----------------------- ----------------------- -----------------------
  Struktur Scratch        Integrasi rusak         Kunci commit dasar dan
  berubah upstream                                catat perubahan

  Perubahan GUI terlalu   Regression tinggi       Integrasi kecil dan
  luas                                            terisolasi

  Toolchain dipaksakan    Build gagal             Ikuti toolchain paket
  tidak sesuai                                    

  Output AI tidak valid   Game gagal dibuat       Schema dan allowlist

  Output AI berbahaya     Risiko keamanan         Tidak mengeksekusi kode
                                                  bebas

  API rate limit          Generate gagal          Timeout, fallback,
                                                  batas pemakaian

  Token boros             Biaya meningkat         Prompt ringkas dan
                                                  template lokal

  Storage browser penuh   Proyek gagal disimpan   Quota handling dan
                                                  pesan jelas

  Export tidak kompatibel Proyek tidak dapat      Round-trip test
                          dibuka                  

  Lisensi/merek tidak     Risiko hukum            License dan trademark
  dipatuhi                                        review

  UI tidak cocok untuk    Pengalaman buruk        Uji keterbacaan dan
  semua usia                                      aksesibilitas
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 10. Kriteria Selesai MVP

MVP hanya dapat dinyatakan selesai jika:

-   [ ] Aplikasi dapat dijalankan secara lokal.
-   [ ] Editor Scratch asli tetap berfungsi.
-   [ ] Panel AI dapat digunakan.
-   [ ] Gemini dan Groq terintegrasi dengan aman.
-   [ ] JSON hasil AI tervalidasi.
-   [ ] Template game yang didukung dapat dibuat.
-   [ ] Blok tampil dan dapat diedit.
-   [ ] Game berjalan di Scratch VM.
-   [ ] Proyek tersimpan di IndexedDB.
-   [ ] Proyek dapat dibuka kembali.
-   [ ] Export `.sb3` berhasil.
-   [ ] File hasil export dapat diimpor kembali.
-   [ ] Tidak ada bug kritis terbuka.
-   [ ] Dokumentasi dan bukti pengujian lengkap.
-   [ ] Review lisensi dan branding selesai.

------------------------------------------------------------------------

## 11. Estimasi Awal

Estimasi berikut hanya perkiraan dan harus diperbarui setelah audit
repository.

  Tahap                              Estimasi
  ------------------------------- -----------
  01 Repository audit               2--3 hari
  02 Google Stitch design           2--4 hari
  03 Environment baseline              2 hari
  04 Frontend implementation        3--5 hari
  05 Backend AI service             2--4 hari
  06 Generator dan mapping          4--6 hari
  07 Integrasi, storage, export     4--6 hari
  08 Hardening dan UAT              3--5 hari

**Estimasi kasar:** 22--35 hari kerja. Ini bukan komitmen tenggat;
integrasi Scratch dan hasil audit dapat mengubah estimasi.

------------------------------------------------------------------------



## 12. Riwayat Versi Dokumen

| Versi | Perubahan utama | Status |
|---|---|---|
| 1.1 | Rancangan awal arsitektur dan tahapan proyek | Digantikan |
| 1.2 | Penegasan nama kerja dan kebijakan logo dari pemilik proyek | Digantikan |
| 1.3 | Penegasan bahwa pekerjaan FE awal adalah desain UI/UX seluruh halaman di Google Stitch, terpisah dari coding FE | Digantikan |
| 1.4 | Finalisasi arah visual Modern Creative Workspace, komposisi editor, spesifikasi UI-01–UI-18, responsive/accessibility, Master Prompt Stitch, dan alur review desain | Versi acuan saat ini |

## 13. Status Dokumen dan Langkah Berikutnya

  Item                         Status
  ---------------------------- ---------------------------------------
  Nama produk final            Belum diputuskan
  Konsep hybrid AI + Scratch   Disepakati
  Target semua usia            Disepakati
  Penyimpanan lokal            Disepakati
  Gemini + Groq                Disepakati sebagai rancangan
  Google Stitch untuk UI/UX    Disepakati sebagai alat desain
  Stack FE/BE                  Diusulkan, mengikuti audit repository
  Implementation Plan v1.4  Final untuk spesifikasi; menunggu approval proyek
  Coding                       Belum diizinkan

### Langkah berikutnya

1.  Review dan setujui dokumen Implementation Plan.
2.  Setelah disetujui, mulai Tahap 01: audit repository.
3.  Setelah audit disetujui, lanjut Tahap 02: Google Stitch Design.
4.  Implementasi Frontend baru dimulai setelah desain dan rencana teknis
    disetujui secara eksplisit.

**Tidak ada coding yang diizinkan oleh dokumen ini. Versi 1.4 memfinalkan spesifikasi arah dan cakupan desain UI/UX untuk Google Stitch; persetujuan dokumen induk hanya mengizinkan dimulainya tahap berikutnya sesuai approval gate, bukan implementasi fitur.**
