// calendar.js - Custom calendar implementation with vanilla JavaScript

// Global variables
let currentDate = new Date();
let currentUser = null;
let selectedDate = null;
let selectedSlotNumber = null;
let reservations = [];

// Function to check if calendar is visible and render it if needed
function checkAndRenderCalendar() {
    console.log("Checking if calendar needs to be rendered...");

    const calendarDays = document.getElementById("calendarDays");
    if (!calendarDays) {
        console.error("Calendar days container not found");
        return;
    }

    // Check if calendar has any day cells (excluding the loading indicator)
    const dayCells = calendarDays.querySelectorAll(".calendar-day");
    if (dayCells.length === 0) {
        console.log("No calendar day cells found, rendering calendar...");
        renderCalendar();
    } else {
        console.log(`Found ${dayCells.length} calendar day cells, calendar is already rendered`);
    }
}

// Initialize the calendar when the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded, initializing calendar...");

    try {
        // Set up event listeners
        const prevMonthBtn = document.getElementById("prevMonth");
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener("click", previousMonth);
        } else {
            console.error("Element with ID 'prevMonth' not found");
        }

        const nextMonthBtn = document.getElementById("nextMonth");
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener("click", nextMonth);
        } else {
            console.error("Element with ID 'nextMonth' not found");
        }

        const confirmBookingBtn = document.getElementById("confirmBooking");
        if (confirmBookingBtn) {
            confirmBookingBtn.addEventListener("click", makeReservation);
        } else {
            console.error("Element with ID 'confirmBooking' not found");
        }

        const cancelBookingBtn = document.getElementById("cancelBooking");
        if (cancelBookingBtn) {
            cancelBookingBtn.addEventListener("click", closeReservationModal);
        } else {
            console.error("Element with ID 'cancelBooking' not found");
        }

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", handleLogout);
        } else {
            console.error("Element with ID 'logoutBtn' not found");
        }

        // Make the calendar responsive
        window.addEventListener("resize", adjustCalendarLayout);

        // Fetch user info
        console.log("Fetching user info...");
        fetchUserInfo();

        // Render the calendar
        console.log("Rendering calendar...");
        renderCalendar();

        // Adjust layout for mobile devices
        console.log("Adjusting layout for mobile devices...");
        adjustCalendarLayout();

        // Set up a check to ensure calendar is rendered after a short delay
        setTimeout(checkAndRenderCalendar, 1000);

        // Set up periodic checks to ensure calendar is rendered
        setInterval(checkAndRenderCalendar, 5000);

        // Add a visibility change listener to re-render calendar if needed when tab becomes visible
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                console.log("Page became visible, checking calendar...");
                checkAndRenderCalendar();
            }
        });

        // Add a scroll event listener to check if calendar is in view
        window.addEventListener('scroll', function() {
            const calendarElement = document.getElementById('calendar');
            if (calendarElement && isElementInViewport(calendarElement)) {
                console.log("Calendar is in viewport, checking if it needs to be rendered...");
                checkAndRenderCalendar();
            }
        });

        console.log("Calendar initialization complete");
    } catch (error) {
        console.error("Error initializing calendar:", error);

        // Try to recover by rendering the calendar again after a delay
        setTimeout(() => {
            console.log("Attempting to recover from initialization error...");
            try {
                renderCalendar();
            } catch (retryError) {
                console.error("Failed to recover from initialization error:", retryError);
            }
        }, 2000);
    }
});

// Check if an element is in the viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Fetch the current user's information
async function fetchUserInfo() {
    try {
        const user = getLoggedInUser();
        if (user && user.token) {
            const response = await axios.get(`${window.API_BASE_URL}/users/me`);
            currentUser = response.data;
            updateUserUI();
            loadUserReservations();
        }
    } catch (error) {
        console.error("User not logged in or token expired", error);
        currentUser = null;
        updateUserUI();
    }
}

