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
  getImunisasiScore,
  calculateMDD,
  calculateMMF,
  calculateK5Score,
  isK5Applicable,
  MDD_FOOD_GROUPS,
  getOfficialCriteriaForGroup,
  getOfficialWeightsForGroup
} from './scoringStandard.js';

console.log('================================================================');
console.log('   PENGUJIAN SISTEM PENDUKUNG KEPUTUSAN (AHP & SAW) BALITA SEHAT ');
console.log('   PEMBARUAN KRITERIA K5 (ASUPAN MAKANAN: MDD & MMF WHO/UNICEF)   ');
console.log('================================================================\n');

// ============================================================================
// 1. PENGUJIAN METODE AHP 5x5 BAKU (CR <= 0.10)
// ============================================================================
console.log('=== TEST 1: PENGUJIAN METODE AHP 5x5 BAKU (CR <= 0.10) ===');
const ahp5 = calculateAHP(DEFAULT_AHP_5X5_MATRIX, DEFAULT_5_CRITERIA_CODES);
console.log('AHP 5x5 Valid:', ahp5.valid);
console.log('Weights Map 5x5:', ahp5.weightsMap);
console.log('CR (Consistency Ratio):', ahp5.cr);
console.log('Is Consistent (CR <= 0.10):', ahp5.isConsistent);

if (!ahp5.valid || !ahp5.isConsistent || ahp5.cr > 0.10) {
  throw new Error('AHP 5x5 Test FAILED: Matriks default 5x5 tidak konsisten!');
}
console.log('--> AHP 5x5 TEST PASSED (CR = ' + ahp5.cr + ' <= 0.10)!\n');

// ============================================================================
// 2. PENGUJIAN METODE AHP 4x4 BAKU (CR <= 0.10)
// ============================================================================
console.log('=== TEST 2: PENGUJIAN METODE AHP 4x4 BAKU (CR <= 0.10) ===');
const ahp4 = calculateAHP(DEFAULT_AHP_4X4_MATRIX, DEFAULT_4_CRITERIA_CODES);
console.log('AHP 4x4 Valid:', ahp4.valid);
console.log('Weights Map 4x4:', ahp4.weightsMap);
console.log('CR (Consistency Ratio):', ahp4.cr);
console.log('Is Consistent (CR <= 0.10):', ahp4.isConsistent);

if (!ahp4.valid || !ahp4.isConsistent || ahp4.cr > 0.10) {
  throw new Error('AHP 4x4 Test FAILED: Matriks default 4x4 tidak konsisten!');
}
console.log('--> AHP 4x4 TEST PASSED (CR = ' + ahp4.cr + ' <= 0.10)!\n');

// ============================================================================
// 3. PENGUJIAN STANDARISASI SKOR K1 - K4
// ============================================================================
console.log('=== TEST 3: PENGUJIAN STANDARISASI SKOR K1 - K4 (PERMENKES NO. 2/2020 & WHO) ===');
// BB 8.5 kg (L 10 bln) -> Skor 4
const bbIdeal = getBBScore(8.5, 4, 'L');
if (bbIdeal.score !== 4) throw new Error('BB Ideal standardization failed');

// BB 7.2 kg (L 10 bln) -> Skor 2
const bbKurang = getBBScore(7.2, 4, 'L');
if (bbKurang.score !== 2) throw new Error('BB Kurang standardization failed');

// Imunisasi K4: Batas dosis Kelompok 1 (Target 6)
if (getImunisasiScore(6, 1).score !== 4) throw new Error('K4 Kelompok 1 (6 dosis) failed');
if (getImunisasiScore(5, 1).score !== 3) throw new Error('K4 Kelompok 1 (5 dosis) failed');
if (getImunisasiScore(4, 1).score !== 2) throw new Error('K4 Kelompok 1 (4 dosis) failed');
if (getImunisasiScore(2, 1).score !== 1) throw new Error('K4 Kelompok 1 (2 dosis) failed');

