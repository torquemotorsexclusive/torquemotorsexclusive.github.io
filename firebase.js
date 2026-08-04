/* ============================================================
   TORQUE — FIREBASE CONNECTION
   Firestore for data · Cloudinary for images
   ============================================================ */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC97trbKWpOa9HZCC15xfFYHk2oVfmx5dc",
  authDomain: "torque-morosports.firebaseapp.com",
  projectId: "torque-morosports",
  storageBucket: "torque-morosports.firebasestorage.app",
  messagingSenderId: "873465383674",
  appId: "1:873465383674:web:7685a57947ff6ad52d9743"
};

const CLOUDINARY_CLOUD = 'szj0edrf';
const CLOUDINARY_UPLOAD_PRESET = 'torque_unsigned'; // we'll create this below

// Firestore REST base
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`;

// ── Firestore helpers ──────────────────────────────────────

function toFS(obj) {
  // Convert a plain JS object to Firestore fields format
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) {
      fields[k] = { nullValue: null };
    } else if (typeof v === 'boolean') {
      fields[k] = { booleanValue: v };
    } else if (typeof v === 'number') {
      fields[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    } else if (Array.isArray(v)) {
      fields[k] = { arrayValue: { values: v.map(i => toFSValue(i)) } };
    } else if (typeof v === 'object') {
      fields[k] = { mapValue: { fields: toFS(v) } };
    } else {
      fields[k] = { stringValue: String(v) };
    }
  }
  return fields;
}

function toFSValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(i => toFSValue(i)) } };
  if (typeof v === 'object') return { mapValue: { fields: toFS(v) } };
  return { stringValue: String(v) };
}

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
  for (const [k, v] of Object.entries(fields || {})) {
    obj[k] = fromFSValue(v);
  }
  return obj;
}

function docToObj(doc) {
  const obj = fromFS(doc.fields || {});
  // Extract id from document name path
  obj._id = doc.name ? doc.name.split('/').pop() : obj._id;
  return obj;
}

async function fsGet(collection, id) {
  const res = await fetch(`${FS_BASE}/${collection}/${id}`);
  if (!res.ok) return null;
  const doc = await res.json();
  return docToObj(doc);
}

async function fsList(collection, orderBy = null) {
  let url = `${FS_BASE}/${collection}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.documents) return [];
  return data.documents.map(docToObj);
}

async function fsSet(collection, id, data) {
  const fields = toFS(data);
  const res = await fetch(`${FS_BASE}/${collection}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });
  if (!res.ok) throw new Error(await res.text());
  const doc = await res.json();
  return docToObj(doc);
}

async function fsDelete(collection, id) {
  const res = await fetch(`${FS_BASE}/${collection}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
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
  if (!res.ok) return [];
  const rows = await res.json();
  return rows
    .filter(r => r.document)
    .map(r => docToObj(r.document));
}

// ── Cloudinary upload ──────────────────────────────────────

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  fd.append('folder', 'torque');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: fd
  });
  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  // Return optimized URL with auto quality + format
  return data.secure_url.replace('/upload/', '/upload/q_auto,f_auto,w_1200/');
}
