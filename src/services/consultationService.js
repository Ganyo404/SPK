import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_CONSULTATIONS, MOCK_CHILDREN } from '../lib/mockData';

let consultationStore = [...MOCK_CONSULTATIONS];

export const consultationService = {
  async getConsultationsByUser(userId, role) {
    if (isSupabaseConfigured()) {
      let query = supabase.from('consultations').select('*, child:child_id(name), parent:parent_id(full_name)');
      if (role === 'parent') {
        query = query.eq('parent_id', userId);
      } else if (role === 'staff') {
        query = query.or(`assigned_staff_id.eq.${userId},assigned_staff_id.is.null`);
      }
      const { data, error } = await query.order('updated_at', { ascending: false });
      return { data, error };
    }

    if (role === 'parent') {
      return { data: consultationStore.filter(c => c.parent_id === userId), error: null };
    }
    // Staff & Admin sees all or assigned
    return { data: [...consultationStore], error: null };
  },

  async getConsultationById(id) {
    const found = consultationStore.find(c => c.id === id);
    if (!found) return { data: null, error: { message: 'Konsultasi tidak ditemukan.' } };
    return { data: found, error: null };
  },

  async createConsultation({ parentId, parentName, childId, title, initialMessage }) {
    const child = MOCK_CHILDREN.find(c => c.id === childId);
    const newConsultation = {
      id: `cons-${Date.now()}`,
      parent_id: parentId,
      parent_name: parentName,
      child_id: childId,
      child_name: child?.name || 'Balita',
      assigned_staff_id: 'u-staff-1',
      assigned_staff_name: 'Bdn. Dewi Anggraini, S.Tr.Keb',
      title,
      status: 'open',
      updated_at: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender_id: parentId,
          sender_name: parentName,
          message: initialMessage,
          created_at: new Date().toISOString()
        }
      ]
    };

    consultationStore.unshift(newConsultation);
    return { data: newConsultation, error: null };
  },

  async sendMessage(consultationId, senderId, senderName, messageText) {
    const idx = consultationStore.findIndex(c => c.id === consultationId);
    if (idx === -1) {
      return { data: null, error: { message: 'Konsultasi tidak ditemukan.' } };
    }

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender_id: senderId,
      sender_name: senderName,
      message: messageText,
      created_at: new Date().toISOString()
    };

    consultationStore[idx].messages.push(newMsg);
    consultationStore[idx].updated_at = new Date().toISOString();
    return { data: newMsg, error: null };
  },

  async closeConsultation(consultationId) {
    const idx = consultationStore.findIndex(c => c.id === consultationId);
    if (idx !== -1) {
      consultationStore[idx].status = 'closed';
      return { data: consultationStore[idx], error: null };
    }
    return { data: null, error: { message: 'Konsultasi tidak ditemukan.' } };
  }
};
