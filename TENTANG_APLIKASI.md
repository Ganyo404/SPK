# TENTANG SISTEM PENDUKUNG KEPUTUSAN (SPK) BALITA SEHAT POSYANDU

> **Panduan Informasi, Profil Aplikasi, Fungsi, Manfaat, dan Alur Penggunaan**  
> *Sistem Pemantauan Tumbuh Kembang dan Skrining Kesehatan Balita Berbasis Web Terintegrasi Hybrid AHP & SAW*

---

## DAFTAR ISI
1. [Apa Itu SPK Balita Sehat Posyandu?](#1-apa-itu-spk-balita-sehat-posyandu)
2. [Latar Belakang & Masalah Riil yang Diselesaikan](#2-latar-belakang--masalah-riil-yang-diselesaikan)
3. [Visi & Tujuan Utama Aplikasi](#3-visi--tujuan-utama-aplikasi)
4. [Fitur-Fitur Unggulan Sistem](#4-fitur-fitur-unggulan-sistem)
5. [Manfaat Aplikasi bagi Berbagai Pihak](#5-manfaat-aplikasi-bagi-berbagai-pihak)
   - [A. Bagi Orang Tua Balita](#a-bagi-orang-tua-balita)
   - [B. Bagi Kader & Petugas Posyandu](#b-bagi-kader--petugas-posyandu)
   - [C. Bagi Dokter / Tenaga Medis Puskesmas](#c-bagi-dokter--tenaga-medis-puskesmas)
   - [D. Bagi Pembuat Kebijakan & Akademisi](#d-bagi-pembuat-kebijakan--akademisi)
6. [Metodologi SPK (AHP + SAW) dalam Bahasa Sederhana](#6-metodologi-spk-ahp--saw-dalam-bahasa-sederhana)
7. [Standar Medis & Pedoman Acuan](#7-standar-medis--pedoman-acuan)
8. [Alur Kerja Operasional Penggunaan Aplikasi](#8-alur-kerja-operasional-penggunaan-aplikasi)
9. [Panduan Akses & Akun Uji Coba](#9-panduan-akses--akun-uji-coba)
10. [Penafian Medis Resmi (Clinical Disclaimer)](#10-penafian-medis-resmi-clinical-disclaimer)

---

## 1. Apa Itu SPK Balita Sehat Posyandu?

**SPK Balita Sehat Posyandu** adalah aplikasi web kesehatan masyarakat yang dirancang untuk mendigitalkan, memvalidasi, dan mengoptimalkan proses pemantauan tumbuh kembang anak usia dini (0 hingga 59 bulan) di tingkat layanan primer Posyandu dan Puskesmas.

Aplikasi ini menggabungkan:
1. **Pencatatan Rekam Medis Antropometri Modern**: Menggantikan buku Kartu Menuju Sehat (KMS) kertas konvensional dengan sistem digital interaktif yang menyajikan kurva pertumbuhan visual.
2. **Kecerdasan Sistem Pendukung Keputusan (Decision Support System)**: Memanfaatkan metode multikriteria **Analytic Hierarchy Process (AHP)** dan **Simple Additive Weighting (SAW)** untuk memberikan penilaian status kesehatan balita secara menyeluruh, adil, transparan, dan terukur.
3. **Penyaringan Risiko Dini (*Early Screening*)**: Mengidentifikasi secara otomatis balita yang memerlukan evaluasi atau intervensi klinis (risiko stunting, wasting, gizi kurang, mikrosefali/makrosefali, kelalaian imunisasi, atau defisit pola makan pendamping ASI).

---

## 2. Latar Belakang & Masalah Riil yang Diselesaikan

Dalam operasional Posyandu konvensional, terdapat beberapa tantangan mendasar yang kerap dihadapi:

1. **Pencatatan Fisik Rentan Rusak atau Tercecer**: Buku KMS atau formulir kertas sering hilang, sobek, atau tidak terbawa saat jadwal Posyandu, sehingga riwayat pemantauan anak terputus (*data gap*).
2. **Evaluasi Parsial yang Tidak Menyeluruh**: Tenaga kesehatan sering kali hanya memeriksa berat badan saja. Padahal anak dengan berat badan normal bisa saja mengalami hambatan tinggi badan (*stunted*) atau defisit lingkar kepala (*microcephaly*).
3. **Penentuan Prioritas yang Masih Subjektif**: Ketika kader dan dokter dihadapkan pada puluhan bahkan ratusan balita dalam satu hari penimbangan, sulit menentukan secara cepat dan tepat anak mana yang paling mendesak untuk diintervensi atau dirujuk.
4. **Generalisasi Pola Makan yang Tidak Sesuai Usia**: Menilai asupan makanan bayi usia 2 bulan dengan standar bayi 10 bulan merupakan kekeliruan fatal. Bayi 0–5 bulan wajib ASI eksklusif, sementara baduta 6–23 bulan membutuhkan keragaman dan frekuensi makanan pendamping ASI (MP-ASI) yang spesifik.

**SPK Balita Sehat Posyandu hadir sebagai solusi digital terintegrasi** untuk mengatasi seluruh tantangan di atas melalui standarisasi otomatis, diferensiasi usia ketat, dan penyimpanan awan (*cloud database*) yang aman.

---

## 3. Visi & Tujuan Utama Aplikasi

### Visi:
Mewujudkan generasi balita Indonesia yang sehat, bebas stunting, dan terpantau tumbuh kembangnya secara presisi melalui pemanfaatan teknologi informasi tingkat Posyandu.

### Tujuan Utama:
1. **Mencegah dan Menekan Angka Stunting**: Mendeteksi sedini mungkin penurunan laju pertumbuhan (*growth faltering*) sebelum balita jatuh pada kondisi gizi kronis atau stunting permanen.
2. **Memberikan Skrining Multidimensi**: Menggabungkan 5 indikator esensial: Berat Badan (K1), Panjang/Tinggi Badan (K2), Lingkar Kepala (K3), Kelengkapan Imunisasi (K4), dan Kualitas Asupan Makanan MDD & MMF (K5).
3. **Membantu Pengambilan Keputusan Klinis Nakes**: Memberikan rekomendasi urutan prioritas balita yang membutuhkan kunjungan rumah (*home visit*), konseling gizi, pemberian makanan tambahan (PMT), atau rujukan ke Puskesmas.
4. **Memberdayakan Orang Tua**: Memberikan kemudahan bagi orang tua untuk memantau grafik tumbuh kembang anak dari ponsel mereka kapan saja dan berkonsultasi langsung dengan petugas.

---

## 4. Fitur-Fitur Unggulan Sistem

### 1. Tiga Antarmuka Peran Terintegrasi (*Multi-Role Portal*)
- **Portal Orang Tua (`parent`)**: Akses kartu anak, KMS digital interaktif, riwayat penimbangan bulanan, status imunisasi, dan ruang tanya-jawab konsultasi medis.
- **Portal Petugas / Kader / Dokter (`staff`)**: Antarmuka cepat pencatatan fisik (layout grid 2×2), verifikasi kehadiran, kalkulasi SPK per kohor umur, modal transparansi matriks normalisasi, dan tindak lanjut balita dengan status *"Perlu Tinjau"*.
- **Portal Administrator (`admin`)**: Pengelolaan akun dan hak akses pengguna, penyesuaian bobot matriks perbandingan AHP 5×5 dan 4×4 dengan uji konsistensi Saaty, manajemen wilayah Posyandu, serta audit log keamanan.

### 2. Standarisasi Skor Z-Score Otomatis (Permenkes RI No. 2/2020)
Saat petugas memasukkan berat badan (kg), tinggi badan (cm), dan lingkar kepala (cm), sistem langsung menghitung nilai Z-Score dan mengonversinya menjadi skor ordinal benefit (1 hingga 4) secara *real-time*.

### 3. Skrining Asupan Makanan Komposit WHO/UNICEF (MDD & MMF)
Khusus untuk balita usia MP-ASI (6–23 bulan), formulir menyediakan:
- **8 Checkbox Keragaman Pangan (MDD - *Minimum Dietary Diversity*)**: ASI, bahan pokok, kacang-kacangan, produk susu, daging/ikan, telur, sayur/buah vitamin A, dan sayur/buah lainnya (ambang batas: $\ge 5$ kelompok makanan).
- **Frekuensi Makan Minimum (MMF - *Minimum Meal Frequency*)**: Disesuaikan dengan usia bulan dan status pemberian ASI.
- Komposit dihitung secara otomatis menghasilkan nilai $0$, $0.5$, atau $1.0$.

### 4. Diferensiasi Model Otomatis Berdasarkan Usia
- **Usia 6–23 Bulan (Kelompok R3, R4, R5)**: Menerapkan **Model 5 Kriteria (K1, K2, K3, K4, K5)**.
- **Usia <6 Bulan & 24–59 Bulan (Kelompok R1, R2, R6, R7, R8)**: Menerapkan **Model 4 Kriteria (K1, K2, K3, K4)**. Kriteria K5 otomatis dinonaktifkan tanpa mendistorsi perhitungan.

### 5. Transparansi Perhitungan Matematis (Auditability)
Aplikasi tidak bekerja sebagai "kotak hitam" (*black box*). Petugas dan dokter dapat membuka:
- **Tabel Nilai Preferensi ($V_i$)**: Nilai akhir hasil pembobotan SAW.
- **Modal Matriks Normalisasi ($R_{ij}$)**: Menampilkan langkah normalisasi rumus per kriteria.
- **Modal Kontribusi Bobot Alternatif**: Menampilkan perkalian $w_j \times r_{ij}$ untuk tiap balita, memudahkan pembuktian ilmiah pada sidang skripsi atau evaluasi dinas.

### 6. Grafik Pertumbuhan Interaktif (KMS Digital)
Visualisasi kurva pertumbuhan menggunakan grafik dinamis berbasis Recharts, memudahkan orang tua melihat apakah tren berat dan tinggi anak berada pada pita hijau normal, pita kuning risiko, atau pita merah.

### 7. Basis Data Cloud Persisten (Supabase PostgreSQL)
Seluruh pendaftaran anak baru, data antropometri, dan hasil peringkat SPK tersimpan secara permanen pada basis data cloud terenkripsi dengan proteksi *Row Level Security (RLS)*.

---

## 5. Manfaat Aplikasi bagi Berbagai Pihak

### A. Bagi Orang Tua Balita
- **KMS Selalu di Tangan**: Tidak perlu khawatir buku hilang atau lupa dibawa saat ke Posyandu; data tersimpan aman di akun digital.
- **Paham Status Anak Lebih Awal**: Mendapatkan penjelasan transparan apakah anak berstatus *"Normal"* atau *"Perlu Tinjau"*.
- **Edukasi Gizi & Imunisasi**: Mengetahui dengan jelas kelompok makanan apa saja yang masih kurang dalam menu harian balita serta sisa target dosis imunisasi yang belum lengkap.
- **Konsultasi Tanpa Ragu**: Dapat mengirimkan pertanyaan langsung ke tenaga medis Posyandu melalui fitur konsultasi daring.

### B. Bagi Kader & Petugas Posyandu
- **Penginputan Data Super Cepat**: Formulir 2×2 yang responsif memangkas waktu pencatatan di meja pelayanan Posyandu.
- **Bebas Kalkulasi Manual yang Rumit**: Tidak perlu lagi membuka tabel antropometri tebal atau menghitung manual pembagian skor.
- **Deteksi Cepat Anak Berisiko**: Kartu filter dashboard langsung mengelompokkan balita yang membutuhkan perhatian khusus.

### C. Bagi Dokter / Tenaga Medis Puskesmas
- **Prioritas Intervensi Tepat Sasaran**: Peringkat SPK memberikan urutan prioritas yang adil dan objektif untuk penjadwalan PMT (*Pemberian Makanan Tambahan*), suplementasi vitamin, atau kunjungan rumah (*home visit*).
- **Rujukan Berbasis Bukti (*Evidence-based Referral*)**: Catatan riwayat longitudinal lengkap memudahkan dokter menegakkan diagnosa klinis atau merujuk ke fasilitas kesehatan rujukan tingkat lanjutan (FKRTL).

### D. Bagi Pembuat Kebijakan & Akademisi
- **Monitoring Wilayah Real-Time**: Mengetahui sebaran status kesehatan anak antar-Posyandu di suatu kelurahan atau kecamatan.
- **Validitas Ilmiah Teruji**: Kombinasi AHP (konsistensi bobot) dan SAW (keadilan perankingan) terbukti adaptif, konsisten, dan dapat direplikasi untuk riset kesehatan masyarakat.

---

## 6. Metodologi SPK (AHP + SAW) dalam Bahasa Sederhana

Bagi pengguna awam atau penguji yang ingin memahami cara kerja matematika sistem ini secara ringkas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR KERJA METODE HYBRID                        │
├──────────────────────────────────┬─────────────────────────────────────┤
│ 1. TAHAP PEMBOBOTAN (AHP)         │ 2. TAHAP PERANKINGAN (SAW)          │
│ "Kriteria mana yang paling vital?"│ "Berapa nilai total setiap anak?"   │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • Dilakukan oleh Dokter Spesialis│ • Data mentah diubah ke skala 1-4   │
│ • Membandingkan pasangan kriteria │ • Nilai dinormalisasi (0 s/d 1)     │
│ • Menghitung Consistency Ratio   │ • Nilai dikalikan bobot AHP         │
│ • Menghasilkan bobot resmi (%)   │ • Dijumlahkan menjadi Skor Akhir Vi │
└──────────────────────────────────┴─────────────────────────────────────┘
```

1. **Mengapa Menggunakan AHP?**
   Dalam menentukan kesehatan balita, setiap aspek memiliki tingkat urgensi yang berbeda. Misalnya, imunisasi dan asupan gizi memiliki dampak vital terhadap kekebalan jangka panjang. Metode AHP digunakan untuk menentukan **persentase bobot masing-masing kriteria** melalui perbandingan berpasangan ilmiah yang telah teruji konsistensinya ($CR < 0.10$).

2. **Mengapa Menggunakan SAW?**
   Metode SAW (penjumlahan berbobot) dikenal sebagai metode yang sangat adil, efisien, dan transparan. SAW menormalisasi semua kriteria menjadi skala yang setara ($0$ sampai $1$), kemudian mengalikannya dengan bobot AHP. Balita yang paling mendekati seluruh target ideal akan memperoleh nilai preferensi tertinggi ($V_i = 1.0000000$).

3. **Pemisahan Evaluasi Klinis vs Peringkat Administratif:**
   Sistem tidak serta merta mencap anak berperingkat bawah sebagai "sakit parah". Peringkat SAW berfungsi sebagai **alat bantu urutan prioritas perhatian**, sementara status klinis (*Normal* vs *Perlu Tinjau*) dievaluasi terpisah berdasarkan batasan ambang batas medis keselamatan anak.

---

## 7. Standar Medis & Pedoman Acuan

Sistem dibangun dengan mengacu pada standar kesehatan resmi nasional dan internasional:

1. **Peraturan Menteri Kesehatan Republik Indonesia (Permenkes RI) No. 2 Tahun 2020**  
   Standar baku antropometri anak Indonesia untuk indeks Berat Badan menurut Umur (BB/U), Panjang/Tinggi Badan menurut Umur (PB/U atau TB/U), dan Lingkar Kepala menurut Umur (LK/U).
2. **WHO Child Growth Standards**  
   Kurva deviasi standar (Z-Score) acuan global untuk pertumbuhan anak usia 0–5 tahun.
3. **Pedoman WHO/UNICEF IYCF (*Infant and Young Child Feeding*)**  
   Standar penilaian keragaman makanan (*Minimum Dietary Diversity* - minimal 5 dari 8 kelompok pangan) dan frekuensi makan minimal (*Minimum Meal Frequency*) bagi anak usia 6–23 bulan.
4. **Jadwal Imunisasi Dasar Lengkap Nasional (Kemenkes RI & IDAI)**  
   Target kumulatif 17 dosis imunisasi wajib (Hepatitis B, BCG, Polio tetes, DPT-HB-Hib, PCV, Rotavirus, Polio suntik/IPV, dan Campak-Rubella/MR).

---

## 8. Alur Kerja Operasional Penggunaan Aplikasi

```
  [LANGKAH 1]                    [LANGKAH 2]                     [LANGKAH 3]
Orang Tua Mendaftar            Petugas Posyandu               Petugas Memeriksa
   Akun & Balita           Verifikasi Kehadiran Fisik        & Menginput Indikator
         │                              │                              │
         ▼                              ▼                              ▼
(Akun orang tua aktif,         (Status balita menjadi        (Input BB, TB, LK, Dosis
 balita terdaftar)             "Aktif" di Posyandu)          Imunisasi, & Pola Makan)
                                                                       │
                                                                       ▼
  [LANGKAH 5]                    [LANGKAH 4]                     [LANGKAH 4B]
Tindak Lanjut Medis &        Sistem Menghitung SPK         Petugas Memverifikasi
 Konsultasi Online           (Normalisasi & Nilai Vi)       Pemeriksaan Kunjungan
         ▲                              ▲                              │
         │                              │                              ▼
(Nakes beri saran PMT,         (Tampil peringkat & status    (Data terkunci aman di
 orang tua konsultasi)         "Normal" / "Perlu Tinjau")     basis data Supabase)
```

1. **Langkah 1 (Pendaftaran)**: Orang tua membuat akun dengan NIK 16 digit, lalu menambahkan identitas balita (nama, tanggal lahir, jenis kelamin).
2. **Langkah 2 (Kedatangan di Posyandu)**: Saat hari Posyandu, kader/petugas memverifikasi kehadiran fisik balita pada menu *Antrean Registrasi*.
3. **Langkah 3 (Pemeriksaan & Pengukuran)**: Petugas menimbang BB, mengukur PB/TB, mengukur lingkar kepala, mencatat jumlah dosis imunisasi, dan menanyakan 8 kelompok makanan serta frekuensi makan kemarin.
4. **Langkah 4 (Standarisasi & Verifikasi)**: Sistem mengonversi nilai riil ke skor 1–4 secara langsung. Petugas memverifikasi kunjungan agar tercatat permanen di cloud.
5. **Langkah 5 (Kalkulasi SPK Kohor)**: Petugas membuka halaman *Kalkulasi SPK*, memilih kelompok umur (misal Kelompok 4: 9–11 bulan), lalu menekan tombol kalkulasi. Sistem menampilkan urutan peringkat, rincian matriks, dan flag klinis.
6. **Langkah 6 (Tindak Lanjut & Konsultasi)**: Balita berstatus *"Perlu Tinjau"* segera dijadwalkan intervensi gizi oleh dokter. Orang tua dapat membuka profil anak di rumah dan mengirimkan pertanyaan konsultasi melalui aplikasi.

---

## 9. Panduan Akses & Akun Uji Coba

Untuk keperluan simulasi, demonstrasi penguji, atau uji coba operasional, sistem menyediakan akun siap pakai:

| Peran Pengguna | Email Login | Password | Fungsi & Tujuan Akses |
| :--- | :--- | :---: | :--- |
| **Dokter / Tenaga Medis** | `dokter@gmail.com` | `123` | Mencatat rekam medis balita, memverifikasi hasil antropometri, menjalankan kalkulasi SPK, meninjau transparansi matriks SAW, dan membalas konsultasi orang tua. |
| **Administrator Sistem** | `admin@gmail.com` | `123` | Mengelola data pengguna, mengatur matriks perbandingan berpasangan AHP, mengelola data Posyandu, dan memantau audit aktivitas sistem. |
| **Orang Tua Balita** | `user@gmail.com` | `123` | Mendaftarkan balita baru, memantau grafik tumbuh kembang (KMS online), melihat riwayat pemeriksaan, dan mengajukan konsultasi kesehatan. |

*(Tersedia juga fitur **"Uji Coba 1-Klik"** pada halaman login untuk masuk langsung tanpa mengetik email dan kata sandi).*

---

## 10. Penafian Medis Resmi (Clinical Disclaimer)

> [!CAUTION]
> **PEMBERITAHUAN PENTING KESELAMATAN KLINIS:**  
> Sistem Pendukung Keputusan (SPK) Balita Sehat Posyandu adalah **perangkat lunak bantu administratif dan skrining awal** (*screening decision support tool*).  
> 
> Nilai preferensi ($V_i$), peringkat SAW, maupun status *"Perlu Tinjau"* yang dihasilkan oleh sistem ini **BUKAN merupakan diagnosis medis final atau vonis patologis mutlak**.  
> Penegakan diagnosis penyakit, terapi nutrisi khusus, penetapan status gagal tumbuh (*failure to thrive*), serta tindakan medis lainnya **tetap merupakan wewenang mutlak dokter spesialis anak, dokter umum, atau tenaga medis berwenang** di Puskesmas dan Rumah Sakit.

---

> **Informasi Pengembang:**  
> Dikembangkan dengan arsitektur modern React 19, Vite, Tailwind CSS, Recharts, dan Supabase PostgreSQL Cloud.  
> *Hak Cipta © 2026 Tim Pengembang SPK Balita Sehat Posyandu.*