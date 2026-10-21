import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, KeyRound, Mail, User } from 'lucide-react';

export default function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="logo-badge" style={{ margin: '0 auto 16px' }}>DS</div>
          <h2>Driving School System</h2>
          <p>COCSIT Capstone Project Portal</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={loading}
          >
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginBottom: '12px', fontWeight: '600' }}>
            ⚡ QUICK DEMO LOGINS (VIVA / TESTING)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              id="quick-login-admin"
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => handleQuickLogin('admin@drivingschool.com', 'Admin@123')}
            >
              <ShieldCheck size={14} color="#60a5fa" />
              <span>Admin: <strong>admin@drivingschool.com</strong></span>
            </button>
            <button
              id="quick-login-instructor"
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => handleQuickLogin('rajesh.patil@drivingschool.com', 'Instructor@123')}
            >
              <User size={14} color="#34d399" />
              <span>Instructor: <strong>rajesh.patil@drivingschool.com</strong></span>
            </button>
            <button
              id="quick-login-student"
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => handleQuickLogin('radheya.khandelwal@student.com', 'Student@123')}
            >
              <KeyRound size={14} color="#fbbf24" />
              <span>Student (Radheya): <strong>radheya.khandelwal@student.com</strong></span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            New learner driver?{' '}
            <button
              id="switch-to-register-btn"
              type="button"
              onClick={onSwitchToRegister}
              style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
