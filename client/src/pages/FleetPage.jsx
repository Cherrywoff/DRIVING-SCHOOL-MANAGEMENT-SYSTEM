import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Car, ShieldCheck, Wrench, Plus, CheckCircle2 } from 'lucide-react';

export default function FleetPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [newVeh, setNewVeh] = useState({
    registrationNumber: '',
    modelType: '',
    category: 'Four-Wheeler',
    transmission: 'Manual',
    hasDualControl: true,
    fitnessExpiryDate: '2028-12-31',
    insuranceExpiryDate: '2027-12-31'
  });

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.getVehicles();
      if (res.success) setVehicles(res.vehicles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createVehicle(newVeh);
      if (res.success) {
        setAddModal(false);
        loadVehicles();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>Vehicle Fleet & Dual-Control Assets</h1>
          <p>Training Fleet Management • Dual Controls, Fitness Certifications & Insurance Validity</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn btn-primary btn-sm" id="add-vehicle-btn">
          <Plus size={16} />
          <span>Add Training Vehicle</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading fleet assets...</div>
      ) : (
        <div className="grid-cols-2">
          {vehicles.map(v => (
            <div key={v.VehicleID} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span className="badge badge-blue">{v.RegistrationNumber}</span>
                <span className={`badge ${v.Status === 'Available' ? 'badge-green' : 'badge-amber'}`}>{v.Status}</span>
              </div>

              <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>{v.ModelType}</h3>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
                Category: <strong>{v.Category}</strong> • Transmission: <strong>{v.Transmission}</strong>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Dual Controls</span>
                  <strong style={{ color: v.HasDualControl ? '#34d399' : '#f87171' }}>
                    {v.HasDualControl ? 'Equipped (Dual Pedals)' : 'Standard'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Fitness Expiry</span>
                  <strong>{v.FitnessExpiryDate ? new Date(v.FitnessExpiryDate).toLocaleDateString('en-IN') : 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Insurance Expiry</span>
                  <strong>{v.InsuranceExpiryDate ? new Date(v.InsuranceExpiryDate).toLocaleDateString('en-IN') : 'N/A'}</strong>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Car size={14} /> Assigned Instructor:{' '}
                <strong style={{ color: '#60a5fa' }}>{v.AssignedInstructorName || 'General Pool'}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {addModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Training Car / Vehicle</h3>
              <button className="close-btn" onClick={() => setAddModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Registration No. *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MH-24-AG-2020"
                    value={newVeh.registrationNumber}
                    onChange={(e) => setNewVeh({ ...newVeh, registrationNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={newVeh.category}
                    onChange={(e) => setNewVeh({ ...newVeh, category: e.target.value })}
                  >
                    <option value="Four-Wheeler">Four-Wheeler</option>
                    <option value="Two-Wheeler">Two-Wheeler</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vehicle Make & Model *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Tata Altroz XT"
                  value={newVeh.modelType}
                  onChange={(e) => setNewVeh({ ...newVeh, modelType: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Transmission</label>
                  <select
                    className="form-select"
                    value={newVeh.transmission}
                    onChange={(e) => setNewVeh({ ...newVeh, transmission: e.target.value })}
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Dual Control Fitted?</label>
                  <select
                    className="form-select"
                    value={newVeh.hasDualControl ? 'true' : 'false'}
                    onChange={(e) => setNewVeh({ ...newVeh, hasDualControl: e.target.value === 'true' })}
                  >
                    <option value="true">Yes - Dual Pedals Fitted</option>
                    <option value="false">No - Standard Vehicle</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
