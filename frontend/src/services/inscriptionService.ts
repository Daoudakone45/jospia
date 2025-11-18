import api from '../lib/api';

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
    const response = await api.post('/inscriptions', data);
    return response.data.data;
  },

  /**
   * Récupérer l'inscription de l'utilisateur connecté
   */
  async getMyInscription(): Promise<InscriptionResponse | null> {
    const response = await api.get('/inscriptions/my-inscription');
    return response.data.data;
  },

  /**
   * Récupérer toutes les inscriptions (Admin)
   */
  async getAll(filters?: {
    status?: string;
    section?: string;
    gender?: string;
  }): Promise<InscriptionResponse[]> {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await api.get(`/inscriptions?${params}`);
    return response.data.data;
  },

  /**
   * Récupérer une inscription par ID
   */
  async getById(id: string): Promise<any> {
    const response = await api.get(`/inscriptions/${id}`);
    return response.data;
  },

  /**
   * Mettre à jour le statut d'une inscription (Admin)
   */
  async updateStatus(
    inscriptionId: string,
    status: 'pending' | 'confirmed' | 'cancelled'
  ): Promise<void> {
    await api.patch(`/inscriptions/${inscriptionId}/status`, { status });
  },

  /**
   * Supprimer une inscription (Admin)
   */
  async delete(inscriptionId: string): Promise<void> {
    await api.delete(`/inscriptions/${inscriptionId}`);
  },
};
