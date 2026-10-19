import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { childService } from '../../services/childService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Baby, Calendar, User, Building2, CheckCircle, Search, Stethoscope } from 'lucide-react';

export function ChildRegistrationQueue() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchChildren = async () => {
    setLoading(true);
    const { data } = await childService.getAllChildren();
    if (data) setChildren(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleApproveRegistration = async (childId) => {
    setProcessingId(childId);
    const res = await childService.updateRegistrationStatus(childId, 'active');
    if (!res.error) {
      setChildren(prev => prev.map(c => c.id === childId ? { ...c, registration_status: 'active' } : c));
    }
    setProcessingId(null);
  };

  const filtered = children.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.parent_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Antrean Pendaftaran Balita</h1>
          <p className="text-sm text-slate-500">Verifikasi fisik kedatangan balita baru dan tetapkan status aktif Posyandu</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama balita atau orang tua..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden"
        />
      </div>

      {loading ? (
        <LoadingState text="Memuat antrean pendaftaran balita..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Baby}
          title="Tidak Ada Pendaftaran"
          description="Seluruh pendaftaran balita telah diproses atau tidak ditemukan kata kunci yang cocok."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-3.5 px-4">Nama Balita</th>
                  <th className="py-3.5 px-4">Tgl Lahir / Usia</th>
                  <th className="py-3.5 px-4">Jenis Kelamin</th>
                  <th className="py-3.5 px-4">Nama Orang Tua</th>
                  <th className="py-3.5 px-4">Posyandu</th>
                  <th className="py-3.5 px-4">Status Pendaftaran</th>
                  <th className="py-3.5 px-4 text-right">Aksi Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => {
                  const isPending = c.registration_status === 'pending_registration';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">ID: {c.id}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-medium">{c.date_of_birth}</div>
                        <div className="text-[11px] text-slate-400">Tahun Lahir: {new Date(c.date_of_birth).getFullYear()}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {c.sex === 'P' ? 'Perempuan' : 'Laki-Laki'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {c.parent_name || 'Orang Tua'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {c.posyandu_name || 'Posyandu Mawar Indah'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.registration_status} />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {isPending ? (
                          <button
                            onClick={() => handleApproveRegistration(c.id)}
                            disabled={processingId === c.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{processingId === c.id ? 'Memproses...' : 'Verifikasi Hadir'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/staff/examination/new?childId=${c.id}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Catat Pemeriksaan</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
