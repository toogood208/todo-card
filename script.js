const checkbox = document.getElementById("todo-complete-toggle");
const title = document.getElementById("todo-title");
const status = document.getElementById("todo-status");
const timeRemaining = document.getElementById("todo-time-remaining");
const dueDateElement = document.getElementById("todo-due-date");
const editBtn = document.getElementById("edit-btn");
const deleteBtn = document.getElementById("delete-btn");

const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;
const dueDate = new Date(Date.now() + 3 * day + 12 * hour);

function formatDueDate(date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  });
}

function getTimeRemainingText(due, now) {
  const diffMs = due.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);

  if (absMs < minute) {
    return "Due now!";
  }

  if (diffMs > 0) {
    const days = Math.floor(diffMs / day);
    const hours = Math.floor(diffMs / hour);
    const minutes = Math.floor(diffMs / minute);

    if (days > 1) return `Due in ${days} days`;
    if (days === 1) return "Due tomorrow";
    if (hours >= 1) return `Due in ${hours} hour${hours === 1 ? "" : "s"}`;
    return `Due in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  const overdueDays = Math.floor(absMs / day);
  const overdueHours = Math.floor(absMs / hour);
  const overdueMinutes = Math.floor(absMs / minute);

  if (overdueDays >= 1) {
    return `Overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`;
  }
  if (overdueHours >= 1) {
    return `Overdue by ${overdueHours} hour${overdueHours === 1 ? "" : "s"}`;
  }
  return `Overdue by ${overdueMinutes} minute${overdueMinutes === 1 ? "" : "s"}`;
}

function updateTimeRemaining() {
  const now = new Date();
  timeRemaining.textContent = getTimeRemainingText(dueDate, now);
}

function updateDueDateText() {
  dueDateElement.setAttribute("datetime", dueDate.toISOString());
  timeRemaining.setAttribute("datetime", dueDate.toISOString());
  dueDateElement.textContent = `Due ${formatDueDate(dueDate)}`;
}

checkbox.addEventListener("change", function () {
  if (checkbox.checked) {
    title.classList.add("completed");
    status.textContent = "Done";
    status.classList.add("done");
    status.setAttribute("aria-label", "Status: Done");
  } else {
    title.classList.remove("completed");
    status.textContent = "In Progress";
    status.classList.remove("done");
    status.setAttribute("aria-label", "Status: In Progress");
  }

  updateTimeRemaining();
});

editBtn.addEventListener("click", function () {
  console.log("edit clicked");
});

deleteBtn.addEventListener("click", function () {
  alert("Delete clicked");
});

updateDueDateText();
updateTimeRemaining();

setInterval(updateTimeRemaining, 30000);
