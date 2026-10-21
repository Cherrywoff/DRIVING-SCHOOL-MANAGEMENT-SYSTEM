const pool = require('../config/db');

// Official RTO Mock Questions Bank
const RTO_QUESTIONS = [
  {
    id: 1,
    question: 'What is the mandatory action when approaching an uncontrolled pedestrian zebra crossing?',
    options: [
      'Honk loudly and maintain high speed',
      'Slow down and give precedence to pedestrians wanting to cross',
      'Accelerate before pedestrians start crossing',
      'Ignore pedestrians if driving a four-wheeler'
    ],
    correctAnswer: 1,
    explanation: 'Drivers must slow down and give way to pedestrians at zebra crossings.'
  },
  {
    id: 2,
    question: 'When overtaking another vehicle on a standard road, from which side should you overtake?',
    options: [
      'Only from the right side',
      'Only from the left side',
      'From whichever side there is space',
      'Over the pavement/footpath'
    ],
    correctAnswer: 0,
    explanation: 'In India (drive on left), overtaking must always be done from the right side.'
  },
  {
    id: 3,
    question: 'What does a solid continuous white line on the center of the road indicate?',
    options: [
      'Lane changing and overtaking is strictly prohibited',
      'Overtaking is permitted anytime',
      'Parking allowed on the centerline',
      'Pedestrian walkway'
    ],
    correctAnswer: 0,
    explanation: 'A solid unbroken center line means you must stay in your lane and cannot cross to overtake.'
  },
  {
    id: 4,
    question: 'What is the minimum legal validity period of an RTO Learner’s License (LLR)?',
    options: [
      '30 days',
      '6 months (180 days)',
      '1 year',
      'Lifetime'
    ],
    correctAnswer: 1,
    explanation: 'An Indian Learner’s License (LLR) remains valid for 6 months from the date of issue.'
  },
  {
    id: 5,
    question: 'When an emergency vehicle (Ambulance or Fire Engine) approaches from behind with siren on, you must:',
    options: [
      'Race ahead to guide the ambulance',
      'Immediately pull to the side and clear the way',
      'Stop dead in the middle of your lane',
      'Sound your horn repeatedly'
    ],
    correctAnswer: 1,
    explanation: 'Motor Vehicle Act mandates giving unobstructed passage to emergency vehicles.'
  }
];

exports.getMockQuizQuestions = (req, res) => {
  // Return questions without the answers revealed
  const questionsForStudent = RTO_QUESTIONS.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));
  res.json({ success: true, count: questionsForStudent.length, questions: questionsForStudent });
};

exports.submitMockQuiz = async (req, res) => {
  try {
    const { studentId, courseId, answers } = req.body;
    const finalStudentId = req.user.role === 'Student' ? req.user.userId : studentId;

    if (!finalStudentId || !courseId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Student ID, Course ID, and answers array are required.' });
    }

    let correctCount = 0;
    const review = [];

    RTO_QUESTIONS.forEach(q => {
      const studentAns = answers.find(a => a.questionId === q.id);
      const isCorrect = studentAns && studentAns.selectedOption === q.correctAnswer;
      if (isCorrect) correctCount++;
      review.push({
        questionId: q.id,
        question: q.question,
        selectedOption: studentAns ? studentAns.selectedOption : null,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      });
    });

    const scorePercentage = (correctCount / RTO_QUESTIONS.length) * 100;
    const resultStatus = scorePercentage >= 60 ? 'Passed' : 'Failed';
    const today = new Date().toISOString().slice(0, 10);

    const [result] = await pool.query(
      `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ScoreObtained, TotalScore, ResultStatus, ExaminerOrInstructorNotes)
       VALUES (?, ?, 'Theory_Mock_Quiz', ?, CURRENT_TIME(), ?, 100.00, ?, ?)`,
      [
        finalStudentId,
        courseId,
        today,
        scorePercentage,
        resultStatus,
        `Automated Traffic Rules Mock Quiz: ${correctCount}/${RTO_QUESTIONS.length} correct.`
      ]
    );

    res.status(201).json({
      success: true,
      message: `Mock Quiz completed! Score: ${scorePercentage}% (${resultStatus})`,
      testId: result.insertId,
      score: scorePercentage,
      resultStatus,
      review
    });
  } catch (error) {
    console.error('submitMockQuiz error:', error);
    res.status(500).json({ success: false, message: 'Server error processing mock quiz.' });
  }
};

exports.getAllTests = async (req, res) => {
  try {
    const { studentId, testType, resultStatus } = req.query;
    let query = `
      SELECT t.TestID, t.StudentID, u.FullName AS StudentName, u.Email AS StudentEmail, u.Phone AS StudentPhone, u.LLRNumber,
             t.CourseID, c.CourseName, c.Category AS CourseCategory,
             t.TestType, t.TestDate, t.TestTime, t.ScoreObtained, t.TotalScore, t.ResultStatus,
             t.ExaminerOrInstructorNotes, t.CreatedAt
      FROM TestScheduleMaster t
      JOIN UserMaster u ON t.StudentID = u.UserID
      JOIN CourseMaster c ON t.CourseID = c.CourseID
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'Student') {
      query += ` AND t.StudentID = ?`;
      params.push(req.user.userId);
    } else if (studentId) {
      query += ` AND t.StudentID = ?`;
      params.push(studentId);
    }

    if (testType) {
      query += ` AND t.TestType = ?`;
      params.push(testType);
    }
    if (resultStatus) {
      query += ` AND t.ResultStatus = ?`;
      params.push(resultStatus);
    }

    query += ` ORDER BY t.TestDate DESC, t.CreatedAt DESC`;
    const [tests] = await pool.query(query, params);
    res.json({ success: true, count: tests.length, tests });
  } catch (error) {
    console.error('getAllTests error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving test schedules.' });
  }
};

exports.scheduleTest = async (req, res) => {
  try {
    const { studentId, courseId, testType, testDate, testTime, examinerNotes } = req.body;

    if (!studentId || !courseId || !testType || !testDate) {
      return res.status(400).json({ success: false, message: 'Student ID, Course ID, Test Type, and Date are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ResultStatus, ExaminerOrInstructorNotes)
       VALUES (?, ?, ?, ?, ?, 'Scheduled', ?)`,
      [studentId, courseId, testType, testDate, testTime || '10:00:00', examinerNotes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Test scheduled successfully.',
      testId: result.insertId
    });
  } catch (error) {
    console.error('scheduleTest error:', error);
    res.status(500).json({ success: false, message: 'Server error scheduling test.' });
  }
};

exports.updateTestResult = async (req, res) => {
  try {
    const { scoreObtained, resultStatus, examinerNotes } = req.body;
    await pool.query(
      `UPDATE TestScheduleMaster SET ScoreObtained = ?,
                                     ResultStatus = ?,
                                     ExaminerOrInstructorNotes = COALESCE(?, ExaminerOrInstructorNotes)
       WHERE TestID = ?`,
      [scoreObtained !== undefined ? scoreObtained : null, resultStatus, examinerNotes, req.params.id]
    );

    res.json({ success: true, message: 'Test score and result updated.' });
  } catch (error) {
    console.error('updateTestResult error:', error);
    res.status(500).json({ success: false, message: 'Server error updating test result.' });
  }
};
