import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_EXAMINATIONS, MOCK_CHILDREN } from '../lib/mockData';

let examStore = [...MOCK_EXAMINATIONS];

export const examinationService = {
  async getExaminationsByChild(childId) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('examinations')
          .select(`
            *,
            details:examination_details(
              raw_value,
              criterion:criterion_id(code, name, unit, direction)
            )
          `)
          .eq('child_id', childId)
          .order('examined_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Supabase getExaminationsByChild warning:', err);
      }
    }

    const data = examStore
      .filter(e => e.child_id === childId)
      .sort((a, b) => new Date(b.examined_at) - new Date(a.examined_at));

    return { data, error: null };
  },

  async getLatestVerifiedExamination(childId) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('examinations')
          .select(`
            *,
            details:examination_details(
              raw_value,
              criterion:criterion_id(code, name, unit)
            )
          `)
          .eq('child_id', childId)
          .eq('status', 'verified')
          .order('examined_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Supabase getLatestVerifiedExamination warning:', err);
      }
    }

    const found = examStore
      .filter(e => e.child_id === childId && e.status === 'verified')
      .sort((a, b) => new Date(b.examined_at) - new Date(a.examined_at))[0];

    return { data: found || null, error: null };
  },

  async getAllExaminations() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('examinations')
          .select('*, child:child_id(name, date_of_birth)')
          .order('examined_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Supabase getAllExaminations warning:', err);
      }
    }

    return { data: [...examStore], error: null };
  },

  async getPendingExaminations() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('examinations')
          .select('*, child:child_id(name, date_of_birth)')
          .in('status', ['draft', 'pending_verification'])
          .order('examined_at', { ascending: false });

        if (!error && data) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Supabase getPendingExaminations warning:', err);
      }
    }

    const data = examStore.filter(e => e.status === 'draft' || e.status === 'pending_verification');
    return { data, error: null };
  },

  async saveExaminationDraft({ childId, examinedAt, periodCode, notes, values, recordedBy, recordedByName }) {
    // Validasi 6 kriteria
    const requiredCodes = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
    for (const code of requiredCodes) {
      if (values[code] === undefined || values[code] === null || values[code] === '') {
        return { data: null, error: { message: `Kriteria ${code} belum diisi. Lengkapi 6 kriteria pemeriksaan.` } };
      }
    }

    const child = MOCK_CHILDREN.find(c => c.id === childId);
    const birthYear = child ? new Date(child.date_of_birth).getFullYear() : 2024;

    if (isSupabaseConfigured()) {
      try {
        // 1. Insert examination
        const { data: exam, error: examErr } = await supabase
          .from('examinations')
          .insert({
            child_id: childId,
            examined_at: examinedAt || new Date().toISOString(),
            period_code: periodCode,
            status: 'pending_verification',
            notes: notes || '',
            recorded_by: recordedBy,
          })
          .select()
          .single();

        if (!examErr && exam) {
          // 2. Insert examination details
          const { data: criteriaList } = await supabase.from('criteria').select('id, code');
          if (criteriaList) {
            const detailsPayload = criteriaList.map(c => ({
              examination_id: exam.id,
              criterion_id: c.id,
              raw_value: Number(values[c.code])
            }));
            await supabase.from('examination_details').insert(detailsPayload);
          }
          return { data: exam, error: null };
        }
      } catch (err) {
        console.warn('Supabase saveExaminationDraft warning:', err);
      }
    }

    // Local Store Mode
    const newExam = {
      id: `exam-${Date.now()}`,
      child_id: childId,
      child_name: child?.name || 'Balita',
      birth_year: birthYear,
      examined_at: examinedAt || new Date().toISOString(),
      period_code: periodCode,
      status: 'pending_verification',
      notes: notes || '',
      recorded_by: recordedBy || 'u-staff-1',
      recorded_by_name: recordedByName || 'Bdn. Dewi Anggraini, S.Tr.Keb',
      values: {
        C1: Number(values.C1),
        C2: Number(values.C2),
        C3: Number(values.C3),
        C4: Number(values.C4),
        C5: Number(values.C5),
        C6: Number(values.C6),
      },
      saw_score: null,
      saw_rank: null
    };

    examStore.unshift(newExam);
    return { data: newExam, error: null };
  },

  async verifyExamination(examinationId, staffId, staffName) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('verify_examination', {
          p_examination_id: examinationId,
          p_staff_id: staffId
        });
        if (!error && data) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Supabase verify_examination rpc warning:', err);
      }
    }

    // Local Store Mode: Idempotent verification
    const idx = examStore.findIndex(e => e.id === examinationId);
    if (idx !== -1) {
      examStore[idx].status = 'verified';
      examStore[idx].verified_by = staffId;
      examStore[idx].verified_by_name = staffName;
      examStore[idx].verified_at = new Date().toISOString();
      return { data: examStore[idx], error: null };
    }

    return { data: null, error: { message: 'Data pemeriksaan tidak ditemukan.' } };
  }
};
