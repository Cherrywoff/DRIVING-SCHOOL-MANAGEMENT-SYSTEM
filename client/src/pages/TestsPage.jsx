import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Award, CheckCircle2, XCircle, Play, AlertCircle, Plus } from 'lucide-react';

export default function TestsPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock Quiz State
  const [quizModal, setQuizModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Schedule Test Modal (Admin)
  const [scheduleModal, setScheduleModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [newTest, setNewTest] = useState({
    studentId: '',
    courseId: '',
    testType: 'Official_RTO_Test',
    testDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    testTime: '10:00:00',
    examinerNotes: 'Official RTO H-Track Assessment'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getTests();
      if (res.success) setTests(res.tests);

      if (user?.role === 'Admin') {
        const [cRes, uRes] = await Promise.all([
          api.getCourses(),
          api.getAllUsers('role=Student')
        ]);
        if (cRes.success) setCourses(cRes.courses);
        if (uRes.success) {
          setStudents(uRes.users);
          if (uRes.users.length > 0) {
            setNewTest(prev => ({ ...prev, studentId: uRes.users[0].UserID }));
          }
        }
        if (cRes.courses?.length > 0) {
          setNewTest(prev => ({ ...prev, courseId: cRes.courses[0].CourseID }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startMockQuiz = async () => {
    try {
      setQuizModal(true);
      setQuizResult(null);
      setSelectedAnswers({});
      const res = await api.getMockQuizQuestions();
      if (res.success) setQuestions(res.questions);
    } catch (err) {
      alert('Failed to load quiz: ' + err.message);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitQuiz = async () => {
    const answersArray = Object.entries(selectedAnswers).map(([qId, optIdx]) => ({
      questionId: parseInt(qId),
      selectedOption: optIdx
    }));

    if (answersArray.length < questions.length) {
      alert(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }

    setQuizSubmitting(true);
    try {
      const res = await api.submitMockQuiz({
        courseId: 2, // Default LMV course
        answers: answersArray
      });
      if (res.success) {
        setQuizResult(res);
        loadData();
      }
    } catch (err) {
      alert('Error submitting quiz: ' + err.message);
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.scheduleTest(newTest);
      if (res.success) {
        setScheduleModal(false);
        loadData();
      }
    } catch (err) {
      alert('Error scheduling test: ' + err.message);
    }
  };

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>Evaluation, Mock Quiz & RTO Licensing</h1>
          <p>Government Traffic Rules Knowledge Simulator & Practical Assessment Portal</p>
        </div>
        <div className="header-actions">
          <button
            onClick={startMockQuiz}
            className="btn btn-primary btn-sm"
            id="start-mock-quiz-btn"
          >
            <Play size={16} />
            <span>Launch Traffic Mock Quiz</span>
          </button>
          {user?.role === 'Admin' && (
            <button
              onClick={() => setScheduleModal(true)}
              className="btn btn-secondary btn-sm"
              id="schedule-test-btn"
            >
              <Plus size={16} />
              <span>Schedule RTO Test</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading test records...</div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table" id="tests-table">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Learner</th>
                <th>Course</th>
                <th>Test Type</th>
                <th>Scheduled Date</th>
                <th>Score</th>
                <th>Result Status</th>
                <th>Examiner Remarks</th>
              </tr>
            </thead>
            <tbody>
              {tests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                    No evaluations or test schedules recorded.
                  </td>
                </tr>
              ) : (
                tests.map(t => (
                  <tr key={t.TestID}>
                    <td><strong>#TST-{t.TestID}</strong></td>
                    <td>
                      <div>{t.StudentName}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.LLRNumber || 'Learner'}</div>
                    </td>
                    <td>{t.CourseName}</td>
                    <td>
                      <span className="badge badge-blue">
                        {t.TestType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{new Date(t.TestDate).toLocaleDateString('en-IN')}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.TestTime ? t.TestTime.slice(0, 5) : '10:00'} AM</div>
                    </td>
                    <td>
                      {t.ScoreObtained !== null ? (
                        <strong style={{ color: t.ScoreObtained >= 60 ? '#34d399' : '#f87171' }}>
                          {t.ScoreObtained}%
                        </strong>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Awaiting Test</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${t.ResultStatus === 'Passed' ? 'badge-green' : t.ResultStatus === 'Scheduled' ? 'badge-blue' : 'badge-rose'}`}>
                        {t.ResultStatus}
                      </span>
                    </td>
                    <td style={{ maxWidth: '280px', fontSize: '13px' }}>
                      {t.ExaminerOrInstructorNotes || 'Standard evaluation protocol.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Mock Quiz Simulator Modal */}
      {quizModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award color="#fbbf24" />
                RTO Traffic Rules & Signs Mock Quiz
              </h3>
              <button className="close-btn" onClick={() => setQuizModal(false)}>&times;</button>
            </div>

            {quizResult ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: quizResult.resultStatus === 'Passed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  {quizResult.resultStatus === 'Passed' ? (
                    <CheckCircle2 size={50} color="#34d399" />
                  ) : (
                    <XCircle size={50} color="#f87171" />
                  )}
                </div>

                <h2 style={{ fontSize: '28px', color: quizResult.resultStatus === 'Passed' ? '#34d399' : '#f87171' }}>
                  {quizResult.resultStatus.toUpperCase()}!
                </h2>
                <p style={{ fontSize: '18px', fontWeight: '700', marginTop: '6px' }}>
                  Final Score: {quizResult.score}%
                </p>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                  Recorded to your database assessment file (#TST-{quizResult.testId})
                </p>

                <div style={{ textAlign: 'left', marginTop: '24px', maxHeight: '280px', overflowY: 'auto', paddingRight: '8px' }}>
                  {quizResult.review.map((item, idx) => (
                    <div key={idx} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '8px', borderLeft: `4px solid ${item.isCorrect ? '#34d399' : '#f87171'}` }}>
                      <p style={{ fontSize: '13px', fontWeight: '600' }}>Q{idx + 1}. {item.question}</p>
                      <p style={{ fontSize: '12px', color: item.isCorrect ? '#6ee7b7' : '#fca5a5', marginTop: '4px' }}>
                        {item.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        Rule: {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setQuizModal(false)}
                  className="btn btn-primary"
                  style={{ marginTop: '20px' }}
                >
                  Done & Close Simulator
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
                  Answer the official RTO scenario-based multiple choice questions. Pass mark is 60%.
                </p>

                {questions.map((q, idx) => (
                  <div key={q.id} className="quiz-question-box">
                    <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>
                      {idx + 1}. {q.question}
                    </p>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`quiz-option ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                        >
                          <input
                            type="radio"
                            name={`quiz-q-${q.id}`}
                            checked={isSelected}
                            onChange={() => {}}
                          />
                          <span style={{ fontSize: '13px' }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setQuizModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={submitQuiz}
                    disabled={quizSubmitting}
                    id="submit-quiz-answers-btn"
                  >
                    {quizSubmitting ? 'Grading Answers...' : 'Submit Quiz for Grading'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule RTO Test Modal (Admin) */}
      {scheduleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Schedule Official RTO Practical Exam</h3>
              <button className="close-btn" onClick={() => setScheduleModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="form-group">
                <label className="form-label">Student Candidate *</label>
                <select
                  className="form-select"
                  value={newTest.studentId}
                  onChange={(e) => setNewTest({ ...newTest, studentId: e.target.value })}
                  required
                >
                  {students.map(s => (
                    <option key={s.UserID} value={s.UserID}>
                      {s.FullName} ({s.LLRNumber || s.Email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Training Program *</label>
                <select
                  className="form-select"
                  value={newTest.courseId}
                  onChange={(e) => setNewTest({ ...newTest, courseId: e.target.value })}
                  required
                >
                  {courses.map(c => (
                    <option key={c.CourseID} value={c.CourseID}>
                      {c.CourseName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Test Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newTest.testDate}
                    onChange={(e) => setNewTest({ ...newTest, testDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Test Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newTest.testTime}
                    onChange={(e) => setNewTest({ ...newTest, testTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Examiner / Track Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. RTO Latur Test Track, 8-figure and H-track"
                  value={newTest.examinerNotes}
                  onChange={(e) => setNewTest({ ...newTest, examinerNotes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setScheduleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
