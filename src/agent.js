#!/usr/bin/env node
/**
 * ============================================================
 *   HAPPI DIGITAL — AGENT IA DE PROSPECTION AUTOMATIQUE
 *   Pharel Happi | Yaounde | +237 699 179 254
 *   Objectif : 2 000 000 FCFA
 *   Execution : chaque matin a 7h via GitHub Actions
 * ============================================================
 *
 * CYCLE JOURNALIER AUTOMATIQUE :
 * 1. Cherche 15 PME sans site web sur Google Maps (Yaounde/Douala)
 * 2. Enregistre les prospects dans la base de donnees
 * 3. Envoie des emails personnalises depuis Gmail
 * 4. Relance automatiquement les non-repondeurs a J+3
 * 5. Genere un rapport de synthese
 */

const config = require('./config');
const { chercherEntreprises } = require('./maps');
const { genererContenu, envoyerEmail } = require('./emails');
const db = require('./db');

const MODE_TEST = process.argv.includes('--test');

function log(niveau, msg) {
  const heure = new Date().toLocaleTimeString('fr-FR');
  const prefixes = { info: '[INFO]', ok: '[ OK ]', warn: '[WARN]', err: '[ERR ]' };
  console.log(`${heure} ${prefixes[niveau] || niveau} ${msg}`);
}

function separateur(titre) {
  console.log('\n' + '='.repeat(50));
  if (titre) console.log('  ' + titre);
  console.log('='.repeat(50));
}

// ─── PHASE 1 : Trouver de nouveaux prospects ──────────────
async function phase1_TrouverProspects() {
  separateur('PHASE 1 : Recherche de prospects');

  const { secteurs, villes, prospectsParJour } = config.prospection;
  const parSecteur = Math.ceil(prospectsParJour / secteurs.length);
  let totalTrouves = 0;

  for (const secteur of secteurs) {
    const ville = villes[Math.floor(Math.random() * villes.length)];
    log('info', `Recherche : "${secteur.recherche}" a ${ville}...`);

    const entreprises = await chercherEntreprises(secteur.recherche, ville, parSecteur);

    const leadsAInserer = entreprises.map(e => ({
      nom: e.nom,
      secteur: secteur.nom,
      ville: e.ville || ville,
      telephone: e.telephone || null,
      email: e.email || null,
      adresse: e.adresse || null,
      google_place_id: e.google_place_id,
      statut: 'nouveau',
    }));

    try {
      const inseres = await db.sauvegarderLeads(leadsAInserer);
      const nb = inseres ? inseres.length : leadsAInserer.length;
      log('ok', `${nb} prospects enregistres (${secteur.nom})`);
      totalTrouves += nb;
    } catch (err) {
      log('warn', `Erreur insertion ${secteur.nom}: ${err.message}`);
    }

    // Pause entre les requetes Maps
    await new Promise(r => setTimeout(r, 1000));
  }

  log('ok', `TOTAL : ${totalTrouves} nouveaux prospects en base`);
  return totalTrouves;
}

// ─── PHASE 2 : Envoyer les emails ─────────────────────────
async function phase2_EnvoyerEmails() {
  separateur('PHASE 2 : Envoi des emails');

  const leads = await db.getLeadsAContacter(config.prospection.emailsParJour);
  if (!leads || leads.length === 0) {
    log('info', 'Aucun nouveau lead a contacter');
    return 0;
  }

  let emailsEnvoyes = 0;

  for (const lead of leads) {
    const { sujet, corps } = genererContenu(lead, 1);
    const destinataire = lead.email || 'prospect@example.com';

    log('info', `Email pour: ${lead.nom} (${lead.secteur})`);

    if (!MODE_TEST) {
      const result = await envoyerEmail(destinataire, sujet, corps);

      await db.sauvegarderEmail({
        lead_id: lead.id,
        sujet,
        corps,
        gmail_message_id: result.messageId,
        relance_num: 1,
        statut: result.envoye ? 'envoye' : 'envoye',
      });

      await db.updateLead(lead.id, {
        statut: 'email_envoye',
        notes: `Email 1 envoye le ${new Date().toLocaleDateString('fr-FR')}`,
      });
    }

    emailsEnvoyes++;
    log('ok', `Email ${result?.brouillon ? '(brouillon Gmail)' : 'envoye'} : ${lead.nom}`);

    await new Promise(r => setTimeout(r, 800));
  }

  log('ok', `${emailsEnvoyes} emails traites`);
  return emailsEnvoyes;
}

