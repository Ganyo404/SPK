import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examinationService } from '../../services/examinationService';
import { spkService } from '../../services/spkService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Stethoscope, CheckCircle, Clock, Calendar, ArrowRight, User } from 'lucide-react';

export function PendingExaminationsPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchExams = async () => {
    setLoading(true);
    const { data } = await examinationService.getAllExaminations();
    if (data) {
      // Prioritaskan draft dan pending
      setExams(data.filter(e => e.status === 'draft' || e.status === 'pending_verification'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleVerify = async (exam) => {
    setVerifyingId(exam.id);
    const res = await examinationService.verifyExamination(
      exam.id,
      user?.id || 'u-staff-1',
      profile?.full_name || 'Bdn. Dewi Anggraini, S.Tr.Keb'
    );

    if (!res.error) {
      // Jalankan kalkulasi SAW
      await spkService.runCalculationForCohort({
        birthYear: exam.birth_year || 2024,
        periodCode: exam.period_code || '2026-10',
        createdBy: profile?.full_name || 'Petugas Posyandu'
      });
      // Refresh list
      setExams(prev => prev.filter(e => e.id !== exam.id));
    }
    setVerifyingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Draf & Menunggu Verifikasi</h1>
          <p className="text-sm text-slate-500">Daftar pemeriksaan fisik balita yang siap diverifikasi oleh tenaga kesehatan</p>
        </div>
      </div>

      {loading ? (
        <LoadingState text="Memuat daftar pemeriksaan..." />
      ) : exams.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Semua Pemeriksaan Telah Terverifikasi"
          description="Tidak ada draf pemeriksaan yang tertunda. Semua catatan kunjungan telah divalidasi."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {exams.map((exam) => (
              <div key={exam.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-base">{exam.child_name || 'Balita'}</h3>
                    <StatusBadge status={exam.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {exam.examined_at?.split('T')[0]}
                    </span>
                    <span>•</span>
                    <span className="font-mono">Periode: {exam.period_code}</span>
                    <span>•</span>
                    <span>Dicatat oleh: {exam.recorded_by_name || 'Petugas'}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      BB: <strong>{exam.values?.C1} kg</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      TB: <strong>{exam.values?.C2} cm</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      LK: <strong>{exam.values?.C3} cm</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      LiLA: <strong>{exam.values?.C4} cm</strong>
                    </span>
                  </div>

                  {exam.notes && (
                    <p className="mt-2 text-xs text-slate-600 italic">"{exam.notes}"</p>
                  )}
                </div>

                <div className="flex sm:flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleVerify(exam)}
                    disabled={verifyingId === exam.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{verifyingId === exam.id ? 'Memverifikasi...' : 'Verifikasi & Hitung'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
