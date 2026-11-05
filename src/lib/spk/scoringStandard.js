/**
 * SPK BALITA SEHAT - MODUL STANDARISASI SKORING (PERMENKES NO. 2 TAHUN 2020 & WHO)
 * Mengonversi nilai ukur riil (BB, TB, LK, Imunisasi, Asupan Gizi) menjadi skor ordinal (1 s/d 4)
 * sehingga seluruh kriteria menjadi kriteria benefit murni dalam perhitungan SAW.
 * 
 * Skala Skoring SAW:
 * - Skor 4: Ideal / Normal / Tepat Waktu / Sangat Sesuai (Kondisi balita paling optimal)
 * - Skor 3: Agak Lebih / Tinggi / Hampir Lengkap / Sesuai dengan Catatan
 * - Skor 2: Kurang / Kelebihan BB / Pendek (Stunted) / Batas Perhatian / Kurang Sesuai
 * - Skor 1: Sangat Kurang / Risiko Obesitas / Sangat Pendek (Severely Stunted) / Mikrosefali / Makrosefali / Defisit Berat
 */

// Master Tabel Ambang Batas Antropometri (Permenkes RI & WHO) per 8 Kelompok Umur & Jenis Kelamin
export const ANTHROPOMETRIC_STANDARDS = {
  // Kelompok 1: 0 - 2 bulan
  1: {
    name: 'Kelompok 1 (0 - 2 bulan)',
    rangeLabel: '0 - 2 bulan',
    L: {
      BB: [
        { max: 2.49, score: 1, label: 'Sangat Kurang (< 2.5 kg)' },
        { min: 2.5, max: 4.39, score: 2, label: 'Kurang (2.5 - 4.3 kg)' },
        { min: 4.4, max: 6.29, score: 4, label: 'Ideal / Normal (4.4 - 6.2 kg)' },
        { min: 6.3, max: 7.19, score: 3, label: 'Agak Lebih (6.3 - 7.1 kg)' },
        { min: 7.2, max: 7.89, score: 2, label: 'Kelebihan BB (7.2 - 7.8 kg)' },
        { min: 7.9, score: 1, label: 'Risiko Obesitas (> 7.8 kg)' }
      ],
      TB: [
        { max: 46.29, score: 1, label: 'Sangat Pendek (< 46.3 cm)' },
        { min: 46.3, max: 54.39, score: 2, label: 'Pendek / Stunted (46.3 - 54.3 cm)' },
        { min: 54.4, max: 63.89, score: 4, label: 'Normal / Ideal (54.4 - 63.8 cm)' },
        { min: 63.9, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 63.8 cm)' }
      ],
      LK: [
        { max: 32.09, score: 1, label: 'Mikrosefali (< 32.1 cm)' },
        { min: 32.1, max: 36.89, score: 2, label: 'Batas Bawah (32.1 - 36.8 cm)' },
        { min: 36.9, max: 41.59, score: 4, label: 'Normal / Ideal (36.9 - 41.5 cm)' },
        { min: 41.6, max: 42.59, score: 2, label: 'Batas Atas (41.6 - 42.5 cm)' },
        { min: 42.6, score: 1, label: 'Makrosefali (> 42.5 cm)' }
      ]
    },
    P: {
      BB: [
        { max: 2.39, score: 1, label: 'Sangat Kurang (< 2.4 kg)' },
        { min: 2.4, max: 3.99, score: 2, label: 'Kurang (2.4 - 3.9 kg)' },
        { min: 4.0, max: 5.79, score: 4, label: 'Ideal / Normal (4.0 - 5.7 kg)' },
        { min: 5.8, max: 6.69, score: 3, label: 'Agak Lebih (5.8 - 6.6 kg)' },
        { min: 6.7, max: 7.39, score: 2, label: 'Kelebihan BB (6.7 - 7.3 kg)' },
        { min: 7.4, score: 1, label: 'Risiko Obesitas (> 7.3 kg)' }
      ],
      TB: [
        { max: 45.59, score: 1, label: 'Sangat Pendek (< 45.6 cm)' },
        { min: 45.6, max: 53.19, score: 2, label: 'Pendek / Stunted (45.6 - 53.1 cm)' },
        { min: 53.2, max: 62.59, score: 4, label: 'Normal / Ideal (53.2 - 62.5 cm)' },
        { min: 62.6, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 62.5 cm)' }
      ],
      LK: [
        { max: 31.69, score: 1, label: 'Mikrosefali (< 31.7 cm)' },
        { min: 31.7, max: 35.79, score: 2, label: 'Batas Bawah (31.7 - 35.7 cm)' },
        { min: 35.8, max: 40.59, score: 4, label: 'Normal / Ideal (35.8 - 40.5 cm)' },
        { min: 40.6, max: 41.59, score: 2, label: 'Batas Atas (40.6 - 41.5 cm)' },
        { min: 41.6, score: 1, label: 'Makrosefali (> 41.5 cm)' }
      ]
    }
  },

  // Kelompok 2: 3 - 5 bulan
  2: {
    name: 'Kelompok 2 (3 - 5 bulan)',
    rangeLabel: '3 - 5 bulan',
    L: {
      BB: [
        { max: 4.39, score: 1, label: 'Sangat Kurang (< 4.4 kg)' },
        { min: 4.4, max: 6.09, score: 2, label: 'Kurang (4.4 - 6.0 kg)' },
        { min: 6.1, max: 8.39, score: 4, label: 'Ideal / Normal (6.1 - 8.3 kg)' },
        { min: 8.4, max: 8.89, score: 3, label: 'Agak Lebih (8.4 - 8.8 kg)' },
        { min: 8.9, max: 9.59, score: 2, label: 'Kelebihan BB (8.9 - 9.5 kg)' },
        { min: 9.6, score: 1, label: 'Risiko Obesitas (> 9.5 kg)' }
      ],
      TB: [
        { max: 55.59, score: 1, label: 'Sangat Pendek (< 55.6 cm)' },
        { min: 55.6, max: 61.89, score: 2, label: 'Pendek / Stunted (55.6 - 61.8 cm)' },
        { min: 61.9, max: 70.19, score: 4, label: 'Normal / Ideal (61.9 - 70.1 cm)' },
        { min: 70.2, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 70.1 cm)' }
      ],
      LK: [
        { max: 37.19, score: 1, label: 'Mikrosefali (< 37.2 cm)' },
        { min: 37.2, max: 39.99, score: 2, label: 'Batas Bawah (37.2 - 39.9 cm)' },
        { min: 40.0, max: 44.79, score: 4, label: 'Normal / Ideal (40.0 - 44.7 cm)' },
        { min: 44.8, max: 45.79, score: 2, label: 'Batas Atas (44.8 - 45.7 cm)' },
        { min: 45.8, score: 1, label: 'Makrosefali (> 45.7 cm)' }
      ]
    },
    P: {
      BB: [
        { max: 3.99, score: 1, label: 'Sangat Kurang (< 4.0 kg)' },
        { min: 4.0, max: 5.49, score: 2, label: 'Kurang (4.0 - 5.4 kg)' },
        { min: 5.5, max: 7.79, score: 4, label: 'Ideal / Normal (5.5 - 7.7 kg)' },
        { min: 7.8, max: 8.29, score: 3, label: 'Agak Lebih (7.8 - 8.2 kg)' },
        { min: 8.3, max: 8.99, score: 2, label: 'Kelebihan BB (8.3 - 8.9 kg)' },
        { min: 9.0, score: 1, label: 'Risiko Obesitas (> 8.9 kg)' }
      ],
      TB: [
        { max: 53.99, score: 1, label: 'Sangat Pendek (< 54.0 cm)' },
        { min: 54.0, max: 60.09, score: 2, label: 'Pendek / Stunted (54.0 - 60.0 cm)' },
        { min: 60.1, max: 68.59, score: 4, label: 'Normal / Ideal (60.1 - 68.5 cm)' },
        { min: 68.6, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 68.5 cm)' }
      ],
      LK: [
        { max: 36.09, score: 1, label: 'Mikrosefali (< 36.1 cm)' },
        { min: 36.1, max: 38.79, score: 2, label: 'Batas Bawah (36.1 - 38.7 cm)' },
        { min: 38.8, max: 43.69, score: 4, label: 'Normal / Ideal (38.8 - 43.6 cm)' },
        { min: 43.7, max: 44.69, score: 2, label: 'Batas Atas (43.7 - 44.6 cm)' },
        { min: 44.7, score: 1, label: 'Makrosefali (> 44.6 cm)' }
      ]
    }
  },

  // Kelompok 3: 6 - 8 bulan
  3: {
    name: 'Kelompok 3 (6 - 8 bulan)',
    rangeLabel: '6 - 8 bulan',
    L: {
      BB: [
        { max: 5.69, score: 1, label: 'Sangat Kurang (< 5.7 kg)' },
        { min: 5.7, max: 6.99, score: 2, label: 'Kurang (5.7 - 6.9 kg)' },
        { min: 7.0, max: 9.59, score: 4, label: 'Ideal / Normal (7.0 - 9.5 kg)' },
        { min: 9.6, max: 10.29, score: 3, label: 'Agak Lebih (9.6 - 10.2 kg)' },
        { min: 10.3, max: 11.09, score: 2, label: 'Kelebihan BB (10.3 - 11.0 kg)' },
        { min: 11.1, score: 1, label: 'Risiko Obesitas (> 11.0 kg)' }
      ],
      TB: [
        { max: 61.19, score: 1, label: 'Sangat Pendek (< 61.2 cm)' },
        { min: 61.2, max: 66.99, score: 2, label: 'Pendek / Stunted (61.2 - 66.9 cm)' },
        { min: 67.0, max: 74.89, score: 4, label: 'Normal / Ideal (67.0 - 74.8 cm)' },
        { min: 74.9, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 74.8 cm)' }
      ],
      LK: [
        { max: 40.09, score: 1, label: 'Mikrosefali (< 40.1 cm)' },
        { min: 40.1, max: 42.19, score: 2, label: 'Batas Bawah (40.1 - 42.1 cm)' },
        { min: 42.2, max: 46.49, score: 4, label: 'Normal / Ideal (42.2 - 46.4 cm)' },
        { min: 46.5, max: 47.49, score: 2, label: 'Batas Atas (46.5 - 47.4 cm)' },
        { min: 47.5, score: 1, label: 'Makrosefali (> 47.4 cm)' }
      ]
    },
    P: {
      BB: [
        { max: 5.09, score: 1, label: 'Sangat Kurang (< 5.1 kg)' },
        { min: 5.1, max: 6.39, score: 2, label: 'Kurang (5.1 - 6.3 kg)' },
        { min: 6.4, max: 8.99, score: 4, label: 'Ideal / Normal (6.4 - 8.9 kg)' },
        { min: 9.0, max: 9.69, score: 3, label: 'Agak Lebih (9.0 - 9.6 kg)' },
        { min: 9.7, max: 10.49, score: 2, label: 'Kelebihan BB (9.7 - 10.4 kg)' },
        { min: 10.5, score: 1, label: 'Risiko Obesitas (> 10.4 kg)' }
      ],
      TB: [
        { max: 59.29, score: 1, label: 'Sangat Pendek (< 59.3 cm)' },
        { min: 59.3, max: 65.29, score: 2, label: 'Pendek / Stunted (59.3 - 65.2 cm)' },
        { min: 65.3, max: 73.39, score: 4, label: 'Normal / Ideal (65.3 - 73.3 cm)' },
        { min: 73.4, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 73.3 cm)' }
      ],
      LK: [
        { max: 38.79, score: 1, label: 'Mikrosefali (< 38.8 cm)' },
        { min: 38.8, max: 40.89, score: 2, label: 'Batas Bawah (38.8 - 40.8 cm)' },
        { min: 40.9, max: 45.49, score: 4, label: 'Normal / Ideal (40.9 - 45.4 cm)' },
        { min: 45.5, max: 46.49, score: 2, label: 'Batas Atas (45.5 - 46.4 cm)' },
        { min: 46.5, score: 1, label: 'Makrosefali (> 46.4 cm)' }
      ]
    }
  },

  // Kelompok 4: 9 - 11 bulan
  4: {
    name: 'Kelompok 4 (9 - 11 bulan)',
    rangeLabel: '9 - 11 bulan',
    L: {
      BB: [
        { max: 6.39, score: 1, label: 'Sangat Kurang (< 6.4 kg)' },
        { min: 6.4, max: 7.69, score: 2, label: 'Kurang (6.4 - 7.6 kg)' },
        { min: 7.7, max: 10.49, score: 4, label: 'Ideal / Normal (7.7 - 10.4 kg)' },
        { min: 10.5, max: 11.59, score: 3, label: 'Agak Lebih (10.5 - 11.5 kg)' },
        { min: 11.6, max: 12.39, score: 2, label: 'Kelebihan BB (11.6 - 12.3 kg)' },
        { min: 12.4, score: 1, label: 'Risiko Obesitas (> 12.3 kg)' }
      ],
      TB: [
        { max: 65.19, score: 1, label: 'Sangat Pendek (< 65.2 cm)' },
        { min: 65.2, max: 71.19, score: 2, label: 'Pendek / Stunted (65.2 - 71.1 cm)' },
        { min: 71.2, max: 78.99, score: 4, label: 'Normal / Ideal (71.2 - 78.9 cm)' },
        { min: 79.0, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 78.9 cm)' }
      ],
      LK: [
        { max: 41.69, score: 1, label: 'Mikrosefali (< 41.7 cm)' },
        { min: 41.7, max: 43.59, score: 2, label: 'Batas Bawah (41.7 - 43.5 cm)' },
        { min: 43.6, max: 47.69, score: 4, label: 'Normal / Ideal (43.6 - 47.6 cm)' },
        { min: 47.7, max: 48.59, score: 2, label: 'Batas Atas (47.7 - 48.5 cm)' },
        { min: 48.6, score: 1, label: 'Makrosefali (> 48.5 cm)' }
      ]
    },
    P: {
      BB: [
        { max: 5.79, score: 1, label: 'Sangat Kurang (< 5.8 kg)' },
        { min: 5.8, max: 6.99, score: 2, label: 'Kurang (5.8 - 6.9 kg)' },
        { min: 7.0, max: 9.89, score: 4, label: 'Ideal / Normal (7.0 - 9.8 kg)' },
        { min: 9.9, max: 11.09, score: 3, label: 'Agak Lebih (9.9 - 11.0 kg)' },
        { min: 11.1, max: 11.79, score: 2, label: 'Kelebihan BB (11.1 - 11.7 kg)' },
        { min: 11.8, score: 1, label: 'Risiko Obesitas (> 11.7 kg)' }
      ],
      TB: [
        { max: 63.29, score: 1, label: 'Sangat Pendek (< 63.3 cm)' },
        { min: 63.3, max: 69.49, score: 2, label: 'Pendek / Stunted (63.3 - 69.4 cm)' },
        { min: 69.5, max: 77.49, score: 4, label: 'Normal / Ideal (69.5 - 77.4 cm)' },
        { min: 77.5, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 77.4 cm)' }
      ],
      LK: [
        { max: 40.39, score: 1, label: 'Mikrosefali (< 40.4 cm)' },
        { min: 40.4, max: 42.29, score: 2, label: 'Batas Bawah (40.4 - 42.2 cm)' },
        { min: 42.3, max: 46.69, score: 4, label: 'Normal / Ideal (42.3 - 46.6 cm)' },
        { min: 46.7, max: 47.69, score: 2, label: 'Batas Atas (46.7 - 47.6 cm)' },
        { min: 47.7, score: 1, label: 'Makrosefali (> 47.6 cm)' }
      ]
    }
  },

  // Kelompok 5: 12 - 23 bulan
  5: {
    name: 'Kelompok 5 (12 - 23 bulan)',
    rangeLabel: '12 - 23 bulan',
    L: {
      BB: [
        { max: 6.89, score: 1, label: 'Sangat Kurang (< 6.9 kg)' },
        { min: 6.9, max: 8.59, score: 2, label: 'Kurang (6.9 - 8.5 kg)' },
        { min: 8.6, max: 13.09, score: 4, label: 'Ideal / Normal (8.6 - 13.0 kg)' },
        { min: 13.1, max: 14.19, score: 3, label: 'Agak Lebih (13.1 - 14.1 kg)' },
        { min: 14.2, max: 15.39, score: 2, label: 'Kelebihan BB (14.2 - 15.3 kg)' },
        { min: 15.4, score: 1, label: 'Risiko Obesitas (> 15.3 kg)' }
      ],
      TB: [
        { max: 70.99, score: 1, label: 'Sangat Pendek (< 71.0 cm)' },
        { min: 71.0, max: 82.29, score: 2, label: 'Pendek / Stunted (71.0 - 82.2 cm)' },
        { min: 82.3, max: 93.59, score: 4, label: 'Normal / Ideal (82.3 - 93.5 cm)' },
        { min: 93.6, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 93.5 cm)' }
      ],
      LK: [
        { max: 42.99, score: 1, label: 'Mikrosefali (< 43.0 cm)' },
        { min: 43.0, max: 45.09, score: 2, label: 'Batas Bawah (43.0 - 45.0 cm)' },
        { min: 45.1, max: 49.69, score: 4, label: 'Normal / Ideal (45.1 - 49.6 cm)' },
        { min: 49.7, max: 50.69, score: 2, label: 'Batas Atas (49.7 - 50.6 cm)' },
        { min: 50.7, score: 1, label: 'Makrosefali (> 50.6 cm)' }
      ]
    },
    P: {
      BB: [
        { max: 6.29, score: 1, label: 'Sangat Kurang (< 6.3 kg)' },
        { min: 6.3, max: 7.99, score: 2, label: 'Kurang (6.3 - 7.9 kg)' },
        { min: 8.0, max: 12.59, score: 4, label: 'Ideal / Normal (8.0 - 12.5 kg)' },
        { min: 12.6, max: 13.89, score: 3, label: 'Agak Lebih (12.6 - 13.8 kg)' },
        { min: 13.9, max: 14.89, score: 2, label: 'Kelebihan BB (13.9 - 14.8 kg)' },
        { min: 14.9, score: 1, label: 'Risiko Obesitas (> 14.8 kg)' }
      ],
      TB: [
        { max: 68.89, score: 1, label: 'Sangat Pendek (< 68.9 cm)' },
        { min: 68.9, max: 80.69, score: 2, label: 'Pendek / Stunted (68.9 - 80.6 cm)' },
        { min: 80.7, max: 92.39, score: 4, label: 'Normal / Ideal (80.7 - 92.3 cm)' },
        { min: 92.4, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 92.3 cm)' }
      ],
      LK: [
        { max: 41.79, score: 1, label: 'Mikrosefali (< 41.8 cm)' },
        { min: 41.8, max: 43.89, score: 2, label: 'Batas Bawah (41.8 - 43.8 cm)' },
        { min: 43.9, max: 48.69, score: 4, label: 'Normal / Ideal (43.9 - 48.6 cm)' },
        { min: 48.7, max: 49.69, score: 2, label: 'Batas Atas (48.7 - 49.6 cm)' },
        { min: 49.7, score: 1, label: 'Makrosefali (> 49.6 cm)' }
      ]
    }
  },

  // Kelompok 6: 24 - 35 bulan
  6: {
    name: 'Kelompok 6 (24 - 35 bulan)',
    rangeLabel: '24 - 35 bulan',
    L: {
      BB: [
        { max: 8.59, score: 1, label: 'Sangat Kurang (< 8.6 kg)' },
        { min: 8.6, max: 10.79, score: 2, label: 'Kurang (8.6 - 10.7 kg)' },
        { min: 10.8, max: 15.39, score: 4, label: 'Ideal / Normal (10.8 - 15.3 kg)' },
        { min: 15.4, max: 16.79, score: 3, label: 'Agak Lebih (15.4 - 16.7 kg)' },
        { min: 16.8, max: 18.39, score: 2, label: 'Kelebihan BB (16.8 - 18.3 kg)' },
        { min: 18.4, score: 1, label: 'Risiko Obesitas (> 18.3 kg)' }
      ],
      TB: [
        { max: 80.99, score: 1, label: 'Sangat Pendek (< 81.0 cm)' },
        { min: 81.0, max: 89.59, score: 2, label: 'Pendek / Stunted (81.0 - 89.5 cm)' },
        { min: 89.6, max: 102.49, score: 4, label: 'Normal / Ideal (89.6 - 102.4 cm)' },
        { min: 102.5, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 102.4 cm)' }
      ],
      LK: [
        { max: 45.19, score: 1, label: 'Mikrosefali (< 45.2 cm)' },
        { min: 45.2, max: 46.99, score: 2, label: 'Batas Bawah (45.2 - 46.9 cm)' },
        { min: 47.0, max: 51.09, score: 4, label: 'Normal / Ideal (47.0 - 51.0 cm)' },
        { min: 51.1, max: 51.99, score: 2, label: 'Batas Atas (51.1 - 51.9 cm)' },
        { min: 52.0, score: 1, label: 'Makrosefali (> 51.9 cm)' }
      ]
    },
    P: {
      BB: [
        { max: 8.09, score: 1, label: 'Sangat Kurang (< 8.1 kg)' },
        { min: 8.1, max: 10.19, score: 2, label: 'Kurang (8.1 - 10.1 kg)' },
        { min: 10.2, max: 15.09, score: 4, label: 'Ideal / Normal (10.2 - 15.0 kg)' },
        { min: 15.1, max: 16.59, score: 3, label: 'Agak Lebih (15.1 - 16.5 kg)' },
        { min: 16.6, max: 18.19, score: 2, label: 'Kelebihan BB (16.6 - 18.1 kg)' },
        { min: 18.2, score: 1, label: 'Risiko Obesitas (> 18.1 kg)' }
      ],
      TB: [
        { max: 79.99, score: 1, label: 'Sangat Pendek (< 80.0 cm)' },
        { min: 80.0, max: 88.39, score: 2, label: 'Pendek / Stunted (80.0 - 88.3 cm)' },
        { min: 88.4, max: 101.39, score: 4, label: 'Normal / Ideal (88.4 - 101.3 cm)' },
        { min: 101.4, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 101.3 cm)' }
      ],
      LK: [
        { max: 44.09, score: 1, label: 'Mikrosefali (< 44.1 cm)' },
        { min: 44.1, max: 45.89, score: 2, label: 'Batas Bawah (44.1 - 45.8 cm)' },
        { min: 45.9, max: 50.09, score: 4, label: 'Normal / Ideal (45.9 - 50.0 cm)' },
        { min: 50.1, max: 50.99, score: 2, label: 'Batas Atas (50.1 - 50.9 cm)' },
        { min: 51.0, score: 1, label: 'Makrosefali (> 50.9 cm)' }
      ]
    }
  },

  // Kelompok 7: 36 - 47 bulan
  7: {
    name: 'Kelompok 7 (36 - 47 bulan)',
    rangeLabel: '36 - 47 bulan',
    L: {
      BB: [
        { max: 9.99, score: 1, label: 'Sangat Kurang (< 10.0 kg)' },
        { min: 10.0, max: 12.49, score: 2, label: 'Kurang (10.0 - 12.4 kg)' },
        { min: 12.5, max: 17.89, score: 4, label: 'Ideal / Normal (12.5 - 17.8 kg)' },
        { min: 17.9, max: 19.49, score: 3, label: 'Agak Lebih (17.9 - 19.4 kg)' },
        { min: 19.5, max: 21.29, score: 2, label: 'Kelebihan BB (19.5 - 21.2 kg)' },
        { min: 21.3, score: 1, label: 'Risiko Obesitas (> 21.2 kg)' }
      ],
      TB: [
        { max: 88.69, score: 1, label: 'Sangat Pendek (< 88.7 cm)' },
        { min: 88.7, max: 96.89, score: 2, label: 'Pendek / Stunted (88.7 - 96.8 cm)' },
        { min: 96.9, max: 110.39, score: 4, label: 'Normal / Ideal (96.9 - 110.3 cm)' },
        { min: 110.4, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 110.3 cm)' }
      ],
      LK: [
        { max: 46.39, score: 1, label: 'Mikrosefali (< 46.4 cm)' },
        { min: 46.4, max: 48.09, score: 2, label: 'Batas Bawah (46.4 - 48.0 cm)' },
        { min: 48.1, max: 52.09, score: 4, label: 'Normal / Ideal (48.1 - 52.0 cm)' },
        { min: 52.1, max: 52.99, score: 2, label: 'Batas Atas (52.1 - 52.9 cm)' },
        { min: 53.0, score: 1, label: 'Makrosefali (> 52.9 cm)' }
      ]
    },
    P: {
      BB: [
        { max: 9.59, score: 1, label: 'Sangat Kurang (< 9.6 kg)' },
        { min: 9.6, max: 12.09, score: 2, label: 'Kurang (9.6 - 12.0 kg)' },
        { min: 12.1, max: 17.79, score: 4, label: 'Ideal / Normal (12.1 - 17.7 kg)' },
        { min: 17.8, max: 19.69, score: 3, label: 'Agak Lebih (17.8 - 19.6 kg)' },
        { min: 19.7, max: 21.59, score: 2, label: 'Kelebihan BB (19.7 - 21.5 kg)' },
        { min: 21.6, score: 1, label: 'Risiko Obesitas (> 21.5 kg)' }
      ],
      TB: [
        { max: 87.39, score: 1, label: 'Sangat Pendek (< 87.4 cm)' },
        { min: 87.4, max: 95.89, score: 2, label: 'Pendek / Stunted (87.4 - 95.8 cm)' },
        { min: 95.9, max: 109.59, score: 4, label: 'Normal / Ideal (95.9 - 109.5 cm)' },
        { min: 109.6, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 109.5 cm)' }
      ],
      LK: [
        { max: 45.39, score: 1, label: 'Mikrosefali (< 45.4 cm)' },
        { min: 45.4, max: 47.09, score: 2, label: 'Batas Bawah (45.4 - 47.0 cm)' },
        { min: 47.1, max: 51.19, score: 4, label: 'Normal / Ideal (47.1 - 51.1 cm)' },
        { min: 51.2, max: 52.09, score: 2, label: 'Batas Atas (51.2 - 52.0 cm)' },
        { min: 52.1, score: 1, label: 'Makrosefali (> 52.0 cm)' }
      ]
    }
  },

  // Kelompok 8: 48 - 59 bulan
  8: {
    name: 'Kelompok 8 (48 - 59 bulan)',
    rangeLabel: '48 - 59 bulan',
    L: {
      BB: [
        { max: 11.19, score: 1, label: 'Sangat Kurang (< 11.2 kg)' },
        { min: 11.2, max: 13.89, score: 2, label: 'Kurang (11.2 - 13.8 kg)' },
        { min: 13.9, max: 20.59, score: 4, label: 'Ideal / Normal (13.9 - 20.5 kg)' },
        { min: 20.6, max: 22.49, score: 3, label: 'Agak Lebih (20.6 - 22.4 kg)' },
        { min: 22.5, max: 24.29, score: 2, label: 'Kelebihan BB (22.5 - 24.2 kg)' },
        { min: 24.3, score: 1, label: 'Risiko Obesitas (> 24.2 kg)' }
      ],
      TB: [
        { max: 94.89, score: 1, label: 'Sangat Pendek (< 94.9 cm)' },
        { min: 94.9, max: 103.29, score: 2, label: 'Pendek / Stunted (94.9 - 103.2 cm)' },
        { min: 103.3, max: 118.19, score: 4, label: 'Normal / Ideal (103.3 - 118.1 cm)' },
        { min: 118.2, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 118.1 cm)' }
      ],
      LK: [
        { max: 47.19, score: 1, label: 'Mikrosefali (< 47.2 cm)' },
        { min: 47.2, max: 48.79, score: 2, label: 'Batas Bawah (47.2 - 48.7 cm)' },
        { min: 48.8, max: 52.79, score: 4, label: 'Normal / Ideal (48.8 - 52.7 cm)' },
        { min: 52.8, max: 53.69, score: 2, label: 'Batas Atas (52.8 - 53.6 cm)' },
        { min: 53.7, score: 1, label: 'Makrosefali (> 53.6 cm)' }
      ]
    },
    P: {
      BB: [
        { max: 10.89, score: 1, label: 'Sangat Kurang (< 10.9 kg)' },
        { min: 10.9, max: 13.59, score: 2, label: 'Kurang (10.9 - 13.5 kg)' },
        { min: 13.6, max: 20.79, score: 4, label: 'Ideal / Normal (13.6 - 20.7 kg)' },
        { min: 20.8, max: 22.99, score: 3, label: 'Agak Lebih (20.8 - 22.9 kg)' },
        { min: 23.0, max: 24.99, score: 2, label: 'Kelebihan BB (23.0 - 24.9 kg)' },
        { min: 25.0, score: 1, label: 'Risiko Obesitas (> 24.9 kg)' }
      ],
      TB: [
        { max: 94.09, score: 1, label: 'Sangat Pendek (< 94.1 cm)' },
        { min: 94.1, max: 102.69, score: 2, label: 'Pendek / Stunted (94.1 - 102.6 cm)' },
        { min: 102.7, max: 117.69, score: 4, label: 'Normal / Ideal (102.7 - 117.6 cm)' },
        { min: 117.7, score: 3, label: 'Tinggi / Di Atas Rata-rata (> 117.6 cm)' }
      ],
      LK: [
        { max: 46.29, score: 1, label: 'Mikrosefali (< 46.3 cm)' },
        { min: 46.3, max: 47.89, score: 2, label: 'Batas Bawah (46.3 - 47.8 cm)' },
        { min: 47.9, max: 51.99, score: 4, label: 'Normal / Ideal (47.9 - 51.9 cm)' },
        { min: 52.0, max: 52.89, score: 2, label: 'Batas Atas (52.0 - 52.8 cm)' },
        { min: 52.9, score: 1, label: 'Makrosefali (> 52.8 cm)' }
      ]
    }
  }
};