// ─── PHASE 3 : Relances automatiques J+3 ──────────────────
async function phase3_Relances() {
  separateur('PHASE 3 : Relances automatiques (J+3)');

  const leads = await db.getLeadsARelancer();
  if (!leads || leads.length === 0) {
    log('info', 'Aucune relance necessaire aujourd\'hui');
    return 0;
  }

  let relances = 0;
  for (const lead of leads.slice(0, 5)) {
    const { sujet, corps } = genererContenu(lead, 2);
    const destinataire = lead.email || 'prospect@example.com';

    if (!MODE_TEST) {
      await envoyerEmail(destinataire, sujet, corps);
      await db.sauvegarderEmail({
        lead_id: lead.id, sujet, corps, relance_num: 2, statut: 'envoye',
      });
    }

    relances++;
    log('ok', `Relance J+3 : ${lead.nom}`);
    await new Promise(r => setTimeout(r, 500));
  }

  log('ok', `${relances} relances envoyees`);
  return relances;
}

// ─── PHASE 4 : Rapport ────────────────────────────────────
async function phase4_Rapport(stats) {
  separateur('PHASE 4 : Rapport journalier');

  const counts = await db.countLeadsByStatut();
  const ca = await db.getCA();

  const totalLeads = Object.values(counts).reduce((s, n) => s + n, 0);
  const totalSignes = counts['signe'] || 0;
  const pct = Math.min(100, Math.round((ca / 2000000) * 100));
  const barre = '#'.repeat(Math.round(pct / 5)).padEnd(20, '.');

  const rapport = `
==============================================
  RAPPORT HAPPI DIGITAL - ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
==============================================

  AUJOURD'HUI
  -----------
  Prospects trouves  : ${stats.prospects}
  Emails envoyes     : ${stats.emails}
  Relances           : ${stats.relances}

  PIPELINE CUMULE
  ---------------
  Total leads        : ${totalLeads}
  Nouveau            : ${counts['nouveau'] || 0}
  Email envoye       : ${counts['email_envoye'] || 0}
  Repondu            : ${counts['repondu'] || 0}
  RDV                : ${counts['rdv'] || 0}
  Propose            : ${counts['propose'] || 0}
  Signe              : ${totalSignes}

  OBJECTIF 2 000 000 FCFA
  ------------------------
  CA encaisse        : ${new Intl.NumberFormat('fr-FR').format(ca)} FCFA
  Progression        : ${pct}%
  [${barre}]

  ACTION (30 secondes)
  --------------------
  1. Ouvre Gmail -> verifie les brouillons
  2. Reponds aux prospects interesses
  3. WhatsApp : +237 699 179 254

  L'agent reprend demain matin a 7h00
==============================================
`.trim();

  console.log(rapport);

  if (!MODE_TEST) {
    await db.upsertKPI({
      date: new Date().toISOString().split('T')[0],
      prospects_trouves: stats.prospects,
      emails_envoyes: stats.emails,
      reponses: 0,
      contrats: 0,
      ca_fcfa: ca,
    });
  }

  return rapport;
}

// ─── MAIN ─────────────────────────────────────────────────
async function main() {
  console.log(`
==============================================
  HAPPI DIGITAL - AGENT IA
  Pharel Happi | Yaounde
  Demarre le ${new Date().toLocaleString('fr-FR')}
  Mode : ${MODE_TEST ? 'TEST' : 'PRODUCTION'}
==============================================
`);

  const stats = { prospects: 0, emails: 0, relances: 0 };

  try {
    stats.prospects = await phase1_TrouverProspects();
    stats.emails = await phase2_EnvoyerEmails();
    stats.relances = await phase3_Relances();
    await phase4_Rapport(stats);

    log('ok', 'Agent termine avec succes. Bonne journee Pharel !');
    process.exit(0);
  } catch (err) {
    console.error('[ERREUR CRITIQUE]', err);
    process.exit(1);
  }
}

main();
