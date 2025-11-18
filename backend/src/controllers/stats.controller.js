const supabase = require('../config/supabase');

const getDashboardStats = async (req, res, next) => {
  try {
    // Total inscriptions
    const { count: totalInscriptions } = await supabase
      .from('inscriptions')
      .select('*', { count: 'exact', head: true });

    // Confirmed inscriptions
    const { count: confirmedInscriptions } = await supabase
      .from('inscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed');

    // Total payments
    const { count: totalPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });

    // Successful payments
    const { count: successfulPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'success');

    // Total revenue
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'success');

    const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

    // Dormitory occupancy
    const { data: dormitories } = await supabase
      .from('dormitories')
      .select('total_capacity, available_slots');

    const totalCapacity = dormitories?.reduce((sum, d) => sum + d.total_capacity, 0) || 0;
    const totalAvailable = dormitories?.reduce((sum, d) => sum + d.available_slots, 0) || 0;
    const totalOccupied = totalCapacity - totalAvailable;
    const occupancyRate = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(2) : 0;

    // Gender distribution
    const { count: maleCount } = await supabase
      .from('inscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('gender', 'male')
      .eq('status', 'confirmed');

    const { count: femaleCount } = await supabase
      .from('inscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('gender', 'female')
      .eq('status', 'confirmed');

    // Section distribution
    const { data: sectionStats } = await supabase
      .from('inscriptions')
      .select('section')
      .eq('status', 'confirmed');

    const sectionDistribution = sectionStats?.reduce((acc, inscription) => {
      acc[inscription.section] = (acc[inscription.section] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        inscriptions: {
          total: totalInscriptions || 0,
          confirmed: confirmedInscriptions || 0,
          pending: (totalInscriptions || 0) - (confirmedInscriptions || 0)
        },
        payments: {
          total: totalPayments || 0,
          successful: successfulPayments || 0,
          failed: (totalPayments || 0) - (successfulPayments || 0)
        },
        revenue: {
          total: totalRevenue,
          currency: 'FCFA'
        },
        dormitories: {
          totalCapacity,
          occupied: totalOccupied,
          available: totalAvailable,
          occupancyRate: parseFloat(occupancyRate)
        },
        demographics: {
          male: maleCount || 0,
          female: femaleCount || 0
        },
        sectionDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

const getOccupancyStats = async (req, res, next) => {
  try {
    const { data: dormitories, error } = await supabase
      .from('dormitories')
      .select(`
        *,
        assignments:dormitory_assignments(count)
      `);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    const stats = dormitories.map(dormitory => ({
      id: dormitory.id,
      name: dormitory.name,
      gender: dormitory.gender,
      totalCapacity: dormitory.total_capacity,
      available: dormitory.available_slots,
      occupied: dormitory.total_capacity - dormitory.available_slots,
      occupancyRate: ((dormitory.total_capacity - dormitory.available_slots) / dormitory.total_capacity * 100).toFixed(2)
    }));

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const getRevenueStats = async (req, res, next) => {
  try {
    const { date_from, date_to } = req.query;

    let query = supabase
      .from('payments')
      .select('amount, payment_date, payment_method')
      .eq('status', 'success');

    if (date_from) {
      query = query.gte('payment_date', date_from);
    }

    if (date_to) {
      query = query.lte('payment_date', date_to);
    }

    const { data: payments, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Group by payment method
    const byMethod = payments.reduce((acc, payment) => {
      acc[payment.payment_method] = (acc[payment.payment_method] || 0) + payment.amount;
      return acc;
    }, {});

    // Group by date
    const byDate = payments.reduce((acc, payment) => {
      const date = new Date(payment.payment_date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + payment.amount;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: totalRevenue,
        currency: 'FCFA',
        count: payments.length,
        byMethod,
        byDate
      }
    });
  } catch (error) {
    next(error);
  }
};

const exportToExcel = async (req, res, next) => {
  try {
    const ExcelJS = require('exceljs');
    
    const { data: inscriptions, error } = await supabase
      .from('inscriptions')
      .select(`
        *,
        users(email),
        payments(status, amount, payment_date, payment_method),
        dormitory_assignments(room_number, bed_number, dormitories(name))
      `);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'JOSPIA';
    workbook.created = new Date();

    // ===== SHEET 1: Liste des participants =====
    const participantsSheet = workbook.addWorksheet('Participants', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    // Define columns
    participantsSheet.columns = [
      { header: 'N°', key: 'number', width: 5 },
      { header: 'Prénom', key: 'firstName', width: 15 },
      { header: 'Nom', key: 'lastName', width: 15 },
      { header: 'Genre', key: 'gender', width: 10 },
      { header: 'Âge', key: 'age', width: 7 },
      { header: 'Section', key: 'section', width: 15 },
      { header: 'Contact', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Résidence', key: 'residence', width: 20 },
      { header: 'Statut', key: 'status', width: 12 },
      { header: 'Dortoir', key: 'dormitory', width: 15 },
      { header: 'Chambre', key: 'room', width: 10 },
      { header: 'Lit', key: 'bed', width: 7 },
      { header: 'Paiement', key: 'paymentStatus', width: 12 },
      { header: 'Montant', key: 'amount', width: 12 }
    ];

    // Style header row
    participantsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    participantsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2d5016' } // Green JOSPIA
    };
    participantsSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    participantsSheet.getRow(1).height = 25;

    // Add data rows
    inscriptions.forEach((ins, index) => {
      const payment = ins.payments?.[0];
      const assignment = ins.dormitory_assignments?.[0];
      
      participantsSheet.addRow({
        number: index + 1,
        firstName: ins.first_name,
        lastName: ins.last_name,
        gender: ins.gender === 'male' ? 'Homme' : 'Femme',
        age: ins.age,
        section: ins.section,
        phone: ins.contact_phone,
        email: ins.users?.email || '',
        residence: ins.residence_location,
        status: ins.status === 'confirmed' ? 'Confirmé' : ins.status,
        dormitory: assignment?.dormitories?.name || 'Non assigné',
        room: assignment?.room_number || '',
        bed: assignment?.bed_number || '',
        paymentStatus: payment?.status === 'success' ? 'Payé' : payment?.status || 'En attente',
        amount: payment?.amount || 0
      });
    });

    // Apply borders and alternating colors
    participantsSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F0F0' }
        };
      }
    });

    // Format amount column as currency
    participantsSheet.getColumn('amount').numFmt = '#,##0 "FCFA"';

    // ===== SHEET 2: Statistiques =====
    const statsSheet = workbook.addWorksheet('Statistiques');
    
    // Calculate stats
    const confirmedInscriptions = inscriptions.filter(i => i.status === 'confirmed');
    const paidCount = inscriptions.filter(i => i.payments?.[0]?.status === 'success').length;
    const totalRevenue = inscriptions.reduce((sum, i) => sum + (i.payments?.[0]?.amount || 0), 0);
    const maleCount = confirmedInscriptions.filter(i => i.gender === 'male').length;
    const femaleCount = confirmedInscriptions.filter(i => i.gender === 'female').length;
    const assignedCount = inscriptions.filter(i => i.dormitory_assignments?.[0]).length;

    // Section distribution
    const sectionStats = confirmedInscriptions.reduce((acc, i) => {
      acc[i.section] = (acc[i.section] || 0) + 1;
      return acc;
    }, {});

    // Add title
    statsSheet.mergeCells('A1:B1');
    statsSheet.getCell('A1').value = 'JOSPIA - Statistiques du Séminaire';
    statsSheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF2d5016' } };
    statsSheet.getCell('A1').alignment = { horizontal: 'center' };
    statsSheet.getRow(1).height = 30;

    // Add date
    statsSheet.mergeCells('A2:B2');
    statsSheet.getCell('A2').value = `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
    statsSheet.getCell('A2').alignment = { horizontal: 'center' };
    statsSheet.getCell('A2').font = { italic: true };
    
    let currentRow = 4;

    // General stats
    statsSheet.getCell(`A${currentRow}`).value = 'STATISTIQUES GÉNÉRALES';
    statsSheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    statsSheet.getCell(`A${currentRow}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    currentRow += 2;

    const generalStats = [
      ['Total des inscriptions', inscriptions.length],
      ['Inscriptions confirmées', confirmedInscriptions.length],
      ['Paiements réussis', paidCount],
      ['Revenu total', `${totalRevenue.toLocaleString('fr-FR')} FCFA`],
      ['Participants hommes', maleCount],
      ['Participants femmes', femaleCount],
      ['Dortoirs assignés', assignedCount]
    ];

    generalStats.forEach(([label, value]) => {
      statsSheet.getCell(`A${currentRow}`).value = label;
      statsSheet.getCell(`A${currentRow}`).font = { bold: true };
      statsSheet.getCell(`B${currentRow}`).value = value;
      statsSheet.getCell(`B${currentRow}`).alignment = { horizontal: 'right' };
      currentRow++;
    });

    currentRow += 2;

    // Section distribution
    statsSheet.getCell(`A${currentRow}`).value = 'RÉPARTITION PAR SECTION';
    statsSheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    statsSheet.getCell(`A${currentRow}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    currentRow += 2;

    Object.entries(sectionStats).forEach(([section, count]) => {
      statsSheet.getCell(`A${currentRow}`).value = section;
      statsSheet.getCell(`A${currentRow}`).font = { bold: true };
      statsSheet.getCell(`B${currentRow}`).value = count;
      statsSheet.getCell(`B${currentRow}`).alignment = { horizontal: 'right' };
      currentRow++;
    });

    // Column widths
    statsSheet.getColumn('A').width = 30;
    statsSheet.getColumn('B').width = 20;

    // ===== Send file =====
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=jospia_export_${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error in exportToExcel:', error);
    next(error);
  }
};

const exportToPDF = async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    
    const { data: inscriptions, error } = await supabase
      .from('inscriptions')
      .select(`
        *,
        users(email),
        payments(status, amount)
      `)
      .eq('status', 'confirmed');

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rapport_jospia.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('JOSPIA - Rapport des Inscriptions', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Résumé', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Total des inscriptions confirmées: ${inscriptions.length}`);
    
    const totalRevenue = inscriptions.reduce((sum, ins) => {
      return sum + (ins.payments?.[0]?.amount || 0);
    }, 0);
    doc.text(`Revenu total: ${totalRevenue} FCFA`);
    doc.moveDown(2);

    // List
    doc.fontSize(14).text('Liste des participants', { underline: true });
    doc.moveDown();

    inscriptions.forEach((ins, index) => {
      doc.fontSize(9);
      doc.text(`${index + 1}. ${ins.first_name} ${ins.last_name} - ${ins.section}`);
      doc.text(`   Email: ${ins.users?.email || 'N/A'}, Contact: ${ins.contact_phone}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getOccupancyStats,
  getRevenueStats,
  exportToExcel,
  exportToPDF
};
