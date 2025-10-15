// Global variables
let currentUser = null;
let currentPage = 1;
let currentFilters = {};

// API base URL
const API_BASE = '/api';

// Authentication functions
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            showAdminPanel();
            loadDashboard();
        } else {
            showError('loginError', data.error || 'Login failed');
        }
    } catch (error) {
        showError('loginError', 'Network error. Please try again.');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    showLoginScreen();
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
}

function showAdminPanel() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('[id$="Section"]').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}Section`).classList.remove('hidden');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('border-blue-500', 'bg-blue-50');
    });
    event.target.classList.add('border-blue-500', 'bg-blue-50');
}

// Dashboard functions
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/dashboard/overview`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            updateDashboardStats(data);
        } else {
            console.error('Failed to load dashboard data');
        }
    } catch (error) {
        console.error('Dashboard loading error:', error);
    }
}

function updateDashboardStats(data) {
    document.getElementById('totalUsers').textContent = data.overview.totalUsers;
    document.getElementById('activeUsers').textContent = data.overview.activeUsers;
    document.getElementById('subscribedUsers').textContent = data.overview.subscribedUsers;
    document.getElementById('inactiveUsers').textContent = data.overview.inactiveUsers;

    // Update subscription breakdown
    const subscriptionBreakdown = document.getElementById('subscriptionBreakdown');
    subscriptionBreakdown.innerHTML = '';
    
    data.subscriptions.breakdown.forEach(item => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center';
        div.innerHTML = `
            <span class="text-gray-600 capitalize">${item._id || 'No Plan'}</span>
            <span class="font-semibold">${item.count}</span>
        `;
        subscriptionBreakdown.appendChild(div);
    });

    // Update recent users
    const recentUsers = document.getElementById('recentUsers');
    recentUsers.innerHTML = '';
    
    data.recentUsers.forEach(user => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0';
        div.innerHTML = `
            <div>
                <p class="font-medium text-gray-900">${user.name}</p>
                <p class="text-sm text-gray-500">${user.email}</p>
            </div>
            <div class="text-right">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                }">
                    ${user.role}
                </span>
                <p class="text-xs text-gray-500 mt-1">
                    ${new Date(user.createdAt).toLocaleDateString()}
                </p>
            </div>
        `;
        recentUsers.appendChild(div);
    });
}

// User management functions
async function loadUsers(page = 1) {
    try {
        const params = new URLSearchParams({
            page: page,
            limit: 50,
            ...currentFilters
        });

        const response = await fetch(`${API_BASE}/users?${params}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            updateUsersTable(data.users);
            updatePagination(data.pagination);
            currentPage = page;
        } else {
            console.error('Failed to load users');
        }
    } catch (error) {
        console.error('Users loading error:', error);
    }
}

function updateUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div>
                    <div class="text-sm font-medium text-gray-900">${user.name}</div>
                    <div class="text-sm text-gray-500">${user.email}</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                }">
                    ${user.role}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div>
                    <div class="text-sm text-gray-900 capitalize">${user.subscriptionPlan || 'No Plan'}</div>
                    <div class="text-sm text-gray-500">${user.subscriptionStatus || 'No Status'}</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="editUser('${user._id}')" class="text-blue-600 hover:text-blue-900">Edit</button>
                    <button onclick="resetUserPassword('${user._id}')" class="text-yellow-600 hover:text-yellow-900">Reset</button>
                    ${user.role !== 'super_admin' ? `<button onclick="deleteUser('${user._id}')" class="text-red-600 hover:text-red-900">Delete</button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updatePagination(pagination) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    if (pagination.pages <= 1) return;

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50';
    prevButton.disabled = pagination.page === 1;
    prevButton.onclick = () => loadUsers(pagination.page - 1);
    paginationDiv.appendChild(prevButton);

    for (let i = 1; i <= pagination.pages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = `px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 ${
            i === pagination.page ? 'bg-blue-500 text-white' : ''
        }`;
        button.onclick = () => loadUsers(i);
        paginationDiv.appendChild(button);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50';
    nextButton.disabled = pagination.page === pagination.pages;
    nextButton.onclick = () => loadUsers(pagination.page + 1);
    paginationDiv.appendChild(nextButton);
}

// User actions
async function editUser(userId) {
    // This would open an edit modal - simplified for now
    const newRole = prompt('Enter new role (user/admin/super_admin):');
    if (newRole && ['user', 'admin', 'super_admin'].includes(newRole)) {
        try {
            const response = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                loadUsers(currentPage);
                alert('User updated successfully');
            } else {
                alert('Failed to update user');
            }
        } catch (error) {
            alert('Error updating user');
        }
    }
}

async function resetUserPassword(userId) {
    const newPassword = prompt('Enter new password:');
    if (newPassword && newPassword.length >= 6) {
        try {
            const response = await fetch(`${API_BASE}/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ newPassword })
            });

            if (response.ok) {
                alert('Password reset successfully');
            } else {
                alert('Failed to reset password');
            }
        } catch (error) {
            alert('Error resetting password');
        }
    }
}

async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                loadUsers(currentPage);
                alert('User deleted successfully');
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            alert('Error deleting user');
        }
    }
}

// Add user functions
function showAddUserModal() {
    document.getElementById('addUserModal').classList.remove('hidden');
}

function hideAddUserModal() {
    document.getElementById('addUserModal').classList.add('hidden');
    document.getElementById('addUserForm').reset();
}

async function addUser(userData) {
    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            hideAddUserModal();
            loadUsers(currentPage);
            alert('User added successfully');
        } else {
            alert(data.error || 'Failed to add user');
        }
    } catch (error) {
        alert('Error adding user');
    }
}

// Filter functions
function applyFilters() {
    currentFilters = {
        search: document.getElementById('searchUsers').value,
        role: document.getElementById('filterRole').value,
        status: document.getElementById('filterStatus').value,
        subscription: document.getElementById('filterSubscription').value
    };
    
    // Remove empty filters
    Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key] === '') {
            delete currentFilters[key];
        }
    });
    
    loadUsers(1);
}

// Utility functions
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.remove('hidden');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        showAdminPanel();
        loadDashboard();
    } else {
        showLoginScreen();
    }

    // Login form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });

    // Add user form
    document.getElementById('addUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const userData = {
            name: document.getElementById('newUserName').value,
            email: document.getElementById('newUserEmail').value,
            password: document.getElementById('newUserPassword').value,
            role: document.getElementById('newUserRole').value,
            subscriptionPlan: document.getElementById('newUserSubscription').value || null
        };
        addUser(userData);
    });

    // Filter event listeners
    document.getElementById('searchUsers').addEventListener('input', applyFilters);
    document.getElementById('filterRole').addEventListener('change', applyFilters);
    document.getElementById('filterStatus').addEventListener('change', applyFilters);
    document.getElementById('filterSubscription').addEventListener('change', applyFilters);

    // Load users when users section is shown
    document.querySelector('[onclick="showSection(\'users\')"]').addEventListener('click', function() {
        setTimeout(() => loadUsers(), 100);
    });
});
