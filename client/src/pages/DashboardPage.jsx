import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users,
  GraduationCap,
  Car,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  IndianRupee,
  Award,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage({ setActiveTab }) {
  const { user } = useAuth();
  const role = user?.role || user?.Role || 'Student';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getDashboardStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>{role} Dashboard</h1>
          <p>Driving School Management System • COCSIT Autonomous Latur</p>
        </div>
        <div className="header-actions">
          {role === 'Admin' && (
            <>
              <a
                href={api.getStudentsExcelUrl()}
                className="btn btn-secondary btn-sm"
                download
                id="export-students-btn"
              >
                <FileSpreadsheet size={16} color="#34d399" />
                <span>Export Students (.xlsx)</span>
              </a>
              <a
                href={api.getRevenueExcelUrl()}
                className="btn btn-secondary btn-sm"
                download
                id="export-revenue-btn"
              >
                <FileSpreadsheet size={16} color="#60a5fa" />
                <span>Export Revenue (.xlsx)</span>
              </a>
            </>
          )}
          {role === 'Student' && (
            <button
              onClick={() => setActiveTab('bookings')}
              className="btn btn-primary btn-sm"
              id="student-book-session-quick-btn"
            >
              <Calendar size={16} />
              <span>Book Driving Slot</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading dashboard telemetry...</div>
      ) : (
        <>
          {/* Admin Dashboard */}
          {role === 'Admin' && (
            <div>
              <div className="grid-cols-4">
                <div className="card kpi-card">
                  <div className="kpi-icon blue"><Users size={26} /></div>
                  <div className="kpi-info">
                    <p>Enrolled Students</p>
                    <h3>{stats?.totalStudents || 0}</h3>
                  </div>
                </div>

                <div className="card kpi-card">
                  <div className="kpi-icon green"><GraduationCap size={26} /></div>
                  <div className="kpi-info">
                    <p>Certified Instructors</p>
                    <h3>{stats?.totalInstructors || 0}</h3>
                  </div>
                </div>

                <div className="card kpi-card">
                  <div className="kpi-icon amber"><Car size={26} /></div>
                  <div className="kpi-info">
                    <p>Active Vehicles</p>
                    <h3>{stats?.availableVehicles || 0}</h3>
                  </div>
                </div>

                <div className="card kpi-card">
                  <div className="kpi-icon rose"><Calendar size={26} /></div>
                  <div className="kpi-info">
                    <p>Practical Bookings</p>
                    <h3>{stats?.totalBookings || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="grid-cols-3" style={{ marginBottom: '32px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>TOTAL FEE REVENUE</span>
                      <IndianRupee size={20} color="#34d399" />
                    </div>
                    <h2 style={{ fontSize: '32px', color: '#34d399' }}>
                      ₹{stats?.totalRevenue?.toLocaleString('en-IN') || '0.00'}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
                      Verified receipts from student enrollments
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '20px' }}
                  >
                    View Invoices & Receipts
                  </button>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>COMPLETED DRIVING SESSIONS</span>
                      <CheckCircle2 size={20} color="#60a5fa" />
                    </div>
                    <h2 style={{ fontSize: '32px', color: '#60a5fa' }}>
                      {stats?.completedBookings || 0} Sessions
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
                      Practical on-road training hours logged
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '20px' }}
                  >
                    View Attendance Logs
                  </button>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>UPCOMING RTO TESTS</span>
                      <Award size={20} color="#fbbf24" />
                    </div>
                    <h2 style={{ fontSize: '32px', color: '#fbbf24' }}>
                      {stats?.upcomingTests || 0} Scheduled
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
                      Official RTO practical and mock tests
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('tests')}
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '20px' }}
                  >
                    Manage Test Schedules
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructor Dashboard */}
          {role === 'Instructor' && (
            <div>
              <div className="grid-cols-3" style={{ marginBottom: '32px' }}>
                <div className="card kpi-card">
                  <div className="kpi-icon blue"><Calendar size={26} /></div>
                  <div className="kpi-info">
                    <p>Total Assigned Sessions</p>
                    <h3>{stats?.totalAssignedSessions || 0}</h3>
                  </div>
                </div>

                <div className="card kpi-card">
                  <div className="kpi-icon green"><Clock size={26} /></div>
                  <div className="kpi-info">
                    <p>Sessions Scheduled Today</p>
                    <h3>{stats?.todaySessions || 0}</h3>
                  </div>
                </div>

                <div className="card kpi-card">
                  <div className="kpi-icon amber"><CheckCircle2 size={26} /></div>
                  <div className="kpi-info">
                    <p>Lessons Completed</p>
                    <h3>{stats?.completedSessions || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                <Clock size={40} color="#60a5fa" style={{ margin: '0 auto 16px' }} />
                <h3>Ready for today's practical driver training?</h3>
                <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '8px auto 20px', fontSize: '14px' }}>
                  Review learner vehicle allocations, mark on-road attendance, evaluate clutch and steering competencies, and log kilometers driven.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => setActiveTab('bookings')} className="btn btn-primary">
                    View My Driving Sessions
                  </button>
                  <button onClick={() => setActiveTab('attendance')} className="btn btn-secondary">
                    Log Student Attendance
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Student Dashboard */}
          {role === 'Student' && (
            <div>
              <div className="grid-cols-3" style={{ marginBottom: '32px' }}>
                <div className="card kpi-card">
                  <div className="kpi-icon blue"><Calendar size={26} /></div>
                  <div className="kpi-info">
                    <p>Practical Sessions Booked</p>
                    <h3>{stats?.totalBookings || 0}</h3>
                  </div>
                </div>

                <div className="card kpi-card">
                  <div className="kpi-icon green"><CheckCircle2 size={26} /></div>
                  <div className="kpi-info">
                    <p>Completed Driving Lessons</p>
                    <h3>{stats?.completedSessions || 0}</h3>
                  </div>
                </div>

                <div className="card kpi-card">
                  <div className="kpi-icon amber"><IndianRupee size={26} /></div>
                  <div className="kpi-info">
                    <p>Outstanding Fee Balance</p>
                    <h3>₹{stats?.totalBalance?.toFixed(2) || '0.00'}</h3>
                  </div>
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '24px' }}>
                <div className="card">
                  <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={20} color="#60a5fa" />
                    Latest Assessment & RTO Status
                  </h3>
                  {stats?.latestTest ? (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                      <p style={{ fontSize: '13px', color: '#94a3b8' }}>Test Type</p>
                      <h4 style={{ fontSize: '16px', marginTop: '2px' }}>{stats.latestTest.TestType.replace(/_/g, ' ')}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Scheduled Date</p>
                          <p style={{ fontWeight: '600' }}>{new Date(stats.latestTest.TestDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Status</p>
                          <span className={`badge ${stats.latestTest.ResultStatus === 'Passed' ? 'badge-green' : stats.latestTest.ResultStatus === 'Scheduled' ? 'badge-blue' : 'badge-rose'}`}>
                            {stats.latestTest.ResultStatus}
                          </span>
                        </div>
                        {stats.latestTest.ScoreObtained !== null && (
                          <div>
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Score</p>
                            <p style={{ fontWeight: '700', color: '#34d399' }}>{stats.latestTest.ScoreObtained}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '14px' }}>
                      No tests scheduled yet. Take an online mock quiz to practice!
                    </div>
                  )}
                  <button
                    onClick={() => setActiveTab('tests')}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', marginTop: '16px' }}
                  >
                    Take RTO Traffic Rules Mock Quiz
                  </button>
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} color="#34d399" />
                    Quick Practical Slot Booking
                  </h3>
                  <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
                    Select your certified instructor, dual-control vehicle, and preferred morning or evening batch time slot.
                  </p>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Reserve Practical Slot Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
