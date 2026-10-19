import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { childService } from '../../services/childService';
import { examinationService } from '../../services/examinationService';
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
  Info
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

export function ChildProfilePage() {
  const { childId } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamDetail, setSelectedExamDetail] = useState(null);

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

  // Data Grafik Pertumbuhan Fisik (diurutkan kronologis tanggal lama ke baru)
  const chartData = [...verifiedExams]
    .sort((a, b) => new Date(a.examined_at) - new Date(b.examined_at))
    .map(e => ({
      date: e.period_code || e.examined_at.split('T')[0],
      beratBadan: e.values?.C1 || 0,
      tinggiBadan: e.values?.C2 || 0,
      lingkarKepala: e.values?.C3 || 0,
      lila: e.values?.C4 || 0,
    }));

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
                    <span>Peringkat Kelompok Lahir {latestVerifiedExam.birth_year}:</span>
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

            {/* Nilai 6 Kriteria Fisik Kunjungan Terakhir */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Hasil Pengukuran 6 Kriteria Terakhir
                  </h3>
                  <p className="text-xs text-slate-500">Pemeriksaan tanggal {latestVerifiedExam.examined_at.split('T')[0]}</p>
                </div>
                <StatusBadge status="verified" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Scale className="w-3.5 h-3.5 text-teal-600" />
                    <span>Berat Badan (C1)</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVerifiedExam.values?.C1} <span className="text-xs font-normal text-slate-500">kg</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Ruler className="w-3.5 h-3.5 text-teal-600" />
                    <span>Tinggi Badan (C2)</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVerifiedExam.values?.C2} <span className="text-xs font-normal text-slate-500">cm</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Brain className="w-3.5 h-3.5 text-teal-600" />
                    <span>Lingkar Kepala (C3)</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVerifiedExam.values?.C3} <span className="text-xs font-normal text-slate-500">cm</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>LiLA Gizi (C4)</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVerifiedExam.values?.C4} <span className="text-xs font-normal text-slate-500">cm</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Imunisasi (C5)</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVerifiedExam.values?.C5} <span className="text-xs font-normal text-slate-500">%</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Heart className="w-3.5 h-3.5 text-teal-600" />
                    <span>Sakit 6 Bln (C6)</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVerifiedExam.values?.C6} <span className="text-xs font-normal text-slate-500">kali</span>
                  </p>
                </div>
              </div>

              {latestVerifiedExam.notes && (
                <div className="mt-4 p-3 rounded-xl bg-teal-50/50 border border-teal-100 text-xs text-teal-900">
                  <span className="font-bold">Catatan Petugas Posyandu:</span> {latestVerifiedExam.notes}
                </div>
              )}
            </div>
          </div>

          {/* Bagian D: Grafik Perkembangan Fisik Anak (Recharts) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <span>Grafik Perkembangan Fisik Balita</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Kurva historis kenaikan Berat Badan (kg) dan Tinggi Badan (cm) berdasarkan kunjungan Posyandu
                </p>
              </div>
              <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                Terpisah dari Skor SAW
              </span>
            </div>

            {chartData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#0d9488" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="beratBadan"
                      name="Berat Badan (kg)"
                      stroke="#0d9488"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0d9488' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="tinggiBadan"
                      name="Tinggi Badan (cm)"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#3b82f6' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">Data kunjungan belum cukup untuk menampilkan grafik.</p>
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
                    <th className="py-3 px-3.5">BB (kg)</th>
                    <th className="py-3 px-3.5">TB (cm)</th>
                    <th className="py-3 px-3.5">LiLA (cm)</th>
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
                        {exam.values?.C1 ?? '-'}
                      </td>
                      <td className="py-3.5 px-3.5 font-semibold text-slate-800">
                        {exam.values?.C2 ?? '-'}
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-700">
                        {exam.values?.C4 ?? '-'}
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
                          className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs transition-colors"
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
            Hasil pemeriksaan fisik 6 kriteria akan tampil di halaman ini secara otomatis setelah petugas Posyandu
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
              <p className="font-bold text-slate-800 mb-2">Nilai 6 Kriteria Fisik:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500 block">C1. Berat Badan (BB)</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedExamDetail.values?.C1} kg</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500 block">C2. Tinggi Badan (TB)</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedExamDetail.values?.C2} cm</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500 block">C3. Lingkar Kepala</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedExamDetail.values?.C3} cm</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500 block">C4. LiLA Gizi</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedExamDetail.values?.C4} cm</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500 block">C5. Imunisasi Dasar</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedExamDetail.values?.C5} %</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500 block">C6. Frekuensi Sakit</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedExamDetail.values?.C6} kali</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-100">
              <span className="font-bold text-teal-900 block mb-1">Hasil Perhitungan SPK (AHP + SAW):</span>
              <p className="text-teal-800">Skor Preferensi: <strong>{selectedExamDetail.saw_score != null ? selectedExamDetail.saw_score.toFixed(4) : '-'}</strong></p>
              <p className="text-teal-800">Peringkat Kelompok: <strong>#{selectedExamDetail.saw_rank || '-'}</strong></p>
              <p className="text-[11px] text-teal-700 mt-1">Konfigurasi: Versi Algoritma AHP-SAW-v1.0 (6 Kriteria)</p>
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
