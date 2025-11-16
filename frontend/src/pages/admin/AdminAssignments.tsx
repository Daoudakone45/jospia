import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Dormitory {
  id: string;
  name: string;
  gender: 'male' | 'female';
}

interface Inscription {
  id: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female';
  contact_phone: string;
}

interface Assignment {
  id: string;
  inscription_id: string;
  dormitory_id: string;
  assigned_at: string;
  dormitories: Dormitory;
  inscriptions: Inscription;
}

const AdminAssignments: React.FC = () => {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterDormitory, setFilterDormitory] = useState<string>('all');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [newDormitoryId, setNewDormitoryId] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/';
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterGender !== 'all') params.append('gender', filterGender);
      if (filterDormitory !== 'all') params.append('dormitory_id', filterDormitory);

      const response = await api.get(`/dormitories/assignments?${params}`);
      setAssignments(response.data.data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des affectations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDormitories = async () => {
    try {
      const response = await api.get('/dormitories');
      setDormitories(response.data.data);
    } catch (error) {
      console.error('Erreur chargement dortoirs:', error);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchDormitories();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [filterGender, filterDormitory]);

  const handleUnassign = async (assignmentId: string, participantName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir libérer le dortoir pour ${participantName} ?`)) {
      return;
    }

    try {
      await api.delete(`/dormitories/assignment/${assignmentId}`);
      toast.success('Dortoir libéré avec succès');
      fetchAssignments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la libération');
    }
  };

  const handleReassign = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setNewDormitoryId('');
    setShowReassignModal(true);
  };

  const confirmReassign = async () => {
    if (!selectedAssignment || !newDormitoryId) {
      toast.error('Veuillez sélectionner un dortoir');
      return;
    }

    try {
      await api.post('/dormitories/reassign', {
        inscription_id: selectedAssignment.inscription_id,
        new_dormitory_id: newDormitoryId
      });
      
      toast.success('Réassignation effectuée avec succès');
      setShowReassignModal(false);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la réassignation');
    }
  };

  // Statistiques
  const totalAssignments = assignments.length;
  const maleAssignments = assignments.filter(a => a.inscriptions.gender === 'male').length;
  const femaleAssignments = assignments.filter(a => a.inscriptions.gender === 'female').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Affectations</h1>
          <p className="text-gray-600 mt-2">
            Gérer les affectations des participants aux dortoirs
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Affectations</p>
                <p className="text-3xl font-bold text-gray-900">{totalAssignments}</p>
              </div>
              <div className="text-4xl">🏠</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hommes</p>
                <p className="text-3xl font-bold text-blue-600">{maleAssignments}</p>
              </div>
              <div className="text-4xl">👨</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Femmes</p>
                <p className="text-3xl font-bold text-pink-600">{femaleAssignments}</p>
              </div>
              <div className="text-4xl">👩</div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par Genre
              </label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tous les genres</option>
                <option value="male">Hommes</option>
                <option value="female">Femmes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par Dortoir
              </label>
              <select
                value={filterDormitory}
                onChange={(e) => setFilterDormitory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tous les dortoirs</option>
                {dormitories.map((dorm) => (
                  <option key={dorm.id} value={dorm.id}>
                    {dorm.name} ({dorm.gender === 'male' ? 'Hommes' : 'Femmes'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des affectations */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {assignments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune affectation
              </h3>
              <p className="text-gray-600">
                Les affectations apparaîtront ici après validation des paiements
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dortoir
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'affectation
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.inscriptions.first_name} {assignment.inscriptions.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          assignment.inscriptions.gender === 'male'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {assignment.inscriptions.gender === 'male' ? '👨 Homme' : '👩 Femme'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.dormitories.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {assignment.inscriptions.contact_phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(assignment.assigned_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleReassign(assignment)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          🔄 Réassigner
                        </button>
                        <button
                          onClick={() => handleUnassign(
                            assignment.id, 
                            `${assignment.inscriptions.first_name} ${assignment.inscriptions.last_name}`
                          )}
                          className="text-red-600 hover:text-red-900"
                        >
                          ❌ Libérer
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

      {/* Modal de réassignation */}
      {showReassignModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Réassigner le Dortoir</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Participant:</p>
              <p className="font-medium">
                {selectedAssignment.inscriptions.first_name} {selectedAssignment.inscriptions.last_name}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Dortoir actuel:</p>
              <p className="font-medium">{selectedAssignment.dormitories.name}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau Dortoir
              </label>
              <select
                value={newDormitoryId}
                onChange={(e) => setNewDormitoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Sélectionner un dortoir</option>
                {dormitories
                  .filter(d => 
                    d.gender === selectedAssignment.inscriptions.gender &&
                    d.id !== selectedAssignment.dormitory_id
                  )
                  .map((dorm) => (
                    <option key={dorm.id} value={dorm.id}>
                      {dorm.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowReassignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmReassign}
                disabled={!newDormitoryId}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignments;
