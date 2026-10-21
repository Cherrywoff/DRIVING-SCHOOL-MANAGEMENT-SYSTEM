const ExcelJS = require('exceljs');
const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.userId;

    if (role === 'Admin') {
      const [[usersCount]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM UserMaster WHERE Role = "Student"');
      const [[instCount]] = await pool.query('SELECT COUNT(*) AS totalInstructors FROM InstructorMaster WHERE Status = "Active"');
      const [[vehCount]] = await pool.query('SELECT COUNT(*) AS totalVehicles FROM VehicleMaster WHERE Status = "Available"');
      const [[bookingCount]] = await pool.query('SELECT COUNT(*) AS totalBookings, SUM(CASE WHEN Status = "Completed" THEN 1 ELSE 0 END) AS completedBookings FROM BookingMaster');
      const [[revenueCount]] = await pool.query('SELECT COALESCE(SUM(AmountPaid), 0) AS totalRevenue, COALESCE(SUM(BalanceAmount), 0) AS totalPendingBalance FROM PaymentMaster');
      const [[testCount]] = await pool.query('SELECT COUNT(*) AS upcomingTests FROM TestScheduleMaster WHERE ResultStatus = "Scheduled"');

      return res.json({
        success: true,
        stats: {
          totalStudents: usersCount.totalStudents,
          totalInstructors: instCount.totalInstructors,
          availableVehicles: vehCount.totalVehicles,
          totalBookings: bookingCount.totalBookings || 0,
          completedBookings: bookingCount.completedBookings || 0,
          totalRevenue: parseFloat(revenueCount.totalRevenue),
          pendingBalance: parseFloat(revenueCount.totalPendingBalance),
          upcomingTests: testCount.upcomingTests
        }
      });
    }

    if (role === 'Instructor') {
      const [inst] = await pool.query('SELECT InstructorID FROM InstructorMaster WHERE UserID = ?', [userId]);
      const instructorId = inst.length > 0 ? inst[0].InstructorID : -1;

      const [[sessionStats]] = await pool.query(
        `SELECT COUNT(*) AS totalAssigned,
                SUM(CASE WHEN Status = "Scheduled" AND SessionDate = CURRENT_DATE() THEN 1 ELSE 0 END) AS todaySessions,
                SUM(CASE WHEN Status = "Completed" THEN 1 ELSE 0 END) AS completedSessions
         FROM BookingMaster WHERE InstructorID = ?`,
        [instructorId]
      );

      return res.json({
        success: true,
        stats: {
          totalAssignedSessions: sessionStats.totalAssigned || 0,
          todaySessions: sessionStats.todaySessions || 0,
          completedSessions: sessionStats.completedSessions || 0
        }
      });
    }

    if (role === 'Student') {
      const [bookings] = await pool.query(
        `SELECT COUNT(*) AS totalBookings,
                SUM(CASE WHEN Status = "Completed" THEN 1 ELSE 0 END) AS completedSessions
         FROM BookingMaster WHERE StudentID = ?`,
        [userId]
      );

      const [payments] = await pool.query(
        `SELECT COALESCE(SUM(AmountPaid), 0) AS totalPaid,
                COALESCE(SUM(BalanceAmount), 0) AS totalBalance
         FROM PaymentMaster WHERE StudentID = ?`,
        [userId]
      );

      const [tests] = await pool.query(
        `SELECT TestType, TestDate, ResultStatus, ScoreObtained
         FROM TestScheduleMaster WHERE StudentID = ? ORDER BY TestDate DESC LIMIT 1`,
        [userId]
      );

      return res.json({
        success: true,
        stats: {
          totalBookings: bookings[0].totalBookings || 0,
          completedSessions: bookings[0].completedSessions || 0,
          totalPaid: parseFloat(payments[0].totalPaid),
          totalBalance: parseFloat(payments[0].totalBalance),
          latestTest: tests.length > 0 ? tests[0] : null
        }
      });
    }

    res.json({ success: true, stats: {} });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard statistics.' });
  }
};

