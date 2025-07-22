// Global Variables
let todos = [];
let links = {};
let currentFilter = "all";
let deleteMode = false;
let currentLinkGroup = "personal";
let linkDeleteMode = false;
let currentView = 'today';
let selectedDate = new Date();
let currentMonth = new Date();

const defaultUserData = {
    todos: [],
    links: {
        personal: [],
        quick: [],
        ai: []
    }
};

// Load user data into app
function loadUserData() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Get user data
        const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
        if (!userData) {
            handleLogout();
            return;
        }

        // Get planner data
        const plannerData = JSON.parse(localStorage.getItem(`planner_${currentUser}`)) || defaultUserData;

        // Load todos
        todos = plannerData.todos || [];
        renderTodos();
        
        // Load links
        links = plannerData.links || defaultUserData.links;
        renderLinks();

        // Display username - Desktop
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay) {
            const userNameEl = userDisplay.querySelector('.user-name');
            const userRegEl = userDisplay.querySelector('.user-reg');
            const userBranchEl = userDisplay.querySelector('.user-branch');
            
            if (userNameEl) userNameEl.textContent = userData.name;
            if (userRegEl) userRegEl.textContent = userData.regNo;
            if (userBranchEl) userBranchEl.textContent = userData.branch;
        }

        // Display username - Mobile
        const userNameMobile = document.querySelector('.user-name-mobile');
        const userRegMobile = document.querySelector('.user-meta-mobile .user-reg');
        const userBranchMobile = document.querySelector('.user-meta-mobile .user-branch');
        const userGroupMobile = document.querySelector('.user-meta-mobile .user-group');

        if (userNameMobile) userNameMobile.textContent = userData.name;
        if (userRegMobile) userRegMobile.textContent = userData.regNo;
        if (userBranchMobile) userBranchMobile.textContent = userData.branch;
        if (userGroupMobile) userGroupMobile.textContent = userData.group || 'G1';

    } catch (error) {
        console.error('Error loading user data:', error);
        handleLogout();
    }
}

// Save user data
function saveUserData() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    try {
        const plannerData = {
            todos: todos,
            links: links,
            lastModified: new Date().toISOString()
        };
        
        localStorage.setItem(`planner_${currentUser}`, JSON.stringify(plannerData));
    } catch (error) {
        console.error('Error saving user data:', error);
        alert('Error saving your changes. Please try again.');
    }
}

// Handle logout
function handleLogout() {
    try {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error during logout:', error);
        // Force redirect to login page even if there's an error
        window.location.href = 'login.html';
    }
}

// Add event listener for logout button
document.getElementById('logoutBtn').addEventListener('click', handleLogout);

// Todo Management Functions
function toggleTodoForm() {
    const form = document.getElementById("todoForm");
    const list = document.getElementById("todo-list");
    const isHidden = form.classList.contains("d-none");

    if (isHidden) {
        form.classList.remove("d-none");
        list.classList.add("d-none");
    } else {
        form.classList.add("d-none");
        list.classList.remove("d-none");
    }
}

function addTodo() {
    const title = document.getElementById("todoTitle").value.trim();
    const priority = document.getElementById("todoPriority").value;
    const deadline = document.getElementById("todoDeadline").value;

    if (!title || !deadline) return;

    todos.push({
        title,
        deadline,
        priority,
        status: "Not Done"
    });

    saveUserData();
    toggleTodoForm();
    
    document.getElementById("todoTitle").value = "";
    document.getElementById("todoDeadline").value = "";
    
    renderTodos();
}

