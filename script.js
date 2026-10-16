"use strict";
// ==========================================
// 1. KONFIGURASI PROFIL KARYAWAN
// Ubah nama dan jabatan sesuai kebutuhan.
// ==========================================
const employee = {
  name: "Bams Kurniawan",
  role: "Software Engineer"
};
// ==========================================
// 2. MENGAMBIL ELEMEN HTML
// ==========================================
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const dueDateInput = document.getElementById("dueDateInput");
const todoList = document.getElementById("todoList");
const doneList = document.getElementById("doneList");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const STORAGE_KEY = "myDailyTasks_v1";
let tasks = loadTasks();
// ==========================================
// 3. MENAMPILKAN PROFIL
// ==========================================
document.getElementById("profileName").textContent = employee.name;
document.getElementById("profileRole").textContent = employee.role;
document.getElementById("avatar").textContent =
  employee.name.trim().charAt(0).toUpperCase() || "K";
// ==========================================
// 4. WAKTU DAN TANGGAL REAL-TIME
// ==========================================
function updateClock() {
  const now = new Date();
  const dateOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  };
  document.getElementById("currentDate").textContent =
    new Intl.DateTimeFormat("id-ID", dateOptions).format(now);
  document.getElementById("currentTime").textContent =
    new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(now);
  const hour = now.getHours();
  let greeting = "Selamat malam!";
  if (hour >= 4 && hour < 11) {
    greeting = "Selamat pagi!";
  } else if (hour >= 11 && hour < 15) {
    greeting = "Selamat siang!";
  } else if (hour >= 15 && hour < 18) {
    greeting = "Selamat sore!";
  }
  document.getElementById("greeting").textContent =
    `${greeting} ${employee.name}`;
  document.getElementById("currentYear").textContent =
    now.getFullYear();
}
updateClock();
setInterval(updateClock, 1000);
// ==========================================
// 5. MEMUAT DATA DARI LOCAL STORAGE
// ==========================================
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    // Validasi dasar agar data yang rusak diabaikan.
    return parsed.filter(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.title === "string" &&
      ["Low", "Medium", "High"].includes(task.priority) &&
      typeof task.completed === "boolean"
    );
  } catch (error) {
    console.error("Gagal membaca data tugas:", error);
    return [];
  }
}
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Gagal menyimpan data tugas:", error);
    alert("Data gagal disimpan. Periksa penyimpanan browser.");
    return false;
  }
}
// ==========================================
// 6. UTILITAS TANGGAL
// ==========================================
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function formatDate(dateString) {
  if (!dateString) return "";
  // Gunakan tengah hari agar tanggal tidak bergeser
  // akibat perbedaan zona waktu.
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}
function isOverdue(task) {
  return Boolean(
    !task.completed &&
    task.dueDate &&
    task.dueDate < getLocalDateString()
  );
}
// ==========================================
// 7. MENAMBAHKAN TUGAS
// ==========================================
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const title = taskInput.value.trim();
  const priority = priorityInput.value;
  const dueDate = dueDateInput.value;
  if (!title) {
    alert("Silakan tuliskan deskripsi pekerjaan.");
    taskInput.focus();
    return;
  }
  const newTask = {
    id: createId(),
    title: title,
    priority: priority,
    createdAt: getLocalDateString(),
    dueDate: dueDate,
    completed: false,
    completedAt: null
  };
  tasks.unshift(newTask);
  if (!saveTasks()) {
    tasks.shift();
    return;
  }
  renderTasks();
  taskForm.reset();
  // Kembalikan prioritas ke Medium.
  priorityInput.value = "Medium";
  taskInput.focus();
});
function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
// ==========================================
// 8. CHECKBOX DAN STATUS TUGAS
// ==========================================
function toggleTask(id, completed) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  const previousCompleted = task.completed;
  const previousCompletedAt = task.completedAt;
  task.completed = completed;
  task.completedAt = completed ? getLocalDateString() : null;
  if (!saveTasks()) {
    task.completed = previousCompleted;
    task.completedAt = previousCompletedAt;
    renderTasks();
    return;
  }
  renderTasks();
}
// ==========================================
// 9. MENGHAPUS SATU TUGAS
// ==========================================
function deleteTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  const confirmed = window.confirm(
    `Hapus tugas "${task.title}"?`
  );
  if (!confirmed) return;
  const previousTasks = tasks;
  tasks = tasks.filter(item => item.id !== id);
  if (!saveTasks()) {
    tasks = previousTasks;
    return;
  }
  renderTasks();
}
// ==========================================
// 10. MENGHAPUS SEMUA TUGAS
// ==========================================
deleteAllBtn.addEventListener("click", function () {
  if (tasks.length === 0) {
    alert("Belum ada tugas yang perlu dihapus.");
    return;
  }
  const confirmed = window.confirm(
    "Apakah kamu yakin ingin menghapus SEMUA tugas, termasuk yang sudah selesai?"
  );
  if (!confirmed) return;
  const previousTasks = tasks;
  tasks = [];
  if (!saveTasks()) {
    tasks = previousTasks;
    return;
  }
  renderTasks();
});
// ==========================================
// 11. MEMBUAT ELEMEN DENGAN AMAN
// ==========================================
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    // textContent mencegah input pengguna
    // diperlakukan sebagai HTML.
    element.textContent = text;
  }
  return element;
}
function createEmptyState(message, icon) {
  const empty = createElement("div", "empty-state");
  empty.appendChild(createElement("span", "", icon));
  empty.appendChild(createElement("p", "", message));
  return empty;
}
// ==========================================
// 12. MEMBUAT KARTU TUGAS
// ==========================================
function createTaskElement(task) {
  const item = createElement(
    "article",
    `task-item${task.completed ? " done-task" : ""}`
  );
  const checkbox = createElement("input", "task-checkbox");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute(
    "aria-label",
    `Tandai ${task.title} sebagai ${task.completed ? "belum selesai" : "selesai"}`
  );
  checkbox.addEventListener("change", function () {
    toggleTask(task.id, checkbox.checked);
  });
  const content = createElement("div", "task-content");
  const title = createElement("p", "task-title", task.title);
  content.appendChild(title);
  const meta = createElement("div", "task-meta");
  const priorityClass = task.priority.toLowerCase();
  meta.appendChild(
    createElement(
      "span",
      `priority priority-${priorityClass}`,
      task.priority
    )
  );
  meta.appendChild(
    createElement("span", "", `Dibuat: ${formatDate(task.createdAt)}`)
  );
  if (task.dueDate) {
    meta.appendChild(
      createElement("span", "", `Deadline: ${formatDate(task.dueDate)}`)
    );
  }
  if (task.completed && task.completedAt) {
    meta.appendChild(
      createElement("span", "", `Selesai: ${formatDate(task.completedAt)}`)
    );
  }
  if (isOverdue(task)) {
    meta.appendChild(
      createElement("span", "overdue-label", "⚠ OVERDUE")
    );
  }
  content.appendChild(meta);
  const deleteButton = createElement("button", "btn-delete", "🗑");
  deleteButton.type = "button";
  deleteButton.title = "Hapus tugas";
  deleteButton.setAttribute("aria-label", `Hapus tugas ${task.title}`);
  deleteButton.addEventListener("click", function () {
    deleteTask(task.id);
  });
  item.append(checkbox, content, deleteButton);
  return item;
}
// ==========================================
// 13. MENAMPILKAN TO DO DAN DONE
// ==========================================
function renderTasks() {
  todoList.replaceChildren();
  doneList.replaceChildren();
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  // Tugas aktif: overdue ditampilkan lebih dahulu,
  // kemudian prioritas High, Medium, Low.
  const priorityOrder = {
    High: 3,
    Medium: 2,
    Low: 1
  };
  activeTasks.sort((a, b) => {
    const overdueDifference =
      Number(isOverdue(b)) - Number(isOverdue(a));
    if (overdueDifference !== 0) {
      return overdueDifference;
    }
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
  // Tugas selesai terbaru ditampilkan lebih dahulu.
  completedTasks.sort((a, b) =>
    (b.completedAt || "").localeCompare(a.completedAt || "")
  );
  if (activeTasks.length === 0) {
    todoList.appendChild(
      createEmptyState("Belum ada tugas aktif. Tambahkan tugas baru!", "📝")
    );
  } else {
    activeTasks.forEach(task => {
      todoList.appendChild(createTaskElement(task));
    });
  }
  if (completedTasks.length === 0) {
    doneList.appendChild(
      createEmptyState("Belum ada tugas yang diselesaikan.", "🎯")
    );
  } else {
    completedTasks.forEach(task => {
      doneList.appendChild(createTaskElement(task));
    });
  }
  // Memperbarui ringkasan dashboard.
  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("todoCount").textContent = activeTasks.length;
  document.getElementById("doneCount").textContent = completedTasks.length;
  document.getElementById("overdueCount").textContent =
    activeTasks.filter(isOverdue).length;
  document.getElementById("todoBadge").textContent = activeTasks.length;
  document.getElementById("doneBadge").textContent = completedTasks.length;
}
// ==========================================
// 14. MENJALANKAN APLIKASI
// ==========================================
renderTasks();
