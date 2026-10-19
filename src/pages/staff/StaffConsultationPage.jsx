import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { consultationService } from '../../services/consultationService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { MessageSquare, Send, CheckCircle, Stethoscope, Baby, User } from 'lucide-react';

export function StaffConsultationPage() {
  const { user, profile } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');

  const fetchConsultations = async () => {
    setLoading(true);
    const { data } = await consultationService.getConsultationsByUser(user?.id || 'u-staff-1', 'staff');
    if (data) {
      setConsultations(data);
      if (data.length > 0 && !selectedConsultation) {
        setSelectedConsultation(data[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConsultations();
  }, [user]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConsultation) return;

    const res = await consultationService.sendMessage(
      selectedConsultation.id,
      user?.id || 'u-staff-1',
      profile?.full_name || 'Bdn. Dewi Anggraini, S.Tr.Keb',
      replyText.trim()
    );

    if (res.data) {
      const updatedMessages = [...(selectedConsultation.messages || []), res.data];
      const updatedCons = { ...selectedConsultation, messages: updatedMessages };
      setSelectedConsultation(updatedCons);
      setConsultations(prev => prev.map(c => c.id === updatedCons.id ? updatedCons : c));
      setReplyText('');
    }
  };

  const handleCloseConsultation = async () => {
    if (!selectedConsultation) return;
    const res = await consultationService.closeConsultation(selectedConsultation.id);
    if (!res.error) {
      const updated = { ...selectedConsultation, status: 'closed' };
      setSelectedConsultation(updated);
      setConsultations(prev => prev.map(c => c.id === updated.id ? updated : c));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-teal-600" />
          <span>Layanan Konsultasi Tenaga Kesehatan</span>
        </h1>
        <p className="text-sm text-slate-500">
          Tanggapi keluhan tumbuh kembang, pola makan, dan konsultasi kesehatan dari orang tua balita
        </p>
      </div>

      {loading ? (
        <LoadingState text="Memuat tiket konsultasi..." />
      ) : consultations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Tidak Ada Tiket Konsultasi"
          description="Belum ada orang tua yang mengirimkan konsultasi."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
          {/* Kolom Kiri: Daftar Konsultasi Masuk */}
          <div className="border-r border-slate-200/80 divide-y divide-slate-100 overflow-y-auto">
            <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Konsultasi Masuk ({consultations.length})
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
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      Orang Tua: {item.parent_name}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 truncate mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Baby className="w-3.5 h-3.5 text-teal-600" />
                    <span>Balita: <strong>{item.child_name}</strong></span>
                  </p>
                </div>
              );
            })}
          </div>

          {/* Kolom Kanan: Chat Feed & Tanggapan Nakes */}
          <div className="md:col-span-2 flex flex-col justify-between h-[550px]">
            {selectedConsultation ? (
              <>
                <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      {selectedConsultation.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Orang Tua: <strong className="text-slate-700">{selectedConsultation.parent_name}</strong> • 
                      Balita: <strong className="text-teal-700">{selectedConsultation.child_name}</strong>
                    </p>
                  </div>
                  {selectedConsultation.status !== 'closed' && (
                    <button
                      onClick={handleCloseConsultation}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>

                {/* Stream Pesan */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                  {selectedConsultation.messages?.map((msg) => {
                    const isStaff = msg.sender_id === (user?.id || 'u-staff-1');
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[11px] text-slate-400 mb-1 px-1">
                          {msg.sender_name} • {msg.created_at?.split('T')[1]?.substring(0, 5) || 'WIB'}
                        </span>
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isStaff
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

                {/* Form Balas Konsultasi */}
                {selectedConsultation.status !== 'closed' ? (
                  <form onSubmit={handleSendReply} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Tuliskan arahan medis / tanggapan Posyandu..."
                      className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-100 text-center text-xs text-slate-500">
                    Sesi konsultasi ini telah ditandai selesai.
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                Pilih percakapan dari daftar di sebelah kiri
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
