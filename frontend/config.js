// API Configuration
const API_CONFIG = {
  // Change this to your API Gateway endpoint
  BASE_URL: 'https://your-api-id.execute-api.region.amazonaws.com/prod',
  // For local testing, uncomment the line below
  // BASE_URL: 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Update API Base URL
function updateApiEndpoint(url) {
  API_CONFIG.BASE_URL = url;
  console.log('API Endpoint updated to:', API_CONFIG.BASE_URL);
}

// Get API endpoint from localStorage if set
const storedEndpoint = localStorage.getItem('apiEndpoint');
if (storedEndpoint) {
  updateApiEndpoint(storedEndpoint);
}
