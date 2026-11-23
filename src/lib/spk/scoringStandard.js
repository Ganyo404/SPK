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
 * Master Tabel Ambang Batas Dosis Imunisasi per Kelompok Umur
 * Sesuai Jadwal Standar Imunisasi Dasar Kemenkes RI:
 * - Kelompok 1 (0–2 bulan): Target ideal 6 dosis
 * - Kelompok 2 (3–5 bulan): Target ideal 15 dosis
 * - Kelompok 3 (6–8 bulan): Target ideal 15 dosis
 * - Kelompok 4 (9–11 bulan): Target ideal 17 dosis (maksimal tuntas di 11 bulan)
 * - Kelompok 5 s/d 8 (12–59 bulan): Target tetap 17 dosis (maksimal)
 */
export const IMMUNIZATION_STANDARDS = {
  // Kelompok 1: 0 - 2 bulan (Target: 6 dosis)
  1: {
    ageRange: '0 - 2 bulan',
    targetIdeal: 6,
    maxDoses: 6,
    rules: [
      { min: 6, max: 6, score: 4, label: 'Lengkap (6 dosis)' },
      { min: 5, max: 5, score: 3, label: 'Hampir Lengkap (5 dosis)' },
      { min: 3, max: 4, score: 2, label: 'Kurang (3 - 4 dosis)' },
      { min: 0, max: 2, score: 1, label: 'Sangat Kurang (0 - 2 dosis)' }
    ]
  },
  // Kelompok 2: 3 - 5 bulan (Target: 15 dosis)
  2: {
    ageRange: '3 - 5 bulan',
    targetIdeal: 15,
    maxDoses: 15,
    rules: [
      { min: 15, max: 15, score: 4, label: 'Lengkap (15 dosis)' },
      { min: 12, max: 14, score: 3, label: 'Hampir Lengkap (12 - 14 dosis)' },
      { min: 8, max: 11, score: 2, label: 'Kurang (8 - 11 dosis)' },
      { min: 0, max: 7, score: 1, label: 'Sangat Kurang (0 - 7 dosis)' }
    ]
  },
  // Kelompok 3: 6 - 8 bulan (Target: 15 dosis)
  3: {
    ageRange: '6 - 8 bulan',
    targetIdeal: 15,
    maxDoses: 15,
    rules: [
      { min: 15, max: 15, score: 4, label: 'Lengkap (15 dosis)' },
      { min: 12, max: 14, score: 3, label: 'Hampir Lengkap (12 - 14 dosis)' },
      { min: 8, max: 11, score: 2, label: 'Kurang (8 - 11 dosis)' },
      { min: 0, max: 7, score: 1, label: 'Sangat Kurang (0 - 7 dosis)' }
    ]
  },
  // Kelompok 4: 9 - 11 bulan (Target: 17 dosis)
  4: {
    ageRange: '9 - 11 bulan',
    targetIdeal: 17,
    maxDoses: 17,
    rules: [
      { min: 17, max: 17, score: 4, label: 'Lengkap (17 dosis)' },
      { min: 13, max: 16, score: 3, label: 'Hampir Lengkap (13 - 16 dosis)' },
      { min: 9, max: 12, score: 2, label: 'Kurang (9 - 12 dosis)' },
      { min: 0, max: 8, score: 1, label: 'Sangat Kurang (0 - 8 dosis)' }
    ]
  }
};

// Kelompok 5 s/d 8 (12 s/d 59 bulan): Imunisasi dasar tuntas di usia 11 bulan (maksimal 17 dosis)
[5, 6, 7, 8].forEach((grpId) => {
  IMMUNIZATION_STANDARDS[grpId] = {
    ...IMMUNIZATION_STANDARDS[4],
    isPostSchedule: true
  };
});

/**
 * K4 - Konversi Riwayat Kelengkapan Imunisasi Dasar ke Skor 1 - 4
 * Berdasarkan jumlah dosis yang telah diterima sesuai kelompok usia balita.
 * @param {number|string} val - Jumlah dosis diterima (0 s/d 17) atau persentase legacy (> 17)
 * @param {number|string} groupId - Kelompok Umur 1 s/d 8 (default 4)
 */
