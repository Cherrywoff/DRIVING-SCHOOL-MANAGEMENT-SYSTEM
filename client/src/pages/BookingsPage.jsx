import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Calendar, Clock, Car, User, CheckCircle2, AlertCircle, ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';

export default function BookingsPage() {
  const { user } = useAuth();
  const role = user?.role || user?.Role || 'Student';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignForm, setAssignForm] = useState({
    instructorId: '',
    vehicleId: '',
    timeSlot: '',
    sessionDate: '',
    notes: ''
  });
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const bRes = await api.getBookings();
      if (bRes.success) setBookings(bRes.bookings);

      if (role === 'Admin') {
        const [iRes, vRes] = await Promise.all([
          api.getInstructors(),
          api.getVehicles()
        ]);
        if (iRes.success) setInstructors(iRes.instructors);
        if (vRes.success) setVehicles(vRes.vehicles);
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

  const openAssignModal = (b) => {
    setSelectedBooking(b);
    setAssignForm({
      instructorId: b.InstructorID || (instructors.length > 0 ? instructors[0].InstructorID : ''),
      vehicleId: b.VehicleID || (vehicles.length > 0 ? vehicles[0].VehicleID : ''),
      timeSlot: b.TimeSlot || '07:00 AM - 08:00 AM',
      sessionDate: b.SessionDate ? b.SessionDate.slice(0, 10) : '',
      notes: ''
    });
    setActionError('');
    setActionSuccess('');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.assignSlot(selectedBooking.BookingID, assignForm);
      if (res.success) {
        setActionSuccess('Slot and instructor assigned successfully!');
        setTimeout(() => {
          setAssignModalOpen(false);
          loadData();
        }, 1200);
      }
    } catch (err) {
      setActionError(err.message || 'Error finalizing slot.');
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

  const pendingBookings = bookings.filter(b => b.Status === 'Pending');
  const activeBookings = bookings.filter(b => b.Status !== 'Pending');

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>Practical Driving Sessions & Fixed Schedules</h1>
          <p>Full Course Slot Management • Conflict-Free Instructor & Fleet Allocation</p>
        </div>
      </div>

      {actionSuccess && !assignModalOpen && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {actionSuccess}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading training schedules...</div>
      ) : (
        <>
          {/* Admin Section: Pending Slot Requests from Paid Students */}
          {role === 'Admin' && pendingBookings.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <ShieldAlert size={20} color="#fbbf24" />
                <h2 style={{ fontSize: '18px', color: '#fbbf24' }}>
                  Pending Course Slot Requests ({pendingBookings.length})
                </h2>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '16px' }}>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Learner Name</th>
                        <th>Enrolled Course</th>
                        <th>Duration</th>
                        <th>Requested Daily Slot</th>
                        <th>Start Date</th>
                        <th>Payment Status</th>
                        <th>Admin Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingBookings.map(b => (
                        <tr key={b.BookingID}>
                          <td>
                            <strong>{b.StudentName}</strong>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{b.StudentPhone || b.StudentEmail}</div>
                          </td>
                          <td>{b.CourseName}</td>
                          <td>{b.DurationDays} Days</td>
                          <td>
                            <span className="badge badge-amber">{b.TimeSlot}</span>
                          </td>
                          <td>{new Date(b.SessionDate).toLocaleDateString('en-IN')}</td>
                          <td>
                            <span className="badge badge-green">Full Fee Paid</span>
                          </td>
                          <td>
                            <button
                              onClick={() => openAssignModal(b)}
                              className="btn btn-primary btn-sm"
                              id={`assign-slot-btn-${b.BookingID}`}
                            >
                              Finalize & Assign Trainer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Student View: Assigned Schedule Card */}
          {role === 'Student' && (
            <div style={{ marginBottom: '24px' }}>
              {bookings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                  <Calendar size={48} color="#60a5fa" style={{ margin: '0 auto 12px auto' }} />
                  <h3>No Active Driving Schedule</h3>
                  <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '440px', margin: '8px auto 20px auto' }}>
                    To begin practical training, please enroll in a course. Your fixed training slot will be finalized by the academy administration.
                  </p>
                </div>
              ) : (
                bookings.map(b => (
                  <div key={b.BookingID} className="card" style={{ marginBottom: '16px', borderLeft: b.Status === 'Scheduled' ? '4px solid #10b981' : '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ fontSize: '18px' }}>{b.CourseName}</h3>
                          <span className={`badge ${b.Status === 'Scheduled' ? 'badge-green' : 'badge-amber'}`}>
                            {b.Status === 'Scheduled' ? 'Active Driving Schedule' : 'Pending Admin Assignment'}
                          </span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                          Course Duration: {b.DurationDays} Days • {b.PracticalHours} Road Driving Hours
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Fixed Daily Slot</span>
                        <strong style={{ fontSize: '16px', color: '#60a5fa' }}>{b.TimeSlot}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Certified Instructor</span>
                        <strong>{b.InstructorName ? `${b.InstructorName} (${b.InstructorPhone || 'Assigned'})` : 'Awaiting Assignment'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Dual-Control Vehicle</span>
                        <strong style={{ color: '#34d399' }}>{b.ModelType ? `${b.ModelType} (${b.RegistrationNumber})` : 'Awaiting Fleet Allocation'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Training Start Date</span>
                        <strong>{new Date(b.SessionDate).toLocaleDateString('en-IN')}</strong>
                      </div>
                    </div>

                    {b.Status === 'Pending' && (
                      <div style={{ marginTop: '12px', fontSize: '12px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> Full payment received. Administrator will assign your certified trainer and car shortly.
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Master Table of All Driving Training Schedules */}
          {role !== 'Student' && (
            <div>
              <h2 style={{ fontSize: '18px', marginBottom: '14px' }}>All Driving Training Schedules</h2>
              <div className="table-responsive">
                <table className="custom-table" id="all-bookings-table">
                  <thead>
                    <tr>
                      <th>Booking Ref</th>
                      <th>Learner Student</th>
                      <th>Course</th>
                      <th>Assigned Trainer</th>
                      <th>Assigned Vehicle</th>
                      <th>Fixed Daily Slot</th>
                      <th>Start Date</th>
                      <th>Schedule Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBookings.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                          No scheduled practical training sessions.
                        </td>
                      </tr>
                    ) : (
                      activeBookings.map(b => (
                        <tr key={b.BookingID}>
                          <td><strong>#BKG-{b.BookingID}</strong></td>
                          <td>
                            <strong>{b.StudentName}</strong>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{b.StudentPhone || b.StudentEmail}</div>
                          </td>
                          <td>{b.CourseName}</td>
                          <td>
                            {b.InstructorName ? (
                              <span style={{ fontWeight: '600' }}>{b.InstructorName}</span>
                            ) : (
                              <span style={{ color: '#fbbf24' }}>Unassigned</span>
                            )}
                          </td>
                          <td>
                            {b.RegistrationNumber ? (
                              <span style={{ color: '#34d399' }}>{b.ModelType} ({b.RegistrationNumber})</span>
                            ) : (
                              <span style={{ color: '#fbbf24' }}>Unassigned</span>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-blue">{b.TimeSlot}</span>
                          </td>
                          <td>{new Date(b.SessionDate).toLocaleDateString('en-IN')}</td>
                          <td>
                            <span className={`badge ${b.Status === 'Completed' ? 'badge-green' : b.Status === 'Scheduled' ? 'badge-blue' : 'badge-rose'}`}>
                              {b.Status}
                            </span>
                          </td>
                          <td>
                            {role === 'Admin' && (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => openAssignModal(b)}
                                  className="btn btn-outline btn-sm"
                                  title="Reassign instructor or change slot"
                                >
                                  Reassign
                                </button>
                                {b.Status === 'Scheduled' && (
                                  <button
                                    onClick={() => handleStatusChange(b.BookingID, 'Completed')}
                                    className="btn btn-success btn-sm"
                                    title="Mark course training as completed"
                                  >
                                    <Check size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Admin Assign Instructor & Vehicle Modal */}
      {assignModalOpen && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Finalize Schedule & Assign Trainer</h3>
              <button className="close-btn" onClick={() => setAssignModalOpen(false)}>&times;</button>
            </div>

            {actionError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                {actionError}
              </div>
            )}

            <form onSubmit={handleAssignSubmit}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', lineHeight: '1.8' }}>
                <div><strong>Learner:</strong> {selectedBooking.StudentName} ({selectedBooking.StudentPhone || selectedBooking.StudentEmail})</div>
                <div><strong>Course:</strong> {selectedBooking.CourseName} ({selectedBooking.DurationDays} Days)</div>
                <div><strong>Requested Slot:</strong> <span style={{ color: '#60a5fa', fontWeight: '700' }}>{selectedBooking.TimeSlot}</span></div>
                <div><strong>Course Start Date:</strong> {new Date(selectedBooking.SessionDate).toLocaleDateString('en-IN')}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Certified Driving Instructor *</label>
                <select
                  className="form-select"
                  value={assignForm.instructorId}
                  onChange={(e) => setAssignForm({ ...assignForm, instructorId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Instructor --</option>
                  {instructors.map(inst => (
                    <option key={inst.InstructorID} value={inst.InstructorID}>
                      {inst.FullName} ({inst.Specialization} • {inst.ExperienceYears} yrs exp)
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                  System prevents double-booking this instructor for the same time slot across overlapping students.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Training Vehicle *</label>
                <select
                  className="form-select"
                  value={assignForm.vehicleId}
                  onChange={(e) => setAssignForm({ ...assignForm, vehicleId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.VehicleID} value={v.VehicleID}>
                      {v.ModelType} ({v.RegistrationNumber} • {v.Category})
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                  System prevents double-booking this vehicle for the same time slot across overlapping students.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Fixed Slot Time</label>
                  <select
                    className="form-select"
                    value={assignForm.timeSlot}
                    onChange={(e) => setAssignForm({ ...assignForm, timeSlot: e.target.value })}
                  >
                    <option value="07:00 AM - 08:00 AM">07:00 AM - 08:00 AM</option>
                    <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM</option>
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                    <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                    <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmed Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={assignForm.sessionDate}
                    onChange={(e) => setAssignForm({ ...assignForm, sessionDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAssignModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="finalize-slot-confirm-btn">
                  Approve & Finalize Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
