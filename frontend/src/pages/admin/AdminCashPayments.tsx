import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Inscription {
  id: string;
  first_name: string;
  last_name: string;
  section: string;
  gender: string;
  users?: {
    email: string;
    contact_phone?: string;
  };
}

interface PendingPayment {
  id: string;
  inscription_id: string;
  amount: number;
  payment_method: string;
  reference_code: string;
  created_at: string;
  notes?: string;
  inscriptions: Inscription;
}

const AdminCashPayments: React.FC = () => {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const response = await api.get('/payments?status=pending&payment_method=cash');
      // Filtrer pour garder uniquement les paiements en espèces
      const cashPayments = response.data.data.filter(
        (p: PendingPayment) => p.payment_method === 'cash'
      );
      setPendingPayments(cashPayments);
    } catch (error) {
      toast.error('Erreur lors du chargement des paiements en attente');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePayment = async (payment: PendingPayment) => {
    if (!window.confirm(`Confirmer la réception de ${payment.amount} FCFA en espèces de ${payment.inscriptions.first_name} ${payment.inscriptions.last_name} ?`)) {
      return;
    }

    setValidating(payment.id);
    try {
      await api.post(`/payments/validate-cash/${payment.inscription_id}`, {
        amount: payment.amount
      });

      toast.success(`Paiement validé pour ${payment.inscriptions.first_name} ${payment.inscriptions.last_name} !`);
      
      // Refresh list
      await fetchPendingPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
      console.error(error);
    } finally {
      setValidating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💵 Paiements en Espèces en Attente
            </h1>
            <p className="text-gray-600">
              Validez les paiements en espèces reçus des participants
            </p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">En attente</div>
                <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Montant total</div>
                <div className="text-2xl font-bold text-gray-900">
                  {pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} FCFA
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Action requise</div>
                <div className="text-sm text-yellow-600 font-medium mt-2">
                  {pendingPayments.length > 0 ? 'Validation nécessaire' : 'Aucune action'}
                </div>
              </div>
            </div>
          </div>

          {/* Liste des paiements */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {pendingPayments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun paiement en attente
                </h3>
                <p className="text-gray-600">
                  Tous les paiements en espèces ont été validés !
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date demande</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 font-semibold">
                                {payment.inscriptions.first_name.charAt(0)}{payment.inscriptions.last_name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.inscriptions.first_name} {payment.inscriptions.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{payment.inscriptions.users?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.inscriptions.users?.contact_phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.inscriptions.section}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{payment.amount.toLocaleString()} FCFA</div>
                          <div className="text-xs text-gray-500">💵 Espèces</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs font-mono text-gray-500">{payment.reference_code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                          <div className="text-xs">{new Date(payment.created_at).toLocaleTimeString('fr-FR')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleValidatePayment(payment)}
                            disabled={validating === payment.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            {validating === payment.id ? (
                              <>
                                <span className="inline-block animate-spin mr-2">⏳</span>
                                Validation...
                              </>
                            ) : (
                              '✅ Valider réception'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Vérifiez l'identité du participant avant de valider</li>
              <li>• Assurez-vous de recevoir le montant exact en espèces</li>
              <li>• La validation déclenche automatiquement l'assignation du dortoir</li>
              <li>• Le participant recevra un email de confirmation après validation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCashPayments;