export function getImunisasiScore(val, groupId = 4) {
  let num = Math.round(Number(val));
  if (isNaN(num) || num < 0) return { score: 1, label: 'Tidak Valid (0 dosis)' };

  const grp = Number(groupId) || 4;
  const standard = IMMUNIZATION_STANDARDS[grp] || IMMUNIZATION_STANDARDS[4];

  // Kompatibilitas mundur dengan data legacy persentase (> 17)
  if (num > 17) {
    num = Math.min(standard.maxDoses, Math.round((num / 100) * standard.targetIdeal));
  }

  // Jika mencapai atau melebihi target kelompok umur balita
  if (num >= standard.targetIdeal) {
    return { score: 4, label: `Lengkap (${num} dosis)` };
  }

  for (const rule of standard.rules) {
    const minPass = rule.min === undefined || num >= rule.min;
    const maxPass = rule.max === undefined || num <= rule.max;
    if (minPass && maxPass) {
      return { score: rule.score, label: rule.label };
    }
  }

  return { score: 1, label: `Sangat Kurang (${num} dosis)` };
}

/**
 * K5 - 8 Kelompok Makanan Standar WHO/UNICEF untuk Minimum Dietary Diversity (MDD)
 * Digunakan untuk balita usia 6–23 bulan.
 */
export const MDD_FOOD_GROUPS = [
  { id: 'asi', name: 'ASI', description: 'Air susu ibu' },
  { id: 'staples', name: 'Biji-bijian, umbi, dan pangan pokok', description: 'Nasi, jagung, gandum, kentang, ubi' },
  { id: 'legumes', name: 'Kacang-kacangan dan biji-bijian', description: 'Kacang hijau, kacang merah, kedelai, kacang tanah' },
  { id: 'dairy', name: 'Produk susu', description: 'Susu, susu formula, yoghurt, keju' },
  { id: 'flesh', name: 'Daging dan ikan', description: 'Daging sapi, ayam, ikan, hati, dan jeroan' },
  { id: 'eggs', name: 'Telur', description: 'Telur ayam, telur bebek, dan jenis telur lainnya' },
  { id: 'vitamin_a', name: 'Buah dan sayuran kaya vitamin A', description: 'Wortel, labu, mangga matang, pepaya, sayuran hijau tertentu' },
  { id: 'other_fruits_veg', name: 'Buah dan sayuran lainnya', description: 'Pisang, apel, tomat, dan buah atau sayuran lainnya' },
];

/**
 * Menghitung indikator Minimum Dietary Diversity (MDD)
 * MDD = 1 jika jumlah kelompok makanan yang dikonsumsi >= 5.
 * MDD = 0 jika jumlah kelompok makanan yang dikonsumsi < 5.
 * 
 * @param {Array<string>|Record<string, boolean>|number} foodGroups - Array ID kelompok makanan, objek boolean, atau count
 * @returns {{ count: number, score: number, status: string, label: string }}
 */
export function calculateMDD(foodGroups) {
  let count = 0;
  if (typeof foodGroups === 'number') {
    count = Math.max(0, Math.min(8, Math.round(foodGroups)));
  } else if (Array.isArray(foodGroups)) {
    const validIds = new Set(MDD_FOOD_GROUPS.map(g => g.id));
    const selected = new Set(foodGroups.filter(id => validIds.has(id)));
    count = selected.size;
  } else if (foodGroups && typeof foodGroups === 'object') {
    count = MDD_FOOD_GROUPS.filter(g => Boolean(foodGroups[g.id])).length;
  }

  const score = count >= 5 ? 1 : 0;
  const status = score === 1 ? 'Memenuhi' : 'Tidak memenuhi';
  return {
    count,
    score, // 0 atau 1
    status,
    label: `${status} (${count} dari 8 kelompok)`
  };
}

/**
 * Menghitung indikator Minimum Meal Frequency (MMF) sesuai pedoman WHO/UNICEF
 * A. Balita yang masih mendapatkan ASI:
 *    - 6–8 bulan: Minimal 2 kali sehari
 *    - 9–23 bulan: Minimal 3 kali sehari
 *    (ASI tidak dihitung sebagai frekuensi makan dalam ketentuan MMF anak menyusu)
 * B. Balita yang tidak mendapatkan ASI (6–23 bulan):
 *    - Minimal 4 kali total kesempatan pemberian makan dalam sehari
 *    - HARUS terdapat minimal 1 kali pemberian makanan padat, semi-padat, atau lunak
 * 
 * @param {object} params
 * @param {number} params.ageInMonths - Umur balita dalam bulan (6 - 23)
 * @param {boolean|string} params.isBreastfeeding - Status menyusui ('masih_asi' / true / false)
 * @param {number} params.solidFrequency - Kesempatan pemberian makanan padat/semi-padat/lunak
 * @param {number} [params.milkFrequency=0] - Kesempatan pemberian susu (untuk balita tidak ASI)
 * @returns {{ score: number, status: string, label: string, solidFreq: number, milkFreq: number, totalFreq: number, stillBreastfeeding: boolean }}
 */
