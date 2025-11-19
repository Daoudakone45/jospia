const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

/**
 * Générer un reçu de paiement en PDF
 */
const generatePaymentReceipt = async (paymentData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        payment,
        inscription,
        user,
        receiptNumber
      } = paymentData;

      // Créer le document PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Buffer pour stocker le PDF
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- HEADER ---
      // Logo (si disponible)
      const logoPath = path.join(__dirname, '../../public/logo-jospia.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 80 });
      }

      // Titre et informations organisation
      doc.fontSize(24)
         .fillColor('#2d5016')
         .text('JOSPIA', 450, 50, { align: 'right' });
      
      doc.fontSize(10)
         .fillColor('#666666')
         .text('Journées Spirituelles Islamiques d\'Anyama', 350, 80, { align: 'right' })
         .text('28 Décembre 2025 au 03 Janvier 2026', 350, 95, { align: 'right' })
         .text('Anyama, Côte d\'Ivoire', 350, 110, { align: 'right' });

      // Ligne de séparation
      doc.moveTo(50, 140)
         .lineTo(545, 140)
         .strokeColor('#2d5016')
         .lineWidth(2)
         .stroke();

      // --- TITRE DU REÇU ---
      doc.fontSize(20)
         .fillColor('#2d5016')
         .text('REÇU DE PAIEMENT', 50, 160, { align: 'center' });

      doc.fontSize(12)
         .fillColor('#333333')
         .text(`N° ${receiptNumber}`, 50, 190, { align: 'center' });

      // --- INFORMATIONS DU PAIEMENT ---
      let y = 230;

      // Date
      const paymentDate = new Date(payment.payment_date || payment.created_at);
      doc.fontSize(10)
         .fillColor('#666666')
         .text('Date de paiement:', 50, y);
      
      doc.fillColor('#333333')
         .text(paymentDate.toLocaleDateString('fr-FR', {
           year: 'numeric',
           month: 'long',
           day: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
         }), 200, y);

      y += 25;

      // Statut
      doc.fillColor('#666666')
         .text('Statut:', 50, y);
      
      doc.fillColor('#10b981')
         .text('PAYÉ', 200, y);

      y += 25;

      // Méthode de paiement
      doc.fillColor('#666666')
         .text('Méthode de paiement:', 50, y);
      
      const paymentMethods = {
        'orange': 'Orange Money',
        'mtn': 'MTN Money',
        'moov': 'Moov Money',
        'wave': 'Wave',
        'card': 'Carte bancaire'
      };
      
      doc.fillColor('#333333')
         .text(paymentMethods[payment.payment_method] || payment.payment_method, 200, y);

      y += 25;

      // Référence
      doc.fillColor('#666666')
         .text('Référence:', 50, y);
      
      doc.fillColor('#333333')
         .font('Courier')
         .text(payment.reference_code, 200, y);
      
      doc.font('Helvetica');

      // --- INFORMATIONS DU PARTICIPANT ---
      y += 40;
      doc.fontSize(14)
         .fillColor('#2d5016')
         .text('Informations du participant', 50, y);

      y += 25;
      doc.fontSize(10);

      // Nom complet
      doc.fillColor('#666666')
         .text('Nom complet:', 50, y);
      
      doc.fillColor('#333333')
         .text(`${inscription.first_name} ${inscription.last_name}`, 200, y);

      y += 20;

      // Email
      doc.fillColor('#666666')
         .text('Email:', 50, y);
      
      doc.fillColor('#333333')
         .text(user.email, 200, y);

      y += 20;

      // Téléphone
      doc.fillColor('#666666')
         .text('Téléphone:', 50, y);
      
      doc.fillColor('#333333')
         .text(inscription.contact_phone, 200, y);

      y += 20;

      // Section
      doc.fillColor('#666666')
         .text('Section:', 50, y);
      
      doc.fillColor('#333333')
         .text(inscription.section, 200, y);

      y += 20;

      // Genre
      doc.fillColor('#666666')
         .text('Genre:', 50, y);
      
      doc.fillColor('#333333')
         .text(inscription.gender === 'male' ? 'Masculin' : 'Féminin', 200, y);

      y += 20;

      // Dortoir assigné
      if (paymentData.dormitory) {
        doc.fillColor('#666666')
           .text('Dortoir assigné:', 50, y);
        
        doc.fillColor('#2d5016')
           .font('Helvetica-Bold')
           .text(paymentData.dormitory.name, 200, y);
        
        doc.font('Helvetica');
      }

      // --- DÉTAILS DU MONTANT ---
      y += 40;

      // Encadré pour le montant
      doc.rect(50, y, 495, 80)
         .fillAndStroke('#f0fdf4', '#2d5016');

      y += 20;

      doc.fontSize(12)
         .fillColor('#666666')
         .text('Montant payé:', 70, y);

      doc.fontSize(24)
         .fillColor('#2d5016')
         .text(`${payment.amount.toLocaleString('fr-FR')} FCFA`, 200, y - 5);

      y += 35;

      doc.fontSize(10)
         .fillColor('#666666')
         .text('TVA incluse (si applicable)', 70, y);

      // --- QR CODE ---
      y += 60;

      // Générer le QR code avec les infos du reçu
      const qrData = JSON.stringify({
        receipt: receiptNumber,
        participant: `${inscription.first_name} ${inscription.last_name}`,
        amount: payment.amount,
        date: paymentDate.toISOString(),
        reference: payment.reference_code
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 150,
        margin: 1,
        color: {
          dark: '#2d5016',
          light: '#ffffff'
        }
      });

      // Convertir base64 en buffer
      const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      doc.image(qrBuffer, 240, y, { width: 100, height: 100 });

      y += 110;

      doc.fontSize(8)
         .fillColor('#999999')
         .text('Scannez ce QR code pour vérifier l\'authenticité du reçu', 50, y, {
           align: 'center',
           width: 495
         });

      // --- FOOTER ---
      const footerY = 750;

      // Ligne de séparation
      doc.moveTo(50, footerY - 20)
         .lineTo(545, footerY - 20)
         .strokeColor('#cccccc')
         .lineWidth(1)
         .stroke();

      doc.fontSize(8)
         .fillColor('#999999')
         .text('JOSPIA - Journées Spirituelles Islamiques d\'Anyama', 50, footerY, {
           align: 'center',
           width: 495
         });

      doc.text('Ce reçu est généré automatiquement et valide sans signature', 50, footerY + 12, {
        align: 'center',
        width: 495
      });

      doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 50, footerY + 24, {
        align: 'center',
        width: 495
      });

      // Finaliser le PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Générer un badge participant en PDF
 */
