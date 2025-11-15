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
    const { data: inscriptions, error } = await supabase
      .from('inscriptions')
      .select(`
        *,
        users(email),
        payments(status, amount, payment_date),
        dormitory_assignments(room_number, bed_number, dormitories(name))
      `);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Convert to CSV format
    const headers = [
      'ID',
      'Prénom',
      'Nom',
      'Email',
      'Section',
      'Genre',
      'Âge',
      'Contact',
      'Résidence',
      'Statut',
      'Paiement',
      'Dortoir',
      'Chambre',
      'Lit'
    ];

    const rows = inscriptions.map(ins => [
      ins.id,
      ins.first_name,
      ins.last_name,
      ins.users?.email || '',
      ins.section,
      ins.gender === 'male' ? 'Homme' : 'Femme',
      ins.age,
      ins.contact_phone,
      ins.residence_location,
      ins.status,
      ins.payments?.[0]?.status || 'N/A',
      ins.dormitory_assignments?.[0]?.dormitories?.name || 'Non assigné',
      ins.dormitory_assignments?.[0]?.room_number || '',
      ins.dormitory_assignments?.[0]?.bed_number || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=inscriptions_jospia.csv');
    res.send('\uFEFF' + csv); // UTF-8 BOM for Excel
  } catch (error) {
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
