/**
 * SPK BALITA SEHAT - DATA MOCK TERISOLASI
 * Digunakan untuk pengembangan lokal, demonstrasi offline, dan pengujian UI
 * saat Supabase belum terhubung ke database cloud aktif.
 */

export const MOCK_USERS = [
  {
    id: 'u-parent-1',
    email: 'user@gmail.com',
    password: '123',
    full_name: 'Siti Rahmawati',
    nik: '3201015504950001',
    address: 'Jl. Melati Raya No. 14, RT 03/RW 02, Cilodong',
    phone: '081234567890',
    role: 'parent'
  },
  {
    id: 'u-parent-2',
    email: 'hendra@gmail.com',
    password: '123',
    full_name: 'Hendra Gunawan',
    nik: '3201011808920004',
    address: 'Jl. Mawar No. 8, RT 02/RW 01, Cilodong',
    phone: '081223344556',
    role: 'parent'
  },
  {
    id: 'u-parent-3',
    email: 'nurul@gmail.com',
    password: '123',
    full_name: 'Nurul Hidayah',
    nik: '3201014512940005',
    address: 'Jl. Melati Raya No. 20, RT 03/RW 02, Cilodong',
    phone: '081399887766',
    role: 'parent'
  },
  {
    id: 'u-parent-4',
    email: 'bambang@gmail.com',
    password: '123',
    full_name: 'Bambang Irawan',
    nik: '3201011005910006',
    address: 'Jl. Anggrek No. 15, RT 04/RW 01, Sukmajaya',
    phone: '081288776655',
    role: 'parent'
  },
  {
    id: 'u-staff-1',
    email: 'dokter@gmail.com',
    password: '123',
    full_name: 'dr. Dewi Anggraini, Sp.A',
    nik: '3201016608900002',
    address: 'Jl. Kesehatan No. 5, Sukamaju',
    phone: '081298765432',
    role: 'staff'
  },
  {
    id: 'u-admin-1',
    email: 'admin@gmail.com',
    password: '123',
    full_name: 'Ahmad Fauzi, S.Kom (Administrator)',
    nik: '3201011203880003',
    address: 'Komplek Puskesmas Cilodong Blok A1',
    phone: '081311223344',
    role: 'admin'
  },
  // Akun pendukung tambahan untuk kompatibilitas login cepat
  {
    id: 'u-parent-legacy',
    email: 'orangtua@spkbalita.id',
    password: '123',
    full_name: 'Siti Rahmawati',
    nik: '3201015504950001',
    address: 'Jl. Melati Raya No. 14, RT 03/RW 02, Cilodong',
    phone: '081234567890',
    role: 'parent'
  },
  {
    id: 'u-staff-legacy',
    email: 'petugas@spkbalita.id',
    password: '123',
    full_name: 'Bdn. Dewi Anggraini, S.Tr.Keb',
    nik: '3201016608900002',
    address: 'Jl. Kesehatan No. 5, Sukamaju',
    phone: '081298765432',
    role: 'staff'
  },
  {
    id: 'u-admin-legacy',
    email: 'admin@spkbalita.id',
    password: '123',
    full_name: 'Ahmad Fauzi, S.Kom',
    nik: '3201011203880003',
    address: 'Komplek Puskesmas Cilodong Blok A1',
    phone: '081311223344',
    role: 'admin'
  }
];

export const MOCK_POSYANDU = [
  {
    id: 'posyandu-1',
    name: 'Posyandu Mawar Indah',
    address: 'Jl. Kenanga No. 12',
    rw_rt: 'RW 02 / RT 04',
    village: 'Sukamaju',
    district: 'Cilodong',
    is_active: true
  },
  {
    id: 'posyandu-2',
    name: 'Posyandu Melati Sejahtera',
    address: 'Jl. Anggrek No. 05',
    rw_rt: 'RW 04 / RT 01',
    village: 'Mekarjaya',
    district: 'Sukmajaya',
    is_active: true
  },
  {
    id: 'posyandu-3',
    name: 'Posyandu Teratai Kasih',
    address: 'Jl. Cempaka No. 88',
    rw_rt: 'RW 05 / RT 03',
    village: 'Baktijaya',
    district: 'Sukmajaya',
    is_active: true
  }
];

