// calendar.js - Custom calendar implementation with vanilla JavaScript
const API_BASE_URL = "http://localhost:8080/api";

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

        // Add a visibility change listener to re-render calendar if needed when tab becomes visible
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                console.log("Page became visible, checking calendar...");
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

// Fetch the current user's information
async function fetchUserInfo() {
    try {
        const user = getLoggedInUser();
        if (user && user.token) {
            const response = await axios.get(`${API_BASE_URL}/users/me`);
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

// Render the calendar for the current month
function renderCalendar() {
    try {
        console.log("Rendering calendar with simplified approach...");
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Update the month and year display
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentMonthElement = document.getElementById("currentMonth");
        if (!currentMonthElement) {
            console.error("Element with ID 'currentMonth' not found");
            return;
        }
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;

        // Get the first day of the month
        const firstDay = new Date(year, month, 1);
        const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Get the number of days in the month
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();

        // Clear the calendar
        const calendarDays = document.getElementById("calendarDays");
        if (!calendarDays) {
            console.error("Element with ID 'calendarDays' not found");
            return;
        }

        // Clear existing content
        calendarDays.innerHTML = "";

        console.log(`Rendering calendar for ${monthNames[month]} ${year} with ${totalDays} days`);

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "calendar-day empty-day";
            calendarDays.appendChild(emptyCell);
            console.log(`Added empty cell ${i+1}/${startingDay}`);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement("div");
            cell.className = "calendar-day";
            cell.style.border = "1px solid #ddd";
            cell.style.padding = "8px";
            cell.style.minHeight = "120px";
            cell.style.backgroundColor = "#fff";

            // Check if this is today
            const currentDateObj = new Date();
            if (year === currentDateObj.getFullYear() && month === currentDateObj.getMonth() && day === currentDateObj.getDate()) {
                cell.classList.add("today");
                cell.style.backgroundColor = "rgba(124, 58, 237, 0.1)";
            }

            // Add the day number
            const dayNumber = document.createElement("div");
            dayNumber.className = "calendar-day-number";
            dayNumber.textContent = day;
            dayNumber.style.fontWeight = "bold";
            dayNumber.style.marginBottom = "8px";
            cell.appendChild(dayNumber);

            // Add the time slots (8-12, 13-17, 18-22)
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            console.log(`Creating slots for ${dateString}`);

            // Morning slot (8-12)
            const morningSlot = createTimeSlot(dateString, 0, "8:00 - 12:00");
            cell.appendChild(morningSlot);

            // Afternoon slot (13-17)
            const afternoonSlot = createTimeSlot(dateString, 1, "13:00 - 17:00");
            cell.appendChild(afternoonSlot);

            // Evening slot (18-22)
            const eveningSlot = createTimeSlot(dateString, 2, "18:00 - 22:00");
            cell.appendChild(eveningSlot);

            calendarDays.appendChild(cell);
            console.log(`Added day ${day} cell with 3 time slots`);
        }

        // Load reservations for the current month
        loadReservations();
    } catch (error) {
        console.error("Error rendering calendar:", error);

        // Display error message in the calendar container
        const calendarDays = document.getElementById("calendarDays");
        if (calendarDays) {
            calendarDays.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #e53e3e;">
                    <p>Error rendering calendar: ${error.message}</p>
                    <p>Please try refreshing the page.</p>
                </div>
            `;
        }
    }
}

// Create a time slot element
function createTimeSlot(date, slotNumber, timeText) {
    try {
        console.log(`Creating time slot for date=${date}, slotNumber=${slotNumber}, timeText=${timeText}`);

        const slot = document.createElement("div");
        slot.className = "calendar-event available";
        slot.textContent = timeText;
        slot.dataset.date = date;
        slot.dataset.slotNumber = slotNumber;

        // Add inline styles to ensure visibility
        slot.style.backgroundColor = "rgba(74, 222, 128, 0.2)";
        slot.style.border = "1px solid rgb(34, 197, 94)";
        slot.style.color = "rgb(22, 101, 52)";
        slot.style.padding = "8px";
        slot.style.borderRadius = "4px";
        slot.style.marginBottom = "8px";
        slot.style.cursor = "pointer";
        slot.style.textAlign = "center";
        slot.style.fontWeight = "500";

        // Add click event to book the slot
        slot.addEventListener("click", function() {
            console.log(`Slot clicked: date=${date}, slotNumber=${slotNumber}`);

            if (!currentUser) {
                alert("Please log in to make a reservation.");
                return;
            }

            // Check if the slot is already booked
            if (slot.classList.contains("booked")) {
                alert("This slot is already booked.");
                return;
            }

            // Show the reservation form
            showReservationModal(date, slotNumber, timeText);
        });

        console.log(`Time slot created successfully`);
        return slot;
    } catch (error) {
        console.error(`Error creating time slot: ${error.message}`);

        // Create a fallback slot with error indication
        const errorSlot = document.createElement("div");
        errorSlot.className = "calendar-event";
        errorSlot.textContent = timeText + " (Error)";
        errorSlot.style.backgroundColor = "#fee2e2";
        errorSlot.style.border = "1px solid #ef4444";
        errorSlot.style.color = "#b91c1c";
        errorSlot.style.padding = "8px";
        errorSlot.style.borderRadius = "4px";
        errorSlot.style.marginBottom = "8px";
        errorSlot.style.textAlign = "center";

        return errorSlot;
    }
}

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

    const data = {
        date: selectedDate,
        slotNumber: parseInt(selectedSlotNumber),
        gender: document.querySelector('input[name="gender"]:checked').value === "true",
        bringOwnFood: document.getElementById("bringOwnFood").checked,
        decorationStyle: document.getElementById("decorationStyle").value,
        musicType: document.getElementById("musicType").value
    };

    try {
        await axios.post(`${API_BASE_URL}/reservations`, data);
        closeReservationModal();
        loadReservations();
        loadUserReservations();
        alert("Reservation successful!");
    } catch (error) {
        console.error("Failed to make reservation", error);
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
        const response = await axios.get(`${API_BASE_URL}/reservations`);
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

// Update the calendar with reservations
function updateCalendarWithReservations() {
    try {
        console.log("Updating calendar with reservations...");

        // Reset all slots to available
        const slots = document.querySelectorAll(".calendar-event");
        console.log(`Found ${slots.length} slots to update`);

        if (slots.length === 0) {
            console.warn("No calendar slots found to update. Calendar may not be rendered properly.");
            // Try to re-render the calendar
            setTimeout(() => {
                console.log("Attempting to re-render the calendar...");
                renderCalendar();
            }, 500);
            return;
        }

        slots.forEach(slot => {
            // Reset to available state
            slot.classList.remove("booked");
            slot.classList.add("available");

            // Reset text content (preserve original time text)
            const originalText = slot.textContent.replace(" (Booked)", "");
            slot.textContent = originalText;

            // Reset styles to available state
            slot.style.backgroundColor = "rgba(74, 222, 128, 0.2)";
            slot.style.border = "1px solid rgb(34, 197, 94)";
            slot.style.color = "rgb(22, 101, 52)";
        });

        // Mark booked slots
        if (reservations && reservations.length > 0) {
            console.log(`Marking ${reservations.length} booked slots`);

            reservations.forEach(res => {
                if (!res.date) {
                    console.warn("Reservation missing date:", res);
                    return;
                }

                const date = typeof res.date === 'string' ? res.date.split('T')[0] : '';
                const slotNumber = res.slotNumber;

                console.log(`Looking for slot with date=${date}, slotNumber=${slotNumber}`);

                const slot = document.querySelector(`.calendar-event[data-date="${date}"][data-slot-number="${slotNumber}"]`);
                if (slot) {
                    console.log(`Found slot, marking as booked`);

                    // Update class
                    slot.classList.remove("available");
                    slot.classList.add("booked");

                    // Update text
                    slot.textContent = slot.textContent + " (Booked)";

                    // Update styles to booked state
                    slot.style.backgroundColor = "rgba(252, 165, 165, 0.2)";
                    slot.style.border = "1px solid rgb(239, 68, 68)";
                    slot.style.color = "rgb(153, 27, 27)";
                } else {
                    console.warn(`Slot not found for date=${date}, slotNumber=${slotNumber}`);
                }
            });
        } else {
            console.log("No reservations to display");
        }

        console.log("Calendar updated successfully with reservations");
    } catch (error) {
        console.error("Error updating calendar with reservations:", error);

        // Display error message to user
        const calendarDays = document.getElementById("calendarDays");
        if (calendarDays && calendarDays.children.length === 0) {
            calendarDays.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #e53e3e; grid-column: span 7;">
                    <p>Error updating calendar: ${error.message}</p>
                    <p>Please try refreshing the page.</p>
                </div>
            `;
        }
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

        const response = await axios.get(`${API_BASE_URL}/reservations/user/${currentUser.id}`);
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
            }
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

        const response = await axios.delete(`${API_BASE_URL}/reservations/${id}`);
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
