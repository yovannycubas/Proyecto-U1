/* ===================================================
   TASKFLOW – app.js
   Lógica completa: CRUD, filtros, búsqueda, localStorage
   =================================================== */

'use strict';

/* ---------- CONSTANTS & STATE ---------- */
const STORAGE_KEY = 'taskflow_tasks';

let tasks  = loadTasks();
let filter = 'all';      // 'all' | 'pending' | 'completed'
let query  = '';
let pendingDeleteId = null;

/* ---------- DOM REFERENCES ---------- */
const taskList        = document.getElementById('task-list');
const emptyState      = document.getElementById('empty-state');
const statTotal       = document.getElementById('stat-total');
const statPending     = document.getElementById('stat-pending');
const statDone        = document.getElementById('stat-done');

const searchInput     = document.getElementById('search-input');
const btnClearSearch  = document.getElementById('btn-clear-search');

const btnAddTask      = document.getElementById('btn-add-task');
const taskModal       = document.getElementById('task-modal');
const modalTitle      = document.getElementById('modal-title');
const taskForm        = document.getElementById('task-form');
const taskIdInput     = document.getElementById('task-id');
const taskTitleInput  = document.getElementById('task-title');
const taskDescInput   = document.getElementById('task-desc');
const errorTitle      = document.getElementById('error-title');
const errorDesc       = document.getElementById('error-desc');
const charCount       = document.getElementById('char-count');
const btnCloseModal   = document.getElementById('btn-close-modal');
const btnCancelModal  = document.getElementById('btn-cancel-modal');

const confirmModal    = document.getElementById('confirm-modal');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnConfirmDel   = document.getElementById('btn-confirm-delete');

const filterBtns      = document.querySelectorAll('.filter-btn');
const toast           = document.getElementById('toast');

/* =====================================================
   DATA LAYER
   ===================================================== */

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* =====================================================
   CRUD
   ===================================================== */

function addTask(title, description) {
  const task = {
    id:          generateId(),
    title:       title.trim(),
    description: description.trim(),
    completed:   false,
    createdAt:   new Date().toISOString(),
  };
  tasks.unshift(task);
  saveTasks();
  return task;
}

function updateTask(id, title, description) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.title       = title.trim();
  task.description = description.trim();
  task.updatedAt   = new Date().toISOString();
  saveTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
}

/* =====================================================
   FILTERING
   ===================================================== */

function getFiltered() {
  return tasks.filter(task => {
    const matchStatus =
      filter === 'all' ||
      (filter === 'pending'   && !task.completed) ||
      (filter === 'completed' &&  task.completed);

    const q = query.toLowerCase();
    const matchText =
      !q ||
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q);

    return matchStatus && matchText;
  });
}