export const MOCK_CHILDREN = [
  // 14 Balita Acuan Simulasi Standarisasi SPK (Kelompok 4: Usia 9 - 11 Bulan pada Periode 2026-10)
  {
    id: 'child-a1',
    code: 'A01',
    parent_id: 'u-parent-1',
    parent_name: 'Siti Rahmawati',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Arka',
    date_of_birth: '2026-01-15', // 9 bulan pada 2026-10
    sex: 'L',
    birth_weight_kg: 3.3,
    birth_height_cm: 50.0,
    registration_status: 'active',
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: 'child-a2',
    code: 'A02',
    parent_id: 'u-parent-2',
    parent_name: 'Hendra Gunawan',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Nara',
    date_of_birth: '2026-01-15', // 9 bulan pada 2026-10
    sex: 'P',
    birth_weight_kg: 3.1,
    birth_height_cm: 49.0,
    registration_status: 'active',
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: 'child-a3',
    code: 'A03',
    parent_id: 'u-parent-3',
    parent_name: 'Nurul Hidayah',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Elio',
    date_of_birth: '2026-01-15', // 9 bulan pada 2026-10
    sex: 'L',
    birth_weight_kg: 3.0,
    birth_height_cm: 48.0,
    registration_status: 'active',
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: 'child-a4',
    code: 'A04',
    parent_id: 'u-parent-4',
    parent_name: 'Bambang Irawan',
    posyandu_id: 'posyandu-2',
    posyandu_name: 'Posyandu Melati Sejahtera',
    name: 'Aluna',
    date_of_birth: '2026-01-15', // 9 bulan pada 2026-10
    sex: 'P',
    birth_weight_kg: 2.8,
    birth_height_cm: 47.0,
    registration_status: 'active',
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: 'child-a5',
    code: 'A05',
    parent_id: 'u-parent-1',
    parent_name: 'Siti Rahmawati',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Zayn',
    date_of_birth: '2026-01-15', // 9 bulan pada 2026-10
    sex: 'L',
    birth_weight_kg: 3.5,
    birth_height_cm: 51.0,
    registration_status: 'active',
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: 'child-a6',
    code: 'A06',
    parent_id: 'u-parent-2',
    parent_name: 'Hendra Gunawan',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Kai',
    date_of_birth: '2025-12-15', // 10 bulan pada 2026-10
    sex: 'L',
    birth_weight_kg: 3.4,
    birth_height_cm: 50.0,
    registration_status: 'active',
    created_at: '2025-12-20T08:00:00Z'
  },
  {
    id: 'child-a7',
    code: 'A07',
    parent_id: 'u-parent-3',
    parent_name: 'Nurul Hidayah',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Ayla',
    date_of_birth: '2025-12-15', // 10 bulan pada 2026-10
    sex: 'P',
    birth_weight_kg: 3.2,
    birth_height_cm: 49.5,
    registration_status: 'active',
    created_at: '2025-12-20T08:00:00Z'
  },
  {
    id: 'child-a8',
    code: 'A08',
    parent_id: 'u-parent-4',
    parent_name: 'Bambang Irawan',
    posyandu_id: 'posyandu-2',
    posyandu_name: 'Posyandu Melati Sejahtera',
    name: 'Kira',
    date_of_birth: '2025-12-15', // 10 bulan pada 2026-10
    sex: 'P',
    birth_weight_kg: 2.9,
    birth_height_cm: 48.0,
    registration_status: 'active',
    created_at: '2025-12-20T08:00:00Z'
  },
  {
    id: 'child-a9',
    code: 'A09',
    parent_id: 'u-parent-1',
    parent_name: 'Siti Rahmawati',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Raka',
    date_of_birth: '2025-12-15', // 10 bulan pada 2026-10
    sex: 'L',
    birth_weight_kg: 3.1,
    birth_height_cm: 49.0,
    registration_status: 'active',
    created_at: '2025-12-20T08:00:00Z'
  },
  {
    id: 'child-a10',
    code: 'A10',
    parent_id: 'u-parent-2',
    parent_name: 'Hendra Gunawan',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Zara',
    date_of_birth: '2025-12-15', // 10 bulan pada 2026-10
    sex: 'P',
    birth_weight_kg: 3.6,
    birth_height_cm: 51.5,
    registration_status: 'active',
    created_at: '2025-12-20T08:00:00Z'
  },
  {
    id: 'child-a11',
    code: 'A11',
    parent_id: 'u-parent-3',
    parent_name: 'Nurul Hidayah',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Ezra',
    date_of_birth: '2025-11-15', // 11 bulan pada 2026-10
    sex: 'L',
    birth_weight_kg: 3.5,
    birth_height_cm: 51.0,
    registration_status: 'active',
    created_at: '2025-11-20T08:00:00Z'
  },
  {
    id: 'child-a12',
    code: 'A12',
    parent_id: 'u-parent-4',
    parent_name: 'Bambang Irawan',
    posyandu_id: 'posyandu-2',
    posyandu_name: 'Posyandu Melati Sejahtera',
    name: 'Livia',
    date_of_birth: '2025-11-15', // 11 bulan pada 2026-10
    sex: 'P',
    birth_weight_kg: 3.3,
    birth_height_cm: 50.0,
    registration_status: 'active',
    created_at: '2025-11-20T08:00:00Z'
  },
  {
    id: 'child-a13',
    code: 'A13',
    parent_id: 'u-parent-1',
    parent_name: 'Siti Rahmawati',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Nino',
    date_of_birth: '2025-11-15', // 11 bulan pada 2026-10
    sex: 'L',
    birth_weight_kg: 2.9,
    birth_height_cm: 47.5,
    registration_status: 'active',
    created_at: '2025-11-20T08:00:00Z'
  },
  {
    id: 'child-a14',
    code: 'A14',
    parent_id: 'u-parent-2',
    parent_name: 'Hendra Gunawan',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Naia',
    date_of_birth: '2025-11-15', // 11 bulan pada 2026-10
    sex: 'P',
    birth_weight_kg: 3.2,
    birth_height_cm: 49.0,
    registration_status: 'active',
    created_at: '2025-11-20T08:00:00Z'
  }
];

