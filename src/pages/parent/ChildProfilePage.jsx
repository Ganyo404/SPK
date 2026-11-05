import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { childService } from '../../services/childService';
import { examinationService } from '../../services/examinationService';
import { calculateAgeInMonths, getAgeGroupForMonths } from '../../lib/spk/ageGroups';
import { evaluateHealthStatus, generateEducationalRecommendations, CLINICAL_DISCLAIMER } from '../../lib/health/statusRules';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { LoadingState } from '../../components/ui/LoadingState';
import {
  Baby,
  Calendar,
  Building2,
  Scale,
  Ruler,
  Brain,
  Activity,
  ShieldAlert,
  Clock,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  Heart,
  CheckCircle2,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Layers,
  Filter,
  ShieldCheck,
  Utensils
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Konfigurasi 5 Kriteria Baku SPK (Permenkes No. 2/2020 & Standar WHO Sesuai Excel)
const CRITERIA_CONFIG = [
  {
    key: 'K1',
    code: 'K1',
    dataKey: 'beratBadan',
    label: 'Berat Badan (BB/U)',
    unit: 'kg',
    color: '#0d9488', // teal-600
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    icon: Scale,
    category: 'antropometri',
    yAxisId: 'antropo-left',
    type: 'benefit',
    description: 'Bobot AHP: 12.28% • Massa tubuh balita'
  },
  {
    key: 'K2',
    code: 'K2',
    dataKey: 'tinggiBadan',
    label: 'Tinggi Badan (PB/TB)',
    unit: 'cm',
    color: '#2563eb', // blue-600
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: Ruler,
    category: 'antropometri',
    yAxisId: 'antropo-right',
    type: 'benefit',
    description: 'Bobot AHP: 12.28% • Pertumbuhan linier balita'
  },
  {
    key: 'K3',
    code: 'K3',
    dataKey: 'lingkarKepala',
    label: 'Lingkar Kepala (LK/U)',
    unit: 'cm',
    color: '#7c3aed', // violet-600
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: Brain,
    category: 'antropometri',
    yAxisId: 'antropo-right',
    type: 'benefit',
    description: 'Bobot AHP: 8.47% • Lingkar kepala & volume otak'
  },
  {
    key: 'K4',
    code: 'K4',
    dataKey: 'imunisasi',
    label: 'Kelengkapan Imunisasi',
    unit: '%',
    color: '#0891b2', // cyan-600
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    icon: ShieldCheck,
    category: 'kesehatan',
    yAxisId: 'health-left',
    type: 'benefit',
    description: 'Bobot AHP: 42.37% • Riwayat vaksinasi tepat waktu'
  },
  {
    key: 'K5',
    code: 'K5',
    dataKey: 'asupanGizi',
    label: 'Asupan Gizi (PMBA)',
    unit: 'Skor 1-4',
    color: '#ea580c', // orange-600
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    icon: Utensils,
    category: 'kesehatan',
    yAxisId: 'health-right',
    type: 'benefit',
    description: 'Bobot AHP: 24.59% • ASI, MP-ASI 4 bintang & higienitas'
  }
];

function UnifiedChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 text-xs space-y-2 min-w-[210px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <span className="font-semibold text-slate-500 text-[11px]">Periode Kunjungan</span>
          <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">{label}</span>
        </div>
        <div className="space-y-1">
          {payload.map((item, idx) => {
            const config = CRITERIA_CONFIG.find(c => c.dataKey === item.dataKey);
            return (
              <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium" style={{ color: item.color }}>
                  <span className="w-2.5 h-2.5 rounded-full inline-block shadow-2xs" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {item.value != null ? `${item.value} ${config?.unit || ''}` : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

export function ChildProfilePage() {
  const { childId } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamDetail, setSelectedExamDetail] = useState(null);

  // Tab & Filter Garis Grafik 5 Kriteria Baku
  const [activeChartTab, setActiveChartTab] = useState('all'); // 'all', 'antropometri', 'kesehatan'
  const [activeMetrics, setActiveMetrics] = useState({
    K1: true,
    K2: true,
    K3: true,
    K4: true,
    K5: true,
  });

  const toggleMetric = (key) => {
    setActiveMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [childRes, examRes] = await Promise.all([
        childService.getChildById(childId),
        examinationService.getExaminationsByChild(childId)
      ]);

      if (childRes.data) setChild(childRes.data);
      if (examRes.data) setExaminations(examRes.data);
      setLoading(false);
    }
    fetchData();
  }, [childId]);

  if (loading) {
    return <LoadingState text="Memuat profil perkembangan balita..." />;
  }

  if (!child) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Data balita tidak ditemukan.</p>
        <button
          onClick={() => navigate('/parent')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const verifiedExams = examinations.filter(e => e.status === 'verified');
  const latestVerifiedExam = verifiedExams[0] || null;
  const isPendingRegistration = child.registration_status === 'pending_registration';

  // Usia balita
  const calculateAge = (dobString) => {
    const dob = new Date(dobString);
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    const totalMonths = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    return `${years > 0 ? `${years} Tahun ` : ''}${months} Bulan (${totalMonths} bln)`;
  };

  // Evaluasi Status Kesehatan & Rekomendasi
  const healthEvaluation = latestVerifiedExam
    ? evaluateHealthStatus(latestVerifiedExam, child)
    : null;

  const recommendations = healthEvaluation
    ? generateEducationalRecommendations(healthEvaluation.status, latestVerifiedExam)
    : [];

  // Data Grafik Pertumbuhan Fisik 5 Kriteria Baku (kronologis tanggal lama ke baru)
  const chartData = [...verifiedExams]
    .sort((a, b) => new Date(a.examined_at) - new Date(b.examined_at))
    .map(e => ({
      date: e.period_code || e.examined_at.split('T')[0],
      beratBadan: e.values?.C1 ?? e.raw_values?.BB ?? (e.values?.raw_bb != null ? Number(e.values.raw_bb) : null),
      tinggiBadan: e.values?.C2 ?? e.raw_values?.TB ?? (e.values?.raw_tb != null ? Number(e.values.raw_tb) : null),
      lingkarKepala: e.values?.C3 ?? e.raw_values?.LK ?? (e.values?.raw_lk != null ? Number(e.values.raw_lk) : null),
      imunisasi: e.values?.C5 ?? e.raw_values?.Imunisasi ?? (e.values?.raw_imun != null ? Number(e.values.raw_imun) : (e.values?.K4 ? e.values.K4 * 25 : 100)),
      asupanGizi: e.values?.K5 ?? e.standard_scores?.K5 ?? e.raw_values?.Gizi ?? (e.values?.gizi != null ? Number(e.values.gizi) : 4),
    }));

  const previousVerifiedExam = verifiedExams[1] || null;

  const getMetricDelta = (critKey, unit) => {
    if (!latestVerifiedExam || !previousVerifiedExam) return null;
    const getVal = (exam) => {
      if (!exam?.values) return null;
      if (critKey === 'K1') return exam.values.C1 ?? exam.raw_values?.BB ?? exam.values.raw_bb;
      if (critKey === 'K2') return exam.values.C2 ?? exam.raw_values?.TB ?? exam.values.raw_tb;
      if (critKey === 'K3') return exam.values.C3 ?? exam.raw_values?.LK ?? exam.values.raw_lk;
      if (critKey === 'K4') return exam.values.C5 ?? exam.raw_values?.Imunisasi ?? exam.values.raw_imun ?? 100;
      if (critKey === 'K5') return exam.values.K5 ?? exam.standard_scores?.K5 ?? exam.values.raw_gizi ?? 4;
      return exam.values[critKey];
    };
    const curr = getVal(latestVerifiedExam);
    const prev = getVal(previousVerifiedExam);
    if (curr == null || prev == null) return null;
    const diff = Number((Number(curr) - Number(prev)).toFixed(2));
    if (diff === 0) return { text: 'Stabil', type: 'neutral', diff: 0 };
    const sign = diff > 0 ? '+' : '';
    const isPositive = diff > 0;
    return {
      text: `${sign}${diff} ${unit}`,
      type: isPositive ? 'positive' : 'negative',
      diff
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Halaman Sebelumnya</span>
      </button>

      {/* Bagian A: Kartu Identitas Balita */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0 ${
                child.sex === 'P'
                  ? 'bg-pink-50 text-pink-600 border border-pink-100'
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
              }`}
            >
              <Baby className="w-10 h-10" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {child.name}
                </h1>
                <StatusBadge status={child.registration_status} />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-3">
                <span className="font-medium text-slate-700">
                  {child.sex === 'P' ? 'Perempuan' : 'Laki-Laki'}
                </span>
                <span>•</span>
                <span>Usia: {calculateAge(child.date_of_birth)}</span>
                <span>•</span>
                <span>Tgl Lahir: {child.date_of_birth}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs text-slate-600 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>{child.posyandu_name || 'Posyandu Mawar Indah'}</span>
            </div>
            <div className="text-slate-400">
              ID Balita: <span className="font-mono">{child.id}</span>
            </div>
          </div>
        </div>

        {/* Notifikasi jika status masih pending_registration */}
        {isPendingRegistration && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-sm">
            <Clock className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Pendaftaran Anak Menunggu Verifikasi di Posyandu</p>
              <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                Data pendaftaran telah tersimpan di sistem. Silakan hadir pada jadwal penimbangan Posyandu berikutnya
                agar petugas kesehatan dapat memeriksa fisik anak dan memverifikasi data pendaftaran.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Jika ada pemeriksaan terverifikasi */}
      {latestVerifiedExam ? (
        <>
          {/* Bagian B: Ringkasan Pemeriksaan Terbaru & Status Kesehatan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kartu Status Skrining & SPK */}
            <div className="lg:col-span-1 bg-gradient-to-br from-teal-700 to-teal-900 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
                  Status Skrining Posyandu
                </span>
                <div className="mt-2 flex items-center gap-3">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {healthEvaluation.status}
                  </h3>
                </div>
                <p className="mt-2 text-xs text-teal-100/90 leading-relaxed">
                  {healthEvaluation.reasons[0] || 'Kondisi tumbuh kembang terpantau baik pada kunjungan terakhir.'}
                </p>

                {/* Skor SPK & Ranking Cohort */}
                <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <div className="flex items-center justify-between text-xs text-teal-100 mb-1">
                    <span>Skor Preferensi SPK (SAW):</span>
                    <span className="font-mono font-bold text-white text-base">
                      {latestVerifiedExam.saw_score != null ? latestVerifiedExam.saw_score.toFixed(3) : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-teal-100">
                    <span>
                      Peringkat {latestVerifiedExam.age_group_name || `Kelompok Umur (${getAgeGroupForMonths(calculateAgeInMonths(child.date_of_birth, latestVerifiedExam.period_code)).rangeLabel})`}:
                    </span>
                    <span className="font-bold text-white text-sm">
                      {latestVerifiedExam.saw_rank ? `Peringkat #${latestVerifiedExam.saw_rank}` : 'Tercatat'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-teal-600/50 text-[11px] text-teal-200">
                <p>Periode: <strong>{latestVerifiedExam.period_code}</strong></p>
                <p className="mt-0.5">Petugas: {latestVerifiedExam.recorded_by_name || 'Petugas Posyandu'}</p>
              </div>
            </div>

            {/* Nilai 5 Kriteria Baku Kunjungan Terakhir */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Hasil Pengukuran 5 Kriteria Terakhir
                  </h3>
                  <p className="text-xs text-slate-500">Pemeriksaan tanggal {latestVerifiedExam.examined_at.split('T')[0]}</p>
                </div>
                <StatusBadge status="verified" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Scale className="w-3.5 h-3.5 text-teal-600" />
                    <span>K1. Berat Badan (BB/U)</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVerifiedExam.values?.C1 ?? latestVerifiedExam.raw_values?.BB ?? '-'} <span className="text-xs font-normal text-slate-500">kg</span>
                  </p>
                  <span className="text-[10px] text-teal-700 font-semibold">
                    Skor: {latestVerifiedExam.values?.K1 ?? latestVerifiedExam.standard_scores?.K1 ?? 4}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Ruler className="w-3.5 h-3.5 text-blue-600" />
                    <span>K2. Tinggi Badan (PB/TB)</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVerifiedExam.values?.C2 ?? latestVerifiedExam.raw_values?.TB ?? '-'} <span className="text-xs font-normal text-slate-500">cm</span>
                  </p>
                  <span className="text-[10px] text-blue-700 font-semibold">
                    Skor: {latestVerifiedExam.values?.K2 ?? latestVerifiedExam.standard_scores?.K2 ?? 4}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Brain className="w-3.5 h-3.5 text-purple-600" />
                    <span>K3. Lingkar Kepala (LK/U)</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVerifiedExam.values?.C3 ?? latestVerifiedExam.raw_values?.LK ?? '-'} <span className="text-xs font-normal text-slate-500">cm</span>
                  </p>
                  <span className="text-[10px] text-purple-700 font-semibold">
                    Skor: {latestVerifiedExam.values?.K3 ?? latestVerifiedExam.standard_scores?.K3 ?? 4}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                    <span>K4. Kelengkapan Imunisasi</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVerifiedExam.values?.C5 ?? latestVerifiedExam.raw_values?.Imunisasi ?? 100} <span className="text-xs font-normal text-slate-500">%</span>
                  </p>
                  <span className="text-[10px] text-cyan-700 font-semibold">
                    Skor: {latestVerifiedExam.values?.K4 ?? latestVerifiedExam.standard_scores?.K4 ?? 4}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Utensils className="w-3.5 h-3.5 text-amber-600" />
                    <span>K5. Asupan Gizi & PMBA</span>
                  </div>
                  <p className="text-lg font-bold text-amber-900">
                    Skor {latestVerifiedExam.values?.K5 ?? latestVerifiedExam.standard_scores?.K5 ?? 4} <span className="text-xs font-normal text-slate-500">/ 4 Indikator Baku</span>
                  </p>
                  <span className="text-[10px] text-amber-700 font-semibold">
                    Standar PMBA Kemenkes RI & WHO
                  </span>
                </div>
              </div>

              {latestVerifiedExam.notes && (
                <div className="mt-4 p-3 rounded-xl bg-teal-50/50 border border-teal-100 text-xs text-teal-900">
                  <span className="font-bold">Catatan Petugas Posyandu:</span> {latestVerifiedExam.notes}
                </div>
              )}
            </div>
          </div>

          {/* Bagian D: Grafik Perkembangan Balita (5 Kriteria Baku SPK) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            {/* Header Bagian D */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 inline-flex">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Grafik Perkembangan Balita (5 Kriteria SPK)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Kurva perkembangan lengkap 5 parameter: Berat Badan (K1), Tinggi Badan (K2), Lingkar Kepala (K3), Imunisasi (K4), dan Asupan Gizi & PMBA (K5).
                </p>
              </div>

              {/* View Tab Selector */}
              <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start md:self-center">
                <button
                  type="button"
                  onClick={() => setActiveChartTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeChartTab === 'all'
                      ? 'bg-white text-teal-800 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua 5 Kriteria
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab('antropometri')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeChartTab === 'antropometri'
                      ? 'bg-white text-teal-800 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fisik (K1–K3)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab('kesehatan')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeChartTab === 'kesehatan'
                      ? 'bg-white text-teal-800 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Imunisasi & Gizi (K4–K5)
                </button>
              </div>
            </div>

            {/* Filter Toggle Pills for K1 - K5 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Filter className="w-3.5 h-3.5 text-teal-600" />
                  <span>Filter Garis Kurva (Klik untuk Aktifkan / Sembunyikan):</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMetrics({ K1: true, K2: true, K3: true, K4: true, K5: true })}
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 underline cursor-pointer"
                >
                  Tampilkan Semua 5 Kriteria
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {CRITERIA_CONFIG.map((crit) => {
                  const isActive = activeMetrics[crit.key];
                  const Icon = crit.icon;
                  return (
                    <button
                      key={crit.key}
                      type="button"
                      onClick={() => toggleMetric(crit.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                        isActive
                          ? `${crit.bg} ${crit.text} ${crit.border} shadow-2xs`
                          : 'bg-white text-slate-400 border-slate-200 opacity-60 line-through'
                      }`}
                      title={`Klik untuk ${isActive ? 'sembunyikan' : 'tampilkan'} kurva ${crit.label}`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: isActive ? crit.color : '#94a3b8' }}
                      />
                      <Icon className="w-3.5 h-3.5" />
                      <span>{crit.key}: {crit.label} ({crit.unit})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="space-y-6">
                {/* Visualisasi Kurva Recharts (Tersusun Atas - Bawah Lebar Penuh) */}
                <div className="space-y-6">
                  {/* Panel Atas: Antropometri & Pertumbuhan Fisik (K1-K3) */}
                  {(activeChartTab === 'all' || activeChartTab === 'antropometri') && (
                    <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-50/60 to-white border border-slate-200/90 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            <Scale className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                              1. Kurva Antropometri & Pertumbuhan Fisik Balita
                            </h4>
                            <p className="text-xs text-slate-500">
                              Sumbu Kiri: Berat Badan (kg) | Sumbu Kanan: Tinggi Badan (cm) & Lingkar Kepala (cm)
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-800 self-start sm:self-auto border border-teal-200">
                          Kriteria K1 — K3
                        </span>
                      </div>

                      <div className="h-72 sm:h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 12, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis yAxisId="antropo-left" stroke="#0d9488" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                            <YAxis yAxisId="antropo-right" orientation="right" stroke="#2563eb" fontSize={12} domain={['dataMin - 3', 'dataMax + 3']} />
                            <Tooltip content={<UnifiedChartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                            {activeMetrics.K1 && (
                              <Line
                                yAxisId="antropo-left"
                                type="monotone"
                                dataKey="beratBadan"
                                name="K1: Berat Badan (kg)"
                                stroke="#0d9488"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: '#0d9488' }}
                                activeDot={{ r: 6 }}
                              />
                            )}
                            {activeMetrics.K2 && (
                              <Line
                                yAxisId="antropo-right"
                                type="monotone"
                                dataKey="tinggiBadan"
                                name="K2: Tinggi Badan (cm)"
                                stroke="#2563eb"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: '#2563eb' }}
                                activeDot={{ r: 6 }}
                              />
                            )}
                            {activeMetrics.K3 && (
                              <Line
                                yAxisId="antropo-right"
                                type="monotone"
                                dataKey="lingkarKepala"
                                name="K3: Lingkar Kepala (cm)"
                                stroke="#7c3aed"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: '#7c3aed' }}
                                activeDot={{ r: 6 }}
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Panel Bawah: Status Imunisasi & Asupan Gizi (K4-K5) */}
                  {(activeChartTab === 'all' || activeChartTab === 'kesehatan') && (
                    <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-50/60 to-white border border-slate-200/90 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                              2. Kurva Status Kelengkapan Imunisasi & Asupan Gizi (PMBA)
                            </h4>
                            <p className="text-xs text-slate-500">
                              Sumbu Kiri: Kelengkapan Imunisasi Dasar (0-100%) | Sumbu Kanan: Skor Asupan Gizi PMBA (1 - 4)
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 self-start sm:self-auto border border-cyan-200">
                          Kriteria K4 — K5
                        </span>
                      </div>

                      <div className="h-72 sm:h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 12, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis yAxisId="health-left" stroke="#0891b2" fontSize={12} domain={[0, 100]} />
                            <YAxis yAxisId="health-right" orientation="right" stroke="#ea580c" fontSize={12} domain={[1, 4]} ticks={[1, 2, 3, 4]} />
                            <Tooltip content={<UnifiedChartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                            {activeMetrics.K4 && (
                              <Line
                                yAxisId="health-left"
                                type="monotone"
                                dataKey="imunisasi"
                                name="K4: Kelengkapan Imunisasi (%)"
                                stroke="#0891b2"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: '#0891b2' }}
                                activeDot={{ r: 6 }}
                              />
                            )}
                            {activeMetrics.K5 && (
                              <Line
                                yAxisId="health-right"
                                type="monotone"
                                dataKey="asupanGizi"
                                name="K5: Asupan Gizi PMBA (Skor 1-4)"
                                stroke="#ea580c"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: '#ea580c' }}
                                activeDot={{ r: 6 }}
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5 Mini Metric Delta & Trend Cards */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Ringkasan 5 Kriteria & Tren dari Kunjungan Sebelumnya
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {latestVerifiedExam ? `Kunjungan: ${latestVerifiedExam.period_code || 'Terbaru'}` : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {CRITERIA_CONFIG.map((crit) => {
                      const Icon = crit.icon;
                      const val = latestVerifiedExam?.values?.[crit.key];
                      const delta = getMetricDelta(crit.key, crit.unit);

                      return (
                        <div
                          key={crit.key}
                          className={`p-3 rounded-2xl border transition-all ${crit.bg} ${crit.border}`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-[11px]" style={{ color: crit.color }}>
                              {crit.key}
                            </span>
                            <Icon className="w-3.5 h-3.5" style={{ color: crit.color }} />
                          </div>
                          <span className="block text-[11px] text-slate-600 font-medium truncate mb-1">
                            {crit.label}
                          </span>
                          <p className="text-base font-extrabold text-slate-900 leading-none">
                            {val != null ? val : '-'}{' '}
                            <span className="text-[10px] font-normal text-slate-500">{crit.unit}</span>
                          </p>

                          {delta ? (
                            <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center gap-1 text-[10px]">
                              {delta.type === 'positive' && (
                                <span className="inline-flex items-center font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                                  <ArrowUp className="w-2.5 h-2.5 mr-0.5" />
                                  {delta.text}
                                </span>
                              )}
                              {delta.type === 'negative' && (
                                <span className="inline-flex items-center font-bold text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded-md">
                                  <ArrowDown className="w-2.5 h-2.5 mr-0.5" />
                                  {delta.text}
                                </span>
                              )}
                              {delta.type === 'neutral' && (
                                <span className="inline-flex items-center font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                  <Minus className="w-2.5 h-2.5 mr-0.5" />
                                  {delta.text}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-400">
                              Kunjungan awal
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300">
                <p className="text-sm font-semibold text-slate-600">Belum Ada Riwayat Kunjungan Terverifikasi</p>
                <p className="text-xs text-slate-400 mt-1">Data pemeriksaan pertama yang diverifikasi nakes akan otomatis memunculkan grafik 5 kriteria baku ini.</p>
              </div>
            )}
          </div>

          {/* Bagian E: Rekomendasi Edukasi & Tindak Lanjut Terstruktur */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <span>Rekomendasi Edukasi & Arahan Tumbuh Kembang</span>
              </h3>
              <p className="text-xs text-slate-500">
                Panduan praktis pola asuh, nutrisi seimbang, dan jadwal stimulasi sesuai usia anak
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    rec.priority === 'high'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : 'bg-teal-50/50 border-teal-100 text-teal-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                      {rec.category}
                    </span>
                    {rec.priority === 'high' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                        Prioritas
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{rec.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>

            {/* Official Medical Disclaimer Alert */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-700 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-950">Catatan Penting Penafian Klinis:</span>
                {CLINICAL_DISCLAIMER}
              </div>
            </div>
          </div>

          {/* Bagian C: Riwayat Seluruh Pemeriksaan (Immutable Visits) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>Riwayat Pemeriksaan & Kunjungan Posyandu</span>
              </h3>
              <p className="text-xs text-slate-500">
                Setiap kunjungan tersimpan permanen sebagai rekam medis pemantauan berkala tanpa saling menimpa
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                    <th className="py-3 px-3.5">Tanggal Kunjungan</th>
                    <th className="py-3 px-3.5">Periode</th>
                    <th className="py-3 px-3.5">K1: BB (kg)</th>
                    <th className="py-3 px-3.5">K2: TB (cm)</th>
                    <th className="py-3 px-3.5">K3: LK (cm)</th>
                    <th className="py-3 px-3.5">K4: Imun (%)</th>
                    <th className="py-3 px-3.5">K5: Gizi</th>
                    <th className="py-3 px-3.5">Skor SAW</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {examinations.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3.5 font-medium text-slate-900">
                        {exam.examined_at.split('T')[0]}
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-600 font-mono">
                        {exam.period_code}
                      </td>
                      <td className="py-3.5 px-3.5 font-semibold text-slate-800">
                        {exam.values?.C1 ?? exam.raw_values?.BB ?? '-'}
                      </td>
                      <td className="py-3.5 px-3.5 font-semibold text-slate-800">
                        {exam.values?.C2 ?? exam.raw_values?.TB ?? '-'}
                      </td>
                      <td className="py-3.5 px-3.5 font-semibold text-slate-800">
                        {exam.values?.C3 ?? exam.raw_values?.LK ?? '-'}
                      </td>
                      <td className="py-3.5 px-3.5 text-teal-700 font-semibold">
                        {exam.values?.C5 ?? exam.raw_values?.Imunisasi ?? 100}%
                      </td>
                      <td className="py-3.5 px-3.5 text-amber-700 font-semibold">
                        Skor {exam.values?.K5 ?? exam.standard_scores?.K5 ?? 4}
                      </td>
                      <td className="py-3.5 px-3.5 font-mono text-teal-700 font-bold">
                        {exam.saw_score != null ? exam.saw_score.toFixed(3) : '-'}
                      </td>
                      <td className="py-3.5 px-3.5">
                        <StatusBadge status={exam.status} />
                      </td>
                      <td className="py-3.5 px-3.5 text-right">
                        <button
                          onClick={() => setSelectedExamDetail(exam)}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center py-12">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">Belum Ada Pemeriksaan Terverifikasi</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Hasil pemeriksaan 5 kriteria baku akan tampil di halaman ini secara otomatis setelah petugas Posyandu
            melakukan pemeriksaan fisik dan memverifikasi data penimbangan.
          </p>
        </div>
      )}

      {/* Modal Detail Pemeriksaan Kunjungan Tertentu */}
      {selectedExamDetail && (
        <Modal
          isOpen={Boolean(selectedExamDetail)}
          onClose={() => setSelectedExamDetail(null)}
          title={`Detail Pemeriksaan — Periode ${selectedExamDetail.period_code}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-slate-500">Tanggal Kunjungan</p>
                <p className="font-bold text-slate-800 text-sm">{selectedExamDetail.examined_at.split('T')[0]}</p>
              </div>
              <StatusBadge status={selectedExamDetail.status} />
            </div>

            <div>
              <p className="font-bold text-slate-800 mb-2">5 Kriteria Baku Tumbuh Kembang (Permenkes & WHO):</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500 block">K1. Berat Badan (BB/U)</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedExamDetail.values?.C1 ?? selectedExamDetail.raw_values?.BB ?? '-'} kg</span>
                  <span className="text-[10px] text-teal-700 block font-semibold mt-0.5">
                    Skor: {selectedExamDetail.values?.K1 ?? selectedExamDetail.standard_scores?.K1 ?? 4} (Bobot 12.28%)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500 block">K2. Panjang/Tinggi (PB/TB)</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedExamDetail.values?.C2 ?? selectedExamDetail.raw_values?.TB ?? '-'} cm</span>
                  <span className="text-[10px] text-blue-700 block font-semibold mt-0.5">
                    Skor: {selectedExamDetail.values?.K2 ?? selectedExamDetail.standard_scores?.K2 ?? 4} (Bobot 12.28%)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500 block">K3. Lingkar Kepala (LK/U)</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedExamDetail.values?.C3 ?? selectedExamDetail.raw_values?.LK ?? '-'} cm</span>
                  <span className="text-[10px] text-purple-700 block font-semibold mt-0.5">
                    Skor: {selectedExamDetail.values?.K3 ?? selectedExamDetail.standard_scores?.K3 ?? 4} (Bobot 8.47%)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500 block">K4. Kelengkapan Imunisasi</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedExamDetail.values?.C5 ?? selectedExamDetail.raw_values?.Imunisasi ?? 100} %</span>
                  <span className="text-[10px] text-cyan-700 block font-semibold mt-0.5">
                    Skor: {selectedExamDetail.values?.K4 ?? selectedExamDetail.standard_scores?.K4 ?? 4} (Bobot 42.37%)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white col-span-2">
                  <span className="text-slate-500 block">K5. Asupan Gizi & Praktik Makan Balita (PMBA)</span>
                  <span className="font-bold text-amber-900 text-sm">
                    Skor {selectedExamDetail.values?.K5 ?? selectedExamDetail.standard_scores?.K5 ?? 4} dari 4 Indikator
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Bobot 24.59% • Standar Kemenkes RI & WHO
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-100">
              <span className="font-bold text-teal-900 block mb-1">Hasil Perhitungan SPK (AHP + SAW):</span>
              <p className="text-teal-800">Skor Preferensi: <strong>{selectedExamDetail.saw_score != null ? selectedExamDetail.saw_score.toFixed(4) : '-'}</strong></p>
              <p className="text-teal-800">
                Peringkat Kelompok Umur: <strong>#{selectedExamDetail.saw_rank || '-'}</strong>
                {selectedExamDetail.age_group_name ? ` (${selectedExamDetail.age_group_name})` : ''}
              </p>
              <p className="text-[11px] text-teal-700 mt-1">Konfigurasi: Versi Algoritma AHP-SAW (5 Kriteria Baku)</p>
            </div>

            {selectedExamDetail.notes && (
              <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
                <span className="font-bold block">Catatan Petugas:</span>
                <p className="mt-0.5">{selectedExamDetail.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
