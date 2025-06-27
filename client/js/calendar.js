(() => {
const API_BASE_URL = "http://localhost:8080/api"; // Update if needed

let calendar;
let selectedSlot;
let currentUser = null;

function fetchUserInfo() {
        currentUser = getLoggedInUser();
        if (currentUser) {
            updateUserUI();
            loadUserReservations();
        } else {
            updateUserUI();
        }
    }

function updateUserUI() {
    const userInfo = document.getElementById("user-info");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");

    if (currentUser) {
        userInfo.innerHTML = `Logged in as <strong>${currentUser.name}</strong>`;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        userInfo.innerHTML = "Not logged in";
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
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
    const modal = document.getElementById("reservation-modal");
    modal.style.display = "block";

    selectedSlot = slotInfo;

    const slotDetails = document.getElementById("slot-details");
    slotDetails.innerText = `Reserve: ${slotInfo.startStr} → ${slotInfo.endStr}`;
}

function closeReservationModal() {
    const modal = document.getElementById("reservation-modal");
    modal.style.display = "none";
    selectedSlot = null;
}

async function makeReservation() {
    if (!selectedSlot || !currentUser) return;

    const data = {
        userId: currentUser.id,
        startTime: selectedSlot.startStr,
        endTime: selectedSlot.endStr,
    };

    try {
        await axios.post(`${API_BASE_URL}/reservations`, data);
        closeReservationModal();
        calendar.customRefetchEvents();
        loadUserReservations();
    } catch (error) {
        console.error("Failed to make reservation", error);
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

        const time = `${res.startTime.slice(0, 16).replace("T", " ")} → ${res.endTime.slice(0, 16).replace("T", " ")}`;
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
        const events = response.data.map(res => ({
            title: `Reserved by ${res.user.username}`,
            start: res.startTime,
            end: res.endTime,
            color: "red",
        }));

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
    document.getElementById("confirm-reservation-btn").addEventListener("click", makeReservation);
    document.getElementById("close-modal-btn").addEventListener("click", closeReservationModal);
    document.getElementById("logout-btn").addEventListener("click", () => {
        //axios.post(`${API_BASE_URL}/logout`).then(() => location.reload());
    });
});
})();