/**
 * Konversi Nilai BB mentah (kg) menjadi Skor 1 - 4
 */
export function getBBScore(rawBB, groupId = 4, sex = 'L') {
  const num = Number(rawBB);
  if (isNaN(num) || num <= 0) return { score: 1, label: 'Tidak Valid' };

  const normSex = sex === 'P' ? 'P' : 'L';
  const groupRules = ANTHROPOMETRIC_STANDARDS[Number(groupId)]?.[normSex]?.BB || ANTHROPOMETRIC_STANDARDS[4][normSex].BB;

  for (const rule of groupRules) {
    const minPass = rule.min === undefined || num >= rule.min;
    const maxPass = rule.max === undefined || num <= rule.max;
    if (minPass && maxPass) {
      return { score: rule.score, label: rule.label };
    }
  }
  return { score: 1, label: 'Di Luar Batas' };
}

/**
 * Konversi Nilai TB mentah (cm) menjadi Skor 1 - 4
 */
export function getTBScore(rawTB, groupId = 4, sex = 'L') {
  const num = Number(rawTB);
  if (isNaN(num) || num <= 0) return { score: 1, label: 'Tidak Valid' };

  const normSex = sex === 'P' ? 'P' : 'L';
  const groupRules = ANTHROPOMETRIC_STANDARDS[Number(groupId)]?.[normSex]?.TB || ANTHROPOMETRIC_STANDARDS[4][normSex].TB;

  for (const rule of groupRules) {
    const minPass = rule.min === undefined || num >= rule.min;
    const maxPass = rule.max === undefined || num <= rule.max;
    if (minPass && maxPass) {
      return { score: rule.score, label: rule.label };
    }
  }
  return { score: 1, label: 'Di Luar Batas' };
}

