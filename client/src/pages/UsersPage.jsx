import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserCheck, Search, Mail, Phone, MapPin } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filtered = users.filter(u =>
    u.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.LLRNumber && u.LLRNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>Student Learner Directory</h1>
          <p>Enrolled Driver Profiles • Contact Records & Learner License (LLR) Verification</p>
        </div>
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or LLR..."
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                    No students found matching query.
                  </td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.UserID}>
                    <td><strong>#STU-{u.UserID}</strong></td>
                    <td>{u.FullName}</td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
