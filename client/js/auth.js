// auth.js - Authentication and user management
const API_BASE_URL = 'http://localhost:8080/api';
axios.defaults.withCredentials = true;


document.addEventListener('DOMContentLoaded', function() {
    // Setup navigation based on auth state
    updateNavigation();
    
    // Setup login form
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup registration form
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Setup form toggle buttons
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('registerForm').classList.remove('hidden');
        });
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
        });
    }
    
    // Setup logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Show user's reservations if on home page
    const userContent = document.getElementById('userContent');
    if (userContent && getLoggedInUser()) {
        userContent.classList.remove('hidden');
        loadUserReservations();
    }
});

function setupAxiosInterceptors() {
    axios.interceptors.request.use(config => {
        const user = getLoggedInUser();
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    });
}

function updateNavigation() {
    const user = getLoggedInUser();
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.getElementById('loginLink');
    
    if (user) {
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (loginLink) loginLink.classList.add('hidden');
    } else {
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (loginLink) loginLink.classList.remove('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    axios.post(`${API_BASE_URL}/users/login`, { username, password })
        .then(response => {
            localStorage.setItem('user', JSON.stringify(response.data));
            window.location.href = 'index.html';
        })
        .catch(() => {
            const loginError = document.getElementById('loginError');
            if (loginError) {
                loginError.textContent = 'Invalid username or password';
                loginError.classList.remove('hidden');
            }
        });
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    axios.post(`${API_BASE_URL}/users/register`, { username, email, password })
        .then(() => {
            alert('Registration successful! Please login.');
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('username').value = username;
        })
        .catch(() => {
            const registerError = document.getElementById('registerError');
            if (registerError) {
                registerError.textContent = 'Registration failed. Please try again.';
                registerError.classList.remove('hidden');
            }
        });
}

function handleLogout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function loadUserReservations() {
    const user = getLoggedInUser();
    if (!user) return;
    
    const container = document.getElementById('userReservations');
    if (!container) return;
    
    axios.get(`${API_BASE_URL}/reservations/user/${user.id}`)
        .then(response => {
            const reservations = response.data;
            
            if (reservations && reservations.length > 0) {
                container.innerHTML = '';
                reservations.forEach(res => {
                    const card = document.createElement('div');
                    card.className = 'bg-white p-4 rounded shadow';
                    card.innerHTML = `
                        <div class="font-bold">${formatDate(res.date)}</div>
                        <div>${formatTime(res.startTime)} - ${formatTime(res.endTime)}</div>
                        <button onclick="cancelReservation(${res.id})" class="text-red-600 text-sm mt-2">Cancel</button>
                    `;
                    container.appendChild(card);
                });
            }
        });
}

function cancelReservation(id) {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    
    axios.delete(`${API_BASE_URL}/reservations/${id}`)
        .then(() => {
            alert('Reservation cancelled');
            loadUserReservations();
        })
        .catch(() => alert('Failed to cancel reservation'));
}

function getLoggedInUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function formatTime(time) {
    return time.substring(0, 5);
}
