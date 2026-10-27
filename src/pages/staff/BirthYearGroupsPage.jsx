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

export function BirthYearGroupsPage() {
  const navigate = useNavigate();
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('10');
  const [selectedYear, setSelectedYear] = useState('2026');

  const periodCode = `${selectedYear.trim() || '2026'}-${selectedMonth}`;

  useEffect(() => {
    async function loadCohorts() {
      setLoading(true);
      const data = await spkService.getAgeGroupCohorts(periodCode);
      if (data) setCohorts(data);
      setLoading(false);
    }
    loadCohorts();
  }, [periodCode]);

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

      {/* Selector Periode Penimbangan & Realtime Indicator */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Periode Evaluasi Kelompok Umur</h2>
            <p className="text-xs text-slate-500">
              Ubah bulan & tahun di bawah untuk melihat pergeseran kelompok balita secara real-time
            </p>
          </div>
        </div>

        {/* Input Bulan & Tahun */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all cursor-pointer"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            placeholder="2026"
            min="2020"
            max="2030"
            className="w-20 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-semibold text-slate-800 text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
          />

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold font-mono">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>{periodCode}</span>
          </span>
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
                      `/staff/spk-calculation?ageGroupId=${cohort.id}&period=${periodCode}`
                    )
                  }
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Buka Ranking SPK ({periodCode})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
