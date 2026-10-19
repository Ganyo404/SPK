import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { childService } from '../../services/childService';
import { SummaryCard } from '../../components/ui/SummaryCard';
import { LoadingState } from '../../components/ui/LoadingState';
import {
  ShieldCheck,
  Users,
  Building2,
  Sliders,
  History,
  Baby,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [posyanduList, setPosyanduList] = useState([]);
  const [children, setChildren] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [uRes, pRes, cRes, lRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getPosyandus(),
        childService.getAllChildren(),
        adminService.getAuditLogs()
      ]);

      if (uRes.data) setUsers(uRes.data);
      if (pRes.data) setPosyanduList(pRes.data);
      if (cRes.data) setChildren(cRes.data);
      if (lRes.data) setLogs(lRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingState text="Memuat ringkasan sistem administrator..." />;
  }

  const staffCount = users.filter(u => u.role === 'staff').length;
  const parentCount = users.filter(u => u.role === 'parent').length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-slate-900 to-teal-900 p-6 lg:p-8 text-white shadow-lg">
        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/20">
          Administrator Panel
        </span>
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-2">
          Pusat Kontrol & Tata Kelola Operasional
        </h1>
        <p className="mt-1 text-sm text-purple-100/80 max-w-xl">
          Kelola hak akses pengguna, penugasan Posyandu, audit log, serta verifikasi konfigurasi AHP 6 Kriteria.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Pengguna"
          value={users.length}
          subtitle={`${staffCount} Petugas • ${parentCount} Orang Tua`}
          icon={Users}
          color="blue"
        />
        <SummaryCard
          title="Posyandu Terdaftar"
          value={posyanduList.length}
          subtitle="Lokasi penimbangan aktif"
          icon={Building2}
          color="teal"
        />
        <SummaryCard
          title="Total Balita"
          value={children.length}
          subtitle="Anak terdata di sistem"
          icon={Baby}
          color="emerald"
        />
        <SummaryCard
          title="Catatan Audit Log"
          value={logs.length}
          subtitle="Aktivitas terekam"
          icon={History}
          color="amber"
        />
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/admin/users')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Manajemen Pengguna & Peran</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Atur hak akses akun orang tua, tetapkan petugas Posyandu, dan tinjau data NIK terdaftar.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-purple-600">
            <span>Kelola Pengguna ({users.length})</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/ahp-config')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Konfigurasi AHP (6 Kriteria)</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Tinjau matriks perbandingan berpasangan, verifikasi nilai lambda max, CI, dan uji rasio konsistensi CR.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-teal-600">
            <span>Tinjau Matriks AHP</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/audit-logs')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Log Audit & Keamanan</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Pantau rekam jejak verifikasi pemeriksaan, perubahan konfigurasi, dan aktivitas penting sistem.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-amber-600">
            <span>Buka Log Aktivitas</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
