/**
 * SPK BALITA SEHAT - ATURAN STATUS KESEHATAN DAN REKOMENDASI EDUKASI
 * 
 * PENTING:
 * 1. Modul ini adalah instrumen skrining awal dan pendukung pemantauan, BUKAN pengganti diagnosis medis dokter.
 * 2. Status kesehatan dan rekomendasi TIDAK DITENTUKAN secara langsung dari ranking SAW.
 * 3. Mengacu pada pedoman Buku KIA / Standar Antropometri Kemenkes RI untuk skrining tumbuh kembang balita.
 */

export const HEALTH_STATUS_LABELS = {
  VERY_GOOD: 'Sangat Baik',
  GOOD: 'Baik',
  FAIR: 'Cukup Baik',
  NEEDS_ATTENTION: 'Perlu Penanganan',
  UNDETERMINED: 'Belum Ditentukan'
};

export const CLINICAL_DISCLAIMER = 
  'Sistem ini berfungsi sebagai alat bantu pencatatan, pemantauan, dan pendukung keputusan administratif Posyandu. ' +
  'Hasil perhitungan dan indikator di bawah ini BUKAN diagnosis medis final dokter atau tenaga kesehatan berwenang. ' +
  'Untuk penegakan diagnosis klinis, konsultasikan kondisi balita secara langsung ke Puskesmas atau dokter anak.';

/**
 * Evaluasi status skrining fisik balita berdasarkan 5 Kriteria Baku Permenkes No. 2/2020 & WHO
 * (K1: BB/U, K2: PB/TB, K3: LK/U, K4: Imunisasi, K5: Asupan Gizi & PMBA)
 * 
 * @param {object} examination - Data pemeriksaan balita
 * @param {object} child - Data anak (usia bulan, jenis kelamin)
 * @returns {{
 *   status: string,
 *   badgeColor: string,
 *   reasons: string[],
 *   isClinicalAlert: boolean,
 *   disclaimer: string
 * }}
 */
