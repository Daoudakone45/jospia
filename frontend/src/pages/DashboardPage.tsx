import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Bienvenue, {user?.full_name || user?.email}
          </h1>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-600 text-3xl mb-2">📝</div>
              <h3 className="font-bold text-lg mb-2">Mon Inscription</h3>
              <p className="text-gray-600 text-sm mb-4">
                Gérez vos informations d'inscription
              </p>
              <Link
                to="/inscription"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Voir détails →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-600 text-3xl mb-2">💳</div>
              <h3 className="font-bold text-lg mb-2">Paiement</h3>
              <p className="text-gray-600 text-sm mb-4">
                Effectuez ou vérifiez votre paiement
              </p>
              <Link
                to="/payment"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Accéder →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-2">🏠</div>
              <h3 className="font-bold text-lg mb-2">Mon Dortoir</h3>
              <p className="text-gray-600 text-sm mb-4">
                Informations sur votre hébergement
              </p>
              <span className="text-gray-400 text-sm">
                Disponible après paiement
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Statut de ma participation</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-700">Inscription</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  En attente
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-700">Paiement</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                  Non effectué
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-700">Attribution dortoir</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                  En attente
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-primary-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2 text-primary-800">
              📅 Dates importantes
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Séminaire : 28 décembre 2025 - 03 janvier 2026</li>
              <li>• Clôture des inscriptions : 15 décembre 2025</li>
              <li>• Date limite de paiement : 18 décembre 2025</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
