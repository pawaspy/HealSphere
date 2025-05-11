/**
 * API utility for making requests to the backend
 */

// Base API URL with proxy prefix
const API_BASE_URL = '/api';

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Generate headers for API requests, including authentication if token exists
 * @param {boolean} includeAuth Whether to include authentication header
 * @returns {Object} Headers object for fetch
 */
export const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log("Using auth token:", token.substring(0, 10) + "...");
    } else {
      console.warn("Auth token required but not found in localStorage");
    }
  }

  return headers;
};

/**
 * Make a GET request to the API
 * @param {string} endpoint The API endpoint to call
 * @param {boolean} requiresAuth Whether the request requires authentication
 * @returns {Promise<any>} Promise resolving to the response data
 */
export const apiGet = async (endpoint, requiresAuth = true) => {
  try {
    console.log(`Making GET request to ${endpoint}`);
    
    // Check auth token info if auth is required
    if (requiresAuth) {
      const token = localStorage.getItem('token');
      console.log(`Auth token for ${endpoint}: ${token ? 'exists' : 'missing'}`);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(requiresAuth),
    });

    console.log(`Response status from ${endpoint}: ${response.status}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Endpoint not found: ${endpoint}`);
        // For appointments, return empty array on 404
        if (endpoint.includes('appointments')) {
          return [];
        }
      }
      
      // For 500 errors, try to get more detailed error message from response
      if (response.status === 500) {
        try {
          const contentType = response.headers.get('content-type');
          let errorData;
          
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
            console.error(`Server error (500) details for ${endpoint}:`, errorData);
            
            // Special handling for prescription "no rows" error
            if (endpoint.includes('/prescriptions/') && 
                errorData.error && 
                errorData.error.includes('no rows in result set')) {
              const notFoundError = new Error('404 Prescription not found');
              notFoundError.status = 404;
              throw notFoundError;
            }
          } else {
            const errorText = await response.text();
            console.error(`Server error (500) details for ${endpoint}:`, errorText);
            
            // Special handling for prescription "no rows" error as text
            if (endpoint.includes('/prescriptions/') && errorText.includes('no rows in result set')) {
              const notFoundError = new Error('404 Prescription not found');
              notFoundError.status = 404;
              throw notFoundError;
            }
          }
        } catch (e) {
          console.error(`Could not read error details for ${endpoint} 500 error:`, e);
        }
      }
      
      throw new Error(`API Error: ${response.status}`);
    }

    try {
      const data = await response.json();
      console.log(`Received data from ${endpoint}:`, 
        Array.isArray(data) ? `Array with ${data.length} items` : typeof data);
      return data;
    } catch (jsonError) {
      console.warn(`JSON parsing error for ${endpoint}:`, jsonError);
      // Return appropriate fallback based on endpoint type
      if (endpoint.includes('appointments')) {
        return [];
      }
      return {};
    }
  } catch (error) {
    console.error(`API GET Error for ${endpoint}:`, error);
    // For appointments endpoints, return empty array instead of throwing
    if (endpoint.includes('appointments')) {
      return [];
    }
    throw error;
  }
};

/**
 * Make a POST request to the API
 * @param {string} endpoint The API endpoint to call
 * @param {Object} data The data to send in the request body
 * @param {boolean} requiresAuth Whether the request requires authentication
 * @returns {Promise<any>} Promise resolving to the response data
 */
export const apiPost = async (endpoint, data, requiresAuth = true) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making POST request to: ${url}`);
    console.log(`With data:`, data);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(requiresAuth),
      body: JSON.stringify(data),
    });

    console.log(`POST response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API POST Error:', error);
    throw error;
  }
};

/**
 * Make a PUT request to the API
 * @param {string} endpoint The API endpoint to call
 * @param {Object} data The data to send in the request body
 * @returns {Promise<any>} Promise resolving to the response data
 */
export const apiPut = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API PUT Error:', error);
    throw error;
  }
};

/**
 * Make a PATCH request to the API
 * @param {string} endpoint The API endpoint to call
 * @param {Object} data The data to send in the request body
 * @returns {Promise<any>} Promise resolving to the response data
 */
export const apiPatch = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API PATCH Error:', error);
    throw error;
  }
};

/**
 * Make a DELETE request to the API
 * @param {string} endpoint The API endpoint to call
 * @returns {Promise<any>} Promise resolving to the response data
 */
