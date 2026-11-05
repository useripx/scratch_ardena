# Checklist Eksekusi Terminal — Tahap 03 (Repository Baseline & Audit Lingkungan)

**Proyek:** Ardena Playground  
**Dokumen Acuan:** `Implementation_Plan_Ardena_Playground_v1.4.md` (Tahap 03)  
**Dokumen Output:** `Docs/tahap/tahap-03/Environment_Report.md` & `Docs/tahap/tahap-03/Baseline_Test_Report.md`  
**Status Gate:** `IN PROGRESS` (Tahap 03: Langkah 1 & 2)  

---

## 1. Aturan Disiplin Terminal (Zero Feature Modification)
- Jangan menambahkan dependensi pihak ketiga atau paket AI pada tahap ini.
- Jangan menjalankan `npm audit fix --force` atau memperbarui versi paket secara massal.
- Pastikan lingkungan menggunakan versi Node.js yang disyaratkan oleh berkas `.nvmrc` bawaan monorepo Scratch.

---

## 2. Rangkaian Perintah Terminal (Terminal Command Sequence)

### Bagian 1: Kloning & Penentuan Baseline Commit SHA
```bash
# 1. Kloning repository resmi monorepo scratch-editor
git clone https://github.com/scratchfoundation/scratch-editor.git ardena-playground
cd ardena-playground

# 2. Catat commit SHA dasar dan tag aktif saat clone
git status
git log -1 --format="Commit SHA: %H %nAuthor: %an <%ae>%nDate: %ad%nMessage: %s" > Docs/tahap/tahap-03/upstream_commit_info.txt
cat Docs/tahap/tahap-03/upstream_commit_info.txt

# 3. Kunci referensi commit ini sebagai titik tumpu (upstream/main atau baseline-clean)
git checkout -b baseline-clean
git tag -a baseline-v1.0 -m "Baseline bersih sebelum integrasi Ardena Playground"
```

### Bagian 2: Audit Lingkungan Runtime & Node.js Versioning
```bash
# 4. Periksa rekomendasi versi Node.js dari manifesto monorepo
cat .nvmrc || cat .node-version || echo "File .nvmrc tidak ditemukan di root"

# 5. Aktifkan versi Node.js yang sesuai via NVM
nvm install $(cat .nvmrc 2>/dev/null || echo "18")
nvm use $(cat .nvmrc 2>/dev/null || echo "18")

# 6. Audit versi aktif Node.js, npm, dan Git
node -v
npm -v
git --version
```

### Bagian 3: Audit Manifesto & Struktur Monorepo Workspaces
```bash
# 7. Audit file package.json root dan lockfile
head -n 35 package.json

# 8. Verifikasi konfigurasi workspaces (Lerna / npm workspaces)
ls -la packages/
# Output diharapkan mencakup:
# - packages/scratch-gui
# - packages/scratch-vm
# - packages/scratch-render
# - packages/scratch-paint (jika ada)

# 9. Jalankan instalasi bersih (Clean Install) menggunakan lockfile asli
npm ci
# Catatan: Jika monorepo menggunakan bootstrap script khusus:
# npm run bootstrap (jika ada di package.json)
```

### Bagian 4: Verifikasi Build & Jalankan Dev Server (Smoke Test)
```bash
# 10. Jalankan kompilasi awal baseline
npm run build

# 11. Jalankan development server untuk paket GUI
npm start
# Buka http://localhost:8601 di peramban untuk verifikasi visual dasar (Smoke Test)
```

### Bagian 5: Baseline Test Suite Execution
```bash
# 12. Jalankan test otomatis dan rekam hasil ke file log
npm test > test_output.log 2>&1 || true
npm run lint > lint_output.log 2>&1 || true

# Salin output ke dokumen pelaporan
mkdir -p Docs/tahap/tahap-03
mv test_output.log Docs/tahap/tahap-03/baseline_unit_test.log
mv lint_output.log Docs/tahap/tahap-03/baseline_lint.log
```

---

## 3. Matriks Checklist Verifikasi Eksekusi

| No | Langkah Verifikasi | Kriteria Sukses | Status Eksekusi |
|---|---|---|---|
| 1 | `git clone` & Commit Lock | Commit SHA upstream tercatat di `Environment_Report.md` | `[ ] Siap Dieksekusi` |
| 2 | Runtime Audit (.nvmrc) | Node.js & npm cocok dengan manifesto Scratch | `[ ] Siap Dieksekusi` |
| 3 | `npm ci` (Clean Install) | Semua workspace packages terhubung tanpa error link | `[ ] Siap Dieksekusi` |
| 4 | `npm run build` | Bundle Webpack dist terkompilasi | `[ ] Siap Dieksekusi` |
| 5 | Smoke Test localhost:8601 | Workspace blok & Stage render sprite default | `[ ] Siap Dieksekusi` |
| 6 | Unit Test & Lint Log | Seluruh status lulus/gagal baseline terekam rapi | `[ ] Siap Dieksekusi` |
| 7 | Branch `ardena/develop` | Branch kerja siap untuk coding Tahap 04 | `[ ] Siap Dieksekusi` |

---

## 4. Persiapan Berkas Laporan Luaran (`Environment_Report.md`)

Setelah eksekusi perintah terminal di atas selesai, isi template ringkasan di bawah ini ke dalam `Docs/tahap/tahap-03/Environment_Report.md`:

```markdown
# Environment Report — Tahap 03 (Ardena Playground)

- Tanggal Eksekusi: [Tanggal]
- Repository URL: https://github.com/scratchfoundation/scratch-editor
- Upstream Commit SHA: [Contoh: a1b2c3d4e5f6...]
- Versi Node.js: [Contoh: v18.x / v20.x]
- Versi npm: [Contoh: 9.x / 10.x]
- Status npm ci: BERHASIL (Tanpa modifikasi lockfile)
- Status Webpack Build: BERHASIL
- Status Dev Server (localhost:8601): BERHASIL (Sprite dan stage berfungsi)
- Test Suite Baseline:
  - Unit Tests: [X pass, Y fail upstream]
  - Linting: [X warning, Y error upstream]
```
