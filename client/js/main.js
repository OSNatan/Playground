// main.js - Main functionality for the home page

document.addEventListener('DOMContentLoaded', function() {
    const user = getLoggedInUser();
    const userContent = document.getElementById('userContent');

    if (user && userContent) {
        userContent.classList.remove('hidden');
        loadUserReservations();
    }

    // Make the features section responsive
    window.addEventListener('resize', adjustFeaturesLayout);
    adjustFeaturesLayout();
});

function adjustFeaturesLayout() {
    const featuresSection = document.querySelector('.container > div[style*="grid-template-columns"]');
    if (featuresSection) {
        if (window.innerWidth < 768) {
            featuresSection.style.gridTemplateColumns = '1fr';
        } else {
            featuresSection.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
    }

    // Make the hero section responsive
    const heroSection = document.querySelector('.card > div[style*="display: flex"]');
    if (heroSection) {
        if (window.innerWidth < 768) {
            heroSection.style.flexDirection = 'column';
            const contentDiv = heroSection.querySelector('div[style*="flex: 1; padding-right"]');
            if (contentDiv) {
                contentDiv.style.paddingRight = '0';
                contentDiv.style.marginBottom = '1.5rem';
            }
        } else {
            heroSection.style.flexDirection = 'row';
            const contentDiv = heroSection.querySelector('div[style*="flex: 1"]');
            if (contentDiv) {
                contentDiv.style.paddingRight = '1rem';
                contentDiv.style.marginBottom = '0';
            }
        }
    }
}

function loadUserReservations() {
    const user = getLoggedInUser();
    if (!user) return;

    const container = document.getElementById('userReservations');
    const noReservationsMsg = document.getElementById('noReservations');

    if (!container) return;

    axios.get(`http://localhost:8080/api/reservations/user/${user.id}`)
        .then(response => {
            const reservations = response.data;

            if (reservations && reservations.length > 0) {
                noReservationsMsg.style.display = 'none';

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
            } else {
                noReservationsMsg.style.display = 'block';
            }
        })
        .catch(error => {
            console.error("Failed to load reservations", error);
            noReservationsMsg.textContent = "Failed to load your reservations. Please try again later.";
            noReservationsMsg.style.display = 'block';
        });
}

function cancelReservation(id) {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    axios.delete(`http://localhost:8080/api/reservations/${id}`)
        .then(() => {
            alert('Reservation cancelled successfully');
            loadUserReservations();
        })
        .catch(error => {
            console.error("Failed to cancel reservation", error);
            alert('Failed to cancel reservation. Please try again later.');
        });
}
