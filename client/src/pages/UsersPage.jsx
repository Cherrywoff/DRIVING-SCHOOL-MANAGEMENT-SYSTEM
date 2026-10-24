import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  UserCheck,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  GraduationCap,
  Award,
  ClipboardCheck,
  FileDown,
  X,
  Loader2,
  Car,
  User,
  Clock
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.getAllUsers('role=Student');
        if (res.success) setUsers(res.users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleOpenStudentDetails = async (studentId) => {
    setSelectedStudentId(studentId);
    setDetailsLoading(true);
    try {
      const res = await api.getStudentFullDetails(studentId);
      if (res.success) {
        setStudentDetails(res.student);
      }
    } catch (err) {
      alert('Error loading student details: ' + err.message);
      setSelectedStudentId(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedStudentId(null);
    setStudentDetails(null);
  };

  const handleDownloadReceipt = async (paymentId, invoiceNumber) => {
    try {
      setDownloadingReceiptId(paymentId);
      await api.downloadReceiptPdf(paymentId, invoiceNumber);
    } catch (err) {
      alert('Error downloading receipt: ' + err.message);
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  const filtered = users.filter(u =>
    u.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.LLRNumber && u.LLRNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.Phone && u.Phone.includes(searchTerm))
  );

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>Student Learner Directory</h1>
          <p>Enrolled Driver Profiles • Click any student row to view full 360° training records</p>
        </div>
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search student or LLR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading student directory...</div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table" id="users-table">
            <thead>
              <tr>
                <th>Learner ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>RTO LLR Number</th>
                <th>Registration Date</th>
                <th>Account Status</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                    No students found matching query.
                  </td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr
                    key={u.UserID}
                    onClick={() => handleOpenStudentDetails(u.UserID)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view full student profile and records"
                  >
                    <td><strong>#STU-{u.UserID}</strong></td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#60a5fa' }}>{u.FullName}</div>
                    </td>
                    <td>{u.Email}</td>
                    <td>{u.Phone || 'N/A'}</td>
                    <td>
                      {u.LLRNumber ? (
                        <span className="badge badge-green">{u.LLRNumber}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>LLR Pending</span>
                      )}
                    </td>
                    <td>{new Date(u.CreatedAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className="badge badge-blue">{u.Status}</span>
                    </td>
                    <td>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenStudentDetails(u.UserID); }}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                      >
                        View Full Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 360-Degree Comprehensive Student Profile Modal */}
      {selectedStudentId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', color: '#fff' }}>Learner Student Profile</h2>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>
                  ID: #STU-{selectedStudentId} • Driving Academy Comprehensive Ledger
                </p>
              </div>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>

            {detailsLoading || !studentDetails ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px auto' }} />
                Loading complete student records...
              </div>
            ) : (
              <div style={{ marginTop: '16px' }}>
                {/* 1. Header Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: '800' }}>
                    {studentDetails.FullName.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '20px' }}>{studentDetails.FullName}</h3>
                      <span className="badge badge-green">{studentDetails.Status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '18px', marginTop: '6px', fontSize: '13px', color: '#94a3b8', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={14} /> {studentDetails.Email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} /> {studentDetails.Phone || 'No phone recorded'}
                      </span>
                      <span>LLR: <strong>{studentDetails.LLRNumber || 'Pending Application'}</strong></span>
                    </div>
                    {studentDetails.Address && (
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {studentDetails.Address}
                      </div>
                    )}
                  </div>
                </div>

                {/* KPI Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Total Paid</span>
                    <strong style={{ fontSize: '16px', color: '#34d399' }}>₹{studentDetails.summary.totalPaid.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Balance Due</span>
                    <strong style={{ fontSize: '16px', color: studentDetails.summary.balanceDue > 0 ? '#f87171' : '#34d399' }}>
                      ₹{studentDetails.summary.balanceDue.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Sessions Attended</span>
                    <strong style={{ fontSize: '16px', color: '#60a5fa' }}>{studentDetails.summary.sessionsAttended} Lessons</strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Tests Attempted</span>
                    <strong style={{ fontSize: '16px', color: '#fbbf24' }}>{studentDetails.summary.testsTaken} Tests</strong>
                  </div>
                </div>

                {/* 2. Course & Slot Schedule */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <GraduationCap size={18} color="#60a5fa" />
                    <h4 style={{ fontSize: '16px' }}>Enrolled Courses & Assigned Schedules</h4>
                  </div>
                  {studentDetails.bookings.length === 0 ? (
                    <div style={{ padding: '14px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', fontSize: '13px', color: '#94a3b8' }}>
                      No active course enrollment or slot booking.
                    </div>
                  ) : (
                    studentDetails.bookings.map(b => (
                      <div key={b.BookingID} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px', marginBottom: '10px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <strong>{b.CourseName} ({b.CourseCategory})</strong>
                          <span className={`badge ${b.Status === 'Scheduled' ? 'badge-green' : 'badge-amber'}`}>{b.Status}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', color: '#94a3b8', fontSize: '12px' }}>
                          <div>Fixed Slot: <strong style={{ color: '#60a5fa' }}>{b.TimeSlot}</strong></div>
                          <div>Instructor: <strong style={{ color: '#fff' }}>{b.InstructorName ? `${b.InstructorName} (${b.InstructorPhone || 'Assigned'})` : 'Awaiting Assignment'}</strong></div>
                          <div>Vehicle: <strong style={{ color: '#34d399' }}>{b.ModelType ? `${b.ModelType} (${b.RegistrationNumber})` : 'Awaiting Allocation'}</strong></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 3. Fee Invoices & Payment Ledger */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <CreditCard size={18} color="#34d399" />
                    <h4 style={{ fontSize: '16px' }}>Fee Invoices & Digital Receipts</h4>
                  </div>
                  {studentDetails.payments.length === 0 ? (
                    <div style={{ padding: '14px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', fontSize: '13px', color: '#94a3b8' }}>
                      No payments on file.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="custom-table" style={{ fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th>Invoice No</th>
                            <th>Total Fee</th>
                            <th>Paid</th>
                            <th>Balance</th>
                            <th>Mode</th>
                            <th>Date</th>
                            <th>Download Receipt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentDetails.payments.map(p => (
                            <tr key={p.PaymentID}>
                              <td><strong>{p.InvoiceNumber}</strong></td>
                              <td>₹{parseFloat(p.TotalAmount).toLocaleString('en-IN')}</td>
                              <td style={{ color: '#34d399', fontWeight: '700' }}>₹{parseFloat(p.AmountPaid).toLocaleString('en-IN')}</td>
                              <td>₹{parseFloat(p.BalanceAmount).toLocaleString('en-IN')}</td>
                              <td>{p.PaymentMethod.replace(/_/g, ' ')}</td>
                              <td>{new Date(p.PaymentDate).toLocaleDateString('en-IN')}</td>
                              <td>
                                <button
                                  onClick={() => handleDownloadReceipt(p.PaymentID, p.InvoiceNumber)}
                                  disabled={downloadingReceiptId === p.PaymentID}
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '3px 8px', fontSize: '11px' }}
                                >
                                  {downloadingReceiptId === p.PaymentID ? <Loader2 size={12} className="spin" /> : <FileDown size={12} />}
                                  <span>PDF Receipt</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 4. RTO & Mock Test Scores */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Award size={18} color="#fbbf24" />
                    <h4 style={{ fontSize: '16px' }}>RTO & Mock Exam Evaluation History</h4>
                  </div>
                  {studentDetails.tests.length === 0 ? (
                    <div style={{ padding: '14px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', fontSize: '13px', color: '#94a3b8' }}>
                      No RTO mock test attempts recorded yet.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="custom-table" style={{ fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th>Test Date</th>
                            <th>Test Type</th>
                            <th>Score (%)</th>
                            <th>Status</th>
                            <th>Examiner / System Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentDetails.tests.map(t => (
                            <tr key={t.TestID}>
                              <td>{new Date(t.TestDate).toLocaleDateString('en-IN')}</td>
                              <td>{t.TestType.replace(/_/g, ' ')}</td>
                              <td>
                                <strong style={{ color: t.ScoreObtained >= 60 ? '#34d399' : '#f87171' }}>
                                  {t.ScoreObtained !== null ? `${t.ScoreObtained}%` : 'Pending'}
                                </strong>
                              </td>
                              <td>
                                <span className={`badge ${t.ResultStatus === 'Passed' ? 'badge-green' : t.ResultStatus === 'Failed' ? 'badge-rose' : 'badge-amber'}`}>
                                  {t.ResultStatus}
                                </span>
                              </td>
                              <td>{t.ExaminerOrInstructorNotes || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
