/**
 * SPK BALITA SEHAT - MODUL SAW (Simple Additive Weighting)
 * Menghitung nilai normalisasi, preferensi, dan pemeringkatan alternatif balita.
 */

/**
 * Normalisasi nilai kriteria berdasarkan tipe (benefit atau cost)
 * @param {number} val - Nilai alternatif pada kriteria
 * @param {number} maxVal - Nilai maksimum pada kriteria dalam kelompok/periode
 * @param {number} minVal - Nilai minimum pada kriteria dalam kelompok/periode
 * @param {'benefit' | 'cost'} direction - Arah kriteria
 * @returns {number} Nilai normalisasi (0 s/d 1)
 */
export function normalizeCriterionValue(val, maxVal, minVal, direction = 'benefit') {
  if (typeof val !== 'number' || isNaN(val)) {
    return 0;
  }

  if (direction === 'benefit') {
    if (maxVal <= 0) return 0;
    return val / maxVal;
  }

  // Arah 'cost' (nilai lebih kecil lebih baik, misal frekuensi sakit)
  if (direction === 'cost') {
    // Penanganan khusus jika terdapat nilai 0 (misal anak tidak pernah sakit = 0 kali)
    // 0 kali sakit adalah kondisi terbaik (skor normalisasi = 1.0)
    if (val === 0 && minVal === 0) {
      return 1.0;
    }

    if (minVal === 0) {
      // Skala transformasi bergeser aman: (min + 1) / (val + 1)
      return (minVal + 1) / (val + 1);
    }

    if (val <= 0) {
      return 1.0;
    }

    return minVal / val;
  }

  return 0;
}

/**
 * Jalankan perhitungan SAW untuk sekumpulan alternatif pemeriksaan anak
 * dalam satu kelompok tahun kelahiran dan periode yang sama.
 * 
 * @param {Array<{
 *   childId: string,
 *   childName: string,
 *   birthYear: number,
 *   examinationId: string,
 *   period: string,
 *   values: Record<string, number> // { C1: 10.5, C2: 85, C3: 47, ... }
 * }>} alternatives - Daftar alternatif yang sudah diverifikasi
 * @param {Array<{
 *   code: string,
 *   name: string,
 *   direction: 'benefit' | 'cost'
 * }>} criteriaList - Daftar kriteria aktif
 * @param {Record<string, number>} ahpWeights - Peta bobot kriteria dari AHP { C1: 0.35, ... }
 * @param {object} [options] - Opsi tambahan
 * @returns {{
 *   valid: boolean,
 *   error?: string,
 *   birthYear?: number,
 *   period?: string,
 *   alternativeCount: number,
 *   criteria: Array<object>,
 *   minMaxSummary: Record<string, { min: number, max: number }>,
 *   results: Array<{
 *     rank: number,
 *     childId: string,
 *     childName: string,
 *     examinationId: string,
 *     rawValues: Record<string, number>,
 *     normalizedValues: Record<string, number>,
 *     contributions: Record<string, number>,
 *     preferenceScore: number
 *   }>
 * }}
 */
