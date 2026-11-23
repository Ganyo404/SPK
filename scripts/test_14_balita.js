import { convertRawToStandardScores, OFFICIAL_CRITERIA_5 } from '../src/lib/spk/scoringStandard.js';
import { calculateSAW } from '../src/lib/spk/saw.js';

const rawData = [
  { code: 'A01', name: 'Arka', sex: 'L', age: 9, bb: 8.7, tb: 71.5, lk: 44.5, imun: 17, mdd: 6, solid: 3, stillASI: true, k5Expected: 1.0,
    groups: ['asi', 'staples', 'legumes', 'dairy', 'flesh', 'vitamin_a'] },
  { code: 'A02', name: 'Nara', sex: 'P', age: 9, bb: 8.1, tb: 70.4, lk: 43.7, imun: 15, mdd: 5, solid: 3, stillASI: true, k5Expected: 1.0,
    groups: ['asi', 'staples', 'dairy', 'flesh', 'other_fruits_veg'] },
  { code: 'A03', name: 'Elio', sex: 'L', age: 9, bb: 7.5, tb: 68.3, lk: 43.6, imun: 14, mdd: 4, solid: 3, stillASI: true, k5Expected: 0.5,
    groups: ['asi', 'staples', 'flesh', 'other_fruits_veg'] },
  { code: 'A04', name: 'Aluna', sex: 'P', age: 9, bb: 6.2, tb: 64.8, lk: 41.0, imun: 10, mdd: 3, solid: 2, stillASI: true, k5Expected: 0.0,
    groups: ['asi', 'staples', 'dairy'] },
  { code: 'A05', name: 'Zayn', sex: 'L', age: 9, bb: 9.7, tb: 74.6, lk: 46.2, imun: 17, mdd: 4, solid: 4, stillASI: true, k5Expected: 0.5,
    groups: ['asi', 'staples', 'legumes', 'flesh'] },
  { code: 'A06', name: 'Kai', sex: 'L', age: 10, bb: 9.2, tb: 72.0, lk: 44.8, imun: 16, mdd: 6, solid: 3, stillASI: true, k5Expected: 1.0,
    groups: ['asi', 'staples', 'legumes', 'dairy', 'eggs', 'vitamin_a'] },
  { code: 'A07', name: 'Ayla', sex: 'P', age: 10, bb: 8.2, tb: 70.5, lk: 44.0, imun: 13, mdd: 6, solid: 2, stillASI: true, k5Expected: 0.5,
    groups: ['asi', 'staples', 'legumes', 'flesh', 'vitamin_a', 'other_fruits_veg'] },
  { code: 'A08', name: 'Kira', sex: 'P', age: 10, bb: 7.1, tb: 66.2, lk: 42.2, imun: 12, mdd: 5, solid: 2, stillASI: true, k5Expected: 0.5,
    groups: ['asi', 'staples', 'dairy', 'eggs', 'other_fruits_veg'] },
  { code: 'A09', name: 'Raka', sex: 'L', age: 10, bb: 8.1, tb: 68.5, lk: 43.8, imun: 15, mdd: 4, solid: 2, stillASI: true, k5Expected: 0.0,
    groups: ['asi', 'staples', 'flesh', 'vitamin_a'] },
  { code: 'A10', name: 'Zara', sex: 'P', age: 10, bb: 9.7, tb: 75.0, lk: 47.2, imun: 16, mdd: 6, solid: 3, stillASI: true, k5Expected: 1.0,
    groups: ['asi', 'staples', 'legumes', 'dairy', 'flesh', 'other_fruits_veg'] },
  { code: 'A11', name: 'Ezra', sex: 'L', age: 11, bb: 9.4, tb: 74.8, lk: 45.8, imun: 17, mdd: 7, solid: 4, stillASI: true, k5Expected: 1.0,
    groups: ['asi', 'staples', 'legumes', 'dairy', 'flesh', 'eggs', 'vitamin_a'] },
  { code: 'A12', name: 'Livia', sex: 'P', age: 11, bb: 8.6, tb: 72.7, lk: 44.7, imun: 14, mdd: 5, solid: 3, stillASI: true, k5Expected: 1.0,
    groups: ['asi', 'staples', 'dairy', 'eggs', 'vitamin_a'] },
  { code: 'A13', name: 'Nino', sex: 'L', age: 11, bb: 7.2, tb: 69.3, lk: 42.7, imun: 9, mdd: 4, solid: 2, stillASI: true, k5Expected: 0.0,
    groups: ['asi', 'staples', 'legumes', 'flesh'] },
  { code: 'A14', name: 'Naia', sex: 'P', age: 11, bb: 8.1, tb: 70.6, lk: 43.5, imun: 15, mdd: 5, solid: 2, stillASI: true, k5Expected: 0.5,
    groups: ['asi', 'staples', 'flesh', 'vitamin_a', 'other_fruits_veg'] }
];

const ahpWeights = {
  K1: 0.1228867724304454,
  K2: 0.1228867724304454,
  K3: 0.08477492382446496,
  K4: 0.42367798645375343,
  K5: 0.2457735448608908
};

const alternatives = rawData.map((c, i) => {
  const stdRes = convertRawToStandardScores({
    K1: c.bb,
    K2: c.tb,
    K3: c.lk,
    K4: c.imun,
    mddFoodGroups: c.groups,
    mddScore: c.mdd >= 5 ? 1 : 0,
    mmfScore: (c.age >= 9 && c.solid >= 3) ? 1 : 0,
    mddCount: c.mdd,
    breastfeeding: c.stillASI,
    solidFrequency: c.solid
  }, 4, c.sex, c.age);

  return {
    childId: 'child-a' + (i + 1),
    childName: c.name,
    sex: c.sex,
    ageInMonths: c.age,
    ageGroupId: 4,
    birthYear: 2025,
    examinationId: 'exam-sim-a' + (i + 1),
    period: '2026-10',
    values: stdRes.scores,
    standardScores: stdRes.scores,
    scoreLabels: stdRes.labels,
    rawValues: { K1: c.bb, K2: c.tb, K3: c.lk, K4: c.imun, K5: c.k5Expected },
    statusFlag: stdRes.statusFlag
  };
});

const res = calculateSAW(alternatives, OFFICIAL_CRITERIA_5, ahpWeights, { strictGrouping: false });
console.log('--- HASIL PERANGKINGAN SAW 14 BALITA (KELOMPOK 4: 9–11 BULAN) ---');
for (const r of res.results) {
  console.log(`Rank ${String(r.rank).padStart(2)} | Code: ${rawData[parseInt(r.childId.replace('child-a',''))-1].code} | ${r.childName.padEnd(6)} (${r.sex}) | Raw: BB=${r.rawValues.K1} TB=${r.rawValues.K2} LK=${r.rawValues.K3} Imun=${r.rawValues.K4} | Scores: K1=${r.values.K1} K2=${r.values.K2} K3=${r.values.K3} K4=${r.values.K4} K5=${r.values.K5} | Vi: ${r.preferenceScore.toFixed(7)} | Status: ${r.statusFlag}`);
}
