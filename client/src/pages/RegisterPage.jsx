import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, ArrowLeft } from 'lucide-react';

export default function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    llrNumber: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <button
          onClick={onSwitchToLogin}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> Back to Sign In
        </button>

        <div className="auth-card-header">
          <h2>Student Registration</h2>
          <p>Enroll as a learner at DriveAcademy</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Legal Name *</label>
            <input
              id="reg-name"
              name="fullName"
              type="text"
              className="form-input"
              placeholder="e.g. Radheya Khandelwal"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address *</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="98xxxxxxxx"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password (min 6 chars) *</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-llr">RTO LLR Number (if issued)</label>
              <input
                id="reg-llr"
                name="llrNumber"
                type="text"
                className="form-input"
                placeholder="MH-24-LLR-XXXX"
                value={formData.llrNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-address">Residential Address</label>
            <textarea
              id="reg-address"
              name="address"
              className="form-textarea"
              rows={2}
              placeholder="City, District, State"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '12px' }}
            disabled={loading}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Registering Account...' : 'Create Learner Account'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