export const MOCK_CRITERIA = [
  {
    id: 'crit-1',
    code: 'K1',
    name: 'Berat Badan menurut Umur (BB/U)',
    shortName: 'BB/U',
    unit: 'Skor 1-4',
    rawUnit: 'kg',
    direction: 'benefit',
    weight: 0.122833,
    validation_rules: { min: 1, max: 4, step: 1 }
  },
  {
    id: 'crit-2',
    code: 'K2',
    name: 'Panjang/Tinggi Badan menurut Umur (PB/TB)',
    shortName: 'PB/TB',
    unit: 'Skor 1-4',
    rawUnit: 'cm',
    direction: 'benefit',
    weight: 0.122833,
    validation_rules: { min: 1, max: 4, step: 1 }
  },
  {
    id: 'crit-3',
    code: 'K3',
    name: 'Lingkar Kepala menurut Umur (LK/U)',
    shortName: 'LK/U',
    unit: 'Skor 1-4',
    rawUnit: 'cm',
    direction: 'benefit',
    weight: 0.084737,
    validation_rules: { min: 1, max: 4, step: 1 }
  },
  {
    id: 'crit-4',
    code: 'K4',
    name: 'Riwayat Kelengkapan Imunisasi',
    shortName: 'Imunisasi',
    unit: 'Skor 1-4',
    rawUnit: 'dosis',
    direction: 'benefit',
    weight: 0.423687,
    validation_rules: { min: 1, max: 4, step: 1 }
  },
  {
    id: 'crit-5',
    code: 'K5',
    name: 'Asupan Gizi & Praktik Makan Balita (PMBA)',
    shortName: 'Asupan Gizi',
    unit: 'Skor 1-4',
    rawUnit: 'Indikator',
    direction: 'benefit',
    weight: 0.245910,
    validation_rules: { min: 1, max: 4, step: 1 }
  }
];

