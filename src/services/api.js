const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5001/api' : '/api';

// Generic API function
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}


export const userAPI = {

  getAll: () => apiRequest('/users'),
  
  // Get user by username
  getByUsername: (username) => apiRequest(`/users/${username}`),
  
  // Create new user
  create: (userData) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Update user
  update: (username, userData) => apiRequest(`/users/${username}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  // Update pet health
  updateHealth: (username, healthChange) => apiRequest(`/users/${username}/health`, {
    method: 'PATCH',
    body: JSON.stringify({ healthChange }),
  }),
  
  // Delete user
  delete: (username) => apiRequest(`/users/${username}`, {
    method: 'DELETE',
  }),
};

// Chore API functions
export const choreAPI = {
  // Get all chores
  getAll: (completed) => {
    const params = completed !== undefined ? `?completed=${completed}` : '';
    return apiRequest(`/chores${params}`);
  },
  
  // Get chore by ID
  getById: (id) => apiRequest(`/chores/${id}`),
  
  // Create new chore
  create: (choreData) => apiRequest('/chores', {
    method: 'POST',
    body: JSON.stringify(choreData),
  }),
  
  // Update chore
  update: (id, choreData) => apiRequest(`/chores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(choreData),
  }),
  
  // Complete chore (increment progress)
  complete: (id) => apiRequest(`/chores/${id}/complete`, {
    method: 'PATCH',
  }),
  
  // Reset chore progress
  reset: (id) => apiRequest(`/chores/${id}/reset`, {
    method: 'PATCH',
  }),
  
  // Delete chore
  delete: (id) => apiRequest(`/chores/${id}`, {
    method: 'DELETE',
  }),
  
  // Get chores for specific user
  getByUser: (username, completed) => {
    const params = completed !== undefined ? `?completed=${completed}` : '';
    return apiRequest(`/chores/user/${username}${params}`);
  },
};

// Health check
export const healthAPI = {
  check: () => apiRequest('/health'),
};