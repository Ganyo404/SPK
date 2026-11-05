/**
 * SPK BALITA SEHAT - MODUL AHP (Analytic Hierarchy Process)
 * Digunakan untuk menghitung bobot kriteria dan menguji konsistensi matriks perbandingan berpasangan.
 */

// Random Index (RI) standar Saaty berdasarkan ukuran matriks (n)
export const SAATY_RANDOM_INDEX = {
  1: 0.00,
  2: 0.00,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24, // Nilai RI untuk 6 kriteria
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

export const CR_THRESHOLD = 0.10; // Ambang batas konsistensi (CR <= 0.10)

/**
 * Validasi matriks perbandingan berpasangan AHP
 * @param {number[][]} matrix - Matriks bujur sangkar n x n
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePairwiseMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return { valid: false, error: 'Matriks perbandingan tidak boleh kosong atau bukan array.' };
  }

  const n = matrix.length;

  for (let i = 0; i < n; i++) {
    if (!Array.isArray(matrix[i]) || matrix[i].length !== n) {
      return { valid: false, error: `Baris ke-${i + 1} tidak valid. Matriks harus berukuran ${n} x ${n}.` };
    }

    for (let j = 0; j < n; j++) {
      const val = matrix[i][j];
      if (typeof val !== 'number' || isNaN(val) || val <= 0) {
        return { valid: false, error: `Nilai pada posisi [${i + 1}, ${j + 1}] harus berupa angka positif lebih dari 0.` };
      }

      // Validasi diagonal utama harus 1
      if (i === j && Math.abs(val - 1.0) > 0.0001) {
        return { valid: false, error: `Nilai diagonal [${i + 1}, ${j + 1}] harus bernilai 1.` };
      }

      // Validasi sifat resiprokal: a[i][j] * a[j][i] ~= 1
      if (i !== j) {
        const reciprocal = matrix[j][i];
        if (Math.abs(val * reciprocal - 1.0) > 0.01) {
          return {
            valid: false,
            error: `Sifat resiprokal tidak terpenuhi pada sel [${i + 1}, ${j + 1}] (${val}) dan [${j + 1}, ${i + 1}] (${reciprocal}). Hasil perkalian harus mendekati 1.`
          };
        }
      }
    }
  }

  return { valid: true };
}

/**
 * Menghitung bobot kriteria dan rasio konsistensi (CR) dari matriks AHP
 * Menggunakan metode normalisasi rata-rata kolom (Column Normalization Method)
 * 
 * @param {number[][]} matrix - Matriks perbandingan berpasangan n x n
 * @param {string[]} [criterionCodes] - Opsional kode kriteria
 * @returns {{
 *   valid: boolean,
 *   weights: number[],
 *   weightsMap?: Record<string, number>,
 *   normalizedMatrix: number[][],
 *   columnSums: number[],
 *   lambdaMax: number,
 *   ci: number,
 *   cr: number,
 *   isConsistent: boolean,
 *   ri: number,
 *   error?: string
 * }}
 */
export function calculateAHP(matrix, criterionCodes = []) {
  const validation = validatePairwiseMatrix(matrix);
  if (!validation.valid) {
    return {
      valid: false,
      error: validation.error,
      weights: [],
      lambdaMax: 0,
      ci: 0,
      cr: 1,
      isConsistent: false
    };
  }

  const n = matrix.length;
  const ri = SAATY_RANDOM_INDEX[n] || (1.98 * (n - 2)) / n;

  // 1. Hitung jumlah setiap kolom
  const columnSums = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      columnSums[j] += matrix[i][j];
    }
  }

  // 2. Normalisasi matriks: membagi setiap elemen dengan jumlah kolomnya
  const normalizedMatrix = [];
  for (let i = 0; i < n; i++) {
    normalizedMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      normalizedMatrix[i][j] = matrix[i][j] / columnSums[j];
    }
  }

  // 3. Hitung bobot prioritas (rata-rata setiap baris dari matriks yang dinormalisasi)
  const weights = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let rowSum = 0;
    for (let j = 0; j < n; j++) {
      rowSum += normalizedMatrix[i][j];
    }
    weights[i] = rowSum / n;
  }

  // Normalisasi bobot agar total persis 1.0 (pencegahan pembulatan float)
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  for (let i = 0; i < n; i++) {
    weights[i] = weights[i] / totalWeight;
  }

  // 4. Hitung Lambda Max (Eigenvalue Maksimum)
  // λmax = Σ (jumlah kolom j * bobot j)
  let lambdaMax = 0;
  for (let j = 0; j < n; j++) {
    lambdaMax += columnSums[j] * weights[j];
  }

  // 5. Hitung Consistency Index (CI)
  // CI = (λmax - n) / (n - 1)
  const ci = n > 1 ? (lambdaMax - n) / (n - 1) : 0;

  // 6. Hitung Consistency Ratio (CR)
  // CR = CI / RI
  const cr = ri > 0 ? ci / ri : 0;
  const isConsistent = cr <= CR_THRESHOLD;

  // Bentuk peta kode kriteria jika disediakan
  const weightsMap = {};
  if (Array.isArray(criterionCodes) && criterionCodes.length === n) {
    criterionCodes.forEach((code, idx) => {
      weightsMap[code] = weights[idx];
    });
  }

  return {
    valid: true,
    n,
    matrix,
    columnSums,
    normalizedMatrix,
    weights: weights.map(w => Number(w.toFixed(6))),
    weightsMap,
    lambdaMax: Number(lambdaMax.toFixed(6)),
    ci: Number(ci.toFixed(6)),
    cr: Number(cr.toFixed(6)),
    ri,
    crThreshold: CR_THRESHOLD,
    isConsistent
  };
}

/**
 * Matriks Baku 5x5 untuk 5 Kriteria Permenkes No. 2/2020 & Standar WHO:
 * K1: Berat Badan menurut Umur (BB/U)
 * K2: Panjang/Tinggi Badan menurut Umur (PB/TB)
 * K3: Lingkar Kepala menurut Umur (LK/U)
 * K4: Riwayat Kelengkapan Imunisasi
 * K5: Asupan Gizi & Praktik Makan Balita (PMBA)
 * 
 * Telah diuji matematis menghasilkan CR = 0.000030 (Sangat Konsisten, CR <= 0.10)
 */
export const DEFAULT_AHP_5X5_MATRIX = [
  // K1       K2       K3       K4       K5
  [ 1.000,   1.000,   1.450,   0.290,   0.500 ], // K1: BB/U
  [ 1.000,   1.000,   1.450,   0.290,   0.500 ], // K2: TB/U
  [ 0.690,   0.690,   1.000,   0.200,   0.345 ], // K3: LK/U
  [ 3.448,   3.448,   5.000,   1.000,   1.723 ], // K4: Imunisasi
  [ 2.000,   2.000,   2.900,   0.580,   1.000 ]  // K5: Asupan Gizi
];

export const DEFAULT_5_CRITERIA_CODES = ['K1', 'K2', 'K3', 'K4', 'K5'];

export const OFFICIAL_AHP_WEIGHTS = {
  K1: 0.122833,
  K2: 0.122833,
  K3: 0.084737,
  K4: 0.423687,
  K5: 0.245910
};

export const DEFAULT_CRITERIA_CODES = ['K1', 'K2', 'K3', 'K4', 'K5'];
