# HAPPI DIGITAL - GUIDE D'ACTIVATION DE L'AGENT IA
# Pharel Happi | Yaounde | +237 699 179 254

## CE QUE L'AGENT FAIT CHAQUE MATIN A 7H (SANS TOI)

1. Cherche 15 PME sans site web sur Google Maps (Yaounde, Douala, Bafoussam)
2. Enregistre leurs coordonnees dans la base de donnees
3. Envoie des emails personnalises depuis ton Gmail
4. Relance automatiquement a J+3 ceux qui n'ont pas repondu
5. Genere un rapport de synthese

TON SEUL TRAVAIL = Repondre aux interesses sur WhatsApp ou email

---

## ETAPE 1 : Creer le repo GitHub (5 minutes)

1. Va sur https://github.com/new
2. Nom du repo : happi-digital-agent
3. Prive : Oui
4. Clique "Create repository"

Puis sur ton ordinateur Windows :
  - Installe Git : https://git-scm.com/download/win
  - Ouvre Git Bash et execute :

    git clone https://github.com/hepixbusiness-ops/happi-digital-agent
    cd happi-digital-agent
    (copie tous les fichiers de cet agent ici)
    git add .
    git commit -m "Agent IA Happi Digital"
    git push

---

## ETAPE 2 : Ajouter les secrets GitHub (10 minutes)

Va sur : https://github.com/hepixbusiness-ops/happi-digital-agent/settings/secrets/actions

Ajoute ces secrets un par un :

  SUPABASE_URL          = https://vuzjrsgobeevfqjmsgsm.supabase.co
  SUPABASE_SERVICE_KEY  = (voir ci-dessous)
  GOOGLE_MAPS_API_KEY   = (voir Etape 3)
  GMAIL_CLIENT_ID       = (voir Etape 4)
  GMAIL_CLIENT_SECRET   = (voir Etape 4)
  GMAIL_REFRESH_TOKEN   = (voir Etape 4)
  GMAIL_FROM            = hepixbusiness@gmail.com

Pour SUPABASE_SERVICE_KEY :
  1. Va sur https://supabase.com/dashboard/project/vuzjrsgobeevfqjmsgsm/settings/api
  2. Copie la cle "service_role" (pas "anon")

---

## ETAPE 3 : Cle Google Maps (10 minutes)

1. Va sur https://console.cloud.google.com
2. Connecte-toi avec hepixbusiness@gmail.com
3. Cree un projet : "Happi Digital Agent"
4. Active la facturation (200$/mois GRATUIT - tu ne depasseras jamais)
5. APIs & Services > Library > "Places API" > Enable
6. APIs & Services > Credentials > Create Credentials > API Key
7. Copie la cle et ajoute-la dans GitHub Secrets : GOOGLE_MAPS_API_KEY

---

## ETAPE 4 : Gmail automatique (20 minutes)

1. Va sur https://console.cloud.google.com (meme projet)
2. APIs & Services > Library > "Gmail API" > Enable
3. APIs & Services > Credentials > Create Credentials > OAuth client ID
4. Type : Desktop application
5. Nom : Happi Digital Agent
6. Copie Client ID et Client Secret

7. Ouvre ce lien dans ton navigateur (remplace TON_CLIENT_ID) :
   https://accounts.google.com/o/oauth2/auth?client_id=TON_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.send&response_type=code&access_type=offline

8. Autorise l'acces > copie le code affiche

9. Ouvre Git Bash et execute (remplace les valeurs) :
   curl -X POST https://oauth2.googleapis.com/token -d "code=TON_CODE&client_id=TON_CLIENT_ID&client_secret=TON_CLIENT_SECRET&redirect_uri=urn:ietf:wg:oauth:2.0:oob&grant_type=authorization_code"

10. Dans la reponse JSON, copie "refresh_token"
11. Ajoute dans GitHub Secrets : GMAIL_REFRESH_TOKEN

---

## ETAPE 5 : Lancer l'agent (1 minute)

1. Va sur https://github.com/hepixbusiness-ops/happi-digital-agent/actions
2. Clique sur "Happi Digital - Agent IA Journalier"
3. Clique "Run workflow" pour tester maintenant
4. L'agent se lancera automatiquement chaque matin a 7h

---

## TABLEAU DE BORD

Ouvre le fichier dashboard.html dans ton navigateur.
Il se connecte a ta base de donnees en temps reel et permet de gerer
les prospects (changer leur statut, ajouter des notes) et les clients
signes (formule, montant, statut du projet, site livre).

Connexion : email + mot de passe (compte Supabase Auth).
Pour creer ou changer ce compte : Supabase Studio > Authentication > Users
> Add user (ou Reset password) sur le projet vuzjrsgobeevfqjmsgsm.

---

## QUESTIONS ?

WhatsApp : +237 699 179 254
Email : hepixbusiness@gmail.com