export const MOCK_EXAMINATIONS = [
  // Data Pemeriksaan Acuan 14 Balita Simulasi Kelompok 4 (9 - 11 Bulan) Periode 2026-10
  {
    id: 'exam-sim-a1',
    child_id: 'child-a1',
    code: 'A01',
    child_name: 'Arka',
    sex: 'L',
    birth_year: 2026,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-10T08:30:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T09:00:00Z',
    status: 'verified',
    notes: 'Kondisi kesehatan balita ideal sempurna di seluruh 5 kriteria.',
    values: {
      K1: 4, K2: 4, K3: 4, K4: 4, K5: 1.0,
      beratBadan: 8.7, tinggiBadan: 71.5, lingkarKepala: 44.5, imunisasi: 17,
      mddFoodGroups: ['asi', 'staples', 'legumes', 'dairy', 'flesh', 'vitamin_a'],
      mddScore: 1, mddCount: 6, mmfScore: 1, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 3, milkFrequency: 0, k5Value: 1.0
    }
  },
  {
    id: 'exam-sim-a2',
    child_id: 'child-a2',
    code: 'A02',
    child_name: 'Nara',
    sex: 'P',
    birth_year: 2026,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-10T08:45:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T09:15:00Z',
    status: 'verified',
    notes: 'Pertumbuhan normal, asupan makanan MDD dan MMF terpenuhi.',
    values: {
      K1: 4, K2: 4, K3: 4, K4: 3, K5: 1.0,
      beratBadan: 8.1, tinggiBadan: 70.4, lingkarKepala: 43.7, imunisasi: 15,
      mddFoodGroups: ['asi', 'staples', 'dairy', 'flesh', 'other_fruits_veg'],
      mddScore: 1, mddCount: 5, mmfScore: 1, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 3, milkFrequency: 0, k5Value: 1.0
    }
  },
  {
    id: 'exam-sim-a3',
    child_id: 'child-a3',
    code: 'A03',
    child_name: 'Elio',
    sex: 'L',
    birth_year: 2026,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-10T09:00:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T09:30:00Z',
    status: 'verified',
    notes: 'Perhatian: BB dan TB berada pada garis batas kurang (skor 2). Status: Perlu Tinjau.',
    values: {
      K1: 2, K2: 2, K3: 4, K4: 3, K5: 0.5,
      beratBadan: 7.5, tinggiBadan: 68.3, lingkarKepala: 43.6, imunisasi: 14,
      mddFoodGroups: ['asi', 'staples', 'flesh', 'other_fruits_veg'],
      mddScore: 0, mddCount: 4, mmfScore: 1, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 3, milkFrequency: 0, k5Value: 0.5
    }
  },
  {
    id: 'exam-sim-a4',
    child_id: 'child-a4',
    code: 'A04',
    child_name: 'Aluna',
    sex: 'P',
    birth_year: 2026,
    posyandu_id: 'posyandu-2',
    posyandu_name: 'Posyandu Melati Sejahtera',
    examined_at: '2026-10-10T09:15:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T09:45:00Z',
    status: 'verified',
    notes: 'Perhatian: Indikator fisik kurang dan asupan makanan belum memenuhi target (MDD & MMF defisit).',
    values: {
      K1: 2, K2: 2, K3: 2, K4: 2, K5: 0.0,
      beratBadan: 6.2, tinggiBadan: 64.8, lingkarKepala: 41.0, imunisasi: 10,
      mddFoodGroups: ['asi', 'staples', 'dairy'],
      mddScore: 0, mddCount: 3, mmfScore: 0, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 2, milkFrequency: 0, k5Value: 0.0
    }
  },
  {
    id: 'exam-sim-a5',
    child_id: 'child-a5',
    code: 'A05',
    child_name: 'Zayn',
    sex: 'L',
    birth_year: 2026,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-10T09:30:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T10:00:00Z',
    status: 'verified',
    notes: 'Pertumbuhan fisik normal, frekuensi makan cukup namun variasi menu perlu ditingkatkan.',
    values: {
      K1: 4, K2: 4, K3: 4, K4: 4, K5: 0.5,
      beratBadan: 9.7, tinggiBadan: 74.6, lingkarKepala: 46.2, imunisasi: 17,
      mddFoodGroups: ['asi', 'staples', 'legumes', 'flesh'],
      mddScore: 0, mddCount: 4, mmfScore: 1, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 4, milkFrequency: 0, k5Value: 0.5
    }
  },
  {
    id: 'exam-sim-a6',
    child_id: 'child-a6',
    code: 'A06',
    child_name: 'Kai',
    sex: 'L',
    birth_year: 2025,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-10T09:45:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T10:15:00Z',
    status: 'verified',
    notes: 'Kondisi fisik proporsional, asupan gizi 6 kelompok pangan dan frekuensi makan memenuhi.',
    values: {
      K1: 4, K2: 4, K3: 4, K4: 3, K5: 1.0,
      beratBadan: 9.2, tinggiBadan: 72.0, lingkarKepala: 44.8, imunisasi: 16,
      mddFoodGroups: ['asi', 'staples', 'legumes', 'dairy', 'eggs', 'vitamin_a'],
      mddScore: 1, mddCount: 6, mmfScore: 1, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 3, milkFrequency: 0, k5Value: 1.0
    }
  },
  {
    id: 'exam-sim-a7',
    child_id: 'child-a7',
    code: 'A07',
    child_name: 'Ayla',
    sex: 'P',
    birth_year: 2025,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-10T10:00:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T10:30:00Z',
    status: 'verified',
    notes: 'Keragaman pangan baik (6 kelompok), frekuensi makan padat perlu ditingkatkan menjadi minimal 3x sehari.',
    values: {
      K1: 4, K2: 4, K3: 4, K4: 3, K5: 0.5,
      beratBadan: 8.2, tinggiBadan: 70.5, lingkarKepala: 44.0, imunisasi: 13,
      mddFoodGroups: ['asi', 'staples', 'legumes', 'flesh', 'vitamin_a', 'other_fruits_veg'],
      mddScore: 1, mddCount: 6, mmfScore: 0, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 2, milkFrequency: 0, k5Value: 0.5
    }
  },
  {
    id: 'exam-sim-a8',
    child_id: 'child-a8',
    code: 'A08',
    child_name: 'Kira',
    sex: 'P',
    birth_year: 2025,
    posyandu_id: 'posyandu-2',
    posyandu_name: 'Posyandu Melati Sejahtera',
    examined_at: '2026-10-10T10:15:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T10:45:00Z',
    status: 'verified',
    notes: 'Perhatian: TB dan LK berada pada batas bawah (skor 2), frekuensi makan perlu ditambah.',
    values: {
      K1: 4, K2: 2, K3: 2, K4: 2, K5: 0.5,
      beratBadan: 7.1, tinggiBadan: 66.2, lingkarKepala: 42.2, imunisasi: 12,
      mddFoodGroups: ['asi', 'staples', 'dairy', 'eggs', 'other_fruits_veg'],
      mddScore: 1, mddCount: 5, mmfScore: 0, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 2, milkFrequency: 0, k5Value: 0.5
    }
  },
  {
    id: 'exam-sim-a9',
    child_id: 'child-a9',
    code: 'A09',
    child_name: 'Raka',
    sex: 'L',
    birth_year: 2025,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-10T10:30:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T11:00:00Z',
    status: 'verified',
    notes: 'Perhatian: TB pendek (skor 2) dan asupan makanan belum memenuhi indikator MDD maupun MMF.',
    values: {
      K1: 4, K2: 2, K3: 4, K4: 3, K5: 0.0,
      beratBadan: 8.1, tinggiBadan: 68.5, lingkarKepala: 43.8, imunisasi: 15,
      mddFoodGroups: ['asi', 'staples', 'flesh', 'vitamin_a'],
      mddScore: 0, mddCount: 4, mmfScore: 0, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 2, milkFrequency: 0, k5Value: 0.0
    }
  },
  {
    id: 'exam-sim-a10',
    child_id: 'child-a10',
    code: 'A10',
    child_name: 'Zara',
    sex: 'P',
    birth_year: 2025,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-10T10:45:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T11:15:00Z',
    status: 'verified',
    notes: 'Pertumbuhan fisik baik, asupan gizi 6 kelompok pangan dan frekuensi makan memenuhi.',
    values: {
      K1: 4, K2: 4, K3: 2, K4: 3, K5: 1.0,
      beratBadan: 9.7, tinggiBadan: 75.0, lingkarKepala: 47.2, imunisasi: 16,
      mddFoodGroups: ['asi', 'staples', 'legumes', 'dairy', 'flesh', 'other_fruits_veg'],
      mddScore: 1, mddCount: 6, mmfScore: 1, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 3, milkFrequency: 0, k5Value: 1.0
    }
  },
  {
    id: 'exam-sim-a11',
    child_id: 'child-a11',
    code: 'A11',
    child_name: 'Ezra',
    sex: 'L',
    birth_year: 2025,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-10T11:00:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T11:30:00Z',
    status: 'verified',
    notes: 'Kondisi kesehatan balita ideal sempurna di seluruh 5 kriteria.',
    values: {
      K1: 4, K2: 4, K3: 4, K4: 4, K5: 1.0,
      beratBadan: 9.4, tinggiBadan: 74.8, lingkarKepala: 45.8, imunisasi: 17,
      mddFoodGroups: ['asi', 'staples', 'legumes', 'dairy', 'flesh', 'eggs', 'vitamin_a'],
      mddScore: 1, mddCount: 7, mmfScore: 1, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 4, milkFrequency: 0, k5Value: 1.0
    }
  },
  {
    id: 'exam-sim-a12',
    child_id: 'child-a12',
    code: 'A12',
    child_name: 'Livia',
    sex: 'P',
    birth_year: 2025,
    posyandu_id: 'posyandu-2',
    posyandu_name: 'Posyandu Melati Sejahtera',
    examined_at: '2026-10-10T11:15:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T11:45:00Z',
    status: 'verified',
    notes: 'Pertumbuhan fisik normal, asupan gizi 5 kelompok pangan terpenuhi.',
    values: {
      K1: 4, K2: 4, K3: 4, K4: 3, K5: 1.0,
      beratBadan: 8.6, tinggiBadan: 72.7, lingkarKepala: 44.7, imunisasi: 14,
      mddFoodGroups: ['asi', 'staples', 'dairy', 'eggs', 'vitamin_a'],
      mddScore: 1, mddCount: 5, mmfScore: 1, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 3, milkFrequency: 0, k5Value: 1.0
    }
  },
  {
    id: 'exam-sim-a13',
    child_id: 'child-a13',
    code: 'A13',
    child_name: 'Nino',
    sex: 'L',
    birth_year: 2025,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-10T11:30:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T12:00:00Z',
    status: 'verified',
    notes: 'Perhatian: Berat badan dan panjang badan kurang (skor 2), asupan makan belum mencukupi.',
    values: {
      K1: 2, K2: 2, K3: 2, K4: 2, K5: 0.0,
      beratBadan: 7.2, tinggiBadan: 69.3, lingkarKepala: 42.7, imunisasi: 9,
      mddFoodGroups: ['asi', 'staples', 'legumes', 'flesh'],
      mddScore: 0, mddCount: 4, mmfScore: 0, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 2, milkFrequency: 0, k5Value: 0.0
    }
  },
  {
    id: 'exam-sim-a14',
    child_id: 'child-a14',
    code: 'A14',
    child_name: 'Naia',
    sex: 'P',
    birth_year: 2025,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-10T11:45:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-10T12:15:00Z',
    status: 'verified',
    notes: 'Pertumbuhan fisik normal, keragaman pangan mencukupi, frekuensi makan perlu ditingkatkan.',
    values: {
      K1: 4, K2: 4, K3: 4, K4: 3, K5: 0.5,
      beratBadan: 8.1, tinggiBadan: 70.6, lingkarKepala: 43.5, imunisasi: 15,
      mddFoodGroups: ['asi', 'staples', 'flesh', 'vitamin_a', 'other_fruits_veg'],
      mddScore: 1, mddCount: 5, mmfScore: 0, breastfeeding: true, breastfeeding_status: 'still_breastfed',
      solidFrequency: 2, milkFrequency: 0, k5Value: 0.5
    }
  }
];

