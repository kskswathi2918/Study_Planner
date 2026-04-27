/* =========================
   USER INIT
========================= */
let user = localStorage.getItem("user");

document.getElementById("welcome").innerText =
  "Welcome " + user + " 👋";

/* =========================
   LOAD DATA
========================= */
let tasks = JSON.parse(localStorage.getItem(user + "_tasks")) || [];
let habits = JSON.parse(localStorage.getItem(user + "_habits")) || {};
let heatmap = JSON.parse(localStorage.getItem(user + "_heatmap")) || {};

let xp = parseInt(localStorage.getItem(user + "_xp")) || 0;
let streak = parseInt(localStorage.getItem(user + "_streak")) || 0;

/* =========================
   NAVIGATION
========================= */
function show(id) {
  document.querySelectorAll(".page")
    .forEach(p => p.classList.remove("active"));

  document.getElementById(id).classList.add("active");
}

/* =========================
   THEME TOGGLE
========================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* =========================
   NOTIFICATIONS
========================= */
Notification.requestPermission();

function notify(msg) {
  if (Notification.permission === "granted") {
    new Notification("📘 Student OS", {
      body: msg
    });
  }
}

/* =========================
   SAVE FUNCTION
========================= */
function save() {
  localStorage.setItem(user + "_tasks", JSON.stringify(tasks));
  localStorage.setItem(user + "_habits", JSON.stringify(habits));
  localStorage.setItem(user + "_heatmap", JSON.stringify(heatmap));
  localStorage.setItem(user + "_xp", xp);
  localStorage.setItem(user + "_streak", streak);
}

/* =========================
   TASK SYSTEM
========================= */
function addTask() {
  tasks.push({
    text: task.value,
    done: false,
    date: date.value || new Date().toISOString().split("T")[0]
  });

  task.value = "";

  save();
  renderTasks();
  updateHeatmap();
  updateAI();
}

function renderTasks() {
  let list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((t, i) => {
    list.innerHTML += `
      <li>
        ${t.text}
        <input type="checkbox" onchange="toggleTask(${i})" ${t.done ? "checked" : ""}>
      </li>
    `;
  });
}

function toggleTask(i) {
  tasks[i].done = !tasks[i].done;

  if (tasks[i].done) {
    xp += 10;
    notify("Task completed! +10 XP 🔥");
  }

  save();
  renderTasks();
  updateXP();
  updateHeatmap();
  updateAI();
}

/* =========================
   HABIT SYSTEM + STREAK
========================= */
function addHabit() {
  let name = habit.value;
  if (!name) return;

  habits[name] = 0;
  habit.value = "";

  save();
  renderHabits();
}

function renderHabits() {
  let list = document.getElementById("habitList");
  list.innerHTML = "";

  for (let h in habits) {
    list.innerHTML += `
      <li>
        ${h} 🔥 ${habits[h]}
        <button onclick="incHabit('${h}')">+1</button>
      </li>
    `;
  }
}

function incHabit(h) {
  habits[h]++;

  xp += 5;
  notify("Habit done! +5 XP 🎯");

  save();
  renderHabits();
  updateXP();
}

/* =========================
   XP SYSTEM
========================= */
function updateXP() {
  document.getElementById("xpBox").innerText = "XP: " + xp;

  document.getElementById("streakBox").innerText =
    "🔥 Streak: " + streak;
}

/* =========================
   STREAK SYSTEM
========================= */
function updateStreak() {
  let today = new Date().toDateString();
  let last = localStorage.getItem(user + "_last");

  if (last !== today) {
    streak++;
    localStorage.setItem(user + "_last", today);
  }
}

/* =========================
   HEATMAP SYSTEM (REAL DATA)
========================= */
function updateHeatmap() {
  let today = new Date().toISOString().split("T")[0];

  let completed = tasks.filter(t => t.done).length;

  heatmap[today] = completed;

  save();
  renderHeatmap();
}

function renderHeatmap() {
  let grid = document.getElementById("heatmapGrid");
  grid.innerHTML = "";

  for (let i = 27; i >= 0; i--) {
    let d = new Date();
    d.setDate(d.getDate() - i);

    let key = d.toISOString().split("T")[0];

    let value = heatmap[key] || 0;

    let cell = document.createElement("div");

    if (value === 0) cell.className = "cell";
    else if (value <= 2) cell.className = "cell l1";
    else if (value <= 4) cell.className = "cell l2";
    else if (value <= 6) cell.className = "cell l3";
    else cell.className = "cell l4";

    grid.appendChild(cell);
  }
}

/* =========================
   AI PRODUCTIVITY PREDICTION
========================= */
function updateAI() {
  let done = tasks.filter(t => t.done).length;

  let msg = "";

  if (done > 7) {
    msg = "🧠 High productivity predicted tomorrow!";
  } else if (done > 3) {
    msg = "⚡ Moderate productivity expected. Improve focus.";
  } else {
    msg = "😴 Low productivity risk. Plan better today.";
  }

  document.getElementById("aiBox").innerText = msg;
}

/* =========================
   CHART SYSTEM
========================= */
function updateChart() {
  let done = tasks.filter(t => t.done).length;
  let pending = tasks.length - done;

  new Chart(document.getElementById("chart"), {
    type: "doughnut",
    data: {
      labels: ["Done", "Pending"],
      datasets: [{
        data: [done, pending],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    }
  });
}

/* =========================
   INIT APP
========================= */
renderTasks();
renderHabits();
updateHeatmap();
updateXP();
updateAI();
updateChart();
updateStreak();