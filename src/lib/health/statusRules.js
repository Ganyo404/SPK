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
 * Evaluasi status skrining fisik balita berdasarkan parameter antropometri dan kesehatan
 * (Berat Badan, Tinggi Badan, LiLA, Imunisasi, Riwayat Sakit)
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

  const values = examination.values;
  const lila = values.C4 || values.lila; // Lingkar Lengan Atas (cm)
  const bb = values.C1 || values.bb;     // Berat Badan (kg)
  const tb = values.C2 || values.tb;     // Tinggi Badan (cm)
  const imun = values.C5 || values.imun; // Imunisasi (%)
  const sakit = values.C6 || values.sakit; // Frekuensi Sakit (kali)

  const alerts = [];
  const notes = [];

  // 1. Skrining LiLA (Standar Kemenkes: LiLA < 11.5 cm indikasi gizi buruk, 11.5 - 12.5 cm gizi kurang)
  if (typeof lila === 'number') {
    if (lila < 11.5) {
      alerts.push('Lingkar Lengan Atas (LiLA) < 11.5 cm: Indikasi risiko gizi kurang/buruk yang memerlukan evaluasi.');
    } else if (lila < 12.5) {
      notes.push('LiLA berada pada ambang batas pemantauan (11.5 - 12.4 cm). Disarankan evaluasi nutrisi berkala.');
    } else {
      notes.push('LiLA dalam batas normal (> 12.5 cm).');
    }
  }

  // 2. Skrining Frekuensi Sakit
  if (typeof sakit === 'number') {
    if (sakit >= 4) {
      alerts.push(`Frekuensi sakit tercatat ${sakit} kali dalam 6 bulan terakhir. Perlu pemeriksaan riwayat infeksi lebih lanjut.`);
    } else if (sakit >= 2) {
      notes.push(`Riwayat sakit ${sakit} kali, pantau daya tahan tubuh dan sanitasi lingkungan.`);
    }
  }

  // 3. Skrining Imunisasi
  if (typeof imun === 'number') {
    if (imun < 70) {
      notes.push('Cakupan imunisasi dasar belum lengkap. Harap segera lengkapi di Posyandu/Puskesmas.');
    }
  }

  // Penentuan Status Tampilan
  if (alerts.length > 0) {
    return {
      status: HEALTH_STATUS_LABELS.NEEDS_ATTENTION,
      badgeColor: 'rose',
      reasons: alerts.concat(notes),
      isClinicalAlert: true,
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  if (notes.length > 0 && (imun < 70 || (typeof lila === 'number' && lila < 12.5))) {
    return {
      status: HEALTH_STATUS_LABELS.FAIR,
      badgeColor: 'amber',
      reasons: notes,
      isClinicalAlert: false,
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  if (imun >= 90 && (typeof sakit === 'number' && sakit <= 1)) {
    return {
      status: HEALTH_STATUS_LABELS.VERY_GOOD,
      badgeColor: 'emerald',
      reasons: ['Pertumbuhan dan indikator pemantauan berjalan sangat baik.', 'Cakupan imunisasi optimal.'],
      isClinicalAlert: false,
      disclaimer: CLINICAL_DISCLAIMER
    };
  }

  return {
    status: HEALTH_STATUS_LABELS.GOOD,
    badgeColor: 'teal',
    reasons: ['Tumbuh kembang berjalan sesuai tahap usia balita.', 'Tetap lakukan pemantauan rutin bulanan.'],
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