export const MOCK_CONSULTATIONS = [
  {
    id: 'cons-1',
    parent_id: 'u-parent-1',
    parent_name: 'Siti Rahmawati',
    child_id: 'child-a1',
    child_name: 'Arka',
    assigned_staff_id: 'u-staff-1',
    assigned_staff_name: 'dr. Dewi Anggraini, Sp.A',
    title: 'Konsultasi Variasi Menu MPASI & Vitamin Tambahan',
    status: 'in_progress',
    updated_at: '2026-10-18T14:30:00Z',
    messages: [
      {
        id: 'msg-1',
        sender_id: 'u-parent-1',
        sender_name: 'Siti Rahmawati',
        message: 'Selamat siang Dokter Dewi, anak saya Arka belakangan agak pemilih makanan (GTM). Apakah ada saran variasi menu berprotein hewani?',
        created_at: '2026-10-18T14:00:00Z'
      },
      {
        id: 'msg-2',
        sender_id: 'u-staff-1',
        sender_name: 'dr. Dewi Anggraini, Sp.A',
        message: 'Selamat siang Ibu Siti. Berat badan Arka kemarin (8.7 kg) sangat baik (12.6 kg). Untuk mengatasi GTM, Ibu bisa variasikan tekstur telur puyuh cincang, nugget hati ayam buatan rumah, atau sup kaldu daging. Jangan dipaksa makan, buat suasana menyenangkan.',
        created_at: '2026-10-18T14:30:00Z'
      }
    ]
  }
];

export const MOCK_AUDIT_LOGS = [
  {
    id: 'log-1',
    actor_name: 'dr. Dewi Anggraini, Sp.A',
    action: 'VERIFY_EXAMINATION',
    entity_type: 'examinations',
    entity_id: 'exam-sim-a1',
    reason: 'Pemeriksaan balita divalidasi oleh dokter/tenaga medis',
    created_at: '2026-10-15T11:00:00Z'
  },
  {
    id: 'log-2',
    actor_name: 'Ahmad Fauzi, S.Kom',
    action: 'UPDATE_AHP_CONFIG',
    entity_type: 'ahp_configurations',
    entity_id: 'a1111111-1111-1111-1111-111111111111',
    reason: 'Pembaruan matriks AHP versi resmi 2026',
    created_at: '2026-10-01T08:00:00Z'
  }
];
