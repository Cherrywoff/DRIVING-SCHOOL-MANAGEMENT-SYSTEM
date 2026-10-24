const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllInstructors = async (req, res) => {
  try {
    const query = `
      SELECT i.InstructorID, i.UserID, u.FullName, u.Email, u.Phone,
             i.LicenseNumber, i.LicenseExpiryDate, i.Specialization, i.ExperienceYears,
             i.WorkingHoursStart, i.WorkingHoursEnd, i.Status, COALESCE(i.Salary, 25000.00) AS Salary,
             v.VehicleID, v.RegistrationNumber, v.ModelType, v.Category AS VehicleCategory
      FROM InstructorMaster i
      JOIN UserMaster u ON i.UserID = u.UserID
      LEFT JOIN VehicleMaster v ON i.AssignedVehicleID = v.VehicleID
      WHERE i.Status != 'Deleted'
      ORDER BY i.Status ASC, i.ExperienceYears DESC
    `;
    const [instructors] = await pool.query(query);
    res.json({ success: true, count: instructors.length, instructors });
  } catch (error) {
    console.error('getAllInstructors error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving instructors.' });
  }
};

exports.getInstructorById = async (req, res) => {
  try {
    const query = `
      SELECT i.InstructorID, i.UserID, u.FullName, u.Email, u.Phone,
             i.LicenseNumber, i.LicenseExpiryDate, i.Specialization, i.ExperienceYears,
             i.WorkingHoursStart, i.WorkingHoursEnd, i.Status, COALESCE(i.Salary, 25000.00) AS Salary,
             v.VehicleID, v.RegistrationNumber, v.ModelType
      FROM InstructorMaster i
      JOIN UserMaster u ON i.UserID = u.UserID
      LEFT JOIN VehicleMaster v ON i.AssignedVehicleID = v.VehicleID
      WHERE i.InstructorID = ?
    `;
    const [rows] = await pool.query(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Instructor not found.' });
    }
    res.json({ success: true, instructor: rows[0] });
  } catch (error) {
    console.error('getInstructorById error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving instructor.' });
  }
};

exports.createInstructor = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      email,
      phone,
      password,
      licenseNumber,
      licenseExpiryDate,
      specialization,
      experienceYears,
      salary,
      assignedVehicleId
    } = req.body;

    let targetUserId = userId;

    // If creating a brand new instructor with user credentials
    if (!targetUserId) {
      if (!fullName || !email || !licenseNumber) {
        return res.status(400).json({ success: false, message: 'Full name, email, and license number are required.' });
      }

      // Check if email already registered
      const [existing] = await pool.query('SELECT UserID FROM UserMaster WHERE Email = ?', [email.trim().toLowerCase()]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'A user with this email address already exists.' });
      }

      const defaultPass = password || 'Instructor@123';
      const hashedPassword = await bcrypt.hash(defaultPass, 10);

      const [userResult] = await pool.query(
        `INSERT INTO UserMaster (FullName, Email, PasswordHash, Phone, Role, Status)
         VALUES (?, ?, ?, ?, 'Instructor', 'Active')`,
        [fullName.trim(), email.trim().toLowerCase(), hashedPassword, phone || null]
      );
      targetUserId = userResult.insertId;
    } else {
      // Set existing user role to Instructor
      await pool.query('UPDATE UserMaster SET Role = "Instructor" WHERE UserID = ?', [targetUserId]);
    }

    const [result] = await pool.query(
      `INSERT INTO InstructorMaster (UserID, LicenseNumber, LicenseExpiryDate, Specialization, ExperienceYears, Salary, AssignedVehicleID, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [
        targetUserId,
        licenseNumber.trim(),
        licenseExpiryDate || null,
        specialization || 'Light Motor Vehicle (LMV)',
        parseInt(experienceYears || '0', 10),
        parseFloat(salary || '25000.00'),
        assignedVehicleId ? parseInt(assignedVehicleId, 10) : null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Instructor created successfully.',
      instructorId: result.insertId,
      userId: targetUserId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'License number or user is already registered as an instructor.' });
    }
    console.error('createInstructor error:', error);
    res.status(500).json({ success: false, message: 'Server error creating instructor.' });
  }
};

exports.updateInstructor = async (req, res) => {
  try {
    const {
      salary,
      specialization,
      experienceYears,
      assignedVehicleId,
      status,
      licenseExpiryDate,
      phone
    } = req.body;

    const instructorId = req.params.id;

    // Fetch UserID for this instructor
    const [inst] = await pool.query('SELECT UserID FROM InstructorMaster WHERE InstructorID = ?', [instructorId]);
    if (inst.length === 0) {
      return res.status(404).json({ success: false, message: 'Instructor not found.' });
    }

    if (phone) {
      await pool.query('UPDATE UserMaster SET Phone = ? WHERE UserID = ?', [phone, inst[0].UserID]);
    }

    await pool.query(
      `UPDATE InstructorMaster SET
         Salary = COALESCE(?, Salary),
         Specialization = COALESCE(?, Specialization),
         ExperienceYears = COALESCE(?, ExperienceYears),
         AssignedVehicleID = ?,
         Status = COALESCE(?, Status),
         LicenseExpiryDate = COALESCE(?, LicenseExpiryDate)
       WHERE InstructorID = ?`,
      [
        salary !== undefined ? parseFloat(salary) : null,
        specialization || null,
        experienceYears !== undefined ? parseInt(experienceYears, 10) : null,
        assignedVehicleId !== undefined ? (assignedVehicleId ? parseInt(assignedVehicleId, 10) : null) : null,
        status || null,
        licenseExpiryDate || null,
        instructorId
      ]
    );

    res.json({ success: true, message: 'Instructor details & salary updated successfully.' });
  } catch (error) {
    console.error('updateInstructor error:', error);
    res.status(500).json({ success: false, message: 'Server error updating instructor.' });
  }
};

exports.deleteInstructor = async (req, res) => {
  try {
    const instructorId = req.params.id;

    const [inst] = await pool.query('SELECT UserID, FullName FROM InstructorMaster i JOIN UserMaster u ON i.UserID = u.UserID WHERE i.InstructorID = ?', [instructorId]);
    if (inst.length === 0) {
      return res.status(404).json({ success: false, message: 'Instructor not found.' });
    }

    // Check if instructor has active bookings
    const [bookings] = await pool.query(
      `SELECT BookingID FROM BookingMaster WHERE InstructorID = ? AND BookingStatus IN ('Pending', 'Confirmed')`,
      [instructorId]
    );

    if (bookings.length > 0) {
      // Soft-delete to Inactive to preserve historical records
      await pool.query('UPDATE InstructorMaster SET Status = "Inactive" WHERE InstructorID = ?', [instructorId]);
      await pool.query('UPDATE UserMaster SET Status = "Inactive" WHERE UserID = ?', [inst[0].UserID]);
      return res.json({
        success: true,
        message: 'Instructor has active session records, so their status was set to Inactive to preserve audit logs.'
      });
    }

    // Soft delete
    await pool.query('UPDATE InstructorMaster SET Status = "Deleted" WHERE InstructorID = ?', [instructorId]);
    await pool.query('UPDATE UserMaster SET Status = "Inactive" WHERE UserID = ?', [inst[0].UserID]);

    res.json({ success: true, message: 'Instructor removed successfully.' });
  } catch (error) {
    console.error('deleteInstructor error:', error);
    res.status(500).json({ success: false, message: 'Server error removing instructor.' });
  }
};