const generateParticipantBadge = async (participantData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { inscription, user, dormitory } = participantData;

      const doc = new PDFDocument({
        size: [283.46, 425.20], // Format badge (10cm x 15cm)
        margins: { top: 20, bottom: 20, left: 20, right: 20 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Fond
      doc.rect(0, 0, 283.46, 425.20)
         .fill('#ffffff');

      // Bordure verte
      doc.rect(10, 10, 263.46, 405.20)
         .lineWidth(3)
         .stroke('#2d5016');

      // Header
      doc.fontSize(18)
         .fillColor('#2d5016')
         .text('JOSPIA 2025-2026', 0, 30, { align: 'center', width: 283.46 });

      doc.fontSize(10)
         .fillColor('#666666')
         .text('28 Décembre 2025 au 03 Janvier 2026', 0, 55, { align: 'center', width: 283.46 });

      // Photo placeholder
      doc.circle(141.73, 120, 40)
         .stroke('#2d5016');

      doc.fontSize(60)
         .fillColor('#2d5016')
         .text(inscription.first_name.charAt(0).toUpperCase(), 0, 95, {
           align: 'center',
           width: 283.46
         });

      // Nom
      doc.fontSize(16)
         .fillColor('#333333')
         .text(`${inscription.first_name} ${inscription.last_name}`, 20, 180, {
           align: 'center',
           width: 243.46
         });

      // Section
      doc.fontSize(12)
         .fillColor('#666666')
         .text(inscription.section, 20, 210, {
           align: 'center',
           width: 243.46
         });

      // Dortoir
      if (dormitory) {
        doc.fontSize(10)
           .fillColor('#2d5016')
           .text(`Dortoir: ${dormitory.name}`, 20, 240, {
             align: 'center',
             width: 243.46
           });
      }

      // QR Code
      const qrData = JSON.stringify({
        id: inscription.id,
        name: `${inscription.first_name} ${inscription.last_name}`,
        section: inscription.section
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 100,
        margin: 0
      });

      const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      doc.image(qrBuffer, 91.73, 280, { width: 100, height: 100 });

      // Footer
      doc.fontSize(8)
         .fillColor('#999999')
         .text('Badge officiel JOSPIA', 0, 395, {
           align: 'center',
           width: 283.46
         });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePaymentReceipt,
  generateParticipantBadge
};
