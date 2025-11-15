import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// Déclaration du type EmailJS
declare const emailjs: any;

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  // Initialiser EmailJS
  useEffect(() => {
    // Charger le script EmailJS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser/dist/email.min.js';
    script.async = true;
    script.onload = () => {
      // Initialiser avec votre clé publique
      emailjs.init('rGQl4zVnYipR1qDVU');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Envoyer avec EmailJS
      const response = await emailjs.send(
        'Daoudakone45@',      // Service ID
        'template_vra94of',    // Template ID
        {
          user_name: formData.name,
          user_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }
      );

      console.log('SUCCESS!', response);
      toast.success('✅ Message envoyé avec succès !');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('FAILED...', error);
      toast.error('❌ Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h1>
            <p className="text-lg text-gray-600">
              Pour plus d'informations sur les JOSPIA 2025-2026
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Votre nom et prénom"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Le sujet de votre message"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Votre message"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer votre message'}
              </button>
            </form>
          </div>

          {/* Informations de contact */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Autres moyens de nous contacter</h2>
            <div className="space-y-3 text-gray-700">
              <p className="flex items-center gap-3">
                <span className="text-green-600 text-xl">📱</span>
                <span>+225 05 86 18 96 63 ou +225 07 49 50 48 07</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-green-600 text-xl">📧</span>
                <span>alisereali01@gmail.com</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-green-600 text-xl">📍</span>
                <span>Anyama, Côte d'Ivoire</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
