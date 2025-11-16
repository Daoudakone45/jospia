import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Dormitory {
  id: string;
  name: string;
  gender: 'male' | 'female';
  total_capacity: number;
  available_slots: number;
  created_at: string;
}

const AdminDormitories: React.FC = () => {
  const { user } = useAuthStore();
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDormitory, setEditingDormitory] = useState<Dormitory | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    total_capacity: 50
  });

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/';
    }
  }, [user]);

  // Charger les dortoirs
  const fetchDormitories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dormitories');
      setDormitories(response.data.data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des dortoirs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDormitories();
  }, []);

  // Ouvrir le modal pour créer un nouveau dortoir
  const handleCreate = () => {
    setEditingDormitory(null);
    setFormData({ name: '', gender: 'male', total_capacity: 50 });
    setShowModal(true);
  };

  // Ouvrir le modal pour éditer un dortoir
  const handleEdit = (dormitory: Dormitory) => {
    setEditingDormitory(dormitory);
    setFormData({
      name: dormitory.name,
      gender: dormitory.gender,
      total_capacity: dormitory.total_capacity
    });
    setShowModal(true);
  };

  // Sauvegarder (créer ou modifier)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.total_capacity < 1) {
      toast.error('Veuillez remplir tous les champs correctement');
      return;
    }

    try {
      if (editingDormitory) {
        // Modifier
        await api.put(`/dormitories/${editingDormitory.id}`, formData);
        toast.success('Dortoir modifié avec succès');
      } else {
        // Créer
        await api.post('/dormitories', formData);
        toast.success('Dortoir créé avec succès');
      }
      
      setShowModal(false);
      fetchDormitories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  // Supprimer un dortoir
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dortoir ?')) {
      return;
    }

    try {
      await api.delete(`/dormitories/${id}`);
      toast.success('Dortoir supprimé avec succès');
      fetchDormitories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Dortoirs</h1>
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Créer un dortoir
          </button>
        </div>

        {/* Liste des dortoirs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dormitories.map((dormitory) => {
            const occupancyPercentage = ((dormitory.total_capacity - dormitory.available_slots) / dormitory.total_capacity) * 100;
            const isNearFull = occupancyPercentage >= 80;
            const isFull = dormitory.available_slots === 0;

            return (
              <div key={dormitory.id} className="bg-white rounded-lg shadow-md p-6">
                {/* Nom et genre */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{dormitory.name}</h3>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      dormitory.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                    }`}>
                      {dormitory.gender === 'male' ? '👨 Hommes' : '👩 Femmes'}
                    </span>
                  </div>
                </div>

                {/* Capacité */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Occupation</span>
                    <span className="font-medium">
                      {dormitory.total_capacity - dormitory.available_slots} / {dormitory.total_capacity}
                    </span>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isFull ? 'bg-red-500' : isNearFull ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${occupancyPercentage}%` }}
                    />
                  </div>

                  <div className="mt-2 text-sm">
                    <span className={`font-medium ${
                      isFull ? 'text-red-600' : isNearFull ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {dormitory.available_slots} place(s) disponible(s)
                    </span>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(dormitory)}
                    className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(dormitory.id)}
                    className="flex-1 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium"
                    disabled={dormitory.available_slots !== dormitory.total_capacity}
                  >
                    🗑️ Supprimer
                  </button>
                </div>

                {dormitory.available_slots !== dormitory.total_capacity && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    ⚠️ Impossible de supprimer un dortoir occupé
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {dormitories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Aucun dortoir créé</h3>
            <p className="text-gray-500 mb-6">Commencez par créer votre premier dortoir</p>
            <button
              onClick={handleCreate}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Créer un dortoir
            </button>
          </div>
        )}

        {/* Modal de création/modification */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingDormitory ? 'Modifier le dortoir' : 'Créer un nouveau dortoir'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du dortoir
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Dortoir A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="male">👨 Hommes</option>
                    <option value="female">👩 Femmes</option>
                  </select>
                </div>

                {/* Capacité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacité totale
                  </label>
                  <input
                    type="number"
                    value={formData.total_capacity}
                    onChange={(e) => setFormData({ ...formData, total_capacity: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Nombre de places disponibles</p>
                </div>

                {/* Boutons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    {editingDormitory ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDormitories;
