import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Car, Award, Clock, Phone, Mail } from 'lucide-react';

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getInstructors();
        if (res.success) setInstructors(res.instructors);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>Certified Driving Instructors</h1>
          <p>Government Certified Faculty • Dual-Pedal On-Road Mentors</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading instructor directory...</div>
      ) : (
        <div className="grid-cols-2">
          {instructors.map(inst => (
            <div key={inst.InstructorID} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: '800' }}>
                  {inst.FullName.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px' }}>{inst.FullName}</h3>
                  <p style={{ color: '#60a5fa', fontSize: '12px', fontWeight: '600' }}>{inst.Specialization}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Experience</span>
                  <strong>{inst.ExperienceYears} Years Active</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Instructor License</span>
                  <strong>{inst.LicenseNumber}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Phone</span>
                  <span>{inst.Phone || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Assigned Car</span>
                  <span style={{ color: '#34d399', fontWeight: '600' }}>
                    {inst.ModelType ? `${inst.ModelType} (${inst.RegistrationNumber})` : 'Floating Fleet'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {inst.WorkingHoursStart.slice(0, 5)} - {inst.WorkingHoursEnd.slice(0, 5)} Daily
                </span>
                <span className="badge badge-green">{inst.Status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
