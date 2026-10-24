import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Users, Car, Award, Clock, Phone, Mail, Plus, Edit2, Trash2, IndianRupee, AlertCircle } from 'lucide-react';

export default function InstructorsPage() {
  const { user } = useAuth();
  const role = user?.role || user?.Role || 'Student';
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedInst, setSelectedInst] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Add form
  const [newInst, setNewInst] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    specialization: 'Four-Wheeler (LMV-Manual)',
    experienceYears: 5,
    salary: 28000,
    assignedVehicleId: ''
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    salary: 28000,
    specialization: '',
    experienceYears: 5,
    assignedVehicleId: '',
    status: 'Active',
    phone: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [iRes, vRes] = await Promise.all([
        api.getInstructors(),
        api.getVehicles()
      ]);
      if (iRes.success) setInstructors(iRes.instructors);
      if (vRes.success) setVehicles(vRes.vehicles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setNewInst({
      fullName: '',
      email: '',
      phone: '',
      password: 'Instructor@123',
      licenseNumber: '',
      licenseExpiryDate: '',
      specialization: 'Four-Wheeler (LMV-Manual)',
      experienceYears: 5,
      salary: 28000,
      assignedVehicleId: vehicles.length > 0 ? vehicles[0].VehicleID : ''
    });
    setActionError('');
    setActionSuccess('');
    setAddModal(true);
  };

  const openEditModal = (inst) => {
    setSelectedInst(inst);
    setEditForm({
      salary: inst.Salary || 25000,
      specialization: inst.Specialization || 'Four-Wheeler (LMV-Manual)',
      experienceYears: inst.ExperienceYears || 0,
      assignedVehicleId: inst.VehicleID || '',
      status: inst.Status || 'Active',
      phone: inst.Phone || ''
    });
    setActionError('');
    setActionSuccess('');
    setEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await api.createInstructor(newInst);
      if (res.success) {
        setActionSuccess('New certified instructor created successfully!');
        setAddModal(false);
        loadData();
      }
    } catch (err) {
      setActionError(err.message || 'Error creating instructor.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await api.updateInstructor(selectedInst.InstructorID, editForm);
      if (res.success) {
        setActionSuccess(`Updated details & salary for ${selectedInst.FullName}!`);
        setEditModal(false);
        loadData();
      }
    } catch (err) {
      setActionError(err.message || 'Error updating instructor.');
    }
  };

  const handleDelete = async (inst) => {
    if (!window.confirm(`Are you sure you want to remove or deactivate instructor ${inst.FullName}?`)) {
      return;
    }
    try {
      const res = await api.deleteInstructor(inst.InstructorID);
      if (res.success) {
        setActionSuccess(res.message);
        loadData();
      }
    } catch (err) {
      alert('Error deleting instructor: ' + err.message);
    }
  };

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>Certified Driving Instructors & Faculty</h1>
          <p>Government Certified Faculty • Dual-Pedal Road Mentors & Payroll Management</p>
        </div>
        {role === 'Admin' && (
          <button onClick={openAddModal} className="btn btn-primary btn-sm" id="add-instructor-btn">
            <Plus size={16} />
            <span>Add New Instructor</span>
          </button>
        )}
      </div>

      {actionSuccess && !addModal && !editModal && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {actionSuccess}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading instructor directory...</div>
      ) : (
        <div className="grid-cols-2">
          {instructors.map(inst => (
            <div key={inst.InstructorID} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: '800' }}>
                    {inst.FullName.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px' }}>{inst.FullName}</h3>
                    <p style={{ color: '#60a5fa', fontSize: '12px', fontWeight: '600' }}>{inst.Specialization}</p>
                  </div>
                </div>

                {role === 'Admin' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEditModal(inst)}
                      className="btn btn-secondary btn-sm"
                      title="Edit Details & Salary"
                      id={`edit-inst-${inst.InstructorID}`}
                    >
                      <Edit2 size={14} />
                      <span>Edit Salary</span>
                    </button>
                    <button
                      onClick={() => handleDelete(inst)}
                      className="btn btn-danger btn-sm"
                      title="Delete / Deactivate Instructor"
                      id={`delete-inst-${inst.InstructorID}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Monthly Salary</span>
                  <strong style={{ color: '#34d399', fontSize: '15px' }}>
                    ₹{parseFloat(inst.Salary || 25000).toLocaleString('en-IN')} / mo
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Experience</span>
                  <strong>{inst.ExperienceYears} Years Active</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Instructor License</span>
                  <strong>{inst.LicenseNumber}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Assigned Training Car</span>
                  <span style={{ color: '#60a5fa', fontWeight: '600' }}>
                    {inst.ModelType ? `${inst.ModelType} (${inst.RegistrationNumber})` : 'Floating Pool'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Contact Phone</span>
                  <span>{inst.Phone || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Email</span>
                  <span style={{ fontSize: '12px' }}>{inst.Email}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {inst.WorkingHoursStart ? inst.WorkingHoursStart.slice(0, 5) : '07:00'} - {inst.WorkingHoursEnd ? inst.WorkingHoursEnd.slice(0, 5) : '19:00'} Daily
                </span>
                <span className={`badge ${inst.Status === 'Active' ? 'badge-green' : 'badge-rose'}`}>
                  {inst.Status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Instructor Modal */}
      {addModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Register New Certified Driving Instructor</h3>
              <button className="close-btn" onClick={() => setAddModal(false)}>&times;</button>
            </div>

            {actionError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                {actionError}
              </div>
            )}

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Anand K. Patil"
                    value={newInst.fullName}
                    onChange={(e) => setNewInst({ ...newInst, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="anand.patil@driveacademy.com"
                    value={newInst.email}
                    onChange={(e) => setNewInst({ ...newInst, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={newInst.phone}
                    onChange={(e) => setNewInst({ ...newInst, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Temporary Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newInst.password}
                    onChange={(e) => setNewInst({ ...newInst, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">RTO Instructor License No *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="MH-24-INST-2026-09"
                    value={newInst.licenseNumber}
                    onChange={(e) => setNewInst({ ...newInst, licenseNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">License Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newInst.licenseExpiryDate}
                    onChange={(e) => setNewInst({ ...newInst, licenseExpiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <select
                    className="form-select"
                    value={newInst.specialization}
                    onChange={(e) => setNewInst({ ...newInst, specialization: e.target.value })}
                  >
                    <option value="Four-Wheeler (LMV-Manual)">Four-Wheeler (LMV-Manual)</option>
                    <option value="Four-Wheeler (LMV-Auto)">Four-Wheeler (LMV-Auto)</option>
                    <option value="Two-Wheeler (MCWG)">Two-Wheeler (MCWG)</option>
                    <option value="Heavy Commercial (HMV)">Heavy Commercial (HMV)</option>
                    <option value="Defensive & Highway Driving">Defensive & Highway Driving</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newInst.experienceYears}
                    onChange={(e) => setNewInst({ ...newInst, experienceYears: parseInt(e.target.value, 10) })}
                    min={0}
                    max={50}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Monthly Salary (INR) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="28000"
                    value={newInst.salary}
                    onChange={(e) => setNewInst({ ...newInst, salary: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Dedicated Vehicle</label>
                  <select
                    className="form-select"
                    value={newInst.assignedVehicleId}
                    onChange={(e) => setNewInst({ ...newInst, assignedVehicleId: e.target.value })}
                  >
                    <option value="">-- Floating Fleet Pool --</option>
                    {vehicles.map(v => (
                      <option key={v.VehicleID} value={v.VehicleID}>
                        {v.ModelType} ({v.RegistrationNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-new-instructor-btn">
                  Save Instructor & Set Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Instructor & Salary Modal */}
      {editModal && selectedInst && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>Update Instructor & Salary: {selectedInst.FullName}</h3>
              <button className="close-btn" onClick={() => setEditModal(false)}>&times;</button>
            </div>

            {actionError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                {actionError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Monthly Salary (INR) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={editForm.salary}
                  onChange={(e) => setEditForm({ ...editForm, salary: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editForm.experienceYears}
                    onChange={(e) => setEditForm({ ...editForm, experienceYears: parseInt(e.target.value, 10) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Contact</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Assigned Vehicle</label>
                  <select
                    className="form-select"
                    value={editForm.assignedVehicleId}
                    onChange={(e) => setEditForm({ ...editForm, assignedVehicleId: e.target.value })}
                  >
                    <option value="">-- Floating Pool --</option>
                    {vehicles.map(v => (
                      <option key={v.VehicleID} value={v.VehicleID}>
                        {v.ModelType} ({v.RegistrationNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Employment Status</label>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="OnLeave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-edit-instructor-btn">
                  Update Details & Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
