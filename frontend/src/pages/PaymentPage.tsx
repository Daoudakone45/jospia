import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { inscriptionService } from '../services/inscriptionService';
import toast from 'react-hot-toast';

interface InscriptionDetails {
  id: string;
  first_name: string;
  last_name: string;
  section: string;
  ticket_price: number;
  status: string;
}

const PaymentPage: React.FC = () => {
  const { inscriptionId } = useParams<{ inscriptionId: string }>();
  const navigate = useNavigate();
  
  const [inscription, setInscription] = useState<InscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const paymentMethods = [
    { id: 'orange_money', name: 'Orange Money', icon: '🟠', color: 'orange' },
    { id: 'mtn_money', name: 'MTN Money', icon: '🟡', color: 'yellow' },
    { id: 'moov_money', name: 'Moov Money', icon: '🟢', color: 'green' },
    { id: 'wave', name: 'Wave', icon: '🔵', color: 'blue' }
  ];

  useEffect(() => {
    fetchInscription();
  }, [inscriptionId]);

  const fetchInscription = async () => {
    try {
      const response = await inscriptionService.getById(inscriptionId!);
      setInscription(response.data);
    } catch (error: any) {
      console.error('Erreur chargement inscription:', error);
      toast.error('Impossible de charger les détails de l\'inscription');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Veuillez sélectionner une méthode de paiement');
      return;
    }

    setProcessing(true);
    try {
      toast.loading('Traitement du paiement...');
      
      // Créer le paiement simulé directement
      await paymentService.createSimple({
        inscription_id: inscriptionId!,
        payment_method: selectedMethod
      });

      toast.dismiss();
      toast.success('🎉 Paiement effectué avec succès !');
      
      // Attendre 1 seconde puis rediriger
      setTimeout(() => {
        toast.success('✅ Dortoir attribué automatiquement !');
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      toast.dismiss();
      console.error('Erreur paiement:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!inscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Inscription introuvable</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-green-600 hover:underline"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-green-600 hover:underline mb-4 flex items-center gap-2"
            >
              ← Retour au tableau de bord
            </button>
            <h1 className="text-3xl font-bold text-gray-900">💳 Paiement de l'inscription</h1>
          </div>

          {/* Inscription Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">📋 Récapitulatif</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Participant :</span>
                <span className="font-medium">{inscription.first_name} {inscription.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Section :</span>
                <span className="font-medium">{inscription.section}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut :</span>
                <span className={`font-medium ${inscription.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {inscription.status === 'confirmed' ? '✅ Confirmé' : '⏳ En attente'}
                </span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Montant à payer :</span>
                  <span className="text-2xl font-bold text-green-600">
                    {inscription.ticket_price.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">📱 Méthode de paiement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedMethod === method.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{method.icon}</span>
                    <span className="font-medium">{method.name}</span>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="mt-2 text-green-600 text-sm">✅ Sélectionné</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={handlePayment}
              disabled={!selectedMethod || processing}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Traitement en cours...
                </span>
              ) : (
                '💰 Payer 5000 FCFA'
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-yellow-800 text-sm text-center">
              <strong>Mode simulation :</strong> Le paiement est simulé automatiquement (pas besoin d'API réelle)
            </p>
          </div>

          {/* Security Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
            <p className="text-gray-600 text-sm text-center">
              🔒 Paiement sécurisé. Vos données sont protégées.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
