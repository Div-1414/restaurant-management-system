import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ---------------- RESPONSE INTERCEPTOR ---------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // 🔒 Token expired or invalid
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // 🚫 Restaurant inactive
      if (
        status === 403 &&
        (data?.detail === 'Restaurant is inactive' ||
          data?.error === 'Restaurant is inactive')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/service-inactive';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/* ---------------- AUTH ---------------- */
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
};

/* ---------------- RESTAURANT ---------------- */
export const restaurantAPI = {
  getAll: () => api.get('/restaurants/'),
  getById: (id) => api.get(`/restaurants/${id}/`),

  // ✅ REQUIRED: backend uses MultiPartParser
  create: (formData) =>
    api.post('/restaurants/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id, formData) =>
    api.patch(`/restaurants/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // ✅ FIX: send JSON properly
  updateStatus: (id, status) =>
    api.patch(
      `/restaurants/${id}/set-status/`,
      { status },
      { headers: { 'Content-Type': 'application/json' } }
    ),

  // ✅ FIX: correct endpoint name
  toggleOpen: (id) =>
    api.patch(`/restaurants/${id}/toggle-open/`),

  delete: (id) => api.delete(`/restaurants/${id}/`),
  getStats: (id) => api.get(`/restaurants/${id}/stats/`),


  /* ===== Bill & QR Settings (NEW) ===== */
  getPrintSettings: () =>
    api.get('/restaurant/print-settings/'),

  updatePrintSettings: (data) =>
    api.put('/restaurant/print-settings/', data),
  /*-----------For new Close Rule------------ */
  closeDay: (id) =>
    api.post(`/restaurants/${id}/close-day/`),

};

/* ---------------- TABLE ---------------- */
export const tableAPI = {
  // ✅ already correct (used for hall filter)
  getAll: (params) => api.get('/tables/', { params }),

  create: (data) => api.post('/tables/', data),

  // ✅ FIXED payload keys to match backend
  bulkCreate: (restaurantId, count, frontendUrl, hallId) =>
    api.post('/tables/bulk-create/', {
      restaurant_id: restaurantId,
      count,
      frontend_url: frontendUrl,
      hall_id: hallId || null,
    }),

  generateQR: (id, frontendUrl) =>
    api.post(`/tables/${id}/generate_qr/`, {
      frontend_url: frontendUrl,
    }),

  update: (id, data) => api.patch(`/tables/${id}/`, data),
  delete: (id) => api.delete(`/tables/${id}/`),
};

/* ---------------- HALL ---------------- */
export const hallAPI = {
  getAll: (restaurantId) =>
    api.get('/halls/', { params: { restaurant_id: restaurantId } }),

  create: (data) => api.post('/halls/', data),
  update: (id, data) => api.patch(`/halls/${id}/`, data),
  delete: (id) => api.delete(`/halls/${id}/`),
};

/* ---------------- MENU ---------------- */
export const menuAPI = {
  getCategories: (restaurantId) =>
    api.get('/menu-categories/', {
      params: { restaurant_id: restaurantId },
    }),

  createCategory: (data) => api.post('/menu-categories/', data),
  updateCategory: (id, data) =>
    api.patch(`/menu-categories/${id}/`, data),
  deleteCategory: (id) =>
    api.delete(`/menu-categories/${id}/`),

  getItems: (restaurantId, categoryId) => {
    const params = {};
    if (restaurantId) params.restaurant_id = restaurantId;
    if (categoryId) params.category_id = categoryId;
    return api.get('/menu-items/', { params });
  },

  createItem: (data) => api.post('/menu-items/', data),
  updateItem: (id, data) =>
    api.patch(`/menu-items/${id}/`, data),
  deleteItem: (id) =>
    api.delete(`/menu-items/${id}/`),
};

/* ---------------- ORDERS ---------------- */
export const orderAPI = {
  getAll: (restaurantId, status) => {
    const params = {};
    if (restaurantId) params.restaurant_id = restaurantId;
    if (status) params.status = status;
    return api.get('/orders/', { params });
  },

  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/update_status/`, { status }),

  createOrder: (data) => api.post('/customer/order/', data),

  managerCreateOrder: (data) =>
    api.post('/manager/order/', data),

  generateBill: (sessionId, taxRate) =>
    api.post('/bills/generate/', {
      session_id: sessionId,
      tax_rate: taxRate,
    }),
};


/* ---------------- CUSTOMER ---------------- */
export const customerAPI = {
  getMenu: (restaurantId, tableId) =>
    api.get(`/customer/menu/${restaurantId}/${tableId}/`),
};

/* ---------------- BILL ---------------- */
export const billAPI = {
  generate: (sessionId, taxRate) =>
    api.post('/bills/generate/', {
      session_id: sessionId,
      tax_rate: taxRate,
    }),

  getAll: (restaurantId) =>
    api.get('/bills/', { params: { restaurant_id: restaurantId } }),

  updatePayment: (id, data) =>
    api.patch(`/bills/${id}/update_payment/`, data),


  getDailyIncome: (restaurantId) =>
    api.get('/bills/daily_income/', {
      params: { restaurant_id: restaurantId },
    }),
};

/* ---------------- USERS ---------------- */
export const userAPI = {
  getAll: (restaurantId) =>
    api.get('/users/', { params: { restaurant_id: restaurantId } }),

  create: (data) => api.post('/users/', data),
  update: (id, data) => api.patch(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),

  // 🔥 NEW MANAGER METHODS
  getManagers: () => api.get('/users/managers/'),

  createManager: (data) =>
    api.post('/users/', {
      ...data,
      role: 'restaurant_manager',
    }),

  toggleManagerStatus: (id) =>
    api.patch(`/users/${id}/toggle-status/`),


  resetManagerPassword: (id, password) =>
    api.patch(`/users/${id}/reset-password/`, {
      password,
    }),

  getKitchenStaff: () => api.get('/users/kitchen-staff/'),

  toggleKitchenStaffStatus: (id) =>
    api.patch(`/users/${id}/toggle-status/`),

  resetKitchenStaffPassword: (id, password) =>
    api.patch(`/users/${id}/reset-password/`, { password }),
};

/*---------------For Excel Download---------------------- */
export const reportAPI = {
  downloadTodaySalesExcel: () =>
    api.get('/reports/today-sales-excel/', {
      responseType: 'blob',
    }),
};
/* ---------------- TABLE GROUPS ---------------- */
/* ---------------- TABLE GROUPS (INSIDE TABLE VIEWSET) ---------------- */
export const groupAPI = {
  combine: (data) =>
    api.post('/tables/combine/', data),

  transfer: (data) =>
    api.post('/tables/transfer/', data),

  floorOverview: () =>
    api.get('/tables/floor-overview/'),
};

