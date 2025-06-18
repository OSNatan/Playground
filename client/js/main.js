// main.js - Main functionality for the home page

document.addEventListener('DOMContentLoaded', function() {
    const user = getLoggedInUser();
    const userContent = document.getElementById('userContent');
    
    if (user && userContent) {
        userContent.classList.remove('hidden');
        loadUserReservations();
    }
});
