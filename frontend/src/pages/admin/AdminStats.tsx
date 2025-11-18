import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  inscriptions: {
    total: number;
    confirmed: number;
    pending: number;
  };
  payments: {
    total: number;
    successful: number;
    failed: number;
  };
  revenue: {
    total: number;
    currency: string;
  };
  dormitories: {
    totalCapacity: number;
    occupied: number;
    available: number;
    occupancyRate: number;
  };
  demographics: {
    male: number;
    female: number;
  };
  sectionDistribution: Record<string, number>;
}

const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/dashboard');
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Erreur chargement stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      toast.loading('Génération du fichier Excel...');
      const response = await api.get('/stats/export/excel', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `jospia_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Fichier Excel téléchargé avec succès!');
    } catch (error: any) {
      toast.dismiss();
      console.error('Erreur export Excel:', error);
      toast.error('Erreur lors de l\'export Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.loading('Génération du fichier PDF...');
      const response = await api.get('/stats/export/pdf', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `jospia_rapport_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Fichier PDF téléchargé avec succès!');
    } catch (error: any) {
      toast.dismiss();
      console.error('Erreur export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Erreur lors du chargement des statistiques</p>
      </div>
    );
  }

  const totalParticipants = stats.demographics.male + stats.demographics.female;
  const malePercentage = totalParticipants > 0 ? ((stats.demographics.male / totalParticipants) * 100).toFixed(1) : 0;
  const femalePercentage = totalParticipants > 0 ? ((stats.demographics.female / totalParticipants) * 100).toFixed(1) : 0;

  const sections = Object.entries(stats.sectionDistribution || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxSectionCount = sections.length > 0 ? Math.max(...sections.map(s => s[1])) : 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Statistiques</h1>
          <p className="text-gray-600">Vue d'ensemble du séminaire JOSPIA 2025-2026</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Inscriptions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">📝 Inscriptions</h3>
              <span className="text-2xl">👥</span>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-gray-900">{stats.inscriptions.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">✅ {stats.inscriptions.confirmed} confirmées</span>
              <span className="text-yellow-600">⏳ {stats.inscriptions.pending} en attente</span>
            </div>
          </div>

          {/* Paiements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">💳 Paiements</h3>
              <span className="text-2xl">💰</span>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-gray-900">{stats.payments.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">✅ {stats.payments.successful} réussis</span>
              <span className="text-red-600">❌ {stats.payments.failed} échoués</span>
            </div>
          </div>

          {/* Revenus */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">💵 Revenus</h3>
              <span className="text-2xl">💸</span>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-green-600">
                {stats.revenue.total.toLocaleString('fr-FR')}
              </p>
              <p className="text-sm text-gray-500">{stats.revenue.currency}</p>
            </div>
            <div className="text-sm text-gray-600">
              Montant total collecté
            </div>
          </div>

          {/* Dortoirs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">🏠 Dortoirs</h3>
              <span className="text-2xl">🛏️</span>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-gray-900">{stats.dormitories.occupancyRate}%</p>
              <p className="text-sm text-gray-500">Taux d'occupation</p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">📦 {stats.dormitories.occupied} occupés</span>
              <span className="text-gray-600">⚪ {stats.dormitories.available} libres</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gender Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">👥 Répartition par genre</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">👨 Hommes</span>
                  <span className="text-sm font-bold text-blue-600">{stats.demographics.male} ({malePercentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${malePercentage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">👩 Femmes</span>
                  <span className="text-sm font-bold text-pink-600">{stats.demographics.female} ({femalePercentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-pink-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${femalePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                <span className="font-bold text-gray-900">{totalParticipants}</span> participants confirmés au total
              </p>
            </div>
          </div>

          {/* Dormitory Occupancy */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">🏠 Occupation des dortoirs</h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="#10b981"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${(stats.dormitories.occupancyRate * 502.4) / 100} 502.4`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold text-gray-900">{stats.dormitories.occupancyRate}%</span>
                  <span className="text-sm text-gray-500">Occupés</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.dormitories.totalCapacity}</p>
                <p className="text-xs text-gray-600">Capacité totale</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.dormitories.occupied}</p>
                <p className="text-xs text-gray-600">Occupés</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-400">{stats.dormitories.available}</p>
                <p className="text-xs text-gray-600">Disponibles</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">📍 Top 10 Sections</h3>
          {sections.length > 0 ? (
            <div className="space-y-3">
              {sections.map(([section, count]) => {
                const percentage = ((count / maxSectionCount) * 100).toFixed(1);
                return (
                  <div key={section}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{section}</span>
                      <span className="text-sm font-bold text-green-600">{count} participants</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
          )}
        </div>

        {/* Export buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 shadow-md"
          >
            📊 Exporter Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2 shadow-md"
          >
            📄 Exporter PDF
          </button>
          <button
            onClick={fetchStats}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition flex items-center gap-2"
          >
            🔄 Actualiser
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
