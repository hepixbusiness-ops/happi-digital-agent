/**
 * MODULE GOOGLE MAPS
 * Trouve les PME sans site web dans une ville donnee
 */
const config = require('./config');

const MAPS_URL = 'https://maps.googleapis.com/maps/api/place';

// Score /10 : privilegie les entreprises deja bien notees mais absentes du web
function calculerScore(note, avis) {
  if (!note) return 6;
  let score = 6;
  if (note >= 4.5) score += 2;
  else if (note >= 4) score += 1;
  if (avis >= 20) score += 2;
  else if (avis >= 10) score += 1;
  else if (avis >= 5) score += 0.5;
  return Math.max(1, Math.min(10, Math.round(score)));
}

// Accroche personnalisee pour l'appel, basee sur la reputation Google du prospect
function genererAccroche(note, avis) {
  if (note && avis >= 10 && note >= 4) {
    return `Excellente reputation (${note}/5, ${avis} avis) mais introuvable sur Google hors Maps : vos clients satisfaits ne peuvent pas vous recommander en ligne.`;
  }
  if (note && note >= 4.5) {
    return `Bonne note (${note}/5) mais aucune vitrine web : vous perdez les prospects qui cherchent un fournisseur sur Google.`;
  }
  if (note) {
    return `Present sur Google Maps (${note}/5) mais sans site web : une opportunite pour se demarquer de la concurrence en ligne.`;
  }
  return `Aucune presence web detectee : une bonne opportunite pour se positionner avant vos concurrents.`;
}

// Lien direct vers la fiche Google Maps du prospect
function genererMapsUrl(placeId, nom, ville) {
  if (placeId && !placeId.startsWith('sim_')) {
    return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nom + ' ' + ville)}`;
}

// Cherche des entreprises par type dans une ville
async function chercherEntreprises(recherche, ville, nombreMax) {
  if (!nombreMax) nombreMax = 20;
  const apiKey = config.maps.apiKey;

  if (!apiKey) {
    console.log('[MAPS] Pas de cle API - mode simulation');
    return simulerProspects(recherche, ville, nombreMax);
  }

  try {
    const query = encodeURIComponent(recherche + ' ' + ville + ' Cameroun');
    const url = `${MAPS_URL}/textsearch/json?query=${query}&key=${apiKey}&language=fr`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK') {
      console.log('[MAPS] Erreur API:', data.status);
      return simulerProspects(recherche, ville, nombreMax);
    }

    // Filtrer ceux sans site web = nos prospects prioritaires
    const prospects = data.results
      .filter(p => !p.website)
      .slice(0, nombreMax)
      .map(p => {
        const note = p.rating || null;
        const avis = p.user_ratings_total || 0;
        return {
          nom: p.name,
          adresse: p.formatted_address || '',
          telephone: p.formatted_phone_number || p.international_phone_number || null,
          google_place_id: p.place_id,
          ville: ville,
          note_google: note,
          avis_count: avis,
          maps_url: genererMapsUrl(p.place_id, p.name, ville),
          score: calculerScore(note, avis),
          accroche: genererAccroche(note, avis),
        };
      });

    console.log(`[MAPS] ${prospects.length} prospects sans site trouves pour "${recherche}" a ${ville}`);
    return prospects;

  } catch (err) {
    console.log('[MAPS] Erreur:', err.message, '- mode simulation');
    return simulerProspects(recherche, ville, nombreMax);
  }
}

// Mode simulation quand pas de cle API (pour tester)
function simulerProspects(recherche, ville, nombre) {
  const noms = ['Excellence', 'Prestige', 'Royal', 'Moderne', 'Elite', 'Soleil', 'Avenir', 'Crystal', 'Diamond', 'Star'];
  const types = {
    'restaurant': ['Restaurant', 'Traiteur', 'Brasserie', 'Maquis'],
    'clinique': ['Clinique', 'Cabinet Medical', 'Centre de Sante'],
    'ecole': ['Academie', 'Institut', 'Ecole Privee'],
    'construction': ['BTP', 'Construction', 'Immobilier'],
    'salon': ['Beauty Salon', 'Salon', 'Institut de Beaute'],
    'transport': ['Transport', 'Logistique', 'Express'],
  };

  const typeKey = Object.keys(types).find(k => recherche.toLowerCase().includes(k)) || 'restaurant';
  const typeList = types[typeKey];

  return Array.from({ length: nombre }, (_, i) => {
    const nom = `${noms[i % noms.length]} ${typeList[i % typeList.length]}`;
    const note = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
    const avis = Math.floor(Math.random() * 45) + 3;
    const placeId = `sim_${Date.now()}_${i}`;
    return {
      nom,
      adresse: `Quartier ${['Bastos', 'Melen', 'Nlongkak', 'Mvog-Ada', 'Essos'][i % 5]}, ${ville}`,
      telephone: `+237 6${Math.floor(Math.random()*9)+1}${Array.from({length:7},()=>Math.floor(Math.random()*10)).join('')}`,
      google_place_id: placeId,
      ville: ville,
      note_google: note,
      avis_count: avis,
      maps_url: genererMapsUrl(placeId, nom, ville),
      score: calculerScore(note, avis),
      accroche: genererAccroche(note, avis),
      simule: true,
    };
  });
}

// Recupere les details d'un lieu (telephone, email si disponible)
async function getDetailsLieu(placeId) {
  const apiKey = config.maps.apiKey;
  if (!apiKey || placeId.startsWith('sim_')) return {};

  try {
    const fields = 'formatted_phone_number,international_phone_number,website,email';
    const url = `${MAPS_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}&language=fr`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK') return {};
    return {
      telephone: data.result.international_phone_number || data.result.formatted_phone_number,
      email: data.result.email || null,
      website: data.result.website || null,
    };
  } catch {
    return {};
  }
}

module.exports = { chercherEntreprises, getDetailsLieu };
