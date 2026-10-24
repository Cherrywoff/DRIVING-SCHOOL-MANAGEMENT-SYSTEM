const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'driving_school_mgmt_system_super_secret_jwt_key_2026_cocsit_bca';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone, llrNumber, address } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Email, and Password are required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check duplicate email
    const [existing] = await pool.query('SELECT UserID FROM UserMaster WHERE Email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO UserMaster (FullName, Email, PasswordHash, Role, Phone, LLRNumber, Address, Status)
       VALUES (?, ?, ?, 'Student', ?, ?, ?, 'Active')`,
      [fullName.trim(), email.trim().toLowerCase(), passwordHash, phone || null, llrNumber || null, address || null]
    );

    const newUserId = result.insertId;

    const token = jwt.sign(
      { userId: newUserId, email: email.trim().toLowerCase(), role: 'Student', fullName: fullName.trim() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully!',
      token,
      user: {
        userId: newUserId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role: 'Student',
        phone,
        llrNumber,
        address
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration.'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and Password are required.'
      });
    }

    const [rows] = await pool.query(
      `SELECT UserID, FullName, Email, PasswordHash, Role, Phone, LLRNumber, Address, Status
       FROM UserMaster WHERE Email = ?`,
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = rows[0];

    if (user.Status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.Status.toLowerCase()}. Please contact administration.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // If instructor, find instructor ID
    let instructorId = null;
    if (user.Role === 'Instructor') {
      const [inst] = await pool.query('SELECT InstructorID FROM InstructorMaster WHERE UserID = ?', [user.UserID]);
      if (inst.length > 0) instructorId = inst[0].InstructorID;
    }

    const token = jwt.sign(
      {
        userId: user.UserID,
        email: user.Email,
        role: user.Role,
        fullName: user.FullName,
        instructorId
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        userId: user.UserID,
        fullName: user.FullName,
        email: user.Email,
        role: user.Role,
        phone: user.Phone,
        llrNumber: user.LLRNumber,
        address: user.Address,
        instructorId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT UserID, FullName, Email, Role, Phone, LLRNumber, Address, Status, CreatedAt
       FROM UserMaster WHERE UserID = ?`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];
    let instructorDetails = null;

    // If instructor, fetch instructor specifics
    if (user.Role === 'Instructor') {
      const [inst] = await pool.query(
        `SELECT i.InstructorID, i.LicenseNumber, i.Specialization, i.ExperienceYears, i.Status AS InstructorStatus,
                v.RegistrationNumber, v.ModelType
         FROM InstructorMaster i
         LEFT JOIN VehicleMaster v ON i.AssignedVehicleID = v.VehicleID
         WHERE i.UserID = ?`,
        [req.user.userId]
      );
      if (inst.length > 0) {
        instructorDetails = inst[0];
      }
    }

    const profile = {
      userId: user.UserID,
      UserID: user.UserID,
      fullName: user.FullName,
      FullName: user.FullName,
      email: user.Email,
      Email: user.Email,
      role: user.Role,
      Role: user.Role,
      phone: user.Phone,
      Phone: user.Phone,
      llrNumber: user.LLRNumber,
      LLRNumber: user.LLRNumber,
      address: user.Address,
      Address: user.Address,
      status: user.Status,
      Status: user.Status,
      instructorId: instructorDetails ? instructorDetails.InstructorID : null,
      instructorDetails
    };

    res.json({ success: true, profile });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, llrNumber, address } = req.body;
    await pool.query(
      `UPDATE UserMaster SET FullName = COALESCE(?, FullName),
                             Phone = COALESCE(?, Phone),
                             LLRNumber = COALESCE(?, LLRNumber),
                             Address = COALESCE(?, Address)
       WHERE UserID = ?`,
      [fullName, phone, llrNumber, address, req.user.userId]
    );

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = `SELECT UserID, FullName, Email, Role, Phone, LLRNumber, Status, CreatedAt FROM UserMaster WHERE 1=1`;
    const params = [];

    if (role) {
      query += ` AND Role = ?`;
      params.push(role);
    }
    if (search) {
      query += ` AND (FullName LIKE ? OR Email LIKE ? OR Phone LIKE ? OR LLRNumber LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ` ORDER BY CreatedAt DESC`;
    const [users] = await pool.query(query, params);
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users.' });
  }
};

exports.getStudentFullDetails = async (req, res) => {
  try {
    const studentId = req.params.id;

    // 1. Basic profile
    const [userRows] = await pool.query(
      `SELECT UserID, FullName, Email, Role, Phone, LLRNumber, Address, Status, CreatedAt
       FROM UserMaster WHERE UserID = ?`,
      [studentId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const student = userRows[0];

    // 2. Bookings & Course Schedules
    const [bookings] = await pool.query(
      `SELECT b.*, c.CourseCode, c.CourseName, c.Category AS CourseCategory, c.DurationDays, c.PracticalHours, c.Fee,
              u_inst.FullName AS InstructorName, u_inst.Phone AS InstructorPhone,
              v.RegistrationNumber, v.ModelType
       FROM BookingMaster b
       JOIN CourseMaster c ON b.CourseID = c.CourseID
       LEFT JOIN InstructorMaster i ON b.InstructorID = i.InstructorID
       LEFT JOIN UserMaster u_inst ON i.UserID = u_inst.UserID
       LEFT JOIN VehicleMaster v ON b.VehicleID = v.VehicleID
       WHERE b.StudentID = ?
       ORDER BY b.CreatedAt DESC`,
      [studentId]
    );

    // 3. Fee Invoices & Payments
    const [payments] = await pool.query(
      `SELECT p.*, c.CourseName
       FROM PaymentMaster p
       LEFT JOIN CourseMaster c ON p.CourseID = c.CourseID
       WHERE p.StudentID = ?
       ORDER BY p.PaymentDate DESC`,
      [studentId]
    );

    // 4. Attendance & Practical Driving Log
    const [attendance] = await pool.query(
      `SELECT a.*, b.TimeSlot, c.CourseName, u_inst.FullName AS InstructorName, v.RegistrationNumber, v.ModelType
       FROM AttendanceMaster a
       JOIN BookingMaster b ON a.BookingID = b.BookingID
       LEFT JOIN CourseMaster c ON b.CourseID = c.CourseID
       LEFT JOIN InstructorMaster i ON a.InstructorID = i.InstructorID
       LEFT JOIN UserMaster u_inst ON i.UserID = u_inst.UserID
       LEFT JOIN VehicleMaster v ON b.VehicleID = v.VehicleID
       WHERE a.StudentID = ?
       ORDER BY a.SessionDate DESC`,
      [studentId]
    );

    // 5. RTO & Mock Tests
    const [tests] = await pool.query(
      `SELECT t.*, c.CourseName
       FROM TestScheduleMaster t
       LEFT JOIN CourseMaster c ON t.CourseID = c.CourseID
       WHERE t.StudentID = ?
       ORDER BY t.TestDate DESC, t.CreatedAt DESC`,
      [studentId]
    );

    // Summary calculations
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.AmountPaid || 0), 0);
    const totalFee = payments.reduce((sum, p) => sum + parseFloat(p.TotalAmount || 0), 0);
    const balanceDue = payments.reduce((sum, p) => sum + parseFloat(p.BalanceAmount || 0), 0);
    const sessionsAttended = attendance.filter(a => a.AttendanceStatus === 'Present').length;

    res.json({
      success: true,
      student: {
        ...student,
        summary: {
          totalPaid,
          totalFee,
          balanceDue,
          sessionsAttended,
          testsTaken: tests.length
        },
        bookings,
        payments,
        attendance,
        tests
      }
    });
  } catch (error) {
    console.error('getStudentFullDetails error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving student full details.' });
  }
};
