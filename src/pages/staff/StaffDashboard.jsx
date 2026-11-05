import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { childService } from '../../services/childService';
import { examinationService } from '../../services/examinationService';
import { spkService } from '../../services/spkService';
import { SummaryCard } from '../../components/ui/SummaryCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Baby,
  Stethoscope,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Users,
  Building2,
  Calendar,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle
} from 'lucide-react';

export function StaffDashboard() {
  const navigate = useNavigate();
  const tableSectionRef = useRef(null);

  const [metrics, setMetrics] = useState({
    pendingRegistration: 0,
    draftExams: 0,
    pendingVerification: 0,
    verifiedExams: 0,
    needsAttention: 0,
  });
  const [children, setChildren] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter aktif: 'recent' | 'pendingRegistration' | 'draftExams' | 'pendingVerification' | 'verifiedExams' | 'needsAttention'
  const [activeFilter, setActiveFilter] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const [childrenRes, examsRes] = await Promise.all([
        childService.getAllChildren(),
        examinationService.getAllExaminations()
      ]);

      const loadedChildren = childrenRes.data || [];
      const loadedExams = examsRes.data || [];

      setChildren(loadedChildren);
      setExams(loadedExams);

      const pendingReg = loadedChildren.filter(c => c.registration_status === 'pending_registration').length;
      const drafts = loadedExams.filter(e => e.status === 'draft').length;
      const pendingVerif = loadedExams.filter(e => e.status === 'pending_verification').length;
      const verified = loadedExams.filter(e => e.status === 'verified').length;
      // Kriteria perhatian klinis: Status Perlu Tinjau atau skor fisik <= 2
      const alerts = loadedExams.filter(e => e.status_flag === 'Perlu Tinjau' || (e.values?.K1 && Number(e.values.K1) <= 2) || (e.values?.K2 && Number(e.values.K2) <= 2)).length;

      setMetrics({
        pendingRegistration: pendingReg,
        draftExams: drafts,
        pendingVerification: pendingVerif,
        verifiedExams: verified,
        needsAttention: alerts
      });

      setLoading(false);
    }

    loadDashboard();
  }, []);

  const handleCardClick = (filterKey) => {
    setActiveFilter(prev => {
      const next = prev === filterKey ? 'recent' : filterKey;
      setSearchQuery('');
      setCurrentPage(1);
      setTimeout(() => {
        tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
      return next;
    });
  };

  const calculateAge = (dobString) => {
    if (!dobString) return '-';
    const dob = new Date(dobString);
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    const totalMonths = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    if (years === 0) return `${months} bln`;
    return `${years} thn ${months} bln (${totalMonths} bln)`;
  };

  const getChildName = (exam) => {
    return exam.child_name || exam.child?.name || children.find(c => c.id === exam.child_id)?.name || 'Balita';
  };

  // Logika pengambilan item terfilter
  const getFilteredData = () => {
    const q = searchQuery.toLowerCase().trim();

    if (activeFilter === 'pendingRegistration') {
      let list = children.filter(c => c.registration_status === 'pending_registration');
      if (q) {
        list = list.filter(c =>
          c.name.toLowerCase().includes(q) ||
          (c.parent_name && c.parent_name.toLowerCase().includes(q)) ||
          (c.posyandu_name && c.posyandu_name.toLowerCase().includes(q))
        );
      }
      return { type: 'children', list };
    }

    let examList = [];
    if (activeFilter === 'draftExams') {
      examList = exams.filter(e => e.status === 'draft');
    } else if (activeFilter === 'pendingVerification') {
      examList = exams.filter(e => e.status === 'pending_verification');
    } else if (activeFilter === 'verifiedExams') {
      examList = exams.filter(e => e.status === 'verified');
    } else if (activeFilter === 'needsAttention') {
      examList = exams.filter(e =>
        e.status_flag === 'Perlu Tinjau' ||
        (e.values?.K1 && Number(e.values.K1) <= 2) ||
        (e.values?.K2 && Number(e.values.K2) <= 2)
      );
    } else {
      // Default: recent
      examList = exams.slice(0, 10);
    }

    if (q) {
      examList = examList.filter(e => {
        const cName = getChildName(e).toLowerCase();
        const pCode = (e.period_code || '').toLowerCase();
        return cName.includes(q) || pCode.includes(q);
      });
    }

    return { type: 'exams', list: examList };
  };

  const { type: dataType, list: rawFilteredList } = getFilteredData();
  const totalItems = rawFilteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedList = rawFilteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Metadata filter aktif
  const FILTER_META = {
    recent: {
      title: 'Kunjungan Terbaru',
      subtitle: 'Pemeriksaan fisik dan penimbangan balita terakhir',
      badge: 'Semua Kunjungan Terbaru',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    pendingRegistration: {
      title: 'Daftar Balita: Pendaftaran Baru',
      subtitle: 'Balita baru yang menunggu verifikasi kedatangan fisik pertama di Posyandu',
      badge: 'Pendaftaran Baru',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    draftExams: {
      title: 'Daftar Draf Pemeriksaan',
      subtitle: 'Pemeriksaan balita yang belum difinalisasi atau masih disimpan sebagai draf',
      badge: 'Draf Pemeriksaan',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    pendingVerification: {
      title: 'Daftar Menunggu Verifikasi',
      subtitle: 'Pemeriksaan balita yang siap divalidasi oleh tenaga kesehatan',
      badge: 'Menunggu Verifikasi',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    verifiedExams: {
      title: 'Daftar Pemeriksaan Terverifikasi',
      subtitle: 'Data pemeriksaan fisik yang valid dan tercatat di sistem',
      badge: 'Terverifikasi',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    needsAttention: {
      title: 'Daftar Balita Perlu Evaluasi Klinis',
      subtitle: 'Balita dengan status Perlu Tinjau atau indikator antropometri berisiko',
      badge: 'Perlu Evaluasi',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
    }
  };

  const currentMeta = FILTER_META[activeFilter] || FILTER_META.recent;

  if (loading) {
    return <LoadingState text="Menghitung statistik Posyandu..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-teal-800 p-6 lg:p-8 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-teal-200 uppercase tracking-wider bg-teal-700/60 px-3 py-1 rounded-full border border-teal-600">
            Panel Posyandu & Tenaga Kesehatan
          </span>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-2">
            Dashboard Posyandu
          </h1>
          <p className="mt-1 text-sm text-teal-100 max-w-xl">
            Pencatatan pemeriksaan balita, verifikasi antrean fisik, dan pemeringkatan SPK.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/staff/examination/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-teal-900 font-semibold text-sm hover:bg-teal-50 shadow-xs transition-all cursor-pointer"
          >
            <Stethoscope className="w-4 h-4 text-teal-700" />
            <span>Catat Pemeriksaan</span>
          </button>
          <button
            onClick={() => navigate('/staff/spk-calculation')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 text-white font-semibold text-sm hover:bg-teal-600 border border-teal-600 transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Peringkat SPK</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Dashboard (Klik salah satu kartu untuk memfilter daftar balita di bawah) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Ringkasan & Filter Cepat (Klik Kartu untuk Melihat Daftar):
          </span>
          {activeFilter !== 'recent' && (
            <button
              onClick={() => {
                setActiveFilter('recent');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard
            title="Pendaftaran Baru"
            value={metrics.pendingRegistration}
            subtitle="Menunggu verifikasi fisik"
            icon={Baby}
            color="blue"
            onClick={() => handleCardClick('pendingRegistration')}
            isActive={activeFilter === 'pendingRegistration'}
          />
          <SummaryCard
            title="Draf Pemeriksaan"
            value={metrics.draftExams}
            subtitle="Pencatatan belum rampung"
            icon={Clock}
            color="amber"
            onClick={() => handleCardClick('draftExams')}
            isActive={activeFilter === 'draftExams'}
          />
          <SummaryCard
            title="Menunggu Verifikasi"
            value={metrics.pendingVerification}
            subtitle="Siap diverifikasi nakes"
            icon={Stethoscope}
            color="teal"
            onClick={() => handleCardClick('pendingVerification')}
            isActive={activeFilter === 'pendingVerification'}
          />
          <SummaryCard
            title="Terverifikasi"
            value={metrics.verifiedExams}
            subtitle="Data pemeriksaan valid"
            icon={CheckCircle2}
            color="emerald"
            onClick={() => handleCardClick('verifiedExams')}
            isActive={activeFilter === 'verifiedExams'}
          />
          <SummaryCard
            title="Perlu Evaluasi"
            value={metrics.needsAttention}
            subtitle="Status perlu tinjau klinis"
            icon={AlertTriangle}
            color="rose"
            onClick={() => handleCardClick('needsAttention')}
            isActive={activeFilter === 'needsAttention'}
          />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/staff/registration-queue')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Baby className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Verifikasi Pendaftaran</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Konfirmasi kedatangan pertama balita di Posyandu dan aktifkan akun.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-blue-600">
            <span>Buka Antrean ({metrics.pendingRegistration})</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => navigate('/staff/cohorts')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Kelompok Umur Balita</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Pembagian 8 kelompok umur berbasis bulan untuk penilaian adil.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-teal-600">
            <span>Lihat 8 Kelompok</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => navigate('/staff/spk-calculation')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Perhitungan SPK</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Hasil normalisasi SAW dan peringkat prioritas preferensi balita.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-purple-600">
            <span>Lihat Peringkat</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Tabel Data Dinamis Terfilter */}
      <div ref={tableSectionRef} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        {/* Header Tabel & Kontrol Pencarian */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {currentMeta.title}
              </h3>
              {activeFilter !== 'recent' && (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${currentMeta.badgeColor}`}>
                  {totalItems} Data
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentMeta.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Input Pencarian Cepat */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={dataType === 'children' ? "Cari nama balita / orang tua..." : "Cari balita / periode..."}
                className="pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden w-56 sm:w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tombol Reset Filter jika aktif */}
            {activeFilter !== 'recent' && (
              <button
                onClick={() => {
                  setActiveFilter('recent');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Tombol Navigasi ke Halaman Lengkap */}
            {activeFilter === 'pendingRegistration' && (
              <button
                onClick={() => navigate('/staff/registration-queue')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
              >
                <span>Antrean Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {(activeFilter === 'draftExams' || activeFilter === 'pendingVerification') && (
              <button
                onClick={() => navigate('/staff/examinations/pending')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold border border-teal-200 transition-colors cursor-pointer"
              >
                <span>Halaman Verifikasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {activeFilter === 'recent' && (
              <button
                onClick={() => navigate('/staff/examinations/pending')}
                className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
              >
                Lihat Semua
              </button>
            )}
          </div>
        </div>

        {/* Tabel Konten: Anak Baru vs Pemeriksaan */}
        {paginatedList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-2">
            <CheckCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">
              {searchQuery ? `Tidak ada hasil pencarian untuk "${searchQuery}"` : 'Tidak Ada Data dalam Kategori Ini'}
            </p>
            <p className="text-slate-400">
              {searchQuery ? 'Coba gunakan kata kunci lain.' : 'Kondisi data saat ini kosong atau telah diproses.'}
            </p>
            {activeFilter !== 'recent' && (
              <button
                onClick={() => {
                  setActiveFilter('recent');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors cursor-pointer"
              >
                <span>Kembali ke Kunjungan Terbaru</span>
              </button>
            )}
          </div>
        ) : dataType === 'children' ? (
          /* TABEL TIPE BALITA (UNTUK PENDAFTARAN BARU) */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-3 px-3.5">Nama Balita</th>
                  <th className="py-3 px-3.5">Gender</th>
                  <th className="py-3 px-3.5">Usia / Tgl Lahir</th>
                  <th className="py-3 px-3.5">Orang Tua</th>
                  <th className="py-3 px-3.5">Posyandu</th>
                  <th className="py-3 px-3.5">Status Pendaftaran</th>
                  <th className="py-3 px-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedList.map((child) => (
                  <tr key={child.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3.5 font-bold text-slate-900">
                      {child.name}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        child.sex === 'P' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {child.sex === 'P' ? '👧 Perempuan' : '👦 Laki-Laki'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-slate-600">
                      <div className="font-medium text-slate-800">{calculateAge(child.date_of_birth)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{child.date_of_birth}</div>
                    </td>
                    <td className="py-3.5 px-3.5 text-slate-700 font-medium">
                      {child.parent_name || 'Orang Tua'}
                    </td>
                    <td className="py-3.5 px-3.5 text-slate-600">
                      {child.posyandu_name || 'Posyandu Mawar Indah'}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <StatusBadge status={child.registration_status} />
                    </td>
                    <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate('/staff/registration-queue')}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors cursor-pointer mr-2"
                      >
                        Verifikasi
                      </button>
                      <button
                        onClick={() => navigate(`/staff/children/${child.id}`)}
                        className="text-teal-700 font-semibold hover:underline cursor-pointer"
                      >
                        Profil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* TABEL TIPE PEMERIKSAAN (DRAF, MENUNGGU VERIFIKASI, TERVERIFIKASI, PERLU EVALUASI, RECENT) */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-3 px-3.5">Nama Balita</th>
                  <th className="py-3 px-3.5">Tanggal</th>
                  <th className="py-3 px-3.5">Periode</th>
                  <th className="py-3 px-3.5">BB (kg)</th>
                  <th className="py-3 px-3.5">TB (cm)</th>
                  <th className="py-3 px-3.5">LK (cm)</th>
                  {activeFilter === 'needsAttention' && (
                    <th className="py-3 px-3.5">Indikator Perlu Evaluasi</th>
                  )}
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedList.map((exam) => {
                  const childName = getChildName(exam);
                  const isNeedReview = exam.status_flag === 'Perlu Tinjau';
                  const k1Low = exam.values?.K1 && Number(exam.values.K1) <= 2;
                  const k2Low = exam.values?.K2 && Number(exam.values.K2) <= 2;

                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3.5 font-bold text-slate-900">
                        {childName}
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-600 whitespace-nowrap">
                        {exam.examined_at?.split('T')[0] || '-'}
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-600 font-mono">
                        {exam.period_code || '-'}
                      </td>
                      <td className="py-3.5 px-3.5 font-semibold text-slate-800">
                        {exam.values?.C1 ?? exam.raw_values?.BB ?? '-'}
                      </td>
                      <td className="py-3.5 px-3.5 font-semibold text-slate-800">
                        {exam.values?.C2 ?? exam.raw_values?.TB ?? '-'}
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-700">
                        {exam.values?.C3 ?? exam.raw_values?.LK ?? '-'}
                      </td>
                      {activeFilter === 'needsAttention' && (
                        <td className="py-3.5 px-3.5">
                          <div className="flex flex-wrap gap-1">
                            {isNeedReview && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Perlu Tinjau
                              </span>
                            )}
                            {k1Low && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                BB Kurang (Skor {exam.values?.K1})
                              </span>
                            )}
                            {k2Low && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                                TB Pendek (Skor {exam.values?.K2})
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="py-3.5 px-3.5">
                        <StatusBadge status={exam.status} />
                      </td>
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        {exam.status === 'draft' ? (
                          <button
                            onClick={() => navigate('/staff/examinations/pending')}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Lanjutkan
                          </button>
                        ) : exam.status === 'pending_verification' ? (
                          <button
                            onClick={() => navigate('/staff/examinations/pending')}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Verifikasi
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/staff/children/${exam.child_id}`)}
                            className="text-teal-700 font-semibold hover:underline cursor-pointer"
                          >
                            Lihat Profil
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>
              Menampilkan {Math.min((currentPage - 1) * pageSize + 1, totalItems)} - {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} data
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-slate-100 font-semibold text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
