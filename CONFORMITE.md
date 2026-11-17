# Mise en conformité — Selecta Agency

Document de suivi. Dernière mise à jour : novembre 2026.
Périmètre validé : micro-entreprise, 1 personne, site vitrine de services (B2C + B2B), hébergement OVH (France), aucun compte, aucun paiement en ligne, aucun analytics.

---

## 1. Fichiers créés

| Fichier | Rôle |
|---|---|
| `legal/mentions-legales.html` | Mentions légales (LCEN) — éditeur, hébergeur, PI, responsabilité |
| `legal/confidentialite.html` | Politique de confidentialité + section Cookies et traceurs (`#cookies`) |
| `legal/cgv.html` | CGV services (B2C + B2B), rétractation, garanties, médiation, formulaire type |
| `legal/legal.css` | Feuille de style commune aux pages légales (même langage visuel que le site) |
| `fonts/fonts.css` + 6 fichiers `.woff2` | Polices Archivo et Inter hébergées localement |
| `vendor/leaflet/` | Bibliothèque de cartographie hébergée localement (CSS, JS, images) |
| `CONFORMITE.md` | Ce document |

## 2. Fichiers modifiés

| Fichier | Changement |
|---|---|
| `index.html` | Pied de page légal, liens légaux dans l'application WhatsApp, `h1` masqué, notifications accessibles, titre Photos en `h2`, polices et Leaflet en local |

---

## 3. Ce qui a été fait, point par point

### 3.1 Mentions légales (applique)
Page créée avec : dénomination, forme juridique (entrepreneur individuel), siège, SIRET, mention TVA (art. 293 B du CGI), directeur de la publication, email de contact, et **hébergeur complet** (OVH SAS, 2 rue Kellermann, 59100 Roubaix, +33 9 72 10 10 07).
Chaque information que je ne peux pas connaître est un champ orange `[À COMPLÉTER]`.

### 3.2 Politique de confidentialité (applique)
Construite sur les traitements réellement présents dans le code, pas sur un modèle :
1. Email entrant (mailto) — intérêt légitime, 3 ans, pas de transfert hors UE.
2. WhatsApp — Meta, transfert hors UE signalé, alternative email proposée.
3. Journaux OVH — obligation légale (LCEN art. 6-II), 1 an, France.
4. Services tiers (carte, météo, Spotify, miniatures YouTube) — tableau avec IP transmise et pays.
5. Stockage local — thème, disposition, conversations de démonstration, favoris : **jamais transmis**.

Droits, délai de réponse, contact et lien CNIL inclus.

### 3.3 Cookies et traceurs (applique partiellement)
**Aucun traceur soumis à consentement** : pas d'analytics, pas de pixel, pas de bouton de partage scripté, pas de police externe après correction.
→ **Pas de bandeau de consentement** : il n'aurait rien à bloquer.
→ Page `#cookies` listant les deux seuls stockages (localStorage fonctionnel, cookies Spotify déposés uniquement si l'utilisateur ouvre le lecteur).
→ Le lecteur Spotify (iframe) ne se charge **que** quand l'application Musique est ouverte, pas au chargement du site.

### 3.4 CGV (applique)
Prestations de services, B2C **et** B2B : devis, prix, TVA, obligation de moyens, **rétractation 14 jours** avec formulaire type en annexe, exceptions légales, garanties de conformité (2 ans) et vices cachés, confidentialité, responsabilité, clause B2B (pénalités, indemnité 40 €), médiation, juridiction.
Pas de tunnel de paiement → aucune case à cocher avant paiement n'est nécessaire.

### 3.5 CGU (ne s'applique pas)
Aucun compte utilisateur, aucun espace connecté, aucun contenu publié par les visiteurs. Rien créé.

### 3.6 Médiateur de la consommation (applique)
Emplacement prévu dans les CGV (article 11) avec `[MÉDIATEUR À CHOISIR]`, `[ADRESSE]`, `[SITE]`. Voir « À faire par un humain ».

### 3.7 Formulaires (ne s'applique pas)
Il n'y a **aucun formulaire** sur le site : les champs présents sont les claviers simulés de l'application Messages, qui n'envoient rien. Le contact passe par `mailto:` et un lien WhatsApp ; la politique de confidentialité couvre ces deux canaux, et les liens légaux sont désormais présents dans l'application WhatsApp elle-même.

### 3.8 Scripts et services tiers (applique)

| Service | Chargé quand | Traceur | Hors UE | Verdict |
|---|---|---|---|---|
| Google Fonts | à chaque visite | non | **oui** | ❌ supprimé → polices hébergées en local |
| unpkg (Leaflet CSS/JS) | à chaque visite | non | **oui** | ❌ supprimé → bibliothèque en local |
| Tuiles OpenStreetMap | ouverture de Plan | non | Royaume-Uni | ✅ conservé, déclaré |
| API Open-Meteo | ouverture de Météo | non | Suisse (adéquat) | ✅ conservé, déclaré |
| Spotify (iframe) | ouverture de Musique | **oui (Spotify)** | oui | ✅ conservé, chargement différé, déclaré |
| i.ytimg.com (miniatures) | ouverture de YouTube | non | oui (Google) | ⚠️ conservé, déclaré — voir « À faire » |

Résultat : plus aucune requête vers Google ou un CDN tiers au chargement de la page.

### 3.9 Accessibilité (recommandée, pas obligatoire — 1 salarié)
Corrigé :
- `h1` unique et explicite sur la page d'accueil (masqué visuellement, lu par les lecteurs d'écran) ;
- titre de l'application Photos passé en `h2` (plus de second `h1`) ;
- bouton de notification doté d'un nom accessible ;
- focus visible conservé partout (`:focus-visible`) ;
- langue déclarée (`lang="fr"`), images toutes pourvues d'un `alt` (vide pour les éléments décoratifs), champs de saisie associés à un `label`.