export const apiDelete = async (endpoint) => {
  try {
    console.log(`Making DELETE request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    console.log(`DELETE response status: ${response.status}`);

    if (response.status === 404) {
      throw new Error(`Endpoint not found: ${endpoint}`);
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    // Some DELETE endpoints may not return data
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API DELETE Error:', error);
    throw error;
  }
};

// Auth-specific API functions
const authApi = {
  // Patient authentication
  registerPatient: (data) => apiPost('/patients', data, false),
  loginPatient: (data) => apiPost('/patients/login', data, false),
  getPatientProfile: () => apiGet('/patients/profile'),
  updatePatientProfile: (data) => apiPut('/patients/profile', data),
  updatePatientPassword: (data) => apiPatch('/patients/password', data),
  deletePatientAccount: () => apiDelete('/patients/'),
  
  // Doctor authentication
  registerDoctor: (data) => apiPost('/doctors', data, false),
  loginDoctor: (data) => apiPost('/doctors/login', data, false),
  getDoctorProfile: () => apiGet('/doctors/profile'),
  updateDoctorProfile: (data) => apiPut('/doctors/profile', data),
  updateDoctorPassword: (data) => apiPatch('/doctors/password', data),
  deleteDoctorAccount: () => apiDelete('/doctors/'),
};

// Doctor listing and search
const doctorsApi = {
  listDoctors: (page = 1, pageSize = 10) => 
    apiGet(`/doctors?page_id=${page}&page_size=${pageSize}`, false),
  searchDoctorsBySpecialty: (specialty, page = 1, pageSize = 10) => 
    apiGet(`/doctors?specialty=${specialty}&page_id=${page}&page_size=${pageSize}`, false),
  checkUsernameExists: (username) => 
    apiGet(`/doctors/check-username/${username}`, false),
  checkEmailExists: (email) => 
    apiGet(`/doctors/check-email/${email}`, false),
};

// Patient operations
const patientsApi = {
  checkUsernameExists: (username) => 
    apiGet(`/patients/check-username/${username}`, false),
  checkEmailExists: (email) => 
    apiGet(`/patients/check-email/${email}`, false),
};

// Appointment operations
const appointmentsApi = {
  // Create a new appointment
  createAppointment: async (data) => {
    try {
      // Verify authentication is present
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const role = localStorage.getItem('userRole');
      
      if (!token) {
        throw new Error("Authentication required to create an appointment");
      }
      
      if (role !== 'patient') {
        throw new Error("Only patients can create appointments");
      }
      
      console.log(`Creating appointment as patient: ${username}, with role: ${role}`);
      
      // First, try to hit the test endpoint to check if server is accessible
      try {
        console.log("Testing server accessibility...");
        const testResponse = await fetch('/test');
        console.log(`Test endpoint response: ${testResponse.status}`);
        
        const appTestResponse = await fetch('/appointments-test');
        console.log(`Appointments test endpoint response: ${appTestResponse.status}`);
        
        // Try POST to the test endpoint
        try {
          console.log("Testing POST to appointments-test endpoint...");
          const testPostResponse = await fetch('/appointments-test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Username': username,
              'X-Role': role
            },
            body: JSON.stringify({
              test: true,
              message: "Testing appointment creation",
              doctor_username: data.doctor_username
            })
          });
          
          console.log(`Test POST response status: ${testPostResponse.status}`);
          const testResponseData = await testPostResponse.json();
          console.log("Test POST response data:", testResponseData);
        } catch (postTestError) {
          console.warn("Test POST endpoint error:", postTestError);
        }
      } catch (testError) {
        console.warn("Test endpoint error:", testError);
      }
      
      // Try multiple URLs to diagnose the issue - make sure there are no trailing slashes
      const urls = [
        '/appointments',         // Direct URL (no /api prefix, no trailing slash)
        '/api/appointments',     // Proxy URL (no trailing slash)
        'http://localhost:3000/appointments'  // Direct to backend (port 3000, not 8080)
      ];
      
      // Add custom headers to help debug token extraction issues
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Username': username,
        'X-Role': role
      };
      
      let response = null;
      let error = null;
      
      // Try each URL in sequence until one works
      for (const url of urls) {
        try {
          console.log(`Attempting POST request to: ${url}`);
          console.log(`With appointment data:`, data);
          console.log(`With headers:`, headers);
          
          response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
            // Ensure we handle redirects properly
            redirect: 'follow'
          });
          
          console.log(`Response from ${url}: Status ${response.status}`);
          
          // If we got a successful response, break the loop
          if (response.ok) {
            console.log(`Success with URL: ${url}`);
            break;
          }
          
          // Try to read response body for error details
          let errorBody = {};
          try {
            errorBody = await response.json();
            console.log(`Error body from ${url}:`, errorBody);
          } catch (e) {
            console.log(`No JSON body in error response from ${url}`);
            
            // Try to read text response
            try {
              const textResponse = await response.text();
              console.log(`Text response from ${url}:`, textResponse);
            } catch (textError) {
              console.log(`Could not read text from response:`, textError);
            }
          }
          
          // Save the error but continue trying other URLs
          error = new Error(`API Error: ${response.status} - ${errorBody.error || "Unknown error"}`);
        } catch (fetchError) {
          console.error(`Network error trying ${url}:`, fetchError);
          // Save the error but continue trying other URLs
          error = fetchError;
        }
      }
      
      // If we got a successful response from any URL, process it
      if (response && response.ok) {
        try {
          const responseData = await response.json();
          console.log("Successfully created appointment:", responseData);
          return responseData;
        } catch (jsonError) {
          console.log("Response was OK but could not parse JSON:", jsonError);
          // If we can't parse the JSON, return an empty object
          return {};
        }
      }
      
      // If we get here, all URLs failed
      throw error || new Error("All appointment creation URLs failed");
    } catch (error) {
      console.error('API appointment creation error:', error);
      throw error;
    }
  },
  
  // Get a specific appointment by ID
  getAppointment: (id) => 
    apiGet(`/appointments/${id}`),
  
  // Get all appointments for the authenticated patient
  listPatientAppointments: async () => {
    try {
      const response = await apiGet('/patients/appointments');
      // Process and enhance patient appointments with doctor details if needed
      if (Array.isArray(response)) {
        return response;
      }
      return response;
    } catch (error) {
      console.error("Error in listPatientAppointments:", error);
      return [];
    }
  },
  
  // Get today's appointments for the authenticated patient
  listTodayPatientAppointments: async () => {
    try {
      const response = await apiGet('/patients/appointments/today');
      // Process and enhance appointments if needed
      if (Array.isArray(response)) {
        return response;
      }
      return response;
    } catch (error) {
      console.error("Error in listTodayPatientAppointments:", error);
      return [];
    }
  },
  
  // Get upcoming appointments for the authenticated patient
  listUpcomingPatientAppointments: async () => {
    try {
      const response = await apiGet('/patients/appointments/upcoming');
      // Process and enhance appointments if needed
      if (Array.isArray(response)) {
        return response;
      }
      return response;
    } catch (error) {
      console.error("Error in listUpcomingPatientAppointments:", error);
      return [];
    }
  },
  
  // Get completed appointments for the authenticated patient
  listCompletedPatientAppointments: async () => {
    try {
      const response = await apiGet('/patients/appointments/completed');
      // Process and enhance appointments if needed
      if (Array.isArray(response)) {
        return response;
      }
      return response;
    } catch (error) {
      console.error("Error in listCompletedPatientAppointments:", error);
      return [];
    }
  },
  
  // Get all appointments for the authenticated doctor
  listDoctorAppointments: async () => {
    try {
      const response = await apiGet('/doctors/appointments');
      // Process and enhance doctor appointments with patient details if needed
      if (Array.isArray(response)) {
        return response.map(appointment => {
          // Convert the patient_username to patient_name if missing
          if (!appointment.patient_name && appointment.patient_username) {
            appointment.patient_name = appointment.patient_username;
          }
          // Default to online appointments if not specified
          if (appointment.is_online === undefined) {
            appointment.is_online = true;
          }
          return appointment;
        });
      }
      return response;
    } catch (error) {
      console.error("Error in listDoctorAppointments:", error);
      return [];
    }
  },
  
  // Get today's appointments for the authenticated doctor
  listTodayDoctorAppointments: async () => {
    try {
      const response = await apiGet('/doctors/appointments/today');
      // Process and enhance doctor appointments with patient details if needed
      if (Array.isArray(response)) {
        return response.map(appointment => {
          // Convert the patient_username to patient_name if missing
          if (!appointment.patient_name && appointment.patient_username) {
            appointment.patient_name = appointment.patient_username;
          }
          // Default to online appointments if not specified
          if (appointment.is_online === undefined) {
            appointment.is_online = true;
          }
          return appointment;
        });
      }
      return response;
    } catch (error) {
      console.error("Error in listTodayDoctorAppointments:", error);
      return [];
    }
  },
  
  // Get upcoming appointments for the authenticated doctor
  listUpcomingDoctorAppointments: async () => {
    try {
      const response = await apiGet('/doctors/appointments/upcoming');
      // Process and enhance doctor appointments with patient details if needed
      if (Array.isArray(response)) {
        return response.map(appointment => {
          // Convert the patient_username to patient_name if missing
          if (!appointment.patient_name && appointment.patient_username) {
            appointment.patient_name = appointment.patient_username;
          }
          // Default to online appointments if not specified
          if (appointment.is_online === undefined) {
            appointment.is_online = true;
          }
          return appointment;
        });
      }
      return response;
    } catch (error) {
      console.error("Error in listUpcomingDoctorAppointments:", error);
      return [];
    }
  },
  
  // Update the status of an appointment
  updateAppointmentStatus: (id, status) => 
    apiPatch(`/appointments/${id}/status`, { status }),
  
  // Add or update notes for an appointment
  addAppointmentNotes: (id, notes) => 
    apiPatch(`/appointments/${id}/notes`, { notes }),
  
  // Delete/cancel an appointment
  deleteAppointment: (id) => 
    apiDelete(`/appointments/${id}`),

  // Update online status of an appointment
  updateOnlineStatus: async (appointmentId, isOnline) => {
    try {
      const response = await apiPatch(`/appointments/${appointmentId}/online`, { 
        is_online: isOnline 
      });
      return response;
    } catch (error) {
      console.error('Error updating online status:', error);
      throw error;
    }
  }
};

const prescriptionsApi = {
  // Save a prescription after a consultation
  savePrescription: async (appointmentId, prescriptionText, consultationNotes) => {
    try {
      const response = await apiPost('/prescriptions', {
        appointment_id: appointmentId,
        prescription_text: prescriptionText,
        consultation_notes: consultationNotes
      });
      return response;
    } catch (error) {
      console.error('Error saving prescription:', error);
      throw error;
    }
  },

  // Check if a prescription exists for an appointment
  checkPrescriptionExists: async (appointmentId) => {
    try {
      console.log(`Checking if prescription exists for appointment ID: ${appointmentId}`);
      await apiGet(`/prescriptions/${appointmentId}/exists`);
      return true;
    } catch (error) {
      // If we get a 404 or "no rows in result set" error, it means the prescription doesn't exist
      if (error.status === 404 || 
          error.message.includes('404') || 
          (error.message.includes('500') && error.message.includes('no rows in result set'))) {
        console.log(`No prescription found for appointment ID: ${appointmentId}`);
        return false;
      }
      console.error('Error checking prescription existence:', error);
      // Return false instead of throwing to prevent blocking the UI
      return false;
    }
  },

  // Get a prescription by appointment ID
  getPrescription: async (appointmentId) => {
    try {
      console.log(`Getting prescription for appointment ID: ${appointmentId}`);
      const response = await apiGet(`/prescriptions/${appointmentId}`);
      return response;
    } catch (error) {
      // Check if this is a "no rows in result set" error (prescription doesn't exist)
      if (error.message.includes('500') && error.message.includes('no rows in result set')) {
        console.log(`No prescription found for appointment ID: ${appointmentId} (500 error with 'no rows')`);
        // Convert to a standard 404 error for consistent handling
        const notFoundError = new Error('404 Prescription not found');
        notFoundError.status = 404;
        throw notFoundError;
      }
      
      if (error.message.includes('404')) {
        console.log(`No prescription found for appointment ID: ${appointmentId} (404 error)`);
        const notFoundError = new Error('404 Prescription not found');
        notFoundError.status = 404;
        throw notFoundError;
      }
      
      console.error('Error getting prescription:', error);
      throw error;
    }
  },

  // Update a prescription
  updatePrescription: async (appointmentId, prescriptionText, consultationNotes) => {
    try {
      const response = await apiPut(`/prescriptions/${appointmentId}`, {
        prescription_text: prescriptionText,
        consultation_notes: consultationNotes
      });
      return response;
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  },

  // Submit feedback for a prescription
  submitFeedback: async (appointmentId, rating, comment) => {
    try {
      const response = await apiPost(`/prescriptions/${appointmentId}/feedback`, {
        feedback_rating: rating,
        feedback_comment: comment
      });
      return response;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }
};

// Export all API functions
export {
  authApi,
  doctorsApi,
  patientsApi,
  appointmentsApi,
  prescriptionsApi,
  API_BASE_URL
}; 