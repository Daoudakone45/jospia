const nodemailer = require('nodemailer');

// Mode développement : désactiver l'envoi réel d'emails
const isDevelopment = process.env.NODE_ENV === 'development';

const transporter = isDevelopment ? null : nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    // En développement, logger au lieu d'envoyer
    if (isDevelopment) {
      console.log('📧 [DEV MODE] Email simulé:');
      console.log('   To:', to);
      console.log('   Subject:', subject);
      console.log('   (Contenu HTML non affiché)');
      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    // Ne pas bloquer l'opération si l'email échoue
    return { success: false, error: error.message };
  }
};

const sendConfirmationEmail = async (user, inscription) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Confirmation d'inscription - JOSPIA</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${inscription.first_name} ${inscription.last_name},</h2>
          <p>Votre inscription au séminaire JOSPIA a été enregistrée avec succès !</p>
          
          <h3>📋 Détails de votre inscription :</h3>
          <ul>
            <li><strong>Nom complet :</strong> ${inscription.first_name} ${inscription.last_name}</li>
            <li><strong>Section :</strong> ${inscription.section}</li>
            <li><strong>Contact :</strong> ${inscription.contact_phone}</li>
            <li><strong>Montant :</strong> ${inscription.ticket_price} FCFA</li>
          </ul>

          <p><strong>Prochaine étape :</strong> Veuillez procéder au paiement pour confirmer votre participation.</p>
          
          <p>Pour toute question, n'hésitez pas à nous contacter.</p>
        </div>
        <div class="footer">
          <p>© 2025 JOSPIA - Tous droits réservés</p>
          <p>Email: support@jospia.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Confirmation d\'inscription - JOSPIA',
    html
  });
};

const sendPaymentReceiptEmail = async (user, inscription, payment, receiptPdfPath) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .success { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Paiement confirmé - JOSPIA</h1>
        </div>
        <div class="content">
          <div class="success">
            <h2>Paiement réussi !</h2>
            <p>Votre paiement a été traité avec succès.</p>
          </div>

          <h3>📋 Détails du paiement :</h3>
          <ul>
            <li><strong>Nom :</strong> ${inscription.first_name} ${inscription.last_name}</li>
            <li><strong>Montant payé :</strong> ${payment.amount} FCFA</li>
            <li><strong>Référence :</strong> ${payment.reference_code}</li>
            <li><strong>Date :</strong> ${new Date(payment.payment_date).toLocaleDateString('fr-FR')}</li>
            <li><strong>Méthode :</strong> ${payment.payment_method}</li>
          </ul>

          <p>Votre reçu de paiement est joint à cet email. Veuillez le conserver précieusement.</p>
          
          <p><strong>À très bientôt au séminaire JOSPIA ! 🎉</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 JOSPIA - Tous droits réservés</p>
          <p>Email: support@jospia.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = receiptPdfPath ? [{
    filename: `recu_${payment.reference_code}.pdf`,
    path: receiptPdfPath
  }] : [];

  return sendEmail({
    to: user.email,
    subject: 'Reçu de paiement - JOSPIA',
    html,
    attachments
  });
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #ff9800; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Réinitialisation de mot de passe</h1>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          
          <a href="${resetUrl}" class="btn">Réinitialiser mon mot de passe</a>
          
          <p><small>Ce lien est valable pendant 1 heure.</small></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
        <div class="footer">
          <p>© 2025 JOSPIA - Tous droits réservés</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Réinitialisation de mot de passe - JOSPIA',
    html
  });
};

module.exports = {
  sendEmail,
  sendConfirmationEmail,
  sendPaymentReceiptEmail,
  sendPasswordResetEmail
};
