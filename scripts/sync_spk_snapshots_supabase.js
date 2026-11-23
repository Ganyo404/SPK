import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { convertRawToStandardScores, OFFICIAL_CRITERIA_5 } from '../src/lib/spk/scoringStandard.js';
import { calculateSAW } from '../src/lib/spk/saw.js';

const env = fs.readFileSync('.env', 'utf8');
const lines = env.split(/\r?\n/);
let url = '', key = '';
lines.forEach(l => {
  if (l.startsWith('VITE_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('VITE_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
});

const supabase = createClient(url, key);

const rawData = [
  { code: 'A01', id: 'child-a1', examId: 'exam-sim-a1', name: 'Arka', sex: 'L', age: 9, bb: 8.7, tb: 71.5, lk: 44.5, imun: 17, mdd: 6, solid: 3, stillASI: true, k5Expected: 1.0,
    groups: ['asi', 'staples', 'legumes', 'dairy', 'flesh', 'vitamin_a'] },
  { code: 'A02', id: 'child-a2', examId: 'exam-sim-a2', name: 'Nara', sex: 'P', age: 9, bb: 8.1, tb: 70.4, lk: 43.7, imun: 15, mdd: 5, solid: 3, stillASI: true, k5Expected: 1.0,
    groups: ['asi', 'staples', 'dairy', 'flesh', 'other_fruits_veg'] },
  { code: 'A03', id: 'child-a3', examId: 'exam-sim-a3', name: 'Elio', sex: 'L', age: 9, bb: 7.5, tb: 68.3, lk: 43.6, imun: 14, mdd: 4, solid: 3, stillASI: true, k5Expected: 0.5,
    groups: ['asi', 'staples', 'flesh', 'other_fruits_veg'] },
  { code: 'A04', id: 'child-a4', examId: 'exam-sim-a4', name: 'Aluna', sex: 'P', age: 9, bb: 6.2, tb: 64.8, lk: 41.0, imun: 10, mdd: 3, solid: 2, stillASI: true, k5Expected: 0.0,
    groups: ['asi', 'staples', 'dairy'] },
  { code: 'A05', id: 'child-a5', examId: 'exam-sim-a5', name: 'Zayn', sex: 'L', age: 9, bb: 9.7, tb: 74.6, lk: 46.2, imun: 17, mdd: 4, solid: 4, stillASI: true, k5Expected: 0.5,
    groups: ['asi', 'staples', 'legumes', 'flesh'] },
  { code: 'A06', id: 'child-a6', examId: 'exam-sim-a6', name: 'Kai', sex: 'L', age: 10, bb: 9.2, tb: 72.0, lk: 44.8, imun: 16, mdd: 6, solid: 3, stillASI: true, k5Expected: 1.0,
    groups: ['asi', 'staples', 'legumes', 'dairy', 'eggs', 'vitamin_a'] },
  { code: 'A07', id: 'child-a7', examId: 'exam-sim-a7', name: 'Ayla', sex: 'P', age: 10, bb: 8.2, tb: 70.5, lk: 44.0, imun: 13, mdd: 6, solid: 2, stillASI: true, k5Expected: 0.5,
    groups: ['asi', 'staples', 'legumes', 'flesh', 'vitamin_a', 'other_fruits_veg'] },
  { code: 'A08', id: 'child-a8', examId: 'exam-sim-a8', name: 'Kira', sex: 'P', age: 10, bb: 7.1, tb: 66.2, lk: 42.2, imun: 12, mdd: 5, solid: 2, stillASI: true, k5Expected: 0.5,
    groups: ['asi', 'staples', 'dairy', 'eggs', 'other_fruits_veg'] },
  { code: 'A09', id: 'child-a9', examId: 'exam-sim-a9', name: 'Raka', sex: 'L', age: 10, bb: 8.1, tb: 68.5, lk: 43.8, imun: 15, mdd: 4, solid: 2, stillASI: true, k5Expected: 0.0,
    groups: ['asi', 'staples', 'flesh', 'vitamin_a'] },
  { code: 'A10', id: 'child-a10', examId: 'exam-sim-a10', name: 'Zara', sex: 'P', age: 10, bb: 9.7, tb: 75.0, lk: 47.2, imun: 16, mdd: 6, solid: 3, stillASI: true, k5Expected: 1.0,
    groups: ['asi', 'staples', 'legumes', 'dairy', 'flesh', 'other_fruits_veg'] },
  { code: 'A11', id: 'child-a11', examId: 'exam-sim-a11', name: 'Ezra', sex: 'L', age: 11, bb: 9.4, tb: 74.8, lk: 45.8, imun: 17, mdd: 7, solid: 4, stillASI: true, k5Expected: 1.0,
    groups: ['asi', 'staples', 'legumes', 'dairy', 'flesh', 'eggs', 'vitamin_a'] },
  { code: 'A12', id: 'child-a12', examId: 'exam-sim-a12', name: 'Livia', sex: 'P', age: 11, bb: 8.6, tb: 72.7, lk: 44.7, imun: 14, mdd: 5, solid: 3, stillASI: true, k5Expected: 1.0,
    groups: ['asi', 'staples', 'dairy', 'eggs', 'vitamin_a'] },
  { code: 'A13', id: 'child-a13', examId: 'exam-sim-a13', name: 'Nino', sex: 'L', age: 11, bb: 7.2, tb: 69.3, lk: 42.7, imun: 9, mdd: 4, solid: 2, stillASI: true, k5Expected: 0.0,
    groups: ['asi', 'staples', 'legumes', 'flesh'] },
  { code: 'A14', id: 'child-a14', examId: 'exam-sim-a14', name: 'Naia', sex: 'P', age: 11, bb: 8.1, tb: 70.6, lk: 43.5, imun: 15, mdd: 5, solid: 2, stillASI: true, k5Expected: 0.5,
    groups: ['asi', 'staples', 'flesh', 'vitamin_a', 'other_fruits_veg'] }
];

const ahpWeights = {
  K1: 0.1228867724304454,
  K2: 0.1228867724304454,
  K3: 0.08477492382446496,
  K4: 0.42367798645375343,
  K5: 0.2457735448608908
};

async function syncCohort(genderFilter = 'all') {
  const filteredData = genderFilter === 'all' ? rawData : rawData.filter(d => d.sex === genderFilter);

  const alternatives = filteredData.map((c) => {
    const stdRes = convertRawToStandardScores({
      beratBadan: c.bb,
      tinggiBadan: c.tb,
      lingkarKepala: c.lk,
      imunisasi: c.imun,
      mddFoodGroups: c.groups,
      mddScore: c.mdd >= 5 ? 1 : 0,
      mmfScore: (c.age >= 9 && c.solid >= 3) ? 1 : 0,
      mddCount: c.mdd,
      breastfeeding: c.stillASI,
      solidFrequency: c.solid
    }, 4, c.sex, c.age);

    return {
      childId: c.id,
      childName: c.name,
      sex: c.sex,
      ageInMonths: c.age,
      examinationId: c.examId,
      values: stdRes.scores,
      standardScores: stdRes.scores,
      scoreLabels: stdRes.labels,
      rawValues: stdRes.rawValues,
      statusFlag: stdRes.statusFlag
    };
  });

  const sawResult = calculateSAW(alternatives, OFFICIAL_CRITERIA_5, ahpWeights, { gender: genderFilter });
  const runId = `run-sim-g4-2026-10-${genderFilter}`;

  console.log(`\n=== SYNCING ${genderFilter.toUpperCase()} (${sawResult.results.length} BALITA) ===`);

  // Upsert SPK Run
  const { error: runErr } = await supabase.from('spk_runs').upsert({
    id: runId,
    age_group_id: 4,
    period_code: '2026-10',
    gender_filter: genderFilter,
    algorithm_version: 'AHP-SAW-5K-v2026',
    ahp_configuration_id: 'ahp-conf-5k',
    alternative_count: sawResult.results.length,
    status: 'completed',
    created_by: 'u-staff-1'
  });

  if (runErr) {
    console.error(`Error saving run for ${genderFilter}:`, runErr);
    return;
  }

  // Delete older spk_results for this run
  await supabase.from('spk_results').delete().eq('spk_run_id', runId);

  // Upsert SPK Results
  const resultsPayload = sawResult.results.map((r) => {
    const matched = filteredData.find(d => d.id === r.childId);
    return {
      id: `res-${r.childId}-2026-10-${genderFilter}`,
      spk_run_id: runId,
      child_id: r.childId,
      examination_id: r.examinationId,
      raw_values_snapshot: {
        BB: matched.bb,
        TB: matched.tb,
        LK: matched.lk,
        Imunisasi: matched.imun,
        K1: r.standardScores.K1,
        K2: r.standardScores.K2,
        K3: r.standardScores.K3,
        K4: r.standardScores.K4,
        K5: r.standardScores.K5,
        k5Value: r.standardScores.K5
      },
      normalized_values: r.normalizedValues,
      weights_snapshot: ahpWeights,
      contributions: r.contributions,
      preference_score: r.preferenceScore,
      rank: r.rank,
      clinical_status: r.statusFlag
    };
  });

  const { error: resErr } = await supabase.from('spk_results').upsert(resultsPayload);
  if (resErr) {
    console.error(`Error saving results for ${genderFilter}:`, resErr);
  } else {
    console.log(`Saved ${resultsPayload.length} results for ${genderFilter} successfully.`);
    resultsPayload.slice(0, 3).forEach(r => {
      console.log(` - Rank #${r.rank} Child ${r.child_id} Score: ${r.preference_score} Status: ${r.clinical_status} Raw:`, r.raw_values_snapshot);
    });
  }
}

async function main() {
  await syncCohort('all');
  await syncCohort('L');
  await syncCohort('P');
  console.log('\nAll SPK Cohorts synced to Supabase successfully!');
}

main();
