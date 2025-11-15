import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <h1 className="text-5xl font-bold mb-2">
              Journées Spirituelles Islamiques d'Anyama
            </h1>
            <h2 className="text-3xl font-semibold text-green-100">
              JOSPIA 2025
            </h2>
          </div>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Rejoignez-nous pour une expérience spirituelle inoubliable du 28 décembre 2025 au 03 janvier 2026
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/inscription"
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition shadow-lg"
            >
              S'inscrire maintenant
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Présentation */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Présentation</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              Les JOSPIA sont un événement spirituel annuel rassemblant des fidèles pour des conférences, 
              formations, et temps de recueillement. Un moment privilégié pour approfondir sa foi et 
              partager avec la communauté.
            </p>
          </div>
        </div>
      </section>

      {/* Programme Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Programme du Séminaire</h2>
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">📅</span>
                  <span><strong>Jour 1 :</strong> Ouverture, conférence inaugurale</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">�</span>
                  <span><strong>Jour 2 :</strong> Ateliers et formations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">🤲</span>
                  <span><strong>Jour 3 :</strong> Clôture, prière collective</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">🎯</span>
                  <span><strong>Activités parallèles :</strong> Stands, restauration, espaces de détente</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">🎤</span>
                  <span><strong>Intervenants :</strong> Experts et conférenciers renommés</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Informations Pratiques */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Informations Pratiques</h2>
          <div className="max-w-4xl mx-auto bg-green-50 border-2 border-green-200 rounded-lg p-8">
            <div className="space-y-4 text-gray-700">
              <p className="flex items-start">
                <span className="font-bold text-green-700 min-w-[100px]">� Lieu :</span>
                <span>Anyama, Côte d'Ivoire</span>
              </p>
              <p className="flex items-start">
                <span className="font-bold text-green-700 min-w-[100px]">📅 Dates :</span>
                <span>Du 28 décembre 2025 au 03 janvier 2026</span>
              </p>
              <p className="flex items-start">
                <span className="font-bold text-green-700 min-w-[100px]">💰 Tarif :</span>
                <span>Standard - 5 000 FCFA (hébergement inclus)</span>
              </p>
              <p className="flex items-start">
                <span className="font-bold text-green-700 min-w-[100px]">📱 Contacts :</span>
                <span>+225 05 86 18 96 63 ou +225 07 49 50 48 07</span>
              </p>
              <p className="flex items-start">
                <span className="font-bold text-green-700 min-w-[100px]">📧 Email :</span>
                <span>alisereali01@gmail.com</span>
              </p>
              <p className="flex items-start">
                <span className="font-bold text-green-700 min-w-[100px]">� Paiement :</span>
                <span>Orange Money, MTN Mobile Money, Moov, Wave</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Questions Fréquentes</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Qui peut participer ?</h3>
              <p className="text-gray-600">
                Le séminaire est ouvert à tous les jeunes âgés de 13 ans et plus.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Comment s'inscrire ?</h3>
              <p className="text-gray-600">
                Créez un compte, remplissez le formulaire d'inscription et effectuez le paiement en ligne.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Que faut-il apporter ?</h3>
              <p className="text-gray-600">
                Coran, cahier, stylos, tenue confortable, articles de toilette et médicaments personnels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à vivre une expérience spirituelle unique ?</h2>
          <p className="text-xl mb-8">Inscrivez-vous dès maintenant et réservez votre place !</p>
          <Link
            to="/register"
            className="inline-block bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition shadow-lg"
          >
            Créer mon compte
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
