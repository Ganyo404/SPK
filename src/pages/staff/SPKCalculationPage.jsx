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
            <span>Perhitungan & Peringkat SPK (AHP + SAW)</span>
          </h1>
          <p className="text-sm text-slate-500">
            Penerapan Simple Additive Weighting dengan pembobotan Analytic Hierarchy Process berbasis 8 Kelompok Umur
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
            {/* Dropdown Kelompok Umur (8 Kategori Penelitian SPK) */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>Kelompok Umur SPK:</span>
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

            {/* Periode Penimbangan (Bulan Dropbox + Tahun Input Manual) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Periode Penimbangan:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {/* Dropbox Bulan */}
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

                {/* Input Tahun Manual */}
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

              {/* Badge Kode Periode */}
              <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-1.5 rounded-lg shadow-2xs">
                {periodCode} ({MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.name} {selectedYear})
              </span>
            </div>

            {/* Pemisah Jenis Kelamin (Gender Selector Buttons) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>Jenis Kelamin:</span>
              </span>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedGender('L')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'L'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>👦 Laki-Laki</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('P')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'P'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>👧 Perempuan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('all')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'all'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>👥 Semua</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-slate-400 italic text-[11px]">
            *Perbandingan alternatif adil per rentang umur bulan & jenis kelamin sesuai standar kurva pertumbuhan
          </div>
        </div>

        {/* Informasi Dasar Pertimbangan Kelompok Umur Penelitian */}
        {selectedAgeGroup && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 font-bold text-[11px] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                <span>Rentang: {selectedAgeGroup.rangeLabel}</span>
              </span>
              <span className="text-slate-600">
                <strong>Dasar Pertimbangan:</strong> {selectedAgeGroup.consideration}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Klasifikasi rentang bulan lengkap untuk penelitian SPK
            </span>
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
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Bobot Kriteria AHP yang Digunakan</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Consistency Ratio: <strong className="text-teal-700">{ahpConfig.cr?.toFixed(6)}</strong> (Batas CR &le; 0.10)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Matriks Konsisten (Saaty RI = 1.24)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100">
              <span className="text-slate-500 block">C1. Berat Badan (BB)</span>
              <span className="text-base font-bold text-teal-900 font-mono">
                {((ahpConfig.weightsMap?.C1 || 0) * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-teal-700 block font-mono">
                w = {ahpConfig.weightsMap?.C1?.toFixed(4)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100">
              <span className="text-slate-500 block">C2. Tinggi Badan (TB)</span>
              <span className="text-base font-bold text-teal-900 font-mono">
                {((ahpConfig.weightsMap?.C2 || 0) * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-teal-700 block font-mono">
                w = {ahpConfig.weightsMap?.C2?.toFixed(4)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100">
              <span className="text-slate-500 block">C3. Lingkar Kepala</span>
              <span className="text-base font-bold text-teal-900 font-mono">
                {((ahpConfig.weightsMap?.C3 || 0) * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-teal-700 block font-mono">
                w = {ahpConfig.weightsMap?.C3?.toFixed(4)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100">
              <span className="text-slate-500 block">C4. LiLA Gizi</span>
              <span className="text-base font-bold text-teal-900 font-mono">
                {((ahpConfig.weightsMap?.C4 || 0) * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-teal-700 block font-mono">
                w = {ahpConfig.weightsMap?.C4?.toFixed(4)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100">
              <span className="text-slate-500 block">C5. Imunisasi Dasar</span>
              <span className="text-base font-bold text-teal-900 font-mono">
                {((ahpConfig.weightsMap?.C5 || 0) * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-teal-700 block font-mono">
                w = {ahpConfig.weightsMap?.C5?.toFixed(4)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
              <span className="text-slate-500 block">C6. Sakit (Cost)</span>
              <span className="text-base font-bold text-rose-900 font-mono">
                {((ahpConfig.weightsMap?.C6 || 0) * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-rose-700 block font-mono">
                w = {ahpConfig.weightsMap?.C6?.toFixed(4)}
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
                    <span>Tabel Peringkat Preferensi SPK Balita</span>
                    {isUpdating && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />
                        <span>Memperbarui...</span>
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedAgeGroup?.name} • Periode {periodCode} • Kelompok: <strong>{selectedGender === 'L' ? 'Laki-Laki (L)' : selectedGender === 'P' ? 'Perempuan (P)' : 'Semua Jenis Kelamin'}</strong> • {results.length} Balita Masuk Pemeringkatan
                  </p>
                </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Tombol Tab Jenis Kelamin Interaktif */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSelectedGender('L')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'L'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>👦 Laki-Laki</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('P')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'P'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>👧 Perempuan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('all')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'all'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>👥 Semua</span>
                </button>
              </div>

              <button
                onClick={() => setShowDetailModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Transparansi Matriks</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-3 px-3 text-center w-16">Peringkat</th>
                  <th className="py-3 px-3.5">Nama Alternatif Balita</th>
                  <th className="py-3 px-3 text-center">Jenis Kelamin</th>
                  <th className="py-3 px-3 text-center">Usia Balita</th>
                  <th className="py-3 px-3.5">C1 (BB)</th>
                  <th className="py-3 px-3.5">C2 (TB)</th>
                  <th className="py-3 px-3.5">C3 (LK)</th>
                  <th className="py-3 px-3.5">C4 (LiLA)</th>
                  <th className="py-3 px-3.5">C5 (Imun)</th>
                  <th className="py-3 px-3.5">C6 (Sakit)</th>
                  <th className="py-3 px-3.5 font-bold text-teal-800">Skor Preferensi (Vi)</th>
                  <th className="py-3 px-3 text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((item) => (
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
                    <td className="py-3.5 px-3.5 text-slate-700 font-semibold">{item.rawValues?.C1} kg</td>
                    <td className="py-3.5 px-3.5 text-slate-700 font-semibold">{item.rawValues?.C2} cm</td>
                    <td className="py-3.5 px-3.5 text-slate-700">{item.rawValues?.C3} cm</td>
                    <td className="py-3.5 px-3.5 text-slate-700">{item.rawValues?.C4} cm</td>
                    <td className="py-3.5 px-3.5 text-slate-700">{item.rawValues?.C5}%</td>
                    <td className="py-3.5 px-3.5 text-slate-700">{item.rawValues?.C6}x</td>
                    <td className="py-3.5 px-3.5">
                      <span className="font-mono font-bold text-teal-700 text-sm">
                        {item.preferenceScore.toFixed(4)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedResult(item)}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs cursor-pointer"
                      >
                        Rincian
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Educational Disclaimer */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Prinsip Pemisahan Kelompok (Usia & Jenis Kelamin):</strong> Standar kurva pertumbuhan KMS dan WHO membedakan
              persentil antropometri anak laki-laki dan perempuan. Sistem SPK memisahkan alternatif per <strong>{selectedAgeGroup?.name}</strong> dan{' '}
              <strong>{selectedGender === 'L' ? 'Laki-Laki (L)' : selectedGender === 'P' ? 'Perempuan (P)' : 'Semua Balita'}</strong>{' '}
              agar normalisasi nilai min-max dan pemeringkatan preferensi SAW berlangsung objektif, adil, dan setara secara klinis.
            </p>
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
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Berikut adalah nilai normalisasi <em>(r<sub>ij</sub>)</em> dan kontribusi terbobot <em>(w<sub>j</sub> &times; r<sub>ij</sub>)</em> untuk setiap alternatif balita:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-2 border-r border-slate-200">Alternatif</th>
                  <th className="p-2 border-r border-slate-200">Usia</th>
                  <th className="p-2 border-r border-slate-200">r1 (BB)</th>
                  <th className="p-2 border-r border-slate-200">r2 (TB)</th>
                  <th className="p-2 border-r border-slate-200">r3 (LK)</th>
                  <th className="p-2 border-r border-slate-200">r4 (LiLA)</th>
                  <th className="p-2 border-r border-slate-200">r5 (Imun)</th>
                  <th className="p-2 border-r border-slate-200">r6 (Sakit)</th>
                  <th className="p-2 font-bold text-teal-800">Skor Vi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((res) => (
                  <tr key={res.childId}>
                    <td className="p-2 font-bold text-slate-800 border-r border-slate-200">{res.childName}</td>
                    <td className="p-2 text-slate-600 border-r border-slate-200">
                      {res.ageInMonths !== undefined ? `${res.ageInMonths} bln` : '-'}
                    </td>
                    <td className="p-2 font-mono border-r border-slate-200">{res.normalizedValues?.C1}</td>
                    <td className="p-2 font-mono border-r border-slate-200">{res.normalizedValues?.C2}</td>
                    <td className="p-2 font-mono border-r border-slate-200">{res.normalizedValues?.C3}</td>
                    <td className="p-2 font-mono border-r border-slate-200">{res.normalizedValues?.C4}</td>
                    <td className="p-2 font-mono border-r border-slate-200">{res.normalizedValues?.C5}</td>
                    <td className="p-2 font-mono border-r border-slate-200">{res.normalizedValues?.C6}</td>
                    <td className="p-2 font-mono font-bold text-teal-700">{res.preferenceScore.toFixed(4)}</td>
                  </tr>
                ))}
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
                  Skor SAW: {selectedResult.preferenceScore.toFixed(4)} • Usia:{' '}
                  {selectedResult.ageInMonths !== undefined ? `${selectedResult.ageInMonths} Bulan` : selectedAgeGroup.rangeLabel}
                </p>
              </div>
              <button
                onClick={() => navigate(`/parent/children/${selectedResult.childId}`)}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer"
              >
                Buka Profil Anak
              </button>
            </div>

            <div>
              <p className="font-bold text-slate-800 mb-2">Kontribusi Tiap Kriteria (w &times; r):</p>
              <div className="space-y-2">
                {['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((code) => (
                  <div
                    key={code}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <span className="text-slate-600 font-medium">
                      Kriteria {code} (Raw: {selectedResult.rawValues[code]})
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      +{selectedResult.contributions[code]?.toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
