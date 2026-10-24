const PDFDocument = require('pdfkit');
const pool = require('../config/db');

exports.getAllPayments = async (req, res) => {
  try {
    const { studentId, paymentStatus } = req.query;
    let query = `
      SELECT p.PaymentID, p.StudentID, u.FullName AS StudentName, u.Email AS StudentEmail, u.Phone AS StudentPhone, u.LLRNumber,
             p.CourseID, c.CourseName, c.Category AS CourseCategory, c.Fee AS CourseStandardFee,
             p.InvoiceNumber, p.TotalAmount, p.AmountPaid, p.BalanceAmount,
             p.PaymentMethod, p.TransactionReference, p.PaymentStatus, p.PaymentDate
      FROM PaymentMaster p
      JOIN UserMaster u ON p.StudentID = u.UserID
      JOIN CourseMaster c ON p.CourseID = c.CourseID
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'Student') {
      query += ` AND p.StudentID = ?`;
      params.push(req.user.userId);
    } else if (studentId) {
      query += ` AND p.StudentID = ?`;
      params.push(studentId);
    }

    if (paymentStatus) {
      query += ` AND p.PaymentStatus = ?`;
      params.push(paymentStatus);
    }

    query += ` ORDER BY p.PaymentDate DESC`;
    const [payments] = await pool.query(query, params);
    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    console.error('getAllPayments error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving payment records.' });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { courseId, amountPaid, paymentMethod } = req.body;
    const studentId = req.user.role === 'Student' ? req.user.userId : req.body.studentId;

    if (!studentId || !courseId || !amountPaid) {
      return res.status(400).json({ success: false, message: 'Course ID and Amount are required.' });
    }

    // Get course details for total fee
    const [cRows] = await pool.query('SELECT CourseName, Fee FROM CourseMaster WHERE CourseID = ?', [courseId]);
    if (cRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Selected course not found.' });
    }

    const course = cRows[0];
    const totalFee = parseFloat(course.Fee);
    // As per academy policy, course enrollment requires full payment
    const paid = totalFee;
    const balance = 0.00;
    const status = 'Completed';

    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-2026-${randomSuffix}`;
    const transactionRef = `TXN-${paymentMethod || 'UPI'}-${timestamp}-${randomSuffix}`;

    const [result] = await pool.query(
      `INSERT INTO PaymentMaster (StudentID, CourseID, InvoiceNumber, TotalAmount, AmountPaid, BalanceAmount, PaymentMethod, TransactionReference, PaymentStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, courseId, invoiceNumber, totalFee, paid, balance, paymentMethod || 'UPI_Simulated', transactionRef, status]
    );

    const paymentId = result.insertId;

    // Auto-create a pending course slot reservation if requested
    const { preferredSlot, startDate } = req.body;
    let bookingId = null;
    if (preferredSlot || startDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const sessionDate = startDate || tomorrow.toISOString().slice(0, 10);
      const timeSlot = preferredSlot || '07:00 AM - 08:00 AM';

      const [bookingResult] = await pool.query(
        `INSERT INTO BookingMaster (StudentID, CourseID, SessionDate, TimeSlot, Status, Notes)
         VALUES (?, ?, ?, ?, 'Pending', ?)`,
        [
          studentId,
          courseId,
          sessionDate,
          timeSlot,
          `Course fully paid (Receipt ${invoiceNumber}). Student requested ${timeSlot}. Awaiting Admin instructor/vehicle assignment.`
        ]
      );
      bookingId = bookingResult.insertId;
    }

    res.status(201).json({
      success: true,
      message: 'Course purchase and full payment completed! Official invoice generated.',
      paymentId,
      bookingId,
      invoiceNumber,
      transactionRef,
      status,
      balance
    });
  } catch (error) {
    console.error('processPayment error:', error);
    res.status(500).json({ success: false, message: 'Server error processing payment.' });
  }
};

exports.generateReceiptPdf = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const query = `
      SELECT p.*, u.FullName AS StudentName, u.Email AS StudentEmail, u.Phone AS StudentPhone, u.LLRNumber, u.Address AS StudentAddress,
             c.CourseName, c.Category AS CourseCategory, c.DurationDays, c.PracticalHours
      FROM PaymentMaster p
      JOIN UserMaster u ON p.StudentID = u.UserID
      JOIN CourseMaster c ON p.CourseID = c.CourseID
      WHERE p.PaymentID = ?
    `;
    const [rows] = await pool.query(query, [paymentId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const payment = rows[0];

    // Check ownership if student
    if (req.user.role === 'Student' && payment.StudentID !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own receipts.' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt_${payment.InvoiceNumber}.pdf`);
    doc.pipe(res);

    // Header styling
    doc.fontSize(20).font('Helvetica-Bold').text('DRIVING SCHOOL MANAGEMENT SYSTEM', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Affiliated Training Institute | Latur, Maharashtra', { align: 'center' });
    doc.moveDown(0.5);
    doc.strokeColor('#2563EB').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Title
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1E3A8A').text('FEE PAYMENT RECEIPT', { align: 'center' });
    doc.moveDown(1);

    // Invoice Meta Table
    doc.fontSize(10).font('Helvetica').fillColor('#000000');
    const startY = doc.y;
    doc.text(`Invoice No: ${payment.InvoiceNumber}`, 50, startY);
    doc.text(`Receipt Date: ${new Date(payment.PaymentDate).toLocaleDateString('en-IN')}`, 350, startY);
    doc.text(`Transaction Ref: ${payment.TransactionReference}`, 50, startY + 16);
    doc.text(`Payment Mode: ${payment.PaymentMethod.replace('_', ' ')}`, 350, startY + 16);
    doc.moveDown(2);

    // Student Details Box
    doc.rect(50, doc.y, 500, 60).strokeColor('#E2E8F0').stroke();
    const boxY = doc.y + 10;
    doc.font('Helvetica-Bold').text('Learner Details:', 60, boxY);
    doc.font('Helvetica').text(`Name: ${payment.StudentName}`, 60, boxY + 16);
    doc.text(`Phone: ${payment.StudentPhone || 'N/A'}`, 60, boxY + 30);
    doc.text(`LLR No: ${payment.LLRNumber || 'Pending Application'}`, 300, boxY + 16);
    doc.text(`Email: ${payment.StudentEmail}`, 300, boxY + 30);
    doc.y = boxY + 65;
    doc.moveDown(1);

    // Course & Fee Breakdown Table
    doc.rect(50, doc.y, 500, 24).fillColor('#F1F5F9').fill();
    doc.fillColor('#0F172A').font('Helvetica-Bold');
    const tableHeaderY = doc.y + 7;
    doc.text('Description / Program', 60, tableHeaderY);
    doc.text('Category', 240, tableHeaderY);
    doc.text('Duration', 370, tableHeaderY);
    doc.text('Amount (INR)', 460, tableHeaderY);
    doc.y = tableHeaderY + 22;

    doc.font('Helvetica').fillColor('#000000');
    const itemY = doc.y;
    doc.text(payment.CourseName, 60, itemY);
    doc.text(payment.CourseCategory, 240, itemY);
    doc.text(`${payment.DurationDays} Days (${payment.PracticalHours}h)`, 370, itemY);
    doc.text(`Rs. ${parseFloat(payment.TotalAmount).toFixed(2)}`, 460, itemY);
    doc.moveDown(2);

    doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Summary Totals
    const totalsY = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Total Course Fee:', 320, totalsY);
    doc.text(`Rs. ${parseFloat(payment.TotalAmount).toFixed(2)}`, 460, totalsY);

    doc.text('Amount Paid:', 320, totalsY + 16);
    doc.fillColor('#16A34A').text(`Rs. ${parseFloat(payment.AmountPaid).toFixed(2)}`, 460, totalsY + 16);

    doc.fillColor('#000000').text('Outstanding Balance:', 320, totalsY + 32);
    doc.fillColor(payment.BalanceAmount > 0 ? '#DC2626' : '#16A34A').text(`Rs. ${parseFloat(payment.BalanceAmount).toFixed(2)}`, 460, totalsY + 32);

    doc.moveDown(4);
    doc.fillColor('#000000').font('Helvetica-Bold').text(`Status: ${payment.PaymentStatus.toUpperCase()}`, 50, doc.y);
    doc.moveDown(3);

    // Footer signatures
    const sigY = doc.y;
    doc.fontSize(9).font('Helvetica').text('Student Signature', 80, sigY);
    doc.text('Authorized Signatory & Seal', 380, sigY);
    doc.text('(Driving Academy Administration)', 370, sigY + 14);

    doc.end();
  } catch (error) {
    console.error('generateReceiptPdf error:', error);
    res.status(500).json({ success: false, message: 'Server error generating PDF receipt.' });
  }
};