export function calculateMMF({ ageInMonths, isBreastfeeding, solidFrequency = 0, milkFrequency = 0 }) {
  const age = Number(ageInMonths) || 0;
  const solid = Math.max(0, Number(solidFrequency) || 0);
  const milk = Math.max(0, Number(milkFrequency) || 0);
  const stillBreastfeeding = isBreastfeeding === true || isBreastfeeding === 'masih_asi' || isBreastfeeding === 'yes';

  let score = 0;
  let label = '';

  if (stillBreastfeeding) {
    // Usia 6–8 bulan: Minimal 2 kali sehari
    // Usia 9–23 bulan: Minimal 3 kali sehari
    const minRequired = (age >= 6 && age <= 8) ? 2 : 3;
    if (solid >= minRequired) {
      score = 1;
      label = `Memenuhi (${solid} kali pemberian makanan)`;
    } else {
      score = 0;
      label = `Tidak memenuhi (${solid} dari minimal ${minRequired} kali)`;
    }
  } else {
    // Usia 6–23 bulan yang tidak mendapatkan ASI:
    // Total kesempatan makan >= 4 DAN minimal 1 kali makanan padat/semi-padat/lunak
    const totalFreq = solid + milk;
    if (totalFreq >= 4 && solid >= 1) {
      score = 1;
      label = `Memenuhi (${totalFreq} kali total: ${solid}x makanan, ${milk}x susu)`;
    } else {
      score = 0;
      if (solid < 1) {
        label = `Tidak memenuhi (${totalFreq} kali total, tanpa makanan padat/lunak)`;
      } else {
        label = `Tidak memenuhi (${totalFreq} dari minimal 4 kali)`;
      }
    }
  }

  return {
    score, // 0 atau 1
    status: score === 1 ? 'Memenuhi' : 'Tidak memenuhi',
    label,
    solidFreq: solid,
    milkFreq: milk,
    totalFreq: stillBreastfeeding ? solid : (solid + milk),
    stillBreastfeeding
  };
}

/**
 * Menghitung nilai komposit K5 = (MDD + MMF) / 2
 * Hanya menghasilkan 0, 0.5, atau 1.
 * 
 * @param {object} params
 * @returns {{ value: number, mdd: object, mmf: object, label: string }}
 */
export function calculateK5Score(params = {}) {
  const mdd = params.mddScore !== undefined
    ? { count: params.mddCount ?? (params.mddScore === 1 ? 5 : 0), score: params.mddScore === 1 ? 1 : 0, status: params.mddScore === 1 ? 'Memenuhi' : 'Tidak memenuhi' }
    : calculateMDD(params.mddFoodGroups ?? params.mddInput);

  const mmf = params.mmfScore !== undefined
    ? { score: params.mmfScore === 1 ? 1 : 0, status: params.mmfScore === 1 ? 'Memenuhi' : 'Tidak memenuhi', label: '' }
    : calculateMMF(params.mmfInput || params);

  const value = Number(((mdd.score + mmf.score) / 2).toFixed(1)); // 0, 0.5, atau 1

  let label = '';
  if (value === 1) {
    label = 'Kedua indikator terpenuhi';
  } else if (value === 0.5) {
    if (mdd.score === 1 && mmf.score === 0) {
      label = 'Hanya MDD yang terpenuhi';
    } else {
      label = 'Hanya MMF yang terpenuhi';
    }
  } else {
    label = 'Kedua indikator belum terpenuhi';
  }

  return {
    value, // 0, 0.5, atau 1
    mdd,
    mmf,
    label
  };
}

/**
 * Memeriksa apakah kriteria K5 aktif untuk balita.
 * K5 HANYA aktif jika umur balita pada tanggal penilaian berada dalam rentang:
 * 6 bulan sampai sebelum 24 bulan (6 - 23 bulan).
 * Kelompok R3 (6-8 bln), R4 (9-11 bln), dan R5 (12-23 bln) menggunakan K5.
 * Kelompok R1 (0-2 bln), R2 (3-5 bln), R6 (24-35 bln), R7 (36-47 bln), R8 (48-59 bln) TIDAK menggunakan K5.
 * 
 * @param {number} [ageInMonths] - Umur balita dalam bulan
 * @param {number|string} [groupId] - ID Kelompok Umur (1 - 8)
 * @returns {boolean}
 */
