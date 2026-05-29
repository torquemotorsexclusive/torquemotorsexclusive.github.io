/* ========================================
   TORQUE — Data layer
   ======================================== */

const BIKES_KEY = 'torque_bikes_v2';
const SETTINGS_KEY = 'torque_settings_v1';

// ---- Seed bikes (past imports) ----
const SEED_BIKES = [
  {
    id: 'bike-001',
    name: 'Ducati Panigale V4',
    sub: '2023 · Imported & Delivered',
    price: 9200000,
    status: 'available',
    featured: true,
    year: 2023,
    brand: 'Ducati',
    engine: '1103cc',
    power: '215 HP',
    mileage: '2,100 km',
    weight: '198 kg',
    transmission: '6-speed Quickshift',
    description: 'A flagship import — Desmosedici Stradale V4 power, MotoGP-inspired aerodynamics. Sourced from Italy, delivered to Lahore with full documentation, Akrapovič exhaust, carbon fairings included.',
    images: []
  },
  {
    id: 'bike-002',
    name: 'Yamaha YZF-R1',
    sub: '2023 · Track-prepped Import',
    price: 6500000,
    status: 'available',
    featured: true,
    year: 2023,
    brand: 'Yamaha',
    engine: '998cc',
    power: '200 HP',
    mileage: '4,200 km',
    weight: '201 kg',
    transmission: '6-speed',
    description: 'Inline-four crossplane engine, lean-sensitive electronics, Öhlins-inspired suspension setup. A flagship superbike imported and prepped to track-ready specification.',
    images: []
  },
  {
    id: 'bike-003',
    name: 'Kawasaki Ninja ZX-10R',
    sub: '2022 · Race-Ready Import',
    price: 5800000,
    status: 'available',
    featured: true,
    year: 2022,
    brand: 'Kawasaki',
    engine: '998cc',
    power: '203 HP',
    mileage: '6,800 km',
    weight: '207 kg',
    transmission: '6-speed',
    description: 'World Superbike-derived geometry, electronic suspension, Bosch IMU. A surgical instrument on the circuit — sourced and imported with full title transfer.',
    images: []
  },
  {
    id: 'bike-004',
    name: 'BMW S 1000 RR',
    sub: '2022 · Premium Import',
    price: 7200000,
    status: 'sold',
    featured: true,
    year: 2022,
    brand: 'BMW',
    engine: '999cc',
    power: '205 HP',
    mileage: '9,400 km',
    weight: '197 kg',
    transmission: '6-speed',
    description: 'Race-bred Shift-Cam technology, M package wheels, Dynamic Damping Control. Sourced from Germany and delivered with complete service records.',
    images: []
  },
  {
    id: 'bike-005',
    name: 'Honda CBR1000RR-R Fireblade SP',
    sub: '2023 · Track Weapon',
    price: 8100000,
    status: 'available',
    featured: true,
    year: 2023,
    brand: 'Honda',
    engine: '999.9cc',
    power: '215 HP',
    mileage: '3,500 km',
    weight: '201 kg',
    transmission: '6-speed',
    description: 'HRC-developed engine, Öhlins NPX/TTX36 semi-active suspension, Brembo Stylema calipers. A factory-spec import for the rider who chases lap times.',
    images: []
  },
  {
    id: 'bike-006',
    name: 'Harley-Davidson Road Glide',
    sub: '2022 · Touring Import',
    price: 5400000,
    status: 'sold',
    featured: false,
    year: 2022,
    brand: 'Harley-Davidson',
    engine: '1868cc',
    power: '93 HP',
    mileage: '12,000 km',
    weight: '378 kg',
    transmission: '6-speed Cruise Drive',
    description: 'Milwaukee-Eight 114, premium audio, full custom paint. Sourced from the US for a long-distance touring enthusiast.',
    images: []
  }
];

