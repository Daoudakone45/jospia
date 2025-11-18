import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  reference_code: string;
  receipt_number: string;
  status: string;
  payment_date: string;
  created_at: string;
  inscriptions?: {
    first_name: string;
    last_name: string;
    section: string;
    contact_phone: string;
  };
}

const ReceiptPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await paymentService.getById(paymentId!);
      setPayment(response);
    } catch (error: any) {
      console.error('Erreur chargement paiement:', error);
      toast.error('Impossible de charger les détails du paiement');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!paymentId) return;

    setDownloading(true);
    try {
      const response = await api.get(`/payments/${paymentId}/receipt`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Recu-JOSPIA-${payment?.receipt_number || paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Reçu téléchargé avec succès !');
    } catch (error: any) {
      console.error('Erreur téléchargement reçu:', error);
      toast.error('Erreur lors du téléchargement du reçu');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du reçu...</p>
        </div>
      </div>
    );
  }

  if (!payment || payment.status !== 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reçu non disponible</h2>
          <p className="text-gray-600 mb-6">
            {!payment ? 'Paiement introuvable' : 'Le reçu n\'est disponible que pour les paiements réussis'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const paymentDate = new Date(payment.payment_date || payment.created_at);
  const paymentMethods: Record<string, string> = {
    'orange': 'Orange Money',
    'mtn': 'MTN Money',
    'moov': 'Moov Money',
    'wave': 'Wave',
    'card': 'Carte bancaire'
  };

  const inscription = payment.inscriptions;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Actions */}
          <div className="mb-6 flex justify-between items-center no-print">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-green-600 hover:underline flex items-center gap-2"
            >
              ← Retour au tableau de bord
            </button>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                🖨️ Imprimer
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Téléchargement...
                  </>
                ) : (
                  <>📄 Télécharger PDF</>
                )}
              </button>
            </div>
          </div>

          {/* Reçu */}
          <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
            {/* Header */}
            <div className="border-b-2 border-green-600 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-green-700 mb-2">JOSPIA</h1>
                  <p className="text-sm text-gray-600">Journées Spirituelles Islamiques d'Anyama</p>
                  <p className="text-sm text-gray-600">20-27 Décembre 2025</p>
                  <p className="text-sm text-gray-600">Anyama, Côte d'Ivoire</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">REÇU DE PAIEMENT</h2>
                  <p className="text-sm text-gray-600">N° {payment.receipt_number}</p>
                </div>
              </div>
            </div>

            {/* Informations du paiement */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-600 mb-1">Date de paiement</p>
                <p className="font-medium">{paymentDate.toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Statut</p>
                <p className="font-medium text-green-600">✅ PAYÉ</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Méthode de paiement</p>
                <p className="font-medium">{paymentMethods[payment.payment_method] || payment.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Référence</p>
                <p className="font-mono text-sm font-medium">{payment.reference_code}</p>
              </div>
            </div>

            {/* Informations du participant */}
            {inscription && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Informations du participant</h3>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                    <p className="font-medium">{inscription.first_name} {inscription.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Section</p>
                    <p className="font-medium">{inscription.section}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                    <p className="font-medium">{inscription.contact_phone}</p>
                  </div>
                </div>
              </>
            )}

            {/* Montant */}
            <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-lg text-gray-700">Montant payé</span>
                <span className="text-3xl font-bold text-green-700">
                  {payment.amount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">TVA incluse (si applicable)</p>
            </div>

            {/* Footer */}
            <div className="border-t pt-6 text-center text-sm text-gray-600">
              <p className="mb-2">JOSPIA - Journées Spirituelles Islamiques d'Anyama</p>
              <p className="mb-2">Ce reçu est généré automatiquement et valide sans signature</p>
              <p>Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPage;
