# SPK Balita Sehat

**Sistem Pendukung Keputusan Pemantauan Pertumbuhan & Tumbuh Kembang Balita**
*Berbasis React, JavaScript, Tailwind CSS, Supabase, dan Integrasi Metode AHP + SAW*

---

## 1. Ikhtisar Aplikasi

**SPK Balita Sehat** adalah aplikasi web healthcare terintegrasi yang dirancang untuk menghubungkan **Orang Tua**, **Petugas Posyandu / Tenaga Kesehatan (Bidan/Kader)**, serta **Administrator Sistem**.

Sistem ini berfungsi sebagai alat bantu pencatatan antropometri, pemantauan kurva pertumbuhan berkala, dan pendukung keputusan prioritas pembinaan balita berbasis metode multi-kriteria:
1. **Analytic Hierarchy Process (AHP)**: Menghasilkan bobot prioritas kriteria klinis teruji dengan pengujian rasio konsistensi Saaty ($CR \le 0.10$).
2. **Simple Additive Weighting (SAW)**: Menghitung skor preferensi ($V_i$) dan pemeringkatan alternatif balita dalam kelompok kelahiran dan periode penimbangan yang sama.

> [!IMPORTANT]
> **Pemberitahuan Medis Resmi:**
> SPK Balita Sehat adalah instrumen skrining dan pendukung keputusan administratif Posyandu. Skor SAW dan pemeringkatan SPK **BUKAN pengganti diagnosis medis resmi dokter anak**. Penegakan diagnosis klinis tetap mengacu pada pemeriksaan dokter di Puskesmas atau fasilitas kesehatan berwenang.

---

## 2. Fitur Utama Berdasarkan Peran

### A. Portal Orang Tua
- **Autentikasi & Registrasi**: Pendaftaran akun aman dengan validasi NIK 16 digit Indonesia.
- **Pendaftaran Balita**: Mendaftarkan data anak ke Posyandu terdekat (status awal: `pending_registration`).
- **Daftar & Profil Balita**: Menampilkan kartu balita, usia aktual (tahun dan bulan), status pendaftaran.
- **Ringkasan Pemeriksaan Terbaru**: Nilai pengukuran fisik 6 kriteria, skor SPK, catatan petugas.
- **Grafik Pertumbuhan Berkala**: Kurva kenaikan Berat Badan (kg) dan Tinggi Badan (cm) dari kunjungan ke kunjungan (terpisah dari skor SAW).
- **Riwayat Pemeriksaan Permanen**: Seluruh kunjungan tersimpan permanen tanpa saling menimpa (*immutable records*).
- **Rekomendasi Edukasi Terstruktur**: Panduan gizi, jadwal Posyandu, dan arahan stimulasi KIA.
- **Layanan Konsultasi**: Fitur tanya jawab langsung dengan Bidan Posyandu.

### B. Portal Petugas Posyandu / Nakes
- **Dashboard Operasional**: Metrik real-time pendaftaran baru, draf pemeriksaan, menunggu verifikasi, dan balita perlu evaluasi.
- **Antrean Verifikasi Pendaftaran**: Konfirmasi kedatangan fisik balita pertama kali di Posyandu.
- **Form Pencatatan 6 Kriteria**: Input Berat Badan, Tinggi Badan, Lingkar Kepala, LiLA, Imunisasi, dan Frekuensi Sakit dengan batas validasi antropometri.
- **Verifikasi & Hitung SAW**: Prosedur validasi pemeriksaan aman dan penghitungan ranking SPK secara idempotent.
- **Kelompok Tahun Kelahiran (Cohorts)**: Pengelompokan dinamis cohort balita (Kelahiran 2024, 2025, dst) dan penegakan isolasi periode agar alternatif tidak tercampur.
- **Hasil & Transparansi SPK**: Tabel ranking SAW lengkap dengan matriks keputusan, matriks normalisasi ($r_{ij}$), dan kontribusi bobot kriteria.
- **Manajemen Konsultasi**: Merespons pertanyaan kesehatan dari orang tua dan menandai konsultasi selesai.

### C. Portal Administrator
- **Pusat Kontrol Sistem**: Ringkasan pengguna, posyandu, balita, dan log aktivitas.
- **Manajemen Pengguna & Hak Akses**: Pengaturan peran pengguna (`parent`, `staff`, `admin`) dengan audit trail.
- **Manajemen Posyandu**: Pengelolaan data fasilitas dan lokasi pos penimbangan.
- **Editor Matriks AHP 6x6 Interaktif**: Pengaturan perbandingan berpasangan kriteria dengan kalkulator otomatis $\lambda_{max}$, $CI$, $CR$, dan acuan Saaty Random Index ($RI = 1.24$).
- **Log Audit & Keamanan**: Pemantauan rekam jejak setiap aksi penting (verifikasi medis, pembaruan konfigurasi, login).

---

## 3. Enam Kriteria Standar Pemantauan

