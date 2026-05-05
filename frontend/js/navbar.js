// =============================================
//  SHARED NAVBAR LOGIC  (js/navbar.js)
// =============================================

function renderNavbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const path = window.location.pathname;

  const isActive = (page) => {
    if (page === 'index') return (path === '/' || path.endsWith('index.html')) ? 'active' : '';
    return path.includes(page) ? 'active' : '';
  };

  let authHtml = '';
  if (user) {
    const firstName = user.name ? user.name.split(' ')[0] : 'User';
    authHtml = `
      <div class="auth-user-badge" style="display:flex;align-items:center;gap:.8rem;background:rgba(255,255,255,.05);border:1px solid rgba(42,82,56,.1);padding:.4rem .4rem .4rem 1rem;border-radius:99px">
        <div style="display:flex;flex-direction:column;line-height:1.2">
          <span style="font-size:.65rem;color:var(--leaf-green);text-transform:uppercase;font-weight:700;letter-spacing:.05em">${user.role === 'admin' ? 'Admin' : 'Farmer'}</span>
          <span style="font-size:.9rem;font-weight:600;color:var(--deep-green)">${firstName}</span>
        </div>
        <button class="btn-logout-pill" onclick="handleLogout()" style="display:flex;align-items:center;gap:.4rem;padding:.4rem 1rem;font-size:.8rem">Sign Out</button>
      </div>`;
  } else {
    const hide = ['login.html', 'register.html'];
    const showSignIn = !hide.some(h => path.includes(h));
    if (showSignIn) authHtml = `<a href="/login.html" class="nav-cta">Sign In</a>`;
  }

  let extraLink = '';
  if (user) {
    if (user.role === 'admin') extraLink = `<li><a href="/admin.html" class="${isActive('admin')}">Dashboard</a></li>`;
    else extraLink = `<li><a href="/my-bookings.html" class="${isActive('my-bookings')}">My Bookings</a></li>`;
  }

  const html = `
    <nav id="main-nav">
      <a href="/index.html" class="nav-logo">
        <img src="/images/logo.png" alt="Sankalp Logo" class="nav-logo-img" />
        <div>
          <div class="nav-logo-text-main">Sankalp Hi-Tech Nursery</div>
          <div class="nav-logo-text-sub">Cabbage Seedlings</div>
        </div>
      </a>
      <ul class="nav-links" id="nav-menu">
        <li><a href="/index.html" class="${isActive('index')}">Home</a></li>
        <li><a href="/index.html#about">About</a></li>
        <li><a href="/varieties.html" class="${isActive('varieties')}">Seedlings</a></li>
        <li><a href="/index.html#gallery">Gallery</a></li>
        <li><a href="/index.html#contact">Contact</a></li>
        ${extraLink}
      </ul>
      <div id="auth-container">${authHtml}</div>
    </nav>`;

  // Insert before first element in body
  document.body.insertAdjacentHTML('afterbegin', html);

  // Scroll effect
  setTimeout(() => {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    });
  }, 50);
}

function renderFooter() {
  const html = `
    <footer class="vh-footer">
      <div class="vh-footer-grid">
        <div class="vh-footer-brand">
          <h3>Sankalp Hi-Tech Nursery</h3>
          <p>Providing farmers with premium, polyhouse-grown cabbage seedlings for over a decade.</p>
        </div>
        <div class="vh-footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><a href="/index.html">Home</a></li>
            <li><a href="/index.html#about">About</a></li>
            <li><a href="/varieties.html">Seedlings</a></li>
          </ul>
        </div>
      </div>
      <div class="vh-footer-bottom">
        <p>&copy; 2026 Sankalp Hi-Tech Nursery. All rights reserved.</p>
      </div>
    </footer>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

function fixImageUrl(url) {
  if (!url) return '/images/nursery2.jpg';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/assets/')) return url.replace('/assets/', '/images/');
  if (url.startsWith('/images/')) return url;
  const filename = url.split('/').pop();
  return `/images/${filename}`;
}

// Scroll-reveal observer
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        // If using CSS animation-play-state
        entry.target.style.animationPlayState = 'running';
        // Force opacity 1 just in case
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.anim-left, .anim-right, .anim-up, .reveal-stagger').forEach(el => {
    el.style.opacity = '0'; // Ensure hidden initially
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}
