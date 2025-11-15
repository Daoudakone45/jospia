import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface InscriptionData {
  first_name: string;
  last_name: string;
  age: number;
  residence_location: string;
  contact_phone: string;
  gender: string;
  section: string;
  health_condition: string;
  guardian_name: string;
  guardian_contact: string;
}

export interface InscriptionResponse {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
}

export const inscriptionService = {
  /**
   * Créer une nouvelle inscription
   */
  async create(data: InscriptionData): Promise<InscriptionResponse> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/inscriptions`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Récupérer l'inscription de l'utilisateur connecté
   */
  async getMyInscription(): Promise<InscriptionResponse | null> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/inscriptions/my-inscription`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Récupérer toutes les inscriptions (Admin)
   */
  async getAll(filters?: {
    status?: string;
    section?: string;
    gender?: string;
  }): Promise<InscriptionResponse[]> {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await axios.get(`${API_URL}/inscriptions?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Mettre à jour le statut d'une inscription (Admin)
   */
  async updateStatus(
    inscriptionId: string,
    status: 'pending' | 'confirmed' | 'cancelled'
  ): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.patch(
      `${API_URL}/inscriptions/${inscriptionId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Supprimer une inscription (Admin)
   */
  async delete(inscriptionId: string): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/inscriptions/${inscriptionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
