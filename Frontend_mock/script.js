/**
 * Travel Planner API Tester
 * Simple JavaScript for testing the backend API
 */

// DOM Elements
const tripForm = document.getElementById('tripForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoading = submitBtn.querySelector('.btn-loading');
const responseDisplay = document.getElementById('responseDisplay');
const responseMeta = document.getElementById('responseMeta');
const errorDisplay = document.getElementById('errorDisplay');
const loadingDisplay = document.getElementById('loadingDisplay');
const apiUrlInput = document.getElementById('apiUrl');

/**
 * Get the API base URL
 */
const getApiUrl = () => {
  return apiUrlInput.value.trim() || 'http://localhost:4000';
};

/**
 * Show loading state
 */
const showLoading = (show = true) => {
  if (show) {
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    submitBtn.disabled = true;
    loadingDisplay.style.display = 'block';
    responseDisplay.style.display = 'none';
    errorDisplay.style.display = 'none';
    responseMeta.innerHTML = '';
  } else {
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    submitBtn.disabled = false;
    loadingDisplay.style.display = 'none';
    responseDisplay.style.display = 'block';
  }
};

/**
 * Show error message
 */
const showError = (title, message) => {
  errorDisplay.innerHTML = `
    <h3>❌ ${title}</h3>
    <p>${message}</p>
  `;
  errorDisplay.style.display = 'block';
  responseDisplay.style.display = 'none';
};

/**
 * Format JSON with syntax highlighting
 */
const formatJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  
  // Basic syntax highlighting
  return json
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]*)"([,\n])/g, ': <span class="json-string">"$1"</span>$2')
    .replace(/: (-?\d+\.?\d*)([,\n])/g, ': <span class="json-number">$1</span>$2')
    .replace(/: (true|false)([,\n])/g, ': <span class="json-boolean">$1</span>$2')
    .replace(/: (null)([,\n])/g, ': <span class="json-null">$1</span>$2');
};

/**
 * Display API response
 */
const displayResponse = (data, status, duration) => {
  const statusClass = status >= 200 && status < 300 ? 'success' : 'error';
  const statusText = status >= 200 && status < 300 ? 'Success' : 'Error';
  
  responseMeta.innerHTML = `
    <span class="status ${statusClass}">${statusText} (${status})</span>
    <span> • ${duration}ms</span>
  `;
  
  responseDisplay.innerHTML = formatJson(data);
  responseDisplay.style.display = 'block';
  errorDisplay.style.display = 'none';
};

/**
 * Make API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const startTime = Date.now();
  const url = `${getApiUrl()}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    
    const duration = Date.now() - startTime;
    const data = await response.json();
    
    displayResponse(data, response.status, duration);
    return { success: response.ok, data };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showError('Connection Error', `Could not connect to the API at ${url}. Make sure the backend server is running.`);
    } else {
      showError('Request Failed', error.message);
    }
    
    responseMeta.innerHTML = `<span class="status error">Error</span> • ${duration}ms`;
    return { success: false, error: error.message };
  }
};

/**
 * Create trip itinerary
 */
const createTrip = async (formData) => {
  showLoading(true);
  
  const payload = {
    startingCity: formData.get('startingCity'),
    days: parseInt(formData.get('days'), 10),
    theme: formData.get('theme'),
    subTheme: formData.get('subTheme'),
    currency: formData.get('currency'),
  };
  
  const result = await apiRequest('/api/trip/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  showLoading(false);
  return result;
};

/**
 * Health check
 */
const checkHealth = async () => {
  showLoading(true);
  await apiRequest('/api/health');
  showLoading(false);
};

/**
 * Get available options
 */
const getOptions = async () => {
  showLoading(true);
  await apiRequest('/api/trip/options');
  showLoading(false);
};

/**
 * Validate external services
 */
const validateServices = async () => {
  showLoading(true);
  await apiRequest('/api/trip/validate-services');
  showLoading(false);
};

/**
 * Clear response display
 */
const clearResponse = () => {
  responseDisplay.innerHTML = '<code>// Response will appear here...</code>';
  responseMeta.innerHTML = '';
  errorDisplay.style.display = 'none';
};

// Event Listeners
tripForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(tripForm);
  
  // Basic validation
  const startingCity = formData.get('startingCity');
  const theme = formData.get('theme');
  const subTheme = formData.get('subTheme');
  
  if (!startingCity || !theme || !subTheme) {
    showError('Validation Error', 'Please fill in all required fields.');
    return;
  }
  
  await createTrip(formData);
});

// Make functions globally available for onclick handlers
window.checkHealth = checkHealth;
window.getOptions = getOptions;
window.validateServices = validateServices;
window.clearResponse = clearResponse;

// Initialize
console.log('🌍 Travel Planner API Tester loaded');
console.log('API URL:', getApiUrl());
