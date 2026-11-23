import {
  calculateAHP,
  DEFAULT_AHP_5X5_MATRIX,
  DEFAULT_5_CRITERIA_CODES,
  DEFAULT_AHP_4X4_MATRIX,
  DEFAULT_4_CRITERIA_CODES,
  OFFICIAL_AHP_WEIGHTS_4
} from './ahp.js';
import { calculateSAW } from './saw.js';
import {
  OFFICIAL_AHP_WEIGHTS,
  OFFICIAL_CRITERIA_5,
  OFFICIAL_CRITERIA_4,
  convertRawToStandardScores,
  getBBScore,
  getTBScore,
  getLKScore,
  getImunisasiScore
} from './scoringStandard.js';

console.log('=== TEST 1: PENGUJIAN METODE AHP 5x5 BAKU (CR <= 0.10) ===');
const ahpResult = calculateAHP(DEFAULT_AHP_5X5_MATRIX, DEFAULT_5_CRITERIA_CODES);
console.log('AHP Valid:', ahpResult.valid);
console.log('Criteria:', DEFAULT_5_CRITERIA_CODES);
console.log('Weights Map:', ahpResult.weightsMap);
console.log('Lambda Max:', ahpResult.lambdaMax);
console.log('CI (Consistency Index):', ahpResult.ci);
console.log('CR (Consistency Ratio):', ahpResult.cr);
console.log('Is Consistent (CR <= 0.10):', ahpResult.isConsistent);

if (!ahpResult.valid || !ahpResult.isConsistent || ahpResult.cr > 0.10) {
  throw new Error('AHP Test FAILED: Matriks default 5x5 tidak konsisten!');
}
console.log('--> AHP 5x5 TEST PASSED (CR = ' + ahpResult.cr + ' <= 0.10)!\n');

console.log('=== TEST 2: PENGUJIAN STANDARISASI SKOR PERMENKES NO. 2/2020 & WHO ===');
// Pengujian balita usia 10 bulan Laki-laki (Kelompok 4: 9 - 11 bulan)
// BB 8.5 kg -> Ideal (Skor 4)
const bbIdeal = getBBScore(8.5, 4, 'L');
console.log('BB 8.5 kg (L 10 bln):', bbIdeal.score, bbIdeal.label);
if (bbIdeal.score !== 4) throw new Error('BB Ideal standardization failed');

// BB 7.2 kg -> Kurang (Skor 2)
const bbKurang = getBBScore(7.2, 4, 'L');
console.log('BB 7.2 kg (L 10 bln):', bbKurang.score, bbKurang.label);
if (bbKurang.score !== 2) throw new Error('BB Kurang standardization failed');

// Konversi lengkap A7 (Haris) & A3 (Kevin)
const harisStd = convertRawToStandardScores(
  { C1: 7.2, C2: 68.0, C3: 42.5, C5: 50, gizi: 4 },
  4,
  'L'
);
console.log('Haris Standard Scores:', harisStd.scores, 'Status:', harisStd.statusFlag);
if (harisStd.scores.K1 !== 2 || harisStd.scores.K2 !== 2 || harisStd.scores.K3 !== 2 || harisStd.statusFlag !== 'Perlu Tinjau') {
  throw new Error('Haris standardization mismatch');
}

const kevinStd = convertRawToStandardScores(
  { C1: 9.2, C2: 74.0, C3: 45.8, C5: 17, gizi: 4 },
  4,
  'L'
);
console.log('Kevin Standard Scores:', kevinStd.scores, 'Status:', kevinStd.statusFlag);
if (kevinStd.scores.K1 !== 4 || kevinStd.scores.K2 !== 4 || kevinStd.scores.K4 !== 4 || kevinStd.statusFlag !== 'Normal') {
  throw new Error('Kevin standardization mismatch');
}

// Pengujian K4: Target Dosis Imunisasi per Kelompok Umur
console.log('--- Pengujian K4: Standar Dosis Imunisasi per Kelompok ---');
// Kelompok 1 (0-2 bln): Target 6
if (getImunisasiScore(6, 1).score !== 4) throw new Error('K4 Kelompok 1 (6 dosis) failed');
if (getImunisasiScore(5, 1).score !== 3) throw new Error('K4 Kelompok 1 (5 dosis) failed');
if (getImunisasiScore(4, 1).score !== 2) throw new Error('K4 Kelompok 1 (4 dosis) failed');
if (getImunisasiScore(3, 1).score !== 2) throw new Error('K4 Kelompok 1 (3 dosis) failed');
if (getImunisasiScore(2, 1).score !== 1) throw new Error('K4 Kelompok 1 (2 dosis) failed');
if (getImunisasiScore(0, 1).score !== 1) throw new Error('K4 Kelompok 1 (0 dosis) failed');

