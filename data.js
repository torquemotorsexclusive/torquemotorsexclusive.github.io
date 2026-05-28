/* ========================================
   TORQUE — Shared logic + data layer
   Data is stored in browser localStorage
   ======================================== */

const STORAGE_KEY = 'torque_bikes_v1';

// ---- Seed data (loaded once) ----
const SEED_BIKES = [
  {
    id: 'bike-001',
    name: 'Yamaha YZF-R1',
    sub: '2023 · Track-prepped Superbike',
    price: 6500000,
    status: 'available',
    year: 2023,
    engine: '998cc',
    power: '200 HP',
    mileage: '4,200 km',
    weight: '201 kg',
    transmission: '6-speed',
    description: 'A flagship superbike built for track domination. Inline-four crossplane engine, lean-sensitive electronics, Öhlins-inspired suspension setup. Single owner, full service history, never crashed.',
    images: []
  },
  {
    id: 'bike-002',
    name: 'Kawasaki Ninja ZX-10R',
    sub: '2022 · Race-Ready Litre Bike',
    price: 5800000,
    status: 'available',
    year: 2022,
    engine: '998cc',
    power: '203 HP',
    mileage: '6,800 km',
    weight: '207 kg',
    transmission: '6-speed',
    description: 'World Superbike-derived geometry, electronic suspension, and Bosch IMU. A surgical instrument on the circuit — confident, planted, devastatingly fast.',
    images: []
  },
  {
    id: 'bike-003',
    name: 'Ducati Panigale V4',
    sub: '2023 · Italian Thoroughbred',
    price: 9200000,
    status: 'available',
    year: 2023,
    engine: '1103cc',
    power: '215 HP',
    mileage: '2,100 km',
    weight: '198 kg',
    transmission: '6-speed Quickshift',
    description: 'Desmosedici Stradale V4 power, MotoGP-inspired aerodynamics. The closest thing to a factory racer you can ride on the road. Akrapovič exhaust, carbon fairings included.',
    images: []
  },
  {
    id: 'bike-004',
    name: 'BMW S 1000 RR',
    sub: '2022 · German Engineering',
    price: 7200000,
    status: 'sold',
    year: 2022,
    engine: '999cc',
    power: '205 HP',
    mileage: '9,400 km',
    weight: '197 kg',
    transmission: '6-speed',
    description: 'Race-bred Shift-Cam technology, M package wheels, Dynamic Damping Control. Asymmetric headlights are the only thing slow about it.',
    images: []
  },
  {
    id: 'bike-005',
    name: 'Honda CBR1000RR-R Fireblade SP',
    sub: '2023 · Track Weapon',
    price: 8100000,
    status: 'available',
    year: 2023,
    engine: '999.9cc',
    power: '215 HP',
    mileage: '3,500 km',
    weight: '201 kg',
    transmission: '6-speed',
    description: 'HRC-developed engine, Öhlins NPX/TTX36 semi-active suspension, Brembo Stylema calipers. Built without compromise for the rider who chases lap times.',
    images: []
  },
  {
    id: 'bike-006',
    name: 'Aprilia RSV4 Factory',
    sub: '2023 · Italian Apex Predator',
    price: 8900000,
    status: 'available',
    year: 2023,
    engine: '1099cc',
    power: '217 HP',
    mileage: '1,800 km',
    weight: '202 kg',
    transmission: '6-speed',
    description: 'V4 65° engine, full electronic aero, semi-active Öhlins. The most podium-decorated production bike of the decade — and it feels every inch of that pedigree.',
    images: []
  }
];

// ---- Storage helpers ----
function loadBikes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BIKES));
    return SEED_BIKES;
  } catch (e) {
    return SEED_BIKES;
  }
}

function saveBikes(bikes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bikes));
}

function getBike(id) {
  return loadBikes().find(b => b.id === id);
}

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

// ---- Formatting ----
function formatPrice(p) {
  if (!p) return '—';
  // PKR with thousand separators using Pakistani lakh notation
  return 'PKR ' + Number(p).toLocaleString('en-PK');
}

// ---- Placeholder SVG for bikes without photos ----
function bikePlaceholderSVG() {
  return `<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="bike-svg-placeholder">
    <circle cx="45" cy="85" r="22" stroke="currentColor" stroke-width="3" opacity="0.6"/>
    <circle cx="155" cy="85" r="22" stroke="currentColor" stroke-width="3" opacity="0.6"/>
    <path d="M45 85 L80 50 L125 50 L155 85" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
    <path d="M80 50 L100 35 L130 35" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
    <path d="M125 50 L135 75" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  </svg>`;
}

// ---- Render a bike card (homepage / inventory) ----
function bikeCardHTML(bike, index) {
  const num = String(index + 1).padStart(2, '0');
  const imgHTML = bike.images && bike.images.length
    ? `<img src="${bike.images[0]}" alt="${bike.name}">`
    : bikePlaceholderSVG();
  const badge = bike.status === 'sold'
    ? `<span class="bike-card__badge bike-card__badge--sold">Sold</span>`
    : `<span class="bike-card__badge">Available</span>`;

  return `
    <a href="bike.html?id=${bike.id}" class="bike-card">
      <div class="bike-card__img ${bike.images && bike.images.length ? '' : 'bike-card__img--placeholder'}">
        ${badge}
        ${imgHTML}
      </div>
      <div class="bike-card__num">№ ${num} / ${bike.year}</div>
      <h3 class="bike-card__title">${bike.name}</h3>
      <p class="bike-card__sub">${bike.sub}</p>
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
    </a>
  `;
}

// ---- Active nav helper ----
function setActiveNav(name) {
  document.querySelectorAll('.nav__links a').forEach(a => {
    if (a.dataset.nav === name) a.classList.add('active');
  });
}
