import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { spkService } from '../../services/spkService';
import { SPK_AGE_GROUPS } from '../../lib/spk/ageGroups';
import { LoadingState } from '../../components/ui/LoadingState';
import { Modal } from '../../components/ui/Modal';
import {
  Calculator,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Eye,
  Info,
  Calendar,
  Users,
  PlusCircle,
  BookOpen
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

function getScoreBadgeClass(score) {
  const num = Number(score);
  switch (num) {
    case 4:
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    case 3:
      return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
    case 2:
      return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    case 1:
      return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function SPKCalculationPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parameter kelompok umur, periode, & jenis kelamin
  const ageGroupIdParam = searchParams.get('ageGroupId') || searchParams.get('birthYear') || '6';
  const initialGroupId = Number(ageGroupIdParam) >= 1 && Number(ageGroupIdParam) <= 8 ? String(ageGroupIdParam) : '6';

  const periodParam = searchParams.get('period') || '2026-10';
  const [initialYear, initialMonth] = (periodParam || '2026-10').split('-');

  const genderParam = searchParams.get('gender') || 'L';
  const initialGender = genderParam === 'P' || genderParam === 'all' ? genderParam : 'L';

  const [ageGroupId, setAgeGroupId] = useState(initialGroupId);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || '10');
  const [selectedYear, setSelectedYear] = useState(initialYear || '2026');
  const [yearInput, setYearInput] = useState(initialYear || '2026');
  const [selectedGender, setSelectedGender] = useState(initialGender);

  // Periode SPK gabungan (YYYY-MM)
  const periodCode = `${(selectedYear || '2026').trim()}-${selectedMonth}`;

  const [initialLoading, setInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [spkRun, setSpkRun] = useState(null);
  const [ahpConfig, setAhpConfig] = useState(null);
  const [error, setError] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const selectedAgeGroup = SPK_AGE_GROUPS.find((g) => g.id === Number(ageGroupId)) || SPK_AGE_GROUPS[5];

  const handleYearChange = (val) => {
    setYearInput(val);
    const cleaned = (val || '').trim();
    if (cleaned.length === 4 && Number(cleaned) >= 2000 && Number(cleaned) <= 2099) {
      setSelectedYear(cleaned);
    }
  };

  const handleYearBlur = () => {
    const cleaned = (yearInput || '').trim();
    if (cleaned.length === 4 && Number(cleaned) >= 2000 && Number(cleaned) <= 2099) {
      setSelectedYear(cleaned);
    } else {
      setYearInput(selectedYear);
    }
  };

  const loadData = async (targetGroupId = ageGroupId, targetPeriod = periodCode, targetGender = selectedGender) => {
    setIsUpdating(true);
    setError('');

    const config = spkService.getAHPConfig();
    setAhpConfig(config);

    const res = await spkService.getLatestResultsForCohort(targetGroupId, targetPeriod, targetGender);
    if (res.error) {
      setError(res.error.message || 'Gagal memuat hasil perhitungan SPK.');
      setSpkRun(null);
    } else {
      setSpkRun(res.data);
    }
    setIsUpdating(false);
    setInitialLoading(false);
  };

  useEffect(() => {
    setSearchParams({ ageGroupId, period: periodCode, gender: selectedGender }, { replace: true });
    loadData(ageGroupId, periodCode, selectedGender);
  }, [ageGroupId, selectedMonth, selectedYear, selectedGender]);

  const handleRecalculate = async () => {
    setCalculating(true);
    setError('');

    const res = await spkService.runCalculationForCohort({
      ageGroupId,
      periodCode,
      gender: selectedGender,
      createdBy: 'dr. Dewi Anggraini, Sp.A'
    });

    if (res.error) {
      setError(res.error.message);
    } else {
      setSpkRun(res.data);
    }
    setCalculating(false);
  };

  const sawOutput = spkRun?.saw_output;
  const results = sawOutput?.results || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-teal-600" />
            <span>Perhitungan & Peringkat SPK</span>
          </h1>
          <p className="text-sm text-slate-500">
            Peringkat preferensi balita berdasarkan metode AHP dan SAW
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={calculating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
          <span>{calculating ? 'Menghitung...' : 'Hitung Ulang Snapshot'}</span>
        </button>
      </div>

      {/* Cohort & Period Filter Controls */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5">
            {/* Dropdown Kelompok Umur */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>Kelompok Umur:</span>
              </span>
              <select
                value={ageGroupId}
                onChange={(e) => setAgeGroupId(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden transition-all cursor-pointer text-xs"
              >
                {SPK_AGE_GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Periode Penimbangan (Bulan + Tahun) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Periode:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden transition-all cursor-pointer"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="2000"
                  max="2099"
                  required
                  value={yearInput}
                  onChange={(e) => handleYearChange(e.target.value)}
                  onBlur={handleYearBlur}
                  placeholder="2026"
                  className="w-24 p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-800 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden transition-all"
                />
              </div>

              <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-1.5 rounded-lg">
                {periodCode}
              </span>
            </div>

            {/* Pemisah Jenis Kelamin */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>Jenis Kelamin:</span>
              </span>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedGender('L')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'L'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Laki-Laki</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('P')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'P'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Perempuan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('all')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'all'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Semua</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Dasar Pertimbangan */}
        {selectedAgeGroup && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 font-bold text-[11px] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                <span>Rentang: {selectedAgeGroup.rangeLabel}</span>
              </span>
              <span className="text-slate-600">
                {selectedAgeGroup.consideration}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error / Warning Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Perhatian: </span>
            <span>{error}</span>
            <p className="mt-1 text-slate-600">
              Pastikan balita pada kelompok umur ini telah memiliki data pemeriksaan terverifikasi pada periode {periodCode}.
            </p>
          </div>
        </div>
      )}

      {/* AHP Active Weights Summary */}
      {ahpConfig && (
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Bobot Kriteria AHP
              </h3>
              <p className="text-xs text-slate-500">
                Consistency Ratio: <strong className="text-teal-700 font-mono">{ahpConfig.cr?.toFixed(6) || '0.000030'}</strong> (Konsisten)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Matriks Valid</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block text-[11px]">K1. Berat Badan (BB/U)</span>
              <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
                {(((ahpConfig.weightsMap?.K1 ?? ahpConfig.weightsMap?.C1) || 0.122833) * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                w = {(ahpConfig.weightsMap?.K1 ?? ahpConfig.weightsMap?.C1 ?? 0.122833).toFixed(4)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block text-[11px]">K2. Tinggi Badan (PB/TB)</span>
              <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
                {(((ahpConfig.weightsMap?.K2 ?? ahpConfig.weightsMap?.C2) || 0.122833) * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                w = {(ahpConfig.weightsMap?.K2 ?? ahpConfig.weightsMap?.C2 ?? 0.122833).toFixed(4)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block text-[11px]">K3. Lingkar Kepala (LK/U)</span>
              <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
                {(((ahpConfig.weightsMap?.K3 ?? ahpConfig.weightsMap?.C3) || 0.084737) * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                w = {(ahpConfig.weightsMap?.K3 ?? ahpConfig.weightsMap?.C3 ?? 0.084737).toFixed(4)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80">
              <span className="text-teal-700 block text-[11px] font-semibold">K4. Imunisasi (Prioritas)</span>
              <span className="text-base font-bold text-teal-900 font-mono mt-0.5 block">
                {(((ahpConfig.weightsMap?.K4 ?? ahpConfig.weightsMap?.C5) || 0.423687) * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-teal-700 block font-mono">
                w = {(ahpConfig.weightsMap?.K4 ?? ahpConfig.weightsMap?.C5 ?? 0.423687).toFixed(4)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block text-[11px]">K5. Asupan Gizi (PMBA)</span>
              <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
                {(((ahpConfig.weightsMap?.K5 ?? ahpConfig.weightsMap?.C4) || 0.245910) * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                w = {(ahpConfig.weightsMap?.K5 ?? ahpConfig.weightsMap?.C4 ?? 0.245910).toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main SAW Ranking Table */}
      {initialLoading ? (
        <LoadingState text="Memproses normalisasi matriks dan ranking SAW per kelompok umur dan jenis kelamin..." />
      ) : (
        <div className={`transition-opacity duration-150 ${isUpdating ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
          {results.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-1" />
              <h3 className="font-bold text-slate-800 text-base">Tidak Ada Alternatif Memenuhi Syarat</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                Belum ada pemeriksaan berstatus terverifikasi untuk {selectedAgeGroup?.name} (
                {selectedGender === 'L' ? 'Laki-Laki' : selectedGender === 'P' ? 'Perempuan' : 'Semua Jenis Kelamin'})
                pada periode {periodCode}.
              </p>

              {/* Tombol Cepat Pindah Gender */}
              <div className="flex justify-center pt-2">
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedGender('L')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedGender === 'L' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>👦 Laki-Laki</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGender('P')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedGender === 'P' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>👧 Perempuan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGender('all')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedGender === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>👥 Semua</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/staff/examination/new?period=${periodCode}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Catat Pemeriksaan Sekarang</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                    <span>Tabel Peringkat Balita</span>
                    {isUpdating && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />
                        <span>Memperbarui...</span>
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedAgeGroup?.name} • Periode {periodCode} • {selectedGender === 'L' ? 'Laki-Laki' : selectedGender === 'P' ? 'Perempuan' : 'Semua'} ({results.length} balita)
                  </p>
                </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Tombol Tab Jenis Kelamin Interaktif */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSelectedGender('L')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'L'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>Laki-Laki</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('P')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'P'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>Perempuan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('all')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'all'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>Semua</span>
                </button>
              </div>

              <button
                onClick={() => setShowDetailModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Matriks SAW</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-3 px-3 text-center w-16">Peringkat</th>
                  <th className="py-3 px-3.5">Nama Balita</th>
                  <th className="py-3 px-3 text-center">Jenis Kelamin</th>
                  <th className="py-3 px-3 text-center">Usia</th>
                  <th className="py-3 px-3">K1 (BB)</th>
                  <th className="py-3 px-3">K2 (TB)</th>
                  <th className="py-3 px-3">K3 (LK)</th>
                  <th className="py-3 px-3">K4 (Imun)</th>
                  <th className="py-3 px-3">K5 (Gizi)</th>
                  <th className="py-3 px-3.5 font-bold text-teal-800">Skor (Vi)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((item) => {
                  const k1Score = item.standardScores?.K1 ?? item.values?.K1 ?? 4;
                  const k2Score = item.standardScores?.K2 ?? item.values?.K2 ?? 4;
                  const k3Score = item.standardScores?.K3 ?? item.values?.K3 ?? 4;
                  const k4Score = item.standardScores?.K4 ?? item.values?.K4 ?? 4;
                  const k5Score = item.standardScores?.K5 ?? item.values?.K5 ?? 4;

                  const rawBB = item.rawValues?.BB ?? item.rawValues?.C1 ?? '-';
                  const rawTB = item.rawValues?.TB ?? item.rawValues?.C2 ?? '-';
                  const rawLK = item.rawValues?.LK ?? item.rawValues?.C3 ?? '-';
                  const rawImun = item.rawValues?.Imunisasi ?? item.rawValues?.C5 ?? '-';
                  const rawGizi = item.rawValues?.Gizi ?? item.rawValues?.gizi ?? '-';

                  return (
                    <tr key={item.childId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-bold text-xs ${
                            item.rank === 1
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : item.rank === 2
                              ? 'bg-slate-200 text-slate-800'
                              : item.rank === 3
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{item.rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="font-bold text-slate-900 text-sm">{item.childName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">ID: {item.childId}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.sex === 'P'
                              ? 'bg-pink-50 text-pink-700 border border-pink-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {item.sex === 'P' ? '👧 Perempuan' : '👦 Laki-Laki'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-slate-700 text-[11px]">
                          {item.ageInMonths !== undefined ? `${item.ageInMonths} Bulan` : selectedAgeGroup.rangeLabel}
                        </span>
                      </td>

                      {/* K1: BB/U */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center justify-center w-max px-2 py-0.5 rounded-md border text-[11px] ${getScoreBadgeClass(k1Score)}`}>
                            Skor {k1Score}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{rawBB} kg</span>
                        </div>
                      </td>

                      {/* K2: TB/U */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center justify-center w-max px-2 py-0.5 rounded-md border text-[11px] ${getScoreBadgeClass(k2Score)}`}>
                            Skor {k2Score}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{rawTB} cm</span>
                        </div>
                      </td>

                      {/* K3: LK/U */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center justify-center w-max px-2 py-0.5 rounded-md border text-[11px] ${getScoreBadgeClass(k3Score)}`}>
                            Skor {k3Score}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{rawLK} cm</span>
                        </div>
                      </td>

                      {/* K4: Imunisasi */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center justify-center w-max px-2 py-0.5 rounded-md border text-[11px] ${getScoreBadgeClass(k4Score)}`}>
                            Skor {k4Score}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {(() => {
                              const num = Number(rawImun);
                              if (isNaN(num)) return '-';
                              const doses = num > 17 ? Math.min(17, Math.round((num / 100) * 17)) : num;
                              return `${doses} dosis`;
                            })()}
                          </span>
                        </div>
                      </td>

                      {/* K5: Asupan Gizi */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center justify-center w-max px-2 py-0.5 rounded-md border text-[11px] ${getScoreBadgeClass(k5Score)}`}>
                            Skor {k5Score}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{rawGizi} Ind</span>
                        </div>
                      </td>

                      {/* Skor Preferensi (Vi) */}
                      <td className="py-3.5 px-3.5">
                        <span className="font-mono font-bold text-teal-700 text-sm">
                          {item.preferenceScore.toFixed(7)}
                        </span>
                      </td>

                      {/* Status Flag */}
                      <td className="py-3.5 px-3 text-center">
                        {item.statusFlag === 'Perlu Tinjau' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Perlu Tinjau</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Normal</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedResult(item)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs cursor-pointer transition-colors"
                        >
                          Rincian
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Catatan Standarisasi */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Nilai antropometri dan riwayat kesehatan balita telah distandarisasi ke skor ideal 1–4 (benefit) sebelum normalisasi SAW.</span>
          </div>
        </div>
      )}
    </div>
  )}

      {/* Modal Transparansi Matriks Normalisasi (R) */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Transparansi Matriks SAW: ${selectedAgeGroup?.name}`}
        maxWidth="max-w-5xl"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Berikut adalah nilai skor terstandar <em>(X<sub>ij</sub>)</em>, normalisasi <em>(r<sub>ij</sub> = X<sub>ij</sub> / Max)</em>, dan nilai preferensi <em>(V<sub>i</sub> = &Sigma; W<sub>j</sub> &times; r<sub>ij</sub>)</em> untuk setiap balita:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                  <th className="p-2 border-r border-slate-200">Alternatif</th>
                  <th className="p-2 border-r border-slate-200">Usia</th>
                  <th className="p-2 border-r border-slate-200 text-center">K1 (BB)</th>
                  <th className="p-2 border-r border-slate-200 text-center">K2 (TB)</th>
                  <th className="p-2 border-r border-slate-200 text-center">K3 (LK)</th>
                  <th className="p-2 border-r border-slate-200 text-center">K4 (Imun)</th>
                  <th className="p-2 border-r border-slate-200 text-center">K5 (Gizi)</th>
                  <th className="p-2 border-r border-slate-200 text-center">R1</th>
                  <th className="p-2 border-r border-slate-200 text-center">R2</th>
                  <th className="p-2 border-r border-slate-200 text-center">R3</th>
                  <th className="p-2 border-r border-slate-200 text-center">R4</th>
                  <th className="p-2 border-r border-slate-200 text-center">R5</th>
                  <th className="p-2 font-bold text-teal-800 border-r border-slate-200">Skor Vi</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((res) => {
                  const k1 = res.standardScores?.K1 ?? res.values?.K1 ?? 4;
                  const k2 = res.standardScores?.K2 ?? res.values?.K2 ?? 4;
                  const k3 = res.standardScores?.K3 ?? res.values?.K3 ?? 4;
                  const k4 = res.standardScores?.K4 ?? res.values?.K4 ?? 4;
                  const k5 = res.standardScores?.K5 ?? res.values?.K5 ?? 4;

                  return (
                    <tr key={res.childId} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-800 border-r border-slate-200">
                        {res.childName} <span className="text-[10px] text-slate-400 font-normal">({res.childId})</span>
                      </td>
                      <td className="p-2 text-slate-600 border-r border-slate-200">
                        {res.ageInMonths !== undefined ? `${res.ageInMonths} bln` : '-'}
                      </td>
                      <td className="p-2 text-center font-bold text-slate-800 border-r border-slate-200">{k1}</td>
                      <td className="p-2 text-center font-bold text-slate-800 border-r border-slate-200">{k2}</td>
                      <td className="p-2 text-center font-bold text-slate-800 border-r border-slate-200">{k3}</td>
                      <td className="p-2 text-center font-bold text-slate-800 border-r border-slate-200">{k4}</td>
                      <td className="p-2 text-center font-bold text-slate-800 border-r border-slate-200">{k5}</td>
                      <td className="p-2 font-mono text-center border-r border-slate-200">{res.normalizedValues?.K1 ?? res.normalizedValues?.C1 ?? 1}</td>
                      <td className="p-2 font-mono text-center border-r border-slate-200">{res.normalizedValues?.K2 ?? res.normalizedValues?.C2 ?? 1}</td>
                      <td className="p-2 font-mono text-center border-r border-slate-200">{res.normalizedValues?.K3 ?? res.normalizedValues?.C3 ?? 1}</td>
                      <td className="p-2 font-mono text-center border-r border-slate-200">{res.normalizedValues?.K4 ?? res.normalizedValues?.C5 ?? 1}</td>
                      <td className="p-2 font-mono text-center border-r border-slate-200">{res.normalizedValues?.K5 ?? res.normalizedValues?.C4 ?? 1}</td>
                      <td className="p-2 font-mono font-bold text-teal-700 border-r border-slate-200">{res.preferenceScore.toFixed(7)}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          res.statusFlag === 'Perlu Tinjau'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {res.statusFlag || 'Normal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Modal Rincian Nilai Alternatif Tertentu */}
      {selectedResult && (
        <Modal
          isOpen={Boolean(selectedResult)}
          onClose={() => setSelectedResult(null)}
          title={`Rincian Skor: ${selectedResult.childName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-between">
              <div>
                <p className="text-teal-800 font-bold">Peringkat #{selectedResult.rank}</p>
                <p className="text-teal-700 font-mono text-sm">
                  Skor SAW: {selectedResult.preferenceScore.toFixed(7)} • Usia:{' '}
                  {selectedResult.ageInMonths !== undefined ? `${selectedResult.ageInMonths} Bulan` : selectedAgeGroup.rangeLabel}
                </p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  selectedResult.statusFlag === 'Perlu Tinjau' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Status: {selectedResult.statusFlag || 'Normal'}
                </span>
              </div>
              <button
                onClick={() => navigate(`/parent/children/${selectedResult.childId}`)}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer hover:bg-teal-700 transition-colors"
              >
                Buka Profil Anak
              </button>
            </div>

            <div>
              <p className="font-bold text-slate-800 mb-2">Kontribusi 5 Kriteria Baku (w &times; r):</p>
              <div className="space-y-2">
                {[
                  { code: 'K1', name: 'Berat Badan menurut Umur (BB/U)', weight: '12.28%' },
                  { code: 'K2', name: 'Panjang/Tinggi Badan (PB/TB)', weight: '12.28%' },
                  { code: 'K3', name: 'Lingkar Kepala menurut Umur (LK/U)', weight: '8.47%' },
                  { code: 'K4', name: 'Kelengkapan Imunisasi Dasar', weight: '42.37%' },
                  { code: 'K5', name: 'Asupan Gizi & Praktik Makan (PMBA)', weight: '24.59%' }
                ].map((crit) => {
                  const score = selectedResult.standardScores?.[crit.code] ?? selectedResult.values?.[crit.code] ?? 4;
                  const label = selectedResult.scoreLabels?.[crit.code] || '';
                  const contribution = selectedResult.contributions?.[crit.code] ?? 0;

                  return (
                    <div
                      key={crit.code}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-800 font-bold">
                          {crit.code}. {crit.name}
                        </span>
                        <span className="font-mono font-bold text-teal-800 text-xs">
                          +{Number(contribution).toFixed(7)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>
                          Skor Terstandar: <strong className="text-slate-800">Skor {score}</strong> {label ? `(${label})` : ''}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Bobot: {crit.weight}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