export function evaluateHealthStatus(examination, child = {}) {
  if (!examination || !examination.values) {
    return {
      status: HEALTH_STATUS_LABELS.UNDETERMINED,
      badgeColor: 'gray',
      reasons: ['Data pemeriksaan belum lengkap atau belum diverifikasi oleh petugas.'],
      isClinicalAlert: false,
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  const values = examination.values || {};
  const stdScores = examination.standard_scores || {};

  // Skor 5 Kriteria Baku (1 - 4)
  const k1Score = stdScores.K1 ?? values.K1 ?? 4;
  const k2Score = stdScores.K2 ?? values.K2 ?? 4;
  const k3Score = stdScores.K3 ?? values.K3 ?? 4;
  const k4Score = stdScores.K4 ?? values.K4 ?? 4;
  const k5Score = stdScores.K5 ?? values.K5 ?? 4;

  const alerts = [];
  const notes = [];

  // 1. K1: Berat Badan menurut Umur (BB/U)
  if (k1Score === 1) {
    alerts.push('Berat Badan (BB/U) sangat kurang atau risiko obesitas. Perlu evaluasi klinis dokter.');
  } else if (k1Score === 2) {
    notes.push('Berat Badan (BB/U) kurang atau kelebihan berat badan. Disarankan pemantauan asupan kalori berkala.');
  }

  // 2. K2: Panjang / Tinggi Badan menurut Umur (PB/TB)
  if (k2Score === 1) {
    alerts.push('Tinggi Badan (PB/TB) sangat pendek (severely stunted). Memerlukan intervensi gizi intensif.');
  } else if (k2Score === 2) {
    notes.push('Tinggi Badan (PB/TB) berada di bawah garis standar (-2 SD / stunted). Tingkatkan asupan protein hewani.');
  }

  // 3. K3: Lingkar Kepala menurut Umur (LK/U)
  if (k3Score === 1) {
    alerts.push('Lingkar Kepala (LK/U) mengarah ke mikrosefali atau makrosefali. Perlu konsultasi spesialis anak.');
  } else if (k3Score === 2) {
    notes.push('Lingkar Kepala (LK/U) berada di batas pemantauan (-2 SD s/d -3 SD atau +2 SD s/d +3 SD).');
  }

  // 4. K4: Riwayat Imunisasi
  if (k4Score === 1) {
    alerts.push('Cakupan imunisasi dasar sangat kurang (< 40%). Balita rentan terhadap penyakit infeksi PD3I.');
  } else if (k4Score === 2) {
    notes.push('Cakupan imunisasi belum lengkap sesuai jadwal usia (40% - 74%). Lengkapi di Posyandu.');
  }

  // 5. K5: Asupan Gizi & PMBA
  if (k5Score === 1) {
    alerts.push('Praktik makan & asupan gizi defisit berat (<= 1 indikator terpenuhi). Risiko malnutrisi.');
  } else if (k5Score === 2) {
    notes.push('Praktik makan balita kurang variatif (2 indikator terpenuhi). Terapkan prinsip gizi seimbang 4 bintang.');
  }

  const isReviewNeeded = examination.status_flag === 'Perlu Tinjau' || alerts.length > 0;

  // Penentuan Status Tampilan
  if (isReviewNeeded && alerts.length > 0) {
    return {
      status: HEALTH_STATUS_LABELS.NEEDS_ATTENTION,
      badgeColor: 'rose',
      reasons: alerts.concat(notes),
      isClinicalAlert: true,
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  if (notes.length > 0 || examination.status_flag === 'Perlu Tinjau') {
    return {
      status: HEALTH_STATUS_LABELS.FAIR,
      badgeColor: 'amber',
      reasons: notes.length > 0 ? notes : ['Pertumbuhan memerlukan pemantauan berkala pada kunjungan berikutnya.'],
      isClinicalAlert: false,
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  if (k1Score === 4 && k2Score === 4 && k3Score === 4 && k4Score === 4 && k5Score >= 3) {
    return {
      status: HEALTH_STATUS_LABELS.VERY_GOOD,
      badgeColor: 'emerald',
      reasons: [
        'Pertumbuhan fisik balita (BB, TB, LK) berada pada batas ideal kurva pertumbuhan WHO.',
        'Imunisasi lengkap dan asupan gizi PMBA optimal.'
      ],
      isClinicalAlert: false,
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  return {
    status: HEALTH_STATUS_LABELS.GOOD,
    badgeColor: 'teal',
    reasons: ['Tumbuh kembang berjalan sesuai tahap usia balita.', 'Tetap lakukan pemantauan rutin bulanan di Posyandu.'],
    isClinicalAlert: false,
    disclaimer: CLINICAL_DISCLAIMER
  };
}

/**
 * Menghasilkan rekomendasi edukasi terstruktur untuk orang tua
 * @param {string} status - Status kesehatan hasil evaluasi
 * @param {object} examination - Data pemeriksaan
 * @returns {Array<{ category: string, title: string, description: string, priority: 'high' | 'normal' }>}
 */
export function generateEducationalRecommendations(status, examination) {
  const recommendations = [
    {
      category: 'Kunjungan Rutin',
      title: 'Pemantauan Posyandu Bulanan',
      description: 'Lanjutkan kunjungan rutin setiap bulan ke Posyandu untuk menimbang berat badan, mengukur tinggi badan, dan memperbarui catatan Buku KIA.',
      priority: 'normal'
    },
    {
      category: 'Pola Asuh & Stimulasi',
      title: 'Stimulasi Tumbuh Kembang Aktif',
      description: 'Berikan stimulasi motorik kasar, motorik halus, dan kemampuan bicara melalui interaksi bermain yang menyenangkan setiap hari.',
      priority: 'normal'
    }
  ];

  if (status === HEALTH_STATUS_LABELS.NEEDS_ATTENTION) {
    recommendations.unshift({
      category: 'Tindak Lanjut Medis',
      title: 'Konsultasi Langsung dengan Petugas / Puskesmas',
      description: 'Terdapat indikator yang memerlukan pemeriksaan langsung oleh dokter atau tenaga gizi. Segera kunjungi fasilitas kesehatan terdekat.',
      priority: 'high'
    });
    recommendations.push({
      category: 'Asupan Gizi',
      title: 'Evaluasi MPASI / Makanan Bergizi Seimbang',
      description: 'Perhatikan kecukupan protein hewani (telur, ikan, daging) dan kalori harian balita sesuai anjuran ahli gizi.',
      priority: 'high'
    });
  } else if (status === HEALTH_STATUS_LABELS.FAIR) {
    recommendations.unshift({
      category: 'Gizi & Nutrisi',
      title: 'Peningkatan Kualitas Nutrisi Seimbang',
      description: 'Variasikan menu makanan pendamping ASI / makanan keluarga dengan menambahkan sumber protein hewani dan sayuran segar.',
      priority: 'normal'
    });
  } else {
    recommendations.unshift({
      category: 'Gizi Optimal',
      title: 'Pertahankan Pola Makan Seimbang & Hidrasi',
      description: 'Pertahankan kebiasaan konsumsi gizi seimbang, kebersihan makanan, dan kecukupan minum air bersih.',
      priority: 'normal'
    });
  }

  return recommendations;
}
