# SPK Balita Sehat — Technical Architecture & Implementation Documentation

Sistem Pendukung Keputusan (SPK) Pemantauan Pertumbuhan dan Tumbuh Kembang Balita Posyandu berbasis Web dengan integrasi metode **Analytic Hierarchy Process (AHP)** dan **Simple Additive Weighting (SAW)**.

---

## DAFTAR ISI
1. [Arsitektur & Prinsip Rekayasa Perangkat Lunak](#1-arsitektur--prinsip-rekayasa-perangkat-lunak)
2. [Spesifikasi Teknologi](#2-spesifikasi-teknologi)
3. [Implementasi Matematika & Algoritma SPK](#3-implementasi-matematika--algoritma-spk)
   - [A. Analytic Hierarchy Process (AHP)](#a-analytic-hierarchy-process-ahp)
   - [B. Simple Additive Weighting (SAW)](#b-simple-additive-weighting-saw)
   - [C. Aturan Isolasi Kohor & Periode](#c-aturan-isolasi-kohor--periode)
4. [Arsitektur Basis Data & Keamanan (PostgreSQL + RLS)](#4-arsitektur-basis-data--keamanan-postgresql--rls)
   - [A. Relasi Entitas & Skema Tabel](#a-relasi-entitas--skema-tabel)
   - [B. Matriks Hak Akses Row Level Security (RLS)](#b-matriks-hak-akses-row-level-security-rls)
   - [C. Prosedur Tersimpan (Stored Procedures) & Triggers](#c-prosedur-tersimpan-stored-procedures--triggers)
5. [Struktur Direktori & Rincian Modul Kode](#5-struktur-direktori--rincian-modul-kode)
6. [Alur Data & Siklus Hidup Pemeriksaan (State Machine)](#6-alur-data--siklus-hidup-pemeriksaan-state-machine)
7. [Aturan Skrining KIA & Penafian Medis](#7-aturan-skrining-kia--penafian-medis)
8. [Panduan Langkah Demi Langkah Push ke GitHub](#8-panduan-langkah-demi-langkah-push-ke-github)
9. [Panduan Instalasi & Eksekusi Lokal](#9-panduan-instalasi--eksekusi-lokal)

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
│   src/lib/health/rules.js   ││  Local In-Memory Mock Store  │
└─────────────────────────────┘└──────────────────────────────┘
```

### Prinsip Utama yang Diterapkan:
1. **Single Source of Truth Multi-Role**: Satu basis kode React menangani tiga peran (`parent`, `staff`, `admin`) dengan *route guards* terisolasi dan antarmuka khusus tanpa membagi aplikasi menjadi tiga proyek terpisah.
2. **Immutable Clinical Visits**: Nilai pemeriksaan baru tidak pernah menimpa catatan sebelumnya. Setiap kunjungan adalah entri rekam antropometri unik (`examinations` + `examination_details`) yang mempertahankan riwayat historis longitudinal.
3. **Idempotent Verification**: Verifikasi pemeriksaan fisik oleh tenaga kesehatan dirancang dengan proteksi idempotensi pada level server database guna mencegah duplikasi eksekusi atau penghitungan ganda.
4. **Dual Provider Agnostic**: Lapisan layanan (*Service Layer*) secara transparan mendeteksi ketersediaan kredensial Supabase. Jika variabel lingkungan belum diisi, aplikasi beralih ke *reactive mock data provider* tanpa mengalami *crash* atau *runtime error*.

---

## 2. Spesifikasi Teknologi

| Komponen | Pustaka / Alat | Versi | Alasan Pemilihan & Kegunaan |
| :--- | :--- | :--- | :--- |
| **Framework UI** | React | `^19.3.1` | Pustaka antarmuka deklaratif berbasis komponen modular. |
| **Build Tool** | Vite | `^8.3.4` | Server dev berbasis native ESM instan & bundler produksi cepat. |
| **Bahasa** | JavaScript (ESM) | ES2022+ | Menghindari kompleksitas *type boilerplate* sesuai spesifikasi proyek. |
| **Styling** | Tailwind CSS | `@tailwindcss/vite` (v4) | Desain atomik utilitas tanpa overhead CSS runtime; tema healthcare *teal-cyan*. |
| **Routing** | React Router DOM | `^7.x` | Manajemen navigasi bersarang (*nested routing*) dan proteksi rute. |
| **Grafik** | Recharts | `^2.15.x` | Kurva visualisasi antropometri (BB & TB) berbasis SVG responsif. |
| **Ikonografi** | Lucide React | `^1.16.x` | Kumpulan ikon grafis antarmuka medis dan dashboard yang seragam. |
| **Database & Auth** | Supabase JS Client | `^2.49.x` | Klien resmi Supabase Auth, PostgreSQL, RPC, dan Row Level Security. |

---

## 3. Implementasi Matematika & Algoritma SPK

Sistem menggabungkan metode **AHP** (untuk pembobotan objektif kriteria) dan **SAW** (untuk penskoran dan pemeringkatan alternatif balita).

### A. Analytic Hierarchy Process (AHP)
Diimplementasikan pada modul [`src/lib/spk/ahp.js`](file:///C:/SPK/src/lib/spk/ahp.js).

#### 1. Validasi Matriks Perbandingan Berpasangan ($A$)
Matriks bujur sangkar berukuran $n \times n$ (di mana $n = 6$ kriteria):
$$A = \begin{bmatrix}
a_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{n1} & a_{n2} & \cdots & a_{nn}
\end{bmatrix}$$
- Syarat diagonal utama: $a_{ii} = 1.0, \quad \forall i$
- Syarat resiprokal: $a_{ji} = \frac{1}{a_{ij}}, \quad \forall i \ne j$

#### 2. Normalisasi Matriks & Perhitungan Bobot Prioritas ($w$)
Langkah normalisasi kolom:
$$r_{ij} = \frac{a_{ij}}{\sum_{k=1}^{n} a_{kj}}$$
Vektor bobot kriteria ($w_i$) dihitung sebagai rata-rata baris dari matriks yang telah dinormalisasi:
$$w_i = \frac{1}{n} \sum_{j=1}^{n} r_{ij}, \quad \text{dengan } \sum_{i=1}^{n} w_i = 1.0$$

#### 3. Perhitungan Lambda Maksimum ($\lambda_{max}$)
$$\lambda_{max} = \sum_{j=1}^{n} \left( w_j \times \sum_{i=1}^{n} a_{ij} \right)$$

#### 4. Uji Konsistensi Saaty (Consistency Ratio)
- **Consistency Index (CI)**:
  $$CI = \frac{\lambda_{max} - n}{n - 1}$$
- **Random Index (RI)** Standar Saaty:
  | $n$ | 1 | 2 | 3 | 4 | 5 | **6** | 7 | 8 | 9 | 10 |
  | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
  | **RI** | 0.00 | 0.00 | 0.58 | 0.90 | 1.12 | **1.24** | 1.32 | 1.41 | 1.45 | 1.49 |
- **Consistency Ratio (CR)**:
  $$CR = \frac{CI}{RI}$$
- **Ambang Penerimaan**: Matriks dinyatakan valid dan konsisten jika:
  $$CR \le 0.10$$
  Bila $CR > 0.10$, sistem menolak konfigurasi bobot tersebut.

#### 5. Matriks Default Teruji pada Sistem
```javascript
export const DEFAULT_AHP_6X6_MATRIX = [
  // C1       C2       C3       C4       C5       C6
  [ 1.000,   2.000,   3.000,   2.000,   4.000,   5.000 ], // C1: Berat Badan
  [ 0.500,   1.000,   2.000,   2.000,   3.000,   4.000 ], // C2: Tinggi Badan
  [ 0.333,   0.500,   1.000,   1.000,   2.000,   3.000 ], // C3: Lingkar Kepala
  [ 0.500,   0.500,   1.000,   1.000,   2.000,   3.000 ], // C4: LiLA Gizi
  [ 0.250,   0.333,   0.500,   0.500,   1.000,   2.000 ], // C5: Imunisasi
  [ 0.200,   0.250,   0.333,   0.333,   0.500,   1.000 ], // C6: Frekuensi Sakit
];
```
Hasil perhitungan matematis:
$$\lambda_{max} = 6.092823 \quad | \quad CI = 0.018565 \quad | \quad CR = 0.014971 \quad (\le 0.10 \implies \text{Konsisten})$$
$$\text{Bobot: } w = [0.344865, \; 0.234685, \; 0.138239, \; 0.148240, \; 0.081768, \; 0.052203]$$

---

### B. Simple Additive Weighting (SAW)
Diimplementasikan pada modul [`src/lib/spk/saw.js`](file:///C:/SPK/src/lib/spk/saw.js).

#### 1. Matriks Keputusan ($X$)
Matriks berukuran $m \times n$, di mana $m$ adalah jumlah balita dalam kelompok dan $n = 6$ kriteria.

#### 2. Normalisasi Matriks ($R = [r_{ij}]$)
- **Kriteria Benefit** (nilai lebih tinggi lebih baik: $C_1, C_2, C_3, C_4, C_5$):
  $$r_{ij} = \frac{x_{ij}}{\max_k(x_{kj})}$$
- **Kriteria Cost** (nilai lebih rendah lebih baik: $C_6$ Frekuensi Sakit):
  $$r_{ij} = \frac{\min_k(x_{kj})}{x_{ij}}$$

#### 3. Penanganan Singularity Nilai Nol pada Cost (Pencegahan Division by Zero)
Jika seorang balita sehat tidak pernah sakit ($x_{i6} = 0$), rumus cost biasa $\frac{\min}{0}$ akan menghasilkan *infinity* / pembagian tak terdefinisi. Modul [`saw.js`](file:///C:/SPK/src/lib/spk/saw.js#L23-L41) menerapkan logika aman:
- Bila $x_{i6} = 0$ dan $\min(x) = 0$, kondisi tersebut merupakan kondisi optimal dengan nilai normalisasi sempurna:
  $$r_{i6} = 1.0$$
- Bila terdapat nilai nol pada kohor, normalisasi bergeser menggunakan transformasi kontinu:
  $$r_{ij} = \frac{\min(x_j) + 1}{x_{ij} + 1}$$

#### 4. Nilai Preferensi ($V_i$)
$$V_i = \sum_{j=1}^{n} w_j \cdot r_{ij}$$

#### 5. Multi-Tier Deterministic Tie-Breaking
Jika dua balita memperoleh skor preferensi $V_i$ identik hingga digit presisi float ($10^{-6}$):
1. **Prioritas 1**: Nilai preferensi $V_i$ terbesar.
2. **Prioritas 2**: Kontribusi kriteria dengan bobot terbesar secara berurutan ($C_1 \to C_2 \to C_4 \to C_3 \to C_5 \to C_6$).
3. **Prioritas 3**: Urutan alfabetis nama balita dan keunikan ID balita (stabil dan dapat diproduksi ulang).

---

### C. Aturan Isolasi Kohor & Periode
Sistem memblokir eksekusi SAW bila:
1. Terdapat balita dari tahun kelahiran yang berbeda dalam satu matriks keputusan.
2. Terdapat pemeriksaan dari periode bulan/tahun yang berbeda.
3. Terdapat duplikasi anak (hanya 1 catatan pemeriksaan acuan per balita dalam satu periode).

---

## 4. Arsitektur Basis Data & Keamanan (PostgreSQL + RLS)

File migrasi lengkap tersimpan di:
[`supabase/migrations/20261019000000_create_spk_balita_sehat_schema.sql`](file:///C:/SPK/supabase/migrations/20261019000000_create_spk_balita_sehat_schema.sql)

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

| Nama Tabel | Deskripsi & Tujuan | Kolom Kunci / Constraint |
| :--- | :--- | :--- |
| `profiles` | Data ekstensi akun dari `auth.users` | `id PK -> auth.users`, `nik UNIQUE`, `role CHECK ('parent', 'staff', 'admin')` |
| `posyandu` | Fasilitas pos penimbangan balita | `id PK UUID`, `name TEXT`, `is_active BOOLEAN` |
| `staff_assignments` | Penugasan nakes ke posyandu tertentu | `staff_id`, `posyandu_id`, `UNIQUE(staff_id, posyandu_id)` |
| `children` | Data profil anak balita | `parent_id -> profiles`, `dob DATE`, `registration_status CHECK (...)` |
| `criteria` | Definisi 6 kriteria SPK | `code UNIQUE ('C1'..'C6')`, `direction CHECK ('benefit', 'cost')` |
| `ahp_configurations` | Snapshot versi matriks AHP & bobot | `version UNIQUE`, `pairwise_matrix JSONB`, `weights JSONB`, `cr NUMERIC` |
| `examinations` | Kunjungan penimbangan balita | `child_id`, `period_code VARCHAR(10)`, `status CHECK ('draft', 'verified', ...)` |
| `examination_details` | Nilai mentah kriteria per kunjungan | `examination_id`, `criterion_id`, `raw_value NUMERIC`, `UNIQUE(exam, crit)` |
| `spk_runs` | Snapshot proses eksekusi SPK kohor | `birth_year INT`, `period_code`, `status CHECK ('completed', 'superseded')` |
| `spk_results` | Peringkat dan nilai preferensi balita | `spk_run_id`, `child_id`, `preference_score NUMERIC(8,6)`, `rank INT` |
| `recommendations` | Edukasi tumbuh kembang per balita | `child_id`, `examination_id`, `category`, `priority CHECK ('high', 'normal')` |
| `consultations` | Sesi konsultasi orang tua dan nakes | `parent_id`, `child_id`, `assigned_staff_id`, `status CHECK ('open', 'closed')` |
| `consultation_messages`| Percakapan pesan chat | `consultation_id`, `sender_id`, `message TEXT`, `created_at` |
| `audit_logs` | Jejak rekam keamanan dan audit trail | `actor_id`, `action TEXT`, `entity_type`, `entity_id`, `before_data`, `after_data` |

---

### B. Matriks Hak Akses Row Level Security (RLS)

PostgreSQL RLS diaktifkan (`ENABLE ROW LEVEL SECURITY`) pada seluruh tabel:

| Tabel | Role Orang Tua (`parent`) | Role Petugas (`staff`) | Role Admin (`admin`) |
| :--- | :--- | :--- | :--- |
| `profiles` | `SELECT` / `UPDATE` profil sendiri | `SELECT` seluruh profil pengguna | `ALL` (Akses penuh) |
| `children` | `SELECT` anak sendiri, `INSERT` anak sendiri | `SELECT` & `UPDATE` status anak | `ALL` |
| `examinations` | `SELECT` hanya yang berstatus `verified` miliknya | `SELECT`, `INSERT` draft, `UPDATE` draft | `SELECT` seluruh pemeriksaan |
| `examination_details`| `SELECT` rincian anak sendiri yang terverifikasi | `ALL` untuk pemeriksaan | `SELECT` |
| `spk_runs` / `results`| `SELECT` skor balita miliknya | `SELECT` & `INSERT` hasil SPK kohor | `SELECT` & `INSERT` |
| `consultations` | `ALL` percakapan di mana ia sebagai `parent_id` | `ALL` percakapan yang ditugaskan | `ALL` |
| `ahp_configurations`| `SELECT` konfigurasi berstatus `active` | `SELECT` konfigurasi aktif | `ALL` (Dapat membuat versi baru) |
| `audit_logs` | Ditolak (`NO ACCESS`) | Ditolak (`NO ACCESS`) | `SELECT` (Audit penuh) |

---

### C. Prosedur Tersimpan (Stored Procedures) & Triggers

#### 1. Trigger Registrasi Pengguna Baru (`handle_new_user`)
Setiap kali ada pendaftaran pada `auth.users`, trigger PostgreSQL secara otomatis menginsersi baris padanan ke `public.profiles` dengan peran default `parent`:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, nik, address, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    COALESCE(NEW.raw_user_meta_data->>'nik', SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 16)),
    COALESCE(NEW.raw_user_meta_data->>'address', '-'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2. Prosedur Verifikasi Pemeriksaan Terkendali (`verify_examination`)
Dijalankan secara atomik pada server database untuk memastikan kelengkapan 6 kriteria, validasi hak staf, pembaruan status `verified`, dan pencatatan otomatis ke `audit_logs`:
```sql
CREATE OR REPLACE FUNCTION public.verify_examination(
  p_examination_id UUID,
  p_staff_id UUID
)
RETURNS JSONB AS $$
...
```

---

## 5. Struktur Direktori & Rincian Modul Kode

```
c:/SPK/
├── src/
│   ├── app/
│   │   ├── App.jsx                     # Provider wrapper (BrowserRouter + AuthProvider)
│   │   └── router.jsx                  # Rute navigasi, Role Guards, & Root Redirect
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx           # Shell responsive layout + disclaimer footer
│   │   │   ├── Navbar.jsx              # Top header, role switcher badge, & logout
│   │   │   └── Sidebar.jsx             # Navigasi vertikal terfilter sesuai hak akses
│   │   └── ui/
│   │       ├── StatusBadge.jsx         # Status badge pendaftaran, verifikasi, & KIA
│   │       ├── SummaryCard.jsx         # Kartu analitik metrik dashboard
│   │       ├── Modal.jsx               # Dialog modal dengan focus trap & backdrop dismiss
│   │       ├── EmptyState.jsx          # Placeholder visual saat koleksi kosong
│   │       └── LoadingState.jsx        # Spinner indikator proses asinkron
│   ├── context/
│   │   └── AuthContext.jsx             # State autentikasi sesi, profil, dan switchRole helper
│   ├── lib/
│   │   ├── health/
│   │   │   └── statusRules.js          # Skrining LiLA/BB/TB/Imunisasi & rekomendasi KIA
│   │   ├── spk/
│   │   │   ├── ahp.js                  # Engine AHP murni (matriks, eigen, Saaty RI=1.24)
│   │   │   ├── saw.js                  # Engine SAW murni (benefit/cost, tie-breaker)
│   │   │   └── spk.test.js             # Skrip test matematika verifikasi algoritma
│   │   ├── mockData.js                 # Dataset realistis balita Posyandu untuk testing
│   │   └── supabase.js                 # Klien Supabase & validator konfigurasi env
│   ├── pages/
│   │   ├── admin/                      # Halaman kontrol Administrator
│   │   │   ├── AdminDashboard.jsx      # Metrik sistem dan ringkasan operasional
│   │   │   ├── AHPConfigPage.jsx       # Editor interaktif matriks AHP 6x6 & kalkulator CR
│   │   │   ├── AuditLogsPage.jsx       # Tabel audit trail peristiwa sistem
│   │   │   ├── PosyanduManagementPage.jsx # Pendaftaran fasilitas Posyandu
│   │   │   └── UserManagementPage.jsx  # Tabel pengguna & pengubah peran
│   │   ├── auth/                       # Halaman Autentikasi
│   │   │   ├── LoginPage.jsx           # Form login & tombol uji coba 1-klik peran
│   │   │   └── RegisterPage.jsx        # Registrasi orang tua dengan validasi 16 digit NIK
│   │   ├── parent/                     # Halaman Orang Tua
│   │   │   ├── AddChildModal.jsx       # Modal tambah anak balita (usia < 60 bulan)
│   │   │   ├── ChildProfilePage.jsx    # Profil balita, 6 kriteria, grafik Recharts, riwayat
│   │   │   ├── ChildrenListPage.jsx    # Direktori pencarian anak terdaftar
│   │   │   ├── ParentConsultationPage.jsx # Chat tanya jawab konsultasi Bidan
│   │   │   ├── ParentDashboard.jsx     # Dashboard kartu anak orang tua
│   │   │   └── ParentProfilePage.jsx   # Informasi profil akun orang tua
│   │   └── staff/                      # Halaman Petugas Posyandu / Nakes
│   │       ├── BirthYearGroupsPage.jsx # Pengelompokan kohor tahun kelahiran
│   │       ├── ChildRegistrationQueue.jsx # Verifikasi kedatangan fisik anak baru
│   │       ├── ExaminationFormPage.jsx # Form pencatatan 6 kriteria antropometri
│   │       ├── PendingExaminationsPage.jsx # Draf pemeriksaan menunggu verifikasi
│   │       ├── SPKCalculationPage.jsx  # Eksekusi AHP+SAW, transparansi matriks, & ranking
│   │       ├── StaffConsultationPage.jsx # Balasan konsultasi oleh nakes
│   │       └── StaffDashboard.jsx      # Metrik operasional balita & antrean
│   ├── services/                       # Lapisan abstraksi data (Service Layer)
│   │   ├── adminService.js             # Layanan pengguna, posyandu, dan audit
│   │   ├── authService.js              # Layanan autentikasi, registrasi, & session
│   │   ├── childService.js             # Layanan CRUD anak & status pendaftaran
│   │   ├── consultationService.js      # Layanan percakapan pesan konsultasi
│   │   ├── examinationService.js       # Layanan pencatatan, draf, & verifikasi kunjungan
│   │   └── spkService.js               # Layanan orkestrator kalkulasi AHP + SAW kohor
│   ├── index.css                       # Impor Tailwind CSS & custom styling
│   └── main.jsx                        # Entry point React DOM
├── supabase/
│   ├── migrations/
│   │   └── 20261019000000_create_spk_balita_sehat_schema.sql # Skema PostgreSQL & RLS
│   └── seed.sql                        # Data benih Posyandu, kriteria, & AHP V1
├── .env.example                        # Template variabel lingkungan Supabase
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
          │ (Petugas mengukur BB, TB, LK, LiLA, Imunisasi, Sakit)
          ▼
[Petugas: Simpan Kunjungan] ─── Simpan Draf ───> (Status Pemeriksaan: draft)
          │                                                    │
          ▼ (Verifikasi & Hitung)                              │
   (Status Pemeriksaan: verified) <────────────────────────────┘
          │
          ├──> Snapshot Bobot AHP Aktif
          ├──> Eksekusi Matriks SAW per Kohor & Periode
          ├──> Simpan Hasil Skor Preferensi (Vi) & Ranking
          │
          ├──> Tampil di Profil Balita Orang Tua (Grafik Recharts + Riwayat Kunjungan)
          └──> Catat Peristiwa ke audit_logs
```

---

## 7. Aturan Skrining KIA & Penafian Medis

Diimplementasikan pada modul [`src/lib/health/statusRules.js`](file:///C:/SPK/src/lib/health/statusRules.js).

### Kategori Status Tumbuh Kembang:
1. **Perlu Penanganan**: Terpicu jika Lingkar Lengan Atas (LiLA) $< 11.5$ cm (indikasi risiko gizi kurang/buruk menurut standar Kemenkes RI) atau frekuensi sakit $\ge 4$ kali dalam 6 bulan terakhir.
2. **Cukup Baik**: Terpicu jika LiLA berada pada ambang batas waspada ($11.5 - 12.4$ cm) atau kelengkapan imunisasi $< 70\%$.
3. **Baik**: Pertumbuhan normal sesuai usia balita.
4. **Sangat Baik**: Pertumbuhan optimal, imunisasi $\ge 90\%$, dan riwayat sakit $\le 1$ kali.

> **Pemberitahuan Medis Resmi (Clinical Disclaimer):**  
> *"Sistem SPK Balita Sehat adalah instrumen skrining dan pendukung keputusan administratif Posyandu. Skor SAW dan peringkat SPK BUKAN diagnosis medis resmi dokter. Penegakan diagnosis klinis tetap mengacu pada pemeriksaan dokter anak atau Puskesmas."*

---

## 8. Panduan Langkah Demi Langkah Push ke GitHub

Saat ini kode Anda **sudah aman tersimpan di repositori Git lokal** pada komputer Anda (branch `main`). Karena repositori GitHub remote belum dibuat, silakan ikuti panduan berikut untuk mempublikasikannya ke GitHub:

### Langkah 1: Buat Repositori Baru di GitHub
1. Buka browser dan masuk ke akun GitHub Anda di: [https://github.com/new](https://github.com/new)
2. Isi **Repository name**, misalnya: `spk-balita-sehat`
3. Pilih visibilitas: **Public** atau **Private**
4. **PENTING**: **JANGAN centang** *"Add a README file"*, *"Add .gitignore"*, atau *"Choose a license"*, karena seluruh file tersebut sudah dibuat secara lengkap di proyek lokal.
5. Klik tombol hijau **Create repository**.

### Langkah 2: Hubungkan Repositori Lokal ke GitHub
Buka terminal PowerShell Anda di folder proyek `c:\SPK` dan jalankan perintah berikut:

```powershell
# 1. Pastikan Anda berada di direktori proyek
cd c:\SPK

# 2. Tambahkan URL remote GitHub Anda (ganti <username-kamu> dengan username GitHub Anda)
git remote add origin https://github.com/<username-kamu>/spk-balita-sehat.git

# 3. Verifikasi remote sudah terpasang
git remote -v

# 4. Push seluruh kode ke GitHub branch main
git push -u origin main
```

*(Jika diminta login oleh GitHub, masukkan kredensial atau Personal Access Token GitHub Anda).*

---

## 9. Panduan Instalasi & Eksekusi Lokal

### 1. Menjalankan Server Pengembangan
```powershell
cd c:\SPK
npm install
npm run dev
```
Buka browser pada alamat: `http://localhost:5173/`

### 2. Akun Uji Coba Cepat (Mode Offline / Demo)
Aplikasi menyediakan tombol 1-klik login untuk mempermudah evaluasi 3 peran:
- **Orang Tua**: `orangtua@spkbalita.id` (Password: `demo123456`)
- **Petugas Posyandu**: `petugas@spkbalita.id` (Password: `demo123456`)
- **Administrator**: `admin@spkbalita.id` (Password: `demo123456`)

### 3. Pengujian Unit Algoritma SPK
Untuk menjalankan verifikasi matematis AHP dan SAW:
```powershell
node src/lib/spk/spk.test.js
```

### 4. Build Bundler Produksi
```powershell
npm run build
```

---

*Dokumentasi ini disusun sebagai acuan teknis arsitektur, matematika keputusan, skema basis data, dan tata kelola kode aplikasi SPK Balita Sehat.*
