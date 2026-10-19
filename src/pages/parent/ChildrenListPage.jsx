import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { childService } from '../../services/childService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { AddChildModal } from './AddChildModal';
import { Baby, Plus, Search, Calendar, ChevronRight } from 'lucide-react';

export function ChildrenListPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [children, setChildren] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredChildren = children.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daftar Anak Saya</h1>
          <p className="text-sm text-slate-500">Kelola informasi seluruh anak yang terdaftar di akun Anda</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Anak</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama anak..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden"
        />
      </div>

      {loading ? (
        <LoadingState text="Memuat daftar anak..." />
      ) : filteredChildren.length === 0 ? (
        <EmptyState
          icon={Baby}
          title="Tidak Ada Anak Ditemukan"
          description={searchTerm ? 'Tidak ada anak yang cocok dengan kata kunci pencarian.' : 'Belum ada anak yang terdaftar.'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredChildren.map((child) => (
              <div
                key={child.id}
                onClick={() => navigate(`/parent/children/${child.id}`)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${
                      child.sex === 'P'
                        ? 'bg-pink-50 text-pink-600 border border-pink-100'
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}
                  >
                    <Baby className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                      {child.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{child.sex === 'P' ? 'Perempuan' : 'Laki-Laki'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {child.date_of_birth}
                      </span>
                      <span>•</span>
                      <span>{child.posyandu_name || 'Posyandu Mawar'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={child.registration_status} />
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddChildModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        parentId={user?.id || 'u-parent-1'}
        parentName={profile?.full_name || 'Orang Tua'}
        onChildAdded={(newChild) => setChildren(prev => [newChild, ...prev])}
      />
    </div>
  );
}