// Imunisasi K4: Batas dosis Kelompok 4 (Target 17)
if (getImunisasiScore(17, 4).score !== 4) throw new Error('K4 Kelompok 4 (17 dosis) failed');
if (getImunisasiScore(15, 4).score !== 3) throw new Error('K4 Kelompok 4 (15 dosis) failed');
if (getImunisasiScore(11, 4).score !== 2) throw new Error('K4 Kelompok 4 (11 dosis) failed');
if (getImunisasiScore(7, 4).score !== 1) throw new Error('K4 Kelompok 4 (7 dosis) failed');
console.log('--> K1 - K4 STANDARDIZATION PASSED!\n');

// ============================================================================
// 4. PENGUJIAN LENGKAP 10 SKENARIO KHUSUS KRITERIA K5 & SAW
//    (Sesuai Bab 10 Instruksi Pembaharuan)
// ============================================================================
console.log('=== TEST 4: PENGUJIAN 10 SKENARIO KHUSUS KRITERIA K5 (MDD & MMF) & SAW ===');

// --- SKENARIO 1 ---
// Usia 7 bulan, masih ASI, makan padat 2x, 6 kelompok makanan -> MDD=1, MMF=1, K5=1
console.log('--- Skenario 1: Usia 7 bln, masih ASI, makan 2x, 6 kelompok makanan ---');
const s1Mdd = calculateMDD({ asi: true, staples: true, legumes: true, dairy: false, flesh: true, eggs: true, vit_a: true, other_fruits_veg: false });
const s1Mmf = calculateMMF({ ageInMonths: 7, isBreastfeeding: true, solidFrequency: 2 });
const s1K5 = calculateK5Score({ mddScore: s1Mdd.score, mddCount: s1Mdd.count, mmfScore: s1Mmf.score });
console.log(`Hasil: MDD=${s1Mdd.score} (${s1Mdd.count}/8), MMF=${s1Mmf.score}, K5=${s1K5.value}`);
if (s1Mdd.score !== 1 || s1Mmf.score !== 1 || s1K5.value !== 1) {
  throw new Error(`Skenario 1 GAGAL: Diharapkan MDD=1, MMF=1, K5=1. Aktual: MDD=${s1Mdd.score}, MMF=${s1Mmf.score}, K5=${s1K5.value}`);
}
console.log('--> Skenario 1 PASSED!\n');

// --- SKENARIO 2 ---
// Usia 7 bulan, masih ASI, makan padat 1x, 6 kelompok makanan -> MDD=1, MMF=0, K5=0.5
console.log('--- Skenario 2: Usia 7 bln, masih ASI, makan 1x, 6 kelompok makanan ---');
const s2Mdd = calculateMDD({ asi: true, staples: true, legumes: true, dairy: false, flesh: true, eggs: true, vit_a: true, other_fruits_veg: false });
const s2Mmf = calculateMMF({ ageInMonths: 7, isBreastfeeding: true, solidFrequency: 1 });
const s2K5 = calculateK5Score({ mddScore: s2Mdd.score, mddCount: s2Mdd.count, mmfScore: s2Mmf.score });
console.log(`Hasil: MDD=${s2Mdd.score}, MMF=${s2Mmf.score}, K5=${s2K5.value} (${s2K5.label})`);
if (s2Mdd.score !== 1 || s2Mmf.score !== 0 || s2K5.value !== 0.5) {
  throw new Error(`Skenario 2 GAGAL: Diharapkan MDD=1, MMF=0, K5=0.5. Aktual: MDD=${s2Mdd.score}, MMF=${s2Mmf.score}, K5=${s2K5.value}`);
}
console.log('--> Skenario 2 PASSED!\n');