| Kode | Nama Kriteria | Satuan | Tipe (Arah) | Rentang Validasi | Bobot AHP Teruji |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **C1** | Berat Badan (BB) | kg | Benefit | 2.0 – 30.0 kg | **34.5%** (0.344865) |
| **C2** | Tinggi / Panjang Badan (TB) | cm | Benefit | 45.0 – 130.0 cm | **23.5%** (0.234685) |
| **C3** | Lingkar Kepala (LK) | cm | Benefit | 30.0 – 60.0 cm | **13.8%** (0.138239) |
| **C4** | Lingkar Lengan Atas (LiLA) | cm | Benefit | 9.0 – 25.0 cm | **14.8%** (0.148240) |
| **C5** | Kelengkapan Imunisasi Dasar | % | Benefit | 0 – 100 % | **8.2%** (0.081768) |
| **C6** | Frekuensi Sakit (6 Bln Terakhir) | kali | Cost | 0 – 15 kali | **5.2%** (0.052203) |

> **Uji Konsistensi AHP:**  
> $\lambda_{max} = 6.092823$, $CI = 0.018565$, $RI = 1.24$ ($n=6$)  
> $CR = \frac{CI}{RI} = 0.014971 \le 0.10$ (**Matriks Konsisten**)

---

## 4. Cara Menjalankan Aplikasi Secara Lokal

### Prasyarat
- Node.js versi 18+ (disarankan Node.js v20+)
- npm versi 9+

### Langkah Instalasi
```bash
# 1. Masuk ke direktori proyek
cd c:/SPK

# 2. Pasang seluruh dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev
```

Aplikasi dapat dibuka melalui browser di: `http://localhost:5173/`

### Pengujian Otomatis Formula SPK (AHP + SAW)
Jalankan pengujian unit matematika untuk memastikan formula AHP, normalisasi SAW, penanganan nilai nol pada cost, dan isolasi cohort berjalan akurat:
```bash
node src/lib/spk/spk.test.js
```

### Build Produksi
```bash
npm run build
```

---

## 5. Konfigurasi Database Supabase

Aplikasi dilengkapi modul PostgreSQL dan Row Level Security (RLS) di direktori `supabase/`:
- **File Skema & RLS**: `supabase/migrations/20261019000000_create_spk_balita_sehat_schema.sql`
- **File Data Awal (Seed)**: `supabase/seed.sql`

### Langkah Menghubungkan Supabase Cloud:
1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Buka menu **SQL Editor**, salin dan jalankan isi file `supabase/migrations/20261019000000_create_spk_balita_sehat_schema.sql`.
3. Jalankan isi file `supabase/seed.sql` untuk mengisi data awal Posyandu, 6 kriteria, dan konfigurasi AHP aktif.
4. Salin URL proyek dan Kunci Anon Publik dari menu **Project Settings -> API**.
5. Buat file `.env` di root direktori proyek:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```
6. Jalankan ulang dev server (`npm run dev`). Aplikasi akan otomatis beralih ke Supabase Auth & PostgreSQL Cloud!

---

## 6. Akun Demo Pengujian Cepat

Jika Supabase belum dihubungkan ke cloud, aplikasi secara otomatis menyediakan mode demo offline interaktif dengan tombol uji coba 1-klik di halaman login atau melalui *Role Switcher* di navbar:

| Peran | Email Demo | Password Demo | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Orang Tua** | `orangtua@spkbalita.id` | `demo123456` | Dashboard Anak, Profil, Grafik, Konsultasi |
| **Petugas Posyandu** | `petugas@spkbalita.id` | `demo123456` | Verifikasi Pendaftaran, Catat Pemeriksaan, Hitung SAW |
| **Administrator** | `admin@spkbalita.id` | `demo123456` | Manajemen Akun, Posyandu, Editor AHP, Audit Logs |

---

## 7. Struktur Direktori Proyek

```
c:/SPK/
├── src/
│   ├── app/
│   │   ├── App.jsx              # Root component dengan Router & AuthProvider
│   │   └── router.jsx           # Rute navigasi & role guards
│   ├── components/
│   │   ├── layout/              # Navbar, Sidebar, AppLayout
│   │   └── ui/                  # StatusBadge, SummaryCard, Modal, EmptyState, LoadingState
│   ├── context/
│   │   └── AuthContext.jsx      # Autentikasi multi-peran & state sesi
│   ├── lib/
│   │   ├── health/
│   │   │   └── statusRules.js   # Evaluasi status klinis KIA & rekomendasi edukasi
│   │   ├── spk/
│   │   │   ├── ahp.js           # Mesin hitung AHP & rasio konsistensi Saaty
│   │   │   ├── saw.js           # Mesin normalisasi SAW & tie-breaking ranking
│   │   │   └── spk.test.js      # Pengujian matematika AHP & SAW
│   │   ├── mockData.js          # Dataset mock realistis untuk demo offline
│   │   └── supabase.js          # Inisialisasi client Supabase
│   ├── pages/
│   │   ├── admin/               # Dashboard Admin, Users, Posyandu, AHP Editor, Audit
│   │   ├── auth/                # Login & Registrasi Orang Tua
│   │   ├── parent/              # Dashboard Orang Tua, Tambah Anak, Profil, Grafik, Chat
│   │   └── staff/               # Dashboard Nakes, Antrean, Form 6 Kriteria, Cohorts, SPK
│   ├── services/                # authService, childService, examService, spkService, etc.
│   ├── index.css                # Tailwind CSS imports & healthcare aesthetic tokens
│   └── main.jsx                 # Entry point React
├── supabase/
│   ├── migrations/              # Skema PostgreSQL lengkap + RLS + Stored Procedures
│   └── seed.sql                 # Data seed awal Posyandu, 6 kriteria, & AHP V1
├── .env.example                 # Template variabel lingkungan frontend
├── package.json
└── vite.config.js
```
