const pool = require('../config/db');

exports.getAllBookings = async (req, res) => {
  try {
    const { status, date, studentId } = req.query;
    let query = `
      SELECT b.BookingID, b.StudentID, u.FullName AS StudentName, u.Email AS StudentEmail, u.Phone AS StudentPhone, u.LLRNumber,
             b.CourseID, c.CourseName, c.Category AS CourseCategory, c.DurationDays, c.PracticalHours,
             b.InstructorID, u_inst.FullName AS InstructorName, u_inst.Phone AS InstructorPhone,
             b.VehicleID, v.RegistrationNumber, v.ModelType,
             b.SessionDate, b.TimeSlot, b.Status, b.Notes, b.CreatedAt,
             a.AttendanceID, a.AttendanceStatus, a.CompetencyRating
      FROM BookingMaster b
      JOIN UserMaster u ON b.StudentID = u.UserID
      JOIN CourseMaster c ON b.CourseID = c.CourseID
      LEFT JOIN InstructorMaster i ON b.InstructorID = i.InstructorID
      LEFT JOIN UserMaster u_inst ON i.UserID = u_inst.UserID
      LEFT JOIN VehicleMaster v ON b.VehicleID = v.VehicleID
      LEFT JOIN AttendanceMaster a ON b.BookingID = a.BookingID
      WHERE 1=1
    `;
    const params = [];

    // Role-based restrictions:
    if (req.user.role === 'Student') {
      query += ` AND b.StudentID = ?`;
      params.push(req.user.userId);
    } else if (req.user.role === 'Instructor') {
      const [inst] = await pool.query('SELECT InstructorID FROM InstructorMaster WHERE UserID = ?', [req.user.userId]);
      const instructorId = inst.length > 0 ? inst[0].InstructorID : -1;
      query += ` AND b.InstructorID = ?`;
      params.push(instructorId);
    } else if (req.user.role === 'Admin') {
      if (studentId) {
        query += ` AND b.StudentID = ?`;
        params.push(studentId);
      }
    }

    if (status) {
      query += ` AND b.Status = ?`;
      params.push(status);
    }
    if (date) {
      query += ` AND b.SessionDate = ?`;
      params.push(date);
    }

    query += ` ORDER BY b.CreatedAt DESC, b.SessionDate DESC`;
    const [bookings] = await pool.query(query, params);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving bookings.' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    let { studentId, courseId, instructorId, vehicleId, sessionDate, timeSlot, notes } = req.body;

    if (req.user.role === 'Student') {
      studentId = req.user.userId;
    }

    if (!studentId || !courseId || !sessionDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Student, Course, Start Date, and Time Slot are required.'
      });
    }

    // If an instructor and vehicle are provided (e.g. assigned directly by admin)
    if (instructorId && vehicleId) {
      // 1. Conflict Check: Instructor
      const [instConflict] = await pool.query(
        `SELECT BookingID FROM BookingMaster
         WHERE InstructorID = ? AND TimeSlot = ? AND Status = 'Scheduled'`,
        [instructorId, timeSlot]
      );
      if (instConflict.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Scheduling Conflict: Selected instructor is already assigned to another student for slot ${timeSlot}.`
        });
      }

      // 2. Conflict Check: Vehicle
      const [vehConflict] = await pool.query(
        `SELECT BookingID FROM BookingMaster
         WHERE VehicleID = ? AND TimeSlot = ? AND Status = 'Scheduled'`,
        [vehicleId, timeSlot]
      );
      if (vehConflict.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Scheduling Conflict: Selected vehicle is already assigned to another student for slot ${timeSlot}.`
        });
      }
    }

    const initialStatus = (instructorId && vehicleId && req.user.role === 'Admin') ? 'Scheduled' : 'Pending';

    const [result] = await pool.query(
      `INSERT INTO BookingMaster (StudentID, CourseID, InstructorID, VehicleID, SessionDate, TimeSlot, Status, Notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        courseId,
        instructorId || null,
        vehicleId || null,
        sessionDate,
        timeSlot,
        initialStatus,
        notes || (initialStatus === 'Pending' ? 'Slot requested upon course enrollment. Awaiting Admin finalization.' : 'Fixed schedule approved by Admin.')
      ]
    );

    res.status(201).json({
      success: true,
      message: initialStatus === 'Scheduled'
        ? 'Course training schedule finalized successfully!'
        : 'Preferred slot requested! Administrator will assign certified instructor and vehicle.',
      bookingId: result.insertId,
      status: initialStatus
    });
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error creating booking.' });
  }
};

// Admin Slot Finalization & Instructor/Vehicle Assignment
exports.assignAndFinalizeSlot = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { instructorId, vehicleId, timeSlot, sessionDate, notes } = req.body;

    if (!instructorId || !vehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Both Certified Instructor and Vehicle must be selected to finalize the slot.'
      });
    }

    // Retrieve booking
    const [bookingRows] = await pool.query('SELECT * FROM BookingMaster WHERE BookingID = ?', [bookingId]);
    if (bookingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    const currentBooking = bookingRows[0];
    const targetSlot = timeSlot || currentBooking.TimeSlot;

    // 1. Conflict Check: Instructor
    const [instConflict] = await pool.query(
      `SELECT b.BookingID, u.FullName AS StudentName
       FROM BookingMaster b
       JOIN UserMaster u ON b.StudentID = u.UserID
       WHERE b.InstructorID = ? AND b.TimeSlot = ? AND b.Status = 'Scheduled' AND b.BookingID != ?`,
      [instructorId, targetSlot, bookingId]
    );
    if (instConflict.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Instructor Conflict: This instructor is already committed to student "${instConflict[0].StudentName}" for the ${targetSlot} slot. Please select a different instructor or slot.`
      });
    }

    // 2. Conflict Check: Vehicle
    const [vehConflict] = await pool.query(
      `SELECT b.BookingID, v.RegistrationNumber, v.ModelType, u.FullName AS StudentName
       FROM BookingMaster b
       JOIN VehicleMaster v ON b.VehicleID = v.VehicleID
       JOIN UserMaster u ON b.StudentID = u.UserID
       WHERE b.VehicleID = ? AND b.TimeSlot = ? AND b.Status = 'Scheduled' AND b.BookingID != ?`,
      [vehicleId, targetSlot, bookingId]
    );
    if (vehConflict.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Vehicle Conflict: This vehicle (${vehConflict[0].ModelType} - ${vehConflict[0].RegistrationNumber}) is already assigned to student "${vehConflict[0].StudentName}" for the ${targetSlot} slot.`
      });
    }

    // Update booking
    await pool.query(
      `UPDATE BookingMaster SET
         InstructorID = ?,
         VehicleID = ?,
         TimeSlot = COALESCE(?, TimeSlot),
         SessionDate = COALESCE(?, SessionDate),
         Status = 'Scheduled',
         Notes = COALESCE(?, 'Slot and trainer finalized by Administrator.')
       WHERE BookingID = ?`,
      [instructorId, vehicleId, timeSlot || null, sessionDate || null, notes || null, bookingId]
    );

    res.json({
      success: true,
      message: 'Training slot finalized and assigned successfully! The student schedule is now active.'
    });
  } catch (error) {
    console.error('assignAndFinalizeSlot error:', error);
    res.status(500).json({ success: false, message: 'Server error finalizing slot assignment.' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const bookingId = req.params.id;

    if (!['Pending', 'Scheduled', 'Completed', 'Cancelled', 'Rescheduled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status.' });
    }

    if (req.user.role === 'Student') {
      const [b] = await pool.query('SELECT StudentID FROM BookingMaster WHERE BookingID = ?', [bookingId]);
      if (b.length === 0 || b[0].StudentID !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Access denied: You can only modify your own bookings.' });
      }
      if (status !== 'Cancelled') {
        return res.status(403).json({ success: false, message: 'Students can only cancel their slot requests.' });
      }
    }

    await pool.query(
      `UPDATE BookingMaster SET Status = ?, Notes = COALESCE(?, Notes) WHERE BookingID = ?`,
      [status, notes, bookingId]
    );

    res.json({ success: true, message: `Booking status updated to ${status}.` });
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating booking status.' });
  }
};
