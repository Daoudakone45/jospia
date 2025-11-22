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
    { id: 'wave', name: 'Wave', icon: '🔵', color: 'blue' },
    { id: 'cash', name: 'Espèces (à l\'admin)', icon: '💵', color: 'gray' }
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

  const handleMethodClick = (methodId: string) => {
    if (methodId === 'cash') {
      setSelectedMethod(methodId);
    } else {
      toast.error('Ce moyen de paiement n\'est pas encore disponible', { duration: 4000 });
      toast('📞 Veuillez choisir "Espèces" et contacter l\'admin pour valider votre paiement', {
        duration: 6000,
        icon: 'ℹ️'
      });
      toast('👤 Admin: Daoudakone - Contact disponible lors de l\'inscription', {
        duration: 6000,
        icon: '📱'
      });
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Veuillez sélectionner le paiement en espèces');
      return;
    }

    if (selectedMethod !== 'cash') {
      toast.error('Seul le paiement en espèces est disponible pour le moment');
      return;
    }

    setProcessing(true);
    try {
      toast.loading('Création de la demande de paiement...');
      
      await paymentService.createSimple({
        inscription_id: inscriptionId!,
        payment_method: 'cash'
      });

      toast.dismiss();
      toast.success('✅ Demande de paiement créée !');
      toast('💵 Veuillez vous présenter à l\'admin avec 5000 FCFA en espèces', {
        duration: 5000,
        icon: 'ℹ️'
      });
      
      setTimeout(() => {
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
            
            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm">
                <strong>ℹ️ Information :</strong> Seul le paiement en espèces est disponible actuellement.
                Veuillez contacter l'admin pour les autres moyens de paiement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodClick(method.id)}
                  disabled={method.id !== 'cash'}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedMethod === method.id
                      ? 'border-green-600 bg-green-50'
                      : method.id === 'cash'
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{method.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{method.name}</div>
                      {method.id !== 'cash' && (
                        <div className="text-xs text-red-600 mt-1">Indisponible</div>
                      )}
                    </div>
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
              <strong>💵 Paiement en espèces uniquement</strong><br/>
              Après validation, présentez-vous à l'admin avec le montant exact (5000 FCFA).
              L'admin validera votre paiement et vous serez automatiquement assigné à un dortoir.
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
