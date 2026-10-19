-- ============================================================================
-- SPK BALITA SEHAT - SKEMA LENGKAP POSTGRESQL & ROW LEVEL SECURITY (RLS)
-- Sistem Pendukung Keputusan Pemantauan Balita Sehat (AHP + SAW)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PROFIL PENGGUNA (Terhubung dengan auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nik VARCHAR(16) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  role TEXT NOT NULL CHECK (role IN ('parent', 'staff', 'admin')) DEFAULT 'parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABEL POSYANDU
CREATE TABLE IF NOT EXISTS public.posyandu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  rw_rt VARCHAR(50),
  village TEXT,
  district TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABEL PENUGASAN PETUGAS KE POSYANDU
CREATE TABLE IF NOT EXISTS public.staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  posyandu_id UUID NOT NULL REFERENCES public.posyandu(id) ON DELETE CASCADE,
  role_or_scope TEXT DEFAULT 'Bidan / Kader Posyandu',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_staff_posyandu UNIQUE(staff_id, posyandu_id)
);

-- 5. TABEL DATA ANAK
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  posyandu_id UUID REFERENCES public.posyandu(id) ON DELETE SET NULL,
  nik_child VARCHAR(16),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  sex VARCHAR(1) NOT NULL CHECK (sex IN ('L', 'P')),
  blood_type VARCHAR(5),
  birth_weight_kg NUMERIC(4, 2),
  birth_height_cm NUMERIC(4, 1),
  registration_status TEXT NOT NULL CHECK (
    registration_status IN ('pending_registration', 'registered', 'active', 'inactive', 'rejected')
  ) DEFAULT 'pending_registration',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABEL KRITERIA SPK (6 Kriteria Teruji)
CREATE TABLE IF NOT EXISTS public.criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  data_type TEXT NOT NULL DEFAULT 'number',
  unit VARCHAR(20),
  direction TEXT NOT NULL CHECK (direction IN ('benefit', 'cost')),
  validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABEL KONFIGURASI AHP (Matriks, Bobot, CI, CR)
CREATE TABLE IF NOT EXISTS public.ahp_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(50) NOT NULL UNIQUE,
  pairwise_matrix JSONB NOT NULL,
  weights JSONB NOT NULL,
  lambda_max NUMERIC(8, 6) NOT NULL,
  ci NUMERIC(8, 6) NOT NULL,
  cr NUMERIC(8, 6) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'active',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABEL PEMERIKSAAN (Kunjungan Kunjungan Baru Tanpa Menimpa Data Lama)
CREATE TABLE IF NOT EXISTS public.examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  posyandu_id UUID REFERENCES public.posyandu(id) ON DELETE SET NULL,
  examined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  period_code VARCHAR(10) NOT NULL, -- Format YYYY-MM (misal '2026-10')
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_verification', 'verified', 'rejected')) DEFAULT 'draft',
  notes TEXT,
  verified_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. TABEL RINCIAN NILAI KRITERIA PEMERIKSAAN
CREATE TABLE IF NOT EXISTS public.examination_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id UUID NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
  criterion_id UUID NOT NULL REFERENCES public.criteria(id) ON DELETE RESTRICT,
  raw_value NUMERIC(8, 2) NOT NULL,
  normalized_value NUMERIC(8, 6),
  unit VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_exam_criterion UNIQUE (examination_id, criterion_id)
);

