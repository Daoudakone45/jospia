import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Inscription {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  section: string;
  contact_phone: string;
  residence_location: string;
  health_condition: string;
  guardian_name: string;
  guardian_contact: string;
  status: string;
  created_at: string;
  user_id: string;
  users?: {
    email: string;
    full_name: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  reference_code: string;
  payment_date: string;
}

interface DormitoryAssignment {
  id: string;
  dormitories: {
    name: string;
    gender: string;
  };
}

const AdminInscriptions: React.FC = () => {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [filteredInscriptions, setFilteredInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [dormitory, setDormitory] = useState<DormitoryAssignment | null>(null);

  // Filtres
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInscriptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inscriptions, statusFilter, genderFilter, sectionFilter, searchTerm]);

  const fetchInscriptions = async () => {
    try {
      const response = await api.get('/inscriptions');
      setInscriptions(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des inscriptions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inscriptions];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    if (genderFilter !== 'all') {
      filtered = filtered.filter(i => i.gender === genderFilter);
    }

    if (sectionFilter !== 'all') {
      filtered = filtered.filter(i => i.section === sectionFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.first_name.toLowerCase().includes(search) ||
        i.last_name.toLowerCase().includes(search) ||
        i.users?.email.toLowerCase().includes(search)
      );
    }

    setFilteredInscriptions(filtered);
  };

  const viewDetails = async (inscription: Inscription) => {
    setSelectedInscription(inscription);
    setShowDetails(true);

    try {
      const paymentRes = await api.get(`/payments/inscription/${inscription.id}`);
      setPayment(paymentRes.data.data);
    } catch (error) {
      setPayment(null);
    }

    try {
      const dormRes = await api.get(`/dormitories/assignment/${inscription.id}`);
      setDormitory(dormRes.data.data);
    } catch (error) {
      setDormitory(null);
    }
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedInscription(null);
    setPayment(null);
    setDormitory(null);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      cancelled: 'Annulée'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const sections = [...new Set(inscriptions.map(i => i.section))];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📋 Gestion des Inscriptions
            </h1>
            <p className="text-gray-600">
              Voir et gérer toutes les inscriptions au séminaire JOSPIA
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-900">{inscriptions.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Confirmées</div>
              <div className="text-2xl font-bold text-green-600">
                {inscriptions.filter(i => i.status === 'confirmed').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">En attente</div>
              <div className="text-2xl font-bold text-yellow-600">
                {inscriptions.filter(i => i.status === 'pending').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Annulées</div>
              <div className="text-2xl font-bold text-red-600">
                {inscriptions.filter(i => i.status === 'cancelled').length}
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">🔍 Filtres</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                <input
                  type="text"
                  placeholder="Nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Tous</option>
                  <option value="male">Hommes</option>
                  <option value="female">Femmes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Toutes</option>
                  {sections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {filteredInscriptions.length} inscription(s) trouvée(s)
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement...</p>
              </div>
            ) : filteredInscriptions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Aucune inscription trouvée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Genre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInscriptions.map((inscription) => (
                      <tr key={inscription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-semibold">
                                {inscription.first_name.charAt(0)}{inscription.last_name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {inscription.first_name} {inscription.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{inscription.users?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{inscription.contact_phone}</div>
                          <div className="text-sm text-gray-500">{inscription.residence_location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{inscription.section}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inscription.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {inscription.gender === 'male' ? '👨 Homme' : '👩 Femme'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(inscription.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(inscription.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => viewDetails(inscription)}
                            className="text-green-600 hover:text-green-900"
                          >
                            📄 Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal détails */}
      {showDetails && selectedInscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Détails de l'inscription</h2>
              <button onClick={closeDetails} className="text-white hover:text-gray-200 text-2xl">×</button>
            </div>

            <div className="p-6">
              {/* Infos personnelles */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Prénom</label>
                    <p className="mt-1 text-gray-900">{selectedInscription.first_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nom</label>
                    <p className="mt-1 text-gray-900">{selectedInscription.last_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-gray-900">{selectedInscription.users?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                    <p className="mt-1 text-gray-900">{selectedInscription.contact_phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Âge</label>
                    <p className="mt-1 text-gray-900">{selectedInscription.age} ans</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Genre</label>
                    <p className="mt-1 text-gray-900">{selectedInscription.gender === 'male' ? 'Masculin' : 'Féminin'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Section</label>
                    <p className="mt-1 text-gray-900">{selectedInscription.section}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Résidence</label>
                    <p className="mt-1 text-gray-900">{selectedInscription.residence_location}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Santé</label>
                    <p className="mt-1 text-gray-900">{selectedInscription.health_condition}</p>
                  </div>
                </div>
              </div>

              {/* Tuteur */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👨‍👩‍👧 Contact d'urgence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nom du tuteur</label>
                    <p className="mt-1 text-gray-900">{selectedInscription.guardian_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Contact</label>
                    <p className="mt-1 text-gray-900">{selectedInscription.guardian_contact}</p>
                  </div>
                </div>
              </div>

              {/* Paiement */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Paiement</h3>
                {payment ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Montant</label>
                        <p className="mt-1 text-gray-900 font-semibold">{payment.amount} FCFA</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Méthode</label>
                        <p className="mt-1 text-gray-900">{payment.payment_method}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Référence</label>
                        <p className="mt-1 text-gray-900 font-mono text-sm">{payment.reference_code}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Date</label>
                        <p className="mt-1 text-gray-900">
                          {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">✅ Payé</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">⚠️ Aucun paiement enregistré</p>
                  </div>
                )}
              </div>

              {/* Dortoir */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 Dortoir</h3>
                {dormitory ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Nom du dortoir</label>
                        <p className="mt-1 text-gray-900 font-semibold">{dormitory.dormitories.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Genre</label>
                        <p className="mt-1 text-gray-900">
                          {dormitory.dormitories.gender === 'male' ? 'Hommes' : 'Femmes'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">✅ Assigné</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">⏳ Aucun dortoir assigné</p>
                  </div>
                )}
              </div>

              {/* Statut */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Statut</h3>
                <div className="flex items-center gap-4">
                  {getStatusBadge(selectedInscription.status)}
                  <span className="text-sm text-gray-500">
                    Créée le {new Date(selectedInscription.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={closeDetails}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInscriptions;
