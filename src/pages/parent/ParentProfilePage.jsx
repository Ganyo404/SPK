import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, CreditCard, MapPin, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function ParentProfilePage() {
  const { profile } = useAuth();
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil Akun Orang Tua</h1>
        <p className="text-sm text-slate-500">Informasi identitas kepala keluarga / wali yang terdaftar di sistem</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {profile?.full_name ? profile.full_name[0] : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{profile?.full_name || 'Siti Rahmawati'}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Akun Terverifikasi
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Nomor Induk Kependudukan (NIK)</span>
            <div className="flex items-center gap-2 text-slate-800 font-mono font-bold text-sm">
              <CreditCard className="w-4 h-4 text-teal-600" />
              <span>{profile?.nik || '3201015504950001'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Alamat Email</span>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Mail className="w-4 h-4 text-teal-600" />
              <span>{profile?.email || 'orangtua@spkbalita.id'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Nomor WhatsApp / HP</span>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Phone className="w-4 h-4 text-teal-600" />
              <span>{profile?.phone || '081234567890'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Peran Akses</span>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <User className="w-4 h-4 text-teal-600" />
              <span className="capitalize">{profile?.role || 'Orang Tua'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <span className="text-slate-400 block mb-1">Alamat Lengkap</span>
          <div className="flex items-start gap-2 text-slate-800 font-medium text-sm">
            <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <span>{profile?.address || 'Jl. Melati Raya No. 14, RT 03/RW 02, Cilodong'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