/**
 * Konversi Nilai LK mentah (cm) menjadi Skor 1 - 4
 */
export function getLKScore(rawLK, groupId = 4, sex = 'L') {
  const num = Number(rawLK);
  if (isNaN(num) || num <= 0) return { score: 1, label: 'Tidak Valid' };

  const normSex = sex === 'P' ? 'P' : 'L';
  const groupRules = ANTHROPOMETRIC_STANDARDS[Number(groupId)]?.[normSex]?.LK || ANTHROPOMETRIC_STANDARDS[4][normSex].LK;

  for (const rule of groupRules) {
    const minPass = rule.min === undefined || num >= rule.min;
    const maxPass = rule.max === undefined || num <= rule.max;
    if (minPass && maxPass) {
      return { score: rule.score, label: rule.label };
    }
  }
  return { score: 1, label: 'Di Luar Batas' };
}

/**
 * K4 - Konversi Riwayat Kelengkapan Imunisasi Dasar ke Skor 1 - 4
 * @param {number|string} val - Persentase (0 - 100) atau kode skor langsung (1 - 4)
 */
export function getImunisasiScore(val) {
  const num = Number(val);
  if (isNaN(num)) return { score: 1, label: 'Sangat Kurang (< 40%)' };

  // Jika nilai input adalah skor 1 - 4 langsung
  if (num >= 1 && num <= 4 && Number.isInteger(num) && val <= 4) {
    switch (num) {
      case 4: return { score: 4, label: 'Lengkap Tepat Waktu (100%)' };
      case 3: return { score: 3, label: 'Hampir Lengkap (75% - 99%)' };
      case 2: return { score: 2, label: 'Kurang / Tidak Teratur (40% - 74%)' };
      default: return { score: 1, label: 'Sangat Kurang / Menolak (< 40%)' };
    }
  }

  // Jika berupa persentase 0 - 100%
  if (num >= 100) {
    return { score: 4, label: 'Lengkap Tepat Waktu (100%)' };
  } else if (num >= 75) {
    return { score: 3, label: 'Hampir Lengkap (75% - 99%)' };
  } else if (num >= 40) {
    return { score: 2, label: 'Kurang / Tidak Teratur (40% - 74%)' };
  }
  return { score: 1, label: 'Sangat Kurang / Menolak (< 40%)' };
}

