/**
 * USULAN KELOMPOK UMUR UNTUK PENELITIAN SPK
 * Rentang dalam bulan lengkap; bukan klasifikasi resmi WHO atau Kemenkes.
 * Sesuai arahan penelitian SPK:
 * 1. 0–2 bulan  : Perhatian khusus pada awal kehidupan; sumber B.
 * 2. 3–5 bulan  : Memisahkan bayi awal dari fase berikutnya; kandidat desain.
 * 3. 6–8 bulan  : Fase awal MP-ASI; sumber C.
 * 4. 9–11 bulan : Kebutuhan frekuensi makan berbeda dari 6–8 bulan; sumber C.
 * 5. 12–23 bulan: Periode penting pertumbuhan dan pemberian makan; sumber C.
 * 6. 24–35 bulan: Kelompok tahunan, seperti pendekatan analisis sumber D.
 * 7. 36–47 bulan: Kelompok tahunan, seperti pendekatan analisis sumber D.
 * 8. 48–59 bulan: Kelompok tahunan, seperti pendekatan analisis sumber D.
 */

export const SPK_AGE_GROUPS = [
  {
    id: 1,
    key: 'group-1',
    name: 'Kelompok 1 (0–2 bulan)',
    shortName: 'Kelompok 1',
    rangeLabel: '0–2 bulan',
    minMonths: 0,
    maxMonths: 2,
    consideration: 'Perhatian khusus pada awal kehidupan; sumber B.'
  },
  {
    id: 2,
    key: 'group-2',
    name: 'Kelompok 2 (3–5 bulan)',
    shortName: 'Kelompok 2',
    rangeLabel: '3–5 bulan',
    minMonths: 3,
    maxMonths: 5,
    consideration: 'Memisahkan bayi awal dari fase berikutnya; kandidat desain.'
  },
  {
    id: 3,
    key: 'group-3',
    name: 'Kelompok 3 (6–8 bulan)',
    shortName: 'Kelompok 3',
    rangeLabel: '6–8 bulan',
    minMonths: 6,
    maxMonths: 8,
    consideration: 'Fase awal MP-ASI; sumber C.'
  },
  {
    id: 4,
    key: 'group-4',
    name: 'Kelompok 4 (9–11 bulan)',
    shortName: 'Kelompok 4',
    rangeLabel: '9–11 bulan',
    minMonths: 9,
    maxMonths: 11,
    consideration: 'Kebutuhan frekuensi makan berbeda dari 6–8 bulan; sumber C.'
  },
  {
    id: 5,
    key: 'group-5',
    name: 'Kelompok 5 (12–23 bulan)',
    shortName: 'Kelompok 5',
    rangeLabel: '12–23 bulan',
    minMonths: 12,
    maxMonths: 23,
    consideration: 'Periode penting pertumbuhan dan pemberian makan; sumber C.'
  },
  {
    id: 6,
    key: 'group-6',
    name: 'Kelompok 6 (24–35 bulan)',
    shortName: 'Kelompok 6',
    rangeLabel: '24–35 bulan',
    minMonths: 24,
    maxMonths: 35,
    consideration: 'Kelompok tahunan, seperti pendekatan analisis sumber D.'
  },
  {
    id: 7,
    key: 'group-7',
    name: 'Kelompok 7 (36–47 bulan)',
    shortName: 'Kelompok 7',
    rangeLabel: '36–47 bulan',
    minMonths: 36,
    maxMonths: 47,
    consideration: 'Kelompok tahunan, seperti pendekatan analisis sumber D.'
  },
  {
    id: 8,
    key: 'group-8',
    name: 'Kelompok 8 (48–59 bulan)',
    shortName: 'Kelompok 8',
    rangeLabel: '48–59 bulan',
    minMonths: 48,
    maxMonths: 59,
    consideration: 'Kelompok tahunan, seperti pendekatan analisis sumber D.'
  }
];

/**
 * Menghitung usia balita dalam hitungan bulan lengkap berdasarkan tanggal lahir
 * dan tanggal pemeriksaan atau kode periode (YYYY-MM).
 *
 * @param {string|Date} dateOfBirth - Tanggal lahir balita
 * @param {string|Date} [referenceDateOrPeriod] - Tanggal pemeriksaan atau string periode (misal: '2026-10')
 * @returns {number} Usia balita dalam bulan (integer >= 0)
 */
export function calculateAgeInMonths(dateOfBirth, referenceDateOrPeriod) {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return 0;

  if (typeof referenceDateOrPeriod === 'string' && /^\d{4}-\d{2}$/.test(referenceDateOrPeriod)) {
    const [year, month] = referenceDateOrPeriod.split('-').map(Number);
    const months = (year - dob.getFullYear()) * 12 + (month - 1 - dob.getMonth());
    return Math.max(0, months);
  }

  let refDate = referenceDateOrPeriod ? new Date(referenceDateOrPeriod) : new Date();
  if (isNaN(refDate.getTime())) refDate = new Date();

  let months = (refDate.getFullYear() - dob.getFullYear()) * 12 + (refDate.getMonth() - dob.getMonth());
  if (refDate.getDate() < dob.getDate()) {
    months--;
  }

  return Math.max(0, months);
}

/**
 * Mendapatkan objek kelompok umur berdasarkan usia dalam bulan
 * @param {number} ageInMonths
 * @returns {typeof SPK_AGE_GROUPS[0]}
 */
export function getAgeGroupForMonths(ageInMonths) {
  const months = Math.floor(Number(ageInMonths) || 0);
  const found = SPK_AGE_GROUPS.find(g => months >= g.minMonths && months <= g.maxMonths);
  if (found) return found;
  if (months > 59) return SPK_AGE_GROUPS[SPK_AGE_GROUPS.length - 1];
  return SPK_AGE_GROUPS[0];
}

/**
 * Mendapatkan info kelompok umur langsung dari tanggal lahir dan referensi pemeriksaan
 */
export function getChildAgeGroup(dateOfBirth, referenceDateOrPeriod) {
  const ageInMonths = calculateAgeInMonths(dateOfBirth, referenceDateOrPeriod);
  const ageGroup = getAgeGroupForMonths(ageInMonths);
  return {
    ageInMonths,
    ageGroup,
    groupId: ageGroup.id,
    groupName: ageGroup.name,
    rangeLabel: ageGroup.rangeLabel
  };
}
