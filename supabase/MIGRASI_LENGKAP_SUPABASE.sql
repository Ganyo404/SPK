-- ============================================================================
-- SPK BALITA SEHAT - SKRIP MIGRASI LENGKAP & SEED DATA SUPABASE RESMI
-- Menyiapkan seluruh tabel, RLS, Trigger, dan Data 14 Balita Acuan Cohort G4
-- ============================================================================

-- 1. HAPUS TABEL LAMA (JIKA ADA) AGAR BERSIH & RAPI
DROP TABLE IF EXISTS public.spk_results CASCADE;
DROP TABLE IF EXISTS public.spk_runs CASCADE;
DROP TABLE IF EXISTS public.examination_details CASCADE;
DROP TABLE IF EXISTS public.examinations CASCADE;
DROP TABLE IF EXISTS public.consultation_messages CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.recommendations CASCADE;
DROP TABLE IF EXISTS public.staff_assignments CASCADE;
DROP TABLE IF EXISTS public.children CASCADE;
DROP TABLE IF EXISTS public.criteria CASCADE;
DROP TABLE IF EXISTS public.ahp_configurations CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.posyandu CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TABEL PROFIL PENGGUNA
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  full_name TEXT NOT NULL,
  nik VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  role TEXT NOT NULL CHECK (role IN ('parent', 'staff', 'admin')) DEFAULT 'parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABEL POSYANDU
