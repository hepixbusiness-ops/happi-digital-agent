/**
 * MODULE BASE DE DONNEES
 * Interface avec Supabase pour stocker leads, emails, pipeline et KPIs
 */
const config = require('./config');

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': config.supabase.serviceKey,
  'Authorization': `Bearer ${config.supabase.serviceKey}`,
  'Prefer': 'return=representation',
};

async function req(path, method, body, extraHeaders) {
  if (!method) method = 'GET';
  const url = config.supabase.url + '/rest/v1' + path;
  const opts = {
    method,
    headers: Object.assign({}, HEADERS, extraHeaders || {}),
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DB ${res.status}: ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// LEADS
async function sauvegarderLeads(leads) {
  return req('/leads', 'POST', leads, {
    'Prefer': 'return=representation,resolution=ignore-duplicates',
  });
}

async function getLeadsAContacter(limite) {
  if (!limite) limite = 10;
  return req(`/leads?statut=eq.nouveau&limit=${limite}&order=created_at.asc&select=*`);
}

async function getLeadsARelancer() {
  const dateLimit = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
  return req(`/leads?statut=eq.email_envoye&updated_at=lt.${dateLimit}&select=*`);
}

async function updateLead(id, data) {
  return req(`/leads?id=eq.${id}`, 'PATCH', data);
}

async function countLeadsByStatut() {
  const leads = await req('/leads?select=statut');
  const counts = {};
  for (const l of (leads || [])) {
    counts[l.statut] = (counts[l.statut] || 0) + 1;
  }
  return counts;
}

// EMAILS
async function sauvegarderEmail(data) {
  return req('/emails_envoyes', 'POST', data);
}

// PIPELINE
async function getCA() {
  const rows = await req('/pipeline?select=montant_fcfa');
  return (rows || []).reduce((s, r) => s + (r.montant_fcfa || 0), 0);
}

// KPIS
async function upsertKPI(kpi) {
  return req('/kpis', 'POST', kpi, {
    'Prefer': 'return=representation,resolution=merge-duplicates',
  });
}

module.exports = {
  sauvegarderLeads,
  getLeadsAContacter,
  getLeadsARelancer,
  updateLead,
  countLeadsByStatut,
  sauvegarderEmail,
  getCA,
  upsertKPI,
};
