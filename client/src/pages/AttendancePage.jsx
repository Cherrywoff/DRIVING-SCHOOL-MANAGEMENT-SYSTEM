import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClipboardCheck, Star, Plus, User, Car } from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logModal, setLogModal] = useState(false);
  const [scheduledBookings, setScheduledBookings] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    bookingId: '',
    attendanceStatus: 'Present',
    kilometersDriven: 10.0,
    competencyRating: 4,
    topicsCovered: 'Clutch control, 3-point turning, and mirror checks',
    instructorFeedback: 'Good speed moderation and smooth lane change.'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAttendance();
      if (res.success) setAttendanceList(res.attendance);

      if (user?.role === 'Admin' || user?.role === 'Instructor') {
        const bRes = await api.getBookings('status=Scheduled');
        if (bRes.success) {
          setScheduledBookings(bRes.bookings);
          if (bRes.bookings.length > 0) {
            setFormData(prev => ({ ...prev, bookingId: bRes.bookings[0].BookingID }));
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

  const handleLogAttendance = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await api.recordAttendance(formData);
      if (res.success) {
        setSuccessMsg('Lesson attendance and competency evaluation logged!');
        setLogModal(false);
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error recording attendance.');
    }
  };

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>Practical Training Attendance & Evaluations</h1>
          <p>Behind-the-Wheel Syllabus Tracking • Daily Odometry & Competency Rubric</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Instructor') && (
          <button
            onClick={() => { setLogModal(true); setErrorMsg(''); setSuccessMsg(''); }}
            className="btn btn-primary btn-sm"
            id="log-attendance-btn"
          >
            <Plus size={16} />
            <span>Log Lesson Attendance</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading attendance telemetry...</div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table" id="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Instructor</th>
                <th>Vehicle & Odo</th>
                <th>Attendance</th>
                <th>Competency (1-5★)</th>
                <th>Topics Covered</th>
                <th>Instructor Evaluation</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                    No lesson attendance logged yet.
                  </td>
                </tr>
              ) : (
                attendanceList.map(a => (
                  <tr key={a.AttendanceID}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{new Date(a.SessionDate).toLocaleDateString('en-IN')}</div>
                      <div style={{ fontSize: '11px', color: '#60a5fa' }}>{a.TimeSlot}</div>
                    </td>
                    <td>
                      <div>{a.StudentName}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{a.LLRNumber || 'Student'}</div>
                    </td>
                    <td>{a.InstructorName}</td>
                    <td>
                      <div>{a.ModelType}</div>
                      <div style={{ fontSize: '11px', color: '#34d399', fontWeight: '600' }}>
                        {parseFloat(a.KilometersDriven).toFixed(1)} km driven
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${a.AttendanceStatus === 'Present' ? 'badge-green' : 'badge-rose'}`}>
                        {a.AttendanceStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < a.CompetencyRating ? '#fbbf24' : 'none'}
                            color={i < a.CompetencyRating ? '#fbbf24' : '#64748b'}
                          />
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '13px' }}>{a.TopicsCovered}</td>
                    <td style={{ maxWidth: '240px', fontSize: '13px', color: '#94a3b8' }}>
                      <em>"{a.InstructorFeedback}"</em>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Attendance Modal */}
      {logModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Log Driving Lesson Attendance</h3>
              <button className="close-btn" onClick={() => setLogModal(false)}>&times;</button>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                {errorMsg}
              </div>
            )}

            {scheduledBookings.length === 0 ? (
              <p style={{ color: '#94a3b8', padding: '20px 0' }}>
                No active scheduled bookings found to log attendance for.
              </p>
            ) : (
              <form onSubmit={handleLogAttendance}>
                <div className="form-group">
                  <label className="form-label">Select Scheduled Driving Session *</label>
                  <select
                    className="form-select"
                    value={formData.bookingId}
                    onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                    required
                  >
                    {scheduledBookings.map(b => (
                      <option key={b.BookingID} value={b.BookingID}>
                        #BK-{b.BookingID} • {b.StudentName} • {new Date(b.SessionDate).toLocaleDateString('en-IN')} ({b.TimeSlot})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Attendance Status *</label>
                    <select
                      className="form-select"
                      value={formData.attendanceStatus}
                      onChange={(e) => setFormData({ ...formData, attendanceStatus: e.target.value })}
                    >
                      <option value="Present">Present (Lesson Conducted)</option>
                      <option value="Absent">Absent (Student No-Show)</option>
                      <option value="Late">Late Arrival</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kilometers Driven (km) *</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      value={formData.kilometersDriven}
                      onChange={(e) => setFormData({ ...formData, kilometersDriven: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Competency Rating (1 to 5 Stars)</label>
                  <select
                    className="form-select"
                    value={formData.competencyRating}
                    onChange={(e) => setFormData({ ...formData, competencyRating: parseInt(e.target.value) })}
                  >
                    <option value={5}>5 Stars - Outstanding Mastery</option>
                    <option value={4}>4 Stars - Proficient & Confident</option>
                    <option value={3}>3 Stars - Satisfactory (Developing)</option>
                    <option value={2}>2 Stars - Needs Improvement</option>
                    <option value={1}>1 Star - Critical Guidance Required</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Topics Covered *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Emergency braking, S-shape reversing, clutch hold on slope"
                    value={formData.topicsCovered}
                    onChange={(e) => setFormData({ ...formData, topicsCovered: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Instructor Feedback</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Observations, steering control, pedestrian safety awareness..."
                    value={formData.instructorFeedback}
                    onChange={(e) => setFormData({ ...formData, instructorFeedback: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setLogModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" id="submit-attendance-btn">
                    Save Attendance Log
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
