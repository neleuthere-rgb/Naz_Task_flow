(() => {
  const storageKey = "campus-compass-personal-tasks-v1";
  const priorities = ["Low", "Medium", "High"];
  const form = document.getElementById("personal-task-form");
  const titleInput = document.getElementById("personal-task-title");
  const priorityInput = document.getElementById("personal-task-priority");
  const filter = document.getElementById("personal-task-filter");
  const list = document.getElementById("personal-task-list");
  const counter = document.getElementById("personal-task-count");
  const status = document.getElementById("personal-task-status");
  const submit = document.getElementById("personal-task-submit");
  const cancel = document.getElementById("personal-task-cancel");
  let editingId = null;
  let tasks = [];

  function notify(message, error = false) {
    status.textContent = message;
    status.classList.toggle("is-error", error);
  }

  function readTasks() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return [];
      const value = JSON.parse(raw);
      if (!Array.isArray(value) || !value.every(task =>
        task && typeof task.id === "string" && task.id.length > 0 &&
        typeof task.title === "string" && task.title.trim().length > 0 &&
        task.title.length <= 120 && priorities.includes(task.priority) &&
        typeof task.complete === "boolean"
      ) || new Set(value.map(task => task.id)).size !== value.length) {
        throw new Error("Stored task data has an unexpected format.");
      }
      return value;
    } catch (error) {
      console.error("Could not read personal tasks:", error);
      notify("Could not read saved tasks. Check browser storage; existing data has not been changed.", true);
      return null;
    }
  }

  function saveTasks(next) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      tasks = next;
      render();
      return true;
    } catch (error) {
      console.error("Could not save personal tasks:", error);
      notify("Could not save your change. Check browser storage settings and try again.", true);
      return false;
    }
  }

  function makeButton(text, action, id, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.dataset.action = action;
    button.dataset.id = id;
    button.setAttribute("aria-label", label);
    return button;
  }

  function render() {
    const completed = tasks.filter(task => task.complete).length;
    counter.textContent = `${completed} of ${tasks.length} tasks completed`;
    list.replaceChildren();
    const visible = tasks.filter(task => filter.value === "All" || task.priority === filter.value);
    if (!visible.length) {
      const empty = document.createElement("li");
      empty.className = "personal-task-empty";
      empty.textContent = tasks.length ? "No tasks match this priority." : "No tasks yet. Add one above.";
      list.append(empty);
      return;
    }
    visible.forEach(task => {
      const item = document.createElement("li");
      item.className = `personal-task-item${task.complete ? " is-complete" : ""}`;
      const label = document.createElement("label");
      label.className = "personal-task-main";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.complete;
      checkbox.dataset.id = task.id;
      checkbox.setAttribute("aria-label", `Mark ${task.title} ${task.complete ? "incomplete" : "complete"}`);
      const content = document.createElement("span");
      const title = document.createElement("span");
      title.className = "personal-task-title";
      title.textContent = task.title;
      const priority = document.createElement("span");
      priority.className = "personal-task-priority";
      priority.textContent = `${task.priority} priority`;
      content.append(title, priority);
      label.append(checkbox, content);
      const actions = document.createElement("div");
      actions.className = "personal-task-actions";
      actions.append(
        makeButton("Edit", "edit", task.id, `Edit ${task.title}`),
        makeButton("Delete", "delete", task.id, `Delete ${task.title}`)
      );
      item.append(label, actions);
      list.append(item);
    });
  }

  function resetForm() {
    editingId = null;
    form.reset();
    submit.textContent = "Add task";
    cancel.hidden = true;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const title = titleInput.value.trim();
    if (!title || title.length > 120 || !priorities.includes(priorityInput.value)) {
      notify("Enter a task of up to 120 characters and select a priority.", true);
      titleInput.focus();
      return;
    }
    const latest = readTasks();
    if (latest === null) return;
    if (editingId !== null) {
      const task = latest.find(item => item.id === editingId);
      if (!task) {
        notify("This task no longer exists. Cancel editing or reload the page.", true);
        return;
      }
      task.title = title;
      task.priority = priorityInput.value;
    } else {
      let id;
      do {
        id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      } while (latest.some(task => task.id === id));
      latest.push({ id, title, priority: priorityInput.value, complete: false });
    }
    const wasEditing = editingId !== null;
    if (saveTasks(latest)) {
      resetForm();
      notify(wasEditing ? "Task updated." : "Task added.");
      titleInput.focus();
    }
  });

  cancel.addEventListener("click", () => {
    resetForm();
    notify("Editing cancelled.");
    titleInput.focus();
  });

  filter.addEventListener("change", render);

  list.addEventListener("change", event => {
    if (!event.target.matches('input[type="checkbox"][data-id]')) return;
    const latest = readTasks();
    if (latest === null) {
      render();
      return;
    }
    const task = latest.find(item => item.id === event.target.dataset.id);
    if (!task) {
      tasks = latest;
      render();
      notify("That task no longer exists.", true);
      return;
    }
    task.complete = event.target.checked;
    if (saveTasks(latest)) notify(task.complete ? "Task completed." : "Task reopened.");
    else render();
  });

  list.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const latest = readTasks();
    if (latest === null) return;
    const task = latest.find(item => item.id === button.dataset.id);
    if (!task) {
      tasks = latest;
      render();
      notify("That task no longer exists.", true);
      return;
    }
    if (button.dataset.action === "edit") {
      editingId = task.id;
      titleInput.value = task.title;
      priorityInput.value = task.priority;
      submit.textContent = "Save changes";
      cancel.hidden = false;
      notify("Editing task.");
      titleInput.focus();
    } else if (button.dataset.action === "delete" && window.confirm(`Delete "${task.title}"?`)) {
      if (saveTasks(latest.filter(item => item.id !== task.id))) {
        if (editingId === task.id) resetForm();
        notify("Task deleted.");
      }
    }
  });

  window.addEventListener("storage", event => {
    if (event.key !== storageKey && event.key !== null) return;
    const latest = readTasks();
    if (latest !== null) {
      tasks = latest;
      render();
      notify("Tasks updated from another tab.");
    }
  });

  const initial = readTasks();
  if (initial !== null) {
    tasks = initial;
    render();
  }
})();
