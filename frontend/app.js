// API Service
class APIService {
  constructor(baseUrl, timeout = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Employee endpoints
  getEmployees() {
    return this.request('/api/employees');
  }

  getEmployee(id) {
    return this.request(`/api/employees/${id}`);
  }

  createEmployee(data) {
    return this.request('/api/employees', {
      method: 'POST',
      body: data
    });
  }

  updateEmployee(id, data) {
    return this.request(`/api/employees/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  deleteEmployee(id) {
    return this.request(`/api/employees/${id}`, {
      method: 'DELETE'
    });
  }

  searchEmployees(query) {
    return this.request(`/api/employees/search?q=${encodeURIComponent(query)}`);
  }
}

// Initialize API Service
let api = new APIService(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);

// Update API service when endpoint changes
function updateAPIService(baseUrl) {
  api = new APIService(baseUrl, API_CONFIG.TIMEOUT);
  localStorage.setItem('apiEndpoint', baseUrl);
}

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const addForm = document.getElementById('addForm');
const editForm = document.getElementById('editForm');
const employeesList = document.getElementById('employeesList');
const totalCount = document.getElementById('totalCount');
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const searchResults = document.getElementById('searchResults');
const apiStatus = document.getElementById('apiStatus');
const statusBadge = document.getElementById('statusBadge');

// Modals
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const modalClose = document.getElementById('modalClose');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');
const modalOverlay = document.getElementById('modalOverlay');
const deleteModalOverlay = document.getElementById('deleteModalOverlay');

let currentDeleteId = null;
let currentDeleteName = null;
let currentDeleteEmail = null;
let isLoading = false;

// Utility Functions
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function showMessage(element, message, type = 'info') {
  if (!element) return;
  element.textContent = message;
  element.className = `message ${type}`;
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      element.textContent = '';
      element.className = 'message';
    }, 5000);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

// Check API Status
async function checkAPIStatus() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/employees`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      apiStatus.textContent = '✓ API Connected';
      apiStatus.className = 'api-status connected';
      statusBadge.textContent = 'Connected';
      statusBadge.className = 'stat-value status-badge connected';
      return true;
    }
  } catch (error) {
    console.error('API Status Check Failed:', error);
  }
  
  apiStatus.textContent = '✗ API Disconnected';
  apiStatus.className = 'api-status disconnected';
  statusBadge.textContent = 'Offline';
  statusBadge.className = 'stat-value status-badge disconnected';
  return false;
}

// Tab Navigation
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
    
    if (tabId === 'view') {
      loadEmployees();
    }
  });
});

// Load All Employees
async function loadEmployees() {
  if (isLoading) return;
  isLoading = true;
  
  try {
    employeesList.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading employees...</p></div>';
    
    const result = await api.getEmployees();
    
    if (result.success && result.data) {
      displayEmployees(result.data);
      totalCount.textContent = result.data.length;
      showToast(`Loaded ${result.data.length} employee(s)`, 'success');
    } else {
      throw new Error(result.message || 'Failed to load employees');
    }
  } catch (error) {
    console.error('Error loading employees:', error);
    employeesList.innerHTML = `
      <div class="error-box">
        <p>❌ Error loading employees</p>
        <p class="error-details">${error.message}</p>
        <button class="btn btn-secondary" onclick="loadEmployees()">Retry</button>
      </div>
    `;
    showToast('Failed to load employees', 'error');
  } finally {
    isLoading = false;
  }
}

