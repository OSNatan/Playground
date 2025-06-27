(() => {
const API_BASE_URL = "http://localhost:8080/api"; // Update if needed

let calendar;
let selectedSlot;
let currentUser = null;

async function fetchUserInfo() {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/me`);
        currentUser = response.data;
        updateUserUI();
        loadUserReservations();
    } catch (error) {
        console.error("User not logged in", error);
        currentUser = null;
        updateUserUI();
    }
}

function updateUserUI() {
    const navLinks = document.getElementById("navLinks");
    const loginLink = document.getElementById("loginLink");
    const logoutBtn = document.getElementById("logoutBtn");

    if (currentUser) {
        // Add user info to navigation
        if (!document.getElementById("user-info")) {
            const userInfo = document.createElement("span");
            userInfo.id = "user-info";
            userInfo.className = "mr-4";
            navLinks.insertBefore(userInfo, loginLink);
        }
        document.getElementById("user-info").innerHTML = `Logged in as <strong>${currentUser.username}</strong>`;

        loginLink.style.display = "none";
        logoutBtn.classList.remove("hidden");
    } else {
        const userInfo = document.getElementById("user-info");
        if (userInfo) {
            userInfo.remove();
        }
        loginLink.style.display = "inline-block";
        logoutBtn.classList.add("hidden");
    }
}

function formatTime(time) {
    if (typeof time === "string") {
        return time.slice(0, 5);
    } else if (time instanceof Date) {
        return time.toTimeString().slice(0, 5);
    }
    return "";
}

function showReservationModal(slotInfo) {
    const modal = document.getElementById("reservationForm");
    modal.classList.remove("hidden");

    selectedSlot = slotInfo;

    // Format the date and time for display
    const startDate = new Date(slotInfo.startStr);
    const formattedDate = startDate.toLocaleDateString();

    // Determine time slot based on hour
    const startHour = startDate.getHours();
    let timeSlot = "";
    if (startHour >= 8 && startHour < 12) {
        timeSlot = "8:00 - 12:00";
    } else if (startHour >= 13 && startHour < 17) {
        timeSlot = "13:00 - 17:00";
    } else if (startHour >= 18 && startHour < 22) {
        timeSlot = "18:00 - 22:00";
    }

    // Update the slot details in the form
    document.getElementById("slotDate").innerText = formattedDate;
    document.getElementById("slotTime").innerText = timeSlot;
}

function closeReservationModal() {
    const modal = document.getElementById("reservationForm");
    modal.classList.add("hidden");
    selectedSlot = null;
}

async function makeReservation() {
    if (!selectedSlot || !currentUser) return;

    // Convert the selected time to a slot number (0: 8-12, 1: 13-17, 2: 18-22)
    const startHour = new Date(selectedSlot.startStr).getHours();
    let slotNumber;

    if (startHour >= 8 && startHour < 12) {
        slotNumber = 0; // Morning slot (8-12)
    } else if (startHour >= 13 && startHour < 17) {
        slotNumber = 1; // Afternoon slot (13-17)
    } else if (startHour >= 18 && startHour < 22) {
        slotNumber = 2; // Evening slot (18-22)
    } else {
        alert("Invalid time slot. Please select a time between 8:00-12:00, 13:00-17:00, or 18:00-22:00");
        return;
    }

    const data = {
        userId: currentUser.id,
        slotNumber: slotNumber,
        gender: document.querySelector('input[name="gender"]:checked').value,
        bringOwnFood: document.getElementById("bringOwnFood").checked,
        decorations: document.getElementById("decorationStyle").value,
        music: document.getElementById("musicType").value
    };

    try {
        await axios.post(`${API_BASE_URL}/reservations`, data);
        closeReservationModal();
        calendar.customRefetchEvents();
        loadUserReservations();
    } catch (error) {
        console.error("Failed to make reservation", error);
        alert("Failed to make reservation: " + (error.response?.data?.message || error.message));
    }
}

async function cancelReservation(reservationId) {
    try {
        await axios.delete(`${API_BASE_URL}/reservations/${reservationId}`);
        calendar.customRefetchEvents();
        loadUserReservations();
    } catch (error) {
        console.error("Failed to cancel reservation", error);
    }
}

function renderUserReservations(reservations) {
    const container = document.getElementById("user-reservations");
    container.innerHTML = "";

    if (!reservations || reservations.length === 0) {
        container.innerText = "No reservations found.";
        return;
    }

    reservations.forEach((res) => {
        const div = document.createElement("div");
        div.className = "p-2 border rounded mb-2 flex justify-between items-center";

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
        const time = `${formattedDate} (${timeRange})`;

        div.innerHTML = `
            <span>${time}</span>
            <button class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                onclick="cancelReservation(${res.id})">
                Cancel
            </button>
        `;

        container.appendChild(div);
    });
}

async function loadUserReservations() {
    if (!currentUser) return;

    try {
        const response = await axios.get(`${API_BASE_URL}/reservations/user/${currentUser.id}`);
        renderUserReservations(response.data);
    } catch (error) {
        console.error("Failed to load user reservations", error);
    }
}

async function loadEvents(start, end) {
    try {
        const response = await axios.get(`${API_BASE_URL}/reservations`);
        const events = response.data.map(res => {
            // Convert slot number to start and end times
            let startHour, endHour;
            switch(res.slotNumber) {
                case 0:
                    startHour = 8;
                    endHour = 12;
                    break;
                case 1:
                    startHour = 13;
                    endHour = 17;
                    break;
                case 2:
                    startHour = 18;
                    endHour = 22;
                    break;
                default:
                    startHour = 0;
                    endHour = 0;
            }

            // Create Date objects for the start and end times
            const startDate = new Date(res.date);
            startDate.setHours(startHour, 0, 0);

            const endDate = new Date(res.date);
            endDate.setHours(endHour, 0, 0);

            return {
                title: `Reserved by ${res.userName}`,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                color: "red",
            };
        });

        calendar.removeAllEvents();
        calendar.addEventSource(events);
    } catch (error) {
        console.error("Failed to load reservations", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "timeGridWeek",
        selectable: true,
        allDaySlot: false,
        slotMinTime: "08:00:00",
        slotMaxTime: "22:00:00",

        select: function (info) {
            if (!currentUser) {
                alert("Please log in to make a reservation.");
                return;
            }
            showReservationModal(info);
        },

        datesSet: function (info) {
            loadEvents(info.start, info.end);
        }
    });

    // Add custom refetch method
    calendar.customRefetchEvents = function () {
        const view = calendar.view;
        loadEvents(view.currentStart, view.currentEnd);
    };

    calendar.render();
    fetchUserInfo();

    // Event handlers
    document.getElementById("confirmBooking").addEventListener("click", function(e) {
        e.preventDefault();
        makeReservation();
    });
    document.getElementById("cancelBooking").addEventListener("click", function(e) {
        e.preventDefault();
        closeReservationModal();
    });
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem('user');
        location.reload();
    });
});
})();