// Update the UI based on the user's login status
function updateUserUI() {
    const navContainer = document.querySelector("nav .container");
    const navLinks = document.getElementById("navLinks");
    const loginLink = document.getElementById("loginLink");
    const logoutBtn = document.getElementById("logoutBtn");
    const userReservationsContainer = document.getElementById("userReservationsContainer");

    if (currentUser) {
        // Add welcome message in the middle of the navbar
        if (!document.getElementById("welcome-message")) {
            const welcomeMessage = document.createElement("span");
            welcomeMessage.id = "welcome-message";
            welcomeMessage.style.color = "white";
            welcomeMessage.innerHTML = `Welcome, <strong>${currentUser.username}</strong>`;

            // Insert it in the middle of the navbar
            navContainer.insertBefore(welcomeMessage, navLinks);

            // Center the welcome message
            navContainer.style.justifyContent = "space-between";
            welcomeMessage.style.flexGrow = "1";
            welcomeMessage.style.textAlign = "center";
        } else {
            // Update existing welcome message
            document.getElementById("welcome-message").innerHTML = `Welcome, <strong>${currentUser.username}</strong>`;
        }

        loginLink.style.display = "none";
        logoutBtn.classList.remove("hidden");
        userReservationsContainer.classList.remove("hidden");
    } else {
        // Remove welcome message if it exists
        const welcomeMessage = document.getElementById("welcome-message");
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        loginLink.style.display = "inline-block";
        logoutBtn.classList.add("hidden");
        userReservationsContainer.classList.add("hidden");
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('user');
    location.reload();
}

// Render the calendar for the current month - Simplified approach
function renderCalendar() {
    try {
        console.clear(); // Clear console for better debugging
        console.log("%c CALENDAR RENDERING STARTED ", "background: #5a2c82; color: white; padding: 4px; border-radius: 4px;");

        // Get current year and month
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Update month display
        const currentMonthElement = document.getElementById("currentMonth");
        if (currentMonthElement) {
            currentMonthElement.textContent = `${monthNames[month]} ${year}`;
            console.log(`Set month display to: ${monthNames[month]} ${year}`);
        } else {
            console.error("Month display element not found");
        }

        // Get calendar container
        const calendarDays = document.getElementById("calendarDays");
        if (!calendarDays) {
            console.error("Calendar container not found");
            return;
        }

        // Clear any existing content
        calendarDays.innerHTML = "";
        console.log("Cleared calendar container");

        // Explicitly set grid layout styles
        calendarDays.style.display = "grid";
        calendarDays.style.gridTemplateColumns = "repeat(7, 1fr)";
        calendarDays.style.gap = "8px";
        calendarDays.style.width = "100%";
        calendarDays.style.minHeight = "600px";
        console.log("Applied grid layout styles to calendar container");

        // Calculate days in month and first day of month
        const firstDay = new Date(year, month, 1);
        const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();
        console.log(`Month has ${totalDays} days, starting on day ${startingDay} of week`);

        // Create a direct HTML string for better performance
        let calendarHTML = '';

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += `<div class="calendar-day" style="background-color: #f8f9fa; border: 1px dashed #e0e0e0; border-radius: 4px; min-height: 120px;"></div>`;
        }
        console.log(`Added ${startingDay} empty cells`);

        // Get current date for highlighting today
        const currentDateObj = new Date();
        const isCurrentMonth = (year === currentDateObj.getFullYear() && month === currentDateObj.getMonth());
        const today = currentDateObj.getDate();

        // Add cells for each day of the month
        for (let day = 1; day <= totalDays; day++) {
            // Check if this is today
            const isToday = isCurrentMonth && day === today;
            const todayClass = isToday ? 'today' : '';
            const todayStyle = isToday ? 'background-color: rgba(124, 58, 237, 0.1); border: 2px solid rgba(124, 58, 237, 0.5);' : '';

            // Format the date string for the slots
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Create the day cell with its slots
            calendarHTML += `
                <div class="calendar-day ${todayClass}" style="border: 1px solid #ddd; padding: 8px; min-height: 120px; background-color: #fff; border-radius: 4px; ${todayStyle}">
                    <div class="calendar-day-number" style="font-weight: bold; margin-bottom: 8px; font-size: 1.1rem; color: #5a2c82;">${day}</div>

                    <!-- Morning slot (8-12) -->
                    <div class="calendar-event available" 
                         data-date="${dateString}" 
                         data-slot-number="0" 
                         style="background-color: rgba(74, 222, 128, 0.2); border: 1px solid rgb(34, 197, 94); color: rgb(22, 101, 52); padding: 8px; border-radius: 4px; margin-bottom: 8px; cursor: pointer; text-align: center; font-weight: 500; display: block; width: 100%;">
                        8:00 - 12:00
                    </div>

                    <!-- Afternoon slot (13-17) -->
                    <div class="calendar-event available" 
                         data-date="${dateString}" 
                         data-slot-number="1" 
                         style="background-color: rgba(74, 222, 128, 0.2); border: 1px solid rgb(34, 197, 94); color: rgb(22, 101, 52); padding: 8px; border-radius: 4px; margin-bottom: 8px; cursor: pointer; text-align: center; font-weight: 500; display: block; width: 100%;">
                        13:00 - 17:00
                    </div>

                    <!-- Evening slot (18-22) -->
                    <div class="calendar-event available" 
                         data-date="${dateString}" 
                         data-slot-number="2" 
                         style="background-color: rgba(74, 222, 128, 0.2); border: 1px solid rgb(34, 197, 94); color: rgb(22, 101, 52); padding: 8px; border-radius: 4px; margin-bottom: 8px; cursor: pointer; text-align: center; font-weight: 500; display: block; width: 100%;">
                        18:00 - 22:00
                    </div>
                </div>
            `;
        }
        console.log(`Added ${totalDays} day cells with time slots`);

        // Log the HTML string for debugging (truncated for readability)
        console.log("Calendar HTML string (first 100 chars):", calendarHTML.substring(0, 100) + "...");

        // Set the HTML content
        calendarDays.innerHTML = calendarHTML;
        console.log("Calendar HTML has been set");

        // Force a reflow to ensure the browser renders the calendar
        void calendarDays.offsetHeight;

        // Add event listeners to all slots
        const slots = calendarDays.querySelectorAll(".calendar-event");
        slots.forEach(slot => {
            slot.addEventListener("click", function() {
                const date = this.dataset.date;
                const slotNumber = parseInt(this.dataset.slotNumber);
                const timeText = this.textContent.trim();

                console.log(`Slot clicked: date=${date}, slotNumber=${slotNumber}, timeText=${timeText}`);

                if (!currentUser) {
                    alert("Please log in to make a reservation.");
                    return;
                }

                if (slot.classList.contains("booked")) {
                    alert("This slot is already booked.");
                    return;
                }

                showReservationModal(date, slotNumber, timeText);
            });
        });
        console.log(`Added click listeners to ${slots.length} time slots`);

        // Load reservations to mark booked slots
        loadReservations();
        console.log("Calendar rendering complete, loading reservations...");

    } catch (error) {
        console.error("Error rendering calendar:", error);
        console.error("Error stack:", error.stack);

        // Display error message in the calendar container
        const calendarDays = document.getElementById("calendarDays");
        if (calendarDays) {
            calendarDays.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #e53e3e; grid-column: span 7;">
                    <p>Error rendering calendar: ${error.message}</p>
                    <p>Please try refreshing the page.</p>
                    <p>Technical details: ${error.stack ? error.stack.split('\n')[0] : 'No stack trace available'}</p>
                </div>
            `;
        }
    }
}

// Note: The createTimeSlot function has been removed as it's no longer needed.
// Time slots are now created directly in the renderCalendar function using HTML strings
// for better performance and reliability.

// Show the reservation modal
function showReservationModal(date, slotNumber, timeText) {
    const modal = document.getElementById("reservationForm");
    modal.classList.remove("hidden");

    // Store the selected date and slot
    selectedDate = date;
    selectedSlotNumber = slotNumber;

    // Update the form with the selected date and time
    document.getElementById("slotDate").value = date;
    document.getElementById("slotNumber").value = slotNumber;
    document.getElementById("displayDate").textContent = new Date(date).toLocaleDateString();
    document.getElementById("displayTime").textContent = timeText;

    // Show login prompt if not logged in
    const loginPrompt = document.getElementById("loginPrompt");
    if (!currentUser) {
        loginPrompt.classList.remove("hidden");
    } else {
        loginPrompt.classList.add("hidden");
    }
}

// Close the reservation modal
function closeReservationModal() {
    const modal = document.getElementById("reservationForm");
    modal.classList.add("hidden");
    selectedDate = null;
    selectedSlotNumber = null;
}

// Make a reservation
async function makeReservation() {
    if (!selectedDate || selectedSlotNumber === null || !currentUser) {
        alert("Please select a valid time slot and ensure you are logged in.");
        return;
    }

    // Log authentication status
    const user = getLoggedInUser();
    console.log("Current user from localStorage:", user);
    console.log("Current user from currentUser variable:", currentUser);

    if (!user) {
        alert("You must be logged in to make a reservation. Please log in and try again.");
        return;
    }

    // Check if token exists
    const token = user.token || user.accessToken || user.jwt;
    if (!token) {
        console.error("No authentication token found in user object:", user);
        alert("Authentication error: No token found. Please log out and log in again.");
        return;
    }

    const data = {
        date: selectedDate,
        slotNumber: parseInt(selectedSlotNumber),
        gender: document.querySelector('input[name="gender"]:checked').value,
        bringOwnFood: document.getElementById("bringOwnFood").checked,
        decorations: document.getElementById("decorationStyle").value,  // Changed from decorationStyle
        music: document.getElementById("musicType").value               // Changed from musicType
    };

    console.log("Making reservation with data:", data);

    try {
        // Add explicit headers for this request
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        console.log("Request config:", config);

        const response = await axios.post(`${window.API_BASE_URL}/reservations`, data, config);
        console.log("Reservation successful:", response);

        closeReservationModal();
        loadReservations();
        loadUserReservations();
        alert("Reservation successful!");
    } catch (error) {
        console.error("Failed to make reservation", error);
        console.error("Error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        alert("Failed to make reservation: " + (error.response?.data || error.message));
    }
}

// Load reservations for the current month
async function loadReservations() {
    try {
        console.log("Loading reservations...");
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Create start and end dates for the current month
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        // Format dates for API
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        console.log(`Fetching reservations for date range: ${formattedStartDate} to ${formattedEndDate}`);

        // Fetch reservations for the date range
        // Using a simple approach without date filtering for now
        const response = await axios.get(`${window.API_BASE_URL}/reservations`);
        console.log("Reservations response:", response.data);
        reservations = response.data;

        // Update the calendar with the reservations
        updateCalendarWithReservations();
    } catch (error) {
        console.error("Failed to load reservations", error);
        // Continue with empty reservations to at least show the calendar
        reservations = [];
        updateCalendarWithReservations();
    }
}

// Update the calendar with reservations - Simplified approach
function updateCalendarWithReservations() {
    try {
        console.log("Updating calendar with reservations using simplified approach...");
        console.log(`Total reservations to process: ${reservations ? reservations.length : 0}`);

        // Get all slot elements
        const slots = document.querySelectorAll(".calendar-event");
        console.log(`Found ${slots.length} calendar slots to update`);

        // If no slots found, the calendar might not be rendered yet
        if (slots.length === 0) {
            console.warn("No calendar slots found. Calendar may not be rendered properly.");
            console.log("Attempting to re-render the calendar...");
            setTimeout(renderCalendar, 100);
            return;
        }

        // Process each reservation
        if (reservations && reservations.length > 0) {
            // Create a map for quick lookup
            const reservationMap = {};

            // Build a map of reservations by date and slot number
            reservations.forEach(res => {
                if (!res.date) {
                    console.warn("Reservation missing date:", res);
                    return;
                }

                const date = typeof res.date === 'string' ? res.date.split('T')[0] : '';
                const slotNumber = res.slotNumber !== undefined ? res.slotNumber : null;

                if (!date || slotNumber === null) {
                    console.warn(`Invalid reservation data: date=${date}, slotNumber=${slotNumber}`);
                    return;
                }

                const key = `${date}-${slotNumber}`;
                reservationMap[key] = true;
                console.log(`Added reservation to map: ${key}`);
            });

            // Mark booked slots
            let bookedCount = 0;
            slots.forEach(slot => {
                const date = slot.dataset.date;
                const slotNumber = slot.dataset.slotNumber;

                if (!date || slotNumber === undefined) {
                    console.warn(`Slot missing date or slotNumber attributes:`, slot);
                    return;
                }

                const key = `${date}-${slotNumber}`;

                if (reservationMap[key]) {
                    // This slot is booked
                    bookedCount++;
                    console.log(`Marking slot as booked: ${key}`);

                    // Update class
                    slot.classList.remove("available");
                    slot.classList.add("booked");

                    // Update text
                    slot.textContent = slot.textContent.trim() + " (Booked)";

                    // Update styles
                    slot.style.backgroundColor = "rgba(252, 165, 165, 0.2)";
                    slot.style.border = "1px solid rgb(239, 68, 68)";
                    slot.style.color = "rgb(153, 27, 27)";
                }
            });

            console.log(`Marked ${bookedCount} slots as booked`);
        } else {
            console.log("No reservations to display, all slots remain available");
        }

        console.log("Calendar updated successfully with reservations");

    } catch (error) {
        console.error("Error updating calendar with reservations:", error);
        console.error("Error stack:", error.stack);

        // Try to recover by re-rendering the calendar
        console.log("Attempting to recover from error by re-rendering the calendar...");
        setTimeout(renderCalendar, 500);
    }
}

// Load user's reservations
async function loadUserReservations() {
    if (!currentUser) {
        console.log("No current user, skipping user reservations load");
        return;
    }

    try {
        console.log(`Loading reservations for user ID: ${currentUser.id}`);

        const response = await axios.get(`${window.API_BASE_URL}/reservations/user/${currentUser.id}`);
        const userReservations = response.data;

        console.log(`Received ${userReservations ? userReservations.length : 0} user reservations`);

        const container = document.getElementById("calendarReservations");
        if (!container) {
            console.error("Element with ID 'calendarReservations' not found");
            return;
        }

        const noReservationsMsg = document.getElementById("noCalendarReservations");
        if (!noReservationsMsg) {
            console.warn("Element with ID 'noCalendarReservations' not found");
        }

        if (userReservations && userReservations.length > 0) {
            if (noReservationsMsg) {
                noReservationsMsg.style.display = "none";
            }

            // Clear existing reservations
            const existingReservations = container.querySelectorAll(".reservation-item");
            existingReservations.forEach(item => item.remove());

            // Add new reservations
            userReservations.forEach(res => {
                const item = document.createElement("div");
                item.className = "reservation-item";
                item.style.marginBottom = "1rem";
                item.style.padding = "0.75rem";
                item.style.backgroundColor = "#f9fafb";
                item.style.borderRadius = "4px";
                item.style.border = "1px solid #e5e7eb";

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

                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-weight: bold; margin-bottom: 0.25rem;">${formattedDate}</p>
                            <p>${timeRange}</p>
                        </div>
                        <button class="button" style="background-color: #e53e3e; padding: 0.25rem 0.5rem;" onclick="cancelCalendarReservation(${res.id})">Cancel</button>
                    </div>
                `;

                container.appendChild(item);
            });
        } else {
            if (noReservationsMsg) {
                noReservationsMsg.style.display = "block";
            }container.innerHTML = "";
        }
    } catch (error) {
        console.error("Failed to load user reservations", error);
        // Display error message to user
        const container = document.getElementById("calendarReservations");
        if (container) {
            const errorMsg = document.createElement("p");
            errorMsg.style.color = "#e53e3e";
            errorMsg.textContent = "Failed to load your reservations. Please try again later.";
            container.innerHTML = "";
            container.appendChild(errorMsg);
        }
    }
}

