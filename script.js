let todos = [];
let currentFilter = "all";
let deleteMode = false;

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

function getTodayDateStr() {
	return new Date().toISOString().split("T")[0];
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
	saveTodos();
	toggleTodoForm();
	document.getElementById("todoTitle").value = "";
	document.getElementById("todoDeadline").value = "";
	renderTodos();
}

function saveTodos() {
	const today = getTodayDateStr();
	localStorage.setItem(`todos-${today}`, JSON.stringify(todos));
}

function loadTodos(date = getTodayDateStr()) {
	const stored = localStorage.getItem(`todos-${date}`);
	todos = stored ? JSON.parse(stored) : [];
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

	filtered.forEach((todo, index) => {
		const li = document.createElement("li");
		li.className = "list-group-item d-flex justify-content-between align-items-center";
		if (todo.status === "Done") li.classList.add("bg-light", "text-success");

		const leftSection = document.createElement("div");
		leftSection.className = "d-flex align-items-center gap-2 ";

		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.checked = todo.status === "Done";
		checkbox.classList.add("form-check-input", "me-2");
		checkbox.addEventListener("change", () => {
			todo.status = checkbox.checked ? "Done" : "Not Done";
			saveTodos();
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

		// ✅ Only show delete button in deleteMode
		if (deleteMode) {
			const deleteBtn = document.createElement("button");
			deleteBtn.className = "btn btn-sm btn-danger";
			deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
			deleteBtn.title = "Delete Task";
			deleteBtn.onclick = () => {
				todos.splice(index, 1);
				saveTodos();
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

// 🛠️ Fix: Dropdown "3 dots" actions
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
		// Always hide form and show list on other actions
		form.classList.add("d-none");
		list.classList.remove("d-none");
		filterTodos(action);
	}
}

// Init on load
loadTodos();

// ====== LINK SECTION SCRIPT START ======
let currentLinkGroup = "personal";
let linkDeleteMode = false;

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

	// Always close form and show link list on tab switch
	document.getElementById("linkFormWrapper").classList.add("d-none");
	document.getElementById("linkListWrapper").classList.remove("d-none");

	// Highlight active tab
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
	const existing = JSON.parse(localStorage.getItem(`links-${group}`)) || [];
	existing.push(linkObj);
	localStorage.setItem(`links-${group}`, JSON.stringify(existing));

	renderLinks();

	// Hide form, show links
	document.getElementById("linkFormWrapper").classList.add("d-none");
	document.getElementById("linkListWrapper").classList.remove("d-none");

	// Reset fields
	document.getElementById("linkName").value = "";
	document.getElementById("linkURL").value = "";
	document.getElementById("linkIcon").value = "";
	document.getElementById("linkGroup").value = currentLinkGroup;
	document.getElementById("linkColor").value = "#4b6cb7";
}

function renderLinks() {
	const container = document.getElementById("tab-links");
	container.innerHTML = "";

	const storedLinks = JSON.parse(localStorage.getItem(`links-${currentLinkGroup}`)) || [];

	storedLinks.forEach((link, index) => {
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
				const links = JSON.parse(localStorage.getItem(`links-${currentLinkGroup}`)) || [];
				links.splice(index, 1);
				localStorage.setItem(`links-${currentLinkGroup}`, JSON.stringify(links));
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

// Init
switchLinkGroup("personal");
loadTodos();

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


// ⏰ Live Clock
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

setInterval(updateClock, 1000);
updateClock();


// TIMETABLE
const timetable = {
//   Wednesday: [
//     { time: "10:11 AM - 10:12 AM", subject: "Test", teacher: "non", room: "RN-4212" },
//     { time: "10:12 AM - 10:13 AM", subject: "Test", teacher: "non", room: "RN-4201" },
// 	{ time: "10:13 AM - 01:14 PM", subject: "Test", teacher: "non", room: "RN-4212" },
//     { break: true },
//     { time: "02:25 PM - 03:20 PM", subject: "ED", teacher: "DMS", room: "RN-4212" }
//   ],
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


const currentDay = new Date().toLocaleDateString("en-US",
{
	weekday: "long"
});
const now = new Date();

// 🗓️ Show today's date beside the header
document.getElementById("current-date").textContent = new Date().toLocaleDateString("en-GB",
{
	day: "2-digit",
	month: "short",
	year: "numeric"
});

function parseTime(str)
{
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

      const start = new Date();
      const end = new Date();
      start.setHours(startTime.hours, startTime.minutes, 0, 0);
      end.setHours(endTime.hours, endTime.minutes, 0, 0);

      const now = new Date();
      const timerId = `timer-${day}-${index}`;
      const slotId = `slot-${timerId}`;

      let initialClass = "";
      if (now >= start && now <= end) {
        initialClass = "bg-success text-white";
      } else if (now > end) {
        initialClass = "bg-danger text-white";
      } else {
        initialClass = "bg-warning text-dark";
      }

      const fullLabel = `${item.subject}${item.teacher ? ` (${item.teacher})` : ''}${item.room ? ` [${item.room}]` : ''}`;

      html += `
        <div id="${slotId}" class="border rounded px-3 py-2 ${initialClass} text-center" title="${item.time}">
          <div class="d-flex flex-column gap-1">
            <span class="fw-bold" style="word-break: break-word;">${fullLabel}</span>
            <span id="${timerId}" class="small fw-normal text-center d-block text-nowrap"></span>
          </div>
        </div>`;

      // ✅ Timer only for green slot
      setInterval(() => {
        const nowCurrent = new Date();
        const timerEl = document.getElementById(timerId);
        const slotEl = document.getElementById(slotId);
        if (!timerEl || !slotEl) return;

        // Color update
        slotEl.classList.remove("bg-success", "bg-warning", "bg-danger", "text-white", "text-dark");

        if (nowCurrent >= start && nowCurrent <= end) {
          slotEl.classList.add("bg-success", "text-white");

          const diff = end - nowCurrent;
          const hrs = Math.floor(diff / 3600000);
          const mins = Math.floor((diff % 3600000) / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          timerEl.textContent = `⏳ ${hrs} hour ${mins} min ${secs} sec left`;
        } else if (nowCurrent > end) {
          slotEl.classList.add("bg-danger", "text-white");
          timerEl.textContent = "";
        } else {
          slotEl.classList.add("bg-warning", "text-dark");
          timerEl.textContent = "";
        }
      }, 1000);
    }
  });

  html += `</div>`;
  container.innerHTML = html;
}


// Calendar Variables
let currentView = 'today';
let selectedDate = new Date();
let currentMonth = new Date();

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

    // Calculate remaining cells needed to complete the last week
    const remainingDays = (7 - ((startingDay + totalDays) % 7)) % 7;
    
    // Next month days (only if needed to complete the last week)
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
    
    // Switch to today view and show selected day's timetable
    switchTimetableView('today');
}

// Modify the existing renderTimetable function to handle the selected date
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


// Initialize calendar when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize everything
    loadTodos();
    switchLinkGroup("personal");
    updateClock();
    setInterval(updateClock, 1000);
    
    // Set initial view to today's timetable
    currentView = 'today';
    selectedDate = new Date();
    const today = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
    
    // Make sure today's view is active
    document.getElementById('todayViewBtn').classList.add('active');
    document.getElementById('weekViewBtn').classList.remove('active');
    document.getElementById('daily-timetable').classList.remove('d-none');
    document.getElementById('week-calendar').classList.add('d-none');
    
    // Render today's timetable
    renderTimetable(today);
});
