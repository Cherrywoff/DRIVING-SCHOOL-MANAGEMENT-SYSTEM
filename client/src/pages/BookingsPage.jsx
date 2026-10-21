import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Calendar, Plus, Clock, Car, User, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown data
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    courseId: '',
    instructorId: '',
    vehicleId: '',
    sessionDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    timeSlot: '07:00:00 - 08:00:00',
    notes: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const bRes = await api.getBookings();
      if (bRes.success) setBookings(bRes.bookings);

      const [cRes, iRes, vRes, sRes] = await Promise.all([
        api.getCourses(),
        api.getInstructors(),
        api.getVehicles(),
        api.getSessions()
      ]);

      if (cRes.success) setCourses(cRes.courses);
      if (iRes.success) setInstructors(iRes.instructors);
      if (vRes.success) setVehicles(vRes.vehicles);
      if (sRes.success) setSessions(sRes.sessions);

      // Default select
      if (cRes.courses?.length > 0) setFormData(prev => ({ ...prev, courseId: cRes.courses[0].CourseID }));
      if (iRes.instructors?.length > 0) setFormData(prev => ({ ...prev, instructorId: iRes.instructors[0].InstructorID }));
      if (vRes.vehicles?.length > 0) setFormData(prev => ({ ...prev, vehicleId: vRes.vehicles[0].VehicleID }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.createBooking(formData);
      if (res.success) {
        setSuccessMsg('Practical driving slot confirmed successfully!');
        setModalOpen(false);
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error creating booking.');
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await api.updateBookingStatus(bookingId, { status: newStatus });
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>Practical Driving Sessions</h1>
          <p>Behind-the-Wheel Scheduling • Conflict-Free Instructor & Fleet Allocation</p>
        </div>
        <button
          onClick={() => { setModalOpen(true); setErrorMsg(''); setSuccessMsg(''); }}
          className="btn btn-primary btn-sm"
          id="book-new-session-btn"
        >
          <Plus size={16} />
          <span>Book Driving Session</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading schedule bookings...</div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table" id="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Student</th>
                <th>Program</th>
                <th>Instructor</th>
                <th>Vehicle Allocated</th>
                <th>Date & Time Slot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                    No driving sessions scheduled yet. Click "Book Driving Session" to reserve a slot.
                  </td>
                </tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.BookingID}>
                    <td><strong>#BK-{b.BookingID}</strong></td>
                    <td>
                      <div>{b.StudentName}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{b.LLRNumber || b.StudentPhone}</div>
                    </td>
                    <td>{b.CourseName}</td>
                    <td>{b.InstructorName}</td>
                    <td>
                      <div>{b.ModelType}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{b.RegistrationNumber}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{new Date(b.SessionDate).toLocaleDateString('en-IN')}</div>
                      <div style={{ fontSize: '12px', color: '#60a5fa' }}>{b.TimeSlot}</div>
                    </td>
                    <td>
                      <span className={`badge ${b.Status === 'Completed' ? 'badge-green' : b.Status === 'Scheduled' ? 'badge-blue' : 'badge-rose'}`}>
                        {b.Status}
                      </span>
                    </td>
                    <td>
                      {b.Status === 'Scheduled' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {(user?.role === 'Admin' || user?.role === 'Instructor') && (
                            <button
                              onClick={() => handleStatusChange(b.BookingID, 'Completed')}
                              className="btn btn-secondary btn-sm"
                              title="Mark Completed"
                            >
                              <CheckCircle2 size={14} color="#34d399" />
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(b.BookingID, 'Cancelled')}
                            className="btn btn-danger btn-sm"
                            title="Cancel Session"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Book Session Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Reserve Practical Driving Slot</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateBooking}>
              <div className="form-group">
                <label className="form-label">Driver Training Program *</label>
                <select
                  className="form-select"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  required
                >
                  {courses.map(c => (
                    <option key={c.CourseID} value={c.CourseID}>
                      {c.CourseName} ({c.Category})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Assigned Certified Instructor *</label>
                  <select
                    className="form-select"
                    value={formData.instructorId}
                    onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                    required
                  >
                    {instructors.map(i => (
                      <option key={i.InstructorID} value={i.InstructorID}>
                        {i.FullName} ({i.Specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dual-Control Vehicle *</label>
                  <select
                    className="form-select"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    required
                  >
                    {vehicles.map(v => (
                      <option key={v.VehicleID} value={v.VehicleID}>
                        {v.ModelType} [{v.RegistrationNumber}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Session Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    min={new Date().toISOString().slice(0, 10)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Time Slot *</label>
                  <select
                    className="form-select"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    required
                  >
                    {sessions.map(s => (
                      <option key={s.SessionID} value={`${s.StartTime} - ${s.EndTime}`}>
                        {s.SessionName} ({s.StartTime.slice(0, 5)} - {s.EndTime.slice(0, 5)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Session Practice Goal (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Parallel parking on incline, clutch gear shifting"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="confirm-booking-btn">
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
