import React, { useState, useEffect } from 'react';
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
  Calendar
} from 'lucide-react';

export function StaffDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    pendingRegistration: 0,
    draftExams: 0,
    pendingVerification: 0,
    verifiedExams: 0,
    needsAttention: 0,
  });
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const [childrenRes, examsRes] = await Promise.all([
        childService.getAllChildren(),
        examinationService.getAllExaminations()
      ]);

      const children = childrenRes.data || [];
      const exams = examsRes.data || [];

      const pendingReg = children.filter(c => c.registration_status === 'pending_registration').length;
      const drafts = exams.filter(e => e.status === 'draft').length;
      const pendingVerif = exams.filter(e => e.status === 'pending_verification').length;
      const verified = exams.filter(e => e.status === 'verified').length;
      // Kriteria perhatian: LiLA < 12.5 cm atau Sakit >= 3 kali
      const alerts = exams.filter(e => (e.values?.C4 && e.values.C4 < 12.5) || (e.values?.C6 && e.values.C6 >= 3)).length;

      setMetrics({
        pendingRegistration: pendingReg,
        draftExams: drafts,
        pendingVerification: pendingVerif,
        verifiedExams: verified,
        needsAttention: alerts
      });

      setRecentExams(exams.slice(0, 5));
      setLoading(false);
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState text="Menghitung statistik Posyandu..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 p-6 lg:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-teal-300 uppercase tracking-wider bg-teal-500/20 px-3 py-1 rounded-full border border-teal-400/20">
            Panel Kerja Posyandu & Tenaga Kesehatan
          </span>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-2">
            Pusat Pemantauan Balita Sehat
          </h1>
          <p className="mt-1 text-sm text-teal-100/80 max-w-xl">
            Pencatatan pemeriksaan 6 kriteria, verifikasi fisik, pengelompokan tahun lahir, dan perhitungan SPK AHP + SAW.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/staff/examination/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-500 shadow-sm transition-all cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Catat Pemeriksaan</span>
          </button>
          <button
            onClick={() => navigate('/staff/spk-calculation')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-800 font-semibold text-sm hover:bg-slate-100 shadow-sm transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Hitung Ranking SPK</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Dashboard (Metrik dari Database Aktual) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Pendaftaran Baru"
          value={metrics.pendingRegistration}
          subtitle="Menunggu verifikasi fisik"
          icon={Baby}
          color="blue"
        />
        <SummaryCard
          title="Draf Pemeriksaan"
          value={metrics.draftExams}
          subtitle="Pencatatan belum rampung"
          icon={Clock}
          color="amber"
        />
        <SummaryCard
          title="Menunggu Verifikasi"
          value={metrics.pendingVerification}
          subtitle="Siap diverifikasi nakes"
          icon={Stethoscope}
          color="teal"
        />
        <SummaryCard
          title="Terverifikasi"
          value={metrics.verifiedExams}
          subtitle="Data pemeriksaan valid"
          icon={CheckCircle2}
          color="emerald"
        />
        <SummaryCard
          title="Perlu Evaluasi"
          value={metrics.needsAttention}
          subtitle="LiLA rendah / sering sakit"
          icon={AlertTriangle}
          color="rose"
        />
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
            <h3 className="font-bold text-slate-900 text-base">Verifikasi Pendaftaran Anak</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Konfirmasi kedatangan balita pertama kali di Posyandu dan tetapkan status aktif.
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
            <h3 className="font-bold text-slate-900 text-base">Kelompok Tahun Kelahiran</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Pengelompokan dinamis cohort balita (2024, 2025, dst) dan isolasi periode SPK.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-teal-600">
            <span>Lihat Kelompok Cohort</span>
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
            <h3 className="font-bold text-slate-900 text-base">Metode AHP + SAW</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Jalankan normalisasi SAW menggunakan bobot AHP tervalidasi per kelompok tahun lahir.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-purple-600">
            <span>Hitung & Lihat Ranking</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Pemeriksaan Terbaru */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Kunjungan Pemeriksaan Terbaru</h3>
            <p className="text-xs text-slate-500">Rekam catatan penimbangan yang baru masuk</p>
          </div>
          <button
            onClick={() => navigate('/staff/examinations/pending')}
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            Lihat Semua Kunjungan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">Nama Balita</th>
                <th className="py-3 px-3.5">Tgl Pemeriksaan</th>
                <th className="py-3 px-3.5">Periode</th>
                <th className="py-3 px-3.5">BB (kg)</th>
                <th className="py-3 px-3.5">TB (cm)</th>
                <th className="py-3 px-3.5">LiLA (cm)</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3.5 font-bold text-slate-900">
                    {exam.child_name || 'Balita'}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600">
                    {exam.examined_at?.split('T')[0]}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 font-mono">
                    {exam.period_code}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-800">
                    {exam.values?.C1 || '-'}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-800">
                    {exam.values?.C2 || '-'}
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">
                    {exam.values?.C4 || '-'}
                  </td>
                  <td className="py-3 px-3.5">
                    <StatusBadge status={exam.status} />
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() => navigate(`/parent/children/${exam.child_id}`)}
                      className="text-teal-700 font-semibold hover:underline"
                    >
                      Buka Profil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