// Cancel a reservation
async function cancelCalendarReservation(id) {
    if (!id) {
        console.error("Invalid reservation ID:", id);
        alert("Cannot cancel reservation: Invalid ID");
        return;
    }

    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    try {
        console.log(`Cancelling reservation with ID: ${id}`);

        const response = await axios.delete(`${window.API_BASE_URL}/reservations/${id}`);
        console.log("Cancellation response:", response);

        // Reload data
        loadReservations();
        loadUserReservations();

        alert("Reservation cancelled successfully");
    } catch (error) {
        console.error("Failed to cancel reservation", error);

        // Show a more user-friendly error message
        let errorMessage = "Failed to cancel reservation. Please try again later.";
        if (error.response) {
            if (error.response.status === 404) {
                errorMessage = "This reservation no longer exists.";
            } else if (error.response.data) {
                errorMessage = `Failed to cancel reservation: ${error.response.data}`;
            }
        }

        alert(errorMessage);
    }
}

// Navigate to the previous month
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

// Navigate to the next month
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// Adjust the calendar layout for different screen sizes
function adjustCalendarLayout() {
    const calendarGrid = document.getElementById("calendarGrid");

    if (window.innerWidth < 768) {
        calendarGrid.style.gridTemplateColumns = "1fr";
    } else {
        calendarGrid.style.gridTemplateColumns = "2fr 1fr";
    }
}

// Make the cancelCalendarReservation function globally available
window.cancelCalendarReservation = cancelCalendarReservation;
