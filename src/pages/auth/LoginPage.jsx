import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartPulse, Lock, Mail, ArrowRight, ShieldCheck, Stethoscope, UserCheck, AlertCircle, Info } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.error) {
        setError(res.error.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
      } else {
        const userRole = res.data?.profile?.role || role || 'parent';
        if (userRole === 'admin') navigate('/admin');
        else if (userRole === 'staff') navigate('/staff');
        else navigate('/parent');
      }
    } catch (err) {
      setError('Terjadi kendala saat menghubungkan ke sistem autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (selectedEmail, selectedPassword) => {
    setEmail(selectedEmail);
    setPassword(selectedPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30 mb-4">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          SPK Balita Sehat
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
          Sistem Pendukung Keputusan Pemantauan Pertumbuhan & Kesehatan Balita Posyandu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Alamat Email
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm placeholder:text-slate-400 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">
                  Kata Sandi
                </label>
              </div>
              <div className="mt-1.5 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm placeholder:text-slate-400 outline-hidden transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Memproses Masuk...' : 'Masuk ke Aplikasi'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Akun Pengujian yang Tersedia */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Akun Siap Digunakan
              </span>
              <span className="text-[11px] text-slate-400">Klik untuk isi cepat</span>
            </div>

            <div className="space-y-2">
              {/* Dokter */}
              <button
                type="button"
                onClick={() => handleSelectAccount('dokter@gmail.com', '123')}
                className="w-full p-2.5 rounded-xl bg-teal-50/70 hover:bg-teal-100/80 border border-teal-200/80 flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Dokter / Tenaga Medis
                    </div>
                    <div className="text-[11px] text-teal-700 font-mono">
                      dokter@gmail.com • Sandi: 123
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-teal-700 font-semibold group-hover:underline">Pilih</span>
              </button>

              {/* Admin */}
              <button
                type="button"
                onClick={() => handleSelectAccount('admin@gmail.com', '123')}
                className="w-full p-2.5 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Administrator Sistem
                    </div>
                    <div className="text-[11px] text-purple-700 font-mono">
                      admin@gmail.com • Sandi: 123
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-purple-700 font-semibold group-hover:underline">Pilih</span>
              </button>

              {/* Orang Tua */}
              <button
                type="button"
                onClick={() => handleSelectAccount('user@gmail.com', '123')}
                className="w-full p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      User / Orang Tua
                    </div>
                    <div className="text-[11px] text-blue-700 font-mono">
                      user@gmail.com • Sandi: 123
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-blue-700 font-semibold group-hover:underline">Pilih</span>
              </button>
            </div>

            {/* Catatan Ketentuan Registrasi */}
            <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                Akun Dokter & Admin dikelola manual melalui database. Pendaftaran akun baru publik hanya diperuntukkan bagi <strong>Orang Tua Balita</strong>.
              </span>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-600">
            Belum memiliki akun orang tua?{' '}
            <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