// Display Employees
function displayEmployees(employees) {
  if (!employees || employees.length === 0) {
    employeesList.innerHTML = '<div class="info-box"><p>📭 No employees found</p></div>';
    return;
  }
  
  employeesList.innerHTML = employees.map(employee => `
    <div class="employee-card" data-id="${employee.EmployeeId}">
      <div class="employee-header">
        <h3 title="${escapeHtml(employee.Name)}">${escapeHtml(employee.Name)}</h3>
        <span class="status-badge active">Active</span>
      </div>
      
      <div class="employee-info">
        <div class="info-row">
          <span class="info-label">📧</span>
          <span class="info-value" title="${escapeHtml(employee.Email)}">${escapeHtml(employee.Email)}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">🏢</span>
          <span class="department-badge">${escapeHtml(employee.Department)}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">💼</span>
          <span class="info-value">${escapeHtml(employee.Position)}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">💰</span>
          <span class="info-value">${formatCurrency(employee.Salary)}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">📅</span>
          <span class="info-value">${formatDate(employee.JoinDate)}</span>
        </div>
      </div>
      
      <div class="employee-actions">
        <button class="btn-edit" onclick="openEditModal('${employee.EmployeeId}')" title="Edit employee">
          ✏️ Edit
        </button>
        <button class="btn-delete" onclick="openDeleteModal('${employee.EmployeeId}', '${escapeHtml(employee.Name)}', '${escapeHtml(employee.Email)}')" title="Delete employee">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Add Employee
addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (isLoading) return;
  isLoading = true;
  
  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    department: document.getElementById('department').value,
    position: document.getElementById('position').value.trim(),
    salary: parseInt(document.getElementById('salary').value) || 0,
    joinDate: document.getElementById('joinDate').value || new Date().toISOString().split('T')[0]
  };
  
  const addMessage = document.getElementById('addMessage');
  
  try {
    const submitBtn = document.getElementById('addSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Adding...';
    
    const result = await api.createEmployee(formData);
    
    if (result.success) {
      showMessage(addMessage, `✓ ${result.message}`, 'success');
      showToast(`Employee ${formData.name} added successfully!`, 'success');
      addForm.reset();
      
      setTimeout(() => {
        loadEmployees();
        document.querySelector('[data-tab="view"]').click();
      }, 1500);
    } else {
      throw new Error(result.message || 'Failed to add employee');
    }
  } catch (error) {
    console.error('Error adding employee:', error);
    showMessage(addMessage, `❌ Error: ${error.message}`, 'error');
    showToast('Failed to add employee', 'error');
  } finally {
    isLoading = false;
    const submitBtn = document.getElementById('addSubmitBtn');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '✓ Add Employee';
  }
});

// Open Edit Modal
async function openEditModal(id) {
  try {
    const result = await api.getEmployee(id);
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to load employee');
    }
    
    const employee = result.data;
    
    document.getElementById('editId').value = employee.EmployeeId;
    document.getElementById('editName').value = employee.Name;
    document.getElementById('editEmail').value = employee.Email;
    document.getElementById('editDepartment').value = employee.Department;
    document.getElementById('editPosition').value = employee.Position;
    document.getElementById('editSalary').value = employee.Salary;
    document.getElementById('editJoinDate').value = employee.JoinDate;
    
    editModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } catch (error) {
    showToast(`Error loading employee: ${error.message}`, 'error');
  }
}

// Close Edit Modal
function closeEditModal() {
  editModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
  document.getElementById('editMessage').textContent = '';
}

modalClose.addEventListener('click', closeEditModal);
modalOverlay.addEventListener('click', closeEditModal);

// Edit Form Submit
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (isLoading) return;
  isLoading = true;
  
  const id = document.getElementById('editId').value;
  const formData = {
    name: document.getElementById('editName').value.trim(),
    email: document.getElementById('editEmail').value.trim(),
    department: document.getElementById('editDepartment').value,
    position: document.getElementById('editPosition').value.trim(),
    salary: parseInt(document.getElementById('editSalary').value) || 0,
    joinDate: document.getElementById('editJoinDate').value
  };
  
  const editMessage = document.getElementById('editMessage');
  
  try {
    const submitBtn = document.getElementById('editSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Saving...';
    
    const result = await api.updateEmployee(id, formData);
    
    if (result.success) {
      showMessage(editMessage, `✓ ${result.message}`, 'success');
      showToast('Employee updated successfully!', 'success');
      
      setTimeout(() => {
        closeEditModal();
        loadEmployees();
      }, 1500);
    } else {
      throw new Error(result.message || 'Failed to update employee');
    }
  } catch (error) {
    console.error('Error updating employee:', error);
    showMessage(editMessage, `❌ Error: ${error.message}`, 'error');
    showToast('Failed to update employee', 'error');
  } finally {
    isLoading = false;
    const submitBtn = document.getElementById('editSubmitBtn');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '✓ Save Changes';
  }
});

// Open Delete Modal
function openDeleteModal(id, name, email) {
  currentDeleteId = id;
  currentDeleteName = name;
  currentDeleteEmail = email;
  document.getElementById('deleteEmployeeName').textContent = name;
  document.getElementById('deleteEmployeeEmail').textContent = email;
  deleteModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// Close Delete Modal
function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
  currentDeleteId = null;
  currentDeleteName = null;
  currentDeleteEmail = null;
}

cancelDelete.addEventListener('click', closeDeleteModal);
deleteModalOverlay.addEventListener('click', closeDeleteModal);

// Confirm Delete
confirmDelete.addEventListener('click', async () => {
  if (!currentDeleteId || isLoading) return;
  isLoading = true;
  
  try {
    const confirmBtn = document.getElementById('confirmDelete');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '⏳ Deleting...';
    
    const result = await api.deleteEmployee(currentDeleteId);
    
    if (result.success) {
      showToast(`Employee "${currentDeleteName}" deleted successfully!`, 'success');
      closeDeleteModal();
      loadEmployees();
    } else {
      throw new Error(result.message || 'Failed to delete employee');
    }
  } catch (error) {
    console.error('Error deleting employee:', error);
    showToast(`Error: ${error.message}`, 'error');
  } finally {
    isLoading = false;
    const confirmBtn = document.getElementById('confirmDelete');
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = 'Delete Employee';
  }
});

// Search Employees
searchBtn.addEventListener('click', async () => {
  const query = searchInput.value.trim();
  
  if (!query) {
    searchResults.innerHTML = '<div class="info-box"><p>👉 Enter search query above</p></div>';
    return;
  }
  
  if (isLoading) return;
  isLoading = true;
  
  try {
    searchResults.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Searching...</p></div>';
    
    const result = await api.searchEmployees(query);
    
    if (result.success && result.data) {
      if (result.data.length === 0) {
        searchResults.innerHTML = `<div class="info-box"><p>🔍 No employees found matching "${escapeHtml(query)}"</p></div>`;
      } else {
        displayEmployees(result.data);
        searchResults.innerHTML = employeesList.innerHTML;
        showToast(`Found ${result.data.length} employee(s)`, 'success');
      }
    } else {
      throw new Error(result.message || 'Search failed');
    }
  } catch (error) {
    console.error('Error searching employees:', error);
    searchResults.innerHTML = `
      <div class="error-box">
        <p>❌ Error searching employees</p>
        <p class="error-details">${error.message}</p>
      </div>
    `;
    showToast('Failed to search employees', 'error');
  } finally {
    isLoading = false;
  }
});

// Clear Search
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchResults.innerHTML = '<div class="info-box"><p>👉 Enter search query above</p></div>';
  searchInput.focus();
});

// Refresh Button
refreshBtn.addEventListener('click', loadEmployees);

// Search on Enter
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// Initialize on page load
window.addEventListener('load', async () => {
  console.log('Employee Portal Loaded');
  console.log('API Endpoint:', API_CONFIG.BASE_URL);
  
  // Check API status
  await checkAPIStatus();
  
  // Load employees
  loadEmployees();
  
  // Check API status every 30 seconds
  setInterval(checkAPIStatus, 30000);
});

// Handle beforeunload
window.addEventListener('beforeunload', () => {
  document.body.style.overflow = 'auto';
});
