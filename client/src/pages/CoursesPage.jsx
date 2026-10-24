import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GraduationCap, Clock, Award, Check, Plus, CreditCard, ShieldCheck, FileDown, Calendar, CheckCircle2 } from 'lucide-react';

export default function CoursesPage({ setActiveTab }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollModal, setEnrollModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI_Simulated');
  const [preferredSlot, setPreferredSlot] = useState('07:00 AM - 08:00 AM');
  const [startDate, setStartDate] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [enrollmentReceipt, setEnrollmentReceipt] = useState(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  // New course form
  const [newCourse, setNewCourse] = useState({
    courseCode: '',
    courseName: '',
    category: 'Four-Wheeler (LMV-Manual)',
    description: '',
    durationDays: 30,
    theoryHours: 15,
    practicalHours: 25,
    fee: 6500
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.getCourses();
      if (res.success) setCourses(res.courses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().slice(0, 10));
  }, []);

  const openEnrollModal = (course) => {
    setSelectedCourse(course);
    setEnrollModal(true);
    setEnrollmentReceipt(null);
    setActionSuccess('');
    setActionError('');
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await api.processPayment({
        courseId: selectedCourse.CourseID,
        amountPaid: parseFloat(selectedCourse.Fee), // Full amount always
        paymentMethod,
        preferredSlot,
        startDate
      });

      if (res.success) {
        setEnrollmentReceipt({
          paymentId: res.paymentId,
          invoiceNumber: res.invoiceNumber,
          transactionRef: res.transactionRef,
          amountPaid: selectedCourse.Fee,
          courseName: selectedCourse.CourseName,
          slot: preferredSlot,
          startDate
        });
        setActionSuccess(`Enrolled successfully! Full payment verified. Invoice ${res.invoiceNumber} generated.`);
      }
    } catch (err) {
      setActionError(err.message || 'Payment simulation failed.');
    }
  };

  const handleDownloadReceipt = async (paymentId, invoiceNumber) => {
    try {
      setDownloadingReceipt(true);
      await api.downloadReceiptPdf(paymentId, invoiceNumber);
    } catch (err) {
      alert('Error downloading receipt: ' + err.message);
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const handleAddCourseSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await api.createCourse(newCourse);
      if (res.success) {
        setActionSuccess('Course created successfully.');
        setAddModal(false);
        fetchCourses();
      }
    } catch (err) {
      setActionError(err.message || 'Error creating course.');
    }
  };

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>Driver Training Programs & Syllabus</h1>
          <p>Government RTO Compliant Curriculum • Dual-Control Vehicle Training</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={() => { setAddModal(true); setActionSuccess(''); setActionError(''); }}
            className="btn btn-primary btn-sm"
            id="add-course-btn"
          >
            <Plus size={16} />
            <span>Add New Course</span>
          </button>
        )}
      </div>

      {actionSuccess && !enrollModal && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {actionSuccess}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading course catalog...</div>
      ) : (
        <div className="grid-cols-2">
          {courses.map(course => (
            <div key={course.CourseID} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-blue">{course.CourseCode}</span>
                  <span className="badge badge-green">{course.Category}</span>
                </div>

                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{course.CourseName}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
                  {course.Description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Duration</span>
                    <strong style={{ fontSize: '14px' }}>{course.DurationDays} Days</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Theory Hours</span>
                    <strong style={{ fontSize: '14px' }}>{course.TheoryHours} Hours</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Road Practical</span>
                    <strong style={{ fontSize: '14px', color: '#60a5fa' }}>{course.PracticalHours} Hours</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Full Course Fee</span>
                  <h4 style={{ fontSize: '22px', color: '#34d399' }}>₹{parseFloat(course.Fee).toLocaleString('en-IN')}</h4>
                </div>

                {user?.role === 'Student' && (
                  <button
                    onClick={() => openEnrollModal(course)}
                    className="btn btn-primary btn-sm"
                    id={`enroll-course-${course.CourseID}`}
                  >
                    <CreditCard size={14} />
                    <span>Enroll & Pay Full Fee</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enroll & Pay Modal */}
      {enrollModal && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3>Course Enrollment & Slot Selection</h3>
              <button className="close-btn" onClick={() => setEnrollModal(false)}>&times;</button>
            </div>

            {actionError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                {actionError}
              </div>
            )}

            {enrollmentReceipt ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '20px', color: '#fff' }}>Enrollment & Payment Confirmed!</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px', marginBottom: '20px' }}>
                  Invoice <strong>{enrollmentReceipt.invoiceNumber}</strong> for <strong>₹{parseFloat(enrollmentReceipt.amountPaid).toLocaleString('en-IN')}</strong> has been cleared.
                </p>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px', textAlign: 'left', marginBottom: '24px', fontSize: '13px', lineHeight: '1.8' }}>
                  <div><strong>Course:</strong> {enrollmentReceipt.courseName}</div>
                  <div><strong>Selected Slot:</strong> <span style={{ color: '#60a5fa' }}>{enrollmentReceipt.slot}</span> (Fixed for course duration)</div>
                  <div><strong>Course Start Date:</strong> {new Date(enrollmentReceipt.startDate).toLocaleDateString('en-IN')}</div>
                  <div><strong>Transaction Reference:</strong> {enrollmentReceipt.transactionRef}</div>
                  <div style={{ color: '#fbbf24', marginTop: '8px', fontSize: '12px' }}>
                    * Your slot reservation has been submitted. Academy Administration will finalize your trainer & vehicle assignment.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleDownloadReceipt(enrollmentReceipt.paymentId, enrollmentReceipt.invoiceNumber)}
                    disabled={downloadingReceipt}
                    className="btn btn-primary"
                    id="download-invoice-receipt-modal-btn"
                  >
                    <FileDown size={16} />
                    <span>{downloadingReceipt ? 'Generating Receipt...' : 'Download Official PDF Receipt'}</span>
                  </button>
                  <button
                    onClick={() => { setEnrollModal(false); setActiveTab('bookings'); }}
                    className="btn btn-secondary"
                  >
                    View My Driving Sessions
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '16px' }}>{selectedCourse.CourseName}</h4>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    {selectedCourse.DurationDays} Days Training • {selectedCourse.PracticalHours} Practical Road Hours
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Mandatory Full Course Fee:</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#34d399' }}>
                      ₹{parseFloat(selectedCourse.Fee).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Fixed Daily Training Slot *</label>
                    <select
                      className="form-select"
                      value={preferredSlot}
                      onChange={(e) => setPreferredSlot(e.target.value)}
                      required
                    >
                      <option value="07:00 AM - 08:00 AM">07:00 AM - 08:00 AM (Early Morning)</option>
                      <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM (Morning Batch)</option>
                      <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM (Mid Morning)</option>
                      <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM (Afternoon)</option>
                      <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM (Evening Batch)</option>
                      <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM (Sunset Batch)</option>
                      <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM (Night Practice)</option>
                    </select>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                      Fixed for your entire {selectedCourse.DurationDays}-day duration
                    </span>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Preferred Start Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={startDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                      First on-road session date
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Mode (Simulated Gateway) *</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="UPI_Simulated">UPI (Google Pay / PhonePe / Paytm - Instant)</option>
                    <option value="DebitCard_Simulated">Debit Card / ATM Card (Simulated)</option>
                    <option value="NetBanking_Simulated">Internet Banking (Simulated)</option>
                    <option value="Cash">Cash at Academy Office</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEnrollModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" id="confirm-payment-btn">
                    Pay Full Fee & Finalize Slot Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Course Modal (Admin) */}
      {addModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Driver Training Course</h3>
              <button className="close-btn" onClick={() => setAddModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleAddCourseSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Course Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. COURSE-HMV"
                    value={newCourse.courseCode}
                    onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  >
                    <option value="Two-Wheeler (MCWG)">Two-Wheeler (MCWG)</option>
                    <option value="Four-Wheeler (LMV-Manual)">Four-Wheeler (LMV-Manual)</option>
                    <option value="Four-Wheeler (LMV-Auto)">Four-Wheeler (LMV-Auto)</option>
                    <option value="Commercial (HMV)">Commercial (HMV)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Course Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Heavy Motor Vehicle Training"
                  value={newCourse.courseName}
                  onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Days</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newCourse.durationDays}
                    onChange={(e) => setNewCourse({ ...newCourse, durationDays: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Practical Hours</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newCourse.practicalHours}
                    onChange={(e) => setNewCourse({ ...newCourse, practicalHours: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fee (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newCourse.fee}
                    onChange={(e) => setNewCourse({ ...newCourse, fee: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