function renderTodos() {
    const list = document.getElementById("todo-list");
    list.innerHTML = "";

    const filtered = todos.filter(todo => {
        if (currentFilter === "notdone") return todo.status !== "Done";
        if (currentFilter === "done") return todo.status === "Done";
        return true;
    });

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-tasks fa-2x mb-3"></i>
                <p>No tasks available</p>
            </div>
        `;
        return;
    }

    filtered.forEach((todo, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        if (todo.status === "Done") li.classList.add("bg-light", "text-success");

        const leftSection = document.createElement("div");
        leftSection.className = "d-flex align-items-center gap-2";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.status === "Done";
        checkbox.classList.add("form-check-input", "me-2");
        checkbox.addEventListener("change", () => {
            todo.status = checkbox.checked ? "Done" : "Not Done";
            saveUserData();
            renderTodos();
        });

        const content = document.createElement("div");
        let stars = "";
        if (todo.priority === "High") stars = "⭐⭐⭐";
        else if (todo.priority === "Medium") stars = "⭐⭐";
        else if (todo.priority === "Low") stars = "⭐";

        content.innerHTML = `
            <div class="todo-text-wrap">
                <strong>${todo.title}</strong><br>
                <small>🗓️ ${todo.deadline || "No date"}   ${stars}</small>
            </div>
        `;

        leftSection.appendChild(checkbox);
        leftSection.appendChild(content);
        li.appendChild(leftSection);

        if (deleteMode) {
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-sm btn-danger";
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = "Delete Task";
            deleteBtn.onclick = () => {
                todos.splice(index, 1);
                saveUserData();
                renderTodos();
            };
            li.appendChild(deleteBtn);
        }

        list.appendChild(li);
    });
}

function toggleDeleteMode() {
    deleteMode = !deleteMode;
    renderTodos();

    const deleteBtn = document.getElementById("deleteToggleBtn");
    if (deleteBtn) {
        deleteBtn.classList.toggle("btn-danger", deleteMode);
        deleteBtn.classList.toggle("btn-outline-dark", !deleteMode);
        deleteBtn.classList.toggle("blinking-delete", deleteMode);
    }
}

function filterTodos(type) {
    currentFilter = type;
    renderTodos();
}

function handleMenuAction(action, event) {
    event.preventDefault();
    event.stopPropagation();

    const form = document.getElementById("todoForm");
    const list = document.getElementById("todo-list");

    if (action === 'new') {
        const isHidden = form.classList.contains("d-none");
        form.classList.toggle("d-none", !isHidden);
        list.classList.toggle("d-none", isHidden);
    } else {
        form.classList.add("d-none");
        list.classList.remove("d-none");
        filterTodos(action);
    }
}

// Links Management Functions
function toggleLinkForm() {
    const formWrapper = document.getElementById("linkFormWrapper");
    const listWrapper = document.getElementById("linkListWrapper");
    const isHidden = formWrapper.classList.contains("d-none");
    formWrapper.classList.toggle("d-none", !isHidden);
    listWrapper.classList.toggle("d-none", isHidden);
}

function toggleLinkDeleteMode() {
    linkDeleteMode = !linkDeleteMode;
    document.getElementById("deleteLinkToggleBtn").classList.toggle("blinking-delete", linkDeleteMode);
    renderLinks();
}

function switchLinkGroup(group) {
    currentLinkGroup = group;
    document.getElementById("linkFormWrapper").classList.add("d-none");
    document.getElementById("linkListWrapper").classList.remove("d-none");

    document.querySelectorAll(".link-tab-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("data-group") === group) {
            btn.classList.add("active");
        }
    });

    renderLinks();
}

function addLink() {
    const name = document.getElementById("linkName").value.trim();
    const url = document.getElementById("linkURL").value.trim();
    const group = document.getElementById("linkGroup").value;
    const iconSelect = document.getElementById("linkIcon").value;
    const color = document.getElementById("linkColor").value;
    const icon = iconSelect ? `<i class="${iconSelect}"></i>` : guessIcon(name);

    if (!name || !url || !group) return;

    const linkObj = {
        name,
        url,
        icon,
        color
    };

    if (!links[group]) links[group] = [];
    links[group].push(linkObj);
    saveUserData();

    document.getElementById("linkName").value = "";
    document.getElementById("linkURL").value = "";
    document.getElementById("linkIcon").value = "";
    document.getElementById("linkGroup").value = currentLinkGroup;
    document.getElementById("linkColor").value = "#4b6cb7";

    toggleLinkForm();
    renderLinks();
}

function renderLinks() {
    const container = document.getElementById("tab-links");
    container.innerHTML = "";

    const currentLinks = links[currentLinkGroup] || [];

    if (currentLinks.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted p-4 w-100">
                <i class="fas fa-link fa-2x mb-3"></i>
                <p>No links available in ${currentLinkGroup} category</p>
            </div>
        `;
        return;
    }

    currentLinks.forEach((link, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "link-wrapper";
        if (linkDeleteMode) {
            wrapper.classList.add("delete-mode");
        }

        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";
        a.title = link.name;
        a.innerHTML = link.icon;
        a.className = "d-flex justify-content-center align-items-center rounded-circle border text-decoration-none";
        a.style.width = "51.4px";
        a.style.height = "51.4px";
        a.style.fontSize = "1.3rem";

        if (linkDeleteMode) {
            const deleteBtn = document.createElement("span");
            deleteBtn.className = "delete-icon";
            deleteBtn.innerHTML = "×";
            deleteBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                links[currentLinkGroup].splice(index, 1);
                saveUserData();
                renderLinks();
            };
            wrapper.appendChild(deleteBtn);
        }

        wrapper.appendChild(a);
        container.appendChild(wrapper);
    });
}