exports.exportStudentsExcel = async (req, res) => {
  try {
    const query = `
      SELECT u.UserID, u.FullName, u.Email, u.Phone, u.LLRNumber, u.Address, u.Status, u.CreatedAt,
             c.CourseName, p.TotalAmount, p.AmountPaid, p.BalanceAmount
      FROM UserMaster u
      LEFT JOIN PaymentMaster p ON u.UserID = p.StudentID
      LEFT JOIN CourseMaster c ON p.CourseID = c.CourseID
      WHERE u.Role = 'Student'
      ORDER BY u.CreatedAt DESC
    `;
    const [students] = await pool.query(query);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Driving School Management System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Enrolled Students');

    sheet.columns = [
      { header: 'Student ID', key: 'id', width: 12 },
      { header: 'Full Name', key: 'name', width: 25 },
      { header: 'Email Address', key: 'email', width: 28 },
      { header: 'Phone Number', key: 'phone', width: 16 },
      { header: 'LLR Number', key: 'llr', width: 22 },
      { header: 'Enrolled Course', key: 'course', width: 30 },
      { header: 'Total Fee (INR)', key: 'totalFee', width: 16 },
      { header: 'Amount Paid (INR)', key: 'amountPaid', width: 18 },
      { header: 'Balance Due (INR)', key: 'balance', width: 18 },
      { header: 'Account Status', key: 'status', width: 14 },
      { header: 'Registration Date', key: 'regDate', width: 18 }
    ];

    // Style Header Row
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // Deep Blue
    };

    students.forEach(s => {
      sheet.addRow({
        id: s.UserID,
        name: s.FullName,
        email: s.Email,
        phone: s.Phone || 'N/A',
        llr: s.LLRNumber || 'Pending',
        course: s.CourseName || 'Not Enrolled',
        totalFee: s.TotalAmount ? parseFloat(s.TotalAmount) : 0,
        amountPaid: s.AmountPaid ? parseFloat(s.AmountPaid) : 0,
        balance: s.BalanceAmount ? parseFloat(s.BalanceAmount) : 0,
        status: s.Status,
        regDate: new Date(s.CreatedAt).toLocaleDateString('en-IN')
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Students_Roster_2026.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('exportStudentsExcel error:', error);
    res.status(500).json({ success: false, message: 'Server error exporting student Excel sheet.' });
  }
};

exports.exportRevenueExcel = async (req, res) => {
  try {
    const query = `
      SELECT p.InvoiceNumber, p.TransactionReference, u.FullName AS StudentName,
             c.CourseName, p.TotalAmount, p.AmountPaid, p.BalanceAmount,
             p.PaymentMethod, p.PaymentStatus, p.PaymentDate
      FROM PaymentMaster p
      JOIN UserMaster u ON p.StudentID = u.UserID
      JOIN CourseMaster c ON p.CourseID = c.CourseID
      ORDER BY p.PaymentDate DESC
    `;
    const [payments] = await pool.query(query);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Driving School Management System';
    const sheet = workbook.addWorksheet('Revenue & Collections');

    sheet.columns = [
      { header: 'Invoice No', key: 'invoice', width: 18 },
      { header: 'Transaction Ref', key: 'txn', width: 28 },
      { header: 'Student Name', key: 'student', width: 25 },
      { header: 'Course Program', key: 'course', width: 30 },
      { header: 'Total Fee (INR)', key: 'total', width: 16 },
      { header: 'Amount Paid (INR)', key: 'paid', width: 18 },
      { header: 'Balance Due (INR)', key: 'balance', width: 18 },
      { header: 'Payment Method', key: 'method', width: 20 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Payment Date', key: 'date', width: 18 }
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF065F46' } // Forest Green
    };

    payments.forEach(p => {
      sheet.addRow({
        invoice: p.InvoiceNumber,
        txn: p.TransactionReference,
        student: p.StudentName,
        course: p.CourseName,
        total: parseFloat(p.TotalAmount),
        paid: parseFloat(p.AmountPaid),
        balance: parseFloat(p.BalanceAmount),
        method: p.PaymentMethod.replace('_', ' '),
        status: p.PaymentStatus,
        date: new Date(p.PaymentDate).toLocaleDateString('en-IN')
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Fee_Collections_Report_2026.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('exportRevenueExcel error:', error);
    res.status(500).json({ success: false, message: 'Server error exporting revenue Excel sheet.' });
  }
};