export function isK5Applicable(ageInMonths, groupId) {
  if (typeof ageInMonths === 'number' && !isNaN(ageInMonths)) {
    return ageInMonths >= 6 && ageInMonths < 24;
  }
  const grp = Number(groupId) || 0;
  return grp === 3 || grp === 4 || grp === 5;
}

/**
 * K5 Legacy Helper (untuk kompatibilitas)
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
 * Mengonversi seluruh data mentah pemeriksaan menjadi skor terstandar Kriteria Baku.
 * K5 (Asupan Makanan: MDD & MMF) hanya aktif untuk usia 6–23 bulan (Kelompok R3, R4, R5).
 * Untuk usia < 6 bulan dan >= 24 bulan (Kelompok R1, R2, R6, R7, R8), K5 tidak aktif
 * dan dikeluarkan dari perhitungan SAW (menggunakan Model 4 Kriteria: K1 s/d K4).
 * 
 * @param {object} rawValues - Data nilai pemeriksaan
 * @param {number|string} ageGroupId - 1 s/d 8
 * @param {'L'|'P'} sex - 'L' atau 'P'
 * @param {number} [ageInMonths] - Usia aktual balita dalam bulan pada tanggal penilaian
 */
export function convertRawToStandardScores(rawValues = {}, ageGroupId = 4, sex = 'L', ageInMonths) {
  const grpId = Number(ageGroupId) || 4;
  const ageMonths = typeof ageInMonths === 'number' && !isNaN(ageInMonths)
    ? ageInMonths
    : (rawValues.ageInMonths ?? rawValues.age_in_months);

  const isK5Active = isK5Applicable(ageMonths, grpId);

  const rawBB = rawValues.K1 ?? rawValues.C1 ?? rawValues.beratBadan ?? 0;
  const rawTB = rawValues.K2 ?? rawValues.C2 ?? rawValues.tinggiBadan ?? 0;
  const rawLK = rawValues.K3 ?? rawValues.C3 ?? rawValues.lingkarKepala ?? 0;
  const rawImun = rawValues.K4 ?? rawValues.C5 ?? rawValues.imunisasi ?? rawValues.raw_imun ?? 17;

  const bbRes = getBBScore(rawBB, grpId, sex);
  const tbRes = getTBScore(rawTB, grpId, sex);
  const lkRes = getLKScore(rawLK, grpId, sex);
  const imunRes = getImunisasiScore(rawImun, grpId);

  const scores = {
    K1: bbRes.score,
    K2: tbRes.score,
    K3: lkRes.score,
    K4: imunRes.score
  };

  const labels = {
    K1: bbRes.label,
    K2: tbRes.label,
    K3: lkRes.label,
    K4: imunRes.label
  };

  let k5Details = null;

  if (isK5Active) {
    // K5 Aktif untuk usia 6–23 bulan (Kelompok R3, R4, R5)
    let k5Val = 0;
    let k5Label = '';

    if (rawValues.mddFoodGroups || rawValues.mddInput || rawValues.solidFrequency !== undefined) {
      k5Details = calculateK5Score({
        mddInput: rawValues.mddFoodGroups ?? rawValues.mddInput,
        mddScore: rawValues.mddScore ?? rawValues.mdd_score,
        mddCount: rawValues.mddCount ?? rawValues.mdd_count,
        mmfInput: {
          ageInMonths: ageMonths ?? (grpId === 3 ? 7 : grpId === 4 ? 10 : 15),
          isBreastfeeding: rawValues.breastfeeding ?? rawValues.breastfeeding_status,
          solidFrequency: rawValues.solidFrequency ?? rawValues.solid_frequency,
          milkFrequency: rawValues.milkFrequency ?? rawValues.milk_frequency
        },
        mmfScore: rawValues.mmfScore ?? rawValues.mmf_score
      });
      k5Val = k5Details.value;
      k5Label = k5Details.label;
    } else if (rawValues.K5 !== undefined && (rawValues.K5 === 0 || rawValues.K5 === 0.5 || rawValues.K5 === 1)) {
      k5Val = Number(rawValues.K5);
      k5Label = k5Val === 1 ? 'Kedua indikator terpenuhi' : k5Val === 0.5 ? 'Hanya satu indikator terpenuhi' : 'Kedua indikator belum terpenuhi';
    } else if (rawValues.raw_k5 !== undefined && (rawValues.raw_k5 === 0 || rawValues.raw_k5 === 0.5 || rawValues.raw_k5 === 1)) {
      k5Val = Number(rawValues.raw_k5);
      k5Label = k5Val === 1 ? 'Kedua indikator terpenuhi' : k5Val === 0.5 ? 'Hanya satu indikator terpenuhi' : 'Kedua indikator belum terpenuhi';
    } else if (rawValues.K5 !== undefined || rawValues.gizi !== undefined) {
      // Kompatibilitas mundur data legacy skala 1-4:
      // Skor 4 -> 1, Skor 3 -> 0.5, Skor 1-2 -> 0
      const leg = Number(rawValues.K5 ?? rawValues.gizi);
      k5Val = leg >= 4 ? 1 : leg === 3 ? 0.5 : 0;
      k5Label = k5Val === 1 ? 'Kedua indikator terpenuhi' : k5Val === 0.5 ? 'Hanya satu indikator terpenuhi' : 'Kedua indikator belum terpenuhi';
    }

    scores.K5 = k5Val; // 0, 0.5, atau 1
    labels.K5 = k5Label;
  } else {
    // K5 Tidak Aktif (Kelompok R1, R2: 0–5 bulan, dan R6, R7, R8: 24–59 bulan)
    labels.K5 = 'Tidak Berlaku untuk Kelompok Umur Ini';
    // scores.K5 TIDAK didefinisikan agar dikeluarkan dari perhitungan SAW!
  }

  // Status Flag:
  // Balita yang K1 (BB) atau K2 (TB) bernilai <= 2 atau memiliki skor 1 di kriteria fisik
  // dikategorikan sebagai 'Perlu Tinjau'. Jika K5 aktif dan nilainya 0 (kedua indikator tidak terpenuhi), juga dievaluasi.
  const isReviewNeeded = isK5Active
    ? (scores.K1 <= 2 || scores.K2 <= 2 || scores.K3 === 1 || scores.K4 === 1 || scores.K5 === 0)
    : (scores.K1 <= 2 || scores.K2 <= 2 || scores.K3 === 1 || scores.K4 === 1);
  const statusFlag = isReviewNeeded ? 'Perlu Tinjau' : 'Normal';

  return {
    scores,
    labels,
    statusFlag,
    isK5Active,
    isUnder6Months: grpId === 1 || grpId === 2,
    k5Details,
    rawValues: {
      BB: rawBB,
      TB: rawTB,
      LK: rawLK,
      Imunisasi: rawImun,
      ...(isK5Active ? { K5: scores.K5 } : {})
    }
  };
}