CREATE TABLE public.posyandu (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  rw_rt VARCHAR(50),
  village TEXT,
  district TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABEL DATA BALITA
CREATE TABLE public.children (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code VARCHAR(20),
  parent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  posyandu_id TEXT REFERENCES public.posyandu(id) ON DELETE SET NULL,
  nik_child VARCHAR(20),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  sex VARCHAR(1) NOT NULL CHECK (sex IN ('L', 'P')),
  blood_type VARCHAR(5),
  birth_weight_kg NUMERIC(5, 2),
  birth_height_cm NUMERIC(5, 2),
  registration_status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABEL KRITERIA SPK (K1 - K5)
CREATE TABLE public.criteria (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code VARCHAR(10) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  data_type TEXT NOT NULL DEFAULT 'number',
  unit VARCHAR(20),
  direction TEXT NOT NULL CHECK (direction IN ('benefit', 'cost')) DEFAULT 'benefit',
  validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABEL KONFIGURASI AHP
CREATE TABLE public.ahp_configurations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  version VARCHAR(50) NOT NULL UNIQUE,
  pairwise_matrix JSONB NOT NULL,
  weights JSONB NOT NULL,
  lambda_max NUMERIC(8, 6) NOT NULL,
  ci NUMERIC(8, 6) NOT NULL,
  cr NUMERIC(8, 6) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABEL PEMERIKSAAN KUNJUNGAN
CREATE TABLE public.examinations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  child_id TEXT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  posyandu_id TEXT REFERENCES public.posyandu(id) ON DELETE SET NULL,
  examined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  period_code VARCHAR(10) NOT NULL,
  recorded_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_verification', 'verified', 'rejected')) DEFAULT 'draft',
  measurements JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABEL RINCIAN NILAI KRITERIA PEMERIKSAAN
CREATE TABLE public.examination_details (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  examination_id TEXT NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
  criterion_id TEXT NOT NULL REFERENCES public.criteria(id) ON DELETE CASCADE,
  raw_value NUMERIC(8, 2) NOT NULL,
  normalized_value NUMERIC(8, 6),
  unit VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_exam_criterion UNIQUE (examination_id, criterion_id)
);

-- 9. TABEL RUNNING SPK
CREATE TABLE public.spk_runs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  age_group_id INTEGER,
  period_code VARCHAR(10) NOT NULL,
  gender_filter VARCHAR(10) DEFAULT 'all',
  algorithm_version VARCHAR(50) NOT NULL DEFAULT 'AHP-SAW-v2026',
  ahp_configuration_id TEXT REFERENCES public.ahp_configurations(id),
  alternative_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. TABEL HASIL SPK & RANKING ALTERNATIF
CREATE TABLE public.spk_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  spk_run_id TEXT NOT NULL REFERENCES public.spk_runs(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  examination_id TEXT NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
  raw_values_snapshot JSONB NOT NULL,
  normalized_values JSONB NOT NULL,
  weights_snapshot JSONB NOT NULL,
  contributions JSONB NOT NULL,
  preference_score NUMERIC(8, 6) NOT NULL,
  rank INTEGER NOT NULL,
  clinical_status VARCHAR(50) DEFAULT 'Normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_run_child_rank UNIQUE (spk_run_id, child_id)
);

-- 11. TABEL KONSULTASI
CREATE TABLE public.consultations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  parent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  assigned_staff_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'closed')) DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. TABEL PESAN KONSULTASI
CREATE TABLE public.consultation_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  consultation_id TEXT NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. TABEL AUDIT LOG
CREATE TABLE public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- PENGATURAN ROW LEVEL SECURITY (RLS) - PERMISIF UNTUK ANON & AUTHENTICATED
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.posyandu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all posyandu" ON public.posyandu FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all children" ON public.children FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all criteria" ON public.criteria FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.ahp_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all ahp_configurations" ON public.ahp_configurations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all examinations" ON public.examinations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.examination_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all examination_details" ON public.examination_details FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.spk_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all spk_runs" ON public.spk_runs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.spk_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all spk_results" ON public.spk_results FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all consultations" ON public.consultations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.consultation_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all consultation_messages" ON public.consultation_messages FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- RPC FUNCTION: VERIFIKASI PEMERIKSAAN
-- ============================================================================
CREATE OR REPLACE FUNCTION public.verify_examination(p_examination_id TEXT, p_staff_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_exam public.examinations%ROWTYPE;
BEGIN
  UPDATE public.examinations
  SET status = 'verified',
      verified_by = p_staff_id,
      verified_at = now(),
      updated_at = now()
  WHERE id = p_examination_id
  RETURNING * INTO v_exam;

  INSERT INTO public.audit_logs (actor_name, action, entity_type, entity_id, reason)
  VALUES ('Petugas Medis', 'VERIFY_EXAMINATION', 'examinations', p_examination_id, 'Pemeriksaan balita berhasil diverifikasi');

  RETURN to_jsonb(v_exam);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INSERT SEED DATA
-- ============================================================================

-- 1. SEED PROFILES
INSERT INTO public.profiles (id, email, full_name, nik, address, phone, role)
VALUES ('u-parent-1', 'user@gmail.com', 'Siti Rahmawati', '3201015504950001', 'Jl. Melati Raya No. 14, RT 03/RW 02, Cilodong', '081234567890', 'parent')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;
INSERT INTO public.profiles (id, email, full_name, nik, address, phone, role)
VALUES ('u-parent-2', 'hendra@gmail.com', 'Hendra Gunawan', '3201011808920004', 'Jl. Mawar No. 8, RT 02/RW 01, Cilodong', '081223344556', 'parent')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;
INSERT INTO public.profiles (id, email, full_name, nik, address, phone, role)
VALUES ('u-parent-3', 'nurul@gmail.com', 'Nurul Hidayah', '3201014512940005', 'Jl. Melati Raya No. 20, RT 03/RW 02, Cilodong', '081399887766', 'parent')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;
INSERT INTO public.profiles (id, email, full_name, nik, address, phone, role)
VALUES ('u-parent-4', 'bambang@gmail.com', 'Bambang Irawan', '3201011005910006', 'Jl. Anggrek No. 15, RT 04/RW 01, Sukmajaya', '081288776655', 'parent')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;
INSERT INTO public.profiles (id, email, full_name, nik, address, phone, role)
VALUES ('u-staff-1', 'dokter@gmail.com', 'dr. Dewi Anggraini, Sp.A', '3201016608900002', 'Jl. Kesehatan No. 5, Sukamaju', '081298765432', 'staff')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;
INSERT INTO public.profiles (id, email, full_name, nik, address, phone, role)
VALUES ('u-admin-1', 'admin@gmail.com', 'Ahmad Fauzi, S.Kom (Administrator)', '3201011203880003', 'Komplek Puskesmas Cilodong Blok A1', '081311223344', 'admin')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- 2. SEED POSYANDU
INSERT INTO public.posyandu (id, name, address, rw_rt, village, district, is_active)
VALUES ('posyandu-1', 'Posyandu Mawar Indah', 'Jl. Kenanga No. 12', 'RW 02 / RT 04', 'Sukamaju', 'Cilodong', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.posyandu (id, name, address, rw_rt, village, district, is_active)
VALUES ('posyandu-2', 'Posyandu Melati Sejahtera', 'Jl. Anggrek No. 05', 'RW 04 / RT 01', 'Mekarjaya', 'Sukmajaya', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.posyandu (id, name, address, rw_rt, village, district, is_active)
VALUES ('posyandu-3', 'Posyandu Teratai Kasih', 'Jl. Cempaka No. 88', 'RW 05 / RT 03', 'Baktijaya', 'Sukmajaya', true)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED KRITERIA (K1 - K5)
INSERT INTO public.criteria (id, code, name, description, unit, direction, validation_rules, is_active, display_order)
VALUES ('crit-1', 'K1', 'Berat Badan menurut Umur (BB/U)', 'Standar deviasi Z-score BB/U Permenkes No. 2/2020', 'Skor 1-4', 'benefit', '{"min":1,"max":4,"step":1}'::jsonb, true, 1)
ON CONFLICT (code) DO NOTHING;
INSERT INTO public.criteria (id, code, name, description, unit, direction, validation_rules, is_active, display_order)
VALUES ('crit-2', 'K2', 'Panjang/Tinggi Badan menurut Umur (PB/TB)', 'Standar deviasi Z-score PB/TB Permenkes No. 2/2020', 'Skor 1-4', 'benefit', '{"min":1,"max":4,"step":1}'::jsonb, true, 2)
ON CONFLICT (code) DO NOTHING;
INSERT INTO public.criteria (id, code, name, description, unit, direction, validation_rules, is_active, display_order)
VALUES ('crit-3', 'K3', 'Lingkar Kepala menurut Umur (LK/U)', 'Standar deviasi Z-score LK/U WHO Growth Charts', 'Skor 1-4', 'benefit', '{"min":1,"max":4,"step":1}'::jsonb, true, 3)
ON CONFLICT (code) DO NOTHING;
INSERT INTO public.criteria (id, code, name, description, unit, direction, validation_rules, is_active, display_order)
VALUES ('crit-4', 'K4', 'Riwayat Kelengkapan Imunisasi', 'Target kumulatif dosis imunisasi dasar nasional', 'Skor 1-4', 'benefit', '{"min":1,"max":4,"step":1}'::jsonb, true, 4)
ON CONFLICT (code) DO NOTHING;
INSERT INTO public.criteria (id, code, name, description, unit, direction, validation_rules, is_active, display_order)
VALUES ('crit-5', 'K5', 'Asupan Gizi & Praktik Makan Balita (PMBA)', 'Komposit MDD (Minimum Dietary Diversity) & MMF (Minimum Meal Frequency) WHO/UNICEF', 'Skor 1-4', 'benefit', '{"min":0,"max":1,"step":0.5}'::jsonb, true, 5)
ON CONFLICT (code) DO NOTHING;

-- 4. SEED KONFIGURASI AHP BAKU
INSERT INTO public.ahp_configurations (id, version, pairwise_matrix, weights, lambda_max, ci, cr, status, notes)
VALUES ('ahp-conf-5k', 'AHP-BAKU-5K-2026', '[[1,1,1.45,0.29,0.5],[1,1,1.45,0.29,0.5],[0.69,0.69,1,0.2,0.345],[3.448,3.448,5,1,1.723],[2,2,2.9,0.58,1]]'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, 5.000136, 0.000034, 0.00003, 'active', 'Konfigurasi AHP 5 Kriteria Baku (Usia 6-23 Bulan, CR <= 0.10)')
ON CONFLICT (version) DO NOTHING;

-- 5. SEED 14 BALITA ACUAN (A01 - A14)
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a1', 'A01', 'u-parent-1', 'posyandu-1', 'Arka', '2026-01-15', 'L', 3.3, 50, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a2', 'A02', 'u-parent-2', 'posyandu-1', 'Nara', '2026-01-15', 'P', 3.1, 49, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a3', 'A03', 'u-parent-3', 'posyandu-1', 'Elio', '2026-01-15', 'L', 3, 48, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a4', 'A04', 'u-parent-4', 'posyandu-2', 'Aluna', '2026-01-15', 'P', 2.8, 47, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a5', 'A05', 'u-parent-1', 'posyandu-1', 'Zayn', '2026-01-15', 'L', 3.5, 51, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a6', 'A06', 'u-parent-2', 'posyandu-1', 'Kai', '2025-12-15', 'L', 3.4, 50, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a7', 'A07', 'u-parent-3', 'posyandu-1', 'Ayla', '2025-12-15', 'P', 3.2, 49.5, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a8', 'A08', 'u-parent-4', 'posyandu-2', 'Kira', '2025-12-15', 'P', 2.9, 48, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a9', 'A09', 'u-parent-1', 'posyandu-1', 'Raka', '2025-12-15', 'L', 3.1, 49, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a10', 'A10', 'u-parent-2', 'posyandu-1', 'Zara', '2025-12-15', 'P', 3.6, 51.5, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a11', 'A11', 'u-parent-3', 'posyandu-1', 'Ezra', '2025-11-15', 'L', 3.5, 51, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a12', 'A12', 'u-parent-4', 'posyandu-2', 'Livia', '2025-11-15', 'P', 3.3, 50, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a13', 'A13', 'u-parent-1', 'posyandu-1', 'Nino', '2025-11-15', 'L', 2.9, 47.5, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
INSERT INTO public.children (id, code, parent_id, posyandu_id, name, date_of_birth, sex, birth_weight_kg, birth_height_cm, registration_status)
VALUES ('child-a14', 'A14', 'u-parent-2', 'posyandu-1', 'Naia', '2025-11-15', 'P', 3.2, 49, 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 6. SEED 14 PEMERIKSAAN TERSTANDAR PERIODE 2026-10
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a1', 'child-a1', 'posyandu-1', '2026-10-10T08:30:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T08:30:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a2', 'child-a2', 'posyandu-1', '2026-10-10T08:45:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T08:45:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a3', 'child-a3', 'posyandu-1', '2026-10-10T09:00:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T09:00:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a4', 'child-a4', 'posyandu-2', '2026-10-10T09:15:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T09:15:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a5', 'child-a5', 'posyandu-1', '2026-10-10T09:30:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T09:30:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a6', 'child-a6', 'posyandu-1', '2026-10-10T09:45:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T09:45:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a7', 'child-a7', 'posyandu-1', '2026-10-10T10:00:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T10:00:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a8', 'child-a8', 'posyandu-2', '2026-10-10T10:15:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T10:15:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a9', 'child-a9', 'posyandu-1', '2026-10-10T10:30:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T10:30:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a10', 'child-a10', 'posyandu-1', '2026-10-10T10:45:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T10:45:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a11', 'child-a11', 'posyandu-1', '2026-10-10T11:00:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T11:00:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a12', 'child-a12', 'posyandu-2', '2026-10-10T11:15:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T11:15:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a13', 'child-a13', 'posyandu-1', '2026-10-10T11:30:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T11:30:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;
INSERT INTO public.examinations (id, child_id, posyandu_id, examined_at, period_code, recorded_by, verified_by, status, measurements, notes, verified_at)
VALUES ('exam-sim-a14', 'child-a14', 'posyandu-1', '2026-10-10T11:45:00Z', '2026-10', 'u-staff-1', 'u-staff-1', 'verified', '{}'::jsonb, 'Pemeriksaan rutin Posyandu Kohor G4', '2026-10-10T11:45:00Z')
ON CONFLICT (id) DO UPDATE SET measurements = EXCLUDED.measurements, status = EXCLUDED.status;

-- 7. SEED SPK RUN & RESULTS PERIODE 2026-10
INSERT INTO public.spk_runs (id, age_group_id, period_code, gender_filter, algorithm_version, ahp_configuration_id, alternative_count, status, created_by)
VALUES ('run-sim-g4-2026-10', 4, '2026-10', 'all', 'AHP-SAW-v2026', 'ahp-conf-5k', 14, 'completed', 'u-staff-1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a01', 'run-sim-g4-2026-10', 'child-a1', 'exam-sim-a1', '{"K1":4,"K2":4,"K3":4,"K4":4,"K5":1}'::jsonb, '{"K1":1,"K2":1,"K3":1,"K4":1,"K5":1}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, 1, 1, 'Normal')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a11', 'run-sim-g4-2026-10', 'child-a11', 'exam-sim-a11', '{"K1":4,"K2":4,"K3":4,"K4":4,"K5":1}'::jsonb, '{"K1":1,"K2":1,"K3":1,"K4":1,"K5":1}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, 1, 1, 'Normal')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a06', 'run-sim-g4-2026-10', 'child-a6', 'exam-sim-a6', '{"K1":4,"K2":4,"K3":4,"K4":3,"K5":1}'::jsonb, '{"K1":1,"K2":1,"K3":1,"K4":0.75,"K5":1}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.3177585,"K5":0.245774}'::jsonb, 0.8940805, 3, 'Normal')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a12', 'run-sim-g4-2026-10', 'child-a12', 'exam-sim-a12', '{"K1":4,"K2":4,"K3":4,"K4":3,"K5":1}'::jsonb, '{"K1":1,"K2":1,"K3":1,"K4":0.75,"K5":1}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.3177585,"K5":0.245774}'::jsonb, 0.8940805, 3, 'Normal')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a02', 'run-sim-g4-2026-10', 'child-a2', 'exam-sim-a2', '{"K1":4,"K2":4,"K3":4,"K4":3,"K5":1}'::jsonb, '{"K1":1,"K2":1,"K3":1,"K4":0.75,"K5":1}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.3177585,"K5":0.245774}'::jsonb, 0.8940805, 3, 'Normal')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a05', 'run-sim-g4-2026-10', 'child-a5', 'exam-sim-a5', '{"K1":4,"K2":4,"K3":4,"K4":4,"K5":0.5}'::jsonb, '{"K1":1,"K2":1,"K3":1,"K4":1,"K5":0.5}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.122887}'::jsonb, 0.8771132, 6, 'Normal')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a10', 'run-sim-g4-2026-10', 'child-a10', 'exam-sim-a10', '{"K1":4,"K2":4,"K3":2,"K4":3,"K5":1}'::jsonb, '{"K1":1,"K2":1,"K3":0.5,"K4":0.75,"K5":1}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.0423875,"K4":0.3177585,"K5":0.245774}'::jsonb, 0.851693, 7, 'Normal')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a07', 'run-sim-g4-2026-10', 'child-a7', 'exam-sim-a7', '{"K1":4,"K2":4,"K3":4,"K4":3,"K5":0.5}'::jsonb, '{"K1":1,"K2":1,"K3":1,"K4":0.75,"K5":0.5}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.3177585,"K5":0.122887}'::jsonb, 0.7711937, 8, 'Normal')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a14', 'run-sim-g4-2026-10', 'child-a14', 'exam-sim-a14', '{"K1":4,"K2":4,"K3":4,"K4":3,"K5":0.5}'::jsonb, '{"K1":1,"K2":1,"K3":1,"K4":0.75,"K5":0.5}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.3177585,"K5":0.122887}'::jsonb, 0.7711937, 8, 'Normal')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a03', 'run-sim-g4-2026-10', 'child-a3', 'exam-sim-a3', '{"K1":2,"K2":2,"K3":4,"K4":3,"K5":0.5}'::jsonb, '{"K1":0.5,"K2":0.5,"K3":1,"K4":0.75,"K5":0.5}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.0614435,"K2":0.0614435,"K3":0.084775,"K4":0.3177585,"K5":0.122887}'::jsonb, 0.648307, 10, 'Perlu Tinjau')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a09', 'run-sim-g4-2026-10', 'child-a9', 'exam-sim-a9', '{"K1":4,"K2":2,"K3":4,"K4":3,"K5":0}'::jsonb, '{"K1":1,"K2":0.5,"K3":1,"K4":0.75,"K5":0}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.122887,"K2":0.0614435,"K3":0.084775,"K4":0.3177585,"K5":0}'::jsonb, 0.5868636, 11, 'Perlu Tinjau')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a08', 'run-sim-g4-2026-10', 'child-a8', 'exam-sim-a8', '{"K1":4,"K2":2,"K3":2,"K4":2,"K5":0.5}'::jsonb, '{"K1":1,"K2":0.5,"K3":0.5,"K4":0.5,"K5":0.5}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.122887,"K2":0.0614435,"K3":0.0423875,"K4":0.211839,"K5":0.122887}'::jsonb, 0.5614434, 12, 'Perlu Tinjau')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a04', 'run-sim-g4-2026-10', 'child-a4', 'exam-sim-a4', '{"K1":2,"K2":2,"K3":2,"K4":2,"K5":0}'::jsonb, '{"K1":0.5,"K2":0.5,"K3":0.5,"K4":0.5,"K5":0}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.0614435,"K2":0.0614435,"K3":0.0423875,"K4":0.211839,"K5":0}'::jsonb, 0.3771132, 13, 'Perlu Tinjau')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;
INSERT INTO public.spk_results (id, spk_run_id, child_id, examination_id, raw_values_snapshot, normalized_values, weights_snapshot, contributions, preference_score, rank, clinical_status)
VALUES ('res-a13', 'run-sim-g4-2026-10', 'child-a13', 'exam-sim-a13', '{"K1":2,"K2":2,"K3":2,"K4":2,"K5":0}'::jsonb, '{"K1":0.5,"K2":0.5,"K3":0.5,"K4":0.5,"K5":0}'::jsonb, '{"K1":0.122887,"K2":0.122887,"K3":0.084775,"K4":0.423678,"K5":0.245774}'::jsonb, '{"K1":0.0614435,"K2":0.0614435,"K3":0.0423875,"K4":0.211839,"K5":0}'::jsonb, 0.3771132, 13, 'Perlu Tinjau')
ON CONFLICT (id) DO UPDATE SET preference_score = EXCLUDED.preference_score, rank = EXCLUDED.rank;

