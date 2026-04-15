const checkbox = document.getElementById("todo-complete-toggle");
const title = document.getElementById("todo-title");
const statusControl = document.getElementById("todo-status");
const timeRemaining = document.getElementById("todo-time-remaining");
const dueDateElement = document.getElementById("todo-due-date");
const editBtn = document.getElementById("edit-btn");
const deleteBtn = document.getElementById("delete-btn");
const todoCard = document.querySelector('[data-testid="test-todo-card"]');

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

const overdueIndicator = document.getElementById("todo-overdue-indicator");
let timeRemainingIntervalId = null;


function getTimeRemainingState(due, now) {
  const diffMs = due.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);

  if (absMs < minute) {
    return {
      text: "Due now!",
      isOverdue: false
    };
  }

  if (diffMs > 0) {
    const days = Math.floor(diffMs / day);
    const hours = Math.floor(diffMs / hour);
    const minutes = Math.floor(diffMs / minute);

    if (days >= 1) {
      return {
        text: `Due in ${days} day${days === 1 ? "" : "s"}`,
        isOverdue: false
      };
    }

    if (hours >= 1) {
      return {
        text: `Due in ${hours} hour${hours === 1 ? "" : "s"}`,
        isOverdue: false
      };
    }

    return {
      text: `Due in ${minutes} minute${minutes === 1 ? "" : "s"}`,
      isOverdue: false
    };
  }

  const overdueDays = Math.floor(absMs / day);
  const overdueHours = Math.floor(absMs / hour);
  const overdueMinutes = Math.floor(absMs / minute);

  if (overdueDays >= 1) {
    return {
      text: `Overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`,
      isOverdue: true
    };
  }

  if (overdueHours >= 1) {
    return {
      text: `Overdue by ${overdueHours} hour${overdueHours === 1 ? "" : "s"}`,
      isOverdue: true
    };
  }

  return {
    text: `Overdue by ${overdueMinutes} minute${overdueMinutes === 1 ? "" : "s"}`,
    isOverdue: true
  };
}

function updateTimeRemaining() {
  if (statusControl.value === "Done") {
    timeRemaining.textContent = "Completed";
    timeRemaining.classList.remove("is-overdue");
    overdueIndicator.hidden = true;
    return;
  }

  const now = new Date();
  const timeState = getTimeRemainingState(dueDate, now);

  timeRemaining.textContent = timeState.text;
  timeRemaining.classList.toggle("is-overdue", timeState.isOverdue);
  overdueIndicator.hidden = !timeState.isOverdue;
}

function startTimeRemainingUpdates() {
  if (timeRemainingIntervalId !== null) {
    return;
  }

  timeRemainingIntervalId = setInterval(updateTimeRemaining, 30000);
}

function stopTimeRemainingUpdates() {
  if (timeRemainingIntervalId === null) {
    return;
  }

  clearInterval(timeRemainingIntervalId);
  timeRemainingIntervalId = null;
}

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
  todoCard.classList.toggle("is-done", newStatus === "Done");

  if (newStatus === "Done") {
    statusControl.classList.add("done");
    checkbox.checked = true;
    title.classList.add("completed");
    stopTimeRemainingUpdates();
  } else if (newStatus === "Pending") {
    statusControl.classList.add("pending");
    checkbox.checked = false;
    title.classList.remove("completed");
    startTimeRemainingUpdates();
  } else {
    statusControl.classList.add("in-progress");
    checkbox.checked = false;
    title.classList.remove("completed");
    startTimeRemainingUpdates();
  }

  updateTimeRemaining();
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
  editTitleInput.focus();
}

function exitEditMode() {
  editForm.hidden = true;
  editBtn.hidden = false;
  editBtn.focus();
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

function updateDueDateText() {
  dueDateElement.setAttribute("datetime", dueDate.toISOString());
  timeRemaining.setAttribute("datetime", dueDate.toISOString());
  dueDateElement.textContent = `Due ${formatDueDate(dueDate)}`;
}

statusControl.addEventListener("change", function () {
  setStatus(statusControl.value);
});

checkbox.addEventListener("change", function () {
  setStatus(checkbox.checked ? "Done" : "Pending");
});

editBtn.addEventListener("click", enterEditMode);
saveBtn.addEventListener("click", saveEditedContent);
cancelBtn.addEventListener("click", exitEditMode);

saveBtn.tabIndex = 6;
cancelBtn.tabIndex = 7;

deleteBtn.addEventListener("click", function () {
  alert("Delete clicked");
});

updateDueDateText();
initDescriptionCollapse();
setStatus(statusControl.value);