Reste manuel : relecture des textes alternatifs des photos de la galerie, sous-titres des vidéos si elles portent du contenu.

### 3.10 Agents IA (ne s'applique pas)
Réponse « non » : aucun `llms.txt`, `robots.txt` ou `sitemap.xml` créé.

### 3.11 Contenu (applique — points signalés, voir « À faire »)
Aucun avis client, aucun chiffre de performance, aucune mention « gratuit » trompeuse, aucun comparatif nominatif. En revanche trois points de droits à trancher par un humain (photos d'artistes, miniatures YouTube, conversations avec des noms réels).

### 3.12 Coordonnées et contact (applique)
- Contact unique et fonctionnel : `contact@selecta.agency` (mailto) + WhatsApp.
- Pied de page ajouté (bas-droite sur ordinateur) avec Mentions légales, Confidentialité, Cookies, CGV, email.
- Sur mobile, où le téléphone occupe tout l'écran, les mêmes liens sont dans l'application WhatsApp.
- Chaque page légale renvoie vers les autres et vers le site.

### 3.13 Autres risques
- **Aucun mot de passe stocké**, aucune base de données : le risque de fuite est limité aux emails reçus.
- **Conversations simulées avec des personnes réelles nommées** (Satine, Filiz, Mitty, Axel Logan, Camille Dumora) : ce sont des personnes existantes. Publier de faux échanges en leur nom, même en démonstration, peut engager le droit à l'image et la réputation. Recommandation : accord écrit des intéressés, ou mention « conversation de démonstration » déjà présente dans l'interface.
- **Liens de billetterie** vers des tiers : couverts par la clause « liens externes » des mentions légales.

---

## 4. À FAIRE PAR UN HUMAIN

1. **Remplir les champs `[À COMPLÉTER]`** : dénomination exacte, adresse du siège, SIRET, nom du directeur de la publication, date d'entrée en vigueur des CGV, ville du tribunal compétent. Téléphone : à supprimer si tu ne veux pas le publier.
2. **Choisir et adhérer à un médiateur de la consommation** — obligatoire pour vendre à des particuliers. Liste officielle : economie.gouv.fr → « médiation de la consommation ». L'adhésion doit être effective **avant** de le citer.
3. **Vérifier l'hébergement réel** : j'ai écrit OVH d'après ta réponse. Si le site est en réalité sur Netlify/Vercel/GitHub Pages, les mentions doivent être corrigées — c'est une obligation, et l'hébergeur doit être exact.
4. **Droits sur les visuels** : photos d'artistes (récupérées du CDN Spotify), miniatures YouTube, logos Instagram/Spotify/YouTube. Il faut soit une autorisation, soit des visuels fournis par les artistes. Les logos de marques relèvent de l'usage nominatif (toléré pour désigner le service), pas d'une libre réutilisation.
5. **Accord des personnes nommées** dans les conversations de démonstration.
6. **Vérifier la boîte `contact@selecta.agency`** : elle doit exister et être relevée, sinon le site n'a aucun contact fonctionnel.
7. **Relecture par un avocat** avant mise en ligne : le site vend des services et cite un médiateur, deux points où une erreur coûte cher.

---

## 5. Points jugés NON applicables

| Point | Raison |
|---|---|
| CGU | Aucun compte, aucun espace connecté, aucun contenu utilisateur. |
| Case d'acceptation des CGV avant paiement | Aucun paiement en ligne. |
| Bandeau cookies | Aucun traceur soumis à consentement. |
| Formulaire de contact (correction) | Aucun formulaire réel : mailto + WhatsApp. |
| `llms.txt`, `robots.txt`, `sitemap.xml` | Tu as répondu non à l'indexation par les agents IA. |
| Déclaration d'accessibilité RGAA | Sous les seuils (10 salariés, 2 M€). |
| Newsletter / désinscription | Aucune newsletter. |
| Comptes utilisateurs, mots de passe | Aucun système de compte. |
