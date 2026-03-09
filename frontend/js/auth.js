// Auth utilities
const API = window.location.origin;

function getToken() { return localStorage.getItem('sc-token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('sc-user')); } catch { return null; }
}
function isAdmin() { const u = getUser(); return u && u.role === 'admin'; }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...(options.headers || {})
    }
  });
  if (res.status === 401) { logout(); return; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function logout() {
  localStorage.removeItem('sc-token');
  localStorage.removeItem('sc-user');
  window.location.href = '/';
}

// Guard: redirect if not logged in
if (!getToken()) window.location.href = '/';

// Show/hide admin elements
function applyRoleUI() {
  const admin = isAdmin();
  document.querySelectorAll('.admin-only').forEach(el => {
    el.classList.toggle('hidden', !admin);
  });
}

// Toast notifications
function showToast(msg, type = 'info', title = '') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const titles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div class="toast-content">
      <div class="toast-title">${title || titles[type]}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, 4000);
}

// Modal utilities
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('active'); });
});
