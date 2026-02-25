let currentAdminTab = 'users';
let editingUserId = null;
let editingMetricId = null;
let editingMetricModule = null;

function switchAdminTab(tab) {
  currentAdminTab = tab;
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('adminTabUsers').classList.add('hidden');
  document.getElementById('adminTabMetrics').classList.add('hidden');
  document.getElementById('adminTabAllalerts').classList.add('hidden');

  if (tab === 'users') { document.getElementById('adminTabUsers').classList.remove('hidden'); loadUsers(); }
  else if (tab === 'metrics') { document.getElementById('adminTabMetrics').classList.remove('hidden'); loadMetricsTable(); }
  else if (tab === 'allalerts') { document.getElementById('adminTabAllalerts').classList.remove('hidden'); loadAdminAlerts(); }
}

// ===== USERS =====
async function loadUsers() {
  try {
    const users = await apiFetch('/api/users');
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="avatar" style="width:28px;height:28px;font-size:0.65rem;">
              ${u.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <strong style="font-size:0.875rem;">${u.name}</strong>
          </div>
        </td>
        <td>${u.email}</td>
        <td><span class="badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}">${u.role}</span></td>
        <td>${u.department || '—'}</td>
        <td style="font-size:0.78rem;color:var(--text-tertiary);">${u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
        <td><span class="badge ${u.isActive ? 'badge-success' : 'badge-danger'}">${u.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-secondary btn-sm" onclick="editUser(${JSON.stringify(u).replace(/"/g,'&quot;')})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteUser('${u._id}','${u.name}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch(err) { showToast(err.message, 'error'); }
}

function openUserModal(user = null) {
  editingUserId = null;
  document.getElementById('userModalTitle').textContent = 'Add User';
  document.getElementById('userFormName').value = '';
  document.getElementById('userFormEmail').value = '';
  document.getElementById('userFormPassword').value = '';
  document.getElementById('userFormRole').value = 'user';
  document.getElementById('userFormDept').value = '';
  openModal('userModal');
}

function editUser(user) {
  editingUserId = user._id;
  document.getElementById('userModalTitle').textContent = 'Edit User';
  document.getElementById('userFormName').value = user.name;
  document.getElementById('userFormEmail').value = user.email;
  document.getElementById('userFormPassword').value = '';
  document.getElementById('userFormRole').value = user.role;
  document.getElementById('userFormDept').value = user.department || '';
  openModal('userModal');
}

async function saveUser() {
  const body = {
    name: document.getElementById('userFormName').value,
    email: document.getElementById('userFormEmail').value,
    role: document.getElementById('userFormRole').value,
    department: document.getElementById('userFormDept').value
  };
  const pwd = document.getElementById('userFormPassword').value;
  if (pwd) body.password = pwd;

  try {
    if (editingUserId) {
      await apiFetch(`/api/users/${editingUserId}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('User updated successfully', 'success');
    } else {
      if (!pwd) { showToast('Password required for new user', 'error'); return; }
      await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(body) });
      showToast('User created successfully', 'success');
    }
    closeModal('userModal');
    loadUsers();
  } catch(err) { showToast(err.message, 'error'); }
}

async function deleteUser(id, name) {
  if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
  try {
    await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
    showToast('User deleted', 'success');
    loadUsers();
  } catch(err) { showToast(err.message, 'error'); }
}

// ===== METRICS =====
const metricConfigs = {
  traffic: {
    fields: [
      { key: 'district', label: 'District', readonly: true },
      { key: 'congestionLevel', label: 'Congestion %', type: 'number' },
      { key: 'avgSpeed', label: 'Avg Speed (km/h)', type: 'number' },
      { key: 'vehicleCount', label: 'Vehicles', type: 'number' },
      { key: 'incidents', label: 'Incidents', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['clear','moderate','heavy','blocked'] }
    ]
  },
  weather: {
    fields: [
      { key: 'district', label: 'District', readonly: true },
      { key: 'temperature', label: 'Temperature (°C)', type: 'number' },
      { key: 'humidity', label: 'Humidity %', type: 'number' },
      { key: 'windSpeed', label: 'Wind Speed', type: 'number' },
      { key: 'aqi', label: 'AQI', type: 'number' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['sunny','cloudy','rainy','stormy','foggy','partly-cloudy'] }
    ]
  },
  energy: {
    fields: [
      { key: 'district', label: 'District', readonly: true },
      { key: 'currentLoad', label: 'Current Load (MW)', type: 'number' },
      { key: 'renewablePercent', label: 'Renewable %', type: 'number' },
      { key: 'solarOutput', label: 'Solar (MW)', type: 'number' },
      { key: 'windOutput', label: 'Wind (MW)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['normal','high','critical','outage'] }
    ]
  },
  waste: {
    fields: [
      { key: 'district', label: 'District', readonly: true },
      { key: 'binFillLevel', label: 'Fill Level %', type: 'number' },
      { key: 'totalBins', label: 'Total Bins', type: 'number' },
      { key: 'recyclingPercent', label: 'Recycling %', type: 'number' },
      { key: 'collectionStatus', label: 'Collection Status', type: 'select', options: ['scheduled','in-progress','completed','overdue'] }
    ]
  },
  water: {
    fields: [
      { key: 'district', label: 'District', readonly: true },
      { key: 'reservoirLevel', label: 'Reservoir Level %', type: 'number' },
      { key: 'pressure', label: 'Pressure (bar)', type: 'number' },
      { key: 'leaks', label: 'Leaks', type: 'number' },
      { key: 'waterQuality', label: 'Quality Score', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['normal','low','critical','flood-risk'] }
    ]
  }
};

async function loadMetricsTable() {
  const module = document.getElementById('metricsModuleSelect')?.value || 'traffic';
  try {
    const data = await apiFetch(`/api/${module}`);
    const config = metricConfigs[module];
    const thead = document.getElementById('metricsTableHead');
    const tbody = document.getElementById('metricsTableBody');
    if (!thead || !tbody) return;

    thead.innerHTML = `<tr>${config.fields.map(f => `<th>${f.label}</th>`).join('')}<th>Actions</th></tr>`;
    tbody.innerHTML = data.map(row => `
      <tr>
        ${config.fields.map(f => `<td>${row[f.key] ?? '—'}</td>`).join('')}
        <td><button class="btn btn-secondary btn-sm" onclick="openMetricEdit('${row._id}','${module}',${JSON.stringify(row).replace(/"/g,'&quot;')})">Edit</button></td>
      </tr>
    `).join('');
  } catch(err) { showToast(err.message, 'error'); }
}

function openMetricEdit(id, module, data) {
  editingMetricId = id;
  editingMetricModule = module;
  const config = metricConfigs[module];
  const body = document.getElementById('metricModalBody');
  body.innerHTML = config.fields.map(f => {
    if (f.readonly) return `
      <div class="form-group">
        <label class="form-label">${f.label}</label>
        <input class="form-input" type="text" value="${data[f.key] || ''}" disabled />
      </div>`;
    if (f.type === 'select') return `
      <div class="form-group">
        <label class="form-label">${f.label}</label>
        <select class="form-select" id="mf_${f.key}">
          ${f.options.map(o => `<option value="${o}" ${data[f.key] === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
      </div>`;
    return `
      <div class="form-group">
        <label class="form-label">${f.label}</label>
        <input class="form-input" type="${f.type || 'text'}" id="mf_${f.key}" value="${data[f.key] ?? ''}" />
      </div>`;
  }).join('');
  openModal('metricModal');
}

async function saveMetric() {
  const module = editingMetricModule;
  const config = metricConfigs[module];
  const body = {};
  config.fields.filter(f => !f.readonly).forEach(f => {
    const el = document.getElementById(`mf_${f.key}`);
    if (el) body[f.key] = f.type === 'number' ? parseFloat(el.value) : el.value;
  });
  try {
    await apiFetch(`/api/${module}/${editingMetricId}`, { method: 'PUT', body: JSON.stringify(body) });
    showToast('Metric updated', 'success');
    closeModal('metricModal');
    loadMetricsTable();
  } catch(err) { showToast(err.message, 'error'); }
}

// ===== ADMIN ALERTS =====
async function loadAdminAlerts() {
  try {
    const alerts = await apiFetch('/api/alerts/all');
    const el = document.getElementById('adminAllAlerts');
    if (!el) return;
    if (!alerts.length) { el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-tertiary);">No alerts found.</div>'; return; }
    el.innerHTML = `<div class="table-wrapper"><table class="data-table">
      <thead><tr><th>Module</th><th>Message</th><th>Severity</th><th>District</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
      <tbody>
        ${alerts.map(a => `
          <tr>
            <td>${a.module}</td>
            <td>${a.message}</td>
            <td><span class="badge ${severityBadge(a.severity)}">${a.severity}</span></td>
            <td>${a.district || '—'}</td>
            <td><span class="badge ${a.resolved ? 'badge-success' : 'badge-warning'}">${a.resolved ? 'Resolved' : 'Active'}</span></td>
            <td style="font-size:0.75rem;color:var(--text-tertiary);">${new Date(a.createdAt).toLocaleDateString()}</td>
            <td>
              <div style="display:flex;gap:4px;">
                ${!a.resolved ? `<button class="btn btn-success btn-sm" onclick="resolveAlert('${a._id}');loadAdminAlerts()">Resolve</button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteAlert('${a._id}')">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table></div>`;
  } catch(err) { showToast(err.message, 'error'); }
}

function openCreateAlertModal() { openModal('createAlertModal'); }

async function createAlert() {
  const body = {
    type: document.getElementById('alertFormModule').value,
    module: document.getElementById('alertFormModule').value.charAt(0).toUpperCase() + document.getElementById('alertFormModule').value.slice(1),
    message: document.getElementById('alertFormMsg').value,
    severity: document.getElementById('alertFormSeverity').value,
    district: document.getElementById('alertFormDistrict').value
  };
  if (!body.message) { showToast('Please enter a message', 'error'); return; }
  try {
    await apiFetch('/api/alerts', { method: 'POST', body: JSON.stringify(body) });
    showToast('Alert created', 'success');
    closeModal('createAlertModal');
    loadAdminAlerts();
  } catch(err) { showToast(err.message, 'error'); }
}

async function deleteAlert(id) {
  if (!confirm('Delete this alert?')) return;
  try {
    await apiFetch(`/api/alerts/${id}`, { method: 'DELETE' });
    showToast('Alert deleted', 'success');
    loadAdminAlerts();
  } catch(err) { showToast(err.message, 'error'); }
}