export function calculateSAW(alternatives, criteriaList, ahpWeights, options = {}) {
  if (!Array.isArray(alternatives) || alternatives.length === 0) {
    return {
      valid: false,
      error: 'Tidak ada alternatif yang memenuhi syarat untuk dihitung pada kelompok dan periode ini.',
      alternativeCount: 0,
      results: []
    };
  }

  if (!Array.isArray(criteriaList) || criteriaList.length === 0) {
    return {
      valid: false,
      error: 'Daftar kriteria tidak boleh kosong.',
      alternativeCount: 0,
      results: []
    };
  }

  // 1. Validasi konsistensi Kelompok Umur & Periode
  const firstAgeGroupId = alternatives[0].ageGroupId !== undefined ? alternatives[0].ageGroupId : alternatives[0].birthYear;
  const firstPeriod = alternatives[0].period;

  for (let idx = 0; idx < alternatives.length; idx++) {
    const alt = alternatives[idx];
    if (options.strictGrouping !== false) {
      const altGroupId = alt.ageGroupId !== undefined ? alt.ageGroupId : alt.birthYear;
      if (altGroupId !== firstAgeGroupId) {
        return {
          valid: false,
          error: `Aturan isolasi kelompok dilanggar: alternatif '${alt.childName}' berada pada kelompok '${altGroupId}', berbeda dengan kelompok acuan '${firstAgeGroupId}'.`,
          alternativeCount: 0,
          results: []
        };
      }
      if (alt.period !== firstPeriod) {
        return {
          valid: false,
          error: `Aturan isolasi periode dilanggar: alternatif '${alt.childName}' memiliki periode '${alt.period}', berbeda dengan periode '${firstPeriod}'.`,
          alternativeCount: 0,
          results: []
        };
      }
    }
  }

  // 2. Validasi keunikan anak (hanya 1 pemeriksaan per anak dalam 1 periode)
  const seenChildIds = new Set();
  for (const alt of alternatives) {
    if (seenChildIds.has(alt.childId)) {
      return {
        valid: false,
        error: `Duplikasi anak terdeteksi: anak dengan ID '${alt.childId}' memiliki lebih dari satu pemeriksaan dalam periode ini. Pilih satu pemeriksaan acuan.`,
        alternativeCount: 0,
        results: []
      };
    }
    seenChildIds.add(alt.childId);
  }

  // 3. Validasi kelengkapan nilai kriteria pada setiap alternatif
  for (const alt of alternatives) {
    for (const crit of criteriaList) {
      const val = alt.values?.[crit.code];
      if (typeof val !== 'number' || isNaN(val)) {
        return {
          valid: false,
          error: `Alternatif '${alt.childName}' tidak memiliki nilai valid untuk kriteria '${crit.code}' (${crit.name}).`,
          alternativeCount: 0,
          results: []
        };
      }
    }
  }

  // 4. Cari nilai Max dan Min untuk setiap kriteria dalam himpunan alternatif
  const minMaxSummary = {};
  for (const crit of criteriaList) {
    let min = Infinity;
    let max = -Infinity;

    for (const alt of alternatives) {
      const val = alt.values[crit.code];
      if (val < min) min = val;
      if (val > max) max = val;
    }

    minMaxSummary[crit.code] = {
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
      direction: crit.direction || 'benefit'
    };
  }

  // 5. Normalisasi Matriks & Hitung Nilai Preferensi (Vi = Σ wj * rij)
  const scoredAlternatives = alternatives.map(alt => {
    const normalizedValues = {};
    const contributions = {};
    let preferenceScore = 0;

    for (const crit of criteriaList) {
      const code = crit.code;
      const rawVal = alt.values[code];
      const summary = minMaxSummary[code];
      const weight = ahpWeights[code] ?? (1 / criteriaList.length);

      const rij = normalizeCriterionValue(rawVal, summary.max, summary.min, summary.direction);
      const contribution = rij * weight;

      normalizedValues[code] = Number(rij.toFixed(6));
      contributions[code] = Number(contribution.toFixed(6));
      preferenceScore += contribution;
    }

    return {
      childId: alt.childId,
      childName: alt.childName,
      birthYear: alt.birthYear,
      examinationId: alt.examinationId,
      period: alt.period,
      rawValues: { ...alt.values },
      normalizedValues,
      contributions,
      preferenceScore: Number(preferenceScore.toFixed(6))
    };
  });

  // 6. Urutkan berdasarkan Skor Preferensi Tertinggi (Descending) dengan Aturan Tie-Break Konsisten
  scoredAlternatives.sort((a, b) => {
    // 1st priority: Skor preferensi SAW
    const diff = b.preferenceScore - a.preferenceScore;
    if (Math.abs(diff) > 0.000001) {
      return diff;
    }

    // 2nd priority (Tie-Break): bandingkan kontribusi kriteria dengan bobot terbesar
    for (const crit of criteriaList) {
      const code = crit.code;
      const contDiff = (b.contributions[code] || 0) - (a.contributions[code] || 0);
      if (Math.abs(contDiff) > 0.000001) {
        return contDiff;
      }
    }

    // 3rd priority: deterministik stabil berdasarkan nama dan ID anak
    return a.childName.localeCompare(b.childName) || a.childId.localeCompare(b.childId);
  });

  // 7. Berikan Peringkat (Rank)
  const results = scoredAlternatives.map((item, index) => ({
    rank: index + 1,
    ...item
  }));

  return {
    valid: true,
    ageGroupId: firstAgeGroupId,
    birthYear: alternatives[0].birthYear,
    period: firstPeriod,
    alternativeCount: results.length,
    criteria: criteriaList,
    minMaxSummary,
    results
  };
}
