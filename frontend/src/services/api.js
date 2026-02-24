import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Network error handling
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      error.message = 'Network error. Please check your connection and ensure the backend server is running.';
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me')
};

export const userAPI = {
  getUsers: (params) => API.get('/users', { params }),
  getUser: (id) => API.get(`/users/${id}`),
  createUser: (data) => API.post('/users', data),
  createStaffWithDocs: (formData) => {
    return axios.create({
      baseURL: 'http://localhost:5000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).post('/users/staff-with-docs', formData);
  },
  updateUser: (id, data) => API.put(`/users/${id}`, data),
  deleteUser: (id) => API.delete(`/users/${id}`)
};

export const classAPI = {
  getClasses: () => API.get('/classes'),
  createClass: (data) => API.post('/classes', data),
  updateClass: (id, data) => API.put(`/classes/${id}`, data),
  deleteClass: (id) => API.delete(`/classes/${id}`)
};

export const subjectAPI = {
  getSubjects: () => API.get('/subjects'),
  createSubject: (data) => API.post('/subjects', data),
  updateSubject: (id, data) => API.put(`/subjects/${id}`, data),
  deleteSubject: (id) => API.delete(`/subjects/${id}`)
};

export const attendanceAPI = {
  getAttendance: (params) => API.get('/attendance', { params }),
  createAttendance: (data) => API.post('/attendance', data),
  updateAttendance: (id, data) => API.put(`/attendance/${id}`, data),
  deleteAttendance: (id) => API.delete(`/attendance/${id}`),
  markBulkAttendance: (data) => API.post('/attendance/bulk', data),
  downloadAttendance: (params) => {
    return API.get('/attendance/download', { 
      params, 
      responseType: 'blob',
      headers: { 'Accept': 'text/csv' }
    });
  }
};

export const staffAttendanceAPI = {
  getStaffAttendance: (params) => API.get('/staff-attendance', { params }),
  createStaffAttendance: (data) => API.post('/staff-attendance', data),
  updateStaffAttendance: (id, data) => API.put(`/staff-attendance/${id}`, data),
  deleteStaffAttendance: (id) => API.delete(`/staff-attendance/${id}`),
  checkIn: () => API.post('/staff-attendance/check-in'),
  checkOut: () => API.post('/staff-attendance/check-out'),
  getTodayAttendance: () => API.get('/staff-attendance/today')
};

export const leaveRequestAPI = {
  getLeaveRequests: (params) => API.get('/leave-requests', { params }),
  getMyLeaveRequests: () => API.get('/leave-requests/my-requests'),
  createLeaveRequest: (data) => API.post('/leave-requests', data),
  updateLeaveRequestStatus: (id, data) => API.put(`/leave-requests/${id}/status`, data),
  markAsRead: () => API.put('/leave-requests/mark-read'),
  getUnreadCount: () => API.get('/leave-requests/unread-count')
};

export const markAPI = {
  getMarks: (params) => API.get('/marks', { params }),
  createMark: (data) => API.post('/marks', data),
  updateMark: (id, data) => API.put(`/marks/${id}`, data),
  deleteMark: (id) => API.delete(`/marks/${id}`),
  getUnreadCount: () => API.get('/marks/unread-count'),
  markAsRead: () => API.put('/marks/mark-read'),
  getRecentUpdates: () => API.get('/marks/recent-updates')
};

export const materialAPI = {
  getMaterials: (params) => API.get('/materials', { params }),
  createMaterial: (data) => {
    // Check if data is FormData (for file uploads)
    if (data instanceof FormData) {
      return axios.create({
        baseURL: 'http://localhost:5000/api',
        timeout: 60000, // Increased timeout for file uploads
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).post('/materials', data);
    }
    // Regular JSON data
    return API.post('/materials', data);
  },
  deleteMaterial: (id) => API.delete(`/materials/${id}`),
  getNewMaterialsCount: (params) => API.get('/materials/new-count', { params }),
  markMaterialAsViewed: (data) => API.post('/materials/mark-viewed', data)
};

export const announcementAPI = {
  getAnnouncements: (params) => API.get('/announcements', { params }),
  createAnnouncement: (data) => API.post('/announcements', data),
  updateAnnouncement: (id, data) => API.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => API.delete(`/announcements/${id}`),
  getUnreadCount: () => API.get('/announcements/unread-count'),
  markAsRead: () => API.put('/announcements/mark-read')
};

export const timetableAPI = {
  getTimetable: (params) => API.get('/timetable', { params }),
  createTimetable: (data) => API.post('/timetable', data),
  updateTimetable: (id, data) => API.put(`/timetable/${id}`, data)
};

export const dashboardAPI = {
  getAdminStats: () => API.get('/dashboard/admin'),
  getStudentStats: () => API.get('/dashboard/student'),
  getStaffStats: () => API.get('/dashboard/staff')
};

export const cafeteriaAPI = {
  getWeeklyMenu: () => API.get('/cafeteria/menu'),
  getWallet: () => API.get('/cafeteria/wallet'),
  addMoney: (data) => API.post('/cafeteria/wallet/add', data),
  getTransactionHistory: () => API.get('/cafeteria/wallet/history'),
  getTodaySpecials: () => API.get('/cafeteria/specials'),
  placeOrder: (data) => API.post('/cafeteria/order', data),
  getOrderHistory: () => API.get('/cafeteria/orders')
};

export const transportAPI = {
  getMyTransport: () => API.get('/transport/my-transport'),
  getAllRoutes: () => API.get('/transport/routes'),
  trackBusLocation: () => API.get('/transport/track'),
  assignTransport: (data) => API.post('/transport/assign', data),
  createRoute: (data) => API.post('/transport/routes', data),
  updateRoute: (id, data) => API.put(`/transport/routes/${id}`, data)
};

export const hostelAPI = {
  getMyHostel: () => API.get('/hostel/my-hostel'),
  raiseIssue: (data) => API.post('/hostel/issues', data),
  getMyIssues: () => API.get('/hostel/my-issues'),
  getAllHostels: () => API.get('/hostel'),
  createHostel: (data) => API.post('/hostel', data),
  updateHostel: (id, data) => API.put(`/hostel/${id}`, data),
  getAllIssues: () => API.get('/hostel/issues/all'),
  updateIssueStatus: (id, data) => API.put(`/hostel/issues/${id}`, data)
};

export default API;