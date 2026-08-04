/* ============================================================
   TORQUE — Data layer (Firebase / Firestore)
   Images hosted on Cloudinary — stored as URLs only.
   Zero base64, minimal egress.
   ============================================================ */

const CACHE = { bikes: null, posts: null, settings: null };

const DEFAULT_SETTINGS = {
  whatsapp: '923000000000',
  email: 'hello@torquemotorsexclusive.com',
  phone: '+92 300 000 0000',
  instagram: 'https://instagram.com/torquemotorsexclusive',
  tiktok: 'https://tiktok.com/@torquemotorsexclusive',
  facebook: 'https://facebook.com/torquemotorsexclusive',
  youtube: 'https://youtube.com/@torquemotorsexclusive',
  address: 'Lahore, Pakistan',
  founders: {
    sunny: {
      name: 'Sunny Chaudary',
      role: 'Founder · Lifelong Biker',
      bio: 'A lifelong biker, Sunny grew up obsessed with the sound of superbikes — so much so that as a kid he was convinced the engine roar of passing van convoys WAS a superbike. Later he imported his first bike and went on to become the first person to introduce Ducati to Pakistan.',
      phone: '+92 300 000 0000',
      photo: ''
    },
    saeed: {
      name: 'Saeed Munwar',
      role: 'Co-Founder · Imports & Restoration',
      bio: 'Saeed is the reason Torque became a name. His discipline and years of experience in car and bike imports gave the business the foundation it needed.',
      phone: '+92 300 000 0000',
      photo: ''
    }
  },
  showroomPhotos: [],
  garagePhotos: [],
  garageServices: [
    'Full Service & Repair',
    'Oil Change & Tune-Ups',
    'Performance Upgrades',
    'Custom Modifications',
    'Restoration & Rebuilds',
    'Spare Parts Sourcing'
  ]
};

// ===== BIKES =====
async function loadBikes() {
  if (CACHE.bikes) return CACHE.bikes;
  try {
    const bikes = await fsQuery('bikes', 'created_at', 'DESCENDING');
    CACHE.bikes = bikes.map(b => ({ ...b, id: b._id }));
    return CACHE.bikes;
  } catch (e) { console.error(e); return CACHE.bikes || []; }
}

async function getBike(id) {
  if (CACHE.bikes) {
    const c = CACHE.bikes.find(b => b.id === id);
    if (c) return c;
  }
  try {
    const b = await fsGet('bikes', id);
    if (!b) return null;
    return { ...b, id: b._id };
  } catch (e) { console.error(e); return null; }
}

async function addBike(bike) {
  const id = 'bike-' + Date.now();
  bike.created_at = new Date().toISOString();
  const data = await fsSet('bikes', id, bike);
  CACHE.bikes = null;
  return { ...data, id };
}

async function updateBike(id, updates) {
  const existing = await getBike(id);
  if (!existing) throw new Error('Bike not found');
  const merged = { ...existing, ...updates };
  delete merged._id;
  delete merged.id;
  await fsSet('bikes', id, merged);
  CACHE.bikes = null;
}

async function deleteBike(id) {
  await fsDelete('bikes', id);
  CACHE.bikes = null;
}

// ===== POSTS =====
async function loadPosts() {
  if (CACHE.posts) return CACHE.posts;
  try {
    const posts = await fsQuery('posts', 'date', 'DESCENDING');
    CACHE.posts = posts.map(p => ({ ...p, id: p._id }));
    return CACHE.posts;
  } catch (e) { console.error(e); return CACHE.posts || []; }
}

async function getPost(id) {
  if (CACHE.posts) {
    const c = CACHE.posts.find(p => p.id === id);
    if (c) return c;
  }
  try {
    const p = await fsGet('posts', id);
    if (!p) return null;
    return { ...p, id: p._id };
  } catch (e) { console.error(e); return null; }
}

