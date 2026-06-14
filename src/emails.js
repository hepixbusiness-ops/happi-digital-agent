/**
 * MODULE EMAILS
 * Genere et envoie des emails personnalises via Gmail OAuth2
 */
const { google } = require('googleapis');
const config = require('./config');

// Templates par secteur
const TEMPLATES = {
  'Restaurant / Traiteur': {
    sujet: (nom) => `${nom} - Vos clients vous cherchent en ligne`,
    corps: (nom, ville) => `Bonjour,

Je m'appelle Pharel, fondateur de Happi Digital a ${ville}.

En cherchant des restaurants a ${ville}, j'ai remarque que ${nom} n'a pas encore de site web.

Voici ce qui se passe chaque jour sans site :
- Un client cherche "restaurant ${ville}" sur Google
- Il ne vous trouve pas
- Il va chez votre concurrent

Ce que je peux faire pour ${nom} :
✓ Site avec votre menu, photos et horaires
✓ Bouton WhatsApp pour les reservations
✓ Visible sur Google en 7 jours
✓ Livre en 72h a partir de 100 000 FCFA

Je peux vous envoyer une maquette gratuite de votre futur site aujourd'hui, sans engagement.

Interesse(e) ? Repondez a cet email ou ecrivez-moi sur WhatsApp : +237 699 179 254

Bonne journee,
Pharel Happi
Happi Digital - Yaounde
+237 699 179 254`,
  },

  'Clinique / Medecin': {
    sujet: (nom) => `${nom} - Vos patients vous trouvent-ils en ligne ?`,
    corps: (nom, ville) => `Bonjour,

Je m'appelle Pharel, fondateur de Happi Digital a ${ville}.

Vos futurs patients cherchent un medecin ou une clinique sur Google avant d'appeler.
Sans site web, ${nom} est invisible pour eux.

Ce que je propose :
✓ Site avec vos specialites et vos medecins
✓ Formulaire de prise de rendez-vous en ligne
✓ Horaires et localisation GPS
✓ Livre en 72h a partir de 150 000 FCFA

Maquette gratuite disponible sous 24h.

Pharel Happi - Happi Digital
WhatsApp : +237 699 179 254`,
  },

  'Ecole / Academie': {
    sujet: (nom) => `${nom} - Les parents cherchent votre ecole en ligne`,
    corps: (nom, ville) => `Bonjour,

Je m'appelle Pharel, fondateur de Happi Digital.

Les parents recherchent maintenant les ecoles en ligne avant de se deplacer.
${nom} n'apparait pas dans ces recherches.

Ce que je cree pour vous :
✓ Site avec votre programme et vos frais
✓ Inscription en ligne
✓ Galerie photos
✓ Livre en 72h a partir de 120 000 FCFA

Pharel Happi - Happi Digital | +237 699 179 254`,
  },

  'default': {
    sujet: (nom) => `${nom} - Site web professionnel livre en 72h`,
    corps: (nom, ville) => `Bonjour,

Je m'appelle Pharel, fondateur de Happi Digital a Yaounde.

J'ai remarque que ${nom} n'a pas encore de site web professionnel.

En 2025, vos clients cherchent d'abord sur Google avant d'appeler.
Sans site, vous perdez des clients chaque jour sans le savoir.

Ce que je propose :
✓ Site web professionnel complet
✓ Fonctionne sur telephone et ordinateur
✓ WhatsApp et localisation integres
✓ Visible sur Google
✓ Livre en 72h - a partir de 100 000 FCFA
✓ Paiement MTN MoMo ou Orange Money

Je peux vous montrer une maquette gratuite en 24h, sans engagement.

Interessee ? Repondez ici ou WhatsApp : +237 699 179 254

Pharel Happi
Happi Digital - Yaounde`,
  },
};

function getTemplate(secteur) {
  return TEMPLATES[secteur] || TEMPLATES['default'];
}

function construireEmailRaw(destinataire, sujet, corps) {
  const from = `Pharel - Happi Digital <${config.agence.email}>`;
  const lines = [
    `From: ${from}`,
    `To: ${destinataire}`,
    `Subject: =?UTF-8?B?${Buffer.from(sujet).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(corps, 'utf-8').toString('base64'),
  ];
  return Buffer.from(lines.join('\r\n')).toString('base64url');
}

function getGmailClient() {
  const auth = new google.auth.OAuth2(
    config.gmail.clientId,
    config.gmail.clientSecret,
    'urn:ietf:wg:oauth:2.0:oob'
  );
  auth.setCredentials({ refresh_token: config.gmail.refreshToken });
  return google.gmail({ version: 'v1', auth });
}

// Envoie un email directement
async function envoyerEmail(destinataire, sujet, corps) {
  // Si pas de config Gmail, creer un brouillon quand meme
  if (!config.gmail.clientId || !config.gmail.refreshToken) {
    console.log(`[GMAIL] Config manquante - brouillon simule pour ${destinataire}`);
    return { messageId: `sim_${Date.now()}`, envoye: false };
  }

  try {
    const gmail = getGmailClient();
    const raw = construireEmailRaw(destinataire, sujet, corps);

    // Si pas d'email du prospect, creer brouillon pour envoyer manuellement
    if (!destinataire || destinataire === 'prospect@example.com') {
      const draft = await gmail.users.drafts.create({
        userId: 'me',
        requestBody: { message: { raw } },
      });
      return { messageId: draft.data.id, envoye: false, brouillon: true };
    }

    // Envoyer directement si on a l'email
    const sent = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
    return { messageId: sent.data.id, envoye: true };

  } catch (err) {
    console.log(`[GMAIL] Erreur: ${err.message}`);
    return { messageId: null, envoye: false, erreur: err.message };
  }
}

// Genere le contenu d'un email pour un lead
function genererContenu(lead, relance) {
  if (!relance) relance = 1;
  const tpl = getTemplate(lead.secteur);
  const ville = lead.ville || 'Yaounde';

  if (relance === 1) {
    return {
      sujet: tpl.sujet(lead.nom),
      corps: tpl.corps(lead.nom, ville),
    };
  }

  if (relance === 2) {
    return {
      sujet: `Re: Site web pour ${lead.nom} - Maquette prete`,
      corps: `Bonjour,

Je reviens vers vous concernant ${lead.nom}.

Avez-vous eu le temps de voir mon message de la semaine derniere ?

J'ai prepare une maquette de site web pour votre secteur. Je peux vous l'envoyer aujourd'hui gratuitement.

Pharel - Happi Digital | WhatsApp : +237 699 179 254`,
    };
  }

  return {
    sujet: `Derniere relance - Site web pour ${lead.nom}`,
    corps: `Bonjour,

Dernier message de ma part concernant ${lead.nom}.

Si le moment n'est pas ideal, pas de souci. Gardez mon contact pour quand vous serez pret(e).

WhatsApp : +237 699 179 254
Pharel - Happi Digital`,
  };
}

module.exports = { envoyerEmail, genererContenu };
