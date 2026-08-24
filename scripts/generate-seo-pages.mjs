/* ============================================================
   TORQUE — Static SEO page generator
   Reads bikes & posts from Firestore (public REST) and writes
   real HTML pages at /bike/<slug>/ and /post/<slug>/ plus an
   updated sitemap.xml. Run by GitHub Actions (see
   .github/workflows/seo-pages.yml) or locally:
     node scripts/generate-seo-pages.mjs
   ============================================================ */

import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://torquemotorsexclusive.com';
const PROJECT_ID = 'torque-morosports';
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ── Firestore REST helpers ─────────────────────────────────
function fromFSValue(v) {
  if (!v) return null;
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return parseInt(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromFSValue);
  if ('mapValue' in v) return fromFS(v.mapValue.fields || {});
  if ('timestampValue' in v) return v.timestampValue;
  return null;
}
function fromFS(fields) {
  const obj = {};
  for (const [k, v] of Object.entries(fields || {})) obj[k] = fromFSValue(v);
  return obj;
}

async function fsQuery(collection, orderField, direction = 'DESCENDING') {
  const res = await fetch(`${FS_BASE}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        orderBy: orderField ? [{ field: { fieldPath: orderField }, direction }] : undefined
      }
    })
  });
  if (!res.ok) throw new Error(`Firestore query ${collection} failed: ${res.status}`);
  const rows = await res.json();
  return rows.filter(r => r.document).map(r => {
    const obj = fromFS(r.document.fields || {});
    obj.id = r.document.name.split('/').pop();
    return obj;
  });
}

// ── Shared helpers (mirror data.js) ────────────────────────
const slugify = t => (t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const bikeSlug = b => slugify((b.year ? b.year + ' ' : '') + (b.name || '')) || b.id;
const postSlug = p => p.slug || slugify(p.title) || p.id;
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const formatPrice = p => p ? 'PKR ' + Number(p).toLocaleString('en-PK') : '—';

// ── Page chrome ────────────────────────────────────────────
const NAV = `
<nav class="nav">
  <a href="/" class="nav__logo"><img src="/logo.png" alt="Torque Motorsports"></a>
  <button class="nav__toggle" aria-label="Menu"><span></span><span></span><span></span></button>
  <div class="nav__menu">
    <ul>
      <li><a href="/" data-nav="home">Home</a></li>
      <li><a href="/inventory" data-nav="garage">The Garage</a></li>
      <li><a href="/blog" data-nav="journal">Journal</a></li>
      <li><a href="/contact" data-nav="contact">Story</a></li>
      <li><a href="/reviews" data-nav="reviews">Reviews</a></li>
    </ul>
    <div class="nav__menu-foot">
      <span>Lahore / Pakistan</span>
      <a href="#" data-email data-email-text>hello@torquemotorsexclusive.com</a>
    </div>
  </div>
  <a href="#" class="nav__cta" data-wa="Hi, I'd like to request a bike import.">Request a Bike</a>
</nav>`;

const FOOTER = `
<footer class="footer">
  <div class="footer__main">
    <div class="footer__brand">
      <img src="/logo.png" alt="Torque Motorsports" class="footer__logo">
      <p class="footer__tagline">Specialist superbike imports to Pakistan. Curated. Sourced. Delivered.</p>
    </div>
    <div class="footer__grid">
      <div class="footer__col">
        <h4>Navigate</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/inventory">The Garage</a></li>
          <li><a href="/blog">Journal</a></li>
          <li><a href="/contact">Story</a></li>
          <li><a href="/reviews">Reviews</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h4>Contact</h4>
        <ul>
          <li><a href="#" data-wa>WhatsApp</a></li>
          <li><a href="#" data-email>Email</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h4>Follow</h4>
        <ul>
          <li><a href="#" data-instagram target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="#" data-tiktok target="_blank" rel="noopener">TikTok</a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="footer__bottom">
    <span>© ${new Date().getFullYear()} Torque Motorsports Exclusive</span>
    <span>Lahore / Pakistan</span>
  </div>
</footer>`;

function head({ title, description, url, image, jsonld, ogType = 'website' }) {
  return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#0a0a0a">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <link rel="icon" type="image/png" href="/logo.png">
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">
  <meta name="geo.region" content="PK-PB">
  <meta name="geo.placename" content="Lahore">
  <link rel="stylesheet" href="/styles.css">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>`;
}

const PAGE_SCRIPTS = `
<script src="/firebase.js"></script>
<script src="/data.js"></script>
<script>
  initNav();
  applySiteSettings();
  document.querySelectorAll('.detail__thumb').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.detail__thumb').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const main = document.getElementById('main-img');
      if (main) main.src = t.dataset.src;
    });
  });
</script>`;

// ── Bike page ──────────────────────────────────────────────
function bikePage(bike) {
  const slug = bikeSlug(bike);
  const url = `${SITE}/bike/${slug}`;
  const title = `${bike.year ? bike.year + ' ' : ''}${bike.name} — Torque Motorsports Exclusive`;
  const description = (bike.description || `${bike.name} imported and delivered by Torque Motorsports Exclusive, Pakistan.`).slice(0, 160);
  const imgs = Array.isArray(bike.images) ? bike.images : [];
  const image = imgs[0] || `${SITE}/hero.jpg`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${bike.year ? bike.year + ' ' : ''}${bike.name}`,
    description,
    image: imgs.length ? imgs : [image],
    url,
    brand: { '@type': 'Brand', name: (bike.name || '').split(' ')[0] },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: bike.price || undefined,
      availability: bike.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      url,
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PK',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'PKR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PK' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 7, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 14, unitCode: 'DAY' }
        }
      }
    }
  };

  const mainImgHTML = imgs.length
    ? `<img src="${esc(imgs[0])}" alt="${esc(bike.name)}" id="main-img">`
    : '';
  const thumbsHTML = imgs.length > 1
    ? `<div class="detail__thumbs">${imgs.map((src, i) =>
        `<div class="detail__thumb ${i === 0 ? 'active' : ''}" data-src="${esc(src)}"><img src="${esc(src)}" alt="${esc(bike.name)} photo ${i + 1}" loading="lazy"></div>`
      ).join('')}</div>`
    : '';

  const statusClass = bike.status === 'sold' ? 'detail__status--sold' : 'detail__status--available';
  const statusText = bike.status === 'sold' ? 'Delivered' : 'Available';
  const specs = [
    ['Engine', bike.engine], ['Power', bike.power], ['Mileage', bike.mileage],
    ['Year', bike.year], ['Color', bike.color], ['Condition', bike.condition]
  ].filter(([, v]) => v);
  const waMsg = `Hi, I'm interested in the ${bike.year ? bike.year + ' ' : ''}${bike.name}. Is it ${bike.status === 'sold' ? 'possible to import a similar one' : 'still available'}?`;

  return `<!DOCTYPE html>
<html lang="en">
<head>${head({ title, description, url, image, jsonld })}
</head>
<body>
${NAV}
<main class="detail" id="detail">
  <div class="detail__images">
    <div class="detail__main-img">${mainImgHTML}</div>
    ${thumbsHTML}
  </div>
  <div class="detail__body">
    <div class="detail__num">The Garage — ${esc(bike.year || '')}</div>
    <span class="detail__status ${statusClass}">${statusText}</span>
    <h1 class="detail__title">${esc(bike.name)}</h1>
    <p class="detail__sub">${esc(bike.sub || '')}</p>
    <div class="detail__specs">
      ${specs.map(([label, value]) => `
        <div class="detail__spec">
          <span class="detail__spec-label">${esc(label)}</span>
          <span class="detail__spec-value">${esc(value)}</span>
        </div>`).join('')}
    </div>
    ${bike.description ? `<p class="detail__desc">${esc(bike.description)}</p>` : ''}
    <div class="detail__price-label">Price</div>
    <div class="detail__price">${formatPrice(bike.price)}</div>
    <div class="detail__sticky-cta">
      <a href="#" class="btn btn--primary" data-wa="${esc(waMsg)}">Enquire on WhatsApp</a>
      <a href="/inventory" class="btn btn--ghost">Back to Garage</a>
    </div>
  </div>
</main>
${FOOTER}
${PAGE_SCRIPTS}
</body>
</html>
`;
}

// ── Post page ──────────────────────────────────────────────
function postPage(post) {
  const slug = postSlug(post);
  const url = `${SITE}/post/${slug}`;
  const title = `${post.title} | Torque Motorsports Journal`;
  const description = (post.excerpt || '').slice(0, 160);
  const image = post.cover || `${SITE}/hero.jpg`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Torque Motorsports Exclusive',
      logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` }
    },
    mainEntityOfPage: url,
    articleSection: post.category
  };

  const date = new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const bodyHTML = (post.body || '')
    .split('\n\n')
    .map(p => `<p>${esc(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</p>`)
    .join('');
  const coverHTML = post.cover
    ? `<div class="post__cover"><img src="${esc(post.cover)}" alt="${esc(post.title)}"></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>${head({ title, description, url, image, jsonld, ogType: 'article' })}
</head>
<body>
${NAV}
<main class="post" id="postRoot">
  <div class="post__meta">
    <span class="post-card__cat">${esc(post.category)}</span>
    <span>·</span>
    <span>${date}</span>
  </div>
  <h1 class="post__title">${esc(post.title)}</h1>
  <p class="post__excerpt">${esc(post.excerpt)}</p>
  ${coverHTML}
  <div class="post__body">${bodyHTML}</div>
  <div class="post__author-block">
    <span class="post__author-label">Written by</span>
    <span class="post__author-name">${esc(post.author)}</span>
  </div>
</main>
${FOOTER}
${PAGE_SCRIPTS}
</body>
</html>
`;
}

// ── Sitemap ────────────────────────────────────────────────
function sitemap(bikes, posts) {
  const today = new Date().toISOString().split('T')[0];
  const staticUrls = ['/', '/inventory', '/blog', '/contact', '/reviews'];
  const urls = [
    ...staticUrls.map(u => ({ loc: `${SITE}${u}`, lastmod: today })),
    ...bikes.map(b => ({ loc: `${SITE}/bike/${bikeSlug(b)}`, lastmod: (b.created_at || today).split('T')[0] })),
    ...posts.map(p => ({ loc: `${SITE}/post/${postSlug(p)}`, lastmod: p.date || today }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`;
}

// ── Main ───────────────────────────────────────────────────
const [bikes, posts] = await Promise.all([
  fsQuery('bikes', 'created_at'),
  fsQuery('posts', 'date')
]);
console.log(`Fetched ${bikes.length} bikes, ${posts.length} posts`);

// Rebuild bike/ and post/ dirs from scratch so removed items disappear
for (const dir of ['bike', 'post']) {
  await rm(path.join(ROOT, dir), { recursive: true, force: true });
}

await mkdir(path.join(ROOT, 'bike'), { recursive: true });
await mkdir(path.join(ROOT, 'post'), { recursive: true });
for (const bike of bikes) {
  await writeFile(path.join(ROOT, 'bike', `${bikeSlug(bike)}.html`), bikePage(bike));
}
for (const post of posts) {
  await writeFile(path.join(ROOT, 'post', `${postSlug(post)}.html`), postPage(post));
}
await writeFile(path.join(ROOT, 'sitemap.xml'), sitemap(bikes, posts));

console.log(`Wrote ${bikes.length} bike pages, ${posts.length} post pages, sitemap.xml`);
