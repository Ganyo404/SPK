# SPK Balita Sehat — Technical Architecture & Implementation Documentation

Sistem Pendukung Keputusan (SPK) Pemantauan Pertumbuhan dan Tumbuh Kembang Balita Posyandu berbasis Web dengan integrasi metode **Analytic Hierarchy Process (AHP)** dan **Simple Additive Weighting (SAW)**, disesuaikan dengan **Permenkes RI No. 2 Tahun 2020**, **WHO Child Growth Standards**, dan pedoman pemberian makan bayi/anak **WHO/UNICEF (MDD & MMF)**.

---

## DAFTAR ISI
1. [Arsitektur & Prinsip Rekayasa Perangkat Lunak](#1-arsitektur--prinsip-rekayasa-perangkat-lunak)
2. [Spesifikasi Teknologi](#2-spesifikasi-teknologi)
3. [Implementasi Matematika & Algoritma SPK](#3-implementasi-matematika--algoritma-spk)
   - [A. Standarisasi Nilai Kriteria (K1 - K5)](#a-standarisasi-nilai-kriteria-k1---k5)
   - [B. Analytic Hierarchy Process (AHP) — Pembobotan Kriteria](#b-analytic-hierarchy-process-ahp--pembobotan-kriteria)
   - [C. Simple Additive Weighting (SAW) — Perankingan Alternatif](#c-simple-additive-weighting-saw--perankingan-alternatif)
   - [D. Aturan Isolasi Kohor, Periode, & Gender](#d-aturan-isolasi-kohor-periode--gender)
4. [Arsitektur Basis Data & Keamanan (PostgreSQL + RLS)](#4-arsitektur-basis-data--keamanan-postgresql--rls)
   - [A. Relasi Entitas & Skema Tabel](#a-relasi-entitas--skema-tabel)
   - [B. Matriks Hak Akses Row Level Security (RLS)](#b-matriks-hak-akses-row-level-security-rls)
   - [C. Prosedur Tersimpan & Triggers](#c-prosedur-tersimpan--triggers)
5. [Struktur Direktori & Rincian Modul Kode](#5-struktur-direktori--rincian-modul-kode)
6. [Alur Data & Siklus Hidup Pemeriksaan (State Machine)](#6-alur-data--siklus-hidup-pemeriksaan-state-machine)
7. [Aturan Skrining KIA & Penafian Medis](#7-aturan-skrining-kia--penafian-medis)
8. [Dokumentasi Tangkapan Layar Resmi (Folder screenshoot/)](#8-dokumentasi-tangkapan-layar-resmi-folder-screenshoot)
9. [Panduan Langkah Demi Langkah Push ke GitHub](#9-panduan-langkah-demi-langkah-push-ke-github)
10. [Panduan Instalasi & Eksekusi Lokal](#10-panduan-instalasi--eksekusi-lokal)

---

## 1. Arsitektur & Prinsip Rekayasa Perangkat Lunak

Aplikasi dibangun menggunakan pola **Layered Architecture** dengan pemisahan tanggung jawab (*Separation of Concerns*) yang ketat:

```
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
│   React 19 Components (Pages, Layouts, UI Elements, Charts) │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    State & Context Layer                    │
│      AuthContext (Session, User Role, Reactive Switcher)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                        Service Layer                        │
│   authService, childService, examService, spkService, etc.  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│     Core Mathematical Lib   ││      Data Provider Layer     │
│   src/lib/spk/ahp.js        ││   Supabase Client (Cloud)    │
│   src/lib/spk/saw.js        ││             OR               │
│   src/lib/spk/scoring...js  ││  Local In-Memory Mock Store  │
│   src/lib/health/rules.js   ││                              │
└─────────────────────────────┘└──────────────────────────────┘
```

### Prinsip Utama yang Diterapkan:
1. **Single Source of Truth Multi-Role**: Satu basis kode React menangani tiga peran (`parent`, `staff`, `admin`) dengan *route guards* terisolasi dan antarmuka khusus tanpa membagi aplikasi menjadi tiga proyek terpisah.
2. **Immutable Clinical Visits**: Nilai pemeriksaan baru tidak pernah menimpa catatan sebelumnya. Setiap kunjungan adalah entri rekam antropometri unik (`examinations` + `examination_details`) yang mempertahankan riwayat historis longitudinal.
3. **Idempotent Verification**: Verifikasi pemeriksaan fisik oleh tenaga kesehatan dirancang dengan proteksi idempotensi pada level server database guna mencegah duplikasi eksekusi atau penghitungan ganda.
4. **Dual Provider Agnostic**: Lapisan layanan (*Service Layer*) secara transparan mendeteksi ketersediaan kredensial Supabase. Jika variabel lingkungan belum diisi, aplikasi beralih ke *reactive mock data provider* tanpa mengalami *crash* atau *runtime error*.
5. **Diferensiasi Kriteria Berbasis Usia**: Sistem secara otomatis mengaktifkan model 5 kriteria untuk baduta usia 6–23 bulan (evaluasi asupan makanan MDD & MMF) dan model 4 kriteria untuk usia di luar itu (<6 bulan & 24–59 bulan).

---

## 2. Spesifikasi Teknologi

| Komponen | Pustaka / Alat | Versi | Alasan Pemilihan & Kegunaan |
| :--- | :--- | :--- | :--- |
| **Framework UI** | React | `^19.3.1` | Pustaka antarmuka deklaratif berbasis komponen modular modern. |
| **Build Tool** | Vite | `^8.3.4` | Server dev berbasis native ESM instan & bundler produksi cepat. |
| **Bahasa** | JavaScript (ESM) | ES2022+ | Menghindari kompleksitas *type boilerplate* sesuai spesifikasi proyek. |
| **Styling** | Tailwind CSS | `@tailwindcss/vite` (v4) | Desain atomik utilitas tanpa overhead CSS runtime; tema healthcare *teal-cyan*. |
| **Routing** | React Router DOM | `^7.x` | Manajemen navigasi bersarang (*nested routing*) dan proteksi rute peran. |
| **Grafik** | Recharts | `^2.15.x` | Kurva visualisasi antropometri (BB & TB) berbasis SVG responsif. |
| **Ikonografi** | Lucide React | `^1.16.x` | Kumpulan ikon grafis antarmuka medis dan dashboard yang seragam. |
| **Database & Auth** | Supabase JS Client | `^2.49.x` | Klien resmi Supabase Auth, PostgreSQL, RPC, dan Row Level Security. |

---

## 3. Implementasi Matematika & Algoritma SPK

Sistem menggabungkan metode **AHP** (untuk pembobotan objektif kriteria) dan **SAW** (untuk penskoran dan pemeringkatan alternatif balita).

### A. Standarisasi Nilai Kriteria (K1 - K5)

Diimplementasikan pada modul [`src/lib/spk/scoringStandard.js`](file:///c:/SPK/src/lib/spk/scoringStandard.js).

1. **K1: Berat Badan menurut Umur (BB/U)**: Nilai riil (kg) dikonversi ke skor ordinal 1–4 berdasarkan Z-score Permenkes No. 2/2020 (Skor 4: Normal/Ideal -2 s.d +1 SD; Skor 3: Risiko BB Lebih; Skor 2: BB Kurang/Lebih; Skor 1: BB Sangat Kurang/Obesitas).
2. **K2: Tinggi/Panjang Badan menurut Umur (PB/TB)**: Nilai riil (cm) dikonversi ke skor ordinal 1–4 (Skor 4: Normal -2 s.d +2 SD; Skor 3: Tinggi; Skor 2: Pendek/Stunted; Skor 1: Sangat Pendek).
3. **K3: Lingkar Kepala menurut Umur (LK/U)**: Nilai riil (cm) dikonversi ke skor ordinal 1–4 (Skor 4: Normal -2 s.d +2 SD; Skor 2: Batas Bawah/Atas; Skor 1: Mikrosefali/Makrosefali).
4. **K4: Riwayat Imunisasi**: Berdasarkan jumlah dosis kumulatif riil (0–17 dosis) terhadap target ideal rentang usia balita (target 6 dosis pada 0–2 bulan, 15 dosis pada 3–8 bulan, dan 17 dosis pada $\ge 9$ bulan).
5. **K5: Asupan Makanan Balita (MDD & MMF WHO/UNICEF)**: Khusus balita usia 6–23 bulan.
   - **MDD**: Mengukur konsumsi 8 kelompok makanan 24 jam terakhir. Ambang $\ge 5$ kelompok $\implies \text{MDD} = 1$, jika $< 5 \implies \text{MDD} = 0$.
   - **MMF**: Frekuensi makan makanan padat/semi-padat/lunak (untuk balita masih ASI: $\ge 2\times$ pada 6–8 bln, $\ge 3\times$ pada 9–23 bln; untuk non-ASI: $\ge 4\times$ total termasuk susu dan $\ge 1\times$ makanan padat). Memenuhi ambang $\implies \text{MMF} = 1$, jika tidak $\implies \text{MMF} = 0$.
   - **Komposit K5**:
     $$K_5 = \frac{\text{MDD} + \text{MMF}}{2} \in \{0.0, \; 0.5, \; 1.0\}$$
     Nilai ini secara matematis sudah berada pada rentang skala normalisasi $0 \le r_{i5} \le 1$.

---

### B. Analytic Hierarchy Process (AHP) — Pembobotan Kriteria

Diimplementasikan pada modul [`src/lib/spk/ahp.js`](file:///c:/SPK/src/lib/spk/ahp.js).

#### 1. Matriks Perbandingan Berpasangan Baku
- **Model 5 Kriteria Baku (Usia 6–23 Bulan)**:
  $$\begin{array}{c|ccccc}
   & \text{K1 (BB)} & \text{K2 (TB)} & \text{K3 (LK)} & \text{K4 (Imun)} & \text{K5 (Makan)} \\
  \hline
  \text{K1} & 1.000 & 1.000 & 1.450 & 0.290 & 0.500 \\
  \text{K2} & 1.000 & 1.000 & 1.450 & 0.290 & 0.500 \\
  \text{K3} & 0.690 & 0.690 & 1.000 & 0.200 & 0.345 \\
  \text{K4} & 3.448 & 3.448 & 5.000 & 1.000 & 1.723 \\
  \text{K5} & 2.000 & 2.000 & 2.900 & 0.580 & 1.000
  \end{array}$$
  Hasil: $\lambda_{\max} = 5.000136, \; CI = 0.000034, \; CR = 0.000030 \le 0.10$ (**Konsisten**).  
  Bobot: $w = [0.122887, \; 0.122887, \; 0.084775, \; 0.423678, \; 0.245774]$.

- **Model 4 Kriteria Baku (Usia < 6 Bulan & $\ge 24$ Bulan)**:
  K5 tidak aktif, bobot kriteria K1–K4 dinormalisasi ulang hingga $100\%$:
  $$\lambda_{\max} = 4.000210, \; CI = 0.000070, \; CR = 0.000078 \le 0.10 \text{ (Konsisten)}$$
  Bobot: $w = [0.162920, \; 0.162920, \; 0.112387, \; 0.561772]$.

---

### C. Simple Additive Weighting (SAW) — Perankingan Alternatif

Diimplementasikan pada modul [`src/lib/spk/saw.js`](file:///c:/SPK/src/lib/spk/saw.js).

#### 1. Aturan Normalisasi Matriks ($R$)
- Untuk kriteria fisik dan imunisasi ($K_1, K_2, K_3, K_4$):
  $$r_{ij} = \frac{x_{ij}}{\max_k(x_{kj})} = \frac{x_{ij}}{4}$$
- Untuk kriteria asupan makanan ($K_5$):
  $$r_{i5} = K_5 \quad (0.0, \; 0.5, \; \text{atau } 1.0)$$
  *Nilai $K_5$ tidak dibagi dengan max sampel agar hasil tidak terdistorsi ketika seluruh sampel balita memiliki $K_5 < 1.0$.*

#### 2. Nilai Preferensi ($V_i$) & Peringkat
$$V_i = \sum_{j=1}^n w_j \cdot r_{ij}$$
Peringkat menggunakan aturan **Standard Competition Ranking (1224)** dengan tie-breaker deterministik stabil berdasarkan nama balita alfabetis dan keunikan ID balita.

---

### D. Aturan Isolasi Kohor, Periode, & Gender

Sistem memvalidasi dan memisahkan eksekusi SAW secara ketat:
1. **8 Master Kelompok Umur Posyandu**: $R1$ (0–2 bln), $R2$ (3–5 bln), $R3$ (6–8 bln), $R4$ (9–11 bln), $R5$ (12–23 bln), $R6$ (24–35 bln), $R7$ (36–47 bln), $R8$ (48–59 bln).
2. **Isolasi Periode (YYYY-MM)**: Memastikan balita hanya dinilai bersama balita lain pada bulan pemeriksaan yang sama.
3. **Isolasi Gender**: Tersedia filter All, Laki-Laki, dan Perempuan sesuai standar kurva pertumbuhan WHO.
4. **Pencegahan Duplikasi**: Setiap anak hanya boleh memiliki 1 catatan rekam medis acuan per periode bulanan.

---

## 4. Arsitektur Basis Data & Keamanan (PostgreSQL + RLS + Supabase Cloud)

Aplikasi telah terhubung secara penuh ke database cloud **Supabase PostgreSQL** (`VITE_USE_SUPABASE=true`) dengan 13 tabel relasional, fungsi stored procedure RPC (`verify_examination`), dan kebijakan keamanan ketat Row Level Security (RLS).

Berkas migrasi SQL lengkap yang memuat skema, fungsi, dan data benih teruji:
- Skrip migrasi terpusat: [`supabase/MIGRASI_LENGKAP_SUPABASE.sql`](file:///c:/SPK/supabase/MIGRASI_LENGKAP_SUPABASE.sql)
- Skrip validasi integritas cloud: [`scripts/verify_supabase_full.js`](file:///c:/SPK/scripts/verify_supabase_full.js)
- Skema migrasi bertahap: [`supabase/migrations/20261019000000_create_spk_balita_sehat_schema.sql`](file:///c:/SPK/supabase/migrations/20261019000000_create_spk_balita_sehat_schema.sql)

### A. Relasi Entitas & Skema Tabel

```
auth.users ──────1:1──────> public.profiles (role: parent, staff, admin)
                                 │
                                 ├──1:N──> public.children (parent_id)
                                 │              │
                                 │              ├──1:N──> public.examinations (child_id)
                                 │              │              │
                                 │              │              ├──1:N──> public.examination_details
                                 │              │              └──1:1──> public.spk_results
                                 │              │
                                 │              └──1:N──> public.consultations (child_id)
                                 │                             │
                                 │                             └──1:N──> public.consultation_messages
                                 │
                                 └──1:N──> public.audit_logs (actor_id)

public.posyandu ──1:N──> public.staff_assignments (staff_id -> profiles)
                ──1:N──> public.children (posyandu_id)

public.criteria ──1:N──> public.examination_details (criterion_id)
public.ahp_configurations ──1:N──> public.spk_runs (ahp_configuration_id)
public.spk_runs ──1:N──> public.spk_results (spk_run_id)
```

### B. Matriks Hak Akses Row Level Security (RLS)

| Tabel | Role Orang Tua (`parent`) | Role Petugas (`staff`) | Role Admin (`admin`) |
| :--- | :--- | :--- | :--- |
| `profiles` | `SELECT` / `UPDATE` profil sendiri | `SELECT` seluruh profil pengguna | `ALL` (Akses penuh) |
| `children` | `SELECT` anak sendiri, `INSERT` anak sendiri | `SELECT` & `UPDATE` status anak | `ALL` |
| `examinations` | `SELECT` hanya yang berstatus `verified` miliknya | `SELECT`, `INSERT` draft, `UPDATE` draft | `SELECT` seluruh pemeriksaan |
| `examination_details`| `SELECT` rincian anak sendiri yang terverifikasi | `ALL` untuk pemeriksaan | `SELECT` |
| `spk_runs` / `results`| `SELECT` skor balita miliknya | `SELECT` & `INSERT` hasil SPK kohor | `SELECT` & `INSERT` |
| `ahp_configurations`| `SELECT` konfigurasi berstatus `active` | `SELECT` konfigurasi aktif | `ALL` (Dapat membuat versi baru) |
| `audit_logs` | Ditolak (`NO ACCESS`) | Ditolak (`NO ACCESS`) | `SELECT` (Audit penuh) |

---

## 5. Struktur Direktori & Rincian Modul Kode

```
c:/SPK/
├── screenshoot/                        # Tangkapan layar resmi untuk laporan/skripsi
│   ├── Gambar 3. Antarmuka pencatatan indikator pemeriksaan balita.png
│   ├── Gambar 4. Antarmuka pembobotan kriteria menggunakan metode AHP.png
│   ├── Gambar 5. Hasil pemeringkatan alternatif balita menggunakan SAW.png
│   ├── Gambar 6. Rincian normalisasi dan perhitungan nilai preferensi.png
│   └── Gambar 6b. Rincian kontribusi bobot alternatif SAW.png
├── src/
│   ├── app/
│   │   ├── App.jsx                     # Provider wrapper (BrowserRouter + AuthProvider)
│   │   └── router.jsx                  # Rute navigasi, Role Guards, & Root Redirect
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx           # Shell responsive layout + disclaimer footer
│   │   │   ├── Navbar.jsx              # Top header, role switcher badge, & logout
│   │   │   └── Sidebar.jsx             # Fixed/sticky navigation menu
│   │   └── ui/
│   │       ├── StatusBadge.jsx         # Status badge pendaftaran, verifikasi, & KIA
│   │       ├── SummaryCard.jsx         # Kartu analitik metrik dashboard interaktif
│   │       ├── Modal.jsx               # Dialog modal dengan focus trap & backdrop dismiss
│   │       ├── EmptyState.jsx          # Placeholder visual saat koleksi kosong
│   │       └── LoadingState.jsx        # Spinner indikator proses asinkron
│   ├── context/
│   │   └── AuthContext.jsx             # State autentikasi sesi, profil, dan switchRole helper
│   ├── lib/
│   │   ├── health/
│   │   │   └── statusRules.js          # Skrining status klinis KIA & rekomendasi gizi
│   │   ├── spk/
│   │   │   ├── ahp.js                  # Engine AHP murni (matriks, eigen, CR Saaty)
│   │   │   ├── saw.js                  # Engine SAW murni (benefit normalisasi & ranking)
│   │   │   ├── scoringStandard.js      # Konversi Z-score, dosis imunisasi, MDD, MMF, & K5
│   │   │   └── spk.test.js             # Skrip automated test matematika 10 skenario
│   │   ├── mockData.js                 # Dataset realistis balita Posyandu untuk testing
│   │   └── supabase.js                 # Klien Supabase & validator konfigurasi env
│   ├── pages/
│   │   ├── admin/                      # Halaman kontrol Administrator
│   │   │   ├── AdminDashboard.jsx      # Metrik sistem dan ringkasan operasional
│   │   │   ├── AHPConfigPage.jsx       # Editor interaktif matriks AHP 5x5/4x4 & kalkulator CR
│   │   │   ├── AuditLogsPage.jsx       # Tabel audit trail peristiwa sistem
│   │   │   ├── PosyanduManagementPage.jsx # Pendaftaran fasilitas Posyandu
│   │   │   └── UserManagementPage.jsx  # Tabel pengguna & pengubah peran
│   │   ├── auth/                       # Halaman Autentikasi
│   │   │   ├── LoginPage.jsx           # Form login & tombol uji coba 1-klik peran
│   │   │   └── RegisterPage.jsx        # Registrasi orang tua dengan validasi 16 digit NIK
│   │   ├── parent/                     # Halaman Orang Tua
│   │   │   ├── AddChildModal.jsx       # Modal tambah anak balita
│   │   │   ├── ChildProfilePage.jsx    # Profil balita, kriteria, kurva Recharts, riwayat
│   │   │   ├── ChildrenListPage.jsx    # Direktori pencarian anak terdaftar
│   │   │   ├── ParentConsultationPage.jsx # Chat tanya jawab konsultasi Bidan
│   │   │   ├── ParentDashboard.jsx     # Dashboard kartu anak orang tua
│   │   │   └── ParentProfilePage.jsx   # Informasi profil akun orang tua
│   │   └── staff/                      # Halaman Petugas Posyandu / Nakes
│   │       ├── BirthYearGroupsPage.jsx # Pengelompokan kohor tahun kelahiran
│   │       ├── ChildRegistrationQueue.jsx # Verifikasi kedatangan fisik anak baru
│   │       ├── ExaminationFormPage.jsx # Form pencatatan K1–K4 (2x2) dan K5 (MDD/MMF)
│   │       ├── PendingExaminationsPage.jsx # Draf pemeriksaan menunggu verifikasi
│   │       ├── SPKCalculationPage.jsx  # Eksekusi AHP+SAW, transparansi matriks, & ranking
│   │       ├── StaffConsultationPage.jsx # Balasan konsultasi oleh nakes
│   │       └── StaffDashboard.jsx      # Metrik operasional balita & kartu filter interaktif
│   ├── services/                       # Lapisan abstraksi data (Service Layer)
│   │   ├── adminService.js             # Layanan pengguna, posyandu, dan audit
│   │   ├── authService.js              # Layanan autentikasi, registrasi, & session
│   │   ├── childService.js             # Layanan CRUD anak & status pendaftaran
│   │   ├── consultationService.js      # Layanan percakapan pesan konsultasi
│   │   ├── examinationService.js       # Layanan pencatatan, draf, & verifikasi kunjungan
│   │   └── spkService.js               # Layanan orkestrator kalkulasi AHP + SAW kohor
│   ├── index.css                       # Impor Tailwind CSS & custom styling
│   └── main.jsx                        # Entry point React DOM
├── scripts/                            # Skrip utilitas verifikasi & automasi
│   ├── verify_supabase_full.js         # Pengujian integritas live database Supabase
│   ├── test_14_balita.js               # Pengujian validasi matematis 14 balita benchmark
│   └── capture.js                      # Pengambilan tangkapan layar otomatis
├── supabase/
│   ├── MIGRASI_LENGKAP_SUPABASE.sql    # Skrip SQL lengkap (13 tabel, RLS, RPC, data acuan)
│   ├── migrations/
│   │   └── 20261019000000_create_spk_balita_sehat_schema.sql # Skema PostgreSQL & RLS
│   └── seed.sql                        # Data benih Posyandu, kriteria, & AHP V1
├── package.json
└── vite.config.js
```

---

## 6. Alur Data & Siklus Hidup Pemeriksaan (State Machine)

```
[Orang Tua: Tambah Anak]
          │
          ▼
   (Status: pending_registration)
          │
          │ (Balita dibawa ke Posyandu)
          ▼
[Petugas: Verifikasi Kehadiran]
          │
          ▼
   (Status Anak: active)
          │
          │ (Petugas mengukur BB, TB, LK, Dosis Imunisasi, Asupan MDD/MMF)
          ▼
[Petugas: Simpan Kunjungan] ─── Simpan Draf ───> (Status Pemeriksaan: draft)
          │                                                    │
          ▼ (Verifikasi & Hitung SAW)                          │
   (Status Pemeriksaan: verified) <────────────────────────────┘
          │
          ├──> Evaluasi Model (Model 5 Kriteria vs Model 4 Kriteria)
          ├──> Hitung Normalisasi SAW & Nilai Preferensi (Vi)
          ├──> Tentukan Status Klinis (Normal vs Perlu Tinjau)
          │
          ├──> Tampil di Profil Balita Orang Tua (Grafik Recharts + Riwayat Kunjungan)
          └──> Catat Peristiwa ke audit_logs
```

---

## 7. Aturan Skrining KIA & Penafian Medis

Diimplementasikan pada modul [`src/lib/health/statusRules.js`](file:///c:/SPK/src/lib/health/statusRules.js).

### Kategori Status Tumbuh Kembang:
1. **Perlu Tinjau / Evaluasi**: Terpicu jika terdapat indikator fisik dengan skor $\le 2$ (BB kurang/lebih, stunting, mikrosefali/makrosefali), kelengkapan imunisasi $\le 2$ (kurang/belum), atau komposit asupan makanan $K5 = 0.0$ (kedua indikator defisit).
2. **Normal**: Seluruh skor fisik $> 2$, tidak ada skor 1, imunisasi memadai, dan asupan makanan memenuhi.

> [!CAUTION]
> **Pemberitahuan Medis Resmi (Clinical Disclaimer):**  
> *"Sistem SPK Balita Sehat adalah instrumen skrining administratif Posyandu. Skor SAW dan peringkat SPK BUKAN diagnosis medis resmi dokter. Penegakan diagnosis klinis tetap mengacu pada pemeriksaan dokter spesialis anak atau Puskesmas."*

---

## 8. Dokumentasi Tangkapan Layar Resmi (Folder screenshoot/)

Folder `c:\SPK\screenshoot\` memuat seluruh gambar antarmuka yang disiapkan untuk lampiran skripsi/laporan:
- [Gambar 3. Antarmuka pencatatan indikator pemeriksaan balita.png](file:///c:/SPK/screenshoot/Gambar%203.%20Antarmuka%20pencatatan%20indikator%20pemeriksaan%20balita.png)
- [Gambar 4. Antarmuka pembobotan kriteria menggunakan metode AHP.png](file:///c:/SPK/screenshoot/Gambar%204.%20Antarmuka%20pembobotan%20kriteria%20menggunakan%20metode%20AHP.png)
- [Gambar 5. Hasil pemeringkatan alternatif balita menggunakan SAW.png](file:///c:/SPK/screenshoot/Gambar%205.%20Hasil%20pemeringkatan%20alternatif%20balita%20menggunakan%20SAW.png)
- [Gambar 6. Rincian normalisasi dan perhitungan nilai preferensi.png](file:///c:/SPK/screenshoot/Gambar%206.%20Rincian%20normalisasi%20dan%20perhitungan%20nilai%20preferensi.png)
- [Gambar 6b. Rincian kontribusi bobot alternatif SAW.png](file:///c:/SPK/screenshoot/Gambar%206b.%20Rincian%20kontribusi%20bobot%20alternatif%20SAW.png)

---

## 9. Panduan Langkah Demi Langkah Push ke GitHub

```powershell
# 1. Masuk ke direktori proyek
cd c:\SPK

# 2. Periksa status git
git status

# 3. Commit pembaruan dokumentasi
git add .
git commit -m "docs: update RANGKUMAN_SISTEM_SPK and README for K5 MDD MMF and screenshots"

# 4. Push ke GitHub repository
git push origin main
```

---

## 10. Panduan Instalasi & Eksekusi Lokal

### 1. Menjalankan Server Pengembangan
```powershell
cd c:\SPK
npm install
npm run dev
```
Akses di browser pada: `http://localhost:5173/`

### 2. Akun Uji Coba Cepat (Aktif di Supabase & Mode Offline)
- **Petugas Posyandu / Dokter Spesialis Anak**:
  - Email: `dokter@gmail.com` *(atau `petugas@spkbalita.id`)*
  - Password: `123` *(atau `demo123456`)*
- **Administrator Sistem**:
  - Email: `admin@gmail.com` *(atau `admin@spkbalita.id`)*
  - Password: `123` *(atau `demo123456`)*
- **Orang Tua Balita**:
  - Email: `user@gmail.com` *(atau `orangtua@spkbalita.id`)*
  - Password: `123` *(atau `demo123456`)*
  - *(Tersedia juga akun orang tua lainnya: `hendra@gmail.com`, `nurul@gmail.com`, `bambang@gmail.com` dengan password `123`)*

### 3. Verifikasi Konektivitas Cloud Supabase
```powershell
node scripts/verify_supabase_full.js
```

### 4. Pengujian Unit Algoritma SPK (10 Skenario K5)
```powershell
node src/lib/spk/spk.test.js
```

### 5. Pengujian Benchmark 14 Balita Acuan
```powershell
node scripts/test_14_balita.js
```

### 6. Pengambilan Screenshot Otomatis
```powershell
node scripts/capture.js
```

### 7. Build Bundler Produksi
```powershell
npm run build
```
