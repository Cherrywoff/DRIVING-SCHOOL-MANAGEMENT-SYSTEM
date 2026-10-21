const pool = require('../config/db');

exports.getAllAttendance = async (req, res) => {
  try {
    const { studentId, bookingId } = req.query;
    let query = `
      SELECT a.AttendanceID, a.BookingID, a.StudentID, u.FullName AS StudentName, u.LLRNumber,
             a.InstructorID, u_inst.FullName AS InstructorName,
             a.SessionDate, a.AttendanceStatus, a.KilometersDriven, a.TopicsCovered,
             a.CompetencyRating, a.InstructorFeedback, a.LoggedAt,
             b.TimeSlot, c.CourseName, v.ModelType, v.RegistrationNumber
      FROM AttendanceMaster a
      JOIN BookingMaster b ON a.BookingID = b.BookingID
      JOIN UserMaster u ON a.StudentID = u.UserID
      JOIN InstructorMaster i ON a.InstructorID = i.InstructorID
      JOIN UserMaster u_inst ON i.UserID = u_inst.UserID
      JOIN CourseMaster c ON b.CourseID = c.CourseID
      JOIN VehicleMaster v ON b.VehicleID = v.VehicleID
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'Student') {
      query += ` AND a.StudentID = ?`;
      params.push(req.user.userId);
    } else if (req.user.role === 'Instructor') {
      const [inst] = await pool.query('SELECT InstructorID FROM InstructorMaster WHERE UserID = ?', [req.user.userId]);
      const instructorId = inst.length > 0 ? inst[0].InstructorID : -1;
      query += ` AND a.InstructorID = ?`;
      params.push(instructorId);
    } else if (req.user.role === 'Admin') {
      if (studentId) {
        query += ` AND a.StudentID = ?`;
        params.push(studentId);
      }
    }

    if (bookingId) {
      query += ` AND a.BookingID = ?`;
      params.push(bookingId);
    }

    query += ` ORDER BY a.SessionDate DESC`;
    const [records] = await pool.query(query, params);
    res.json({ success: true, count: records.length, attendance: records });
  } catch (error) {
    console.error('getAllAttendance error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving attendance records.' });
  }
};

exports.recordAttendance = async (req, res) => {
  try {
    const { bookingId, attendanceStatus, kilometersDriven, topicsCovered, competencyRating, instructorFeedback } = req.body;

    if (!bookingId || !attendanceStatus) {
      return res.status(400).json({ success: false, message: 'Booking ID and Attendance Status are required.' });
    }

    // Verify booking
    const [bRows] = await pool.query(
      'SELECT BookingID, StudentID, InstructorID, SessionDate FROM BookingMaster WHERE BookingID = ?',
      [bookingId]
    );

    if (bRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bRows[0];

    // If logged in as Instructor, verify assignment
    if (req.user.role === 'Instructor') {
      const [inst] = await pool.query('SELECT InstructorID FROM InstructorMaster WHERE UserID = ?', [req.user.userId]);
      if (inst.length === 0 || inst[0].InstructorID !== booking.InstructorID) {
        return res.status(403).json({ success: false, message: 'Unauthorized: You can only log attendance for your assigned sessions.' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO AttendanceMaster (BookingID, StudentID, InstructorID, SessionDate, AttendanceStatus, KilometersDriven, TopicsCovered, CompetencyRating, InstructorFeedback)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE AttendanceStatus = VALUES(AttendanceStatus),
                               KilometersDriven = VALUES(KilometersDriven),
                               TopicsCovered = VALUES(TopicsCovered),
                               CompetencyRating = VALUES(CompetencyRating),
                               InstructorFeedback = VALUES(InstructorFeedback),
                               LoggedAt = CURRENT_TIMESTAMP`,
      [booking.BookingID, booking.StudentID, booking.InstructorID, booking.SessionDate, attendanceStatus, kilometersDriven || 0.00, topicsCovered || null, competencyRating || 3, instructorFeedback || null]
    );

    // If marked Present, set booking to Completed
    if (attendanceStatus === 'Present') {
      await pool.query('UPDATE BookingMaster SET Status = "Completed" WHERE BookingID = ?', [bookingId]);
    }

    res.status(201).json({
      success: true,
      message: 'Attendance and lesson evaluation recorded successfully.',
      attendanceId: result.insertId
    });
  } catch (error) {
    console.error('recordAttendance error:', error);
    res.status(500).json({ success: false, message: 'Server error recording attendance.' });
  }
};