-- 10. TABEL RUNNING PERHITUNGAN SPK (Snapshot SAW per Tahun Kelahiran & Periode)
CREATE TABLE IF NOT EXISTS public.spk_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  birth_year INTEGER NOT NULL,
  period_code VARCHAR(10) NOT NULL, -- e.g. '2026-10'
  period_start DATE,
  period_end DATE,
  algorithm_version VARCHAR(50) NOT NULL DEFAULT 'AHP-SAW-v1.0',
  ahp_configuration_id UUID REFERENCES public.ahp_configurations(id),
  alternative_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('completed', 'superseded')) DEFAULT 'completed',
  recalculation_reason TEXT,
  supersedes_run_id UUID REFERENCES public.spk_runs(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. TABEL HASIL SPK & RANKING ALTERNATIF
CREATE TABLE IF NOT EXISTS public.spk_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spk_run_id UUID NOT NULL REFERENCES public.spk_runs(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  examination_id UUID NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
  raw_values_snapshot JSONB NOT NULL,
  normalized_values JSONB NOT NULL,
  weights_snapshot JSONB NOT NULL,
  contributions JSONB NOT NULL,
  preference_score NUMERIC(8, 6) NOT NULL,
  rank INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_run_child_rank UNIQUE (spk_run_id, child_id)
);

-- 12. TABEL REKOMENDASI EDUKASI
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  examination_id UUID REFERENCES public.examinations(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('high', 'normal')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. TABEL KONSULTASI
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'closed')) DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. TABEL PESAN KONSULTASI
CREATE TABLE IF NOT EXISTS public.consultation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. TABEL AUDIT LOG (Jejak Rekam Perubahan Data Penting)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posyandu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ahp_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examination_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Dapatkan peran pengguna saat ini
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admin has full profile access"
  ON public.profiles FOR ALL
  USING (public.current_user_role() = 'admin');

-- 2. Posyandu Policies
CREATE POLICY "Public read posyandu"
  ON public.posyandu FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin manage posyandu"
  ON public.posyandu FOR ALL
  USING (public.current_user_role() = 'admin');

-- 3. Staff Assignments Policies
CREATE POLICY "Staff and admin view assignments"
  ON public.staff_assignments FOR SELECT
  TO authenticated
  USING (staff_id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "Admin manage staff assignments"
  ON public.staff_assignments FOR ALL
  USING (public.current_user_role() = 'admin');

-- 4. Children Policies
CREATE POLICY "Parents view their own children"
  ON public.children FOR SELECT
  TO authenticated
  USING (
    parent_id = auth.uid() 
    OR public.current_user_role() IN ('staff', 'admin')
  );

CREATE POLICY "Parents can insert children"
  ON public.children FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Staff and admin can update child registration"
  ON public.children FOR UPDATE
  TO authenticated
  USING (
    parent_id = auth.uid() 
    OR public.current_user_role() IN ('staff', 'admin')
  );

-- 5. Criteria Policies
CREATE POLICY "Everyone can view active criteria"
  ON public.criteria FOR SELECT
  TO authenticated
  USING (is_active = true OR public.current_user_role() = 'admin');

CREATE POLICY "Admin manage criteria"
  ON public.criteria FOR ALL
  USING (public.current_user_role() = 'admin');

-- 6. AHP Configurations Policies
CREATE POLICY "Authenticated users view active AHP configs"
  ON public.ahp_configurations FOR SELECT
  TO authenticated
  USING (status = 'active' OR public.current_user_role() = 'admin');

CREATE POLICY "Admin manage AHP configs"
  ON public.ahp_configurations FOR ALL
  USING (public.current_user_role() = 'admin');

-- 7. Examinations & Details Policies
CREATE POLICY "Staff and admin view examinations"
  ON public.examinations FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() IN ('staff', 'admin')
    OR (
      child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
      AND status = 'verified'
    )
  );

CREATE POLICY "Staff can insert draft examinations"
  ON public.examinations FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() IN ('staff', 'admin'));

CREATE POLICY "Staff can update draft examinations"
  ON public.examinations FOR UPDATE
  TO authenticated
  USING (public.current_user_role() IN ('staff', 'admin'));

CREATE POLICY "Examination details view"
  ON public.examination_details FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() IN ('staff', 'admin')
    OR (
      examination_id IN (
        SELECT e.id FROM public.examinations e
        JOIN public.children c ON e.child_id = c.id
        WHERE c.parent_id = auth.uid() AND e.status = 'verified'
      )
    )
  );

CREATE POLICY "Staff manage examination details"
  ON public.examination_details FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('staff', 'admin'));

-- 8. SPK Runs and Results
CREATE POLICY "Staff and admin view SPK runs"
  ON public.spk_runs FOR SELECT
  TO authenticated
  USING (public.current_user_role() IN ('staff', 'admin'));