/**
 * K5 - Konversi Asupan Gizi & Praktik Makan Balita (PMBA) ke Skor 1 - 4
 * @param {number|string} val - Jumlah indikator terpenuhi (1 - 4) atau skor langsung
 */
export function getAsupanGiziScore(val) {
  const num = Number(val);
  if (isNaN(num) || num <= 1) {
    return { score: 1, label: 'Buruk / Defisit Berat (<= 1 Indikator)' };
  }
  if (num === 2) {
    return { score: 2, label: 'Kurang Sesuai (2 Indikator)' };
  }
  if (num === 3) {
    return { score: 3, label: 'Sesuai dengan Catatan (3 Indikator)' };
  }
  return { score: 4, label: 'Sangat Sesuai / Ideal (4 Indikator)' };
}

/**
 * Mengonversi seluruh data mentah pemeriksaan menjadi skor terstandar 5 Kriteria Baku
 * @param {object} rawValues - { C1/BB: number, C2/TB: number, C3/LK: number, C5/Imun: number, C4/LiLA: number, gizi: number }
 * @param {number|string} ageGroupId - 1 s/d 8
 * @param {'L'|'P'} sex - 'L' atau 'P'
 */
export function convertRawToStandardScores(rawValues = {}, ageGroupId = 4, sex = 'L') {
  const rawBB = rawValues.K1 ?? rawValues.C1 ?? rawValues.beratBadan ?? 0;
  const rawTB = rawValues.K2 ?? rawValues.C2 ?? rawValues.tinggiBadan ?? 0;
  const rawLK = rawValues.K3 ?? rawValues.C3 ?? rawValues.lingkarKepala ?? 0;
  const rawImun = rawValues.K4 ?? rawValues.C5 ?? rawValues.imunisasi ?? 100;
  const rawGizi = rawValues.K5 ?? rawValues.asupanGizi ?? rawValues.gizi ?? 4;

  const bbRes = getBBScore(rawBB, ageGroupId, sex);
  const tbRes = getTBScore(rawTB, ageGroupId, sex);
  const lkRes = getLKScore(rawLK, ageGroupId, sex);
  const imunRes = getImunisasiScore(rawImun);
  const giziRes = getAsupanGiziScore(rawGizi);

  const scores = {
    K1: bbRes.score,
    K2: tbRes.score,
    K3: lkRes.score,
    K4: imunRes.score,
    K5: giziRes.score
  };

  const labels = {
    K1: bbRes.label,
    K2: tbRes.label,
    K3: lkRes.label,
    K4: imunRes.label,
    K5: giziRes.label
  };

  // Status Flag:
  // Sesuai rubrik simulasi, balita yang K1 (BB) atau K2 (TB) bernilai <= 2 atau memiliki skor 1 di kriteria fisik
  // dikategorikan sebagai 'Perlu Tinjau', sedangkan balita dengan pertumbuhan normal adalah 'Normal'.
  const isReviewNeeded = scores.K1 <= 2 || scores.K2 <= 2 || scores.K3 === 1 || scores.K4 === 1 || scores.K5 === 1;
  const statusFlag = isReviewNeeded ? 'Perlu Tinjau' : 'Normal';

  return {
    scores,
    labels,
    statusFlag,
    rawValues: {
      BB: rawBB,
      TB: rawTB,
      LK: rawLK,
      LiLA: rawValues.C4 ?? rawValues.lila ?? null,
      Imunisasi: rawImun,
      Gizi: rawGizi
    }
  };
}