-- 8. SEED KONSULTASI SAMPLE (ARKA)
INSERT INTO public.consultations (id, parent_id, child_id, assigned_staff_id, title, status)
VALUES ('cons-1', 'u-parent-1', 'child-a1', 'u-staff-1', 'Konsultasi Variasi Menu MPASI & Vitamin Tambahan', 'in_progress')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.consultation_messages (id, consultation_id, sender_id, message)
VALUES ('msg-1', 'cons-1', 'u-parent-1', 'Selamat siang Dokter Dewi, anak saya Arka belakangan agak pemilih makanan (GTM). Apakah ada saran variasi menu berprotein hewani?')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.consultation_messages (id, consultation_id, sender_id, message)
VALUES ('msg-2', 'cons-1', 'u-staff-1', 'Selamat siang Ibu Siti. Berat badan Arka kemarin (8.7 kg) sangat baik (12.6 kg). Untuk mengatasi GTM, Ibu bisa variasikan tekstur telur puyuh cincang, nugget hati ayam buatan rumah, atau sup kaldu daging. Jangan dipaksa makan, buat suasana menyenangkan.')
ON CONFLICT (id) DO NOTHING;

-- 9. SEED AUDIT LOGS
INSERT INTO public.audit_logs (id, actor_name, action, entity_type, entity_id, reason)
VALUES ('log-1', 'dr. Dewi Anggraini, Sp.A', 'VERIFY_EXAMINATION', 'examinations', 'exam-sim-a1', 'Pemeriksaan balita divalidasi oleh dokter/tenaga medis')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (id, actor_name, action, entity_type, entity_id, reason)
VALUES ('log-2', 'Ahmad Fauzi, S.Kom', 'UPDATE_AHP_CONFIG', 'ahp_configurations', 'a1111111-1111-1111-1111-111111111111', 'Pembaruan matriks AHP versi resmi 2026')
ON CONFLICT (id) DO NOTHING;

-- MIGRASI SELESAI DENGAN SUKSES --
