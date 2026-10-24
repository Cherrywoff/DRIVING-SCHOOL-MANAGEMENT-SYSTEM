import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Car,
  Calendar,
  ClipboardCheck,
  Award,
  CreditCard,
  LogOut,
  UserCheck,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Instructor', 'Student'] },
    { id: 'courses', label: 'Courses & Fees', icon: GraduationCap, roles: ['Admin', 'Instructor', 'Student'] },
    { id: 'bookings', label: 'Driving Sessions', icon: Calendar, roles: ['Admin', 'Instructor', 'Student'] },
    { id: 'attendance', label: 'Lesson Attendance', icon: ClipboardCheck, roles: ['Admin', 'Instructor', 'Student'] },
    { id: 'tests', label: 'RTO & Mock Tests', icon: Award, roles: ['Admin', 'Instructor', 'Student'] },
    { id: 'payments', label: 'Fee Invoices', icon: CreditCard, roles: ['Admin', 'Student'] },
    { id: 'instructors', label: 'Instructors', icon: Users, roles: ['Admin'] },
    { id: 'fleet', label: 'Vehicle Fleet', icon: Car, roles: ['Admin'] },
    { id: 'users', label: 'Student Directory', icon: UserCheck, roles: ['Admin'] }
  ];

  const currentRole = user?.role || user?.Role || 'Student';
  const filteredNav = navItems.filter(item => item.roles.includes(currentRole));

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logo-badge">DS</div>
            <div className="logo-text">
              <h2>DriveAcademy</h2>
              <p>COCSIT Capstone Portal</p>
            </div>
          </div>
          {/* Mobile close toggle */}
          <button
            className="mobile-close-btn"
            onClick={onClose}
            title="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredNav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini-card">
            <div className="user-avatar">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info-text" style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName || 'User'}
              </h4>
              <span className="user-role-badge">{currentRole}</span>
            </div>
            <button
              id="logout-btn"
              onClick={logout}
              title="Log out"
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