// Kelompok 2 (3-5 bln): Target 15
if (getImunisasiScore(15, 2).score !== 4) throw new Error('K4 Kelompok 2 (15 dosis) failed');
if (getImunisasiScore(13, 2).score !== 3) throw new Error('K4 Kelompok 2 (13 dosis) failed');
if (getImunisasiScore(10, 2).score !== 2) throw new Error('K4 Kelompok 2 (10 dosis) failed');
if (getImunisasiScore(5, 2).score !== 1) throw new Error('K4 Kelompok 2 (5 dosis) failed');

// Kelompok 3 (6-8 bln): Target 15
if (getImunisasiScore(15, 3).score !== 4) throw new Error('K4 Kelompok 3 (15 dosis) failed');
if (getImunisasiScore(14, 3).score !== 3) throw new Error('K4 Kelompok 3 (14 dosis) failed');
if (getImunisasiScore(8, 3).score !== 2) throw new Error('K4 Kelompok 3 (8 dosis) failed');
if (getImunisasiScore(6, 3).score !== 1) throw new Error('K4 Kelompok 3 (6 dosis) failed');

// Kelompok 4 (9-11 bln): Target 17
if (getImunisasiScore(17, 4).score !== 4) throw new Error('K4 Kelompok 4 (17 dosis) failed');
if (getImunisasiScore(15, 4).score !== 3) throw new Error('K4 Kelompok 4 (15 dosis) failed');
if (getImunisasiScore(11, 4).score !== 2) throw new Error('K4 Kelompok 4 (11 dosis) failed');
if (getImunisasiScore(7, 4).score !== 1) throw new Error('K4 Kelompok 4 (7 dosis) failed');

// Kelompok 5-8 (12-59 bln): Target 17
if (getImunisasiScore(17, 6).score !== 4) throw new Error('K4 Kelompok 6 (17 dosis) failed');
if (getImunisasiScore(14, 6).score !== 3) throw new Error('K4 Kelompok 6 (14 dosis) failed');
if (getImunisasiScore(9, 6).score !== 2) throw new Error('K4 Kelompok 6 (9 dosis) failed');
if (getImunisasiScore(3, 6).score !== 1) throw new Error('K4 Kelompok 6 (3 dosis) failed');
console.log('Semua rentang dosis Kelompok 1 s/d 8 terverifikasi valid!');
console.log('--> STANDARDIZATION TEST PASSED!\n');

console.log('=== TEST 3: PENGUJIAN 12 BALITA BENCHMARK SIMULASI EXCEL SAW ===');
const benchmarkAlts = [
  { childId: 'a1', childName: 'Rehan', values: { K1: 4, K2: 4, K3: 4, K4: 4, K5: 3 }, statusFlag: 'Normal' },
  { childId: 'a2', childName: 'Suci', values: { K1: 4, K2: 4, K3: 4, K4: 3, K5: 4 }, statusFlag: 'Normal' },
  { childId: 'a3', childName: 'Kevin', values: { K1: 4, K2: 4, K3: 4, K4: 4, K5: 4 }, statusFlag: 'Normal' },
  { childId: 'a4', childName: 'Tiara', values: { K1: 4, K2: 4, K3: 4, K4: 4, K5: 3 }, statusFlag: 'Normal' },
  { childId: 'a5', childName: 'Layla', values: { K1: 4, K2: 4, K3: 4, K4: 3, K5: 4 }, statusFlag: 'Normal' },
  { childId: 'a6', childName: 'Revi', values: { K1: 4, K2: 4, K3: 4, K4: 4, K5: 3 }, statusFlag: 'Normal' },
  { childId: 'a7', childName: 'Haris', values: { K1: 2, K2: 2, K3: 2, K4: 2, K5: 4 }, statusFlag: 'Perlu Tinjau' },
  { childId: 'a8', childName: 'Rafael', values: { K1: 4, K2: 4, K3: 4, K4: 3, K5: 3 }, statusFlag: 'Normal' },
  { childId: 'a9', childName: 'Hafizah', values: { K1: 4, K2: 4, K3: 4, K4: 4, K5: 4 }, statusFlag: 'Normal' },
  { childId: 'a10', childName: 'Hakim', values: { K1: 4, K2: 4, K3: 4, K4: 3, K5: 2 }, statusFlag: 'Normal' },
  { childId: 'a11', childName: 'Ega', values: { K1: 2, K2: 4, K3: 4, K4: 4, K5: 3 }, statusFlag: 'Perlu Tinjau' },
  { childId: 'a12', childName: 'Bily', values: { K1: 4, K2: 4, K3: 4, K4: 3, K5: 4 }, statusFlag: 'Normal' },
];

