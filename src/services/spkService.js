import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateAHP, DEFAULT_AHP_6X6_MATRIX, DEFAULT_CRITERIA_CODES } from '../lib/spk/ahp';
import { calculateSAW } from '../lib/spk/saw';
import { MOCK_EXAMINATIONS, MOCK_CHILDREN, MOCK_CRITERIA } from '../lib/mockData';

// Initial AHP active weights
let currentAHPMatrix = DEFAULT_AHP_6X6_MATRIX;
let currentAHPResult = calculateAHP(currentAHPMatrix, DEFAULT_CRITERIA_CODES);

let spkRunsStore = [
  {
    id: 'run-2024-202610',
    birth_year: 2024,
    period_code: '2026-10',
    algorithm_version: 'AHP-SAW-v1.0',
    alternative_count: 4,
    status: 'completed',
    created_at: '2026-10-15T11:30:00Z',
    recalculation_reason: null
  }
];

export const spkService = {
  getAHPConfig() {
    return currentAHPResult;
  },

  updateAHPMatrix(newMatrix) {
    const calc = calculateAHP(newMatrix, DEFAULT_CRITERIA_CODES);
    if (calc.valid && calc.isConsistent) {
      currentAHPMatrix = newMatrix;
      currentAHPResult = calc;
      return { data: calc, error: null };
    }
    return { data: null, error: { message: calc.error || 'Matriks AHP tidak konsisten (CR > 0.10).' } };
  },

  async getBirthYearCohorts() {
    // Generate cohorts dynamically from registered children & examinations
    const children = MOCK_CHILDREN;
    const exams = MOCK_EXAMINATIONS;

    const cohortsMap = {};
    children.forEach(c => {
      const year = new Date(c.date_of_birth).getFullYear();
      if (!cohortsMap[year]) {
        cohortsMap[year] = {
          birthYear: year,
          totalChildren: 0,
          verifiedExamsCount: 0,
          pendingExamsCount: 0,
          periods: new Set()
        };
      }
      cohortsMap[year].totalChildren++;
    });

    exams.forEach(e => {
      const year = e.birth_year;
      if (cohortsMap[year]) {
        if (e.status === 'verified') cohortsMap[year].verifiedExamsCount++;
        if (e.status === 'pending_verification' || e.status === 'draft') cohortsMap[year].pendingExamsCount++;
        if (e.period_code) cohortsMap[year].periods.add(e.period_code);
      }
    });

    const cohorts = Object.values(cohortsMap).map(c => ({
      ...c,
      periods: Array.from(c.periods).sort().reverse()
    })).sort((a, b) => b.birthYear - a.birthYear);

    return { data: cohorts, error: null };
  },

  async runCalculationForCohort({ birthYear, periodCode, createdBy }) {
    // 1. Ambil seluruh pemeriksaan terverifikasi untuk kelompok tahun lahir & periode tersebut
    const candidates = MOCK_EXAMINATIONS.filter(e => 
      e.birth_year === Number(birthYear) &&
      e.period_code === periodCode &&
      e.status === 'verified'
    );

    if (candidates.length === 0) {
      return {
        data: null,
        error: { message: `Tidak ada data pemeriksaan terverifikasi untuk Balita Kelahiran ${birthYear} pada periode ${periodCode}.` }
      };
    }

    // 2. Format alternatif untuk input SAW
    const alternatives = candidates.map(c => ({
      childId: c.child_id,
      childName: c.child_name,
      birthYear: c.birth_year,
      examinationId: c.id,
      period: c.period_code,
      values: c.values
    }));

    // 3. Jalankan perhitungan SAW dengan bobot AHP aktif
    const sawResult = calculateSAW(alternatives, MOCK_CRITERIA, currentAHPResult.weightsMap);

    if (!sawResult.valid) {
      return { data: null, error: { message: sawResult.error } };
    }

    // 4. Buat snapshot SPK Run baru (tanpa menimpa diam-diam run lama)
    const newRun = {
      id: `run-${birthYear}-${periodCode}-${Date.now()}`,
      birth_year: Number(birthYear),
      period_code: periodCode,
      algorithm_version: 'AHP-SAW-v1.0',
      ahp_weights: currentAHPResult.weightsMap,
      alternative_count: sawResult.results.length,
      status: 'completed',
      created_by: createdBy || 'Bdn. Dewi Anggraini, S.Tr.Keb',
      created_at: new Date().toISOString(),
      saw_output: sawResult
    };

    spkRunsStore.unshift(newRun);

    // Update skor & rank pada MOCK_EXAMINATIONS untuk tampilan detail
    sawResult.results.forEach(res => {
      const ex = MOCK_EXAMINATIONS.find(e => e.id === res.examinationId);
      if (ex) {
        ex.saw_score = res.preferenceScore;
        ex.saw_rank = res.rank;
      }
    });

    return { data: newRun, error: null };
  },

  async getLatestResultsForCohort(birthYear, periodCode) {
    const run = spkRunsStore.find(r => r.birth_year === Number(birthYear) && r.period_code === periodCode);
    if (!run) {
      // Jalankan otomatis jika belum pernah di-snapshot
      return this.runCalculationForCohort({ birthYear, periodCode });
    }
    return { data: run, error: null };
  }
};
