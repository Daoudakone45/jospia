import api from '../lib/api';

export interface Payment {
  id: string;
  inscription_id: string;
  amount: number;
  payment_method: string;
  reference_code: string;
  status: 'pending' | 'success' | 'failed';
  cinetpay_payment_url?: string;
  created_at: string;
  updated_at: string;
}

export interface InitiatePaymentData {
  inscription_id: string;
  payment_method: string;
}

export const paymentService = {
  /**
   * Initier un paiement
   */
  async initiate(data: InitiatePaymentData): Promise<Payment> {
    const response = await api.post('/payments/initiate', data);
    return response.data.data;
  },

  /**
   * Récupérer un paiement par ID
   */
  async getById(id: string): Promise<Payment> {
    const response = await api.get(`/payments/${id}`);
    return response.data.data;
  },

  /**
   * Vérifier le statut d'un paiement
   */
  async checkStatus(id: string): Promise<Payment> {
    const response = await api.get(`/payments/${id}/status`);
    return response.data.data;
  },

  /**
   * Simuler un paiement réussi (pour les tests)
   */
  async simulate(paymentId: string): Promise<Payment> {
    const response = await api.post(`/payments/${paymentId}/simulate`);
    return response.data.data;
  }
};
