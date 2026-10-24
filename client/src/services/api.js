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

// Guaranteed file download helper handling binary blobs and Authorization token
async function downloadFile(endpoint, defaultFilename) {
  const token = localStorage.getItem('token');
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${API_BASE}${endpoint}${token ? `${separator}token=${encodeURIComponent(token)}` : ''}`;

  const res = await fetch(url, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });

  if (!res.ok) {
    let errMsg = `Download failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.message) errMsg = errJson.message;
    } catch {
      // not JSON
    }
    throw new Error(errMsg);
  }

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = defaultFilename || 'download';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  getAllUsers: (params = '') => request(`/auth/users${params ? '?' + params : ''}`),
  getStudentFullDetails: (id) => request(`/auth/users/${id}/details`),

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
  deleteInstructor: (id) => request(`/instructors/${id}`, { method: 'DELETE' }),

  // Vehicles
  getVehicles: (params = '') => request(`/vehicles${params ? '?' + params : ''}`),
  createVehicle: (data) => request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (id, data) => request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Sessions
  getSessions: () => request('/sessions'),

  // Bookings & Slot Assignment
  getBookings: (params = '') => request(`/bookings${params ? '?' + params : ''}`),
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  assignSlot: (id, data) => request(`/bookings/${id}/assign`, { method: 'PUT', body: JSON.stringify(data) }),
  updateBookingStatus: (id, data) => request(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Attendance
  getAttendance: (params = '') => request(`/attendance${params ? '?' + params : ''}`),
  recordAttendance: (data) => request('/attendance', { method: 'POST', body: JSON.stringify(data) }),

  // Tests & Mock Quizzes
  getTests: (params = '') => request(`/tests${params ? '?' + params : ''}`),
  scheduleTest: (data) => request('/tests', { method: 'POST', body: JSON.stringify(data) }),
  updateTestResult: (id, data) => request(`/tests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPapersList: () => request('/tests/mock-quiz/papers'),
  getMockQuizQuestions: (paperId) => request(`/tests/mock-quiz/questions${paperId ? `?paperId=${paperId}` : ''}`),
  submitMockQuiz: (data) => request('/tests/mock-quiz/submit', { method: 'POST', body: JSON.stringify(data) }),

  // Payments & Receipts
  getPayments: (params = '') => request(`/payments${params ? '?' + params : ''}`),
  processPayment: (data) => request('/payments/process', { method: 'POST', body: JSON.stringify(data) }),
  downloadReceiptPdf: (paymentId, invoiceNumber) => downloadFile(`/payments/${paymentId}/receipt`, `Receipt_${invoiceNumber || paymentId}.pdf`),
  getReceiptUrl: (paymentId) => {
    const token = localStorage.getItem('token');
    return `${API_BASE}/payments/${paymentId}/receipt${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  // Reports
  getDashboardStats: () => request('/reports/dashboard-stats'),
  downloadStudentExcel: () => downloadFile('/reports/export/students-excel', 'Students_Roster_2026.xlsx'),
  downloadRevenueExcel: () => downloadFile('/reports/export/revenue-excel', 'Fee_Collections_Report_2026.xlsx'),
  getStudentsExcelUrl: () => {
    const token = localStorage.getItem('token');
    return `${API_BASE}/reports/export/students-excel${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  getRevenueExcelUrl: () => {
    const token = localStorage.getItem('token');
    return `${API_BASE}/reports/export/revenue-excel${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  }
};
