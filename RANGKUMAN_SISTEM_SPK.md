# RANGKUMAN SISTEM PENDUKUNG KEPUTUSAN (SPK) PEMANTAUAN KESEHATAN & TUMBUH KEMBANG BALITA POSYANDU
> **Dokumen Referensi Teknis, Metodologis, Kriteria, dan Alternatif**  
> *Disusun sebagai bahan acuan komprehensif untuk diskusi, evaluasi klinis, dan sesi brainstorming.*

---

## DAFTAR ISI
1. [Latar Belakang & Tujuan Sistem](#1-latar-belakang--tujuan-sistem)
2. [Arsitektur Kriteria SPK & Standarisasi Skor (Skala 1–4)](#2-arsitektur-kriteria-spk--standarisasi-skor-skala-14)
3. [Diferensiasi Model Berdasarkan Usia (5 Kriteria vs 4 Kriteria)](#3-diferensiasi-model-berdasarkan-usia-5-kriteria-vs-4-kriteria)
4. [Metodologi & Formulasi Matematis Perhitungan](#4-metodologi--formulasi-matematis-perhitungan)
   - [A. Analytic Hierarchy Process (AHP) — Pembobotan Kriteria](#a-analytic-hierarchy-process-ahp--pembobotan-kriteria)
   - [B. Simple Additive Weighting (SAW) — Perankingan Alternatif](#b-simple-additive-weighting-saw--perankingan-alternatif)
5. [Cohort Alternatif Balita & Aturan Isolasi Klinis](#5-cohort-alternatif-balita--aturan-isolasi-klinis)
6. [Validasi Benchmark Simulasi Excel (12 Balita Acuan)](#6-validasi-benchmark-simulasi-excel-12-balita-acuan)
7. [Klasifikasi Status Klinis (Normal vs Perlu Tinjau)](#7-klasifikasi-status-klinis-normal-vs-perlu-tinjau)
8. [Arsitektur Peran Pengguna & Alur Kerja Sistem](#8-arsitektur-peran-pengguna--alur-kerja-sistem)
9. [Fitur Antarmuka & UX Terbaru](#9-fitur-antarmuka--ux-terbaru)
10. [Topik Diskusi & Rekomendasi Brainstorming Lanjutan](#10-topik-diskusi--rekomendasi-brainstorming-lanjutan)

---

## 1. Latar Belakang & Tujuan Sistem

Sistem Pendukung Keputusan (SPK) Balita Sehat dikembangkan untuk membantu tenaga kesehatan dan kader Posyandu dalam menilai dan memantau status tumbuh kembang balita secara terukur, objektif, dan transparan.

### Masalah yang Diselesaikan:
1. **Penilaian Konvensional yang Terpisah-pisah**: Sering kali berat badan, tinggi badan, imunisasi, dan asupan makan dinilai secara parsial tanpa agregasi nilai yang mencerminkan kesehatan menyeluruh balita.
2. **Subjektivitas Penentuan Prioritas Intervensi**: Sulitnya mengidentifikasi balita yang memerlukan evaluasi atau intervensi klinis terlebih dahulu di antara puluhan balita dalam satu posyandu.
3. **Ketidaksesuaian Standar Usia**: Menilai anak usia 1 bulan dengan standar makan yang sama dengan anak 2 tahun merupakan kekeliruan klinis; sistem ini mengotomatiskan isolasi kohor umur.

### Pendekatan Solusi (Hybrid AHP + SAW):
- **AHP (Analytic Hierarchy Process)**: Digunakan untuk menentukan bobot kepentingan relatif antar-kriteria secara konsisten ($CR \le 0.10$) berdasarkan pertimbangan medis dan standar klinis.
- **SAW (Simple Additive Weighting)**: Digunakan untuk memproses normalisasi data alternatif balita dan menghasilkan nilai preferensi ($V_i$) akhir serta peringkat balita secara transparan.
- **Standar Medis Acuan**:
  - **Permenkes RI No. 2 Tahun 2020** tentang Standar Antropometri Anak.
  - **WHO Child Growth Standards** (Z-Score SD: BB/U, PB/U atau TB/U, LK/U).
  - **Pedoman Praktik Pemberian Makan Bayi dan Anak (PMBA)** Kemenkes RI.
  - **Jadwal Imunisasi Dasar Lengkap Nasional** (Kemenkes & IDAI).

---

## 2. Arsitektur Kriteria SPK & Standarisasi Skor (Skala 1–4)

### Mengapa Diperlukan Standarisasi Skor Ordinal?
Pada antropometri fisik, nilai riil (kg atau cm) bersifat non-linear dan memiliki rentang optimum di tengah (-2 SD s/d +1 SD). Nilai yang terlalu rendah (gizi buruk / stunting) maupun terlalu tinggi (obesitas / makrosefali) sama-sama berisiko klinis.

Oleh karena itu, seluruh nilai riil dikonversikan terlebih dahulu ke dalam **Skala Skor Ordinal 1 s/d 4** sebelum diproses oleh metode SAW. Dengan konversi ini:
- Seluruh kriteria menjadi **Benefit murni** (nilai 4 adalah kondisi paling prima/ideal).
- Nilai ekstrem bawah dan ekstrem atas secara adil diberi skor rendah (Skor 1 atau 2).

### Rincian 5 Kriteria Baku

| Kode | Kriteria | Parameter Ukur Riil | Skala SAW | Deskripsi Skoring (1 - 4) |
| :---: | :--- | :---: | :---: | :--- |
| **K1** | Berat Badan menurut Umur (BB/U) | Kilogram (kg) | 1 - 4 | • **4**: Normal / Ideal (-2 s.d +1 SD)<br>• **3**: Agak Lebih (+1 s.d +2 SD)<br>• **2**: Kurang (-3 s.d -2 SD) / Kelebihan BB (+2 s.d +3 SD)<br>• **1**: Sangat Kurang (< -3 SD) / Risiko Obesitas (> +3 SD) |
| **K2** | Panjang / Tinggi Badan menurut Umur (PB/TB) | Sentimeter (cm) | 1 - 4 | • **4**: Normal / Ideal (-2 s.d +2 SD)<br>• **3**: Tinggi / Di Atas Rata-rata (> +2 SD)<br>• **2**: Pendek / *Stunted* (-3 s.d -2 SD)<br>• **1**: Sangat Pendek / *Severely Stunted* (< -3 SD) |
| **K3** | Lingkar Kepala menurut Umur (LK/U) | Sentimeter (cm) | 1 - 4 | • **4**: Normal / Proporsional (-2 s.d +2 SD)<br>• **2**: Batas Bawah (-3 s.d -2 SD) / Batas Atas (+2 s.d +3 SD)<br>• **1**: Mikrosefali (< -3 SD) / Makrosefali (> +3 SD) |
| **K4** | Riwayat Kelengkapan Imunisasi | Jumlah Dosis Riil (0 - 17) | 1 - 4 | Berdasarkan pencapaian target dosis kumulatif sesuai rentang kelompok usia balita:<br>• **4**: Lengkap (mencapai target ideal kelompok)<br>• **3**: Hampir Lengkap<br>• **2**: Kurang<br>• **1**: Sangat Kurang / Belum Imunisasi |
| **K5** | Asupan Gizi & Pola Makan Balita (PMBA) | Pemenuhan Indikator PMBA (1 - 4) | 1 - 4 | Evaluasi 4 pilar gizi anak (ASI/MP-ASI, keragaman menu 4 bintang, frekuensi cukup, higienitas):<br>• **4**: 4 Indikator terpenuhi (Sangat Sesuai / Ideal)<br>• **3**: 3 Indikator terpenuhi (Sesuai dengan Catatan)<br>• **2**: 2 Indikator terpenuhi (Kurang Sesuai)<br>• **1**: $\le 1$ Indikator terpenuhi (Defisit Berat) |

### Standar Pembagian Dosis Imunisasi (K4) per Tahapan Usia

Jadwal imunisasi dasar lengkap nasional tuntas pada usia 11 bulan dengan target maksimal **17 dosis kumulatif**:

| Kelompok Umur | Rentang Usia | Target Ideal | Skor 4 (Lengkap) | Skor 3 (Hampir Lengkap) | Skor 2 (Kurang) | Skor 1 (Sangat Kurang) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Kelompok 1** | 0 – 2 bulan | **6 dosis** | 6 | 5 | 3 – 4 | 0 – 2 |
| **Kelompok 2** | 3 – 5 bulan | **15 dosis** | 15 | 12 – 14 | 8 – 11 | 0 – 7 |
| **Kelompok 3** | 6 – 8 bulan | **15 dosis** | 15 | 12 – 14 | 8 – 11 | 0 – 7 |
| **Kelompok 4** | 9 – 11 bulan | **17 dosis** | 17 | 13 – 16 | 9 – 12 | 0 – 8 |
| **Kelompok 5 s/d 8** | 12 – 59 bulan | **17 dosis** | 17 | 13 – 16 | 9 – 12 | 0 – 8 |

---

## 3. Diferensiasi Model Berdasarkan Usia (5 Kriteria vs 4 Kriteria)

Berdasarkan tinjauan medis, bayi berusia di bawah 6 bulan masih berada dalam **periode ASI Eksklusif** dan belum menerima Makanan Pendamping ASI (MP-ASI). Oleh karena itu, sistem menerapkan dua arsitektur perhitungan yang beradaptasi secara otomatis:

```
                               ┌───────────────────────────────────┐
                               │     Usia Balita saat Diperiksa    │
                               └─────────────────┬─────────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
             [ Usia < 6 Bulan ]                                [ Usia ≥ 6 Bulan ]
        (Kelompok 1: 0-2 bln & Kelompok 2: 3-5 bln)          (Kelompok 3 s/d 8: 6-59 bulan)
                        │                                                 │
                        ▼                                                 ▼
             ┌─────────────────────┐                           ┌─────────────────────┐
             │  MODEL 4 KRITERIA   │                           │  MODEL 5 KRITERIA   │
             │   (K1, K2, K3, K4)  │                           │(K1, K2, K3, K4, K5) │
             └──────────┬──────────┘                           └──────────┬──────────┘
                        │                                                 │
           K5 dinonaktifkan otomatis                        K5 (PMBA) aktif penuh
           (Fase ASI Eksklusif)                             (Evaluasi gizi MP-ASI)
```

### Dampak Adaptasi Model pada Sistem:
1. **Formulir Pemeriksaan Fisik**:
   - Jika balita `< 6 bulan`, bagian input PMBA otomatis dikunci dan menampilkan kartu informasi *Fase ASI Eksklusif*.
   - Validasi formulir tidak lagi meminta input K5, dan ringkasan standarisasi skor menampilkan 4 kolom.
2. **Kalkulasi SPK (SAW)**:
   - Balita `< 6 bulan` dihitung murni dengan 4 kriteria menggunakan bobot prioritas AHP 4 kriteria ($n=4$).
   - Tidak ada penalti skor bagi bayi yang belum makan MP-ASI.
3. **Penyajian Data & Profil Balita**:
   - Kolom K5 menampilkan status `ASI Eksklusif (Nonaktif)`.
   - Riwayat pemeriksaan dan modal transparansi menunjukkan rincian kontribusi bobot 4 kriteria.

---

## 4. Metodologi & Formulasi Matematis Perhitungan

### A. Analytic Hierarchy Process (AHP) — Pembobotan Kriteria

AHP digunakan untuk mengukur prioritas kepentingan kriteria kesehatan balita melalui perbandingan berpasangan (*pairwise comparison*).

#### 1. Matriks Perbandingan Berpasangan ($A$)
Matriks berukuran $n \times n$ dengan sifat diagonal $a_{ii} = 1$ dan sifat resiprokal $a_{ji} = \frac{1}{a_{ij}}$.

##### a. Matriks 5 Kriteria (Usia $\ge 6$ Bulan)
$$\begin{array}{c|ccccc}
 & \text{K1 (BB)} & \text{K2 (TB)} & \text{K3 (LK)} & \text{K4 (Imun)} & \text{K5 (Gizi)} \\
\hline
\text{K1} & 1.000 & 1.000 & 1.450 & 0.290 & 0.500 \\
\text{K2} & 1.000 & 1.000 & 1.450 & 0.290 & 0.500 \\
\text{K3} & 0.690 & 0.690 & 1.000 & 0.200 & 0.345 \\
\text{K4} & 3.448 & 3.448 & 5.000 & 1.000 & 1.723 \\
\text{K5} & 2.000 & 2.000 & 2.900 & 0.580 & 1.000
\end{array}$$

##### b. Matriks 4 Kriteria (Usia $< 6$ Bulan / ASI Eksklusif)
$$\begin{array}{c|cccc}
 & \text{K1 (BB)} & \text{K2 (TB)} & \text{K3 (LK)} & \text{K4 (Imun)} \\
\hline
\text{K1} & 1.000 & 1.000 & 1.450 & 0.290 \\
\text{K2} & 1.000 & 1.000 & 1.450 & 0.290 \\
\text{K3} & 0.690 & 0.690 & 1.000 & 0.200 \\
\text{K4} & 3.448 & 3.448 & 5.000 & 1.000
\end{array}$$

#### 2. Tahap Normalisasi dan Vektor Bobot ($w$)
1. **Jumlah Kolom**: $S_j = \sum_{i=1}^n a_{ij}$
2. **Normalisasi Elemen**: $r_{ij} = \frac{a_{ij}}{S_j}$
3. **Bobot Prioritas Baris**: $w_i = \frac{1}{n} \sum_{j=1}^n r_{ij}$

#### 3. Uji Konsistensi Saaty (Consistency Ratio)
- **Eigenvalue Maksimum**: $\lambda_{\max} = \sum_{j=1}^n (S_j \times w_j)$
- **Consistency Index**: $CI = \frac{\lambda_{\max} - n}{n - 1}$
- **Consistency Ratio**: $CR = \frac{CI}{RI}$ *(dengan ambang batas konsistensi $CR \le 0.10$)*
  - $RI$ untuk $n=4$: $0.90$
  - $RI$ untuk $n=5$: $1.12$

#### 4. Hasil Verifikasi Matematis Bobot AHP Resmi

| Metrik AHP | Model 5 Kriteria ($\ge 6$ Bulan) | Model 4 Kriteria ($< 6$ Bulan) | Evaluasi |
| :--- | :---: | :---: | :--- |
| **K1: BB/U** | **$0.122833$** ($12.28\%$) | **$0.162920$** ($16.29\%$) | Terkalibrasi |
| **K2: PB/TB** | **$0.122833$** ($12.28\%$) | **$0.162920$** ($16.29\%$) | Terkalibrasi |
| **K3: LK/U** | **$0.084737$** ($8.47\%$) | **$0.112387$** ($11.24\%$) | Terkalibrasi |
| **K4: Imunisasi** | **$0.423687$** ($42.37\%$) | **$0.561772$** ($56.18\%$) | Prioritas Tertinggi |
| **K5: Asupan Gizi** | **$0.245910$** ($24.59\%$) | *Nonaktif (0.00%)* | Dinonaktifkan |
| **Total Bobot** | **$1.000000$** ($100.00\%$) | **$1.000000$** ($100.00\%$) | Presisi Sempurna |
| **$\lambda_{\max}$** | $5.000136$ | $4.000210$ | Mendekati $n$ |
| **CI** | $0.000034$ | $0.000070$ | Sangat Rendah |
| **RI** | $1.12$ | $0.90$ | Standar Saaty |
| **Consistency Ratio (CR)** | **$0.000030$** | **$0.000078$** | **Lulus ($CR \le 0.10$)** |

---

### B. Simple Additive Weighting (SAW) — Perankingan Alternatif

Metode SAW (dikenal juga sebagai metode penjumlahan terbobot) mencari penjumlahan terbobot dari rating kinerja pada setiap alternatif di semua kriteria.

#### 1. Matriks Keputusan ($X$)
Matriks berukuran $m \times n$, di mana $m$ adalah jumlah alternatif balita dalam kohor yang sama, dan $x_{ij} \in \{1, 2, 3, 4\}$ adalah skor terstandar kriteria ke-$j$ balita ke-$i$.

#### 2. Normalisasi Matriks Keputusan ($R$)
Karena seluruh kriteria telah diubah menjadi benefit:
$$r_{ij} = \frac{x_{ij}}{\max_{k=1}^m (x_{kj})}$$
Dalam skala standar 1 s/d 4, jika terdapat balita dengan nilai maksimal 4 pada kriteria tersebut, maka penyebutnya adalah 4:
$$r_{ij} = \frac{x_{ij}}{4}$$

#### 3. Nilai Preferensi ($V_i$)
Nilai preferensi untuk masing-masing alternatif balita dihitung dengan mengalikan bobot kriteria ($w_j$) dengan nilai ternormalisasi ($r_{ij}$):
$$V_i = \sum_{j=1}^n w_j \cdot r_{ij}$$
Alternatif dengan nilai $V_i$ tertinggi menunjukkan balita dengan kondisi pertumbuhan dan kepatuhan tumbuh kembang yang paling prima.

#### 4. Penanganan Tie-Breaking & Peringkat (Standard Competition Ranking 1224)
- Jika dua balita atau lebih memiliki nilai $V_i$ persis sama hingga presisi 7 desimal ($10^{-7}$), keduanya menempati peringkat yang sama (misal peringkat #1 bersama).
- Peringkat berikutnya dilewati sesuai jumlah alternatif yang setara (misal #1, #1, lalu langsung #3).
- Untuk determinasi tampilan list, digunakan tie-breaker sekunder stabil: nama balita alfabetis diikuti ID balita.

---

## 5. Cohort Alternatif Balita & Aturan Isolasi Klinis

Dalam dunia klinis, **membandingkan balita berbeda kelompok umur atau berbeda jenis kelamin adalah pelanggaran kaidah antropometri**. Pertumbuhan bayi laki-laki usia 3 bulan tidak boleh dinormalisasi bersama balita perempuan usia 36 bulan.

Oleh karena itu, modul SPK menerapkan **Isolasi Kohor & Periode**:

### 8 Master Kelompok Umur Penelitian Posyandu:
1. **Kelompok 1 (0 – 2 bulan)**: 0 – 2 bulan (Model 4 Kriteria, ASI Eksklusif)
2. **Kelompok 2 (3 – 5 bulan)**: 3 – 5 bulan (Model 4 Kriteria, ASI Eksklusif)
3. **Kelompok 3 (6 – 8 bulan)**: 6 – 8 bulan (Model 5 Kriteria, Awal MP-ASI)
4. **Kelompok 4 (9 – 11 bulan)**: 9 – 11 bulan (Model 5 Kriteria, Tuntas Imunisasi Dasar)
5. **Kelompok 5 (12 – 23 bulan)**: 12 – 23 bulan (Model 5 Kriteria, Baduta)
6. **Kelompok 6 (24 – 35 bulan)**: 24 – 35 bulan (Model 5 Kriteria, Balita Muda)
7. **Kelompok 7 (36 – 47 bulan)**: 36 – 47 bulan (Model 5 Kriteria, Balita Prasekolah)
8. **Kelompok 8 (48 – 59 bulan)**: 48 – 59 bulan (Model 5 Kriteria, Balita Akhir)

### Aturan Eksekusi Perhitungan SAW:
1. **Isolasi Kelompok Umur**: Seluruh balita dalam 1 kali kalkulasi wajib berada pada kelompok umur yang sama.
2. **Isolasi Periode (YYYY-MM)**: Hanya pemeriksaan terverifikasi pada bulan/tahun yang sama yang dapat dihitung bersamaan.
3. **Isolasi Jenis Kelamin**: Sistem mendukung pemfilteran khusus jenis kelamin (Laki-laki atau Perempuan) sesuai kurva antropometri spesifik jenis kelamin WHO/Permenkes.
4. **Unisitas Anak**: Setiap anak hanya memiliki 1 catatan rekam medis acuan per periode bulanan.

---

## 6. Validasi Benchmark Simulasi Excel (12 Balita Acuan)

Aplikasi telah divalidasi dan diuji secara matematis menggunakan 12 alternatif balita benchmark dari data simulasi Excel resmi:

### Data Uji 12 Balita (Kelompok Umur 4, Laki-Laki):

| No | Alternatif | K1 (BB) | K2 (TB) | K3 (LK) | K4 (Imun) | K5 (Gizi) | Skor SAW ($V_i$) | Status Klinis | Peringkat SAW |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: | :---: | :---: | :-: |
| 1 | **Kevin** | 4 | 4 | 4 | 4 | 4 | **$1.0000000$** | Normal | **#1** |
| 2 | **Hafizah** | 4 | 4 | 4 | 4 | 4 | **$1.0000000$** | Normal | **#1** |
| 3 | **Rehan** | 4 | 4 | 4 | 4 | 3 | **$0.9385225$** | Normal | **#3** |
| 4 | **Revi** | 4 | 4 | 4 | 4 | 3 | **$0.9385225$** | Normal | **#3** |
| 5 | **Tiara** | 4 | 4 | 4 | 4 | 3 | **$0.9385225$** | Normal | **#3** |
| 6 | **Bily** | 4 | 4 | 4 | 3 | 4 | **$0.8940782$** | Normal | **#6** |
| 7 | **Layla** | 4 | 4 | 4 | 3 | 4 | **$0.8940782$** | Normal | **#6** |
| 8 | **Suci** | 4 | 4 | 4 | 3 | 4 | **$0.8940782$** | Normal | **#6** |
| 9 | **Ega** | 2 | 4 | 4 | 4 | 3 | **$0.8771060$** | **Perlu Tinjau** | **#9** |
| 10 | **Rafael** | 4 | 4 | 4 | 3 | 3 | **$0.8326008$** | Normal | **#10** |
| 11 | **Hakim** | 4 | 4 | 4 | 3 | 2 | **$0.7711233$** | Normal | **#11** |
| 12 | **Haris** | 2 | 2 | 2 | 2 | 4 | **$0.6229550$** | **Perlu Tinjau** | **#12** |

> **Catatan Validasi**:  
> Seluruh output kalkulasi algoritma pada modul [`saw.js`](file:///c:/SPK/src/lib/spk/saw.js) dan [`spkService.js`](file:///c:/SPK/src/services/spkService.js) telah teruji **100% identik** dengan hasil simulasi manual Excel hingga digit presisi ke-7.

---

## 7. Klasifikasi Status Klinis (Normal vs Perlu Tinjau)

Sistem tidak hanya meranking balita berdasarkan skor, tetapi juga memisahkan penanganan klinis melalui **Status Flag**:

```
                                  ┌────────────────────────────┐
                                  │      Nilai Skor Balita     │
                                  └──────────────┬─────────────┘
                                                 │
                     ┌───────────────────────────┴───────────────────────────┐
                     ▼                                                       ▼
  [ Memenuhi Kriteria Evaluasi: ]                           [ Pertumbuhan Sesuai Standar: ]
  • K1 (BB/U) ≤ 2 (Kurang / Obesitas)                        • Seluruh skor fisik > 2
  • K2 (PB/TB) ≤ 2 (Pendek / Stunting)                       • Tidak ada skor 1
  • K3 (LK/U) = 1 (Mikro/Makrosefali)                        • Imunisasi memadai
  • K4 (Imunisasi) = 1 (Sangat Kurang)                       • Asupan gizi memadai
  • K5 (Gizi) = 1 (Defisit Berat - jika ≥ 6 bln)                             │
                     │                                                       ▼
                     ▼                                                ┌─────────────┐
              ┌──────────────┐                                        │   NORMAL    │
              │ PERLU TINJAU │                                        └─────────────┘
              └──────────────┘
```

### Signifikansi Klinis:
- Balita yang berstatus **Perlu Tinjau** ditandai dengan badge merah/oranye khusus di dashboard tenaga kesehatan dan kartu profil.
- Membantu dokter spesialis anak atau bidan puskesmas untuk segera menjadwalkan konseling gizi dan pemeriksaan fisik mendalam tanpa harus menyortir data manual.

---

## 8. Arsitektur Peran Pengguna & Alur Kerja Sistem

Sistem mendukung tiga peran dengan pembatasan hak akses yang jelas:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   3 ROLE PENGGUNA                                      │
├──────────────────────────┬──────────────────────────────┬──────────────────────────────┤
│    Orang Tua (Parent)    │     Kader/Nakes (Staff)      │     Administrator (Admin)    │
├──────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│• Pendaftaran balita baru │• Input hasil pemeriksaan     │• Manajemen user & akun       │
│• Pantau kurva pertumbuhan│• Verifikasi fisik balita     │• Konfigurasi bobot AHP       │
│• Riwayat rekam medis     │• Jalankan kalkulasi SPK      │• Manajemen Posyandu wilayah  │
│• Riwayat imunisasi       │• Monitor balita perlu tinjau │• Audit trail & log aktivitas │
│• Konsultasi nakes        │• Analisis cohort per kelompok│• Backup & pemeliharaan data  │
└──────────────────────────┴──────────────────────────────┴──────────────────────────────┘
```

### Alur Siklus Hidup Pemeriksaan (Data Lifecycle):
1. **Pendaftaran / Kunjungan**: Orang tua atau kader mencatat jadwal pemeriksaan balita.
2. **Pencatatan Antropometri**: Kader memasukkan BB, TB, LK, Dosis Imunisasi, dan Asupan Gizi (untuk usia $\ge 6$ bln).
3. **Live Standarisasi**: Sistem secara *real-time* mengonversi nilai ukur riil menjadi skor ordinal (1–4) dan menampilkan peringatan jika ada indikasi stunting atau gizi kurang.
4. **Verifikasi Fisik**: Tenaga kesehatan (dokter / bidan) memverifikasi keabsahan data fisik (`status: verified`).
5. **Kalkulasi SPK (AHP-SAW)**: Sistem menghitung bobot dan normalisasi SAW untuk kohor kelompok umur tersebut.
6. **Diseminasi Informasi**: Hasil peringkat dan status pemantauan langsung tersinkronisasi ke Dashboard Nakes dan Halaman Profil Orang Tua.

---

## 9. Fitur Antarmuka & UX Terbaru

Berdasarkan iterasi penyempurnaan desain terkini:
1. **Sidebar Sticky / Fixed**: Menu navigasi samping tetap terpancang rapi saat halaman di-scroll panjang, mencegah hilangnya navigasi pada halaman data tabel.
2. **Kartu Metrik Dashboard Interaktif**: Kartu statistik utama (*Pendaftaran Baru*, *Draf*, *Menunggu Verifikasi*, *Terverifikasi*, *Perlu Evaluasi*) dapat diklik langsung untuk memfilter dan menampilkan daftar balita terkait secara instan.
3. **Input Imunisasi Berbasis Dosis**: Menggantikan input persentase yang ambigu dengan jumlah dosis riil (0–17 dosis) sesuai KMS/buku KIA.
4. **Layout Grid 2x2 Antropometri & Imunisasi**: Menampilkan input Berat Badan, Tinggi Badan, Lingkar Kepala, dan Imunisasi dalam layout kotak 2×2 yang simetris, ringkas, dan mobile-friendly.
5. **Gaya Bahasa Profesional (Human-Centered & Clean)**: Menghapus teks deskripsi yang terlalu panjang, berbunga-bunga, atau bernuansa AI generatif, digantikan dengan label klinis yang to-the-point dan mudah dipahami tenaga medis di lapangan.

---

## 10. Topik Diskusi & Rekomendasi Brainstorming Lanjutan

Bagian ini dirancang khusus untuk memandu agenda diskusi pengembangan berikutnya:

### A. Evaluasi Klinis & Metodologis
1. **Validasi Bobot AHP oleh Tim Medis Puskesmas**:
   - Apakah bobot Imunisasi ($42.37\%$ pada model 5 kriteria dan $56.18\%$ pada model 4 kriteria) sudah ideal, atau perlu penyesuaian rasio terhadap Berat Badan dan Tinggi Badan?
   - Matriks AHP bersifat dinamis dan dapat disesuaikan kapan saja lewat modul [`AHPConfigPage.jsx`](file:///c:/SPK/src/pages/admin/AHPConfigPage.jsx) oleh Admin.
2. **Sub-kriteria untuk Asupan Gizi (K5)**:
   - Saat ini K5 dinilai dari 4 indikator umum PMBA. Apakah perlu disediakan checklist interaktif di form (misal: pilar karbohidrat, protein hewani, frekuensi makan, kebersihan air minum) sehingga skor 1–4 terisi otomatis dari checklist?
3. **Periode Transisi Usia 6 Bulan**:
   - Bayi tepat usia 6 bulan baru memulai hari pertama MP-ASI. Apakah perlu masa toleransi khusus untuk penilaian K5 pada bulan pertama MP-ASI?

### B. Fitur Tambahan & Automasi
1. **Ekspor Laporan Resmi (PDF / Excel)**:
   - Kebutuhan cetak rekapitulasi peringkat SPK bulanan untuk diserahkan ke Dinas Kesehatan atau arsip Puskesmas.
2. **Notifikasi WhatsApp / SMS Gateway**:
   - Pengingat otomatis jadwal posyandu dan jadwal imunisasi yang belum lengkap langsung ke ponsel orang tua balita.
3. **Grafik Kurva Pertumbuhan Interaktif (Z-Score CDC/WHO)**:
   - Integrasi kurva persentil visual (garis hijau, kuning, merah) pada halaman profil anak untuk memantau tren kenaikan berat badan tiap bulan (*KBM / Kenaikan Berat Minimal*).

---

> **Lokasi File Implementasi Utama:**
> - Kalkulasi AHP: [`src/lib/spk/ahp.js`](file:///c:/SPK/src/lib/spk/ahp.js)
> - Kalkulasi SAW: [`src/lib/spk/saw.js`](file:///c:/SPK/src/lib/spk/saw.js)
> - Standarisasi Skor: [`src/lib/spk/scoringStandard.js`](file:///c:/SPK/src/lib/spk/scoringStandard.js)
> - Unit Test Matematika: [`src/lib/spk/spk.test.js`](file:///c:/SPK/src/lib/spk/spk.test.js)
> - Formulir Pemeriksaan: [`src/pages/staff/ExaminationFormPage.jsx`](file:///c:/SPK/src/pages/staff/ExaminationFormPage.jsx)
> - Halaman Kalkulasi SPK: [`src/pages/staff/SPKCalculationPage.jsx`](file:///c:/SPK/src/pages/staff/SPKCalculationPage.jsx)
> - Konfigurasi Admin: [`src/pages/admin/AHPConfigPage.jsx`](file:///c:/SPK/src/pages/admin/AHPConfigPage.jsx)