// Master Bobot AHP Baku Terkalibrasi untuk 5 Kriteria (Usia >= 6 bulan, Jumlah = 1.000000)
export const OFFICIAL_AHP_WEIGHTS = {
  K1: 0.122833, // BB/U
  K2: 0.122833, // PB/TB
  K3: 0.084737, // LK/U
  K4: 0.423687, // Kelengkapan Imunisasi
  K5: 0.245910  // Asupan Gizi & PMBA
};

// Master Bobot AHP Baku Terkalibrasi untuk 4 Kriteria (Usia < 6 bulan / ASI Eksklusif, Jumlah = 1.000000)
export const OFFICIAL_AHP_WEIGHTS_4 = {
  K1: 0.162920, // BB/U
  K2: 0.162920, // PB/TB
  K3: 0.112387, // LK/U
  K4: 0.561772  // Kelengkapan Imunisasi
};

// Matriks AHP 5x5 Konsisten yang menghasilkan bobot 5 kriteria (CR = 0.000030)
export const OFFICIAL_AHP_5X5_MATRIX = [
  // K1       K2       K3       K4       K5
  [ 1.000,   1.000,   1.450,   0.290,   0.500 ], // K1: BB/U
  [ 1.000,   1.000,   1.450,   0.290,   0.500 ], // K2: TB/U
  [ 0.690,   0.690,   1.000,   0.200,   0.345 ], // K3: LK/U
  [ 3.448,   3.448,   5.000,   1.000,   1.723 ], // K4: Imunisasi
  [ 2.000,   2.000,   2.900,   0.580,   1.000 ]  // K5: Asupan Gizi
];

