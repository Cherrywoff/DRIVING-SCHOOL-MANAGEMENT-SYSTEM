const pool = require('../config/db');

exports.getAllSessions = async (req, res) => {
  try {
    const [sessions] = await pool.query('SELECT * FROM SessionMaster WHERE Status = "Active" ORDER BY StartTime ASC');
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    console.error('getAllSessions error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving session slots.' });
  }
};
