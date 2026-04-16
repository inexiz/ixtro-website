/* ============================================
   ixtro — Public Content Loader
   Injects "Published" items from localStorage into the UI
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const DB_KEY = 'ixtro_db';
    const dbRaw = localStorage.getItem(DB_KEY);
    if (!dbRaw) return; // DB empty, just use hardcoded HTML
    
    const db = JSON.parse(dbRaw);
  
    // URL routing check visually
    const path = window.location.pathname;
    
    if (path.includes('projects.html')) {
      loadPublicProjects(db.projects);
    } else if (path.includes('blog.html')) {
      loadPublicBlogs(db.blogs);
    }
  });
  
  function loadPublicProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!container) return;
  
    const published = projects.filter(p => p.status === 'published');
    if (published.length === 0) return; // Keep defaults
  
    // Render dynamic ones
    const html = published.map(p => `
      <div class="card reveal visible" style="opacity: 1; transform: translateY(0); margin-bottom: 24px;">
        <div class="card-tags">
          ${p.tags.map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}
          <span class="status-badge status-active">Released</span>
        </div>
        <h3 class="card-title">${escapeHTML(p.title)}</h3>
        <p class="card-description">${escapeHTML(p.content.substring(0, 150))}...</p>
        <span class="card-link" style="color:var(--accent)">Explore <span>→</span></span>
      </div>
    `).join('');
  
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="category-label">Latest Intel</div>
      <div class="card-grid">${html}</div>
    `;
    container.prepend(wrapper);
  }
  
  function loadPublicBlogs(blogs) {
    const container = document.getElementById('blog-container');
    if (!container) return;
  
    const published = blogs.filter(b => b.status === 'published');
    if (published.length === 0) return;
  
    const html = published.map(b => `
      <div class="post-card reveal visible" style="opacity: 1; transform: translateY(0);">
        <div class="post-date">${new Date(b.date).toLocaleDateString()}</div>
        <h3 class="post-title">${escapeHTML(b.title)}</h3>
        <p class="post-excerpt">${escapeHTML(b.content.substring(0, 120))}...</p>
        <div class="card-tags" style="margin-top: var(--space-md); margin-bottom: 0;">
           ${b.tags.map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}
        </div>
      </div>
    `).join('');
  
    const newGrid = document.createElement('div');
    newGrid.innerHTML = html;
    
    // insert before hints
    container.prepend(...newGrid.children);
  }
  
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
  }
  
