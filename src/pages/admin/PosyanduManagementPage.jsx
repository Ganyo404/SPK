import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingState } from '../../components/ui/LoadingState';
import { Modal } from '../../components/ui/Modal';
import { Building2, Plus, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export function PosyanduManagementPage() {
  const [posyanduList, setPosyanduList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    rw_rt: '',
    village: '',
    district: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPosyandu = async () => {
    setLoading(true);
    const { data } = await adminService.getPosyandus();
    if (data) setPosyanduList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosyandu();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const res = await adminService.createPosyandu(formData);
    if (res.error) {
      setError(res.error.message || 'Gagal menambahkan Posyandu.');
    } else {
      setSuccess('Posyandu berhasil ditambahkan!');
      setPosyanduList(prev => [...prev, res.data]);
      setIsModalOpen(false);
      setFormData({ name: '', address: '', rw_rt: '', village: '', district: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" />
            <span>Manajemen Posyandu</span>
          </h1>
          <p className="text-sm text-slate-500">
            Daftar lokasi pos penimbangan dan fasilitas pemantauan balita terdaftar
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Posyandu Baru</span>
        </button>
      </div>

      {loading ? (
        <LoadingState text="Memuat daftar Posyandu..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posyanduList.map((pos) => (
            <div key={pos.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{pos.name}</h3>
                <p className="mt-2 text-xs text-slate-600 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>{pos.address}</span>
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{pos.village ? `Kel. ${pos.village}` : '-'}</span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Aktif
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Posyandu */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Posyandu Baru">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Posyandu
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Posyandu Kenanga Indah"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Alamat Lengkap
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Jl. Kenanga No. 5"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                RT / RW
              </label>
              <input
                type="text"
                value={formData.rw_rt}
                onChange={(e) => setFormData({ ...formData, rw_rt: e.target.value })}
                placeholder="RW 03 / RT 02"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kelurahan / Desa
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="Sukamaju"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold cursor-pointer"
            >
              Simpan Posyandu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
