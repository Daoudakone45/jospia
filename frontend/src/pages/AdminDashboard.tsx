import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord Admin</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 mb-4">
            Cette page sera disponible prochainement pour les administrateurs.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">En développement</h3>
            <p className="text-blue-800 text-sm">
              Le tableau de bord administrateur avec statistiques, gestion des inscriptions,
              paiements et dortoirs est en cours de développement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
