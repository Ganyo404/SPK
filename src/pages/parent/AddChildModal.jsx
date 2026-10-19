import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { childService } from '../../services/childService';
import { MOCK_POSYANDU } from '../../lib/mockData';
import { Baby, Calendar, Scale, Ruler, Building2, AlertCircle, Info } from 'lucide-react';

export function AddChildModal({ isOpen, onClose, parentId, parentName, onChildAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    sex: 'L',
    birthWeight: '',
    birthHeight: '',
    posyanduId: MOCK_POSYANDU[0]?.id || '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi Tanggal Lahir
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    if (dob > today) {
      setError('Tanggal lahir tidak boleh berada di masa depan.');
      return;
    }

    setLoading(true);

    try {
      const res = await childService.registerChild({
        parentId,
        parentName,
        posyanduId: formData.posyanduId,
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        sex: formData.sex,
        birthWeight: formData.birthWeight,
        birthHeight: formData.birthHeight,
      });

      if (res.error) {
        setError(res.error.message || 'Gagal mendaftarkan balita.');
      } else {
        onChildAdded(res.data);
        onClose();
        // Reset form
        setFormData({
          name: '',
          dateOfBirth: '',
          sex: 'L',
          birthWeight: '',
          birthHeight: '',
          posyanduId: MOCK_POSYANDU[0]?.id || '',
        });
      }
    } catch (err) {
      setError('Terjadi kendala saat menyimpan pendaftaran balita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pendaftaran Anak Balita Baru">
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Prosedur Posyandu */}
      <div className="mb-4 p-3.5 rounded-xl bg-teal-50 border border-teal-100 flex items-start gap-2.5 text-teal-900 text-xs leading-relaxed">
        <Info className="w-5 h-5 flex-shrink-0 text-teal-600 mt-0.5" />
        <p>
          Data anak akan disimpan dengan status <strong className="text-teal-950">Menunggu Verifikasi</strong>.
          Silakan bawa anak ke Posyandu terkait pada jadwal penimbangan berikutnya untuk pemeriksaan fisik dan verifikasi petugas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Nama Lengkap Anak
          </label>
          <div className="mt-1 relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Baby className="h-4 w-4" />
            </div>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Aisyah Putri Azzahra"
              className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tanggal Lahir
            </label>
            <div className="mt-1 relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Jenis Kelamin
            </label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, sex: 'L' })}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                  formData.sex === 'L'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Laki-Laki
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, sex: 'P' })}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                  formData.sex === 'P'
                    ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Perempuan
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Berat Lahir (kg) — Opsional
            </label>
            <div className="mt-1 relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Scale className="h-4 w-4" />
              </div>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="8.0"
                value={formData.birthWeight}
                onChange={(e) => setFormData({ ...formData, birthWeight: e.target.value })}
                placeholder="Misal: 3.2"
                className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Panjang Lahir (cm) — Opsional
            </label>
            <div className="mt-1 relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Ruler className="h-4 w-4" />
              </div>
              <input
                type="number"
                step="0.5"
                min="30"
                max="65"
                value={formData.birthHeight}
                onChange={(e) => setFormData({ ...formData, birthHeight: e.target.value })}
                placeholder="Misal: 49.5"
                className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Posyandu Terdekat
          </label>
          <div className="mt-1 relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Building2 className="h-4 w-4" />
            </div>
            <select
              value={formData.posyanduId}
              onChange={(e) => setFormData({ ...formData, posyanduId: e.target.value })}
              className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden bg-white"
            >
              {MOCK_POSYANDU.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.name} ({pos.village})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? 'Menyimpan...' : 'Daftarkan Anak'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