function guessIcon(name) {
    const map = {
        github: '<i class="fab fa-github"></i>',
        notion: '<i class="fas fa-book"></i>',
        chatgpt: '<i class="fas fa-robot"></i>',
        ai: '<i class="fas fa-brain"></i>',
        code: '<i class="fas fa-code"></i>',
        youtube: '<i class="fab fa-youtube"></i>',
        google: '<i class="fab fa-google"></i>',
        linkedin: '<i class="fab fa-linkedin"></i>'
    };
    const key = name.toLowerCase();
    return map[key] || '<i class="fas fa-link"></i>';
}

// Clock Functions
function updateClock() {
  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  let session = "AM";

  if (hours >= 12) {
    session = "PM";
    if (hours > 12) hours -= 12;
  }
  if (hours === 0) hours = 12;

  hours = String(hours).padStart(2, '0');
  minutes = String(minutes).padStart(2, '0');
  seconds = String(seconds).padStart(2, '0');

  const timeStr = `${hours}:${minutes}:${seconds} ${session}`;
  const dayStr = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = now.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById("clockTime").textContent = timeStr;
  document.getElementById("clockDay").textContent = dayStr;
  document.getElementById("clockDate").textContent = dateStr;
}

// Timetable Data
const timetable = {
  Monday: [
    { time: "10:45 AM - 11:40 AM", subject: "OS", teacher: "BS", room: "RN-4212" },
    { time: "11:40 AM - 12:35 PM", subject: "WT", teacher: "MB", room: "RN-4212" },
    { time: "12:35 PM - 01:30 PM", subject: "AIML", teacher: "MB", room: "RN-4212" },
    { break: true },
    { time: "02:25 PM - 05:10 PM", subject: "TC Lab", teacher: "SRL", room: "L7 (G2)" },
  ],
  Tuesday: [
    { time: "10:45 AM - 11:40 AM", subject: "OS", teacher: "BM", room: "RN-4212" },
    { time: "11:40 AM - 12:35 PM", subject: "Seminar", teacher: "SPP", room: "RN-4201" },
	{ time: "12:35 PM - 01:30 PM", subject: "EE", teacher: "MRS", room: "RN-4212" },
    { break: true },
    { time: "02:25 PM - 03:20 PM", subject: "OS", teacher: "YD", room: "RN-4212" },
    { time: "03:20 PM - 04:15 PM", subject: "AIML", teacher: "MB", room: "RN-4212" },
    { time: "04:15 PM - 05:10 PM", subject: "ED", teacher: "DRP", room: "RN-3212(B)" }
  ],
  Wednesday: [
    { time: "10:45 AM - 11:40 AM", subject: "OS", teacher: "YD", room: "RN-4212" },
    { time: "11:40 AM - 12:35 PM", subject: "Seminar", teacher: "SPP", room: "RN-4201" },
	{ time: "12:35 PM - 01:30 PM", subject: "EE", teacher: "MRS", room: "RN-4212" },
    { break: true },
    { time: "02:25 PM - 03:20 PM", subject: "ED", teacher: "DMS", room: "RN-4212" },
    { time: "03:20 PM - 04:15 PM", subject: "OS", teacher: "BM", room: "RN-4212" },
    { time: "04:15 PM - 05:10 PM", subject: "AIML", teacher: "MB", room: "RN-4212" }
  ],
  Thursday: [
    { time: "10:45 AM - 11:40 AM", subject: "ED", teacher: "DRP", room: "RN-3102" },
    { time: "11:40 AM - 12:35 PM", subject: "AIML", teacher: "MB", room: "RN-4212" },
    { time: "12:35 PM - 01:30 PM", subject: "EE", teacher: "MRS", room: "RN-4212" },
    { break: true },
    { time: "02:25 PM - 05:10 PM", subject: "OS Lab", teacher: "YD", room: "L6 (G1)" }
  ],
  Friday: [
    { time: "10:45 AM - 11:40 AM", subject: "AIML", teacher: "MB", room: "RN-4212" },
    { time: "11:40 AM - 12:35 PM", subject: "OS", teacher: "SM", room: "RN-4212" },
    { time: "12:35 PM - 01:30 PM", subject: "ED", teacher: "DRP", room: "RN-3116" },
    { break: true },
    { time: "02:25 PM - 05:10 PM", subject: "ML Lab", teacher: "PS", room: "L6 (G1)" }
  ]
};