// --- SKENARIO 3 ---
// Usia 10 bulan, masih ASI, makan padat 3x, 4 kelompok makanan -> MDD=0, MMF=1, K5=0.5
console.log('--- Skenario 3: Usia 10 bln, masih ASI, makan 3x, 4 kelompok makanan ---');
const s3Mdd = calculateMDD({ asi: true, staples: true, legumes: true, dairy: false, flesh: true, eggs: false, vit_a: false, other_fruits_veg: false });
const s3Mmf = calculateMMF({ ageInMonths: 10, isBreastfeeding: true, solidFrequency: 3 });
const s3K5 = calculateK5Score({ mddScore: s3Mdd.score, mddCount: s3Mdd.count, mmfScore: s3Mmf.score });
console.log(`Hasil: MDD=${s3Mdd.score} (${s3Mdd.count}/8), MMF=${s3Mmf.score}, K5=${s3K5.value} (${s3K5.label})`);
if (s3Mdd.score !== 0 || s3Mmf.score !== 1 || s3K5.value !== 0.5) {
  throw new Error(`Skenario 3 GAGAL: Diharapkan MDD=0, MMF=1, K5=0.5. Aktual: MDD=${s3Mdd.score}, MMF=${s3Mmf.score}, K5=${s3K5.value}`);
}
console.log('--> Skenario 3 PASSED!\n');

// --- SKENARIO 4 ---
// Usia 10 bulan, masih ASI, makan padat 2x, 3 kelompok makanan -> MDD=0, MMF=0, K5=0
console.log('--- Skenario 4: Usia 10 bln, masih ASI, makan 2x, 3 kelompok makanan ---');
const s4Mdd = calculateMDD({ asi: true, staples: true, legumes: false, dairy: false, flesh: true, eggs: false, vit_a: false, other_fruits_veg: false });
const s4Mmf = calculateMMF({ ageInMonths: 10, isBreastfeeding: true, solidFrequency: 2 }); // min 3x untuk usia 10 bln menyusu
const s4K5 = calculateK5Score({ mddScore: s4Mdd.score, mddCount: s4Mdd.count, mmfScore: s4Mmf.score });
console.log(`Hasil: MDD=${s4Mdd.score} (${s4Mdd.count}/8), MMF=${s4Mmf.score}, K5=${s4K5.value} (${s4K5.label})`);
if (s4Mdd.score !== 0 || s4Mmf.score !== 0 || s4K5.value !== 0) {
  throw new Error(`Skenario 4 GAGAL: Diharapkan MDD=0, MMF=0, K5=0. Aktual: MDD=${s4Mdd.score}, MMF=${s4Mmf.score}, K5=${s4K5.value}`);
}
console.log('--> Skenario 4 PASSED!\n');

// --- SKENARIO 5 ---
// Usia 10 bulan, tidak ASI, makan padat 2x + susu 2x (total 4), 5 kelompok makanan -> MDD=1, MMF=1, K5=1
console.log('--- Skenario 5: Usia 10 bln, tidak ASI, makan 2x + susu 2x (total 4), 5 kelompok pangan ---');
const s5Mdd = calculateMDD({ asi: false, staples: true, legumes: true, dairy: true, flesh: true, eggs: true, vit_a: false, other_fruits_veg: false });
const s5Mmf = calculateMMF({ ageInMonths: 10, isBreastfeeding: false, solidFrequency: 2, milkFrequency: 2 });
const s5K5 = calculateK5Score({ mddScore: s5Mdd.score, mddCount: s5Mdd.count, mmfScore: s5Mmf.score });
console.log(`Hasil: MDD=${s5Mdd.score} (${s5Mdd.count}/8), MMF=${s5Mmf.score}, K5=${s5K5.value}`);
if (s5Mdd.score !== 1 || s5Mmf.score !== 1 || s5K5.value !== 1) {
  throw new Error(`Skenario 5 GAGAL: Diharapkan MDD=1, MMF=1, K5=1. Aktual: MDD=${s5Mdd.score}, MMF=${s5Mmf.score}, K5=${s5K5.value}`);
}
console.log('--> Skenario 5 PASSED!\n');

