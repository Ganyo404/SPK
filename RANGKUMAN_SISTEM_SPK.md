# RANGKUMAN SISTEM PENDUKUNG KEPUTUSAN (SPK) PEMANTAUAN KESEHATAN & TUMBUH KEMBANG BALITA POSYANDU
> **Dokumen Referensi Teknis, Metodologis, Kriteria, dan Alternatif**  
> *Disusun sebagai bahan acuan komprehensif untuk diskusi, evaluasi klinis, sidang skripsi, dan sesi brainstorming.*

---

## DAFTAR ISI
1. [Latar Belakang & Tujuan Sistem](#1-latar-belakang--tujuan-sistem)
2. [Arsitektur Kriteria SPK & Standarisasi Nilai](#2-arsitektur-kriteria-spk--standarisasi-nilai)
   - [A. Kriteria Fisik & Antropometri (K1, K2, K3 — Skala Skor 1–4)](#a-kriteria-fisik--antropometri-k1-k2-k3--skala-skor-14)
   - [B. Kriteria Imunisasi (K4 — Berbasis Target Dosis Kumulatif)](#b-kriteria-imunisasi-k4--berbasis-target-dosis-kumulatif)
   - [C. Kriteria Asupan Makanan Balita (K5 — Komposit MDD & MMF Standar WHO/UNICEF)](#c-kriteria-asupan-makanan-balita-k5--komposit-mdd--mmf-standar-whounicef)
3. [Diferensiasi Model Berdasarkan Usia (8 Kelompok Umur R1–R8)](#3-diferensiasi-model-berdasarkan-usia-8-kelompok-umur-r1r8)
4. [Metodologi & Formulasi Matematis Perhitungan](#4-metodologi--formulasi-matematis-perhitungan)
   - [A. Analytic Hierarchy Process (AHP) — Pembobotan Kriteria](#a-analytic-hierarchy-process-ahp--pembobotan-kriteria)
   - [B. Simple Additive Weighting (SAW) — Perankingan Alternatif](#b-simple-additive-weighting-saw--perankingan-alternatif)
5. [Cohort Alternatif Balita & Aturan Isolasi Klinis](#5-cohort-alternatif-balita--aturan-isolasi-klinis)
6. [Validasi Benchmark Simulasi Excel (12 Balita Acuan)](#6-validasi-benchmark-simulasi-excel-12-balita-acuan)
7. [Klasifikasi Status Klinis (Normal vs Perlu Tinjau)](#7-klasifikasi-status-klinis-normal-vs-perlu-tinjau)
8. [Arsitektur Peran Pengguna & Alur Kerja Sistem](#8-arsitektur-peran-pengguna--alur-kerja-sistem)
9. [Fitur Antarmuka & UX Terbaru](#9-fitur-antarmuka--ux-terbaru)
10. [Dokumentasi Tangkapan Layar Resmi (Laporan/Skripsi)](#10-dokumentasi-tangkapan-layar-resmi-laporanskripsi)
11. [Topik Diskusi & Rekomendasi Brainstorming Lanjutan](#11-topik-diskusi--rekomendasi-brainstorming-lanjutan)

---

## 1. Latar Belakang & Tujuan Sistem

Sistem Pendukung Keputusan (SPK) Balita Sehat dikembangkan untuk membantu tenaga kesehatan (dokter/bidan) dan kader Posyandu dalam menilai, memantau, dan memprioritaskan status tumbuh kembang balita secara terukur, objektif, dan transparan.

### Masalah yang Diselesaikan:
1. **Penilaian Konvensional yang Terpisah-pisah**: Sering kali berat badan, tinggi badan, lingkar kepala, imunisasi, dan asupan makan dinilai secara parsial tanpa agregasi nilai yang mencerminkan kesehatan menyeluruh balita.
2. **Subjektivitas Penentuan Prioritas Intervensi**: Sulitnya mengidentifikasi balita yang memerlukan evaluasi klinis mendesak di antara puluhan balita dalam satu posyandu.
3. **Ketidaksesuaian Standar Usia**: Menilai anak usia 1 bulan dengan standar makan baduta merupakan kekeliruan klinis; sistem ini mengotomatiskan isolasi kohor umur dan diferensiasi kriteria secara ketat.

### Pendekatan Solusi (Hybrid AHP + SAW):
- **AHP (Analytic Hierarchy Process)**: Digunakan untuk menentukan bobot kepentingan relatif antar-kriteria secara konsisten ($CR \le 0.10$) berdasarkan hierarki medis dan pertimbangan dokter spesialis anak.
- **SAW (Simple Additive Weighting)**: Digunakan untuk memproses normalisasi data alternatif balita dan menghasilkan nilai preferensi ($V_i$) akhir serta peringkat balita secara transparan.
- **Standar Medis Acuan**:
  - **Permenkes RI No. 2 Tahun 2020** tentang Standar Antropometri Anak.
  - **WHO Child Growth Standards** (Z-Score SD: BB/U, PB/U atau TB/U, LK/U).
  - **Pedoman WHO/UNICEF IYCF (Infant and Young Child Feeding)** untuk indikator MDD (*Minimum Dietary Diversity*) dan MMF (*Minimum Meal Frequency*).
  - **Jadwal Imunisasi Dasar Lengkap Nasional** (Kemenkes RI & IDAI).

---

## 2. Arsitektur Kriteria SPK & Standarisasi Nilai

### A. Kriteria Fisik & Antropometri (K1, K2, K3 — Skala Skor 1–4)
Pada antropometri fisik, nilai riil ($kg$ atau $cm$) bersifat non-linear dan memiliki rentang optimum di tengah ($-2\text{ SD}$ s/d $+1\text{ SD}$ atau $+2\text{ SD}$). Nilai yang terlalu rendah (gizi buruk / stunting) maupun terlalu tinggi (risiko obesitas / makrosefali) sama-sama berisiko klinis.

Oleh karena itu, nilai riil dikonversikan terlebih dahulu ke dalam **Skala Skor Ordinal 1 s/d 4** sebelum diproses oleh metode SAW:
- Seluruh kriteria fisik menjadi **Benefit murni** (nilai 4 adalah kondisi paling prima/ideal).
- Nilai ekstrem bawah dan ekstrem atas secara adil diberi skor rendah (Skor 1 atau 2).

| Kode | Kriteria | Parameter Riil | Skala SAW | Deskripsi Skoring (1 - 4) |
| :---: | :--- | :---: | :---: | :--- |
| **K1** | Berat Badan menurut Umur (BB/U) | Kilogram (kg) | 1 - 4 | • **4**: Normal / Ideal ($-2\text{ SD}$ s.d $+1\text{ SD}$)<br>• **3**: Risiko BB Lebih ($+1\text{ SD}$ s.d $+2\text{ SD}$)<br>• **2**: BB Kurang ($-3\text{ SD}$ s.d $-2\text{ SD}$) / BB Lebih ($+2\text{ SD}$ s.d $+3\text{ SD}$)<br>• **1**: BB Sangat Kurang ($< -3\text{ SD}$) / Risiko Obesitas ($> +3\text{ SD}$) |
| **K2** | Panjang / Tinggi Badan menurut Umur (PB/TB) | Sentimeter (cm) | 1 - 4 | • **4**: Normal / Ideal ($-2\text{ SD}$ s.d $+2\text{ SD}$)<br>• **3**: Tinggi / Di Atas Rata-rata ($> +2\text{ SD}$)<br>• **2**: Pendek / *Stunted* ($-3\text{ SD}$ s.d $-2\text{ SD}$)<br>• **1**: Sangat Pendek / *Severely Stunted* ($< -3\text{ SD}$) |
| **K3** | Lingkar Kepala menurut Umur (LK/U) | Sentimeter (cm) | 1 - 4 | • **4**: Normal / Proporsional ($-2\text{ SD}$ s.d $+2\text{ SD}$)<br>• **2**: Batas Bawah ($-3\text{ SD}$ s.d $-2\text{ SD}$) / Batas Atas ($+2\text{ SD}$ s.d $+3\text{ SD}$)<br>• **1**: Mikrosefali ($< -3\text{ SD}$) / Makrosefali ($> +3\text{ SD}$) |

---

### B. Kriteria Imunisasi (K4 — Berbasis Target Dosis Kumulatif)
Riwayat imunisasi dinilai berdasarkan capaian jumlah dosis riil yang telah diterima balita dibandingkan target ideal kelompok umurnya (target maksimal 17 dosis pada usia 11 bulan):

| Kelompok Umur | Rentang Usia | Target Ideal | Skor 4 (Lengkap) | Skor 3 (Hampir Lengkap) | Skor 2 (Kurang) | Skor 1 (Sangat Kurang) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Kelompok 1 (R1)** | 0 – 2 bulan | **6 dosis** | 6 | 5 | 3 – 4 | 0 – 2 |
| **Kelompok 2 (R2)** | 3 – 5 bulan | **15 dosis** | 15 | 12 – 14 | 8 – 11 | 0 – 7 |
| **Kelompok 3 (R3)** | 6 – 8 bulan | **15 dosis** | 15 | 12 – 14 | 8 – 11 | 0 – 7 |
| **Kelompok 4 (R4)** | 9 – 11 bulan | **17 dosis** | 17 | 13 – 16 | 9 – 12 | 0 – 8 |
| **Kelompok 5 s/d 8** | 12 – 59 bulan | **17 dosis** | 17 | 13 – 16 | 9 – 12 | 0 – 8 |

---

### C. Kriteria Asupan Makanan Balita (K5 — Komposit MDD & MMF Standar WHO/UNICEF)
K5 merupakan kriteria komposit asupan makanan balita usia **6–23 bulan** yang dirancang dalam penelitian ini menggunakan dua pilar indikator pemberian makanan pendamping ASI WHO/UNICEF:
1. **Minimum Dietary Diversity (MDD)**
2. **Minimum Meal Frequency (MMF)**

> [!NOTE]
> K5 merupakan indeks komposit penelitian ini dan bukan skor resmi *Minimum Acceptable Diet* (MAD) WHO. K5 bernilai diskrit $0$, $0.5$, atau $1.0$ yang secara matematis sudah berada pada skala normalisasi $0 \le r_{i5} \le 1$ untuk metode SAW.

#### 1. Rumus Komposit K5:
$$K_5 = \frac{\text{MDD} + \text{MMF}}{2}$$

| MDD | MMF | Nilai K5 | Keterangan Klinis |
| :---: | :---: | :---: | :--- |
| **0** | **0** | **0.0** | Kedua indikator belum terpenuhi |
| **1** | **0** | **0.5** | Hanya MDD yang terpenuhi |
| **0** | **1** | **0.5** | Hanya MMF yang terpenuhi |
| **1** | **1** | **1.0** | Kedua indikator terpenuhi |

#### 2. Ketentuan Indikator MDD (Keragaman Pangan 24 Jam Terakhir):
Pengguna mencentang kelompok makanan yang dikonsumsi balita selama 24 jam terakhir dari 8 kelompok pangan:
1. ASI (Air Susu Ibu)
2. Biji-bijian, umbi-umbian, dan pangan pokok (nasi, jagung, gandum, kentang, ubi)
3. Kacang-kacangan dan biji-bijian (kacang hijau, kedelai, kacang merah, tahu, tempe)
4. Produk susu (susu formula, susu hewani, yoghurt, keju)
5. Daging dan ikan (daging sapi, ayam, ikan, hati, jeroan)
6. Telur (telur ayam, bebek, puyuh)
7. Buah dan sayuran kaya vitamin A (wortel, labu kuning, bayam, mangga matang, pepaya)
8. Buah dan sayuran lainnya (pisang, apel, tomat, buncis, brokoli)

**Ambang Keputusan MDD:**
$$\text{MDD} = \begin{cases} 1, & \text{jika jumlah kelompok makanan} \ge 5 \\ 0, & \text{jika jumlah kelompok makanan} < 5 \end{cases}$$

#### 3. Ketentuan Indikator MMF (Frekuensi Makan Sesuai Usia & Status ASI):
- **Balita yang masih mendapatkan ASI:**
  - Usia 6–8 bulan: minimal **2 kali** makan makanan padat/semi-padat/lunak $\implies \text{MMF} = 1$ (jika kurang $= 0$).
  - Usia 9–23 bulan: minimal **3 kali** makan makanan padat/semi-padat/lunak $\implies \text{MMF} = 1$ (jika kurang $= 0$).
  *(Catatan: ASI tidak dihitung sebagai kesempatan makan makanan padat/lunak).*
- **Balita yang TIDAK mendapatkan ASI (Non-Breastfed):**
  - Minimal **4 kali** total kesempatan makan dalam sehari (pemberian susu dapat dihitung sebagai kesempatan makan); **DAN**
  - Minimal **1 kali** pemberian makanan padat, semi-padat, atau lunak.
  - Jika kedua syarat terpenuhi $\implies \text{MMF} = 1$; jika salah satu tidak terpenuhi $\implies \text{MMF} = 0$.

---

## 3. Diferensiasi Model Berdasarkan Usia (8 Kelompok Umur R1–R8)

Sistem mengadopsi 8 master kelompok umur Posyandu dengan aturan aktivasi K5 yang sangat ketat:

| Kelompok | Rentang Umur | Status K5 | Model Kriteria | Dasar Pertimbangan Medis |
| :---: | :---: | :---: | :---: | :--- |
| **R1** | 0 – 2 bulan | **Tidak Aktif** | **Model 4 Kriteria (K1–K4)** | Periode ASI Eksklusif penuh, belum mengonsumsi MP-ASI |
| **R2** | 3 – 5 bulan | **Tidak Aktif** | **Model 4 Kriteria (K1–K4)** | Periode ASI Eksklusif penuh, belum mengonsumsi MP-ASI |
| **R3** | 6 – 8 bulan | **AKTIF** | **Model 5 Kriteria (K1–K5)** | Awal MP-ASI, wajib pemantauan MDD & MMF |
| **R4** | 9 – 11 bulan | **AKTIF** | **Model 5 Kriteria (K1–K5)** | MP-ASI lanjutan & tuntas imunisasi dasar |
| **R5** | 12 – 23 bulan | **AKTIF** | **Model 5 Kriteria (K1–K5)** | Baduta (Bawah Dua Tahun), pola makan keluarga transisi |
| **R6** | 24 – 35 bulan | **Tidak Aktif** | **Model 4 Kriteria (K1–K4)** | Tidak menerapkan ambang IYCF 6–23 bln; fokus antropometri & imunisasi |
| **R7** | 36 – 47 bulan | **Tidak Aktif** | **Model 4 Kriteria (K1–K4)** | Balita prasekolah; pola makan keluarga |
| **R8** | 48 – 59 bulan | **Tidak Aktif** | **Model 4 Kriteria (K1–K4)** | Balita akhir prasekolah; pola makan keluarga |

```
                              ┌───────────────────────────────────┐
                              │     Usia Balita saat Diperiksa    │
                              └─────────────────┬─────────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        [ Usia < 6 Bulan ATAU ≥ 24 Bulan ]                      [ Usia 6 s/d 23 Bulan ]
       (Kelompok R1, R2, R6, R7, R8: 0-5 & 24-59 bln)              (Kelompok R3, R4, R5: 6-23 bulan)
                       │                                                 │
                       ▼                                                 ▼
            ┌─────────────────────┐                           ┌─────────────────────┐
            │  MODEL 4 KRITERIA   │                           │  MODEL 5 KRITERIA   │
            │   (K1, K2, K3, K4)  │                           │(K1, K2, K3, K4, K5) │
            └──────────┬──────────┘                           └──────────┬──────────┘
                       │                                                 │
          • K5 Tidak Aktif (Dikecualikan)                   • K5 Aktif Penuh (MDD + MMF)
          • Tidak diberi nilai 0                            • Komposit Nilai: 0, 0.5, 1.0
          • Bobot K1-K4 dinormalisasi ulang ke 100%         • Bobot 5 Kriteria Baku AHP
```

### Aturan Perhitungan Model:
1. Umur balita ditentukan secara presisi berdasarkan selisih **tanggal pemeriksaan** dengan **tanggal lahir** (bukan sekadar tahun lahir atau pilihan manual).
2. Jika balita berada di luar rentang 6–23 bulan, K5 **dikeluarkan dari perhitungan SAW**, bukan diberi nilai 0.
3. Pada tampilan antarmuka dan laporan, kolom K5 untuk kelompok nonaktif menampilkan status: *"Tidak Berlaku untuk Kelompok Umur Ini"*.

---

## 4. Metodologi & Formulasi Matematis Perhitungan

### A. Analytic Hierarchy Process (AHP) — Pembobotan Kriteria

#### 1. Matriks Perbandingan Berpasangan ($A$)
Matriks berukuran $n \times n$ dengan syarat $a_{ii} = 1$ dan $a_{ji} = \frac{1}{a_{ij}}$.

##### a. Matriks 5 Kriteria Baku (Usia 6–23 Bulan: R3, R4, R5)
$$\begin{array}{c|ccccc}
 & \text{K1 (BB)} & \text{K2 (TB)} & \text{K3 (LK)} & \text{K4 (Imun)} & \text{K5 (Makan)} \\
\hline
\text{K1} & 1.000 & 1.000 & 1.450 & 0.290 & 0.500 \\
\text{K2} & 1.000 & 1.000 & 1.450 & 0.290 & 0.500 \\
\text{K3} & 0.690 & 0.690 & 1.000 & 0.200 & 0.345 \\
\text{K4} & 3.448 & 3.448 & 5.000 & 1.000 & 1.723 \\
\text{K5} & 2.000 & 2.000 & 2.900 & 0.580 & 1.000
\end{array}$$

##### b. Matriks 4 Kriteria Baku (Usia $<6$ Bulan & $\ge 24$ Bulan: R1, R2, R6, R7, R8)
$$\begin{array}{c|cccc}
 & \text{K1 (BB)} & \text{K2 (TB)} & \text{K3 (LK)} & \text{K4 (Imun)} \\
\hline
\text{K1} & 1.000 & 1.000 & 1.450 & 0.290 \\
\text{K2} & 1.000 & 1.000 & 1.450 & 0.290 \\
\text{K3} & 0.690 & 0.690 & 1.000 & 0.200 \\
\text{K4} & 3.448 & 3.448 & 5.000 & 1.000
\end{array}$$

#### 2. Uji Konsistensi Saaty (Consistency Ratio)
- $\lambda_{\max} = \sum_{j=1}^n (S_j \times w_j)$
- $CI = \frac{\lambda_{\max} - n}{n - 1}$
- $CR = \frac{CI}{RI}$ dengan nilai $RI_{n=4} = 0.90$ dan $RI_{n=5} = 1.12$.

#### 3. Hasil Pembobotan Resmi AHP Terverifikasi

| Metrik Evaluasi | Model 5 Kriteria (6–23 Bulan) | Model 4 Kriteria (<6 & $\ge 24$ Bulan) | Keterangan Evaluasi |
| :--- | :---: | :---: | :--- |
| **K1: BB/U** | **$0.122887$** ($12.29\%$) | **$0.162920$** ($16.29\%$) | Terkalibrasi Medis |
| **K2: PB/TB** | **$0.122887$** ($12.29\%$) | **$0.162920$** ($16.29\%$) | Terkalibrasi Medis |
| **K3: LK/U** | **$0.084775$** ($8.48\%$) | **$0.112387$** ($11.24\%$) | Terkalibrasi Medis |
| **K4: Imunisasi** | **$0.423678$** ($42.37\%$) | **$0.561772$** ($56.18\%$) | Prioritas Tertinggi |
| **K5: Asupan Makanan** | **$0.245774$** ($24.58\%$) | *Dikeluarkan (0.00%)* | Aktif Khusus Baduta |
| **Total Bobot** | **$1.000000$** ($100.00\%$) | **$1.000000$** ($100.00\%$) | Jumlah Tepat $1.0$ |
| **$\lambda_{\max}$** | $5.000136$ | $4.000210$ | Mendekati $n$ |
| **Consistency Index (CI)** | $0.000034$ | $0.000070$ | Sangat Rendah |
| **Consistency Ratio (CR)** | **$0.000030$** | **$0.000078$** | **KONSISTEN ($CR \le 0.10$)** |

---

### B. Simple Additive Weighting (SAW) — Perankingan Alternatif

#### 1. Aturan Normalisasi Matriks ($R$)
Karena seluruh kriteria telah diubah menjadi sifat benefit:
- Untuk kriteria fisik dan imunisasi ($K_1, K_2, K_3, K_4$):
  $$r_{ij} = \frac{x_{ij}}{\max_k(x_{kj})} \quad \implies \quad r_{ij} = \frac{x_{ij}}{4}$$
- Untuk kriteria asupan makanan ($K_5$):
  $$r_{i5} = K_5 \in \{0.0, \; 0.5, \; 1.0\}$$
  > **PENTING**: Nilai $K_5$ tidak dibagi dengan nilai maksimum sampel agar tidak terdistorsi ketika seluruh balita dalam satu kelompok memiliki nilai $K_5 < 1.0$. Nilai $0, 0.5, 1$ langsung digunakan sebagai nilai ternormalisasi.

#### 2. Nilai Preferensi ($V_i$)
$$V_i = \sum_{j=1}^n w_j \cdot r_{ij}$$
Alternatif dengan skor $V_i$ mendekati $1.0000000$ menunjukkan status tumbuh kembang paling ideal.

#### 3. Penanganan Tie-Breaking (Standard Competition Ranking 1224)
- Jika nilai $V_i$ sama hingga presisi float ($10^{-6}$), balita menempati peringkat yang sama (misal peringkat #1 bersama).
- Peringkat berikutnya melompat sesuai jumlah balita yang seri (1, 1, lalu 3).
- Untuk determinasi tampilan list, digunakan tie-breaker sekunder stabil: nama balita alfabetis diikuti ID balita.

---

## 5. Cohort Alternatif Balita & Aturan Isolasi Klinis

Sistem menerapkan **Isolasi Kohor, Periode, dan Gender**:
1. **Isolasi Kelompok Umur**: Balita hanya dibandingkan dengan balita pada kelompok umur yang sama ($R1$ s/d $R8$).
2. **Isolasi Periode (YYYY-MM)**: Hanya pemeriksaan valid pada bulan kalender yang sama yang dihitung dalam satu matriks.
3. **Isolasi Jenis Kelamin**: Tersedia filter khusus Laki-laki / Perempuan untuk mencocokkan kurva pertumbuhan spesifik jenis kelamin WHO.
4. **Unisitas Anak**: Setiap anak hanya memiliki satu catatan rekam medis acuan per periode.

---

## 6. Validasi Benchmark Simulasi Excel (12 Balita Acuan)

Hasil perhitungan algoritma pada [`src/lib/spk/saw.js`](file:///c:/SPK/src/lib/spk/saw.js) telah teruji **100% konsisten** dengan dataset benchmark Kelompok 4 (9–11 bulan) Periode 2026-10:

| No | Alternatif | K1 (BB) | K2 (TB) | K3 (LK) | K4 (Imun) | Nilai K5 | Skor SAW ($V_i$) | Status Klinis | Peringkat SAW |
| :-: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :-: |
| 1 | **Kevin** | 4 | 4 | 4 | 4 | **1.0** | **$1.0000000$** | Normal | **#1** |
| 2 | **Hafizah** | 4 | 4 | 4 | 4 | **1.0** | **$1.0000000$** | Normal | **#1** |
| 3 | **Rehan** | 4 | 4 | 4 | 4 | **0.5** | **$0.8771130$** | Normal | **#3** |
| 4 | **Revi** | 4 | 4 | 4 | 4 | **0.5** | **$0.8771130$** | Normal | **#3** |
| 5 | **Tiara** | 4 | 4 | 4 | 4 | **0.5** | **$0.8771130$** | Normal | **#3** |
| 6 | **Bily** | 4 | 4 | 4 | 3 | **1.0** | **$0.8940805$** | Normal | **#6** |
| 7 | **Layla** | 4 | 4 | 4 | 3 | **1.0** | **$0.8940805$** | Normal | **#6** |
| 8 | **Suci** | 4 | 4 | 4 | 3 | **1.0** | **$0.8940805$** | Normal | **#6** |
| 9 | **Rafael** | 4 | 4 | 4 | 3 | **0.5** | **$0.7711935$** | Normal | **#9** |
| 10 | **Ega** | 2 | 4 | 4 | 4 | **0.5** | **$0.8156696$** | **Perlu Tinjau** | **#10** |
| 11 | **Hakim** | 4 | 4 | 4 | 3 | **0.0** | **$0.6483067$** | **Perlu Tinjau** | **#11** |
| 12 | **Haris** | 2 | 2 | 2 | 2 | **1.0** | **$0.6229550$** | **Perlu Tinjau** | **#12** |

---

## 7. Klasifikasi Status Klinis (Normal vs Perlu Tinjau)

Sistem memisahkan evaluasi administratif peringkat SPK dari evaluasi medis keselamatan anak:

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
  • K3 (LK/U) = 1 (Mikro/Makrosefali)                        • Imunisasi memadai (skor ≥ 3)
  • K4 (Imunisasi) ≤ 2 (Kurang/Belum)                        • Asupan makanan memenuhi (K5 ≥ 0.5)
  • K5 (Makanan) = 0.0 (Kedua indikator defisit)                             │
                     │                                                       ▼
                     ▼                                                ┌─────────────┐
              ┌──────────────┐                                        │   NORMAL    │
              │ PERLU TINJAU │                                        └─────────────┘
              └──────────────┘
```

---

## 8. Arsitektur Peran Pengguna & Alur Kerja Sistem

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   3 ROLE PENGGUNA                                      │
├──────────────────────────┬──────────────────────────────┬──────────────────────────────┤
│    Orang Tua (Parent)    │     Kader/Nakes (Staff)      │     Administrator (Admin)    │
├──────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│• Pendaftaran balita baru │• Input hasil pemeriksaan     │• Manajemen user & akun       │
│• Pantau kurva antropometri│• Verifikasi fisik balita    │• Konfigurasi matriks AHP     │
│• Riwayat rekam medis     │• Jalankan kalkulasi SPK      │• Manajemen Posyandu wilayah  │
│• Riwayat imunisasi       │• Monitor balita perlu tinjau │• Audit trail & log aktivitas │
│• Konsultasi nakes        │• Analisis kohor per kelompok │• Backup & reset sistem data  │
└──────────────────────────┴──────────────────────────────┴──────────────────────────────┘
```

---

## 9. Fitur Antarmuka & UX Terbaru

1. **Sidebar Sticky / Fixed**: Menu navigasi samping tetap terpancang rapi saat halaman di-scroll panjang.
2. **Kartu Dashboard Interaktif**: Kartu statistik utama (*Pendaftaran Baru*, *Draf*, *Menunggu Verifikasi*, *Terverifikasi*, *Perlu Evaluasi*) dapat diklik langsung untuk memfilter dan menampilkan daftar balita terkait secara instan.
3. **Formulir K5 Cerdas (WHO/UNICEF)**: 8 Checkbox kelompok pangan MDD dengan kalkulasi otomatis jumlah kelompok dan indikator frekuensi makan MMF interaktif.
4. **Input Imunisasi Berbasis Dosis**: Menggantikan persentase dengan jumlah dosis riil (0–17 dosis) sesuai KMS/Buku KIA.
5. **Layout Grid 2x2 Antropometri & Imunisasi**: Menampilkan input Berat Badan, Tinggi Badan, Lingkar Kepala, dan Imunisasi dalam layout kotak 2×2 yang simetris dan ringkas.
6. **Live Standarisasi & Status Flag Real-Time**: Hasil standarisasi Z-score dan komposit K5 langsung terhitung otomatis saat data diketik tanpa perlu menekan tombol refresh.

---

## 10. Dokumentasi Tangkapan Layar Resmi (Laporan/Skripsi)

Seluruh tangkapan layar antarmuka sistem beresolusi tinggi (*Retina Scale 1.5*) tersimpan rapi pada direktori:
`c:\SPK\screenshoot\`

| Nomor | Nama Berkas Gambar | Halaman Terkait | Deskripsi Konten |
| :---: | :--- | :--- | :--- |
| **Gambar 3** | [Gambar 3. Antarmuka pencatatan indikator pemeriksaan balita.png](file:///c:/SPK/screenshoot/Gambar%203.%20Antarmuka%20pencatatan%20indikator%20pemeriksaan%20balita.png) | `ExaminationFormPage.jsx` | Antarmuka formulir pencatatan: identitas balita (10 bulan, laki-laki), input fisik 2x2 (BB, TB, LK, Imunisasi), formulir asupan makanan (MDD 8 kelompok & MMF), serta kartu standarisasi skor $K1-K5$. |
| **Gambar 4** | [Gambar 4. Antarmuka pembobotan kriteria menggunakan metode AHP.png](file:///c:/SPK/screenshoot/Gambar%204.%20Antarmuka%20pembobotan%20kriteria%20menggunakan%20metode%20AHP.png) | `AHPConfigPage.jsx` | Matriks perbandingan berpasangan $5 \times 5$, bobot prioritas kriteria ($K1-K5$), $\lambda_{\max} = 5.000136$, $CI = 0.000034$, dan $CR = 0.000030$ (Konsisten). |
| **Gambar 5** | [Gambar 5. Hasil pemeringkatan alternatif balita menggunakan SAW.png](file:///c:/SPK/screenshoot/Gambar%205.%20Hasil%20pemeringkatan%20alternatif%20balita%20menggunakan%20SAW.png) | `SPKCalculationPage.jsx` | Hasil perankingan SAW untuk Kelompok 4 (9–11 bulan) Periode 2026-10: tabel alternatif, nilai preferensi $V_i$, data mentah, skor terstandar, dan urutan ranking. |
| **Gambar 6** | [Gambar 6. Rincian normalisasi dan perhitungan nilai preferensi.png](file:///c:/SPK/screenshoot/Gambar%206.%20Rincian%20normalisasi%20dan%20perhitungan%20nilai%20preferensi.png) | `SPKCalculationPage.jsx` (Modal Matriks SAW) | Modal transparansi matriks normalisasi $R_{ij}$ ($R1-R5$), bobot AHP, nilai preferensi akhir $V_i$, dan status tinjauan klinis untuk seluruh alternatif. |
| **Gambar 6b** | [Gambar 6b. Rincian kontribusi bobot alternatif SAW.png](file:///c:/SPK/screenshoot/Gambar%206b.%20Rincian%20kontribusi%20bobot%20alternatif%20SAW.png) | `SPKCalculationPage.jsx` (Modal Rincian Alternatif) | Rincian kontribusi perkalian bobot dengan nilai normalisasi ($w_j \times r_{ij}$) per kriteria untuk alternatif balita tertentu, sangat berguna untuk verifikasi hitungan manual di bab pembahasan skripsi. |

---

## 11. Topik Diskusi & Rekomendasi Brainstorming Lanjutan

1. **Uji Validitas Eksternal**: Membandingkan hasil perankingan SPK dengan penilaian manual dokter spesialis anak di Puskesmas setempat.
2. **Fleksibilitas Ambang Usia Transisi**: Evaluasi balita pada usia tepat 6 bulan (hari-hari awal pengenalan MP-ASI).
3. **Ekspor Rekap Laporan Resmi (PDF/Excel)**: Penambahan fitur cetak rekapitulasi penilaian bulanan berstandar format laporan Puskesmas/Dinas Kesehatan.
4. **Integrasi WhatsApp Reminder**: Notifikasi otomatis jadwal imunisasi yang tertunda kepada orang tua balita.

---

> **Lokasi File Implementasi Utama:**
> - Engine AHP: [`src/lib/spk/ahp.js`](file:///c:/SPK/src/lib/spk/ahp.js)
> - Engine SAW: [`src/lib/spk/saw.js`](file:///c:/SPK/src/lib/spk/saw.js)
> - Standarisasi Skor: [`src/lib/spk/scoringStandard.js`](file:///c:/SPK/src/lib/spk/scoringStandard.js)
> - Unit Test Otomatis: [`src/lib/spk/spk.test.js`](file:///c:/SPK/src/lib/spk/spk.test.js)
> - Formulir Pemeriksaan: [`src/pages/staff/ExaminationFormPage.jsx`](file:///c:/SPK/src/pages/staff/ExaminationFormPage.jsx)
> - Kalkulasi SPK: [`src/pages/staff/SPKCalculationPage.jsx`](file:///c:/SPK/src/pages/staff/SPKCalculationPage.jsx)
> - Konfigurasi Admin: [`src/pages/admin/AHPConfigPage.jsx`](file:///c:/SPK/src/pages/admin/AHPConfigPage.jsx)
