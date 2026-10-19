import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingState } from '../../components/ui/LoadingState';
import { History, Shield, Calendar, User, Search } from 'lucide-react';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const { data } = await adminService.getAuditLogs();
      if (data) setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.actor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-purple-600" />
            <span>Log Audit & Aktivitas Sistem</span>
          </h1>
          <p className="text-sm text-slate-500">
            Rekam jejak setiap tindakan penting: verifikasi medis, perubahan konfigurasi, dan pembaruan data
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="relative max-w-md">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari aksi atau pelaku audit..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-purple-600 outline-hidden"
        />
      </div>

      {loading ? (
        <LoadingState text="Memuat catatan audit log..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
          Tidak ada log aktivitas yang cocok.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-3.5 px-4">Waktu Eksekusi</th>
                  <th className="py-3.5 px-4">Pelaku (Aktor)</th>
                  <th className="py-3.5 px-4">Aksi Sistem</th>
                  <th className="py-3.5 px-4">Entitas Terkait</th>
                  <th className="py-3.5 px-4">Keterangan / Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {log.created_at?.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {log.actor_name || 'System / Admin'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {log.entity_type} ({log.entity_id?.substring(0, 8)}...)
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {log.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
