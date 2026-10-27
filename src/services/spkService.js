import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateAHP, DEFAULT_AHP_6X6_MATRIX, DEFAULT_CRITERIA_CODES } from '../lib/spk/ahp';
import { calculateSAW } from '../lib/spk/saw';
import {
  SPK_AGE_GROUPS,
  calculateAgeInMonths,
  getAgeGroupForMonths,
  getChildAgeGroup
} from '../lib/spk/ageGroups';
import { MOCK_EXAMINATIONS, MOCK_CHILDREN, MOCK_CRITERIA } from '../lib/mockData';

// Initial AHP active weights
let currentAHPMatrix = DEFAULT_AHP_6X6_MATRIX;
let currentAHPResult = calculateAHP(currentAHPMatrix, DEFAULT_CRITERIA_CODES);

const SPK_RUNS_KEY = 'spk_runs_store';

function getLiveChildren() {
  try {
    const raw = localStorage.getItem('spk_children_store');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Gagal membaca children store di spkService:', err);
  }
  return [...MOCK_CHILDREN];
}

function getLiveExaminations() {
  try {
    const raw = localStorage.getItem('spk_examinations_store');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Gagal membaca examinations store di spkService:', err);
  }
  return [...MOCK_EXAMINATIONS];
}

function saveLiveExaminations(exams) {
  try {
    localStorage.setItem('spk_examinations_store', JSON.stringify(exams));
  } catch (err) {
    console.warn('Gagal menyimpan examinations store di spkService:', err);
  }
}

