/* ===================================================
   TASKFLOW – app.js (v2 with Supabase)
   Auth + Cloud DB + Realtime + CRUD
   =================================================== */

'use strict';

/* ============================================================
   ⚙️  CONFIG – Replace with your Supabase project credentials
   ============================================================ */
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON = 'tu-anon-key-aqui';

/* ============================================================
   SUPABASE CLIENT
   ============================================================ */
const { createClient } = window.supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ============================================================
   STATE
   ============================================================ */
let tasks = [];
let filter = 'all';   // 'all' | 'pending' | 'completed'
let query = '';
let currentUser = null;
let pendingDeleteId = null;
let realtimeChannel = null;

/* ============================================================
   DOM REFERENCES – Auth
   ============================================================ */
const authScreen = document.getElementById('auth-screen');
const loadingOverlay = document.getElementById('loading-overlay');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const authError = document.getElementById('auth-error');
const authSuccess = document.getElementById('auth-success');
const tabBtns = document.querySelectorAll('.auth-tab');
const btnGoogle = document.getElementById('btn-google');
const btnGithub = document.getElementById('btn-github');

/* ============================================================
   DOM REFERENCES – App
   ============================================================ */
const appHeader = document.getElementById('app-header');
const appMain = document.getElementById('app-main');
const userEmailEl = document.getElementById('user-email');
const userAvatar = document.getElementById('user-avatar');
const btnLogout = document.getElementById('btn-logout');
const btnAddTask = document.getElementById('btn-add-task');

const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const statTotal = document.getElementById('stat-total');
const statPending = document.getElementById('stat-pending');
const statDone = document.getElementById('stat-done');

const searchInput = document.getElementById('search-input');
const btnClearSearch = document.getElementById('btn-clear-search');

const taskModal = document.getElementById('task-modal');
const modalTitle = document.getElementById('modal-title');
const taskForm = document.getElementById('task-form');
const taskIdInput = document.getElementById('task-id');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const errorTitle = document.getElementById('error-title');
const errorDesc = document.getElementById('error-desc');
const charCount = document.getElementById('char-count');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');

const confirmModal = document.getElementById('confirm-modal');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnConfirmDel = document.getElementById('btn-confirm-delete');

const filterBtns = document.querySelectorAll('.filter-btn');
const toast = document.getElementById('toast');

/* ============================================================
   LOADING OVERLAY
   ============================================================ */
function showLoading() { loadingOverlay.style.display = 'flex'; }
function hideLoading() { loadingOverlay.style.display = 'none'; }

/* ============================================================
   AUTH UI HELPERS
   ============================================================ */
function showApp(user) {
  currentUser = user;
  authScreen.style.display = 'none';
  appHeader.style.display = 'block';
  appMain.style.display = 'block';
  userEmailEl.textContent = user.email;
  userAvatar.textContent = user.email[0].toUpperCase();
}

function showAuth() {
  currentUser = null;
  tasks = [];
  authScreen.style.display = 'flex';
  appHeader.style.display = 'none';
  appMain.style.display = 'none';
}

function showAuthError(message) {
  authError.textContent = message;
  authError.style.display = 'block';
  authSuccess.style.display = 'none';
}

function showAuthSuccess(message) {
  authSuccess.textContent = message;
  authSuccess.style.display = 'block';
  authError.style.display = 'none';
}

function clearAuthMessages() {
  authError.style.display = 'none';
  authSuccess.style.display = 'none';
}

function translateAuthError(msg) {
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('User already registered')) return 'Este correo ya está registrado. Inicia sesión.';
  if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('Unable to validate email')) return 'Correo electrónico inválido.';
  if (msg.includes('Email not confirmed')) return 'Debes confirmar tu correo antes de iniciar sesión.';
  return msg;
}

/* ============================================================
   AUTH OPERATIONS
   ============================================================ */
async function signUp(email, password) {
  showLoading();
  clearAuthMessages();
  const { error } = await sb.auth.signUp({ email, password });
  hideLoading();
  if (error) {
    showAuthError(translateAuthError(error.message));
  } else {
    showAuthSuccess('✅ Revisa tu correo electrónico para confirmar tu cuenta.');
    registerForm.reset();
  }
}

async function signIn(email, password) {
  showLoading();
  clearAuthMessages();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  hideLoading();
  if (error) showAuthError(translateAuthError(error.message));
}

async function signInWithOAuth(provider) {
  showLoading();
  clearAuthMessages();
  const { error } = await sb.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.href },
  });
  if (error) {
    hideLoading();
    showAuthError(translateAuthError(error.message));
  }
  // On success, Supabase redirects the page — no hideLoading needed
}

