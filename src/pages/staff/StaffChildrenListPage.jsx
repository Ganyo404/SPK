import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { childService } from '../../services/childService';
import { examinationService } from '../../services/examinationService';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Baby,
  Search,
  Calendar,
  Building2,
  Scale,
  Ruler,
  TrendingUp,
  Stethoscope,
  ChevronRight,
  Filter,
  UserCheck,
  History
} from 'lucide-react';

export function StaffChildrenListPage() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [childrenRes, examsRes] = await Promise.all([
        childService.getAllChildren(),
        examinationService.getAllExaminations()
      ]);

      if (childrenRes.data) setChildren(childrenRes.data);
      if (examsRes.data) setExaminations(examsRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Hitung usia balita
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
    return `${years > 0 ? `${years} thn ` : ''}${months} bln (${totalMonths} bln)`;
  };

  // Ambil riwayat penimbangan terbaru per balita
  const getLatestExam = (childId) => {
    const childExams = examinations
      .filter(e => e.child_id === childId && e.status === 'verified')
      .sort((a, b) => new Date(b.examined_at) - new Date(a.examined_at));
    return childExams[0] || null;
  };

  const getExamCount = (childId) => {
    return examinations.filter(e => e.child_id === childId).length;
  };

  // Filter daftar balita
  const filteredChildren = children.filter((child) => {
    const matchesSearch =
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (child.parent_name && child.parent_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (child.posyandu_name && child.posyandu_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const birthYear = new Date(child.date_of_birth).getFullYear().toString();
    const matchesCohort = selectedCohort === 'all' || birthYear === selectedCohort;

    return matchesSearch && matchesCohort;
  });

  // Kumpulan tahun lahir yang ada
  const availableCohorts = Array.from(
    new Set(children.map(c => new Date(c.date_of_birth).getFullYear()))
  ).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Baby className="w-7 h-7 text-teal-600" />
            <span>Data & Riwayat Balita Posyandu</span>
          </h1>
          <p className="text-sm text-slate-500">
            Daftar seluruh balita terdaftar, rekam medis penimbangan bulanan, dan grafik pertumbuhan fisik
          </p>
        </div>

        <button
          onClick={() => navigate('/staff/examination/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Catat Pemeriksaan Baru</span>
        </button>
      </div>

      {/* Filter & Pencarian */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama balita, nama orang tua, atau Posyandu..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:border-teal-600 outline-hidden"
          >
            <option value="all">Semua Tahun Kelahiran</option>
            {availableCohorts.map((year) => (
              <option key={year} value={year.toString()}>
                Kelahiran {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState text="Memuat basis data balita Posyandu..." />
      ) : filteredChildren.length === 0 ? (
        <EmptyState
          icon={Baby}
          title="Tidak Ada Balita Ditemukan"
          description={
            searchTerm || selectedCohort !== 'all'
              ? 'Tidak ada balita yang cocok dengan filter pencarian.'
              : 'Belum ada balita terdaftar di sistem Posyandu.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChildren.map((child) => {
            const latestExam = getLatestExam(child.id);
            const totalVisits = getExamCount(child.id);

            return (
              <div
                key={child.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Icon, Nama, Gender, Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                          child.sex === 'P'
                            ? 'bg-pink-50 text-pink-600 border border-pink-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}
                      >
                        <Baby className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {child.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span className="font-medium text-slate-700">
                            {child.sex === 'P' ? 'Perempuan' : 'Laki-Laki'}
                          </span>
                          <span>•</span>
                          <span>{calculateAge(child.date_of_birth)}</span>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={child.registration_status} />
                  </div>

                  {/* Metadata Posyandu & Orang Tua */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Orang Tua:</span>
                      </span>
                      <span className="font-semibold text-slate-800">{child.parent_name || 'Orang Tua Balita'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Posyandu:</span>
                      </span>
                      <span className="font-medium text-slate-700">{child.posyandu_name || 'Posyandu Mawar Indah'}</span>
                    </div>
                  </div>

                  {/* Data Timbangan & Pemeriksaan Terakhir */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-teal-600" />
                        <span>Kunjungan Terakhir ({latestExam ? latestExam.period_code : 'Belum Ada'})</span>
                      </span>
                      <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                        {totalVisits} Kunjungan Tercatat
                      </span>
                    </div>

                    {latestExam ? (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100">
                          <div className="text-[11px] text-teal-800 font-medium">Berat Badan</div>
                          <div className="text-base font-extrabold text-teal-900 mt-0.5">
                            {latestExam.values?.C1 || '-'} <span className="text-xs font-normal">kg</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                          <div className="text-[11px] text-blue-800 font-medium">Tinggi Badan</div>
                          <div className="text-base font-extrabold text-blue-900 mt-0.5">
                            {latestExam.values?.C2 || '-'} <span className="text-xs font-normal">cm</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                          <div className="text-[11px] text-purple-800 font-medium">LiLA Gizi</div>
                          <div className="text-base font-extrabold text-purple-900 mt-0.5">
                            {latestExam.values?.C4 || '-'} <span className="text-xs font-normal">cm</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        Belum ada data pemeriksaan terverifikasi
                      </div>
                    )}
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/staff/children/${child.id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                    <span>Lihat Riwayat & Grafik</span>
                  </button>

                  <button
                    onClick={() => navigate(`/staff/examination/new?childId=${child.id}`)}
                    className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                    title="Catat penimbangan bulan baru untuk balita ini"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Periksa</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
