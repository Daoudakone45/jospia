import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

interface Inscription {
  id: string;
  status: string;
}

interface Payment {
  id: string;
  status: string;
}

interface DormitoryAssignment {
  dormitories: {
    name: string;
    gender: 'male' | 'female';
  };
}

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [inscription, setInscription] = useState<Inscription | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [dormitoryAssignment, setDormitoryAssignment] = useState<DormitoryAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Récupérer l'inscription
      const inscriptionRes = await api.get('/inscriptions/my-inscription');
      if (inscriptionRes.data.data) {
        const inscriptionData = inscriptionRes.data.data;
        setInscription(inscriptionData);

        // Récupérer le paiement
        try {
          const paymentRes = await api.get(`/payments/inscription/${inscriptionData.id}`);
          if (paymentRes.data.data) {
            setPayment(paymentRes.data.data);

            // Si paiement validé, récupérer l'affectation dortoir
            if (paymentRes.data.data.status === 'success') {
              try {
                const assignmentRes = await api.get(`/dormitories/assignment/${inscriptionData.id}`);
                if (assignmentRes.data.data) {
                  setDormitoryAssignment(assignmentRes.data.data);
                }
              } catch (err) {
                console.log('Pas encore d\'affectation dortoir');
              }
            }
          }
        } catch (err) {
          console.log('Pas encore de paiement');
        }
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Bienvenue, {user?.full_name || user?.email}
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-xl">Chargement...</div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-primary-600 text-3xl mb-2">📝</div>
                  <h3 className="font-bold text-lg mb-2">Mon Inscription</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {inscription ? 'Inscription complète' : 'Complétez votre inscription'}
                  </p>
                  <Link
                    to="/inscription"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    {inscription ? 'Voir détails →' : 'Commencer →'}
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-green-600 text-3xl mb-2">💳</div>
                  <h3 className="font-bold text-lg mb-2">Paiement</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {payment?.status === 'success' 
                      ? 'Paiement validé' 
                      : payment?.status === 'pending'
                      ? 'Paiement en attente'
                      : 'Effectuez votre paiement'}
                  </p>
                  {inscription && !payment && (
                    <Link
                      to={`/payment/${inscription.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Payer →
                    </Link>
                  )}
                  {payment?.status === 'success' && (
                    <Link
                      to={`/receipt/${payment.id}`}
                      className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
                    >
                      📄 Télécharger le reçu →
                    </Link>
                  )}
                  {payment?.status === 'pending' && (
                    <span className="text-yellow-600 text-sm font-medium">⏳ En attente</span>
                  )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-blue-600 text-3xl mb-2">🏠</div>
                  <h3 className="font-bold text-lg mb-2">Mon Dortoir</h3>
                  {dormitoryAssignment ? (
                    <>
                      <p className="text-gray-900 font-semibold mb-2">
                        {dormitoryAssignment.dormitories.name}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        dormitoryAssignment.dormitories.gender === 'male'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        {dormitoryAssignment.dormitories.gender === 'male' ? '👨 Hommes' : '👩 Femmes'}
                      </span>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 text-sm mb-4">
                        Informations sur votre hébergement
                      </p>
                      <span className="text-gray-400 text-sm">
                        {payment?.status === 'success' 
                          ? 'Attribution en cours...' 
                          : 'Disponible après paiement'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Statut de ma participation</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-700">Inscription</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      inscription
                        ? inscription.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {inscription 
                        ? inscription.status === 'confirmed' ? 'Confirmée' : 'En attente'
                        : 'Non complétée'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-700">Paiement</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      payment?.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : payment?.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {payment?.status === 'success' 
                        ? 'Validé'
                        : payment?.status === 'pending'
                        ? 'En attente'
                        : 'Non effectué'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-700">Attribution dortoir</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      dormitoryAssignment
                        ? 'bg-green-100 text-green-800'
                        : payment?.status === 'success'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {dormitoryAssignment
                        ? 'Attribué'
                        : payment?.status === 'success'
                        ? 'En cours'
                        : 'En attente'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

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
