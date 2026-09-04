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

// Writes must be authenticated (see Firestore security rules): attach the
// signed-in user's ID token when the Firebase Auth SDK is present.
async function fsAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      const user = firebase.auth().currentUser;
      if (user) headers.Authorization = 'Bearer ' + (await user.getIdToken());
    }
  } catch (e) { /* unauthenticated write — rules will decide */ }
  return headers;
}

async function fsSet(collection, id, data) {
  const fields = toFS(data);
  const res = await fetch(`${FS_BASE}/${collection}/${id}`, {
    method: 'PATCH',
    headers: await fsAuthHeaders(),
    body: JSON.stringify({ fields })
  });
  if (!res.ok) throw new Error(await res.text());
  const doc = await res.json();
  return docToObj(doc);
}

async function fsDelete(collection, id) {
  const res = await fetch(`${FS_BASE}/${collection}/${id}`, {
    method: 'DELETE',
    headers: await fsAuthHeaders()
  });
  if (!res.ok) throw new Error(await res.text());
}

// Query constrained by a field value — required for collections whose
// security rules only expose matching documents (e.g. approved reviews).
async function fsQueryWhere(collection, field, value, orderField = null, direction = 'DESCENDING') {
  const res = await fetch(`${FS_BASE}:runQuery`, {
    method: 'POST',
    headers: await fsAuthHeaders(),
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: {
            field: { fieldPath: field },
            op: 'EQUAL',
            value: { stringValue: value }
          }
        },
        orderBy: orderField ? [{ field: { fieldPath: orderField }, direction }] : undefined
      }
    })
  });
  if (!res.ok) return [];
  const rows = await res.json();
  return rows.filter(r => r.document).map(r => docToObj(r.document));
}

async function fsQuery(collection, orderField, direction = 'DESCENDING') {
  const res = await fetch(`${FS_BASE}:runQuery`, {
    method: 'POST',
    headers: await fsAuthHeaders(),
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

async function compressImage(file, maxSizeMB = 8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        // Scale down if very large
        const maxDim = 2400;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        // Try quality 0.85 first, then reduce if still too large
        let quality = 0.85;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
              quality -= 0.15;
              tryCompress();
            } else {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            }
          }, 'image/jpeg', quality);
        };
        tryCompress();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadToCloudinary(file) {
  // Auto-compress before upload
  const compressed = await compressImage(file, 8);

  const fd = new FormData();
  fd.append('file', compressed);
  fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: fd
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Image upload failed (' + res.status + ')');
  }
  const data = await res.json();
  return data.secure_url.replace('/upload/', '/upload/q_auto,f_auto,w_1200/');
}