// --- SKENARIO 6 ---
// Usia 10 bulan, tidak ASI, susu 4x tanpa makanan padat -> MDD=1 (misal 5 kelompok), MMF=0, K5=0.5
console.log('--- Skenario 6: Usia 10 bln, tidak ASI, susu 4x tanpa makanan padat (makan padat 0x) ---');
const s6Mdd = calculateMDD({ asi: false, staples: true, legumes: true, dairy: true, flesh: true, eggs: true, vit_a: false, other_fruits_veg: false });
const s6Mmf = calculateMMF({ ageInMonths: 10, isBreastfeeding: false, solidFrequency: 0, milkFrequency: 4 });
const s6K5 = calculateK5Score({ mddScore: s6Mdd.score, mddCount: s6Mdd.count, mmfScore: s6Mmf.score });
console.log(`Hasil: MDD=${s6Mdd.score}, MMF=${s6Mmf.score} (${s6Mmf.label}), K5=${s6K5.value}`);
if (s6Mmf.score !== 0) {
  throw new Error(`Skenario 6 GAGAL: MMF harus bernilai 0 karena tidak ada makanan padat/lunak (solid = 0).`);
}
if (s6K5.value !== 0.5) {
  throw new Error(`Skenario 6 GAGAL: K5 harus bernilai 0.5 (MDD=1, MMF=0). Aktual: ${s6K5.value}`);
}
console.log('--> Skenario 6 PASSED!\n');

// --- SKENARIO 7 ---
// Usia 4 bulan -> K5 tidak berlaku / dinonaktifkan, perhitungan SAW menggunakan 4 kriteria
console.log('--- Skenario 7: Usia 4 bulan -> K5 Tidak Berlaku, SAW Model 4 Kriteria ---');
const s7Applicable = isK5Applicable(4, 2);
const s7Std = convertRawToStandardScores({ C1: 6.5, C2: 63.0, C3: 41.0, C5: 12 }, 2, 'L', 4);
const s7Criteria = getOfficialCriteriaForGroup(2);
const s7Weights = getOfficialWeightsForGroup(2);

console.log('isK5Applicable(4):', s7Applicable);
console.log('K5 in s7Std.scores:', s7Std.scores.K5);
console.log('Jumlah Kriteria s7Criteria:', s7Criteria.length);
if (s7Applicable !== false) throw new Error('Skenario 7 GAGAL: K5 seharusnya tidak aktif untuk usia 4 bulan.');
if (s7Std.scores.K5 !== undefined) throw new Error('Skenario 7 GAGAL: K5 tidak boleh ada pada standard scores usia 4 bulan.');
if (s7Criteria.length !== 4) throw new Error('Skenario 7 GAGAL: Kriteria kelompok usia 4 bulan harus berjumlah 4.');
console.log('--> Skenario 7 PASSED!\n');

// --- SKENARIO 8 ---
// Usia 24 bulan -> K5 tidak berlaku / dinonaktifkan, perhitungan SAW menggunakan 4 kriteria
console.log('--- Skenario 8: Usia 24 bulan -> K5 Tidak Berlaku, SAW Model 4 Kriteria ---');
const s8Applicable = isK5Applicable(24, 6);
const s8Std = convertRawToStandardScores({ C1: 12.0, C2: 87.0, C3: 48.0, C5: 17 }, 6, 'L', 24);
const s8Criteria = getOfficialCriteriaForGroup(6);
const s8Weights = getOfficialWeightsForGroup(6);

console.log('isK5Applicable(24):', s8Applicable);
console.log('K5 in s8Std.scores:', s8Std.scores.K5);
console.log('Jumlah Kriteria s8Criteria:', s8Criteria.length);
if (s8Applicable !== false) throw new Error('Skenario 8 GAGAL: K5 seharusnya tidak aktif untuk usia 24 bulan.');
if (s8Std.scores.K5 !== undefined) throw new Error('Skenario 8 GAGAL: K5 tidak boleh ada pada standard scores usia 24 bulan.');
if (s8Criteria.length !== 4) throw new Error('Skenario 8 GAGAL: Kriteria kelompok usia 24 bulan harus berjumlah 4.');
console.log('--> Skenario 8 PASSED!\n');

