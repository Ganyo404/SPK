-- ============================================================================
-- SPK BALITA SEHAT - INITIAL SEED DATA
-- ============================================================================

-- 1. SEED POSYANDU
INSERT INTO public.posyandu (id, name, address, rw_rt, village, district, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Posyandu Mawar Indah', 'Jl. Kenanga No. 12', 'RW 02 / RT 04', 'Sukamaju', 'Cilodong', true),
  ('22222222-2222-2222-2222-222222222222', 'Posyandu Melati Sejahtera', 'Jl. Anggrek No. 05', 'RW 04 / RT 01', 'Mekarjaya', 'Sukmajaya', true),
  ('33333333-3333-3333-3333-333333333333', 'Posyandu Teratai Kasih', 'Jl. Cempaka No. 88', 'RW 05 / RT 03', 'Baktijaya', 'Sukmajaya', true)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED 6 KRITERIA STANDAR PEMANTAUAN TUMBUH KEMBANG BALITA
INSERT INTO public.criteria (id, code, name, description, data_type, unit, direction, validation_rules, is_active, display_order)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'C1',
    'Berat Badan (BB)',
    'Pengukuran berat badan anak balita saat kunjungan Posyandu',
    'number',
    'kg',
    'benefit',
    '{"min": 2.0, "max": 30.0, "step": 0.05}'::jsonb,
    true,
    1
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'C2',
    'Tinggi / Panjang Badan (TB)',
    'Pengukuran panjang badan (terlentang) atau tinggi badan balita',
    'number',
    'cm',
    'benefit',
    '{"min": 45.0, "max": 130.0, "step": 0.1}'::jsonb,
    true,
    2
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'C3',
    'Lingkar Kepala (LK)',
    'Pengukuran lingkar kepala untuk pemantauan perkembangan volume otak',
    'number',
    'cm',
    'benefit',
    '{"min": 30.0, "max": 60.0, "step": 0.1}'::jsonb,
    true,
    3
  ),
  (
    'c4444444-4444-4444-4444-444444444444',
    'C4',
    'Lingkar Lengan Atas (LiLA)',
    'Skrining cepat status gizi dan risiko malnutrisi anak balita',
    'number',
    'cm',
    'benefit',
    '{"min": 9.0, "max": 25.0, "step": 0.1}'::jsonb,
    true,
    4
  ),
  (
    'c5555555-5555-5555-5555-555555555555',
    'C5',
    'Kelengkapan Imunisasi Dasar',
    'Persentase cakupan vaksinasi dan imunisasi balita sesuai usia',
    'number',
    '%',
    'benefit',
    '{"min": 0, "max": 100, "step": 1}'::jsonb,
    true,
    5
  ),
  (
    'c6666666-6666-6666-6666-666666666666',
    'C6',
    'Frekuensi Sakit (6 Bulan Terakhir)',
    'Jumlah episode sakit (ISPA, diare, dll) dalam 6 bulan terakhir',
    'number',
    'kali',
    'cost',
    '{"min": 0, "max": 15, "step": 1}'::jsonb,
    true,
    6
  )
ON CONFLICT (code) DO NOTHING;

-- 3. SEED KONFIGURASI AHP RESMI TERUJI (CR = 0.014971 <= 0.10)
INSERT INTO public.ahp_configurations (
  id,
  version,
  pairwise_matrix,
  weights,
  lambda_max,
  ci,
  cr,
  status,
  notes
)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'AHP-CONFIG-2026-V1',
  '[[1, 2, 3, 2, 4, 5], [0.5, 1, 2, 2, 3, 4], [0.333, 0.5, 1, 1, 2, 3], [0.5, 0.5, 1, 1, 2, 3], [0.25, 0.333, 0.5, 0.5, 1, 2], [0.2, 0.25, 0.333, 0.333, 0.5, 1]]'::jsonb,
  '{"C1": 0.344865, "C2": 0.234685, "C3": 0.138239, "C4": 0.148240, "C5": 0.081768, "C6": 0.052203}'::jsonb,
  6.092823,
  0.018565,
  0.014971,
  'active',
  'Konfigurasi AHP tervalidasi standar Saaty (RI=1.24, CR=0.015 < 0.10) untuk 6 Kriteria Balita Sehat'
)
ON CONFLICT (version) DO NOTHING;