async function addPost(post) {
  const id = 'post-' + Date.now();
  if (!post.date) post.date = new Date().toISOString().split('T')[0];
  if (!post.slug) post.slug = (post.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  await fsSet('posts', id, post);
  CACHE.posts = null;
  return { ...post, id };
}

async function updatePost(id, updates) {
  const existing = await getPost(id);
  if (!existing) throw new Error('Post not found');
  const merged = { ...existing, ...updates };
  delete merged._id;
  delete merged.id;
  await fsSet('posts', id, merged);
  CACHE.posts = null;
}

async function deletePost(id) {
  await fsDelete('posts', id);
  CACHE.posts = null;
}

// ===== SETTINGS =====
async function loadSettings() {
  if (CACHE.settings) return CACHE.settings;
  try {
    const stored = await fsGet('settings', 'main');
    if (!stored) { CACHE.settings = { ...DEFAULT_SETTINGS }; return CACHE.settings; }
    delete stored._id;
    const merged = {
      ...DEFAULT_SETTINGS, ...stored,
      founders: {
        sunny: { ...DEFAULT_SETTINGS.founders.sunny, ...(stored.founders?.sunny || {}) },
        saeed: { ...DEFAULT_SETTINGS.founders.saeed, ...(stored.founders?.saeed || {}) }
      }
    };
    CACHE.settings = merged;
    return merged;
  } catch (e) { console.error(e); return { ...DEFAULT_SETTINGS }; }
}

async function saveSettings(settings) {
  const toSave = { ...settings };
  await fsSet('settings', 'main', toSave);
  CACHE.settings = settings;
}

// ===== FORMATTERS / RENDERERS =====
function formatPrice(p) {
  if (!p) return '—';
  return 'PKR ' + Number(p).toLocaleString('en-PK');
}

function bikePlaceholderSVG() {
  return `<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:60%;opacity:0.5;color:var(--grey);">
    <circle cx="45" cy="85" r="22" stroke="currentColor" stroke-width="3" opacity="0.6"/>
    <circle cx="155" cy="85" r="22" stroke="currentColor" stroke-width="3" opacity="0.6"/>
    <path d="M45 85 L80 50 L125 50 L155 85" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
    <path d="M80 50 L100 35 L130 35" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
    <path d="M125 50 L135 75" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  </svg>`;
}

function bikeCardHTML(bike, index) {
  const num = String(index + 1).padStart(2, '0');
  const imgHTML = bike.images && bike.images.length
    ? `<img src="${bike.images[0]}" alt="${bike.year || ''} ${bike.name}" loading="lazy">`
    : bikePlaceholderSVG();
  const badge = bike.status === 'sold'
    ? `<span class="bike-card__badge bike-card__badge--sold">Delivered</span>`
    : `<span class="bike-card__badge">Available</span>`;
  const featured = bike.featured ? `<span class="bike-card__featured">Featured</span>` : '';
  const placeholderClass = bike.images && bike.images.length ? '' : 'bike-card__img--placeholder';
  return `
    <a href="bike.html?id=${bike.id}" class="bike-card">
      <div class="bike-card__img ${placeholderClass}">
        ${badge}${featured}
        ${imgHTML}
      </div>
      <div class="bike-card__body">
        <div class="bike-card__num">№ ${num} / ${bike.year || ''}</div>
        <h3 class="bike-card__title">${bike.name}</h3>
        <p class="bike-card__sub">${bike.sub || ''}</p>
        <div class="bike-card__specs">
          <div class="bike-card__spec"><span class="bike-card__spec-label">Engine</span><span class="bike-card__spec-value">${bike.engine || '—'}</span></div>
          <div class="bike-card__spec"><span class="bike-card__spec-label">Power</span><span class="bike-card__spec-value">${bike.power || '—'}</span></div>
          <div class="bike-card__spec"><span class="bike-card__spec-label">KM</span><span class="bike-card__spec-value">${(bike.mileage || '—').replace(' km','')}</span></div>
        </div>
        <div class="bike-card__foot">
          <span class="bike-card__price">${formatPrice(bike.price)}</span>
          <span class="bike-card__arrow">→</span>
        </div>
      </div>
    </a>`;
}

function postCardHTML(post) {
  const coverHTML = post.cover
    ? `<img src="${post.cover}" alt="${post.title}" loading="lazy">`
    : `<div class="post-card__cover-ph"><span>${post.category}</span></div>`;
  const date = new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `
    <a href="post.html?id=${post.id}" class="post-card">
      <div class="post-card__cover">${coverHTML}</div>
      <div class="post-card__body">
        <div class="post-card__meta">
          <span class="post-card__cat">${post.category}</span>
          <span>·</span>
          <span>${date}</span>
        </div>
        <h3 class="post-card__title">${post.title}</h3>
        <p class="post-card__excerpt">${post.excerpt}</p>
        <span class="post-card__author">By ${post.author}</span>
      </div>
    </a>`;
}

function setActiveNav(name) {
  document.querySelectorAll('.nav__menu a').forEach(a => {
    if (a.dataset.nav === name) a.classList.add('active');
  });
}

function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('nav-open');
    });
  }
  document.querySelectorAll('.nav__menu a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    });
  });
  if (nav && nav.classList.contains('nav--hero')) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }, { passive: true });
  }
}

async function applySiteSettings() {
  const s = await loadSettings();
  document.querySelectorAll('[data-wa]').forEach(el => {
    const msg = el.dataset.wa || `Hi, I'm interested in starting an import with Torque Motorsports.`;
    el.href = `https://wa.me/${(s.whatsapp || '').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`;
  });
  document.querySelectorAll('[data-email]').forEach(el => {
    el.href = `mailto:${s.email}`;
    if (el.hasAttribute('data-email-text')) el.textContent = s.email;
  });
  document.querySelectorAll('[data-phone]').forEach(el => {
    el.href = `tel:${(s.phone || '').replace(/\s/g,'')}`;
    if (el.hasAttribute('data-phone-text')) el.textContent = s.phone;
  });
  ['instagram','tiktok','facebook','youtube'].forEach(net => {
    document.querySelectorAll(`[data-${net}]`).forEach(el => { el.href = s[net]; });
  });
}
