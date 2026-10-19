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
  // Akun pendukung tambahan untuk kompatibilitas
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
  {
    id: 'child-1',
    parent_id: 'u-parent-1',
    parent_name: 'Siti Rahmawati',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Aisyah Putri Azzahra',
    date_of_birth: '2024-03-15',
    sex: 'P',
    birth_weight_kg: 3.2,
    birth_height_cm: 49.0,
    registration_status: 'active',
    created_at: '2024-03-20T08:00:00Z'
  },
  {
    id: 'child-2',
    parent_id: 'u-parent-1',
    parent_name: 'Siti Rahmawati',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Muhammad Rayyan',
    date_of_birth: '2024-06-10',
    sex: 'L',
    birth_weight_kg: 3.4,
    birth_height_cm: 50.0,
    registration_status: 'active',
    created_at: '2024-06-15T09:00:00Z'
  },
  {
    id: 'child-3',
    parent_id: 'u-parent-2',
    parent_name: 'Hendra Gunawan',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Bilqis Humaira',
    date_of_birth: '2024-02-05',
    sex: 'P',
    birth_weight_kg: 3.0,
    birth_height_cm: 48.0,
    registration_status: 'active',
    created_at: '2024-02-10T10:00:00Z'
  },
  {
    id: 'child-4',
    parent_id: 'u-parent-3',
    parent_name: 'Nurul Hidayah',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Fatih Al-Farabi',
    date_of_birth: '2024-08-22',
    sex: 'L',
    birth_weight_kg: 3.5,
    birth_height_cm: 51.0,
    registration_status: 'active',
    created_at: '2024-08-25T11:00:00Z'
  },
  {
    id: 'child-5',
    parent_id: 'u-parent-4',
    parent_name: 'Bambang Irawan',
    posyandu_id: 'posyandu-2',
    posyandu_name: 'Posyandu Melati Sejahtera',
    name: 'Khadijah Annisa',
    date_of_birth: '2025-01-18',
    sex: 'P',
    birth_weight_kg: 3.1,
    birth_height_cm: 49.5,
    registration_status: 'active',
    created_at: '2025-01-20T08:30:00Z'
  },
  {
    id: 'child-6',
    parent_id: 'u-parent-1',
    parent_name: 'Siti Rahmawati',
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    name: 'Zahra Talita',
    date_of_birth: '2026-05-12',
    sex: 'P',
    birth_weight_kg: 3.3,
    birth_height_cm: 50.0,
    registration_status: 'pending_registration',
    created_at: '2026-05-15T09:00:00Z'
  }
];

export const MOCK_CRITERIA = [
  {
    id: 'c-1',
    code: 'C1',
    name: 'Berat Badan (BB)',
    unit: 'kg',
    direction: 'benefit',
    validation_rules: { min: 2.0, max: 30.0, step: 0.05 }
  },
  {
    id: 'c-2',
    code: 'C2',
    name: 'Tinggi / Panjang Badan (TB)',
    unit: 'cm',
    direction: 'benefit',
    validation_rules: { min: 45.0, max: 130.0, step: 0.1 }
  },
  {
    id: 'c-3',
    code: 'C3',
    name: 'Lingkar Kepala (LK)',
    unit: 'cm',
    direction: 'benefit',
    validation_rules: { min: 30.0, max: 60.0, step: 0.1 }
  },
  {
    id: 'c-4',
    code: 'C4',
    name: 'Lingkar Lengan Atas (LiLA)',
    unit: 'cm',
    direction: 'benefit',
    validation_rules: { min: 9.0, max: 25.0, step: 0.1 }
  },
  {
    id: 'c-5',
    code: 'C5',
    name: 'Kelengkapan Imunisasi Dasar',
    unit: '%',
    direction: 'benefit',
    validation_rules: { min: 0, max: 100, step: 1 }
  },
  {
    id: 'c-6',
    code: 'C6',
    name: 'Frekuensi Sakit (6 Bln Terakhir)',
    unit: 'kali',
    direction: 'cost',
    validation_rules: { min: 0, max: 15, step: 1 }
  }
];

