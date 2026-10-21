const pool = require('../config/db');

exports.getAllBookings = async (req, res) => {
  try {
    const { status, date, studentId } = req.query;
    let query = `
      SELECT b.BookingID, b.StudentID, u.FullName AS StudentName, u.Email AS StudentEmail, u.Phone AS StudentPhone, u.LLRNumber,
             b.CourseID, c.CourseName, c.Category AS CourseCategory,
             b.InstructorID, u_inst.FullName AS InstructorName, u_inst.Phone AS InstructorPhone,
             b.VehicleID, v.RegistrationNumber, v.ModelType,
             b.SessionDate, b.TimeSlot, b.Status, b.Notes, b.CreatedAt,
             a.AttendanceID, a.AttendanceStatus, a.CompetencyRating
      FROM BookingMaster b
      JOIN UserMaster u ON b.StudentID = u.UserID
      JOIN CourseMaster c ON b.CourseID = c.CourseID
      JOIN InstructorMaster i ON b.InstructorID = i.InstructorID
      JOIN UserMaster u_inst ON i.UserID = u_inst.UserID
      JOIN VehicleMaster v ON b.VehicleID = v.VehicleID
      LEFT JOIN AttendanceMaster a ON b.BookingID = a.BookingID
      WHERE 1=1
    `;
    const params = [];

    // Role-based restrictions:
    if (req.user.role === 'Student') {
      query += ` AND b.StudentID = ?`;
      params.push(req.user.userId);
    } else if (req.user.role === 'Instructor') {
      // Find InstructorID
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

    query += ` ORDER BY b.SessionDate DESC, b.TimeSlot ASC`;
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

    // If Student role, force studentId to logged-in user
    if (req.user.role === 'Student') {
      studentId = req.user.userId;
    }

    if (!studentId || !courseId || !instructorId || !vehicleId || !sessionDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Student, Course, Instructor, Vehicle, Session Date, Time Slot) are required.'
      });
    }

    // 1. Conflict Check: Instructor availability
    const [instConflict] = await pool.query(
      `SELECT BookingID FROM BookingMaster
       WHERE InstructorID = ? AND SessionDate = ? AND TimeSlot = ? AND Status IN ('Scheduled', 'Completed')`,
      [instructorId, sessionDate, timeSlot]
    );
    if (instConflict.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Scheduling Conflict: The selected Instructor is already booked for ${timeSlot} on ${sessionDate}. Please select another time slot or instructor.`
      });
    }

    // 2. Conflict Check: Vehicle availability
    const [vehConflict] = await pool.query(
      `SELECT BookingID FROM BookingMaster
       WHERE VehicleID = ? AND SessionDate = ? AND TimeSlot = ? AND Status IN ('Scheduled', 'Completed')`,
      [vehicleId, sessionDate, timeSlot]
    );
    if (vehConflict.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Scheduling Conflict: The selected Vehicle is already assigned to another session for ${timeSlot} on ${sessionDate}. Please select another vehicle or slot.`
      });
    }

    // 3. Conflict Check: Student overlapping booking
    const [studentConflict] = await pool.query(
      `SELECT BookingID FROM BookingMaster
       WHERE StudentID = ? AND SessionDate = ? AND TimeSlot = ? AND Status IN ('Scheduled', 'Completed')`,
      [studentId, sessionDate, timeSlot]
    );
    if (studentConflict.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Scheduling Conflict: You already have a session booked for ${timeSlot} on ${sessionDate}.`
      });
    }

    const [result] = await pool.query(
      `INSERT INTO BookingMaster (StudentID, CourseID, InstructorID, VehicleID, SessionDate, TimeSlot, Status, Notes)
       VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', ?)`,
      [studentId, courseId, instructorId, vehicleId, sessionDate, timeSlot, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Practical training session booked successfully!',
      bookingId: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Conflict: Slot already reserved for this instructor or vehicle.'
      });
    }
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error creating booking.' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const bookingId = req.params.id;

    if (!['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status.' });
    }

    // Check ownership if student
    if (req.user.role === 'Student') {
      const [b] = await pool.query('SELECT StudentID FROM BookingMaster WHERE BookingID = ?', [bookingId]);
      if (b.length === 0 || b[0].StudentID !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Access denied: You can only modify your own bookings.' });
      }
      if (status !== 'Cancelled') {
        return res.status(403).json({ success: false, message: 'Students can only cancel scheduled bookings.' });
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
