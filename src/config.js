// Configuration de l'agent Happi Digital
module.exports = {
  // Identite commerciale
  agence: {
    nom: 'Happi Digital',
    prenom: 'Pharel',
    telephone: '+237 699 179 254',
    email: process.env.GMAIL_FROM || 'hepixbusiness@gmail.com',
    ville: 'Yaounde',
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || 'https://vuzjrsgobeevfqjmsgsm.supabase.co',
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1empyc2dvYmVldmZxam1zZ3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjkzMDAsImV4cCI6MjA5NzAwNTMwMH0.fKRj-BiLjsNeHgs34CU4zsK54DqQ2VEIb-R-wj8KMD0',
  },

  // Google Maps
  maps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
  },

  // Gmail OAuth2
  gmail: {
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },

  // Prospection
  prospection: {
    prospectsParJour: 15,
    emailsParJour: 10,
    relanceJours: 3,
    villes: ['Yaounde', 'Douala', 'Bafoussam'],
    secteurs: [
      { nom: 'Restaurant / Traiteur', recherche: 'restaurant' },
      { nom: 'Clinique / Medecin', recherche: 'clinique medecin' },
      { nom: 'Ecole / Academie', recherche: 'ecole academie' },
      { nom: 'BTP / Immobilier', recherche: 'construction immobilier' },
      { nom: 'Salon de beaute', recherche: 'salon coiffure beaute' },
      { nom: 'Transport / Logistique', recherche: 'transport logistique' },
    ],
  },

  // Offres commerciales
  offres: {
    starter: { nom: 'Starter', prix: 100000, description: 'Site vitrine 3 pages' },
    pro: { nom: 'Pro', prix: 200000, description: 'Site 5 pages + SEO + maintenance 3 mois' },
    premium: { nom: 'Premium', prix: 350000, description: 'E-commerce ou site complexe' },
  },
};
