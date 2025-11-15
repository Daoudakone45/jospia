import React from 'react';

const PaymentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-6">Paiement</h1>
            <p className="text-gray-600 mb-8">
              Cette page sera disponible prochainement. Vous pourrez effectuer votre paiement
              via Orange Money, MTN Money, Moov Money ou Wave.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-2">En développement</h3>
              <p className="text-blue-800 text-sm">
                La page de paiement avec intégration CinetPay est en cours de développement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
