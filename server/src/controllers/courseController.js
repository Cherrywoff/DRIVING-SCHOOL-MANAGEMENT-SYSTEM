const pool = require('../config/db');

exports.getAllCourses = async (req, res) => {
  try {
    const { category, activeOnly } = req.query;
    let query = `SELECT * FROM CourseMaster WHERE 1=1`;
    const params = [];

    if (activeOnly !== 'false') {
      query += ` AND Status = 'Active'`;
    }
    if (category) {
      query += ` AND Category = ?`;
      params.push(category);
    }

    query += ` ORDER BY Fee ASC`;
    const [courses] = await pool.query(query, params);
    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    console.error('getAllCourses error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving courses.' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM CourseMaster WHERE CourseID = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    res.json({ success: true, course: rows[0] });
  } catch (error) {
    console.error('getCourseById error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving course details.' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { courseCode, courseName, category, description, durationDays, theoryHours, practicalHours, fee } = req.body;

    if (!courseCode || !courseName || !category || fee === undefined) {
      return res.status(400).json({ success: false, message: 'Course Code, Name, Category, and Fee are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO CourseMaster (CourseCode, CourseName, Category, Description, DurationDays, TheoryHours, PracticalHours, Fee, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [courseCode.trim().toUpperCase(), courseName.trim(), category, description || null, durationDays || 30, theoryHours || 10, practicalHours || 20, fee]
    );

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      courseId: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A course with this Course Code already exists.' });
    }
    console.error('createCourse error:', error);
    res.status(500).json({ success: false, message: 'Server error creating course.' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { courseName, category, description, durationDays, theoryHours, practicalHours, fee, status } = req.body;
    await pool.query(
      `UPDATE CourseMaster SET CourseName = COALESCE(?, CourseName),
                               Category = COALESCE(?, Category),
                               Description = COALESCE(?, Description),
                               DurationDays = COALESCE(?, DurationDays),
                               TheoryHours = COALESCE(?, TheoryHours),
                               PracticalHours = COALESCE(?, PracticalHours),
                               Fee = COALESCE(?, Fee),
                               Status = COALESCE(?, Status)
       WHERE CourseID = ?`,
      [courseName, category, description, durationDays, theoryHours, practicalHours, fee, status, req.params.id]
    );

    res.json({ success: true, message: 'Course updated successfully.' });
  } catch (error) {
    console.error('updateCourse error:', error);
    res.status(500).json({ success: false, message: 'Server error updating course.' });
  }
};