// --- SKENARIO 9 ---
// Normalisasi SAW untuk K5: nilai K5 (0, 0.5, 1) langsung menjadi r_K5 tanpa dibagi max sampel
console.log('--- Skenario 9: Normalisasi SAW K5 langsung r_K5 = K5 tanpa dibagi max sampel ---');
// Buat cohort simulasi di mana nilai K5 tertinggi di antara sampel HANYA 0.5!
// Jika salah dibagi max, maka 0.5 / 0.5 = 1.0 (TERDISTORSI).
// Dengan perbaikan kita, r_K5 harus tetap tepat 0.5!
const cohortMaxHalf = [
  { childId: 'ch-1', childName: 'Anak K5 Setengah', ageGroupId: 4, period: '2026-10', values: { K1: 4, K2: 4, K3: 4, K4: 4, K5: 0.5 } },
  { childId: 'ch-2', childName: 'Anak K5 Nol', ageGroupId: 4, period: '2026-10', values: { K1: 4, K2: 4, K3: 4, K4: 4, K5: 0 } },
];
const sawMaxHalfResult = calculateSAW(cohortMaxHalf, OFFICIAL_CRITERIA_5, OFFICIAL_AHP_WEIGHTS, { strictGrouping: false });
const ch1Result = sawMaxHalfResult.results.find(r => r.childId === 'ch-1');
const ch2Result = sawMaxHalfResult.results.find(r => r.childId === 'ch-2');

console.log('Normalized r_K5 Anak K5 Setengah:', ch1Result.normalizedValues.K5);
console.log('Normalized r_K5 Anak K5 Nol:', ch2Result.normalizedValues.K5);
if (Math.abs(ch1Result.normalizedValues.K5 - 0.5) > 0.0001) {
  throw new Error(`Skenario 9 GAGAL: r_K5 terdistorsi menjadi ${ch1Result.normalizedValues.K5}! Seharusnya tepat 0.5.`);
}
if (Math.abs(ch2Result.normalizedValues.K5 - 0.0) > 0.0001) {
  throw new Error(`Skenario 9 GAGAL: r_K5 Anak K5 Nol terdistorsi menjadi ${ch2Result.normalizedValues.K5}! Seharusnya 0.0.`);
}
console.log('--> Skenario 9 PASSED (Tidak terdistorsi oleh max sample)!\n');

// --- SKENARIO 10 ---
// Kelompok 6–23 bulan menggunakan bobot 5 kriteria; kelompok <6 bulan dan >=24 bulan menggunakan bobot 4 kriteria dengan CR <= 0.10
console.log('--- Skenario 10: Penggunaan bobot 5 kriteria (6–23 bln) & 4 kriteria (<6 & >=24 bln) dengan CR <= 0.10 ---');
const groupsToCheck = [
  { id: 1, name: '0–2 bulan', expectedCount: 4 },
  { id: 2, name: '3–5 bulan', expectedCount: 4 },
  { id: 3, name: '6–8 bulan', expectedCount: 5 },
  { id: 4, name: '9–11 bulan', expectedCount: 5 },
  { id: 5, name: '12–23 bulan', expectedCount: 5 },
  { id: 6, name: '24–35 bulan', expectedCount: 4 },
  { id: 7, name: '36–47 bulan', expectedCount: 4 },
  { id: 8, name: '48–59 bulan', expectedCount: 4 },
];

for (const grp of groupsToCheck) {
  const crits = getOfficialCriteriaForGroup(grp.id);
  const weights = getOfficialWeightsForGroup(grp.id);
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  console.log(`Kelompok ${grp.id} (${grp.name}): ${crits.length} kriteria, Sum(W) = ${totalWeight.toFixed(6)}`);
  if (crits.length !== grp.expectedCount) {
    throw new Error(`Skenario 10 GAGAL: Kelompok ${grp.id} diharapkan memiliki ${grp.expectedCount} kriteria, namun memiliki ${crits.length}.`);
  }
  if (Math.abs(totalWeight - 1.0) > 0.001) {
    throw new Error(`Skenario 10 GAGAL: Total bobot kelompok ${grp.id} tidak sama dengan 1.0 (${totalWeight}).`);
  }
}