/* =====================================================
   RENDER
   ===================================================== */

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function highlightText(text, q) {
  if (!q) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const escapedQ = escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(
    new RegExp(`(${escapedQ})`, 'gi'),
    '<mark style="background:rgba(124,92,252,0.35);border-radius:2px;color:inherit">$1</mark>'
  );
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTasks() {
  const filtered = getFiltered();
  updateStats();
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  const fragment = document.createDocumentFragment();

  filtered.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card${task.completed ? ' completed' : ''}`;
    card.dataset.id = task.id;
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `Tarea: ${task.title}`);

    const badgeClass  = task.completed ? 'badge-completed' : 'badge-pending';
    const badgeLabel  = task.completed ? 'Completada' : 'Pendiente';
    const titleHtml   = highlightText(task.title, query);
    const descHtml    = highlightText(task.description, query);
    const dateLabel   = `Creada el ${formatDate(task.createdAt)}`;
    const checkLabel  = task.completed ? 'Marcar como pendiente' : 'Marcar como completada';

    card.innerHTML = `
      <div class="task-checkbox" role="checkbox" aria-checked="${task.completed}"
           aria-label="${checkLabel}" tabindex="0" data-action="toggle" data-id="${task.id}"></div>
      <div class="task-content">
        <div class="task-title">${titleHtml}</div>
        <div class="task-desc">${descHtml}</div>
        <div class="task-meta">
          <span class="task-badge ${badgeClass}">${badgeLabel}</span>
          <span class="task-date">${dateLabel}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn edit" data-action="edit" data-id="${task.id}" aria-label="Editar tarea">✏️</button>
        <button class="action-btn delete" data-action="delete" data-id="${task.id}" aria-label="Eliminar tarea">🗑️</button>
      </div>
    `;

    fragment.appendChild(card);
  });

  taskList.appendChild(fragment);
}

function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending   = total - completed;

  statTotal.textContent   = total;
  statPending.textContent = pending;
  statDone.textContent    = completed;
}

/* =====================================================
   MODAL HELPERS
   ===================================================== */

function openAddModal() {
  taskIdInput.value  = '';
  taskTitleInput.value = '';
  taskDescInput.value  = '';
  errorTitle.textContent = '';
  errorDesc.textContent  = '';
  taskTitleInput.classList.remove('error');
  taskDescInput.classList.remove('error');
  charCount.textContent = '0 / 300';
  modalTitle.textContent = 'Nueva Tarea';
  document.getElementById('btn-save-task').textContent = 'Guardar Tarea';
  showModal(taskModal);
  taskTitleInput.focus();
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  taskIdInput.value      = task.id;
  taskTitleInput.value   = task.title;
  taskDescInput.value    = task.description;
  errorTitle.textContent = '';
  errorDesc.textContent  = '';
  taskTitleInput.classList.remove('error');
  taskDescInput.classList.remove('error');
  charCount.textContent = `${task.description.length} / 300`;
  modalTitle.textContent = 'Editar Tarea';
  document.getElementById('btn-save-task').textContent = 'Actualizar Tarea';
  showModal(taskModal);
  taskTitleInput.focus();
}

function closeTaskModal() {
  hideModal(taskModal);
}

function showModal(el) {
  el.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function hideModal(el) {
  el.style.display = 'none';
  document.body.style.overflow = '';
}

/* =====================================================
   FORM VALIDATION
   ===================================================== */

function validateForm() {
  let valid = true;
  const title = taskTitleInput.value.trim();
  const desc  = taskDescInput.value.trim();

  if (!title) {
    errorTitle.textContent = 'El título es obligatorio.';
    taskTitleInput.classList.add('error');
    valid = false;
  } else {
    errorTitle.textContent = '';
    taskTitleInput.classList.remove('error');
  }

  if (!desc) {
    errorDesc.textContent = 'La descripción es obligatoria.';
    taskDescInput.classList.add('error');
    valid = false;
  } else {
    errorDesc.textContent = '';
    taskDescInput.classList.remove('error');
  }

  return valid;
}

/* =====================================================
   TOAST
   ===================================================== */

let toastTimer = null;

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className   = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/* =====================================================
   EVENT HANDLERS
   ===================================================== */

/* -- Add Task Button -- */
btnAddTask.addEventListener('click', openAddModal);

/* -- Close / Cancel Modal -- */
btnCloseModal.addEventListener('click', closeTaskModal);
btnCancelModal.addEventListener('click', closeTaskModal);

/* -- Close modal on overlay click -- */
taskModal.addEventListener('click', e => {
  if (e.target === taskModal) closeTaskModal();
});
confirmModal.addEventListener('click', e => {
  if (e.target === confirmModal) hideModal(confirmModal);
});

/* -- Save/Update Task -- */
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;

  const id    = taskIdInput.value;
  const title = taskTitleInput.value.trim();
  const desc  = taskDescInput.value.trim();

  if (id) {
    updateTask(id, title, desc);
    showToast('✅ Tarea actualizada correctamente');
  } else {
    addTask(title, desc);
    showToast('🎉 Tarea agregada exitosamente');
  }

  closeTaskModal();
  renderTasks();
});

/* -- Character counter -- */
taskDescInput.addEventListener('input', () => {
  charCount.textContent = `${taskDescInput.value.length} / 300`;
});

/* -- Search -- */
searchInput.addEventListener('input', () => {
  query = searchInput.value.trim();
  btnClearSearch.style.display = query ? 'block' : 'none';
  renderTasks();
});

btnClearSearch.addEventListener('click', () => {
  searchInput.value = '';
  query = '';
  btnClearSearch.style.display = 'none';
  renderTasks();
  searchInput.focus();
});

/* -- Filters -- */
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    renderTasks();
  });
});

/* -- Task List Delegation (toggle, edit, delete) -- */
taskList.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const id     = el.dataset.id;

  if (action === 'toggle') {
    toggleTask(id);
    const task = tasks.find(t => t.id === id);
    showToast(task?.completed ? '✅ Marcada como completada' : '🔄 Marcada como pendiente');
    renderTasks();
  }

  if (action === 'edit') {
    openEditModal(id);
  }

  if (action === 'delete') {
    pendingDeleteId = id;
    showModal(confirmModal);
  }
});

/* -- Keyboard: checkbox toggle with Space/Enter -- */
taskList.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') {
    const el = e.target.closest('[data-action="toggle"]');
    if (el) {
      e.preventDefault();
      el.click();
    }
  }
});

/* -- Confirm Delete -- */
btnConfirmDel.addEventListener('click', () => {
  if (pendingDeleteId) {
    deleteTask(pendingDeleteId);
    pendingDeleteId = null;
    hideModal(confirmModal);
    showToast('🗑️ Tarea eliminada', 'error');
    renderTasks();
  }
});

btnCancelDelete.addEventListener('click', () => {
  pendingDeleteId = null;
  hideModal(confirmModal);
});

/* -- Close modals with Escape key -- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (taskModal.style.display === 'flex')    closeTaskModal();
    if (confirmModal.style.display === 'flex') { pendingDeleteId = null; hideModal(confirmModal); }
  }
});

/* =====================================================
   INIT
   ===================================================== */

// Add sample tasks if first visit
if (tasks.length === 0) {
  tasks = [
    {
      id: generateId(),
      title: 'Revisar correo electrónico',
      description: 'Responder mensajes pendientes del equipo y clientes importantes.',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: generateId(),
      title: 'Preparar presentación semanal',
      description: 'Elaborar diapositivas para la reunión del lunes con el equipo de marketing.',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: generateId(),
      title: 'Actualizar dependencias del proyecto',
      description: 'Revisar y actualizar las librerías del proyecto a sus versiones más recientes.',
      completed: true,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];
  saveTasks();
}

renderTasks();