const sawSimResult = calculateSAW(benchmarkAlts, OFFICIAL_CRITERIA_5, OFFICIAL_AHP_WEIGHTS, { strictGrouping: false });
console.log('SAW Simulation Valid:', sawSimResult.valid);
sawSimResult.results.forEach(r => {
  console.log(`Rank ${r.rank} | ${r.childName} | Score Vi: ${r.preferenceScore.toFixed(7)} | Status: ${r.statusFlag}`);
});

// Verifikasi Exact Rank & Score:
// Rank 1: Kevin & Hafizah (1.0000000)
const rank1List = sawSimResult.results.filter(r => r.rank === 1);
if (rank1List.length !== 2 || Math.abs(rank1List[0].preferenceScore - 1.0) > 0.00001) {
  throw new Error('Rank 1 simulation mismatch!');
}

// Rank 3: Rehan, Revi, Tiara (0.9385225)
const rank3List = sawSimResult.results.filter(r => r.rank === 3);
if (rank3List.length !== 3 || Math.abs(rank3List[0].preferenceScore - 0.9385225) > 0.00001) {
  throw new Error('Rank 3 simulation mismatch!');
}

// Rank 6: Bily, Layla, Suci (0.8940782)
const rank6List = sawSimResult.results.filter(r => r.rank === 6);
if (rank6List.length !== 3 || Math.abs(rank6List[0].preferenceScore - 0.8940782) > 0.00001) {
  throw new Error('Rank 6 simulation mismatch!');
}

// Rank 9: Ega (0.8771060, Perlu Tinjau)
const ega = sawSimResult.results.find(r => r.childName === 'Ega');
if (!ega || ega.rank !== 9 || Math.abs(ega.preferenceScore - 0.8771060) > 0.00001 || ega.statusFlag !== 'Perlu Tinjau') {
  throw new Error('Ega simulation mismatch!');
}

// Rank 12: Haris (0.6229550, Perlu Tinjau)
const haris = sawSimResult.results.find(r => r.childName === 'Haris');
if (!haris || haris.rank !== 12 || Math.abs(haris.preferenceScore - 0.6229550) > 0.00001 || haris.statusFlag !== 'Perlu Tinjau') {
  throw new Error('Haris simulation mismatch!');
}

console.log('--> EXACT 12 BALITA BENCHMARK SIMULATION PASSED (100% MATCH)!\n');

console.log('=== TEST 4: PENGUJIAN ISOLASI KELOMPOK & PERIODE ===');
const mixedAlts = [
  { childId: 'x1', childName: 'Anak A', ageGroupId: 4, period: '2026-10', values: { K1: 4, K2: 4, K3: 4, K4: 4, K5: 4 } },
  { childId: 'x2', childName: 'Anak B', ageGroupId: 5, period: '2026-10', values: { K1: 4, K2: 4, K3: 4, K4: 4, K5: 4 } }
];
const mixedCheck = calculateSAW(mixedAlts, OFFICIAL_CRITERIA_5, OFFICIAL_AHP_WEIGHTS);
if (mixedCheck.valid) {
  throw new Error('Isolation check failed: mixed ageGroupId should be rejected!');
}
console.log('--> ISOLATION TEST PASSED!\n');

console.log('=== TEST 5: PENGUJIAN MODEL 4 KRITERIA AHP & SAW UNTUK BAYI < 6 BULAN (Fase ASI Eksklusif) ===');
// 5.1 Konsistensi Matriks AHP 4x4
const ahp4Result = calculateAHP(DEFAULT_AHP_4X4_MATRIX, DEFAULT_4_CRITERIA_CODES);
console.log('AHP 4x4 Valid:', ahp4Result.valid);
console.log('Criteria 4:', DEFAULT_4_CRITERIA_CODES);
console.log('Weights Map 4:', ahp4Result.weightsMap);
console.log('Lambda Max 4:', ahp4Result.lambdaMax);
console.log('CI 4:', ahp4Result.ci);
console.log('CR 4:', ahp4Result.cr);
console.log('Is Consistent 4 (CR <= 0.10):', ahp4Result.isConsistent);