// Matriks AHP 4x4 Konsisten untuk usia < 6 bulan (CR = 0.000078)
export const OFFICIAL_AHP_4X4_MATRIX = [
  // K1       K2       K3       K4
  [ 1.000,   1.000,   1.450,   0.290 ], // K1: BB/U
  [ 1.000,   1.000,   1.450,   0.290 ], // K2: TB/U
  [ 0.690,   0.690,   1.000,   0.200 ], // K3: LK/U
  [ 3.448,   3.448,   5.000,   1.000 ]  // K4: Imunisasi
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
    rawUnit: 'dosis',
    direction: 'benefit',
    weight: OFFICIAL_AHP_WEIGHTS.K4,
    description: 'Dosis imunisasi dasar balita (maks. 17 dosis)'
  },
  {
    code: 'K5',
    name: 'Asupan Makanan Balita (MDD & MMF)',
    shortName: 'Asupan Makanan',
    unit: 'Indeks 0, 0.5, 1',
    rawUnit: 'MDD+MMF',
    direction: 'benefit',
    weight: OFFICIAL_AHP_WEIGHTS.K5,
    description: 'Komposit MDD (keragaman pangan) & MMF (frekuensi makan), skala 0 - 1'
  }
];

export const OFFICIAL_CRITERIA_4 = [
  {
    code: 'K1',
    name: 'Berat Badan menurut Umur (BB/U)',
    shortName: 'BB/U',
    unit: 'Skor 1-4',
    rawUnit: 'kg',
    direction: 'benefit',
    weight: OFFICIAL_AHP_WEIGHTS_4.K1,
    description: 'Skor 4 = Ideal/Normal (-2 s.d +1 SD), Skor 1 = Sangat Kurang / Obesitas'
  },
  {
    code: 'K2',
    name: 'Panjang/Tinggi Badan menurut Umur (PB/TB)',
    shortName: 'PB/TB',
    unit: 'Skor 1-4',
    rawUnit: 'cm',
    direction: 'benefit',
    weight: OFFICIAL_AHP_WEIGHTS_4.K2,
    description: 'Skor 4 = Normal/Ideal (-2 s.d +2 SD), Skor 1 = Sangat Pendek (Severely Stunted)'
  },
  {
    code: 'K3',
    name: 'Lingkar Kepala menurut Umur (LK/U)',
    shortName: 'LK/U',
    unit: 'Skor 1-4',
    rawUnit: 'cm',
    direction: 'benefit',
    weight: OFFICIAL_AHP_WEIGHTS_4.K3,
    description: 'Skor 4 = Proporsional (-2 s.d +2 SD), Skor 1 = Mikrosefali / Makrosefali'
  },
  {
    code: 'K4',
    name: 'Riwayat Kelengkapan Imunisasi',
    shortName: 'Imunisasi',
    unit: 'Skor 1-4',
    rawUnit: 'dosis',
    direction: 'benefit',
    weight: OFFICIAL_AHP_WEIGHTS_4.K4,
    description: 'Dosis imunisasi dasar balita (maks. 17 dosis)'
  }
];

/**
 * Mendapatkan daftar kriteria baku berdasarkan kelompok umur balita.
 * K5 hanya aktif untuk Kelompok 3, 4, 5 (usia 6 - 23 bulan).
 * Kelompok 1, 2 (0 - 5 bulan) dan Kelompok 6, 7, 8 (24 - 59 bulan) menggunakan 4 kriteria.
 * @param {number|string} ageGroupId
 */
export function getOfficialCriteriaForGroup(ageGroupId) {
  const grpId = Number(ageGroupId) || 0;
  const isK5Active = grpId === 3 || grpId === 4 || grpId === 5;
  return isK5Active ? OFFICIAL_CRITERIA_5 : OFFICIAL_CRITERIA_4;
}

/**
 * Mendapatkan bobot AHP baku berdasarkan kelompok umur balita.
 * @param {number|string} ageGroupId
 */
export function getOfficialWeightsForGroup(ageGroupId) {
  const grpId = Number(ageGroupId) || 0;
  const isK5Active = grpId === 3 || grpId === 4 || grpId === 5;
  return isK5Active ? OFFICIAL_AHP_WEIGHTS : OFFICIAL_AHP_WEIGHTS_4;
}