async function signOut() {
  showLoading();
  unsubscribeRealtime();
  await sb.auth.signOut();
  hideLoading();
  showAuth();
  showToast('👋 Sesión cerrada correctamente');
}

/* ============================================================
   AUTH STATE LISTENER
   onAuthStateChange fires on load and whenever auth changes
   ============================================================ */
sb.auth.onAuthStateChange(async (event, session) => {
  hideLoading();
  if (session?.user) {
    showApp(session.user);
    await loadTasksFromDB();
    subscribeRealtime(session.user.id);
  } else {
    unsubscribeRealtime();
    showAuth();
  }
});

/* ============================================================
   DATABASE OPERATIONS (Supabase PostgreSQL)
   ============================================================ */
async function loadTasksFromDB() {
  if (!currentUser) return;
  showLoading();
  const { data, error } = await sb
    .from('tasks')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });
  hideLoading();
  if (error) {
    showToast('⚠️ Error al cargar tareas', 'error');
    return;
  }
  tasks = data || [];
  renderTasks();
}

async function addTask(title, description) {
  if (!currentUser) return;
  const { data, error } = await sb
    .from('tasks')
    .insert({ user_id: currentUser.id, title, description, completed: false })
    .select()
    .single();
  if (error) { showToast('⚠️ Error al agregar tarea', 'error'); return; }
  tasks.unshift(data);
  renderTasks();
}

async function updateTask(id, title, description) {
  const { error } = await sb
    .from('tasks')
    .update({ title, description })
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) { showToast('⚠️ Error al actualizar tarea', 'error'); return; }
  const task = tasks.find(t => t.id === id);
  if (task) { task.title = title; task.description = description; }
  renderTasks();
}

async function deleteTask(id) {
  const { error } = await sb
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) { showToast('⚠️ Error al eliminar tarea', 'error'); return; }
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}

async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return undefined;
  const newCompleted = !task.completed;
  const { error } = await sb
    .from('tasks')
    .update({ completed: newCompleted })
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) { showToast('⚠️ Error al actualizar tarea', 'error'); return undefined; }
  task.completed = newCompleted;
  renderTasks();
  return newCompleted;
}

/* ============================================================
   REALTIME SUBSCRIPTION (Supabase Realtime)
   Listens to INSERT/UPDATE/DELETE on 'tasks' for this user
   ============================================================ */
