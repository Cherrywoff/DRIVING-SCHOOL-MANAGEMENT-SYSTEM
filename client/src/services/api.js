const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = getAuthHeaders();
  
  const config = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  getAllUsers: (params = '') => request(`/auth/users${params ? '?' + params : ''}`),

  // Courses
  getCourses: (params = '') => request(`/courses${params ? '?' + params : ''}`),
  getCourse: (id) => request(`/courses/${id}`),
  createCourse: (data) => request('/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id, data) => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Instructors
  getInstructors: () => request('/instructors'),
  getInstructor: (id) => request(`/instructors/${id}`),
  createInstructor: (data) => request('/instructors', { method: 'POST', body: JSON.stringify(data) }),
  updateInstructor: (id, data) => request(`/instructors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Vehicles
  getVehicles: (params = '') => request(`/vehicles${params ? '?' + params : ''}`),
  createVehicle: (data) => request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (id, data) => request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Sessions
  getSessions: () => request('/sessions'),

  // Bookings
  getBookings: (params = '') => request(`/bookings${params ? '?' + params : ''}`),
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBookingStatus: (id, data) => request(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Attendance
  getAttendance: (params = '') => request(`/attendance${params ? '?' + params : ''}`),
  recordAttendance: (data) => request('/attendance', { method: 'POST', body: JSON.stringify(data) }),

  // Tests & Mock Quizzes
  getTests: (params = '') => request(`/tests${params ? '?' + params : ''}`),
  scheduleTest: (data) => request('/tests', { method: 'POST', body: JSON.stringify(data) }),
  updateTestResult: (id, data) => request(`/tests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getMockQuizQuestions: () => request('/tests/mock-quiz/questions'),
  submitMockQuiz: (data) => request('/tests/mock-quiz/submit', { method: 'POST', body: JSON.stringify(data) }),

  // Payments & Receipts
  getPayments: (params = '') => request(`/payments${params ? '?' + params : ''}`),
  processPayment: (data) => request('/payments/process', { method: 'POST', body: JSON.stringify(data) }),
  getReceiptUrl: (paymentId) => `${API_BASE}/payments/${paymentId}/receipt`,

  // Reports
  getDashboardStats: () => request('/reports/dashboard-stats'),
  getStudentsExcelUrl: () => `${API_BASE}/reports/export/students-excel`,
  getRevenueExcelUrl: () => `${API_BASE}/reports/export/revenue-excel`
};
