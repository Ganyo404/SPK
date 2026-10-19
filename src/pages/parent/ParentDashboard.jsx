import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { childService } from '../../services/childService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { AddChildModal } from './AddChildModal';
import { Plus, Baby, Calendar, Building2, ChevronRight, Sparkles, Clock, AlertTriangle } from 'lucide-react';

export function ParentDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchChildren = async () => {
    setLoading(true);
    const { data } = await childService.getChildrenByParent(user?.id || 'u-parent-1');
    if (data) setChildren(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchChildren();
  }, [user]);

  const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    const totalMonths = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());

    if (years === 0) return `${months} Bulan (${totalMonths} bln)`;
    return `${years} Tahun ${months} Bulan (${totalMonths} bln)`;
  };

  const handleChildAdded = (newChild) => {
    setChildren(prev => [newChild, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold mb-3 border border-teal-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Orang Tua Balita</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {profile?.full_name || 'Bunda/Ayah'}!
          </h1>
          <p className="mt-2 text-sm text-teal-100/90 leading-relaxed">
            Pantau pertumbuhan, riwayat kunjungan Posyandu, serta edukasi gizi dan rekomendasi perkembangan anak Anda secara berkala.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-teal-800 font-semibold text-sm hover:bg-teal-50 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Anak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Children List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Anak Anda</h2>
            <p className="text-xs text-slate-500">Kelola dan lihat profil tumbuh kembang balita</p>
          </div>
          {children.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-600 text-teal-700 text-xs font-semibold hover:bg-teal-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Anak</span>
            </button>
          )}
        </div>

        {loading ? (
          <LoadingState text="Memuat data balita..." />
        ) : children.length === 0 ? (
          <EmptyState
            icon={Baby}
            title="Belum Ada Anak Terdaftar"
            description="Anda belum mendaftarkan anak balita. Daftarkan anak Anda sekarang untuk mulai memantau kunjungan Posyandu."
            action={
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Anak Sekarang</span>
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {children.map((child) => {
              const isPending = child.registration_status === 'pending_registration';
              return (
                <div
                  key={child.id}
                  onClick={() => navigate(`/parent/children/${child.id}`)}
                  className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base ${
                            child.sex === 'P'
                              ? 'bg-pink-50 text-pink-600 border border-pink-100'
                              : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}
                        >
                          <Baby className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-tight">
                            {child.name}
                          </h3>
                          <span className="text-xs text-slate-500">
                            {child.sex === 'P' ? 'Perempuan' : 'Laki-Laki'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <div className="mb-4">
                      <StatusBadge status={child.registration_status} />
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Lahir: {child.date_of_birth} ({calculateAge(child.date_of_birth)})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>{child.posyandu_name || 'Posyandu Belum Ditetapkan'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pending Notice or CTA */}
                  {isPending ? (
                    <div className="mt-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-[11px] text-amber-800 flex items-start gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                      <span>Menunggu verifikasi fisik di Posyandu saat penimbangan.</span>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-semibold group-hover:underline">
                      <span>Buka Profil Perkembangan</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        parentId={user?.id || 'u-parent-1'}
        parentName={profile?.full_name || 'Orang Tua'}
        onChildAdded={handleChildAdded}
      />
    </div>
  );
}
