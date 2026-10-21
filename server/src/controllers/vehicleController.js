const pool = require('../config/db');

exports.getAllVehicles = async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = `
      SELECT v.*, i.InstructorID, u.FullName AS AssignedInstructorName
      FROM VehicleMaster v
      LEFT JOIN InstructorMaster i ON v.VehicleID = i.AssignedVehicleID
      LEFT JOIN UserMaster u ON i.UserID = u.UserID
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND v.Status = ?`;
      params.push(status);
    }
    if (category) {
      query += ` AND v.Category = ?`;
      params.push(category);
    }

    query += ` ORDER BY v.Category, v.ModelType`;
    const [vehicles] = await pool.query(query, params);
    res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    console.error('getAllVehicles error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving vehicles.' });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const { registrationNumber, modelType, category, transmission, hasDualControl, fitnessExpiryDate, insuranceExpiryDate } = req.body;

    if (!registrationNumber || !modelType || !category) {
      return res.status(400).json({ success: false, message: 'Registration Number, Model, and Category are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO VehicleMaster (RegistrationNumber, ModelType, Category, Transmission, HasDualControl, FitnessExpiryDate, InsuranceExpiryDate, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Available')`,
      [registrationNumber.trim().toUpperCase(), modelType.trim(), category, transmission || 'Manual', hasDualControl !== false ? 1 : 0, fitnessExpiryDate || null, insuranceExpiryDate || null]
    );

    res.status(201).json({ success: true, message: 'Vehicle added successfully.', vehicleId: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A vehicle with this Registration Number already exists.' });
    }
    console.error('createVehicle error:', error);
    res.status(500).json({ success: false, message: 'Server error adding vehicle.' });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { modelType, category, transmission, hasDualControl, fitnessExpiryDate, insuranceExpiryDate, status } = req.body;
    await pool.query(
      `UPDATE VehicleMaster SET ModelType = COALESCE(?, ModelType),
                                Category = COALESCE(?, Category),
                                Transmission = COALESCE(?, Transmission),
                                HasDualControl = COALESCE(?, HasDualControl),
                                FitnessExpiryDate = COALESCE(?, FitnessExpiryDate),
                                InsuranceExpiryDate = COALESCE(?, InsuranceExpiryDate),
                                Status = COALESCE(?, Status)
       WHERE VehicleID = ?`,
      [modelType, category, transmission, hasDualControl, fitnessExpiryDate, insuranceExpiryDate, status, req.params.id]
    );

    res.json({ success: true, message: 'Vehicle updated successfully.' });
  } catch (error) {
    console.error('updateVehicle error:', error);
    res.status(500).json({ success: false, message: 'Server error updating vehicle.' });
  }
};
