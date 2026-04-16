/* ============================================
   ixtro — Admin Panel Logic (Local Storage DB)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

const AUTH_KEY = 'ixtro_auth_token';
const DB_KEY = 'ixtro_db';

// Initial DB state if empty
const defaultDB = {
  projects: [],
  blogs: []
};

// Simple pseudo-auth (In a real app, this would be a backend check)
const SECRET_PASS = 'ixtro_root';

function initAdmin() {
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  
  if (localStorage.getItem(AUTH_KEY) === 'authenticated') {
    document.body.classList.add('auth-checked');
    loginView.style.display = 'none';
    dashboardView.style.display = 'block';
    loadDashboard();
  } else {
    document.body.classList.add('auth-checked');
    loginView.style.display = 'flex';
    dashboardView.style.display = 'none';
  }

  // Auth form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pw = document.getElementById('admin-password').value;
      if (pw === SECRET_PASS) {
        localStorage.setItem(AUTH_KEY, 'authenticated');
        showToast('Authentication successful.', 'success');
        setTimeout(() => window.location.reload(), 500);
      } else {
        showToast('Access denied.', 'error');
      }
    });
  }

  // Logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem(AUTH_KEY);
      window.location.reload();
    });
  }

  // Tabs
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(tc => {
        tc.style.display = 'none';
      });
      
      const tabId = tab.getAttribute('data-tab');
      document.getElementById('tab-' + tabId).style.display = 'block';
    });
  });

  // Editor form
  const editorForm = document.getElementById('editor-form');
  if (editorForm) {
    editorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveEntry();
    });
  }
}

function getDB() {
  const db = localStorage.getItem(DB_KEY);
  if (!db) {
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return defaultDB;
  }
  return JSON.parse(db);
}

function setDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function loadDashboard() {
  const db = getDB();
  renderList(db.blogs, 'blog', 'admin-blog-list');
  renderList(db.projects, 'project', 'admin-project-list');
}

function renderList(items, type, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📡</div>
        <p>No ${type}s found. Start tracking your research.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="admin-item">
      <div class="admin-item-info">
        <div class="admin-item-title">${item.title}</div>
        <div class="admin-item-meta">
          <span class="status-badge ${item.status === 'published' ? 'status-active' : 'status-draft'}">
            ${item.status.toUpperCase()}
          </span>
          <span style="margin-left: 10px; opacity: 0.5;">
            ${new Date(item.date).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="btn btn-secondary btn-sm" onclick='editEntry("${type}", "${item.id}")'>Edit</button>
        <button class="btn btn-danger btn-sm" onclick='deleteEntry("${type}", "${item.id}")'>Delete</button>
      </div>
    </div>
  `).join('');
}

window.openEditor = function(type) {
  document.getElementById('entry-type').value = type;
  document.getElementById('entry-id').value = '';
  document.getElementById('entry-title').value = '';
  document.getElementById('entry-tags').value = '';
  document.getElementById('entry-status').value = 'draft';
  document.getElementById('entry-content').value = '';
  
  document.getElementById('modal-title').innerText = `New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  document.getElementById('editor-modal').classList.add('open');
};

window.editEntry = function(type, id) {
  const db = getDB();
  const collection = type === 'blog' ? db.blogs : db.projects;
  const item = collection.find(i => i.id === id);
  if (!item) return;

  document.getElementById('entry-type').value = type;
  document.getElementById('entry-id').value = item.id;
  document.getElementById('entry-title').value = item.title;
  document.getElementById('entry-tags').value = item.tags.join(', ');
  document.getElementById('entry-status').value = item.status || 'draft';
  document.getElementById('entry-content').value = item.content;
  
  document.getElementById('modal-title').innerText = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  document.getElementById('editor-modal').classList.add('open');
};

window.closeEditor = function() {
  document.getElementById('editor-modal').classList.remove('open');
};

window.saveEntry = function() {
  const type = document.getElementById('entry-type').value;
  const idStr = document.getElementById('entry-id').value;
  const id = idStr ? idStr : 'ix_' + Date.now().toString(36);
  
  const title = document.getElementById('entry-title').value;
  const tagsRaw = document.getElementById('entry-tags').value;
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t);
  const status = document.getElementById('entry-status').value;
  const content = document.getElementById('entry-content').value;

  const db = getDB();
  const collectionKey = type === 'blog' ? 'blogs' : 'projects';
  
  const existingIdx = db[collectionKey].findIndex(i => i.id === id);
  
  const entry = {
    id, title, tags, status, content,
    date: existingIdx >= 0 ? db[collectionKey][existingIdx].date : new Date().toISOString()
  };

  if (existingIdx >= 0) {
    db[collectionKey][existingIdx] = entry;
  } else {
    db[collectionKey].unshift(entry);
  }

  setDB(db);
  closeEditor();
  loadDashboard();
  showToast('Entry saved successfully.', 'success');
};

window.deleteEntry = function(type, id) {
  if (!confirm('Destroy this record permanently?')) return;
  
  const db = getDB();
  const collectionKey = type === 'blog' ? 'blogs' : 'projects';
  
  db[collectionKey] = db[collectionKey].filter(i => i.id !== id);
  setDB(db);
  loadDashboard();
  showToast('Record destroyed.', 'success');
};

// Toasts
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
