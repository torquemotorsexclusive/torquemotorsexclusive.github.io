/* ============================================================
   TORQUE — SUPABASE CONNECTION (lightweight, no SDK)
   Direct REST API calls — no 300kb SDK dependency.
   ============================================================ */

const SUPABASE_URL = 'https://jinpsmxvfcljjfodcreo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppbnBzbXh2ZmNsampmb2RjcmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MTk3ODksImV4cCI6MjA5NjM5NTc4OX0.BTb8BP7f7pLP6hX1AXRutwRBXv_F_kG1Pq45PyV_j6Y';

const SB_HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function sbGet(table, params = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    headers: SB_HEADERS
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function sbInsert(table, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: SB_HEADERS,
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

async function sbUpdate(table, match, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
    method: 'PATCH',
    headers: SB_HEADERS,
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

async function sbDelete(table, match) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
    method: 'DELETE',
    headers: { ...SB_HEADERS, 'Prefer': 'return=minimal' }
  });
  if (!res.ok) throw new Error(await res.text());
}
