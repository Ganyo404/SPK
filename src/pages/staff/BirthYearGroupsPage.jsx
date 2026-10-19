import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { spkService } from '../../services/spkService';
import { LoadingState } from '../../components/ui/LoadingState';
import { Users, Calendar, Calculator, CheckCircle2, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export function BirthYearGroupsPage() {
  const navigate = useNavigate();
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCohorts() {
      setLoading(true);
      const { data } = await spkService.getBirthYearCohorts();
      if (data) setCohorts(data);
      setLoading(false);
    }
    loadCohorts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelompok Tahun Kelahiran Balita</h1>
          <p className="text-sm text-slate-500">
            Pengelompokan dinamis cohort balita untuk memastikan alternatif SAW tidak tercampur antar tahun lahir
          </p>
        </div>
      </div>

      {/* Rules Banner */}
      <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-900 text-xs flex items-start gap-3 leading-relaxed">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-teal-700 mt-0.5" />
        <div>
          <strong className="block font-bold text-teal-950">Prinsip Isolasi SPK:</strong>
          Metode SAW mewajibkan perbandingan antar alternatif yang adil. Balita kelahiran 2024 hanya diperbandingkan
          dengan balita kelahiran 2024 pada periode penimbangan yang sama. Kunjungan dari tahun kelahiran berbeda tidak boleh digabung.
        </div>
      </div>

      {loading ? (
        <LoadingState text="Memuat data kelompok kelahiran balita..." />
      ) : cohorts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
          Belum ada balita yang terdaftar di sistem.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohorts.map((cohort) => (
            <div
              key={cohort.birthYear}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg">
                        Kelahiran {cohort.birthYear}
                      </h3>
                      <span className="text-xs text-slate-500">Cohort Balita Usia Aktif</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Balita Terdaftar:</span>
                    <strong className="text-slate-800 text-sm">{cohort.totalChildren} anak</strong>
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
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Periode Perhitungan Tersedia:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cohort.periods?.length > 0 ? (
                      cohort.periods.map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum ada periode</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate(`/staff/spk-calculation?birthYear=${cohort.birthYear}&period=${cohort.periods[0] || '2026-10'}`)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Buka Perhitungan & Ranking SPK</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
