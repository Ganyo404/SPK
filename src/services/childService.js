import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_CHILDREN, MOCK_POSYANDU, MOCK_EXAMINATIONS } from '../lib/mockData';
import { getChildAgeGroup } from '../lib/spk/ageGroups';

const CHILDREN_STORAGE_KEY = 'spk_children_store';

function loadStoredChildren() {
  try {
    const raw = localStorage.getItem(CHILDREN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map(c => c.id));
        const missingMocks = MOCK_CHILDREN.filter(c => !existingIds.has(c.id));
        if (missingMocks.length > 0) {
          const merged = [...parsed, ...missingMocks];
          localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca data anak dari localStorage:', err);
  }
  return [...MOCK_CHILDREN];
}

function saveStoredChildren(children) {
  childrenStore = children;
  try {
    localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(children));
  } catch (err) {
    console.warn('Gagal menyimpan data anak ke localStorage:', err);
  }
}

let childrenStore = loadStoredChildren();

export const childService = {
  async getChildrenByParent(parentId) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('children')
          .select('*, posyandu:posyandu_id(name)')
          .eq('parent_id', parentId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return {
            data: data.map(c => ({
              ...c,
              posyandu_name: c.posyandu?.name || 'Belum Ditetapkan'
            })),
            error: null
          };
        }
      } catch (err) {
        console.warn('Supabase getChildrenByParent warning:', err);
      }
    }

    const data = childrenStore.filter(c => c.parent_id === parentId);
    return { data, error: null };
  },

  async getAllChildren() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('children')
          .select('*, posyandu:posyandu_id(name), parent:parent_id(full_name, phone)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return {
            data: data.map(c => ({
              ...c,
              posyandu_name: c.posyandu?.name || 'Belum Ditetapkan',
              parent_name: c.parent?.full_name || 'Orang Tua'
            })),
            error: null
          };
        }
      } catch (err) {
        console.warn('Supabase getAllChildren warning:', err);
      }
    }

    return { data: [...childrenStore], error: null };
  },

  async getChildById(id) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('children')
          .select('*, posyandu:posyandu_id(name, address), parent:parent_id(full_name, phone, nik)')
          .eq('id', id)
          .single();

        if (!error && data) {
          return {
            data: {
              ...data,
              posyandu_name: data.posyandu?.name || 'Belum Ditetapkan',
              parent_name: data.parent?.full_name || 'Orang Tua'
            },
            error: null
          };
        }
      } catch (err) {
        console.warn('Supabase getChildById warning:', err);
      }
    }

    const found = childrenStore.find(c => c.id === id);
    if (!found) return { data: null, error: { message: 'Data anak tidak ditemukan.' } };
    return { data: found, error: null };
  },

  async registerChild({ parentId, parentName, posyanduId, name, dateOfBirth, sex, birthWeight, birthHeight }) {
    // 1. Validasi tanggal lahir tidak boleh di masa depan
    const dob = new Date(dateOfBirth);
    const today = new Date();
    if (dob > today) {
      return { data: null, error: { message: 'Tanggal lahir tidak boleh berada di masa depan.' } };
    }

    // 2. Periksa usia balita (maksimal 60 bulan / 5 tahun)
    const diffMonths = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    if (diffMonths > 60) {
      return {
        data: null,
        error: { message: 'Anak telah berusia lebih dari 5 tahun (60 bulan) dan melewati kategori balita aktif Posyandu.' }
      };
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('children')
          .insert({
            parent_id: parentId,
            posyandu_id: posyanduId || null,
            name,
            date_of_birth: dateOfBirth,
            sex,
            birth_weight_kg: birthWeight ? Number(birthWeight) : null,
            birth_height_cm: birthHeight ? Number(birthHeight) : null,
            registration_status: 'pending_registration',
          })
          .select()
          .single();

        if (!error && data) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Supabase registerChild warning:', err);
      }
    }

    // Local Store Mode
    const posyanduObj = MOCK_POSYANDU.find(p => p.id === posyanduId) || MOCK_POSYANDU[0];
    const newChild = {
      id: `child-${Date.now()}`,
      parent_id: parentId,
      parent_name: parentName || 'Orang Tua',
      posyandu_id: posyanduObj?.id || 'posyandu-1',
      posyandu_name: posyanduObj?.name || 'Posyandu Mawar Indah',
      name,
      date_of_birth: dateOfBirth,
      sex,
      birth_weight_kg: birthWeight ? Number(birthWeight) : null,
      birth_height_cm: birthHeight ? Number(birthHeight) : null,
      registration_status: 'pending_registration',
      created_at: new Date().toISOString()
    };

    childrenStore.unshift(newChild);
    saveStoredChildren(childrenStore);

    // Otomatis buat pemeriksaan baseline terverifikasi dari data pendaftaran awal
    // agar balita langsung memiliki data perhitungan SPK dan kurva grafik
    try {
      const birthYear = new Date(dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const initialPeriodCode = `${currentYear}-${currentMonth}`;
      const ageInfo = getChildAgeGroup(dateOfBirth, initialPeriodCode);

      const initialExam = {
        id: `exam-init-${newChild.id}`,
        child_id: newChild.id,
        child_name: newChild.name,
        birth_year: birthYear,
        age_in_months: ageInfo.ageInMonths,
        age_group_id: ageInfo.groupId,
        age_group_name: ageInfo.groupName,
        posyandu_id: posyanduObj?.id || 'posyandu-1',
        posyandu_name: posyanduObj?.name || 'Posyandu Mawar Indah',
        examined_at: new Date().toISOString(),
        period_code: initialPeriodCode,
        status: 'verified',
        recorded_by: parentId || 'u-parent',
        recorded_by_name: parentName || 'Pendaftaran Mandiri Orang Tua',
        verified_by: 'u-staff-1',
        verified_by_name: 'dr. Dewi Anggraini, Sp.A',
        verified_at: new Date().toISOString(),
        notes: `Data antropometri pendaftaran awal: BB ${birthWeight || '-'} kg, TB ${birthHeight || '-'} cm.`,
        values: {
          C1: birthWeight ? Number(birthWeight) : 3.2,
          C2: birthHeight ? Number(birthHeight) : 50.0,
          C3: 35.0,
          C4: 11.5,
          C5: 100,
          C6: 0
        },
        saw_score: null,
        saw_rank: null
      };

      const rawE = localStorage.getItem('spk_examinations_store');
      let currentExams = rawE ? JSON.parse(rawE) : [...MOCK_EXAMINATIONS];
      if (!Array.isArray(currentExams)) currentExams = [...MOCK_EXAMINATIONS];
      // Cek agar tidak duplikat
      const exists = currentExams.some(e => e.child_id === newChild.id && e.period_code === initialPeriodCode);
      if (!exists) {
        currentExams.unshift(initialExam);
        localStorage.setItem('spk_examinations_store', JSON.stringify(currentExams));
      }
    } catch (e) {
      console.warn('Gagal menambahkan initial exam:', e);
    }

    return { data: newChild, error: null };
  },

  async updateRegistrationStatus(childId, status) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('children')
          .update({ registration_status: status, updated_at: new Date().toISOString() })
          .eq('id', childId)
          .select()
          .single();

        if (!error && data) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Supabase updateRegistrationStatus warning:', err);
      }
    }

    const idx = childrenStore.findIndex(c => c.id === childId);
    if (idx !== -1) {
      childrenStore[idx].registration_status = status;
      saveStoredChildren(childrenStore);
      return { data: childrenStore[idx], error: null };
    }
    return { data: null, error: { message: 'Anak tidak ditemukan' } };
  }
};