// Timetable Functions
function parseTime(str) {
        const [time, period] = str.trim().split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
    return {
        hours,
        minutes
    };
}

function renderTimetable(day) {
        const container = document.getElementById("daily-timetable");
        const todaySchedule = timetable[day] || [];

        if (todaySchedule.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted p-4">
                    <i class="fas fa-calendar-alt fa-2x mb-3"></i>
                    <p>No classes scheduled for ${day}</p>
                </div>
            `;
            return;
        }

        let html = `<div class="d-flex flex-column gap-2">`;

        todaySchedule.forEach((item, index) => {
            if (item.break) {
                html += `
                <div class="border border-secondary rounded px-3 py-2 text-muted fw-bold bg-light text-center" title="Break Time">
                        [FOOD] Break [FOOD]
                    </div>`;
            } else {
                const [startStr, endStr] = item.time.split(" - ");
                const startTime = parseTime(startStr);
                const endTime = parseTime(endStr);

                const start = new Date(selectedDate);
                const end = new Date(selectedDate);
                start.setHours(startTime.hours, startTime.minutes, 0, 0);
                end.setHours(endTime.hours, endTime.minutes, 0, 0);
                const now = new Date();
                const timerId = `timer-${day}-${index}`;
                const slotId = `slot-${timerId}`;

                // Compare dates without time
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const compareDate = new Date(selectedDate);
                compareDate.setHours(0, 0, 0, 0);

                let initialClass = "";
                if (compareDate.getTime() === today.getTime()) {
                    // Today's schedule
                    if (now >= start && now <= end) {
                        initialClass = "bg-success text-white";
                    } else if (now > end) {
                        initialClass = "bg-danger text-white";
                    } else {
                        initialClass = "bg-warning text-dark";
                    }
                } else if (compareDate > today) {
                    // Future date
                    initialClass = "bg-warning text-dark";
                } else {
                    // Past date
                    initialClass = "bg-danger text-white";
                }

                const fullLabel = `${item.subject}${item.teacher ? ` (${item.teacher})` : ''}${item.room ? ` [${item.room}]` : ''}`;

                html += `
                <div id="${slotId}" class="border rounded px-3 py-2 ${initialClass} text-center" title="${item.time}">
                        <div class="d-flex flex-column gap-1">
                            <span class="fw-bold" style="word-break: break-word;">${fullLabel}</span>
                            <span id="${timerId}" class="small fw-normal text-center d-block text-nowrap"></span>
                        </div>
                    </div>`;

                // Only add timer for today's current classes
            if (compareDate.getTime() === today.getTime() && now >= start && now <= end) {
                setInterval(() => {
                        const nowCurrent = new Date();
                        const timerEl = document.getElementById(timerId);
                    if (!timerEl) return;

                        if (nowCurrent >= start && nowCurrent <= end) {
                            const diff = end - nowCurrent;
                            const hrs = Math.floor(diff / 3600000);
                            const mins = Math.floor((diff % 3600000) / 60000);
                            const secs = Math.floor((diff % 60000) / 1000);
                            timerEl.textContent = `⏳ ${hrs} hour ${mins} min ${secs} sec left`;
                        }
                }, 1000);
                }
            }
        });

        html += `</div>`;
        container.innerHTML = html;
}

function switchTimetableView(view) {
    currentView = view;
    document.getElementById('todayViewBtn').classList.toggle('active', view === 'today');
    document.getElementById('weekViewBtn').classList.toggle('active', view === 'week');
    document.getElementById('daily-timetable').classList.toggle('d-none', view === 'week');
    document.getElementById('week-calendar').classList.toggle('d-none', view === 'today');

    // Update Today button text
    const todayBtn = document.getElementById('todayViewBtn');
    if (selectedDate.toDateString() === new Date().toDateString()) {
        todayBtn.innerHTML = '<i class="fas fa-calendar-day"></i> Today';
    } else {
        const dateStr = selectedDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short'
        });
        todayBtn.innerHTML = `<i class="fas fa-calendar-day"></i> ${dateStr}`;
    }

    if (view === 'week') {
        renderCalendar();
    } else {
        renderTimetable(selectedDate.toLocaleDateString("en-US", { weekday: "long" }));
    }
}

function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    // Update month display
    document.getElementById('calendar-month').textContent = currentMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    let calendarHTML = '';

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        calendarHTML += `<div class="calendar-day other-month"><span class="day-number">${day}</span></div>`;
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(year, month, i);
        const isToday = date.toDateString() === new Date().toDateString();
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const hasClasses = timetable[dayName] ? 'has-classes' : '';
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasClasses}"
                 onclick="selectDate(${year}, ${month}, ${i})">
                <span class="day-number">${i}</span>
            </div>`;
    }

    // Next month days
    const remainingDays = (7 - ((startingDay + totalDays) % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
        calendarHTML += `<div class="calendar-day other-month"><span class="day-number">${i}</span></div>`;
        }

    document.getElementById('calendar-days').innerHTML = calendarHTML;
}

function changeMonth(delta) {
    currentMonth.setMonth(currentMonth.getMonth() + delta);
    renderCalendar();
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (currentView === 'week') {
        renderCalendar();
    }
    
    switchTimetableView('today');
}

// Initialize app and event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', handleLogout);
    }

    // Load user data
    loadUserData();
    
    // Initialize clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Set initial timetable view
    currentView = 'today';
    selectedDate = new Date();
    const today = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
    
    // Set up initial view states
    const todayViewBtn = document.getElementById('todayViewBtn');
    const weekViewBtn = document.getElementById('weekViewBtn');
    const dailyTimetable = document.getElementById('daily-timetable');
    const weekCalendar = document.getElementById('week-calendar');

    if (todayViewBtn) todayViewBtn.classList.add('active');
    if (weekViewBtn) weekViewBtn.classList.remove('active');
    if (dailyTimetable) dailyTimetable.classList.remove('d-none');
    if (weekCalendar) weekCalendar.classList.add('d-none');

    // Initialize scroll select functionality
    document.querySelectorAll(".scroll-select").forEach(select => {
        select.addEventListener("wheel", (e) => {
            e.preventDefault();
            const options = select.options;
            const index = select.selectedIndex;

            if (e.deltaY > 0 && index < options.length - 1) {
                select.selectedIndex = index + 1;
            } else if (e.deltaY < 0 && index > 0) {
                select.selectedIndex = index - 1;
            }
        });
    });
    
    // Render initial timetable
    renderTimetable(today);
});