function getLiveSpkRuns() {
  try {
    const raw = localStorage.getItem(SPK_RUNS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Gagal membaca spk runs di spkService:', err);
  }
  return [];
}

function saveLiveSpkRuns(runs) {
  try {
    localStorage.setItem(SPK_RUNS_KEY, JSON.stringify(runs));
  } catch (err) {
    console.warn('Gagal menyimpan spk runs di spkService:', err);
  }
}

let spkRunsStore = getLiveSpkRuns();

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

  // Mendapatkan daftar master 8 kelompok umur penelitian SPK
  getAgeGroups() {
    return SPK_AGE_GROUPS;
  },

  // Mendapatkan statistik cohort untuk 8 kelompok umur
  async getAgeGroupCohorts(targetPeriod = '2026-10') {
    const children = getLiveChildren();
    const exams = getLiveExaminations();

    return SPK_AGE_GROUPS.map((group) => {
      // 1. Total anak terdaftar yang usianya saat ini / pada targetPeriod masuk ke kelompok ini
      const childrenInGroup = children.filter((c) => {
        const age = calculateAgeInMonths(c.date_of_birth, targetPeriod);
        return age >= group.minMonths && age <= group.maxMonths;
      });

      // 2. Pemeriksaan pada targetPeriod untuk kelompok umur ini
      const groupExamsInPeriod = exams.filter((e) => {
        if (e.period_code !== targetPeriod) return false;
        const matchedChild = children.find((c) => c.id === e.child_id);
        const dob = matchedChild?.date_of_birth || e.date_of_birth;
        const age = e.age_in_months !== undefined ? e.age_in_months : calculateAgeInMonths(dob, targetPeriod);
        return age >= group.minMonths && age <= group.maxMonths;
      });

      const verifiedCount = groupExamsInPeriod.filter((e) => e.status === 'verified').length;
      const pendingCount = groupExamsInPeriod.filter(
        (e) => e.status === 'pending_verification' || e.status === 'draft'
      ).length;

      // 3. Kumpulkan seluruh periode yang memiliki pemeriksaan untuk kelompok ini
      const periodsSet = new Set();
      exams.forEach((e) => {
        const matchedChild = children.find((c) => c.id === e.child_id);
        const dob = matchedChild?.date_of_birth || e.date_of_birth;
        const age = calculateAgeInMonths(dob, e.period_code || e.examined_at);
        if (age >= group.minMonths && age <= group.maxMonths) {
          if (e.period_code) periodsSet.add(e.period_code);
        }
      });
      if (periodsSet.size === 0) periodsSet.add(targetPeriod);

      return {
        ...group,
        totalChildren: childrenInGroup.length,
        verifiedExamsCount: verifiedCount,
        pendingExamsCount: pendingCount,
        periods: Array.from(periodsSet).sort().reverse()
      };
    });
  },

  // Jalankan perhitungan AHP + SAW untuk Kelompok Umur tertentu
  async runCalculationForCohort({ ageGroupId = 6, periodCode = '2026-10', createdBy }) {
    const exams = getLiveExaminations();
    const children = getLiveChildren();

    const numericGroupId = Number(ageGroupId) || 6;
    const targetGroup = SPK_AGE_GROUPS.find((g) => g.id === numericGroupId) || SPK_AGE_GROUPS[5];

    // 1. Ambil seluruh pemeriksaan terverifikasi pada periode tersebut yang masuk rentang usia kelompok umur
    const candidates = exams.filter((e) => {
      if (e.period_code !== periodCode || e.status !== 'verified') return false;
      const matchedChild = children.find((c) => c.id === e.child_id);
      const dob = matchedChild?.date_of_birth || e.date_of_birth;
      const age = e.age_in_months !== undefined ? e.age_in_months : calculateAgeInMonths(dob, periodCode);
      return age >= targetGroup.minMonths && age <= targetGroup.maxMonths;
    });

    if (candidates.length === 0) {
      return {
        data: null,
        error: {
          message: `Tidak ada data pemeriksaan terverifikasi untuk ${targetGroup.name} pada periode ${periodCode}.`
        }
      };
    }

    // 2. Format alternatif untuk input SAW dengan info usia detail
    const alternatives = candidates.map((c) => {
      const matchedChild = children.find((ch) => ch.id === c.child_id);
      const dob = matchedChild?.date_of_birth || c.date_of_birth;
      const ageInMonths = c.age_in_months !== undefined ? c.age_in_months : calculateAgeInMonths(dob, periodCode);

      return {
        childId: c.child_id,
        childName: matchedChild?.name || c.child_name || 'Balita',
        ageInMonths,
        ageGroupId: targetGroup.id,
        ageGroupName: targetGroup.name,
        birthYear: matchedChild ? new Date(matchedChild.date_of_birth).getFullYear() : (c.birth_year || 2024),
        examinationId: c.id,
        period: c.period_code,
        values: c.values
      };
    });

    // 3. Jalankan perhitungan SAW dengan bobot AHP aktif
    const sawResult = calculateSAW(alternatives, MOCK_CRITERIA, currentAHPResult.weightsMap);

    if (!sawResult.valid) {
      return { data: null, error: { message: sawResult.error } };
    }

    // 4. Buat snapshot SPK Run baru
    const newRun = {
      id: `run-g${targetGroup.id}-${periodCode}-${Date.now()}`,
      age_group_id: targetGroup.id,
      age_group_name: targetGroup.name,
      age_group_range: targetGroup.rangeLabel,
      period_code: periodCode,
      algorithm_version: 'AHP-SAW-v1.0',
      ahp_weights: currentAHPResult.weightsMap,
      alternative_count: sawResult.results.length,
      status: 'completed',
      created_by: createdBy || 'dr. Dewi Anggraini, Sp.A',
      created_at: new Date().toISOString(),
      saw_output: sawResult
    };

    spkRunsStore = getLiveSpkRuns();
    // Hapus snapshot lama jika ada untuk kombinasi age_group_id & period_code yang sama
    const filteredRuns = spkRunsStore.filter(
      (r) => !(Number(r.age_group_id) === Number(targetGroup.id) && r.period_code === periodCode)
    );
    filteredRuns.unshift(newRun);
    spkRunsStore = filteredRuns;
    saveLiveSpkRuns(spkRunsStore);

    // Update skor, rank, dan usia pada daftar pemeriksaan di localStorage
    sawResult.results.forEach((res) => {
      const ex = exams.find((e) => e.id === res.examinationId);
      if (ex) {
        ex.saw_score = res.preferenceScore;
        ex.saw_rank = res.rank;
        ex.age_in_months = res.ageInMonths;
        ex.age_group_id = targetGroup.id;
        ex.age_group_name = targetGroup.name;
      }
    });
    saveLiveExaminations(exams);

    return { data: newRun, error: null };
  },

  async getLatestResultsForCohort(ageGroupId = 6, periodCode = '2026-10') {
    spkRunsStore = getLiveSpkRuns();
    const numericGroupId = Number(ageGroupId) || 6;

    const run = spkRunsStore.find(
      (r) => Number(r.age_group_id) === numericGroupId && r.period_code === periodCode && r.saw_output
    );

    if (!run) {
      // Jalankan otomatis jika belum pernah di-snapshot atau saw_output belum ada
      return this.runCalculationForCohort({ ageGroupId: numericGroupId, periodCode });
    }
    return { data: run, error: null };
  },

  // Kompatibilitas alias untuk fungsi legacy
  async getBirthYearCohorts() {
    return this.getAgeGroupCohorts();
  },

  async getAvailableBirthYears() {
    const children = getLiveChildren();
    const years = [...new Set(children.map((c) => new Date(c.date_of_birth).getFullYear()))]
      .filter((y) => !isNaN(y))
      .sort((a, b) => b - a);

    return years.length > 0 ? years : [2024];
  }
};