if (!ahp4Result.valid || !ahp4Result.isConsistent || ahp4Result.cr > 0.10) {
  throw new Error('AHP 4x4 Test FAILED: Matriks default 4x4 tidak konsisten!');
}
if (Math.abs(ahp4Result.weightsMap.K1 - OFFICIAL_AHP_WEIGHTS_4.K1) > 0.0001 ||
    Math.abs(ahp4Result.weightsMap.K4 - OFFICIAL_AHP_WEIGHTS_4.K4) > 0.0001) {
  throw new Error('AHP 4x4 Weights mismatch with OFFICIAL_AHP_WEIGHTS_4!');
}
console.log('--> AHP 4x4 TEST PASSED (CR = ' + ahp4Result.cr + ' <= 0.10)!\n');

// 5.2 Standarisasi Balita Usia 1 Bulan (Kelompok 1) & 4 Bulan (Kelompok 2): K5 Dinonaktifkan
const bayi1Std = convertRawToStandardScores(
  { C1: 4.8, C2: 56.0, C3: 38.0, C5: 6 },
  1, // Kelompok 1: 0 - 2 bulan
  'L'
);
console.log('Bayi 1 Bulan Standard Scores:', bayi1Std.scores, 'isUnder6Months:', bayi1Std.isUnder6Months);
if (!bayi1Std.isUnder6Months) throw new Error('Bayi 1 bulan should have isUnder6Months = true');
if (bayi1Std.scores.K5 !== undefined) throw new Error('K5 should NOT be present in scores for < 6 months');
if (!bayi1Std.labels.K5.includes('ASI Eksklusif')) throw new Error('K5 label should indicate ASI Eksklusif');
if (bayi1Std.statusFlag !== 'Normal') throw new Error('Bayi 1 bulan statusFlag should be Normal');

const bayi2Std = convertRawToStandardScores(
  { C1: 4.0, C2: 54.0, C3: 36.5, C5: 5 }, // BB kurang (Skor 1), K4 sangat kurang (Skor 1)
  2, // Kelompok 2: 3 - 5 bulan
  'L'
);
console.log('Bayi 4 Bulan Standard Scores:', bayi2Std.scores, 'Status:', bayi2Std.statusFlag);
if (!bayi2Std.isUnder6Months) throw new Error('Bayi 4 bulan should have isUnder6Months = true');
if (bayi2Std.scores.K5 !== undefined) throw new Error('K5 should NOT be present in scores for < 6 months');
if (bayi2Std.statusFlag !== 'Perlu Tinjau') throw new Error('Bayi 4 bulan should be Perlu Tinjau');

// 5.3 Perhitungan SAW 4 Kriteria untuk Cohort Bayi < 6 Bulan
const infantAlts = [
  { childId: 'inf-1', childName: 'Bayi Optimal', ageGroupId: 1, period: '2026-10', values: { K1: 4, K2: 4, K3: 4, K4: 4 }, statusFlag: 'Normal' },
  { childId: 'inf-2', childName: 'Bayi Imunisasi Hampir Lengkap', ageGroupId: 1, period: '2026-10', values: { K1: 4, K2: 4, K3: 4, K4: 3 }, statusFlag: 'Normal' },
  { childId: 'inf-3', childName: 'Bayi BB Kurang', ageGroupId: 1, period: '2026-10', values: { K1: 2, K2: 4, K3: 4, K4: 4 }, statusFlag: 'Perlu Tinjau' }
];

const sawInfantResult = calculateSAW(infantAlts, OFFICIAL_CRITERIA_4, OFFICIAL_AHP_WEIGHTS_4, { strictGrouping: false });
console.log('SAW 4 Kriteria Valid:', sawInfantResult.valid);
sawInfantResult.results.forEach(r => {
  console.log(`Rank ${r.rank} | ${r.childName} | Score Vi: ${r.preferenceScore.toFixed(7)} | Status: ${r.statusFlag}`);
});

if (sawInfantResult.results[0].childName !== 'Bayi Optimal' || Math.abs(sawInfantResult.results[0].preferenceScore - 1.0) > 0.0001) {
  throw new Error('Bayi Optimal should have Rank 1 with Vi = 1.0000000');
}
if (sawInfantResult.results[1].childName !== 'Bayi BB Kurang' || sawInfantResult.results[1].rank !== 2) {
  throw new Error('Bayi BB Kurang should have Rank 2 with Vi = 0.9185390');
}
if (sawInfantResult.results[2].childName !== 'Bayi Imunisasi Hampir Lengkap' || sawInfantResult.results[2].rank !== 3) {
  throw new Error('Bayi Imunisasi Hampir Lengkap should have Rank 3 with Vi = 0.8595560');
}
console.log('--> MODEL 4 KRITERIA AHP-SAW FOR INFANTS < 6 BULAN (ASI EKSKLUSIF) PASSED!\n');

console.log('ALL SPK CORE MATHEMATICAL & CLINICAL TESTS PASSED SUCCESSFULLY!');
