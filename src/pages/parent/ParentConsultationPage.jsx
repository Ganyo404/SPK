import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { consultationService } from '../../services/consultationService';
import { childService } from '../../services/childService';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { MessageSquare, Send, Plus, Stethoscope, User, AlertCircle, Clock, ShieldAlert } from 'lucide-react';

export function ParentConsultationPage() {
  const { user, profile, role } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newMessage, setNewMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newChildId, setNewChildId] = useState('');
  const [initialMsg, setInitialMsg] = useState('');

  const fetchConsultations = async () => {
    setLoading(true);
    const [consRes, childRes] = await Promise.all([
      consultationService.getConsultationsByUser(user?.id || 'u-parent-1', 'parent'),
      childService.getChildrenByParent(user?.id || 'u-parent-1')
    ]);

    if (consRes.data) {
      setConsultations(consRes.data);
      if (consRes.data.length > 0 && !selectedConsultation) {
        setSelectedConsultation(consRes.data[0]);
      }
    }
    if (childRes.data) {
      setChildrenList(childRes.data);
      if (childRes.data.length > 0) setNewChildId(childRes.data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConsultations();
  }, [user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConsultation) return;

    const res = await consultationService.sendMessage(
      selectedConsultation.id,
      user?.id || 'u-parent-1',
      profile?.full_name || 'Siti Rahmawati',
      newMessage.trim()
    );

    if (res.data) {
      const updatedMessages = [...(selectedConsultation.messages || []), res.data];
      const updatedCons = { ...selectedConsultation, messages: updatedMessages };
      setSelectedConsultation(updatedCons);
      setConsultations(prev => prev.map(c => c.id === updatedCons.id ? updatedCons : c));
      setNewMessage('');
    }
  };

  const handleCreateConsultation = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !initialMsg.trim() || !newChildId) return;

    const res = await consultationService.createConsultation({
      parentId: user?.id || 'u-parent-1',
      parentName: profile?.full_name || 'Siti Rahmawati',
      childId: newChildId,
      title: newTitle.trim(),
      initialMessage: initialMsg.trim()
    });

    if (res.data) {
      setConsultations(prev => [res.data, ...prev]);
      setSelectedConsultation(res.data);
      setIsModalOpen(false);
      setNewTitle('');
      setInitialMsg('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Konsultasi Tenaga Kesehatan</h1>
          <p className="text-sm text-slate-500">Tanya jawab seputar gizi, imunisasi, dan perkembangan anak dengan Bidan Posyandu</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Mulai Konsultasi Baru</span>
        </button>
      </div>

      {/* Emergency Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600" />
        <p>
          <strong>Perhatian:</strong> Fitur konsultasi ini ditujukan untuk edukasi dan pemantauan rutin, bukan untuk penanganan kondisi darurat.
          Bila balita mengalami demam tinggi, sesak napas, atau kejang, segera bawa ke IGD Puskesmas atau RS terdekat.
        </p>
      </div>

      {loading ? (
        <LoadingState text="Memuat percakapan konsultasi..." />
      ) : consultations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Belum Ada Percakapan Konsultasi"
          description="Anda belum memiliki sesi konsultasi aktif dengan petugas Posyandu."
          action={
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Mulai Konsultasi</span>
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
          {/* Kolom Kiri: Daftar Thread Konsultasi */}
          <div className="border-r border-slate-200/80 divide-y divide-slate-100 overflow-y-auto">
            <div className="p-4 bg-slate-50/70 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Daftar Percakapan ({consultations.length})
              </span>
            </div>
            {consultations.map((item) => {
              const isSelected = selectedConsultation?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedConsultation(item)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-teal-50/70 border-l-4 border-l-teal-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded-md">
                      {item.child_name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.updated_at.split('T')[0]}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 truncate">{item.title}</h4>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      {item.assigned_staff_name || 'Bidan Posyandu'}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kolom Kanan: Detail Percakapan & Chat Stream */}
          <div className="md:col-span-2 flex flex-col justify-between h-[550px]">
            {selectedConsultation ? (
              <>
                {/* Header Chat */}
                <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      {selectedConsultation.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Balita: <strong className="text-slate-700">{selectedConsultation.child_name}</strong> • 
                      Nakes: <strong className="text-teal-700">{selectedConsultation.assigned_staff_name || 'Bidan Dewi'}</strong>
                    </p>
                  </div>
                  <StatusBadge status={selectedConsultation.status} />
                </div>

                {/* Pesan-Pesan */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                  {selectedConsultation.messages?.map((msg) => {
                    const isMe = msg.sender_id === (user?.id || 'u-parent-1');
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[11px] text-slate-400 mb-1 px-1">
                          {msg.sender_name} • {msg.created_at?.split('T')[1]?.substring(0, 5) || 'WIB'}
                        </span>
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-teal-600 text-white rounded-br-xs'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Kirim Pesan */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pertanyaan atau tanggapan..."
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                Pilih percakapan dari daftar di sebelah kiri
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Mulai Konsultasi Baru */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Mulai Konsultasi Baru">
        <form onSubmit={handleCreateConsultation} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pilih Anak Balita
            </label>
            <select
              value={newChildId}
              onChange={(e) => setNewChildId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:border-teal-600 outline-hidden"
            >
              {childrenList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.date_of_birth})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Topik Konsultasi
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Contoh: Berat badan seret / anak sulit makan (GTM)"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pertanyaan / Keluhan Awal
            </label>
            <textarea
              required
              rows={4}
              value={initialMsg}
              onChange={(e) => setInitialMsg(e.target.value)}
              placeholder="Jelaskan kondisi balita, keluhan asupan makan, atau pertanyaan vaksin yang ingin dikonsultasikan..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 outline-hidden"
            />
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
              Kirim Konsultasi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