function subscribeRealtime(userId) {
  unsubscribeRealtime();
  realtimeChannel = sb
    .channel(`tasks-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
      () => { loadTasksFromDB(); }
    )
    .subscribe();
}

function unsubscribeRealtime() {
  if (realtimeChannel) {
    sb.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

/* ============================================================
   FILTERING
   ============================================================ */
function getFiltered() {
  return tasks.filter(task => {
    const matchStatus =
      filter === 'all' ||
      (filter === 'pending' && !task.completed) ||
      (filter === 'completed' && task.completed);

    const q = query.toLowerCase();
    const matchText =
      !q ||
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q);

    return matchStatus && matchText;
  });
}

/* ============================================================
   RENDER
   ============================================================ */
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

    const badgeClass = task.completed ? 'badge-completed' : 'badge-pending';
    const badgeLabel = task.completed ? 'Completada' : 'Pendiente';
    const titleHtml = highlightText(task.title, query);
    const descHtml = highlightText(task.description, query);
    const dateLabel = `Creada el ${formatDate(task.created_at)}`;
    const checkLabel = task.completed ? 'Marcar como pendiente' : 'Marcar como completada';

    card.innerHTML = `
      <div class="task-checkbox" role="checkbox" aria-checked="${task.completed}"
           aria-label="${checkLabel}" tabindex="0"
           data-action="toggle" data-id="${task.id}"></div>
      <div class="task-content">
        <div class="task-title">${titleHtml}</div>
        <div class="task-desc">${descHtml}</div>
        <div class="task-meta">
          <span class="task-badge ${badgeClass}">${badgeLabel}</span>
          <span class="task-date">${dateLabel}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn edit"   data-action="edit"   data-id="${task.id}" aria-label="Editar tarea">✏️</button>
        <button class="action-btn delete" data-action="delete" data-id="${task.id}" aria-label="Eliminar tarea">🗑️</button>
      </div>
    `;
    fragment.appendChild(card);
  });
  taskList.appendChild(fragment);
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  statTotal.textContent = total;
  statPending.textContent = pending;
  statDone.textContent = completed;
}

/* ============================================================
   MODAL HELPERS
   ============================================================ */
function openAddModal() {
  taskIdInput.value = '';
  taskTitleInput.value = '';
  taskDescInput.value = '';
  errorTitle.textContent = '';
  errorDesc.textContent = '';
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
  taskIdInput.value = task.id;
  taskTitleInput.value = task.title;
  taskDescInput.value = task.description;
  errorTitle.textContent = '';
  errorDesc.textContent = '';
  taskTitleInput.classList.remove('error');
  taskDescInput.classList.remove('error');
  charCount.textContent = `${task.description.length} / 300`;
  modalTitle.textContent = 'Editar Tarea';
  document.getElementById('btn-save-task').textContent = 'Actualizar Tarea';
  showModal(taskModal);
  taskTitleInput.focus();
}

function closeTaskModal() { hideModal(taskModal); }
function showModal(el) { el.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
function hideModal(el) { el.style.display = 'none'; document.body.style.overflow = ''; }

/* ============================================================
   FORM VALIDATION
   ============================================================ */
function validateForm() {
  let valid = true;
  const title = taskTitleInput.value.trim();
  const desc = taskDescInput.value.trim();

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

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer = null;
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 2800);
}

/* ============================================================
   EVENT HANDLERS – AUTH
   ============================================================ */

// Tab switcher
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    clearAuthMessages();
    const tab = btn.dataset.tab;
    loginForm.style.display = tab === 'login' ? 'block' : 'none';
    registerForm.style.display = tab === 'register' ? 'block' : 'none';
  });
});

// Login
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!email || !password) return showAuthError('Por favor completa todos los campos.');
  await signIn(email, password);
});

// Register
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  if (!email || !password) return showAuthError('Por favor completa todos los campos.');
  if (password.length < 6) return showAuthError('La contraseña debe tener al menos 6 caracteres.');
  await signUp(email, password);
});

// OAuth
btnGoogle.addEventListener('click', () => signInWithOAuth('google'));
btnGithub.addEventListener('click', () => signInWithOAuth('github'));

// Logout
btnLogout.addEventListener('click', signOut);

/* ============================================================
   EVENT HANDLERS – TASKS
   ============================================================ */
btnAddTask.addEventListener('click', openAddModal);
btnCloseModal.addEventListener('click', closeTaskModal);
btnCancelModal.addEventListener('click', closeTaskModal);

taskModal.addEventListener('click', e => { if (e.target === taskModal) closeTaskModal(); });
confirmModal.addEventListener('click', e => {
  if (e.target === confirmModal) { pendingDeleteId = null; hideModal(confirmModal); }
});

// Save / Update task
taskForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validateForm()) return;
  const id = taskIdInput.value;
  const title = taskTitleInput.value.trim();
  const desc = taskDescInput.value.trim();
  closeTaskModal();
  if (id) {
    await updateTask(id, title, desc);
    showToast('✅ Tarea actualizada correctamente');
  } else {
    await addTask(title, desc);
    showToast('🎉 Tarea agregada exitosamente');
  }
});

// Char counter
taskDescInput.addEventListener('input', () => {
  charCount.textContent = `${taskDescInput.value.length} / 300`;
});

// Search
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

// Filters
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    renderTasks();
  });
});

// Task list event delegation
taskList.addEventListener('click', async e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const id = el.dataset.id;

  if (action === 'toggle') {
    const newCompleted = await toggleTask(id);
    if (newCompleted !== undefined) {
      showToast(newCompleted ? '✅ Marcada como completada' : '🔄 Marcada como pendiente');
    }
  }
  if (action === 'edit') openEditModal(id);
  if (action === 'delete') { pendingDeleteId = id; showModal(confirmModal); }
});

// Keyboard accessibility for checkboxes
taskList.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') {
    const el = e.target.closest('[data-action="toggle"]');
    if (el) { e.preventDefault(); el.click(); }
  }
});

// Confirm delete
btnConfirmDel.addEventListener('click', async () => {
  if (pendingDeleteId) {
    const id = pendingDeleteId;
    pendingDeleteId = null;
    hideModal(confirmModal);
    await deleteTask(id);
    showToast('🗑️ Tarea eliminada', 'error');
  }
});
btnCancelDelete.addEventListener('click', () => {
  pendingDeleteId = null;
  hideModal(confirmModal);
});

// Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (taskModal.style.display === 'flex') closeTaskModal();
    if (confirmModal.style.display === 'flex') { pendingDeleteId = null; hideModal(confirmModal); }
  }
});

/* ============================================================
   INIT
   Supabase's onAuthStateChange fires automatically on load.
   We just start the loading spinner — it's hidden by the listener.
   ============================================================ */
showLoading();
