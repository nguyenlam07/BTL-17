const initialTasks = [
  { id: 1, title: "Đọc nội quy công ty", description: "Tìm hiểu văn hóa, quy định và nội quy làm việc tại công ty.", due: "26/10/2026", icon: "▤", completed: true },
  { id: 2, title: "Hoàn thiện hồ sơ nhân sự", description: "Điền đầy đủ thông tin cá nhân và nộp các giấy tờ cần thiết.", due: "27/10/2026", icon: "♙", completed: true },
  { id: 3, title: "Tham gia buổi định hướng", description: "Tham dự buổi giới thiệu về công ty, sản phẩm và quy trình làm việc.", due: "28/10/2026", icon: "▦", completed: false },
  { id: 4, title: "Tìm hiểu quy trình làm việc", description: "Đọc tài liệu và nắm rõ quy trình, công cụ làm việc của nhóm.", due: "30/10/2026", icon: "▣", completed: false },
  { id: 5, title: "Gặp mentor / quản lý trực tiếp", description: "Trao đổi và làm quen với mentor hoặc quản lý trực tiếp.", due: "31/10/2026", icon: "♧", completed: false }
];

let tasks = loadTasks();
let currentFilter = "all";
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

function loadTasks() {
  try {
    const saved = localStorage.getItem("onboardai-checklist-tasks");
    return saved ? JSON.parse(saved) : initialTasks.map(task => ({ ...task }));
  } catch {
    return initialTasks.map(task => ({ ...task }));
  }
}

function saveTasks() {
  try { localStorage.setItem("onboardai-checklist-tasks", JSON.stringify(tasks)); } catch {}
}

function getVisibleTasks() {
  const query = searchInput.value.trim().toLocaleLowerCase("vi");
  return tasks.filter(task => {
    const matchesFilter = currentFilter === "all"
      || (currentFilter === "completed" && task.completed)
      || (currentFilter === "pending" && !task.completed);
    const matchesSearch = `${task.title} ${task.description}`.toLocaleLowerCase("vi").includes(query);
    return matchesFilter && matchesSearch;
  });
}

function renderTasks() {
  const visible = getVisibleTasks();
  taskList.innerHTML = visible.map(task => `
    <article class="task-card">
      <input class="task-checkbox" type="checkbox" id="task-${task.id}" data-task-id="${task.id}"
        ${task.completed ? "checked" : ""} aria-label="Đánh dấu ${escapeHTML(task.title)} hoàn thành">
      <div class="task-icon" aria-hidden="true">${task.icon}</div>
      <div class="task-details">
        <h3>${escapeHTML(task.title)}</h3>
        <p>${escapeHTML(task.description)}</p>
        <span class="task-due">▦ &nbsp;Hạn hoàn thành: ${escapeHTML(task.due)}</span>
      </div>
      <span class="status-pill ${task.completed ? "completed" : ""}">${task.completed ? "Đã hoàn thành" : "Đang chờ"}</span>
    </article>
  `).join("");
  emptyState.hidden = visible.length > 0;
  document.getElementById("taskTotalLabel").textContent = `${visible.length} nhiệm vụ`;
  updateProgress();
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const percent = total ? Math.round(completed / total * 100) : 0;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("totalCount").textContent = total;
  document.getElementById("progressPercent").textContent = `${percent}%`;
  document.getElementById("inlinePercent").textContent = `${percent}%`;
  document.getElementById("progressFill").style.width = `${percent}%`;
  document.getElementById("progressRing").style.background = `conic-gradient(var(--purple) ${percent}%, #eeeef7 0)`;
  document.getElementById("progressRing").setAttribute("aria-label", `Tiến độ ${percent} phần trăm`);
  document.getElementById("progressBar").setAttribute("aria-valuenow", percent);
  document.getElementById("doneStat").textContent = completed;
  document.getElementById("pendingStat").textContent = pending;
  document.getElementById("overdueStat").textContent = "0";
  document.getElementById("allTabCount").textContent = total;
  document.getElementById("pendingTabCount").textContent = pending;
  document.getElementById("completedTabCount").textContent = completed;
}

taskList.addEventListener("change", event => {
  const checkbox = event.target.closest("[data-task-id]");
  if (!checkbox) return;
  const task = tasks.find(item => item.id === Number(checkbox.dataset.taskId));
  if (!task) return;
  task.completed = checkbox.checked;
  saveTasks();
  renderTasks();
});

document.querySelectorAll(".filter-tab").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach(tab => {
      const active = tab === button;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-pressed", String(active));
    });
    renderTasks();
  });
});

searchInput.addEventListener("input", renderTasks);

document.getElementById("menuButton").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  const open = sidebar.classList.toggle("open");
  document.getElementById("menuButton").setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 850) {
      document.getElementById("sidebar").classList.remove("open");
      document.getElementById("menuButton").setAttribute("aria-expanded", "false");
    }
  });
});

document.getElementById("aiHelpButton").addEventListener("click", () => {
  const response = document.getElementById("aiResponse");
  response.hidden = !response.hidden;
  document.getElementById("aiHelpButton").textContent = response.hidden ? "✧ Trợ lý AI" : "Ẩn trợ lý";
});

renderTasks();
