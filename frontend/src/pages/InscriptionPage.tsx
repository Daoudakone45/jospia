import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { inscriptionService } from '../services/inscriptionService';

const SECTIONS = [
  'Lyma', 'Lymao', 'Saint Michel', 'La perruche', 'Atlas', 'Yvac',
  'Gaoussou', 'Nogolama', 'Henriette', 'GSAMAT', 'Buthmaan',
  'Soundiata Keïta', 'Groupe scolaire la paix', 'Sainte Monique', 'Denguele'
];

interface FormData {
  // Étape 1 : Infos personnelles
  first_name: string;
  last_name: string;
  age: string;
  residence_location: string;
  contact_phone: string;
  gender: string;
  
  // Étape 2 : Infos académiques
  section: string;
  health_condition: string;
  has_health_issue: string;
  
  // Étape 3 : Infos tuteur
  guardian_name: string;
  guardian_contact: string;
}

const InscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    age: '',
    residence_location: '',
    contact_phone: '',
    gender: '',
    section: '',
    health_condition: '',
    has_health_issue: 'non',
    guardian_name: '',
    guardian_contact: '',
  });

  // Charger les données sauvegardées
  useEffect(() => {
    const savedData = localStorage.getItem('inscription_draft');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Sauvegarder automatiquement
  useEffect(() => {
    localStorage.setItem('inscription_draft', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.first_name || !formData.last_name || !formData.age || 
            !formData.residence_location || !formData.contact_phone || !formData.gender) {
          toast.error('Veuillez remplir tous les champs obligatoires');
          return false;
        }
        if (parseInt(formData.age) < 13) {
          toast.error('L\'âge minimum est de 13 ans');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.section) {
          toast.error('Veuillez sélectionner votre section');
          return false;
        }
        if (formData.has_health_issue === 'oui' && !formData.health_condition) {
          toast.error('Veuillez préciser votre problème de santé');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.guardian_name || !formData.guardian_contact) {
          toast.error('Veuillez remplir les informations du tuteur');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const inscriptionData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        age: parseInt(formData.age),
        residence_location: formData.residence_location,
        contact_phone: formData.contact_phone,
        gender: formData.gender,
        section: formData.section,
        health_condition: formData.has_health_issue === 'oui' ? formData.health_condition : 'Aucun',
        guardian_name: formData.guardian_name,
        guardian_contact: formData.guardian_contact,
      };

      const response = await inscriptionService.create(inscriptionData);
      toast.success('Inscription créée avec succès !');
      localStorage.removeItem('inscription_draft');
      
      // Rediriger vers la page de paiement avec l'ID de l'inscription
      navigate(`/payment?inscription_id=${response.id}`);
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      const message = error.response?.data?.message || 'Erreur lors de l\'inscription';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Inscription au Séminaire JOSPIA 2025-2026
            </h1>
            <p className="text-gray-600">
              Remplissez le formulaire pour réserver votre place
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep >= step
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Infos personnelles</span>
              <span>Infos académiques</span>
              <span>Infos tuteur</span>
              <span>Récapitulatif</span>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Étape 1 : Infos personnelles */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations personnelles
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Votre nom"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Votre prénom"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Âge <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      min="13"
                      max="100"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Minimum 13 ans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genre <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">--Choisir--</option>
                      <option value="male">Masculin</option>
                      <option value="female">Féminin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu de résidence <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="residence_location"
                      value={formData.residence_location}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ville, quartier"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+225 XX XX XX XX XX"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 : Infos académiques */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations académiques
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">--Choisir votre section--</option>
                    {SECTIONS.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avez-vous un problème de santé ? <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="has_health_issue"
                    value={formData.has_health_issue}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="non">Non</option>
                    <option value="oui">Oui</option>
                  </select>
                </div>

                {formData.has_health_issue === 'oui' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Si oui, précisez <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="health_condition"
                      value={formData.health_condition}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Décrivez votre problème de santé"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* Étape 3 : Infos tuteur */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations du tuteur / parent
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du parent ou tuteur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="guardian_name"
                    value={formData.guardian_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nom complet du tuteur"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact du parent ou tuteur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="guardian_contact"
                    value={formData.guardian_contact}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+225 XX XX XX XX XX"
                    required
                  />
                </div>
              </div>
            )}

            {/* Étape 4 : Récapitulatif */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Récapitulatif de votre inscription
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nom complet</p>
                      <p className="font-semibold">{formData.first_name} {formData.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Âge</p>
                      <p className="font-semibold">{formData.age} ans</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Genre</p>
                      <p className="font-semibold">{formData.gender === 'male' ? 'Masculin' : 'Féminin'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Résidence</p>
                      <p className="font-semibold">{formData.residence_location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-semibold">{formData.contact_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Section</p>
                      <p className="font-semibold">{formData.section}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Problème de santé</p>
                      <p className="font-semibold">
                        {formData.has_health_issue === 'oui' ? formData.health_condition : 'Aucun'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tuteur</p>
                      <p className="font-semibold">{formData.guardian_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact tuteur</p>
                      <p className="font-semibold">{formData.guardian_contact}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Montant à payer</p>
                      <p className="text-3xl font-bold text-green-700">5 000 FCFA</p>
                      <p className="text-sm text-gray-600 mt-1">Ticket Standard (hébergement inclus)</p>
                    </div>
                    <div className="text-green-600 text-5xl">💳</div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    ⚠️ Veuillez vérifier attentivement vos informations avant de confirmer.
                    Après validation, vous serez redirigé vers la page de paiement.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Précédent
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Suivant →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? 'Traitement en cours...' : 'Confirmer et payer'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscriptionPage;