// ---- Default site settings ----
const DEFAULT_SETTINGS = {
  whatsapp: '923000000000',           // editable from dashboard
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
      bio: 'A lifelong biker, Sunny grew up obsessed with the sound of superbikes — so much so that as a kid he was convinced the engine roar of passing van convoys WAS a superbike. Later he imported his first bike and went on to become the first person to introduce Ducati to Pakistan. His passion is the engine of this company.',
      phone: '+92 300 000 0000',
      photo: ''
    },
    saeed: {
      name: 'Saeed Munwar',
      role: 'Co-Founder · Imports & Restoration',
      bio: 'Saeed is the reason Torque became a name. His discipline and years of experience in car and bike imports — plus a deep background in restoring and rebuilding both — gave the business the foundation it needed. If Sunny is the heart, Saeed is the precision behind every import we deliver.',
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

// ---- Bikes ----
function loadBikes() {
  try {
    const raw = localStorage.getItem(BIKES_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(BIKES_KEY, JSON.stringify(SEED_BIKES));
    return SEED_BIKES;
  } catch (e) { return SEED_BIKES; }
}

function saveBikes(bikes) { localStorage.setItem(BIKES_KEY, JSON.stringify(bikes)); }
function getBike(id) { return loadBikes().find(b => b.id === id); }

function addBike(bike) {
  const bikes = loadBikes();
  bike.id = 'bike-' + Date.now();
  bikes.unshift(bike);
  saveBikes(bikes);
  return bike;
}

function updateBike(id, updates) {
  const bikes = loadBikes();
  const idx = bikes.findIndex(b => b.id === id);
  if (idx === -1) return null;
  bikes[idx] = { ...bikes[idx], ...updates };
  saveBikes(bikes);
  return bikes[idx];
}

function deleteBike(id) {
  const bikes = loadBikes().filter(b => b.id !== id);
  saveBikes(bikes);
}

// ---- Settings ----
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults to ensure new fields exist
      return { ...DEFAULT_SETTINGS, ...parsed,
        founders: { ...DEFAULT_SETTINGS.founders, ...(parsed.founders || {}) }
      };
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  } catch (e) { return DEFAULT_SETTINGS; }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ---- Helpers ----
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
    ? `<img src="${bike.images[0]}" alt="${bike.year} ${bike.name} — Torque Motorsports Pakistan import">`
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
          <div class="bike-card__spec">
            <span class="bike-card__spec-label">Engine</span>
            <span class="bike-card__spec-value">${bike.engine || '—'}</span>
          </div>
          <div class="bike-card__spec">
            <span class="bike-card__spec-label">Power</span>
            <span class="bike-card__spec-value">${bike.power || '—'}</span>
          </div>
          <div class="bike-card__spec">
            <span class="bike-card__spec-label">KM</span>
            <span class="bike-card__spec-value">${(bike.mileage || '—').replace(' km','')}</span>
          </div>
        </div>
        <div class="bike-card__foot">
          <span class="bike-card__price">${formatPrice(bike.price)}</span>
          <span class="bike-card__arrow">→</span>
        </div>
      </div>
    </a>
  `;
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

  // Hero nav scroll effect
  if (nav && nav.classList.contains('nav--hero')) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }, { passive: true });
  }
}

// ---- Apply settings to the page (WhatsApp/email/social links) ----
function applySiteSettings() {
  const s = loadSettings();
  // WhatsApp links — anything with data-wa or href starting with wa-template
  document.querySelectorAll('[data-wa]').forEach(el => {
    const msg = el.dataset.wa || `Hi, I'm interested in starting an import with Torque Motorsports.`;
    el.href = `https://wa.me/${s.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`;
  });
  // Email
  document.querySelectorAll('[data-email]').forEach(el => {
    el.href = `mailto:${s.email}`;
    if (el.dataset.emailText) el.textContent = s.email;
  });
  // Phone
  document.querySelectorAll('[data-phone]').forEach(el => {
    el.href = `tel:${s.phone.replace(/\s/g,'')}`;
    if (el.dataset.phoneText) el.textContent = s.phone;
  });
  // Socials
  ['instagram','tiktok','facebook','youtube'].forEach(net => {
    document.querySelectorAll(`[data-${net}]`).forEach(el => {
      el.href = s[net];
    });
  });
}
