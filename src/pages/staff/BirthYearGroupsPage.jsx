import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { spkService } from '../../services/spkService';
import { LoadingState } from '../../components/ui/LoadingState';
import {
  Users,
  Calendar,
  Calculator,
  ShieldCheck,
  BookOpen,
  Info,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export function BirthYearGroupsPage() {
  const navigate = useNavigate();
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCohorts() {
      setLoading(true);
      const data = await spkService.getAgeGroupCohorts('2026-10');
      if (data) setCohorts(data);
      setLoading(false);
    }
    loadCohorts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title & Research Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-teal-600" />
            <span>Usulan Kelompok Umur untuk Penelitian SPK</span>
          </h1>
          <p className="text-sm text-slate-500">
            Rentang dalam bulan lengkap; bukan klasifikasi resmi WHO atau Kemenkes.
          </p>
        </div>
      </div>

      {/* Rationale Banner */}
      <div className="p-5 rounded-3xl bg-teal-50 border border-teal-200/80 text-teal-900 text-xs flex items-start gap-3.5 leading-relaxed shadow-xs">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-teal-700 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold text-teal-950 text-sm">
            Prinsip Keadilan Pemeringkatan SPK (AHP + SAW):
          </strong>
          <p>
            Pengelompokan berbasis tahun kalender murni dapat menimbulkan ketimpangan (misal bayi lahir Januari vs Desember berselisih hingga 11 bulan).
            Oleh karena itu, sistem membagi balita ke dalam <strong>8 kelompok umur berbasis bulan lengkap</strong> agar alternatif SAW
            hanya diperbandingkan secara setara dan adil sesuai tahapan perkembangan gizi dan antropometri balita.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState text="Memuat data 8 kelompok umur penelitian SPK..." />
      ) : cohorts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
          Belum ada data balita yang terdaftar di sistem.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cohorts.map((cohort) => (
            <div
              key={cohort.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      #{cohort.id}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">
                        {cohort.shortName}
                      </h3>
                      <span className="text-[11px] font-semibold text-teal-700">
                        {cohort.rangeLabel}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                    {cohort.minMonths}-{cohort.maxMonths} bln
                  </span>
                </div>

                {/* Dasar Pertimbangan Card */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 mt-2">
                  <span className="font-bold text-slate-700 block mb-0.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-teal-600" />
                    <span>Dasar Pertimbangan:</span>
                  </span>
                  <p className="italic leading-snug">{cohort.consideration}</p>
                </div>

                {/* Statistik Balita Terdaftar & Pemeriksaan */}
                <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Balita di Rentang Ini:</span>
                    <strong className="text-slate-800 font-semibold">{cohort.totalChildren} anak</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pemeriksaan Terverifikasi:</span>
                    <span className="font-bold text-emerald-600">{cohort.verifiedExamsCount} data</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Menunggu Verifikasi:</span>
                    <span className="font-bold text-amber-600">{cohort.pendingExamsCount} data</span>
                  </div>
                </div>

                {/* Periode Tersedia */}
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Periode Riwayat:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cohort.periods?.length > 0 ? (
                      cohort.periods.slice(0, 3).map((p) => (
                        <span key={p} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-medium">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Belum ada periode</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() =>
                    navigate(
                      `/staff/spk-calculation?ageGroupId=${cohort.id}&period=${cohort.periods[0] || '2026-10'}`
                    )
                  }
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Buka Ranking SPK</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
