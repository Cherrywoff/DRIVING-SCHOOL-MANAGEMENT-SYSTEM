import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GraduationCap, Clock, Award, Check, Plus, CreditCard, ShieldCheck } from 'lucide-react';

export default function CoursesPage({ setActiveTab }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollModal, setEnrollModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI_Simulated');
  const [amountToPay, setAmountToPay] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

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
  }, []);

  const openEnrollModal = (course) => {
    setSelectedCourse(course);
    setAmountToPay(course.Fee);
    setEnrollModal(true);
    setActionSuccess('');
    setActionError('');
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await api.processPayment({
        courseId: selectedCourse.CourseID,
        amountPaid: parseFloat(amountToPay),
        paymentMethod
      });
      if (res.success) {
        setActionSuccess(`Enrolled successfully! Invoice ${res.invoiceNumber} generated.`);
        setTimeout(() => {
          setEnrollModal(false);
          setActiveTab('payments');
        }, 1500);
      }
    } catch (err) {
      setActionError(err.message || 'Payment simulation failed.');
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

      {actionSuccess && (
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
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Course Fee</span>
                  <h4 style={{ fontSize: '22px', color: '#34d399' }}>₹{parseFloat(course.Fee).toLocaleString('en-IN')}</h4>
                </div>

                {user?.role === 'Student' && (
                  <button
                    onClick={() => openEnrollModal(course)}
                    className="btn btn-primary btn-sm"
                    id={`enroll-course-${course.CourseID}`}
                  >
                    <CreditCard size={14} />
                    <span>Enroll & Pay</span>
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
          <div className="modal-content">
            <div className="modal-header">
              <h3>Enroll in Driver Training Program</h3>
              <button className="close-btn" onClick={() => setEnrollModal(false)}>&times;</button>
            </div>

            {actionError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                {actionError}
              </div>
            )}

            <form onSubmit={handleEnrollSubmit}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px' }}>{selectedCourse.CourseName}</h4>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  {selectedCourse.DurationDays} Days Training • {selectedCourse.PracticalHours} Practical Road Hours
                </p>
                <div style={{ marginTop: '12px', fontSize: '18px', fontWeight: '700', color: '#34d399' }}>
                  Total Package Fee: ₹{parseFloat(selectedCourse.Fee).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Amount (INR) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={amountToPay}
                  onChange={(e) => setAmountToPay(e.target.value)}
                  max={selectedCourse.Fee}
                  min={100}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method (Simulated)</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI_Simulated">UPI (Google Pay / PhonePe / Paytm - Simulated)</option>
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
                  Confirm & Generate Receipt
                </button>
              </div>
            </form>
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
