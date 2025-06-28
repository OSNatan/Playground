// auth.js - Authentication and user management
const API_BASE_URL = 'http://localhost:8080/api';

// Set up axios interceptor to add the JWT token to all requests
axios.interceptors.request.use(
    config => {
        const user = getLoggedInUser();
        if (user) {
            // Check for token in different possible locations
            const token = user.token || user.accessToken || user.jwt;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log("Added Authorization header:", config.headers.Authorization);
            } else {
                console.warn("User found but no token available:", user);
            }
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

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

    // Add user info to navigation if logged in
    addUserInfoToNav();
});

// Add user info to navigation
function addUserInfoToNav() {
    const user = getLoggedInUser();
    const navContainer = document.querySelector('nav .container');
    const navLinks = document.getElementById('navLinks');
    const loginLink = document.getElementById('loginLink');

    if (user && navContainer && navLinks) {
        // Add user info to navigation if not already present
        if (!document.getElementById('welcome-message')) {
            // Create welcome message in the middle
            const welcomeMessage = document.createElement('span');
            welcomeMessage.id = 'welcome-message';
            welcomeMessage.style.color = 'white';
            welcomeMessage.innerHTML = `Welcome, <strong>${user.username}</strong>!`;

            // Insert it in the middle of the navbar
            navContainer.insertBefore(welcomeMessage, navLinks);

            // Center the welcome message
            navContainer.style.justifyContent = 'space-between';
            welcomeMessage.style.flexGrow = '1';
            welcomeMessage.style.textAlign = 'center';
        }
    }
}

// Update navigation based on auth state
function updateNavigation() {
    const user = getLoggedInUser();
    const navContainer = document.querySelector('nav .container');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.getElementById('loginLink');

    if (user) {
        // Show logout button and hide login link
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (loginLink) loginLink.style.display = 'none';

        // Add welcome message if not already present
        addUserInfoToNav();
    } else {
        // Hide logout button and show login link
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (loginLink) loginLink.style.display = 'inline-block';

        // Remove welcome message if it exists
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        // Reset navbar container style
        if (navContainer) {
            navContainer.style.justifyContent = 'space-between';
        }
    }
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');

    // Clear previous error
    if (loginError) {
        loginError.textContent = '';
        loginError.classList.add('hidden');
    }

    // Validate input
    if (!username || !password) {
        if (loginError) {
            loginError.textContent = 'Please enter both username and password';
            loginError.classList.remove('hidden');
        }
        return;
    }

    // Send login request
    axios.post(`${API_BASE_URL}/users/login`, { username, password })
        .then(response => {
            localStorage.setItem('user', JSON.stringify(response.data));
            window.location.href = 'index.html';
        })
        .catch(error => {
            if (loginError) {
                loginError.textContent = 'Invalid username or password';
                loginError.classList.remove('hidden');
            }
            console.error('Login failed:', error);
        });
}