CREATE POLICY "Staff and admin insert SPK runs"
  ON public.spk_runs FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() IN ('staff', 'admin'));

CREATE POLICY "SPK results view"
  ON public.spk_results FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() IN ('staff', 'admin')
    OR child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Staff and admin insert SPK results"
  ON public.spk_results FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() IN ('staff', 'admin'));

-- 9. Recommendations Policies
CREATE POLICY "View recommendations"
  ON public.recommendations FOR SELECT
  TO authenticated
  USING (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
    OR public.current_user_role() IN ('staff', 'admin')
  );

CREATE POLICY "Staff and admin manage recommendations"
  ON public.recommendations FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('staff', 'admin'));

-- 10. Consultations & Messages Policies
CREATE POLICY "Consultation participant access"
  ON public.consultations FOR SELECT
  TO authenticated
  USING (
    parent_id = auth.uid()
    OR assigned_staff_id = auth.uid()
    OR public.current_user_role() = 'admin'
  );

CREATE POLICY "Parents can create consultations"
  ON public.consultations FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Consultation message access"
  ON public.consultation_messages FOR SELECT
  TO authenticated
  USING (
    consultation_id IN (
      SELECT id FROM public.consultations 
      WHERE parent_id = auth.uid() OR assigned_staff_id = auth.uid() OR public.current_user_role() = 'admin'
    )
  );

CREATE POLICY "Consultation message insert"
  ON public.consultation_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND consultation_id IN (
      SELECT id FROM public.consultations 
      WHERE parent_id = auth.uid() OR assigned_staff_id = auth.uid() OR public.current_user_role() = 'admin'
    )
  );

-- 11. Audit Logs
CREATE POLICY "Admin view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'admin');

CREATE POLICY "System insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

-- ============================================================================
-- PROCEDURES & TRIGGERS
-- ============================================================================

-- Otomatis buat profil saat ada registrasi auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, nik, address, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    COALESCE(NEW.raw_user_meta_data->>'nik', SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 16)),
    COALESCE(NEW.raw_user_meta_data->>'address', '-'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prosedur Verifikasi Pemeriksaan Terkendali Server-Side
CREATE OR REPLACE FUNCTION public.verify_examination(
  p_examination_id UUID,
  p_staff_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_exam RECORD;
  v_staff_role TEXT;
  v_details_count INT;
BEGIN
  -- Cek kewenangan staf
  SELECT role INTO v_staff_role FROM public.profiles WHERE id = p_staff_id;
  IF v_staff_role NOT IN ('staff', 'admin') THEN
    RAISE EXCEPTION 'Pengguna tidak memiliki kewenangan medis/staf untuk memverifikasi pemeriksaan.';
  END IF;

  -- Ambil data pemeriksaan
  SELECT * INTO v_exam FROM public.examinations WHERE id = p_examination_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pemeriksaan tidak ditemukan.';
  END IF;

  IF v_exam.status = 'verified' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Pemeriksaan sudah diverifikasi sebelumnya.');
  END IF;

  -- Validasi jumlah kriteria yang diisi
  SELECT count(*) INTO v_details_count FROM public.examination_details WHERE examination_id = p_examination_id;
  IF v_details_count < 6 THEN
    RAISE EXCEPTION 'Pemeriksaan belum memenuhi 6 kriteria lengkap. Ditemukan % kriteria.', v_details_count;
  END IF;

  -- Perbarui status pemeriksaan
  UPDATE public.examinations
  SET status = 'verified',
      verified_by = p_staff_id,
      verified_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_examination_id;

  -- Catat Audit Log
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, before_data, after_data, reason)
  VALUES (
    p_staff_id,
    'VERIFY_EXAMINATION',
    'examinations',
    p_examination_id::text,
    jsonb_build_object('status', v_exam.status),
    jsonb_build_object('status', 'verified', 'verified_by', p_staff_id),
    'Pemeriksaan balita divalidasi oleh petugas'
  );

  RETURN jsonb_build_object('success', true, 'examination_id', p_examination_id, 'status', 'verified');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
