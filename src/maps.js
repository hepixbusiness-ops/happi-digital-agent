/**
 * MODULE GOOGLE MAPS
 * Trouve les PME sans site web dans une ville donnee
 */
const config = require('./config');

const MAPS_URL = 'https://maps.googleapis.com/maps/api/place';

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
      .map(p => ({
        nom: p.name,
        adresse: p.formatted_address || '',
        telephone: p.formatted_phone_number || p.international_phone_number || null,
        google_place_id: p.place_id,
        ville: ville,
        note_google: p.rating || null,
      }));

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

  return Array.from({ length: nombre }, (_, i) => ({
    nom: `${noms[i % noms.length]} ${typeList[i % typeList.length]}`,
    adresse: `Quartier ${['Bastos', 'Melen', 'Nlongkak', 'Mvog-Ada', 'Essos'][i % 5]}, ${ville}`,
    telephone: `+237 6${Math.floor(Math.random()*9)+1}${Array.from({length:7},()=>Math.floor(Math.random()*10)).join('')}`,
    google_place_id: `sim_${Date.now()}_${i}`,
    ville: ville,
    note_google: null,
    simule: true,
  }));
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
    };
  } catch {
    return {};
  }
}

module.exports = { chercherEntreprises, getDetailsLieu };
