import { calculateAHP, DEFAULT_AHP_6X6_MATRIX, DEFAULT_CRITERIA_CODES } from './ahp.js';
import { calculateSAW } from './saw.js';

console.log('=== TEST 1: PENGUJIAN METODE AHP 6x6 ===');
const ahpResult = calculateAHP(DEFAULT_AHP_6X6_MATRIX, DEFAULT_CRITERIA_CODES);
console.log('AHP Valid:', ahpResult.valid);
console.log('Weights:', ahpResult.weights);
console.log('Weights Map:', ahpResult.weightsMap);
console.log('Lambda Max:', ahpResult.lambdaMax);
console.log('CI (Consistency Index):', ahpResult.ci);
console.log('CR (Consistency Ratio):', ahpResult.cr);
console.log('Is Consistent (CR <= 0.10):', ahpResult.isConsistent);

if (!ahpResult.valid || !ahpResult.isConsistent) {
  throw new Error('AHP Test FAILED: Matriks default tidak konsisten!');
}
console.log('--> AHP TEST PASSED!\n');

console.log('=== TEST 2: PENGUJIAN METODE SAW ===');
const mockCriteria = [
  { code: 'C1', name: 'Berat Badan', direction: 'benefit' },
  { code: 'C2', name: 'Tinggi Badan', direction: 'benefit' },
  { code: 'C3', name: 'Lingkar Kepala', direction: 'benefit' },
  { code: 'C4', name: 'LiLA', direction: 'benefit' },
  { code: 'C5', name: 'Imunisasi', direction: 'benefit' },
  { code: 'C6', name: 'Frekuensi Sakit', direction: 'cost' },
];

const mockAlternatives = [
  {
    childId: 'c-1',
    childName: 'Aisyah Putri',
    birthYear: 2024,
    examinationId: 'e-1',
    period: '2026-10',
    values: { C1: 12.5, C2: 88, C3: 47, C4: 15.5, C5: 100, C6: 0 } // cost C6 = 0 (perfect!)
  },
  {
    childId: 'c-2',
    childName: 'Budi Santoso',
    birthYear: 2024,
    examinationId: 'e-2',
    period: '2026-10',
    values: { C1: 11.0, C2: 84, C3: 46, C4: 14.0, C5: 85, C6: 1 }
  },
  {
    childId: 'c-3',
    childName: 'Citra Kirana',
    birthYear: 2024,
    examinationId: 'e-3',
    period: '2026-10',
    values: { C1: 9.8, C2: 81, C3: 45, C4: 12.0, C5: 60, C6: 3 }
  }
];

const sawResult = calculateSAW(mockAlternatives, mockCriteria, ahpResult.weightsMap);
console.log('SAW Valid:', sawResult.valid);
console.log('Alternative count:', sawResult.alternativeCount);
console.log('Min-Max Summary:', sawResult.minMaxSummary);
console.log('Ranking Results:');
sawResult.results.forEach(r => {
  console.log(`Rank ${r.rank}: ${r.childName} | Score: ${r.preferenceScore} | C6 norm: ${r.normalizedValues.C6}`);
});

if (!sawResult.valid || sawResult.results.length !== 3 || sawResult.results[0].childName !== 'Aisyah Putri') {
  throw new Error('SAW Test FAILED!');
}
console.log('--> SAW TEST PASSED!\n');

console.log('=== TEST 3: PENGUJIAN ISOLASI KELOMPOK TAHUN KELAHIRAN ===');
const mixedAlternatives = [
  { ...mockAlternatives[0], birthYear: 2024 },
  { ...mockAlternatives[1], birthYear: 2025 } // different birth year!
];
const mixedResult = calculateSAW(mixedAlternatives, mockCriteria, ahpResult.weightsMap);
console.log('Should reject mixed birth years:', !mixedResult.valid);
console.log('Error message:', mixedResult.error);

if (mixedResult.valid) {
  throw new Error('Grouping isolation FAILED: Harus menolak percampuran tahun lahir!');
}
console.log('--> ISOLATION TEST PASSED!\n');

console.log('ALL SPK CORE MATHEMATICAL TESTS PASSED SUCCESSFULLY!');