// Master Bobot AHP Baku Terkalibrasi untuk 5 Kriteria (Jumlah = 1.000000)
export const OFFICIAL_AHP_WEIGHTS = {
  K1: 0.122833, // BB/U
  K2: 0.122833, // PB/TB
  K3: 0.084737, // LK/U
  K4: 0.423687, // Kelengkapan Imunisasi
  K5: 0.245910  // Asupan Gizi & PMBA
};

// Matriks AHP 5x5 Konsisten yang menghasilkan bobot tersebut
export const OFFICIAL_AHP_5X5_MATRIX = [
  // K1       K2       K3       K4       K5
  [ 1.000,   1.000,   1.450,   0.290,   0.500 ], // K1: BB/U
  [ 1.000,   1.000,   1.450,   0.290,   0.500 ], // K2: TB/U
  [ 0.690,   0.690,   1.000,   0.200,   0.345 ], // K3: LK/U
  [ 3.448,   3.448,   5.000,   1.000,   1.723 ], // K4: Imunisasi
  [ 2.000,   2.000,   2.900,   0.580,   1.000 ]  // K5: Asupan Gizi
];

export const OFFICIAL_CRITERIA_5 = [
  {
    code: 'K1',
    name: 'Berat Badan menurut Umur (BB/U)',
    shortName: 'BB/U',
    unit: 'Skor 1-4',
    rawUnit: 'kg',
    direction: 'benefit',
    weight: OFFICIAL_AHP_WEIGHTS.K1,
    description: 'Skor 4 = Ideal/Normal (-2 s.d +1 SD), Skor 1 = Sangat Kurang / Obesitas'
  },
  {
    code: 'K2',
    name: 'Panjang/Tinggi Badan menurut Umur (PB/TB)',
    shortName: 'PB/TB',
    unit: 'Skor 1-4',
    rawUnit: 'cm',
    direction: 'benefit',
    weight: OFFICIAL_AHP_WEIGHTS.K2,
    description: 'Skor 4 = Normal/Ideal (-2 s.d +2 SD), Skor 1 = Sangat Pendek (Severely Stunted)'
  },
  {
    code: 'K3',
    name: 'Lingkar Kepala menurut Umur (LK/U)',
    shortName: 'LK/U',
    unit: 'Skor 1-4',
    rawUnit: 'cm',
    direction: 'benefit',
    weight: OFFICIAL_AHP_WEIGHTS.K3,
    description: 'Skor 4 = Proporsional (-2 s.d +2 SD), Skor 1 = Mikrosefali / Makrosefali'
  },
  {
    code: 'K4',
    name: 'Riwayat Kelengkapan Imunisasi',
    shortName: 'Imunisasi',
    unit: 'Skor 1-4',
    rawUnit: '%',
    direction: 'benefit',
    weight: OFFICIAL_AHP_WEIGHTS.K4,
    description: 'Skor 4 = Lengkap 100%, Skor 3 = 75-99%, Skor 2 = 40-74%, Skor 1 = < 40%'
  },
  {
    code: 'K5',
    name: 'Asupan Gizi & Praktik Makan Balita (PMBA)',
    shortName: 'Asupan Gizi',
    unit: 'Skor 1-4',
    rawUnit: 'Indikator',
    direction: 'benefit',
    weight: OFFICIAL_AHP_WEIGHTS.K5,
    description: 'Skor 4 = 4 Indikator Ideal, Skor 3 = 3 Indikator, Skor 2 = 2 Indikator, Skor 1 = <=1'
  }
];
