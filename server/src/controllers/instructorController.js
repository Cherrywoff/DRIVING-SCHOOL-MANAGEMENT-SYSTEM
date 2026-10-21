const pool = require('../config/db');

exports.getAllInstructors = async (req, res) => {
  try {
    const query = `
      SELECT i.InstructorID, i.UserID, u.FullName, u.Email, u.Phone,
             i.LicenseNumber, i.LicenseExpiryDate, i.Specialization, i.ExperienceYears,
             i.WorkingHoursStart, i.WorkingHoursEnd, i.Status,
             v.VehicleID, v.RegistrationNumber, v.ModelType, v.Category AS VehicleCategory
      FROM InstructorMaster i
      JOIN UserMaster u ON i.UserID = u.UserID
      LEFT JOIN VehicleMaster v ON i.AssignedVehicleID = v.VehicleID
      ORDER BY i.ExperienceYears DESC
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
             i.WorkingHoursStart, i.WorkingHoursEnd, i.Status,
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
    const { userId, licenseNumber, licenseExpiryDate, specialization, experienceYears, assignedVehicleId } = req.body;

    if (!userId || !licenseNumber) {
      return res.status(400).json({ success: false, message: 'User ID and License Number are required.' });
    }

    // Set user role to Instructor
    await pool.query('UPDATE UserMaster SET Role = "Instructor" WHERE UserID = ?', [userId]);

    const [result] = await pool.query(
      `INSERT INTO InstructorMaster (UserID, LicenseNumber, LicenseExpiryDate, Specialization, ExperienceYears, AssignedVehicleID, Status)
       VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
      [userId, licenseNumber.trim(), licenseExpiryDate || null, specialization || null, experienceYears || 0, assignedVehicleId || null]
    );

    res.status(201).json({ success: true, message: 'Instructor created successfully.', instructorId: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'License number or user already assigned as instructor.' });
    }
    console.error('createInstructor error:', error);
    res.status(500).json({ success: false, message: 'Server error creating instructor.' });
  }
};

exports.updateInstructor = async (req, res) => {
  try {
    const { licenseExpiryDate, specialization, experienceYears, assignedVehicleId, status } = req.body;
    await pool.query(
      `UPDATE InstructorMaster SET LicenseExpiryDate = COALESCE(?, LicenseExpiryDate),
                                   Specialization = COALESCE(?, Specialization),
                                   ExperienceYears = COALESCE(?, ExperienceYears),
                                   AssignedVehicleID = ?,
                                   Status = COALESCE(?, Status)
       WHERE InstructorID = ?`,
      [licenseExpiryDate, specialization, experienceYears, assignedVehicleId, status, req.params.id]
    );

    res.json({ success: true, message: 'Instructor updated successfully.' });
  } catch (error) {
    console.error('updateInstructor error:', error);
    res.status(500).json({ success: false, message: 'Server error updating instructor.' });
  }
};
