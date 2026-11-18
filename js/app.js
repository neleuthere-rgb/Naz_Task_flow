    const resources = window.CampusResources;
    const tasks = window.CampusTasks;

    const categories = ["All services", "Academic support", "Technology", "Student services", "Wellness"];
    const state = {
      category: "All services",
      query: "",
      view: "discover",
      saved: new Set(),
      selectedTaskId: tasks[0].id,
      taskProgress: Object.fromEntries(tasks.map(task => [task.id, {
        step: 0, complete: false, category: "All services", query: ""
      }]))
    };
    const appShell = document.getElementById("app-shell");
    const loginScreen = document.getElementById("login-screen");
    const loginForm = document.getElementById("login-form");
    const grid = document.getElementById("resource-grid");
    const filters = document.getElementById("filters");
    const searchInput = document.getElementById("search-input");
    const modalBackdrop = document.getElementById("modal-backdrop");
    const modalBody = document.getElementById("modal-body");
    const toast = document.getElementById("toast");
    const taskSelect = document.getElementById("task-select");
    let toastTimer;
    let lastFocusedElement;

    function renderFilters() {
      filters.innerHTML = categories.map(category => `
        <button class="filter-chip ${state.category === category ? "active" : ""}" type="button"
          data-category="${escapeHtml(category)}" aria-pressed="${state.category === category}">
          ${escapeHtml(category)}
        </button>`).join("");
    }

    function visibleResources() {
      const query = state.query.trim().toLowerCase();
      return resources.filter(resource => {
        const categoryMatches = state.category === "All services" || resource.category === state.category;
        const viewMatches = state.view !== "saved" || state.saved.has(resource.id);
        const queryMatches = !query || [resource.name, resource.category, resource.location, resource.description]
          .some(value => value.toLowerCase().includes(query));
        return categoryMatches && viewMatches && queryMatches;
      });
    }

    function renderCards() {
      const visible = visibleResources();
      document.getElementById("result-count").textContent = `${visible.length} ${visible.length === 1 ? "service" : "services"}`;
      if (state.view === "saved") {
        document.getElementById("directory-title").textContent = "Your saved services";
        document.getElementById("directory-subtitle").textContent = "Keep your go-to resources close";
      } else {
        document.getElementById("directory-title").textContent = "Explore services";
        document.getElementById("directory-subtitle").textContent = "A few helpful places to get started";
      }
      if (!visible.length) {
        const message = state.view === "saved" && !state.saved.size
          ? ["Nothing saved yet", "Tap the heart on a service card to keep it here."]
          : ["No services found", "Try another search or choose a different category."];
        grid.innerHTML = `<div class="empty-state"><strong>${message[0]}</strong><span>${message[1]}</span></div>`;
      } else {
        grid.innerHTML = visible.map(resource => `
          <article class="resource-card">
            <button class="card-open" type="button" data-open="${resource.id}" aria-label="View ${escapeHtml(resource.name)}"></button>
            <div class="card-top">
              <span class="resource-icon ${resource.tone}" aria-hidden="true">${resource.icon}</span>
              <button class="favorite ${state.saved.has(resource.id) ? "saved" : ""}" type="button"
                data-favorite="${resource.id}" aria-label="${state.saved.has(resource.id) ? "Remove" : "Save"} ${escapeHtml(resource.name)}"
                aria-pressed="${state.saved.has(resource.id)}">${state.saved.has(resource.id) ? "♥" : "♡"}</button>
            </div>
            <h3>${escapeHtml(resource.name)}</h3>
            <div class="resource-category">${escapeHtml(resource.category)}</div>
            <div class="card-meta">
              <span class="location">${escapeHtml(resource.location)}</span>
              <span class="open-status"><i class="status-dot ${resource.open ? "" : "closed"}"></i>${resource.open ? "Open today" : "Check hours"}</span>
            </div>
          </article>`).join("");
      }
      document.getElementById("saved-count").textContent = state.saved.size;
      renderPopular();
    }

    function currentTask() {
      return tasks.find(task => task.id === state.selectedTaskId);
    }

    function currentTaskProgress() {
      return state.taskProgress[state.selectedTaskId];
    }

    function saveTaskDirectoryState() {
      const progress = currentTaskProgress();
      progress.category = state.category;
      progress.query = state.query;
    }

    function renderTaskProgress() {
      const task = currentTask();
      const progress = currentTaskProgress();
      const steps = [...document.querySelectorAll("[data-task-step]")];
      const progressValue = progress.complete ? steps.length : Math.max(0, progress.step - 1);
      const track = document.getElementById("task-progress-track");
      const fill = document.getElementById("task-progress-fill");
      const status = document.getElementById("task-progress-status");
      const completed = tasks.filter(item => state.taskProgress[item.id].complete).length;
      document.getElementById("task-counter").textContent = `${completed} of ${tasks.length} tasks completed`;
      taskSelect.value = task.id;
      steps[0].querySelector("small").textContent = task.category;
      steps[1].querySelector("small").textContent = `Look for ${task.search}`;
      steps[2].querySelector("small").textContent = `Open ${resources.find(item => item.id === task.resourceId).name}`;
      document.getElementById("start-task-flow-panel").innerHTML =
        `${progress.step === 0 ? "Start task" : "Restart task"} <span aria-hidden="true">→</span>`;
      track.setAttribute("aria-valuenow", progressValue);
      fill.style.width = `${(progressValue / steps.length) * 100}%`;
      steps.forEach((step, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < progress.step || progress.complete;
        const isActive = !progress.complete && progress.step === stepNumber;
        step.classList.toggle("is-complete", isComplete);
        step.classList.toggle("is-active", isActive);
        if (isActive) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
        step.querySelector(".task-step-number").textContent = isComplete ? "✓" : stepNumber;
      });

      if (progress.complete) {
        status.textContent = "Task complete — you reached the request preview.";
      } else if (progress.step === 0) {
        status.textContent = `Select Start task, then choose ${task.category}. Or choose that category to start here.`;
      } else {
        const activeStep = steps[progress.step - 1];
        status.textContent = `Step ${progress.step} of ${steps.length}: ${activeStep.querySelector("strong").textContent}`;
      }
    }

    function advanceTaskFlow(step) {
      const progress = currentTaskProgress();
      if (progress.step !== step - 1 || progress.complete) return;
      progress.step = step;
      renderTaskProgress();
    }

    function renderPopular() {
      const popular = resources.filter(resource => resource.popular);
      document.getElementById("popular-list").innerHTML = popular.map(resource => `
        <button class="popular-item" type="button" data-open="${resource.id}">
          <span class="popular-icon" aria-hidden="true">${resource.icon}</span>
          <span><span class="popular-name">${escapeHtml(resource.name)}</span><span class="popular-type">${escapeHtml(resource.category)}</span></span>
        </button>`).join("");
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      })[character]);
    }

    function showToast(message) {
      toast.textContent = message;
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.hidden = true; }, 2500);
    }

    function openModal(content) {
      lastFocusedElement = document.activeElement;
      modalBody.innerHTML = content;
      modalBackdrop.hidden = false;
      document.body.style.overflow = "hidden";
      document.getElementById("modal-close").focus();
    }

    function closeModal() {
      modalBackdrop.hidden = true;
      document.body.style.overflow = "";
      if (lastFocusedElement) lastFocusedElement.focus();
    }

    function showResource(id) {
      const resource = resources.find(item => item.id === id);
      if (!resource) return;
      openModal(`
        <div class="modal-heading">
          <span class="resource-icon ${resource.tone}" aria-hidden="true">${resource.icon}</span>
          <div><h2 id="modal-title">${escapeHtml(resource.name)}</h2><p>${escapeHtml(resource.category)}</p></div>
        </div>
        <p class="modal-description">${escapeHtml(resource.description)}</p>
        <div class="detail-list">
          <div class="detail-row"><span aria-hidden="true">⌖</span><div><strong>Location</strong>${escapeHtml(resource.location)}</div></div>
          <div class="detail-row"><span aria-hidden="true">◷</span><div><strong>Sample hours</strong>${escapeHtml(resource.hours)}</div></div>
          <div class="detail-row"><span aria-hidden="true">☎</span><div><strong>Contact</strong>${escapeHtml(resource.phone)} · ${escapeHtml(resource.email)}</div></div>
        </div>
        <div class="form-hint">Demo information only. These names, hours, phone numbers, and email addresses are fictional placeholders.</div>
        <div class="modal-actions">
          <button class="primary-button" type="button" data-request="${resource.id}">Ask about this service</button>
          <button class="secondary-button" type="button" data-save-modal="${resource.id}">${state.saved.has(resource.id) ? "♥ Saved" : "♡ Save service"}</button>
        </div>`);
    }

    function startTaskFlow() {
      const progress = currentTaskProgress();
      state.view = "discover";
      state.category = "All services";
      state.query = "";
      progress.step = 1;
      progress.complete = false;
      saveTaskDirectoryState();
      searchInput.value = "";
      document.querySelectorAll(".nav-button").forEach(button => {
        const active = button.dataset.view === "discover";
        button.classList.toggle("active", active);
        if (active) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      });
      renderFilters();
      renderCards();
      renderTaskProgress();
      document.getElementById("task-flow-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function showRequestForm(serviceId = "") {
      const selected = resources.find(item => item.id === serviceId);
      if (serviceId === currentTask().resourceId) advanceTaskFlow(5);
      openModal(`
        <div class="modal-heading">
          <span class="resource-icon tone-lilac" aria-hidden="true">✉️</span>
          <div><h2 id="modal-title">Request information</h2><p>We’ll help point you in the right direction.</p></div>
        </div>
        <form id="request-form">
          <label class="form-label" for="request-topic">What do you need help with?</label>
          <select class="form-control" id="request-topic" name="topic" required>
            <option value="">Choose a topic</option>
            ${resources.map(item => `<option value="${item.id}" ${selected && selected.id === item.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}
            <option value="other">Something else</option>
          </select>
          <label class="form-label" for="request-message">A little more detail</label>
          <textarea class="form-control" id="request-message" name="message" maxlength="400" required placeholder="Please don’t include personal or sensitive information."></textarea>
          <p class="form-hint">Prototype only: this demo does not send or store your message. A real app needs a secure backend and a verified contact process.</p>
          <button class="primary-button" type="submit">Preview request</button>
        </form>`);
      document.getElementById("request-topic").focus();
    }

    filters.addEventListener("click", event => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      state.category = button.dataset.category;
      saveTaskDirectoryState();
      renderFilters();
      renderCards();
      const progress = currentTaskProgress();
      if (state.category === currentTask().category) {
        if (progress.step === 0 && !progress.complete) {
          progress.step = 2;
          renderTaskProgress();
        } else {
          advanceTaskFlow(2);
        }
      }
    });

    searchInput.addEventListener("input", () => {
      state.query = searchInput.value;
      saveTaskDirectoryState();
      renderCards();
      const task = currentTask();
      if (state.category === task.category &&
          state.query.trim().toLowerCase().includes(task.searchMatch || task.search) &&
          visibleResources().some(resource => resource.id === task.resourceId)) {
        advanceTaskFlow(3);
      }
    });

    document.addEventListener("click", event => {
      const openButton = event.target.closest("[data-open]");
      if (openButton) {
        if (openButton.dataset.open === currentTask().resourceId) advanceTaskFlow(4);
        showResource(openButton.dataset.open);
        return;
      }
      const favoriteButton = event.target.closest("[data-favorite]");
      if (favoriteButton) {
        const id = favoriteButton.dataset.favorite;
        if (state.saved.has(id)) state.saved.delete(id);
        else state.saved.add(id);
        renderCards();
        return;
      }
      const saveFromModal = event.target.closest("[data-save-modal]");
      if (saveFromModal) {
        const id = saveFromModal.dataset.saveModal;
        if (state.saved.has(id)) state.saved.delete(id);
        else state.saved.add(id);
        renderCards();
        showResource(id);
        return;
      }
      const askButton = event.target.closest("[data-request]");
      if (askButton) {
        showRequestForm(askButton.dataset.request);
        return;
      }
      const navButton = event.target.closest("[data-view]");
      if (navButton) {
        document.querySelectorAll(".nav-button").forEach(button => {
          const active = button === navButton;
          button.classList.toggle("active", active);
          if (active) button.setAttribute("aria-current", "page");
          else button.removeAttribute("aria-current");
        });
        if (navButton.dataset.view === "task-flow") {
          document.getElementById("task-flow-panel").scrollIntoView({ behavior: "smooth", block: "start" });
          document.getElementById("task-flow-title").focus({ preventScroll: true });
          return;
        }
        state.view = navButton.dataset.view;
        if (state.view === "about") {
          openModal(`
            <div class="modal-heading"><span class="resource-icon tone-blue" aria-hidden="true">🧭</span><div><h2 id="modal-title">About this prototype</h2><p>COP4301 · Activity 2</p></div></div>
            <p class="modal-description">Campus Compass is a visual concept for a mobile-friendly campus services directory. This front-end prototype demonstrates search, category filters, saved services, detail views, and a guided task flow from finding a service through previewing an information request.</p>
            <div class="form-success">All displayed service information is fictional demo content. The form does not transmit or save data. A real release needs verified campus records, privacy rules, and a secure backend.</div>`);
          state.view = "discover";
          return;
        }
        renderCards();
        document.getElementById("directory-title").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (event.target === modalBackdrop || event.target.closest("#modal-close")) closeModal();
    });

    document.getElementById("request-button").addEventListener("click", () => showRequestForm());
    document.getElementById("help-shortcut").addEventListener("click", () => showRequestForm());
    document.getElementById("start-task-flow-panel").addEventListener("click", startTaskFlow);
    taskSelect.addEventListener("change", () => {
      const task = tasks.find(item => item.id === taskSelect.value);
      if (!task) {
        taskSelect.value = state.selectedTaskId;
        return;
      }
      state.selectedTaskId = task.id;
      const progress = currentTaskProgress();
      state.category = progress.category;
      state.query = progress.query;
      state.view = "discover";
      searchInput.value = state.query;
      document.querySelectorAll(".nav-button").forEach(button => {
        const active = button.dataset.view === "discover";
        button.classList.toggle("active", active);
        if (active) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      });
      renderFilters();
      renderCards();
      renderTaskProgress();
    });
    document.getElementById("mobile-saved").addEventListener("click", () => {
      const savedButton = document.querySelector('[data-view="saved"]');
      savedButton.click();
    });

    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      const username = document.getElementById("login-username").value.trim().toLowerCase();
      const password = document.getElementById("login-password").value;
      if (username !== "test@campus.local" || password !== "Local@campass16") {
        document.getElementById("login-error").textContent = "That username or password did not match the demo credentials.";
        document.getElementById("login-password").select();
        return;
      }
      document.getElementById("login-error").textContent = "";
      document.getElementById("login-password").value = "";
      loginScreen.hidden = true;
      appShell.hidden = false;
      document.getElementById("search-input").focus();
    });

    document.getElementById("logout-button").addEventListener("click", () => {
      appShell.hidden = true;
      loginScreen.hidden = false;
      loginForm.reset();
      document.getElementById("login-error").textContent = "";
      document.getElementById("login-username").focus();
    });

    modalBackdrop.addEventListener("submit", event => {
      if (event.target.id !== "request-form") return;
      event.preventDefault();
      const formData = new FormData(event.target);
      if (!formData.get("topic") || !String(formData.get("message") || "").trim()) return;
      const progress = currentTaskProgress();
      if (progress.step === 5 && formData.get("topic") === currentTask().resourceId) {
        progress.complete = true;
        renderTaskProgress();
      }
      modalBody.innerHTML = `
        <div class="modal-heading"><span class="resource-icon tone-mint" aria-hidden="true">✓</span><div><h2 id="modal-title">Request preview ready</h2><p>Nothing was sent or saved.</p></div></div>
        <p class="modal-description">Your form was validated in this local demo. A real version would need a secure destination and a clear response process before requests could be submitted.</p>
        <div class="form-success">Thanks for trying the prototype. Your sample message stays in this browser session and will be discarded when you close the page.</div>`;
      document.getElementById("modal-close").focus();
    });

    modalBackdrop.addEventListener("keydown", event => {
      if (event.key === "Escape") closeModal();
      if (event.key !== "Tab") return;
      const focusable = [...modalBackdrop.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    taskSelect.innerHTML = tasks.map(task =>
      `<option value="${escapeHtml(task.id)}">${escapeHtml(task.title)}</option>`
    ).join("");
    renderFilters();
    renderCards();
    renderTaskProgress();