// Handle registration form submission
function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const registerError = document.getElementById('registerError');
    const usernameError = document.getElementById('usernameError');
    const emailError = document.getElementById('emailError');

    // Clear previous errors
    if (registerError) {
        registerError.textContent = '';
        registerError.classList.add('hidden');
    }
    if (usernameError) {
        usernameError.textContent = '';
        usernameError.classList.add('hidden');
    }
    if (emailError) {
        emailError.textContent = '';
        emailError.classList.add('hidden');
    }

    // Validate input
    let isValid = true;
    if (!username) {
        if (usernameError) {
            usernameError.textContent = 'Username is required';
            usernameError.classList.remove('hidden');
        }
        isValid = false;
    }
    if (!email) {
        if (emailError) {
            emailError.textContent = 'Email is required';
            emailError.classList.remove('hidden');
        }
        isValid = false;
    }
    if (!password) {
        if (registerError) {
            registerError.textContent = 'Password is required';
            registerError.classList.remove('hidden');
        }
        isValid = false;
    }
    if (!isValid) return;

    // Send registration request
    axios.post(`${API_BASE_URL}/users/register`, { username, email, password })
        .then(() => {
            alert('Registration successful! Please login.');
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('username').value = username;
        })
        .catch(error => {
            console.error('Registration failed:', error);

            // Check for specific error messages
            if (error.response && error.response.data) {
                const errorMessage = error.response.data;

                if (errorMessage.includes('Username is already taken')) {
                    if (usernameError) {
                        usernameError.textContent = 'Username is already taken';
                        usernameError.classList.remove('hidden');
                    }
                } else if (errorMessage.includes('Email is already in use')) {
                    if (emailError) {
                        emailError.textContent = 'Email is already in use';
                        emailError.classList.remove('hidden');
                    }
                } else {
                    if (registerError) {
                        registerError.textContent = errorMessage || 'Registration failed. Please try again.';
                        registerError.classList.remove('hidden');
                    }
                }
            } else {
                if (registerError) {
                    registerError.textContent = 'Registration failed. Please try again.';
                    registerError.classList.remove('hidden');
                }
            }
        });
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Load user's reservations on the home page
function loadUserReservations() {
    const user = getLoggedInUser();
    if (!user) return;

    const container = document.getElementById('userReservations');
    const noReservationsMsg = document.getElementById('noReservations');
    if (!container) return;

    axios.get(`${API_BASE_URL}/reservations/user/${user.id}`)
        .then(response => {
            const reservations = response.data;

            if (reservations && reservations.length > 0) {
                if (noReservationsMsg) {
                    noReservationsMsg.style.display = 'none';
                }

                // Clear existing reservations
                const existingReservations = container.querySelectorAll('.reservation-card');
                existingReservations.forEach(card => card.remove());

                // Add new reservations
                reservations.forEach(res => {
                    const card = document.createElement('div');
                    card.className = 'reservation-card card';
                    card.style.marginBottom = '1rem';
                    card.style.padding = '1rem';

                    // Convert slot number to time range
                    let timeRange;
                    switch(res.slotNumber) {
                        case 0:
                            timeRange = "8:00 - 12:00";
                            break;
                        case 1:
                            timeRange = "13:00 - 17:00";
                            break;
                        case 2:
                            timeRange = "18:00 - 22:00";
                            break;
                        default:
                            timeRange = "Unknown time";
                    }

                    const formattedDate = new Date(res.date).toLocaleDateString();

                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin-bottom: 0.5rem;">${formattedDate}</h4>
                                <p>${timeRange}</p>
                                <p>Theme: ${res.decorationStyle || 'Standard'}</p>
                                <p>Music: ${res.musicType || 'None'}</p>
                            </div>
                            <button class="button" style="background-color: #e53e3e;" onclick="cancelReservation(${res.id})">Cancel</button>
                        </div>
                    `;
                    container.appendChild(card);
                });
            } else if (noReservationsMsg) {
                noReservationsMsg.style.display = 'block';
            }
        })
        .catch(error => {
            console.error("Failed to load reservations", error);
            if (noReservationsMsg) {
                noReservationsMsg.textContent = "Failed to load your reservations. Please try again later.";
                noReservationsMsg.style.display = 'block';
            }
        });
}

// Cancel a reservation
function cancelReservation(id) {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    axios.delete(`${API_BASE_URL}/reservations/${id}`)
        .then(() => {
            alert('Reservation cancelled successfully');
            loadUserReservations();
        })
        .catch(error => {
            console.error("Failed to cancel reservation", error);
            alert('Failed to cancel reservation. Please try again later.');
        });
}

// Get the logged-in user from localStorage
function getLoggedInUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

// Format a date string
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

// Format a time string
function formatTime(time) {
    if (!time) return '';
    return time.substring(0, 5);
}

// Make functions and variables globally available
window.cancelReservation = cancelReservation;
window.getLoggedInUser = getLoggedInUser;
window.API_BASE_URL = API_BASE_URL;
