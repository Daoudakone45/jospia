import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const menuItems = [
    {
      title: 'Inscriptions',
      description: 'Gérer les inscriptions des participants',
      icon: '📝',
      link: '/admin/inscriptions',
      color: 'blue'
    },
    {
      title: 'Paiements',
      description: 'Suivre et valider les paiements',
      icon: '💳',
      link: '/admin/payments',
      color: 'green'
    },
    {
      title: 'Paiements Espèces',
      description: 'Valider les paiements en espèces en attente',
      icon: '💵',
      link: '/admin/cash-payments',
      color: 'yellow'
    },
    {
      title: 'Dortoirs',
      description: 'Gérer les dortoirs et les capacités',
      icon: '🏠',
      link: '/admin/dormitories',
      color: 'purple'
    },
    {
      title: 'Affectations',
      description: 'Gérer les affectations aux dortoirs',
      icon: '🛏️',
      link: '/admin/assignments',
      color: 'orange'
    },
    {
      title: 'Statistiques',
      description: 'Tableaux de bord et rapports',
      icon: '📊',
      link: '/admin/stats',
      color: 'indigo'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord Admin</h1>
          <p className="text-gray-600">
            Bienvenue dans l'espace administrateur JOSPIA 2025-2026
          </p>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-t-4 border-${item.color}-500`}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </Link>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-green-900 mb-2">✅ Système opérationnel</h3>
          <p className="text-green-800 text-sm">
            Le système JOSPIA 2025-2026 est opérationnel. Utilisez les cartes ci-dessus pour accéder aux différentes fonctionnalités d'administration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
