const API_BASE_URL = '/api';

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('campusattend_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('campusattend_token');
        localStorage.removeItem('campusattend_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      throw new Error(data.message || 'An error occurred during request.');
    }

    return data;
  } catch (error) {
    throw error;
  }
};