// Verifikasi CR kedua matriks
if (ahp5.cr > 0.10 || !ahp5.isConsistent) {
  throw new Error(`Skenario 10 GAGAL: Matriks 5 Kriteria tidak konsisten (CR = ${ahp5.cr} > 0.10).`);
}
if (ahp4.cr > 0.10 || !ahp4.isConsistent) {
  throw new Error(`Skenario 10 GAGAL: Matriks 4 Kriteria tidak konsisten (CR = ${ahp4.cr} > 0.10).`);
}
console.log('--> Skenario 10 PASSED (Kelompok umur, model kriteria, dan konsistensi CR terverifikasi)!\n');

// ============================================================================
// 5. PENGUJIAN BENCHMARK SAW DENGAN NILAI K5 KOMPOSIT TERBARU
// ============================================================================
console.log('=== TEST 5: PENGUJIAN COHORT SAW LENGKAP DENGAN NILAI K5 KOMPOSIT (0, 0.5, 1) ===');
const benchmarkUpdatedAlts = [
  { childId: 'b1', childName: 'Kevin (Ideal Penuh)', ageGroupId: 4, period: '2026-10', values: { K1: 4, K2: 4, K3: 4, K4: 4, K5: 1 }, statusFlag: 'Normal' },
  { childId: 'b2', childName: 'Rehan (1 Indikator Makanan)', ageGroupId: 4, period: '2026-10', values: { K1: 4, K2: 4, K3: 4, K4: 4, K5: 0.5 }, statusFlag: 'Normal' },
  { childId: 'b3', childName: 'Hakim (Defisit Makanan)', ageGroupId: 4, period: '2026-10', values: { K1: 4, K2: 4, K3: 4, K4: 4, K5: 0 }, statusFlag: 'Normal' },
  { childId: 'b4', childName: 'Haris (Fisik Kurang & Defisit Makanan)', ageGroupId: 4, period: '2026-10', values: { K1: 2, K2: 2, K3: 2, K4: 2, K5: 0 }, statusFlag: 'Perlu Tinjau' },
];

const sawUpdatedResult = calculateSAW(benchmarkUpdatedAlts, OFFICIAL_CRITERIA_5, OFFICIAL_AHP_WEIGHTS, { strictGrouping: false });
sawUpdatedResult.results.forEach(r => {
  console.log(`Rank ${r.rank} | ${r.childName} | Score Vi: ${r.preferenceScore.toFixed(7)} | Status: ${r.statusFlag}`);
});

// Kevin: K1..K4 = 4/4 = 1, K5 = 1 -> Vi = 1.0000000
const kevin = sawUpdatedResult.results.find(r => r.childId === 'b1');
if (Math.abs(kevin.preferenceScore - 1.0) > 0.00001) throw new Error('Kevin score mismatch');

// Rehan: K1..K4 = 1, K5 = 0.5 -> Vi = (1 - 0.245910*0.5) = 0.8770450
const rehan = sawUpdatedResult.results.find(r => r.childId === 'b2');
if (Math.abs(rehan.preferenceScore - 0.8770450) > 0.00001) throw new Error('Rehan score mismatch');

// Hakim: K1..K4 = 1, K5 = 0 -> Vi = (1 - 0.245910*1.0) = 0.7540900
const hakim = sawUpdatedResult.results.find(r => r.childId === 'b3');
if (Math.abs(hakim.preferenceScore - 0.7540900) > 0.00001) throw new Error('Hakim score mismatch');

console.log('--> BENCHMARK COHORT PASSED!\n');

console.log('================================================================');
console.log('   SEMUA PENGUJIAN OTOMATIS & 10 SKENARIO KHUSUS BERHASIL 100%! ');
console.log('================================================================\n');
