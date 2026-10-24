import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Award, CheckCircle2, XCircle, Play, AlertCircle, Plus, BookOpen, Clock, Calendar, Check, Shuffle } from 'lucide-react';

export default function TestsPage() {
  const { user } = useAuth();
  const role = user?.role || user?.Role || 'Student';
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Papers
  const [papers, setPapers] = useState([]);
  const [activePaper, setActivePaper] = useState(null);

  // Mock Quiz State
  const [quizModal, setQuizModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Schedule Test Modal (Admin)
  const [scheduleModal, setScheduleModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newTest, setNewTest] = useState({
    studentId: '',
    courseId: 2,
    testType: 'Official_RTO_Test',
    testDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    examinerNotes: 'Official RTO Computer & Practical Evaluation'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, pRes] = await Promise.all([
        api.getTests(),
        api.getPapersList()
      ]);
      if (tRes.success) setTests(tRes.tests);
      if (pRes.success) setPapers(pRes.papers);

      if (role === 'Admin') {
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

  const startMockQuiz = async (paperId = null) => {
    try {
      setQuizModal(true);
      setQuizResult(null);
      setSelectedAnswers({});
      const res = await api.getMockQuizQuestions(paperId);
      if (res.success) {
        setQuestions(res.questions);
        setActivePaper({
          id: res.paperId,
          title: res.paperTitle,
          description: res.paperDescription
        });
      }
    } catch (err) {
      alert('Failed to load quiz paper: ' + err.message);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitQuiz = async () => {
    const answersArray = Object.entries(selectedAnswers).map(([qId, optIdx]) => ({
      questionId: parseInt(qId, 10),
      selectedOption: optIdx
    }));

    if (answersArray.length < questions.length) {
      alert(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }

    setQuizSubmitting(true);
    try {
      const res = await api.submitMockQuiz({
        courseId: 2,
        paperId: activePaper ? activePaper.id : 1,
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
        alert(res.message);
        setScheduleModal(false);
        loadData();
      }
    } catch (err) {
      alert('Error scheduling test: ' + err.message);
    }
  };

  // Check if student has a scheduled test for today or upcoming
  const todayStr = new Date().toISOString().slice(0, 10);
  const myScheduledTests = tests.filter(t => t.ResultStatus === 'Scheduled');

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>RTO Exam Simulator & Practical Test Schedules</h1>
          <p>Official Parivahan Mock Tests • 6 Question Papers & Date-Based Driver Evaluation</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => startMockQuiz(null)} className="btn btn-primary btn-sm" id="quick-random-quiz-btn">
            <Shuffle size={16} />
            <span>Random Fresh Paper</span>
          </button>
          {role === 'Admin' && (
            <button onClick={() => setScheduleModal(true)} className="btn btn-secondary btn-sm" id="schedule-test-btn">
              <Plus size={16} />
              <span>Assign Test by Date</span>
            </button>
          )}
        </div>
      </div>

      {/* Student Notification Banner if Test is Scheduled by Admin */}
      {role === 'Student' && myScheduledTests.length > 0 && (
        <div style={{ background: 'radial-gradient(circle at top right, rgba(37,99,235,0.2), rgba(15,23,42,0.95))', border: '1px solid #3b82f6', borderRadius: '12px', padding: '20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="#60a5fa" />
              <h3 style={{ fontSize: '18px', color: '#fff' }}>Official Test Scheduled for You</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
              Scheduled Date: <strong style={{ color: '#34d399' }}>{new Date(myScheduledTests[0].TestDate).toLocaleDateString('en-IN')}</strong> • Test Type: <strong>{myScheduledTests[0].TestType.replace(/_/g, ' ')}</strong>
            </p>
            <p style={{ color: '#60a5fa', fontSize: '12px', marginTop: '2px' }}>
              {myScheduledTests[0].ExaminerOrInstructorNotes || 'Assigned by Administrator. Complete your test on this designated date.'}
            </p>
          </div>
          <button
            onClick={() => startMockQuiz(6)}
            className="btn btn-primary"
            id="start-assigned-test-btn"
          >
            <Play size={16} />
            <span>Attempt Official Test Now</span>
          </button>
        </div>
      )}

      {/* 6 Official Question Papers Grid for Self-Practice */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', color: '#fff' }}>6 Official RTO Mock Question Papers</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>
              Students can practice on their own anytime with 6 distinct subject papers.
            </p>
          </div>
        </div>

        <div className="grid-cols-3">
          {papers.map(p => (
            <div key={p.paperId} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="badge badge-blue">Paper #{p.paperId}</span>
                  <span className="badge badge-green">{p.questionCount} Questions</span>
                </div>
                <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>{p.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.5', marginBottom: '16px' }}>
                  {p.description}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Pass Mark: 60%</span>
                <button
                  onClick={() => startMockQuiz(p.paperId)}
                  className="btn btn-outline btn-sm"
                  id={`start-paper-${p.paperId}`}
                >
                  <Play size={12} />
                  <span>Start Practice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Evaluation History Table */}
      <div>
        <h2 style={{ fontSize: '18px', marginBottom: '14px' }}>RTO & Mock Evaluation History</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading test records...</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" id="tests-history-table">
              <thead>
                <tr>
                  <th>Test ID</th>
                  <th>Student Name</th>
                  <th>Course Track</th>
                  <th>Test Type</th>
                  <th>Assigned Test Date</th>
                  <th>Score (%)</th>
                  <th>Result Status</th>
                  <th>Examiner / System Feedback</th>
                </tr>
              </thead>
              <tbody>
                {tests.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                      No tests recorded yet. Take an RTO mock test above to see results.
                    </td>
                  </tr>
                ) : (
                  tests.map(t => (
                    <tr key={t.TestID}>
                      <td><strong>#TST-{t.TestID}</strong></td>
                      <td>
                        <strong>{t.StudentName}</strong>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.LLRNumber || t.StudentEmail}</div>
                      </td>
                      <td>{t.CourseName || 'General RTO'}</td>
                      <td>{t.TestType.replace(/_/g, ' ')}</td>
                      <td>
                        <strong>{new Date(t.TestDate).toLocaleDateString('en-IN')}</strong>
                      </td>
                      <td>
                        <strong style={{ color: t.ScoreObtained >= 60 ? '#34d399' : '#f87171' }}>
                          {t.ScoreObtained !== null ? `${t.ScoreObtained}%` : 'Pending Exam'}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge ${t.ResultStatus === 'Passed' ? 'badge-green' : t.ResultStatus === 'Failed' ? 'badge-rose' : 'badge-amber'}`}>
                          {t.ResultStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>{t.ExaminerOrInstructorNotes || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Mock Quiz Modal */}
      {quizModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '720px', maxHeight: '90vh' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px' }}>
                  {activePaper ? activePaper.title : 'Official RTO Mock Exam'}
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Government RTO Guidelines • Passing Score: 60%
                </p>
              </div>
              <button className="close-btn" onClick={() => setQuizModal(false)}>&times;</button>
            </div>

            {quizResult ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: quizResult.resultStatus === 'Passed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: quizResult.resultStatus === 'Passed' ? '#34d399' : '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  {quizResult.resultStatus === 'Passed' ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
                </div>

                <h2 style={{ fontSize: '24px', color: '#fff' }}>
                  {quizResult.resultStatus === 'Passed' ? 'Congratulations! You Passed!' : 'Needs Revision! Test Failed'}
                </h2>
                <div style={{ fontSize: '32px', fontWeight: '800', color: quizResult.resultStatus === 'Passed' ? '#34d399' : '#f87171', margin: '8px 0' }}>
                  {quizResult.score}%
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                  {quizResult.paperTitle} • Record saved to academic ledger.
                </p>

                <div style={{ textAlign: 'left', maxHeight: '360px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Question-by-Question Review:</h4>
                  {quizResult.review.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                        {idx + 1}. {item.question}
                      </div>
                      <div style={{ fontSize: '12px', marginTop: '4px', color: item.isCorrect ? '#34d399' : '#f87171' }}>
                        {item.isCorrect ? '✓ Correct Answer Selected' : '✗ Incorrect Option Selected'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                        Rule Explanation: {item.explanation}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => startMockQuiz(activePaper ? activePaper.id : 1)} className="btn btn-secondary">
                    Retry This Paper
                  </button>
                  <button onClick={() => setQuizModal(false)} className="btn btn-primary">
                    Close & View Ledger
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '6px' }}>
                  {questions.map((q, idx) => (
                    <div key={q.id} className="quiz-question-box">
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '12px' }}>
                        Question {idx + 1} of {questions.length}: {q.question}
                      </div>
                      <div>
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`quiz-option ${selectedAnswers[q.id] === optIdx ? 'selected' : ''}`}
                          >
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: selectedAnswers[q.id] === optIdx ? '5px solid #3b82f6' : '2px solid #64748b',
                              background: '#0f172a'
                            }} />
                            <span style={{ fontSize: '13px' }}>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Answered: {Object.keys(selectedAnswers).length} / {questions.length} questions
                  </span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={() => setQuizModal(false)}>Cancel</button>
                    <button
                      onClick={submitQuiz}
                      disabled={quizSubmitting || Object.keys(selectedAnswers).length < questions.length}
                      className="btn btn-primary"
                      id="submit-quiz-answers-btn"
                    >
                      {quizSubmitting ? 'Evaluating Score...' : 'Submit Paper for Evaluation'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Official Test Modal (Admin) */}
      {scheduleModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>Assign RTO Test by Date</h3>
              <button className="close-btn" onClick={() => setScheduleModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Student Learner *</label>
                <select
                  className="form-select"
                  value={newTest.studentId}
                  onChange={(e) => setNewTest({ ...newTest, studentId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.UserID} value={s.UserID}>
                      {s.FullName} ({s.LLRNumber || s.Email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Associated Course Program</label>
                <select
                  className="form-select"
                  value={newTest.courseId}
                  onChange={(e) => setNewTest({ ...newTest, courseId: e.target.value })}
                >
                  {courses.map(c => (
                    <option key={c.CourseID} value={c.CourseID}>{c.CourseName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Evaluation Test Type *</label>
                <select
                  className="form-select"
                  value={newTest.testType}
                  onChange={(e) => setNewTest({ ...newTest, testType: e.target.value })}
                >
                  <option value="Official_RTO_Test">Official RTO Driving License Test</option>
                  <option value="Theory_Mock_Quiz">RTO Computer Mock Assessment</option>
                  <option value="Internal_Driving_Audit">Internal Academy H-Track Practical Audit</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Test Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={newTest.testDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setNewTest({ ...newTest, testDate: e.target.value })}
                  required
                />
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                  Assigned strictly by date. Student can take the test on this designated date without time mismatch issues.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Examiner / Assessment Instructions</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={newTest.examinerNotes}
                  onChange={(e) => setNewTest({ ...newTest, examinerNotes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setScheduleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="confirm-schedule-test-btn">
                  Assign Test Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
