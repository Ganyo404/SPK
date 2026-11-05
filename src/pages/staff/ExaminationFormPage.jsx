import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { childService } from '../../services/childService';
import { examinationService } from '../../services/examinationService';
import { spkService } from '../../services/spkService';
import { calculateAgeInMonths, getAgeGroupForMonths, getChildAgeGroup } from '../../lib/spk/ageGroups';
import {
  getBBScore,
  getTBScore,
  getLKScore,
  getImunisasiScore,
  getAsupanGiziScore,
  convertRawToStandardScores,
  OFFICIAL_CRITERIA_5,
  OFFICIAL_AHP_WEIGHTS
} from '../../lib/spk/scoringStandard';
import {
  Stethoscope,
  Baby,
  Calendar,
  Save,
  CheckCircle,
  AlertCircle,
  Scale,
  Ruler,
  Brain,
  Activity,
  Heart,
  ShieldAlert,
  Info,
  History,
  ChevronRight,
  TrendingUp,
  Search,
  X,
  ChevronDown,
  Check,
  UserCheck,
  Award,
  Utensils,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

const MONTH_OPTIONS = [
  { value: '01', name: 'Januari' },
  { value: '02', name: 'Februari' },
  { value: '03', name: 'Maret' },
  { value: '04', name: 'April' },
  { value: '05', name: 'Mei' },
  { value: '06', name: 'Juni' },
  { value: '07', name: 'Juli' },
  { value: '08', name: 'Agustus' },
  { value: '09', name: 'September' },
  { value: '10', name: 'Oktober' },
  { value: '11', name: 'November' },
  { value: '12', name: 'Desember' }
];

const PMBA_OPTIONS = [
  {
    score: 4,
    title: '4 Indikator (Sangat Baik / Ideal)',
    desc: 'ASI/MP-ASI 4 bintang, frekuensi cukup, dan higienis.',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300'
  },
  {
    score: 3,
    title: '3 Indikator (Cukup Baik)',
    desc: 'Asupan memadai, variasi pangan belum konsisten.',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-300'
  },
  {
    score: 2,
    title: '2 Indikator (Kurang)',
    desc: 'Variasi atau porsi makan belum mencukupi kebutuhan usia.',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300'
  },
  {
    score: 1,
    title: '≤ 1 Indikator (Defisit Berat)',
    desc: 'Asupan sangat minim atau tidak sesuai tahapan usia balita.',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300'
  }
];

function getImmunizationShortcuts(groupId = 4) {
  const grp = Number(groupId) || 4;
  if (grp === 1) {
    return [
      { label: 'Lengkap Target (6 dosis)', value: '6', score: 4, range: 'Target ideal: 6 dosis' },
      { label: 'Hampir Lengkap (5 dosis)', value: '5', score: 3, range: '5 dosis' },
      { label: 'Kurang (3 - 4 dosis)', value: '4', score: 2, range: '3 - 4 dosis' },
      { label: 'Sangat Kurang (0 - 2 dosis)', value: '1', score: 1, range: '0 - 2 dosis' }
    ];
  }
  if (grp === 2 || grp === 3) {
    return [
      { label: 'Lengkap Target (15 dosis)', value: '15', score: 4, range: 'Target ideal: 15 dosis' },
      { label: 'Hampir Lengkap (12 - 14 dosis)', value: '13', score: 3, range: '12 - 14 dosis' },
      { label: 'Kurang (8 - 11 dosis)', value: '10', score: 2, range: '8 - 11 dosis' },
      { label: 'Sangat Kurang (0 - 7 dosis)', value: '5', score: 1, range: '0 - 7 dosis' }
    ];
  }
  return [
    { label: 'Lengkap Target (17 dosis)', value: '17', score: 4, range: 'Target ideal: 17 dosis' },
    { label: 'Hampir Lengkap (13 - 16 dosis)', value: '15', score: 3, range: '13 - 16 dosis' },
    { label: 'Kurang (9 - 12 dosis)', value: '11', score: 2, range: '9 - 12 dosis' },
    { label: 'Sangat Kurang (0 - 8 dosis)', value: '5', score: 1, range: '0 - 8 dosis' }
  ];
}

export function ExaminationFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const childIdParam = searchParams.get('childId');

  const { user, profile } = useAuth();

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(childIdParam || '');
  const [childSearchTerm, setChildSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const [selectedMonth, setSelectedMonth] = useState('10');
  const [selectedYear, setSelectedYear] = useState('2026');

  const [previousExam, setPreviousExam] = useState(null);
  const [notes, setNotes] = useState('');

  // Periode SPK gabungan (YYYY-MM)
  const periodCode = `${(selectedYear || '2026').trim()}-${selectedMonth}`;

  // State Form Kriteria Riil Antropometri & Gizi (5 Kriteria Sesuai Standar Excel & Permenkes)
  const [values, setValues] = useState({
    bb: '',         // Berat Badan (kg) -> K1
    tb: '',         // Tinggi Badan (cm) -> K2
    lk: '',         // Lingkar Kepala (cm) -> K3
    imunisasi: '17', // Riwayat Imunisasi (Dosis, 0 - 17) -> K4
    gizi: '4',      // Asupan Gizi & PMBA (1 - 4) -> K5
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      const { data } = await childService.getAllChildren();
      if (data) {
        setChildren(data);
        if (childIdParam) {
          const match = data.find(c => c.id === childIdParam);
          if (match) {
            setSelectedChildId(match.id);
            setChildSearchTerm(match.name);
          }
        } else if (!selectedChildId && data.length > 0) {
          setSelectedChildId(data[0].id);
          setChildSearchTerm(data[0].name);
        }
      }
    }
    loadInitial();
  }, [childIdParam]);

  // Tutup dropdown pencarian jika klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadPreviousExam() {
      if (selectedChildId) {
        const { data } = await examinationService.getLatestVerifiedExamination(selectedChildId);
        setPreviousExam(data || null);
      } else {
        setPreviousExam(null);
      }
    }
    loadPreviousExam();
  }, [selectedChildId]);

  const selectedChild = children.find(c => c.id === selectedChildId);
  const childAgeMonths = selectedChild?.date_of_birth
    ? calculateAgeInMonths(selectedChild.date_of_birth, periodCode)
    : 10;
  const childAgeGroupInfo = selectedChild?.date_of_birth
    ? getChildAgeGroup(selectedChild.date_of_birth, periodCode)
    : { groupId: 4, groupName: 'Kelompok 4 (9 - 11 bulan)', rangeLabel: '9 - 11 bulan' };
  const childSex = selectedChild?.sex || 'L';

  // Live Conversion Skor 1 - 4 WHO / Permenkes
  const liveBB = values.bb !== '' && !isNaN(Number(values.bb))
    ? getBBScore(values.bb, childAgeGroupInfo.groupId, childSex)
    : null;

  const liveTB = values.tb !== '' && !isNaN(Number(values.tb))
    ? getTBScore(values.tb, childAgeGroupInfo.groupId, childSex)
    : null;

  const liveLK = values.lk !== '' && !isNaN(Number(values.lk))
    ? getLKScore(values.lk, childAgeGroupInfo.groupId, childSex)
    : null;

  const liveImun = values.imunisasi !== '' && !isNaN(Number(values.imunisasi))
    ? getImunisasiScore(values.imunisasi, childAgeGroupInfo.groupId)
    : null;

  const liveGizi = values.gizi !== '' && !isNaN(Number(values.gizi))
    ? getAsupanGiziScore(values.gizi)
    : null;

  // Ringkasan standarisasi & status flag
  const isAllFilled = Boolean(
    values.bb && !isNaN(Number(values.bb)) &&
    values.tb && !isNaN(Number(values.tb)) &&
    values.lk && !isNaN(Number(values.lk)) &&
    values.imunisasi !== '' &&
    values.gizi !== ''
  );

  const liveStandardization = isAllFilled
    ? convertRawToStandardScores(
        {
          C1: values.bb,
          C2: values.tb,
          C3: values.lk,
          C5: values.imunisasi,
          gizi: values.gizi
        },
        childAgeGroupInfo.groupId,
        childSex
      )
    : null;

  // Filter balita untuk autocomplete search
  const matchingChildren = children.filter((c) => {
    const term = childSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      c.name.toLowerCase().includes(term) ||
      (c.parent_name && c.parent_name.toLowerCase().includes(term)) ||
      (c.posyandu_name && c.posyandu_name.toLowerCase().includes(term)) ||
      (c.date_of_birth && c.date_of_birth.includes(term))
    );
  });

  const handleSelectChild = (child) => {
    setSelectedChildId(child.id);
    setChildSearchTerm(child.name);
    setIsSearchOpen(false);
  };

  const handleClearSearch = () => {
    setSelectedChildId('');
    setChildSearchTerm('');
    setIsSearchOpen(true);
  };

  const handleInputChange = (field, val) => {
    setValues(prev => ({ ...prev, [field]: val }));
  };

  const validateAllCriteria = () => {
    const bb = Number(values.bb);
    if (isNaN(bb) || values.bb === '' || bb < 2.0 || bb > 35.0) {
      return 'Nilai Berat Badan (BB) wajib diisi antara 2.0 s/d 35.0 kg.';
    }

    const tb = Number(values.tb);
    if (isNaN(tb) || values.tb === '' || tb < 40.0 || tb > 135.0) {
      return 'Nilai Tinggi/Panjang Badan (TB) wajib diisi antara 40.0 s/d 135.0 cm.';
    }

    const lk = Number(values.lk);
    if (isNaN(lk) || values.lk === '' || lk < 30.0 || lk > 65.0) {
      return 'Nilai Lingkar Kepala (LK) wajib diisi antara 30.0 s/d 65.0 cm.';
    }

    const imun = Number(values.imunisasi);
    if (isNaN(imun) || values.imunisasi === '' || imun < 0 || imun > 17) {
      return 'Jumlah Dosis Imunisasi wajib diisi antara 0 s/d 17 dosis.';
    }

    const gizi = Number(values.gizi);
    if (isNaN(gizi) || gizi < 1 || gizi > 4) {
      return 'Pilih salah satu tingkat Asupan Gizi & PMBA (Skor 1 - 4).';
    }

    return null;
  };

  const getPayload = () => {
    const bb = Number(values.bb);
    const tb = Number(values.tb);
    const lk = Number(values.lk);
    const imun = Number(values.imunisasi);
    const gizi = Number(values.gizi);

    const std = convertRawToStandardScores(
      { C1: bb, C2: tb, C3: lk, C5: imun, gizi },
      childAgeGroupInfo.groupId,
      childSex
    );

    return {
      childId: selectedChildId,
      periodCode,
      notes,
      values: {
        // Raw values
        C1: bb,
        C2: tb,
        C3: lk,
        C5: imun,
        // Standarisasi Skor 5 Kriteria Baku (1 s/d 4) Sesuai Excel
        K1: std.scores.K1,
        K2: std.scores.K2,
        K3: std.scores.K3,
        K4: std.scores.K4,
        K5: std.scores.K5,
        raw_bb: bb,
        raw_tb: tb,
        raw_lk: lk,
        raw_imun: imun,
        raw_gizi: gizi
      },
      recordedBy: user?.id || 'u-staff-1',
      recordedByName: profile?.full_name || 'dr. Dewi Anggraini, Sp.A'
    };
  };

  // Simpan sebagai draf
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedChildId) {
      setError('Silakan cari dan pilih balita yang diperiksa terlebih dahulu.');
      return;
    }

    if (!selectedYear || !/^\d{4}$/.test(selectedYear.trim())) {
      setError('Tahun pemeriksaan wajib diisi 4 digit angka (contoh: 2026).');
      return;
    }

    const validationErr = validateAllCriteria();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);
    try {
      const payload = getPayload();
      const res = await examinationService.saveExaminationDraft(payload);

      if (res.error) {
        setError(res.error.message || 'Gagal menyimpan draf pemeriksaan.');
      } else {
        setSuccess('Draf pemeriksaan dan standarisasi skor (1-4) berhasil disimpan.');
        setTimeout(() => {
          navigate('/staff/examinations/pending');
        }, 1000);
      }
    } catch (err) {
      setError('Terjadi kendala saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  // Verifikasi langsung dan hitung SPK (AHP + SAW)
  const handleVerifyAndCalculate = async () => {
    setError('');
    setSuccess('');

    if (!selectedChildId) {
      setError('Silakan cari dan pilih balita yang diperiksa terlebih dahulu.');
      return;
    }

    if (!selectedYear || !/^\d{4}$/.test(selectedYear.trim())) {
      setError('Tahun pemeriksaan wajib diisi 4 digit angka (contoh: 2026).');
      return;
    }

    const validationErr = validateAllCriteria();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setVerifying(true);
    try {
      // 1. Simpan pemeriksaan
      const payload = getPayload();
      const draftRes = await examinationService.saveExaminationDraft(payload);

      if (draftRes.error) {
        setError(draftRes.error.message);
        setVerifying(false);
        return;
      }

      // 2. Verifikasi status menjadi 'verified'
      await examinationService.verifyExamination(
        draftRes.data.id,
        user?.id || 'u-staff-1',
        profile?.full_name || 'dr. Dewi Anggraini, Sp.A'
      );

      // 3. Jalankan kalkulasi AHP + SAW untuk cohort balita ini (Gender balita & All)
      const ageGroupInfo = getChildAgeGroup(selectedChild?.date_of_birth, periodCode);
      
      await spkService.runCalculationForCohort({
        ageGroupId: ageGroupInfo.groupId,
        periodCode,
        gender: selectedChild?.sex || 'all',
        createdBy: profile?.full_name || 'dr. Dewi Anggraini, Sp.A'
      });

      await spkService.runCalculationForCohort({
        ageGroupId: ageGroupInfo.groupId,
        periodCode,
        gender: 'all',
        createdBy: profile?.full_name || 'dr. Dewi Anggraini, Sp.A'
      });

      setSuccess(`Pemeriksaan terverifikasi! Nilai dikonversi ke skor ideal (1-4) dan peringkat SAW untuk ${ageGroupInfo.groupName} diperbarui.`);
      setTimeout(() => {
        navigate(`/staff/children/${selectedChildId}`);
      }, 1200);
    } catch (err) {
      setError('Terjadi kendala saat memproses verifikasi dan perhitungan SPK.');
    } finally {
      setVerifying(false);
    }
  };

  const renderScorePill = (score, label) => {
    if (!score) return null;
    let bg = 'bg-rose-50 text-rose-700 border-rose-200';
    let dot = 'bg-rose-500';
    if (score === 4) {
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dot = 'bg-emerald-500';
    } else if (score === 3) {
      bg = 'bg-teal-50 text-teal-800 border-teal-200';
      dot = 'bg-teal-500';
    } else if (score === 2) {
      bg = 'bg-amber-50 text-amber-800 border-amber-200';
      dot = 'bg-amber-500';
    }

    return (
      <div className={`mt-2 p-2 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 ${bg}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
          <span className="truncate">{label}</span>
        </div>
        <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-white border border-current shadow-2xs flex-shrink-0">
          Skor: {score}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-teal-600" />
          <span>Pemeriksaan Balita</span>
        </h1>
        <p className="text-sm text-slate-500">
          Pencatatan data antropometri fisik dan riwayat kesehatan balita
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSaveDraft} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Pilih Balita & Periode */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-6 border-b border-slate-100">
          {/* 1. Pilih Balita via Pencarian Nama / Orang Tua */}
          <div ref={searchContainerRef} className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-teal-600" />
                <span>Pencarian Balita yang Diperiksa</span>
              </label>
              {selectedChild && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                >
                  Ganti Balita
                </button>
              )}
            </div>

            {/* Input Pencarian */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={childSearchTerm}
                onChange={(e) => {
                  setChildSearchTerm(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Ketik nama balita atau orang tua untuk mencari..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden transition-all"
              />
              {childSearchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Hasil Pencarian Balita */}
            {isSearchOpen && (
              <div className="absolute z-30 mt-1.5 w-full bg-white rounded-2xl border border-slate-200 shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-100">
                {matchingChildren.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Tidak ditemukan balita dengan nama/kata kunci "<strong>{childSearchTerm}</strong>"
                  </div>
                ) : (
                  matchingChildren.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectChild(c)}
                      className={`p-3 hover:bg-teal-50/80 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                        c.id === selectedChildId ? 'bg-teal-50/60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            c.sex === 'P' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {c.sex}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            Lahir: {c.date_of_birth} • Orang Tua: {c.parent_name || 'Ibu'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 flex-shrink-0">
                        Pilih
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Ringkasan Balita yang Terpilih */}
            {selectedChild && (
              <div className="mt-2 p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between text-xs text-teal-950">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  <div className="truncate">
                    <strong className="text-teal-900">{selectedChild.name}</strong>
                    <span className="text-teal-700 ml-1.5 font-normal">
                      ({selectedChild.sex === 'P' ? 'Perempuan' : 'Laki-Laki'}, {childAgeMonths} Bulan • {childAgeGroupInfo.groupName})
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-teal-800 font-semibold flex-shrink-0">
                  {selectedChild.posyandu_name || 'Posyandu Mawar Indah'}
                </span>
              </div>
            )}
          </div>

          {/* 2. Periode Pemeriksaan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Periode Pemeriksaan</span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Dropbox Bulan */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bulan
                </label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden transition-all cursor-pointer"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Input Tahun */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tahun
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="2000"
                    max="2099"
                    required
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    placeholder="Contoh: 2026"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-mono font-bold text-slate-800 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Badge Preview Kode Periode SPK */}
            <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Kode Periode SPK:</span>
                <strong className="font-mono text-xs text-teal-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs font-bold">
                  {periodCode}
                </strong>
              </span>
              <span className="font-medium text-slate-700 text-xs">
                {MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.name} {selectedYear}
              </span>
            </div>
          </div>
        </div>

        {/* Banner Riwayat Kunjungan Bulan Sebelumnya */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Pemeriksaan Terakhir
                </h4>
                <p className="text-xs text-slate-500">
                  Data rujukan kunjungan balita sebelumnya
                </p>
              </div>
            </div>

            {selectedChildId && (
              <button
                type="button"
                onClick={() => navigate(`/staff/children/${selectedChildId}`)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Lihat Riwayat Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {previousExam ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block text-[11px]">Periode</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {previousExam.period_code}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  Tgl: {previousExam.examined_at?.split('T')[0]}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-600 block text-[11px] font-medium">BB Bulan Lalu</span>
                <span className="font-bold text-slate-900 text-base">
                  {previousExam.values?.C1 ?? previousExam.raw_values?.BB ?? '-'} <span className="text-xs font-normal text-slate-500">kg</span>
                </span>
                {values.bb && previousExam.values?.C1 && (
                  <span className={`block text-[10px] font-bold mt-0.5 ${
                    Number(values.bb) >= Number(previousExam.values.C1) ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {Number(values.bb) >= Number(previousExam.values.C1)
                      ? `▲ +${(Number(values.bb) - Number(previousExam.values.C1)).toFixed(2)} kg`
                      : `▼ ${(Number(values.bb) - Number(previousExam.values.C1)).toFixed(2)} kg`}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-600 block text-[11px] font-medium">TB Bulan Lalu</span>
                <span className="font-bold text-slate-900 text-base">
                  {previousExam.values?.C2 ?? previousExam.raw_values?.TB ?? '-'} <span className="text-xs font-normal text-slate-500">cm</span>
                </span>
                {values.tb && previousExam.values?.C2 && (
                  <span className="block text-[10px] font-bold text-teal-600 mt-0.5">
                    {Number(values.tb) >= Number(previousExam.values.C2)
                      ? `▲ +${(Number(values.tb) - Number(previousExam.values.C2)).toFixed(1)} cm`
                      : `${(Number(values.tb) - Number(previousExam.values.C2)).toFixed(1)} cm`}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-600 block text-[11px] font-medium">LK Bulan Lalu</span>
                <span className="font-bold text-slate-900 text-base">
                  {previousExam.values?.C3 ?? previousExam.raw_values?.LK ?? '-'} <span className="text-xs font-normal text-slate-500">cm</span>
                </span>
                <span className="block text-[10px] font-medium text-slate-400 mt-0.5">
                  Status: {previousExam.status_flag || 'Normal'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-500 italic">
              Belum ada riwayat pemeriksaan fisik terverifikasi sebelumnya.
            </div>
          )}
        </div>

        {/* Section 1: Pengukuran Antropometri Fisik Balita (K1 - K3) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-600" />
                <span>1. Pengukuran Fisik</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ambang batas dihitung untuk usia {childAgeMonths} bln ({childAgeGroupInfo.rangeLabel}) & jenis kelamin {childSex === 'P' ? 'Perempuan' : 'Laki-Laki'}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
              Standar Permenkes & WHO
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* K1: Berat Badan menurut Umur */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-teal-600" />
                    <span>K1. Berat Badan (BB/U)</span>
                  </span>
                  <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-100/60 px-1.5 py-0.5 rounded">
                    Bobot 12.28%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    required
                    placeholder="Contoh: 8.5"
                    value={values.bb}
                    onChange={(e) => handleInputChange('bb', e.target.value)}
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:border-teal-600 outline-hidden"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">kg</span>
                </div>
              </div>
              {renderScorePill(liveBB?.score, liveBB?.label)}
            </div>

            {/* K2: Tinggi / Panjang Badan menurut Umur */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-blue-600" />
                    <span>K2. Panjang/Tinggi (PB/TB)</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-100/60 px-1.5 py-0.5 rounded">
                    Bobot 12.28%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Contoh: 72.0"
                    value={values.tb}
                    onChange={(e) => handleInputChange('tb', e.target.value)}
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:border-teal-600 outline-hidden"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">cm</span>
                </div>
              </div>
              {renderScorePill(liveTB?.score, liveTB?.label)}
            </div>

            {/* K3: Lingkar Kepala menurut Umur */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-purple-600" />
                    <span>K3. Lingkar Kepala (LK/U)</span>
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 uppercase bg-purple-100/60 px-1.5 py-0.5 rounded">
                    Bobot 8.47%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Contoh: 45.0"
                    value={values.lk}
                    onChange={(e) => handleInputChange('lk', e.target.value)}
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:border-teal-600 outline-hidden"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">cm</span>
                </div>
              </div>
              {renderScorePill(liveLK?.score, liveLK?.label)}
            </div>
          </div>
        </div>

        {/* Section 2: K4 - Riwayat Dosis Imunisasi */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>2. Riwayat Dosis Imunisasi</span>
              </h3>
              <p className="text-xs text-slate-500">
                Jumlah dosis vaksin diterima balita • Target {childAgeGroupInfo.groupId === 1 ? '6' : (childAgeGroupInfo.groupId <= 3 ? '15' : '17')} dosis ({childAgeGroupInfo.groupName || childAgeGroupInfo.name || 'Usia Saat Ini'})
              </p>
            </div>
          </div>

          {/* Pilihan Cepat Dosis Imunisasi Sesuai Kelompok Usia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {getImmunizationShortcuts(childAgeGroupInfo.groupId).map((item) => {
              const isSelected = values.imunisasi === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleInputChange('imunisasi', item.value)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{item.label}</span>
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      item.score === 4 ? 'bg-emerald-100 text-emerald-800' :
                      item.score === 3 ? 'bg-teal-100 text-teal-800' :
                      item.score === 2 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      Skor: {item.score}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Acuan: <strong>{item.range}</strong>
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-semibold text-slate-600">Atau input manual (0–17):</span>
            <div className="relative w-36">
              <input
                type="number"
                min="0"
                max="17"
                required
                placeholder="0 - 17"
                value={values.imunisasi}
                onChange={(e) => handleInputChange('imunisasi', e.target.value)}
                className="w-full p-2 pr-12 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:border-teal-600 outline-hidden"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">dosis</span>
            </div>
            {renderScorePill(liveImun?.score, liveImun?.label)}
          </div>
        </div>

        {/* Section 3: K5 - Asupan Gizi & PMBA */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Utensils className="w-5 h-5 text-teal-600" />
                <span>3. Asupan Gizi & Pola Makan (PMBA)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Praktik pemberian makan bayi dan anak sesuai pedoman gizi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PMBA_OPTIONS.map((opt) => {
              const isSelected = Number(values.gizi) === opt.score;
              return (
                <div
                  key={opt.score}
                  onClick={() => handleInputChange('gizi', String(opt.score))}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{opt.title}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${opt.badgeClass}`}>
                      Skor: {opt.score}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{opt.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Live Standarisasi Hasil Skoring */}
        {isAllFilled && liveStandardization && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
              <div>
                <span className="font-bold text-sm text-slate-900">Hasil Standarisasi Kriteria (Skala 1–4)</span>
                <p className="text-xs text-slate-500">Konversi nilai riil menjadi skor ordinal untuk kriteria SAW</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                liveStandardization.statusFlag === 'Normal'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                Status: {liveStandardization.statusFlag}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-teal-700 block font-semibold">K1: Berat Badan</span>
                <span className="text-lg font-bold text-slate-900 my-0.5 block">Skor {liveStandardization.scores.K1}</span>
                <span className="text-[10px] text-slate-500 block truncate">{liveStandardization.labels.K1}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-blue-700 block font-semibold">K2: Tinggi Badan</span>
                <span className="text-lg font-bold text-slate-900 my-0.5 block">Skor {liveStandardization.scores.K2}</span>
                <span className="text-[10px] text-slate-500 block truncate">{liveStandardization.labels.K2}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-purple-700 block font-semibold">K3: Lingkar Kepala</span>
                <span className="text-lg font-bold text-slate-900 my-0.5 block">Skor {liveStandardization.scores.K3}</span>
                <span className="text-[10px] text-slate-500 block truncate">{liveStandardization.labels.K3}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-emerald-700 block font-semibold">K4: Imunisasi</span>
                <span className="text-lg font-bold text-slate-900 my-0.5 block">Skor {liveStandardization.scores.K4}</span>
                <span className="text-[10px] text-slate-500 block truncate">{liveStandardization.labels.K4}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-amber-700 block font-semibold">K5: Asupan Gizi</span>
                <span className="text-lg font-bold text-slate-900 my-0.5 block">Skor {liveStandardization.scores.K5}</span>
                <span className="text-[10px] text-slate-500 block truncate">{liveStandardization.labels.K5}</span>
              </div>
            </div>

            {liveStandardization.statusFlag === 'Perlu Tinjau' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Perhatian: Terdapat skor &le; 2 pada indikator fisik atau asupan, disarankan evaluasi berkala oleh tenaga kesehatan.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Catatan Petugas */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Catatan Petugas
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan kondisi khusus balita atau anjuran untuk orang tua (opsional)..."
            className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:border-teal-600 outline-hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="submit"
            disabled={loading || verifying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Menyimpan...' : 'Simpan sebagai Draf'}</span>
          </button>

          <button
            type="button"
            onClick={handleVerifyAndCalculate}
            disabled={loading || verifying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{verifying ? 'Memverifikasi & Menghitung SPK...' : 'Verifikasi & Hitung SAW'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