export const MOCK_EXAMINATIONS = [
  // Periode 2026-08 (Anak 1)
  {
    id: 'exam-1',
    child_id: 'child-1',
    child_name: 'Aisyah Putri Azzahra',
    birth_year: 2024,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-08-15T09:00:00Z',
    period_code: '2026-08',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-08-15T11:00:00Z',
    status: 'verified',
    notes: 'Kondisi anak aktif dan nafsu makan baik.',
    values: { C1: 12.0, C2: 87.0, C3: 47.0, C4: 15.2, C5: 100, C6: 0 },
    saw_score: 0.985,
    saw_rank: 1
  },
  // Periode 2026-09 (Anak 1)
  {
    id: 'exam-2',
    child_id: 'child-1',
    child_name: 'Aisyah Putri Azzahra',
    birth_year: 2024,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-09-15T09:30:00Z',
    period_code: '2026-09',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-09-15T10:45:00Z',
    status: 'verified',
    notes: 'Berat badan bertambah, motorik sangat lincah.',
    values: { C1: 12.3, C2: 88.0, C3: 47.2, C4: 15.4, C5: 100, C6: 0 },
    saw_score: 0.990,
    saw_rank: 1
  },
  // Periode 2026-10 (Cohort 2024 - 4 anak terverifikasi)
  {
    id: 'exam-3',
    child_id: 'child-1',
    child_name: 'Aisyah Putri Azzahra',
    birth_year: 2024,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-15T09:00:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-15T11:00:00Z',
    status: 'verified',
    notes: 'Pertumbuhan optimal, pertahankan pola makan gizi seimbang.',
    values: { C1: 12.6, C2: 89.0, C3: 47.5, C4: 15.6, C5: 100, C6: 0 },
    saw_score: 1.000,
    saw_rank: 1
  },
  {
    id: 'exam-4',
    child_id: 'child-2',
    child_name: 'Muhammad Rayyan',
    birth_year: 2024,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-15T09:40:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-15T11:10:00Z',
    status: 'verified',
    notes: 'Nafsu makan cukup baik, sempat pilek 1 kali bulan lalu.',
    values: { C1: 11.8, C2: 86.5, C3: 46.8, C4: 14.8, C5: 90, C6: 1 },
    saw_score: 0.912,
    saw_rank: 2
  },
  {
    id: 'exam-5',
    child_id: 'child-3',
    child_name: 'Bilqis Humaira',
    birth_year: 2024,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-15T10:15:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-15T11:15:00Z',
    status: 'verified',
    notes: 'LiLA dalam rentang normal, imunisasi booster telah terjadwal.',
    values: { C1: 11.2, C2: 85.0, C3: 46.2, C4: 14.2, C5: 85, C6: 1 },
    saw_score: 0.878,
    saw_rank: 3
  },
  {
    id: 'exam-6',
    child_id: 'child-4',
    child_name: 'Fatih Al-Farabi',
    birth_year: 2024,
    posyandu_id: 'posyandu-1',
    posyandu_name: 'Posyandu Mawar Indah',
    examined_at: '2026-10-15T10:45:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    verified_by: 'u-staff-1',
    verified_at: '2026-10-15T11:20:00Z',
    status: 'verified',
    notes: 'Anak sempat diare 2 kali, perlu edukasi sanitasi dan air minum.',
    values: { C1: 10.4, C2: 83.5, C3: 45.8, C4: 13.5, C5: 75, C6: 2 },
    saw_score: 0.796,
    saw_rank: 4
  },
  // Draf Pemeriksaan (Belum Diverifikasi)
  {
    id: 'exam-7',
    child_id: 'child-5',
    child_name: 'Khadijah Annisa',
    birth_year: 2025,
    posyandu_id: 'posyandu-2',
    posyandu_name: 'Posyandu Melati Sejahtera',
    examined_at: '2026-10-18T10:00:00Z',
    period_code: '2026-10',
    recorded_by: 'u-staff-1',
    recorded_by_name: 'dr. Dewi Anggraini, Sp.A',
    status: 'pending_verification',
    notes: 'Pemeriksaan baru selesai dicatat, menunggu persetujuan verifikasi.',
    values: { C1: 9.8, C2: 78.0, C3: 44.5, C4: 13.8, C5: 90, C6: 0 },
    saw_score: null,
    saw_rank: null
  }
];

export const MOCK_CONSULTATIONS = [
  {
    id: 'cons-1',
    parent_id: 'u-parent-1',
    parent_name: 'Siti Rahmawati',
    child_id: 'child-1',
    child_name: 'Aisyah Putri Azzahra',
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
        message: 'Selamat siang Dokter Dewi, anak saya Aisyah belakangan agak pemilih makanan (GTM). Apakah ada saran variasi menu berprotein hewani?',
        created_at: '2026-10-18T14:00:00Z'
      },
      {
        id: 'msg-2',
        sender_id: 'u-staff-1',
        sender_name: 'dr. Dewi Anggraini, Sp.A',
        message: 'Selamat siang Ibu Siti. Berat badan Aisyah kemarin sangat baik (12.6 kg). Untuk mengatasi GTM, Ibu bisa variasikan tekstur telur puyuh cincang, nugget hati ayam buatan rumah, atau sup kaldu daging. Jangan dipaksa makan, buat suasana menyenangkan.',
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
    entity_id: 'exam-3',
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
