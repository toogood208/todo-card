const checkbox = document.getElementById("todo-complete-toggle");
const title = document.getElementById("todo-title");
const statusControl = document.getElementById("todo-status");
const timeRemaining = document.getElementById("todo-time-remaining");
const dueDateElement = document.getElementById("todo-due-date");
const editBtn = document.getElementById("edit-btn");
const deleteBtn = document.getElementById("delete-btn");

const editForm = document.querySelector('[data-testid="test-todo-edit-form"]');
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const editTitleInput = document.getElementById("edit-title");
const editDescriptionInput = document.getElementById("edit-description");
const editPrioritySelect = document.getElementById("edit-priority");
const editDueDateInput = document.getElementById("edit-due-date");
const description = document.querySelector('[data-testid="test-todo-description"]');
const priorityBadge = document.querySelector('[data-testid="test-todo-priority"]');

const collapsibleSection = document.querySelector(
  '[data-testid="test-todo-collapsible-section"]'
);
const expandToggle = document.querySelector(
  '[data-testid="test-todo-expand-toggle"]'
);

const MAX_DESCRIPTION_LENGTH = 140;

const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;
const dueDate = new Date(Date.now() + 3 * day + 12 * hour);

function setDescriptionExpanded(isExpanded) {
  collapsibleSection.classList.toggle("is-collapsed", !isExpanded);
  expandToggle.textContent = isExpanded ? "Collapse" : "Expand";
  expandToggle.setAttribute("aria-expanded", String(isExpanded));
}

function initDescriptionCollapse() {
  const descriptionText = description.textContent.trim();
  const isLongDescription = descriptionText.length > MAX_DESCRIPTION_LENGTH;

  if (!isLongDescription) {
    collapsibleSection.classList.remove("is-collapsed");
    expandToggle.hidden = true;
    expandToggle.textContent = "Expand";
    expandToggle.setAttribute("aria-expanded", "false");
    return;
  }

  expandToggle.hidden = false;
  setDescriptionExpanded(false);
}

expandToggle.addEventListener("click", function () {
  const isExpanded = expandToggle.getAttribute("aria-expanded") === "true";
  setDescriptionExpanded(!isExpanded);
});

function setStatus(newStatus) {
  statusControl.value = newStatus;
  statusControl.className = "badge status status-select";

  if (newStatus === "Done") {
    statusControl.classList.add("done");
    checkbox.checked = true;
    title.classList.add("completed");
  } else if (newStatus === "Pending") {
    statusControl.classList.add("pending");
    checkbox.checked = false;
    title.classList.remove("completed");
  } else {
    statusControl.classList.add("in-progress");
    checkbox.checked = false;
    title.classList.remove("completed");
  }
}

function enterEditMode() {
  editTitleInput.value = title.textContent.trim();
  editDescriptionInput.value = description.textContent.trim();
  editPrioritySelect.value = priorityBadge.textContent.trim().toLowerCase();

  const localDate = new Date(
    dueDate.getTime() - dueDate.getTimezoneOffset() * minute
  );
  editDueDateInput.value = localDate.toISOString().slice(0, 16);

  editForm.hidden = false;
  editBtn.hidden = true;
}

function exitEditMode() {
  editForm.hidden = true;
  editBtn.hidden = false;
}

function saveEditedContent() {
  title.textContent = editTitleInput.value.trim();
  description.textContent = editDescriptionInput.value.trim();
  initDescriptionCollapse();

  const newPriority = editPrioritySelect.value;
  priorityBadge.textContent =
    newPriority.charAt(0).toUpperCase() + newPriority.slice(1);
  priorityBadge.className = `badge priority ${newPriority}`;
  priorityBadge.setAttribute("aria-label", `Priority: ${priorityBadge.textContent}`);

  const newDueDate = new Date(editDueDateInput.value);
  if (!isNaN(newDueDate.getTime())) {
    dueDate.setTime(newDueDate.getTime());
    updateDueDateText();
    updateTimeRemaining();
  }

  exitEditMode();
}

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

statusControl.addEventListener("change", function () {
  setStatus(statusControl.value);
});

checkbox.addEventListener("change", function () {
  setStatus(checkbox.checked ? "Done" : "In Progress");
  updateTimeRemaining();
});

editBtn.addEventListener("click", enterEditMode);
saveBtn.addEventListener("click", saveEditedContent);
cancelBtn.addEventListener("click", exitEditMode);

deleteBtn.addEventListener("click", function () {
  alert("Delete clicked");
});

updateDueDateText();
updateTimeRemaining();
setStatus(statusControl.value);
initDescriptionCollapse();

setInterval(updateTimeRemaining, 30000);