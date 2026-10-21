import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import BookingsPage from './pages/BookingsPage';
import AttendancePage from './pages/AttendancePage';
import TestsPage from './pages/TestsPage';
import PaymentsPage from './pages/PaymentsPage';
import InstructorsPage from './pages/InstructorsPage';
import FleetPage from './pages/FleetPage';
import UsersPage from './pages/UsersPage';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRegistering, setIsRegistering] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f19', color: '#94a3b8' }}>
        Initializing DriveAcademy System...
      </div>
    );
  }

  if (!user) {
    return isRegistering ? (
      <RegisterPage onSwitchToLogin={() => setIsRegistering(false)} />
    ) : (
      <LoginPage onSwitchToRegister={() => setIsRegistering(true)} />
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
        {activeTab === 'courses' && <CoursesPage setActiveTab={setActiveTab} />}
        {activeTab === 'bookings' && <BookingsPage />}
        {activeTab === 'attendance' && <AttendancePage />}
        {activeTab === 'tests' && <TestsPage />}
        {activeTab === 'payments' && <PaymentsPage />}
        {activeTab === 'instructors' && <InstructorsPage />}
        {activeTab === 'fleet' && <FleetPage />}
        {activeTab === 'users' && <UsersPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
