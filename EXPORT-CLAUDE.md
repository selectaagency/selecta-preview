# SELECTA AGENCY — faux iPhone interactif · brief de reprise pour Claude

> État au 14 novembre 2026. Remplace `EXPORT-CLAUDE-12-11.md` (archivé).

## 1. Le projet en une phrase

`index.html` est **un fichier unique autonome** (HTML + CSS + JS inline, aucune build) qui affiche un faux iPhone 15 servant de site vitrine pour **SELECTA**, agence française de management artistique (Paris). Le visiteur déverrouille le téléphone et fouille des applications réelles : fiches artistes, calendrier de dates, playlist, Instagram, clips, jeu vidéo, météo…

Lancement local : `cd selecta-agency && python3 -m http.server 8777` → `http://localhost:8777/index.html`
Publication : le dossier tel quel sur Netlify Drop (aucun build, aucune dépendance npm).

---

## 2. Géométrie & design system

| Élément | Valeur |
|---|---|
| Écran | 393 × 852 px (iPhone 15), `--s` pour la mise à l'échelle desktop |
| Coins du téléphone | 55 px, Dynamic Island 125 × 37 |
| Barre d'état | 54 px, icônes SVG maison |
| Icônes d'app | 60 × 60, rayon 13,5 (grille 4 colonnes) |
| Dock | 82 px, 3 apps (Messages, Mail, WhatsApp) |
| Home indicator | 139 × 5 |
| Police | Archivo (titres) + Inter (texte), Google Fonts |
| Thème | `.phone.light` (défaut, clé locale `selecta-theme`) — le sombre fonctionne aussi |

**Repères de couleur** : `--card` (fond d'app), `--txt`, `--muted`, `--line`. Toutes les icônes d'app sont des SVG inline (`*_ICON`), sauf les vraies images de `icons/` (180 × 180 PNG).

---

## 3. Architecture du fichier

1. `<style>` : un seul gros bloc CSS organisé par app (`/* ---------- Spotify ---------- */`, etc.).
2. `<main class="phone" id="phone" data-screen="lock" data-panel="">` — l'écran est piloté par **deux attributs** :
   - `data-screen` ∈ `lock | home | mgmt | cal | notes | gallery | plan | cam | yt | ytwatch | meteo | listen | ig | igpost | game | metro | dice | calc | clock | msgs | thread | msg | mail | wa`
   - `data-panel` ∈ `"" | notif | control`
3. Chaque app = `<section class="screen app" data-app="<clé>">` ; le JS bascule la classe `.open`.
4. `open(screen)` : **point d'entrée unique de navigation**, exposé en `window.__open`. Il joue le son de déverrouillage, programme le message de Satine 5 s après le premier déverrouillage, et émet `document.dispatchEvent(new CustomEvent('app:screen', {detail: screen}))` — **c'est le hook à utiliser pour tout module externe**.
5. `window.__openThread(id)` ouvre une conversation Messages.
6. `window.__APPS` expose le tableau des apps (voir §4).

---

## 4. Où modifier quoi

| Données | Emplacement | Remarque |
|---|---|---|
| Ordre / nom / icône des apps | `var APPS = [ ['Nom', 'fichier-png-sans-extension', ICONE_SVG, 'clé-écran'], … ]` | 15 entrées : Artistes, Calendrier, Notes, Galerie, Plan, Caméra, YouTube, Météo, Spotify, Instagram, 320, PANAME, DICE, Calculatrice, Horloge |
| Disposition mémorisée | clé localStorage `selecta-home-v3` | glisser-déposer + mode édition |
| Artistes / contacts | `var ROSTERS` (Satine, Filiz, Mitty) | sert aussi la Galerie |
| Événements calendrier | `var EVENTS_DEFAULT` + CRUD, `window.__cal` | 19/11 Mitty FGO Barbara · 20/11 Mitty (Strasbourg) · 20/11 Filiz |
| Conversations | `var CONVS` | Satine = 1 seul message « tu viens me voir a la gaité ??? » ; Camille et Axel = fils vides |
| Vidéos YouTube | `var YT_SEED` (28 vidéos réelles, `UCcGgTRwPxH-IzxGzB7mZr0Q` + feed Filiz) | miniatures `i.ytimg.com` |
| **Fiches Artistes** | `var A = [ {id, name, photo, genres, facts[], bio[], links[]}, … ]` (fin de fichier) | photo `photos/<id>.jpg` ; liens `{k: ig\|tt\|yt\|sp, n, h}` |
| Textes FR/EN | table `STR` + `[sélecteur, 'text'\|'html', valeur]` | site bilingue, FR par défaut |

---

## 5. Les apps, une par une

| App | État | Détail |
|---|---|---|
| **Artistes** | ✅ refaite | 3 onglets (Satine / Filiz / Mitty) + fiche : photo 4:5, genres, pastilles (label / live / date), bio complète, grille Instagram / TikTok / YouTube / Spotify |
| **Calendrier** | ✅ | mois réel, ajout / suppression, persistance, widget sur l'accueil |
| **Notes** | ✅ | texte SELECTA (manifeste de l'agence) |
| **Galerie** | ⚠️ | 3 tuiles, photos si `photos/<slug>.jpg` existe |
| **Plan** | ✅ | carte de Paris dessinée en canvas 2D, marqueurs de dates |
| **Caméra** | ✅ | viseur simulé (icône fournie par le client) |
| **YouTube** | ✅ | feed façon app iOS : chips, cartes 16:9, lecteur `youtube-nocookie` |
| **Météo** | ✅ | Open-Meteo réel : 24 h + courbe, lever / coucher, 10 jours, 6 cartes détail |
| **Spotify** | ⚠️ | iframe officielle de la playlist SELECTA — **jamais détruite** (la musique continue en naviguant) |
| **Instagram** | ✅ | profil embarqué (abonnés, stories, 12 posts) |
| **320** | ✅ | jeu de plateforme (Satine), chats noirs = bonus |
| **PANAME** | ✅ | runner métro canvas, 5 niveaux, icône violette « M » |
| **DICE** | ⚠️ | dates + liens billetterie externes (Cloudflare bloque l'API) |
| **Calculatrice / Horloge** | ✅ | Horloge complète : monde, alarmes, chrono, minuteur |

**Système** : écran verrouillé (**tap pour ouvrir** + son `sounds/unlock.wav`), logo 3D Three.js manipulable au doigt, centres de notification et de contrôle, îlot dynamique (égaliseur quand Spotify a été lancé), notification Satine 5 s après déverrouillage, mode clair / sombre, drag & drop des icônes.

---

## 6. Le logo 3D — ne pas casser

- Three.js en CDN, canvas `#space3d`, **masqué sur l'accueil** (`opacity:0`, `pointer-events:none`), visible sur le verrou.
- Contour extrait au chargement de `icons/logo-wall.png` (marching squares maison), puis extrudé (`ExtrudeGeometry`, `DEPTH ≈ 0.04`).
- Rotation : `phone.addEventListener('pointerdown', …, true)` → `startDrag(e)` avec **raycast** sur le mesh (`hitLogo`). Un geste sur le logo ne doit **jamais** naviguer ni ouvrir une app ; un clic est bloqué 320 ms après relâchement (`window.__logoGesture`).
- ⚠️ **Piège déjà rencontré** : ne jamais ajouter de garde du type `if (dansLaZoneDuLogo) return;` dans ce handler — c'est exactement ce qui avait cassé la rotation. Le hit-test se fait par raycast, pas par zone.

---

## 7. Limites connues (ne pas « corriger » à l'aveugle)

1. **Spotify** : l'iframe est cross-origin → impossible de lire la position ou de piloter play/pause depuis la page ; il n'y a donc pas de contrôles sur l'écran verrouillé. Pour de vrais contrôles il faut un lecteur HTML5 natif avec des fichiers audio fournis.
2. **Photos de presse** : `photos/satine.jpg`, `filiz.jpg`, `mitty.jpg` viennent des profils Spotify (320 px). Les remplacer par des fichiers hi-res **sans changer les noms** suffit.

Points ouverts :
- YouTube de Mitty non renseigné (le lien fourni pointait sur la chaîne de Satine) → absent de sa fiche.
- Lien Spotify de Satine : le client a donné `4dbQoQ7m0IyjutcjdQEjcS`, mais le profil public actif est `7Abx1tdwQoBDWr1nD1o62B` — à arbitrer.
- Icône DICE à refaire (peu lisible).

---

## 8. Règles à respecter pour toute modification

1. **Un seul fichier** `index.html` ; tout ajout = nouveau `<script>` en fin de `<body>`, branché sur les attributs `data-open` existants.
2. Ne pas recréer les iframes (Spotify / YouTube) : elles doivent rester montées pour que la musique survive à la navigation.
3. Toujours passer par `window.__open('clé')` pour naviguer (jamais toucher `display` à la main).
4. Les données affichées doivent être **réelles** (Open-Meteo, flux YouTube, profil Instagram) : aucune statistique inventée.
5. Le téléphone doit rester utilisable au doigt sur Safari iPhone : pas de `preventDefault` global, `touch-action` maîtrisé.
6. Répondre et livrer en **français**.

---

## 9. Arborescence livrée

```
selecta-agency/
├── index.html            # tout le site (≈ 6 500 lignes, ~400 Ko)
├── icons/                # 19 PNG 180×180 (apps, logo, logo-wall)
├── photos/               # satine.jpg, filiz.jpg, mitty.jpg (fiches artistes)
├── sounds/unlock.wav     # son de déverrouillage
├── BRIEF-CLAUDE.md       # brief d'origine
└── photos/LISEZ-MOI.txt  # consignes photos
```

Backups hors livraison : `index-v1-ancien.html`, `index-v2-avant-claude.html`, `index-v3-avant-metropop.html`, `EXPORT-CLAUDE-12-11.md`.

---

## 10. Ce qui reste à faire (par ordre d'intérêt)

1. Photos de presse hi-res des trois artistes (remplacer les 3 fichiers).
2. YouTube de Mitty + arbitrage du lien Spotify de Satine.
3. Icône DICE.
4. Version anglaise : les traductions existent (`STR`) mais n'ont pas été relues par un anglophone.
5. Lecteur audio natif (vrais contrôles verrou + îlot) si des morceaux sont fournis.

## 8 — COLLECTION : salle d'écoute 3D (fichier `collection.js`)

Nouvelle app `data-app="collection"`, inspirée d'une vidéo de référence montrant
une étagère de CD, cassettes et vinyles que l'on fait défiler, tourner et jouer.

**Différence majeure avec la vidéo** : elle utilise des modèles 3D générés par un
outil payant (Artlist / Hunyuan / Tripo / Meshy, export GLB) puis importés. Ici
**toute la géométrie est construite par le code**. Aucun fichier 3D à charger, et
on peut changer une pochette ou une étiquette sans logiciel de modélisation.

### Organisation
- `collection.js` à la racine, chargé après `vendor/three.min.js`. Quatre blocs :
  données et pochettes, objets, lecteur, scène et interactions.
- L'écran et le CSS sont dans `index.html` (préfixe `.col-`), comme les autres apps.
- Le rendu démarre à l'ouverture de l'écran et **se suspend dès qu'on en sort**
  (événement `app:screen`). La lecture, elle, continue : c'est voulu.

### Ajouter un album
Tableau `COLLECTION` en haut de `collection.js` :
`{ id, kind: 'cd' | 'vinyl' | 'tape', artist, title, uri, cover, tint }`.
Le bouton « LIEN SPOTIFY » dans l'app fait la même chose sans toucher au code et
retient le lien dans `localStorage` (clé **`selecta-collection`**).

### Pochettes
Tant qu'aucun lien Spotify n'est renseigné, la pochette est un **visuel génératif**
produit par le code à partir du nom de l'artiste : ce n'est pas la vraie pochette,
et c'est assumé. Dès qu'un lien est fourni, le vrai titre et la vraie pochette
viennent de l'endpoint public `open.spotify.com/oembed` (sans clé d'API).

### Audio
Pont vers l'**API iFrame de Spotify** (`open.spotify.com/embed/iframe-api/v1`) :
`loadUri`, `play`, `pause`, `togglePlay`, `seek`, et l'événement `playback_update`
qui alimente la barre de progression et l'état de lecture.
**L'API n'expose pas le volume** — le son suit celui de l'appareil. La molette du
lecteur sert donc à se déplacer dans le morceau, ce qui est réellement supporté ;
elle n'est pas un faux bouton de volume. Sans lien Spotify, l'afficheur indique
« NO DISC / AJOUTER UN LIEN » plutôt que de simuler une lecture.

### Pièges résolus pendant cette passe — à ne pas réintroduire
1. **`THREE.ColorManagement` est désactivé par défaut en r149.** Une couleur
   hexadécimale est alors prise pour une valeur **linéaire**, puis réencodée en
   sRGB : tout ressort beaucoup plus clair que la teinte voulue (un brun très
   sombre devenait beige). D'où `D.col(hex)` qui convertit explicitement. Ne pas
   activer `ColorManagement` globalement : la scène du logo 3D du site a été
   réglée avec le comportement actuel et bougerait.
2. **`roundedBox()` est une `ExtrudeGeometry`, pas un cube.** Elle n'a que
   **deux** groupes de matériaux (faces, tranches), pas six. Un tableau de six
   matériaux ne marche pas : la pochette du vinyle ne s'affichait jamais.
3. **`RingGeometry` a un trou au centre** : un rayon de sélection tiré en plein
   milieu du disque ne touche rien. D'où `grabTarget()`, un disque plein
   invisible ajouté uniquement pour la saisie.
4. **Deux faces coplanaires se disputent la profondeur.** Les faces avant et
   arrière d'un disque doivent être écartées (±0.0035), sinon la face miroir du
   dessous blanchit l'étiquette du dessus.
5. **`CylinderGeometry` est fermée par défaut.** Le puits à disque présentait son
   couvercle chromé à la caméra et masquait le fond : il faut `openEnded = true`.
6. **Le corps du lecteur est plein** : impossible d'y percer un trou sans
   opération booléenne. Le puits est donc une **couronne en relief** posée sur la
   face avant, et le disque se loge devant, pas dedans — sinon il disparaît dans
   la matière.
7. **La transmission physique (`transmission`) échantillonne une cible de rendu
   basse définition** : elle floute et délave tout ce qui est derrière la vitre,
   et coûte une passe de rendu. Pour une paroi mince (boîtier, coque de
   cassette), une transparence spéculaire est plus nette et moins chère.
8. **Une coque transparente ne doit pas voiler son contenu.** À opacité 0.4 elle
   éclaircissait les bobines de la cassette de près du noir au beige. Elle se lit
   par ses arêtes et ses reflets rasants : opacité basse, `envMapIntensity` haute.
9. **Un vernis (`clearcoat`) sur une surface plane face caméra réfléchit tout le
   studio** et blanchit la texture. Sur la face imprimée du CD il faut le réduire.
10. **Pas de plan de sol** : une ligne d'horizon trahit la boîte 3D. Chaque objet
    pose sa propre tache de contact peinte dans un canvas — plus doux et bien
    plus léger qu'une vraie ombre portée.
11. **Mesurer une barre pendant l'animation de transition donne une position
    fausse.** Dans les scripts de test, attendre ~600 ms après un changement
    d'écran. Et `.clock .home-bar` est masquée **par conception**.

### Performances
Scène volontairement légère : **8 760 triangles, 22 appels de rendu, 17 géométries,
8 textures**. Deux niveaux de qualité (`detectQuality()`) : sur mobile, rapport de
pixels plafonné à 1.5, irisation coupée et cercles moins définis. Sur téléphone ce
n'est pas le nombre de triangles qui coûte, mais la complexité des nuanceurs et le
nombre de pixels à remplir.

**Non vérifié depuis ici** : la fluidité réelle sur iPhone. Le bac à sable de test
n'a qu'un rendu logiciel (SwiftShader), qui plafonne à ~5 images par seconde y
compris sur la scène du logo existante, laquelle tourne sans problème sur un vrai
appareil. Les chiffres ci-dessus décrivent la charge, pas le résultat.

### Vérifié (Chrome headless, 0 erreur JS)
430×932 sombre, 390×844 clair, 932×430 paysage : 23 écrans ouverts un par un,
16 icônes dont Collection même pour un visiteur ayant une ancienne disposition
enregistrée, logo 3D du site intact. Parcours complet : défilement par glissement
et à la molette, sélection, rotation libre **avec inertie mesurée après le
relâchement**, ouverture du boîtier, saisie du disque, glissement jusqu'au
lecteur, indice de dépôt, insertion, rotation du disque pendant la lecture.
Chaîne audio vérifiée avec une API Spotify simulée : script injecté, contrôleur
créé avec la bonne URI, `loadUri` et `play` appelés, `playback_update` alimentant
progression (0.233), horodatage (0:42 / 3:00) et bouton pause, touches 3D
cliquables, molette déplaçant la lecture (0.233 → 0.485).

## 9 — PHOTOS, ARTISTES, CAMÉRA (passe médias)

### Chaîne de conversion des médias
65 fichiers d'origine (192 Mo) convertis par `convert.py` vers `gallery/` :
- **HEIC → JPEG** via `pillow-heif` (les navigateurs autres que Safari ne lisent
  pas le HEIC) ; orientation EXIF appliquée, grand côté ramené à 1600 px,
  qualité 82, plus une miniature carrée de 440 px recadrée au centre haut.
- **Vidéos HEVC → H.264** via ffmpeg (le HEVC en `.mov` ne se lit pas partout) ;
  grand côté 1280 px, CRF 27, `+faststart`, miniature extraite à 0,3 s.
  ffmpeg applique seul la rotation : les `.MOV` iPhone sont stockés en
  1920×1080 avec une rotation de −90° et ressortent donc en portrait.
- **Dates** : `DateTimeOriginal` de l'EXIF pour les photos, `creation_time` du
  conteneur pour les vidéos, repli sur la date du fichier. C'est ce qui donne
  le regroupement par mois.
Résultat : 13 Mo de photos, 20 Mo de vidéos, 2 Mo de miniatures.

`gallery/manifest.js` déclare `window.GALLERY`. **C'est un fichier JS, pas un
JSON** : le site doit aussi fonctionner ouvert en `file://`, où `fetch()` sur un
fichier local est refusé par le navigateur. Pour ajouter des médias, relancer
`convert.py`, qui réécrit le manifeste.

### `photos.js` — app Photos (ex-Galerie)
Grille à trois colonnes groupée par mois avec en-têtes collants, visionneuse
plein écran, albums Photos / Vidéos / Favoris, favoris dans `localStorage`
(`selecta-photos-fav`), sélection multiple, téléchargement, partage via
`navigator.share` avec repli sur le téléchargement.
- La visionneuse ne monte que **trois diapositives** (la courante et ses
  voisines) : soixante-cinq médias en mémoire tueraient le défilement.
- Gestes : glissement horizontal pour changer, glissement vertical franc pour
  refermer, pincement et double-tap pour zoomer, déplacement quand c'est zoomé.
- Vidéos : barre de lecture maison (lecture, position, son, plein écran).
  Sur iPhone, seul `video.webkitEnterFullscreen()` fonctionne — c'est essayé
  en premier.

### `camera.js` — app Caméra
`gallery/cam/viewfinder.mp4` (720×1280, 22 s, muet, en boucle) tient lieu de
flux d'objectif. L'ancienne version demandait l'accès à la vraie caméra
(`getUserMedia`) ; ce code a été retiré, seules deux fonctions vides restent
dans l'aiguillage.
- Zoom numérique amorti de 0,5× à 6×, au bouton, à la molette et au pincement.
- **Capture réelle** : `drawImage` recadre exactement ce que montre le viseur,
  zoom et filtres compris, dans un canvas à deux fois la taille affichée.
- **Enregistrement réel** quand `MediaRecorder` + `canvas.captureStream` sont
  disponibles : on peint le viseur dans un canvas à 30 im/s et on encode.
  Quand ils ne le sont pas — c'est le cas de certaines versions de Safari —
  l'app **le dit** (« ENREGISTREMENT NON PRIS EN CHARGE ») et se replie sur une
  image fixe. Elle ne fait jamais semblant d'enregistrer.
- Modes réellement distincts : Ralenti change `playbackRate` à 0,25 ;
  Cinématique applique contraste, saturation et vignetage, y compris dans la
  capture ; Vidéo et Photo changent le comportement du déclencheur.

### `artistes.js` — refonte éditoriale
Trois chapitres, un par artiste. Photographie en bichromie (niveaux de gris +
voile à la teinte de signature en `hard-light`), grain SVG, nom en très grand
corps posé en `mix-blend-mode: difference`, parallaxe au défilement, fiche
technique en monospace, exergue en Georgia italique, biographie dépliable,
réseaux et lecteur Spotify de l'artiste.
- **Les données ne sont pas dupliquées** : le module lit `window.__ARTISTS`,
  exposé par le bloc de fiches déjà présent dans `index.html`. Pour corriger une
  biographie ou un lien, c'est toujours là-bas.
- Le voile sombre du bas est en fusion **normale**, pas `hard-light` : c'est lui
  qui garantit que le nom en `difference` ressorte en clair sur une photo
  claire. Ne pas le fusionner avec le voile coloré.
- `MEDIA` en haut du fichier associe des médias de la galerie à un artiste.
  Volontairement vide : je ne devine pas qui est sur quelle photo.

### Bugs trouvés dans la version reçue, et corrigés
1. **Le sélecteur clair / sombre / auto ne servait à rien.** Le code contenait
   `var pref = 'light'; pref = 'light'; localStorage.setItem(KEY,'light');` :
   le thème était forcé à chaque chargement *et* le choix de l'utilisateur
   écrasé. Le clair reste le défaut, mais un choix enregistré est désormais lu.
2. **`vendor/` et `ig/` manquaient dans l'archive reçue** alors que
   `index.html` les référence : le logo 3D ne pouvait pas s'afficher.
3. **`[hidden]` ne suffit pas** quand une règle fixe `display` : il faut une
   règle explicite (`.ph-albums[hidden] { display: none !important }`), sinon la
   grille et les albums s'affichaient en même temps.
4. **Ancien CSS `.cam-ui`** en `display:flex` : toute l'interface de la caméra
   se retrouvait sur une seule ligne. La règle a été supprimée.
5. **Écrans d'app sans fond opaque** : la grille d'accueil transparaissait
   derrière. `background: var(--ink)` ajouté sur les nouveaux `.app-body`.

### Icône Photos
Dessin original. **Je ne reproduis pas l'icône d'Apple** (la fleur à huit
pétales) : c'est une marque déposée. L'icône livrée reprend l'idée d'un spectre
de couleurs sous la forme d'un prisme de bandes en éventail. Si tu déposes
`icons/photos.png`, c'est ce fichier qui s'affiche à la place.

### Collection : liens Spotify réels
Les trois entrées de `COLLECTION` pointent maintenant vers les **pages
d'artiste réelles**, reprises des fiches Artistes du site
(Mitty `6Wo4zyufcc4V8ZM1TCxDxW`, Satine `4dbQoQ7m0IyjutcjdQEjcS`,
Filiz `5IotvmXP4j1DikGWocffKz`). L'app n'arrive donc plus vide.

### Vérifié (Chrome headless, 0 erreur JS)
430×932 et 390×844 en clair et en sombre, 932×430 en paysage : 23 écrans ouverts
un par un, 16 icônes, logo 3D intact. Photos : 65 tuiles, 11 groupes de mois,
visionneuse (métadonnées réelles, glissement 1/65 → 2/65, double-tap 1× → 2,6×
→ 1×), favori répercuté dans l'album Favoris, vidéo ouverte avec sa barre.
Caméra : vidéo chargée (720×1280, readyState 4), 4 modes, 4 paliers de zoom,
zoom 2× appliqué, capture JPEG réelle de 229 Ko, enregistrement MediaRecorder
démarré, chronométré et arrêté avec production d'un fichier, ralenti à 0,25×.
Artistes : 3 chapitres, rail, changement d'artiste, biographie dépliable,
4 liens réels et les 3 lecteurs Spotify avec les bons identifiants.

### Ce que je n'ai pas pu vérifier
- **Safari sur iPhone** : pas d'accès. À tester toi-même, en particulier la
  lecture automatique du viseur, `webkitEnterFullscreen` sur les vidéos, le
  pincement, et si `MediaRecorder` est disponible (sinon l'app te le dira).
- **La fluidité réelle sur un vrai GPU** : le bac à sable n'a qu'un rendu
  logiciel.
- **Les portraits d'artistes ne font que 320×320 px.** La mise en page compose
  avec cette limite (bichromie, grain) mais une photo de 1600 px de large par
  artiste rendrait les chapitres nettement plus nets.

## 10 — Passe de retouches (Artistes, Caméra)

### Caméra — quatre corrections
1. **Le zoom déplaçait l'image hors du cadre.** Cause : une ancienne règle
   `#cam-video { inset: 0; object-fit: cover; transform: scaleX(-1) }`,
   héritée de la version qui utilisait la vraie caméra. Un **sélecteur
   d'identifiant** (spécificité 1-0-0) l'emportait sur `.cam-stage video`
   (0-1-1) quel que soit l'ordre des règles, donc le `left: 50% / top: 50%`
   n'était jamais appliqué et le `translate(-50%,-50%)` du script décalait la
   vidéo d'une demi-hauteur vers le haut. La règle a été supprimée. Leçon à
   retenir : vérifier la spécificité avant de croire qu'une nouvelle règle
   remplace l'ancienne.
2. **Zoom refait.** 1× remplit le cadre (`object-fit: cover`), au-delà c'est un
   agrandissement, et en dessous on interpole vers « contain » : à 0,5× on voit
   l'image enregistrée en entier, avec de fines bandes noires. Avec une seule
   source vidéo, c'est la seule façon honnête de rendre un grand-angle — on ne
   peut pas inventer du champ. `drawFrame()` applique exactement le même
   cadrage, donc **la capture correspond au viseur**, bandes comprises.
3. **Déclencheur centré** par positionnement absolu (`left: 50%` +
   `translate(-50%,-50%)`), la pastille de capture étant elle aussi en absolu à
   gauche. La disposition en `space-between` ne garantissait pas le centre.
   États : disque blanc en photo, disque rouge en vidéo, **carré rouge arrondi**
   pendant l'enregistrement, avec transition.
4. **Ouverture en mode VIDÉO** et ordre des modes aligné sur la demande :
   RALENTI — PHOTO — VIDÉO — CINÉMATIQUE.

### Caméra — son
`viewfinder.mp4` est réencodé **avec sa piste audio d'origine** (AAC 128 kb/s).
Les navigateurs n'autorisent la lecture automatique que sans son : l'app démarre
donc muette, affiche « Toucher pour activer le son », et **le premier geste**
— n'importe où dans le viseur, ou l'appui sur le déclencheur — rétablit l'audio.
Un bouton haut-parleur dans la barre du haut permet de couper et remettre le son
à tout moment ; le choix est retenu pour la session (`sessionStorage`).

### Artistes — netteté des photographies
Les sources `photos/satine.jpg`, `filiz.jpg` et `mitty.jpg` font **320 × 320 px**
et sont déjà fortement compressées. C'est la cause du flou, pas l'affichage.

Deux choses ont été faites :
- Des versions `photos/<slug>-hd.jpg` ont été générées : léger lissage des
  artefacts, agrandissement **Lanczos ×4** puis masque flou mesuré. Résultat :
  1280 px, ce qui évite le lissage du navigateur et donne une image nettement
  plus propre sur écran Retina. **Cela ne crée pas de détail**, cela cesse d'en
  perdre.
- L'agrandissement CSS a été réduit : plus de `scale(1.06)` ni d'`inset: -6%`,
  seulement le débattement nécessaire à la parallaxe.

**Fichiers à remplacer pour une vraie netteté** : `photos/satine.jpg`,
`photos/filiz.jpg`, `photos/mitty.jpg`, idéalement en **1600 × 2000 px**
(portrait, format 4/5) et en qualité JPEG élevée. Déposer les nouveaux fichiers
et supprimer les `-hd` : le code retombe automatiquement dessus.

Troisième possibilité : le tableau **`HERO`** en haut de `artistes.js` accepte
un identifiant de `window.GALLERY` (par exemple `'p013'`). Les photos de la
médiathèque font 1600 px — c'est la meilleure source disponible aujourd'hui.
Je ne l'ai pas rempli : je ne devine pas qui figure sur quelle photo.

### Artistes — lisibilité des textes sur la photo
`.ar-index` passe de 10 à 12,5 px et `.ar-vert` de 9 à 11,5 px, en demi-gras,
avec une pastille sombre floutée derrière chacun. Ils restent donc lisibles sur
une photo claire comme sur une photo sombre, sans alourdir la composition.
`.ar-vert` est en `white-space: nowrap` pour tenir sur une seule colonne.

### Non modifié
L'application **Photos** n'a pas été touchée, comme demandé.

## 11 — Passe « iPhone + iPad » (15 novembre 2026)

### Logo 3D du verrou (bloc « LOGO SELECTA EN VOLUME » en fin de `index.html`)
- Le contour est **vectoriel** (tracé au sous-pixel depuis `icons/logo-source.png`, 2,4 Ko dans le code) :
  net à toutes les tailles. `vendor/logo-data.js` (436 Ko) n'est plus utilisé et a été retiré.
- Placement : identique au logo de `wall-lock.jpg` (même calcul « cover », vérifié au demi-pixel près
  en 393×852, 430×740 et 375×667). `wall-lock.jpg` reste le repli si WebGL manque.
- Rotation « trackball » au doigt, inertie, retour en douceur face caméra. Un tap sur le logo déverrouille.
  Le canevas est `pointer-events: none` ; la saisie se fait par lancer de rayon (règle du §6 respectée).
- Le canevas ne couvre qu'un carré autour du logo (`setViewOffset`) : ~4× moins de pixels à peindre.
- La classe `space3d` est maintenant posée en dur sur `<main class="phone">` : beaucoup de règles CSS
  historiques (couleur des libellés, dock…) en dépendent, même sans WebGL.

### PANAME REND FOU — `paname.js` (nouveau fichier, remplace l'ancien moteur inline)
- 5 stations dessinées à la main (cartes ASCII dans le fichier) : Châtelet (L1), Abbesses (L12),
  Arts et Métiers (L11), Bir-Hakeim (L6), Madeleine (L14). Physique à pas fixe 120 Hz.
- Mécaniques : double saut, dash, tapis roulants, portillons (1 ticket, sinon amende), valideurs
  (checkpoints), rames dans les tunnels (flanc dangereux, toit porteur), navette du viaduc, rail sous
  tension, portes palières, engrenages mobiles, rats / pigeons / contrôleurs, croissants (cœur),
  10 pass Navigo cachés (débloquent les tenues), 3 étoiles par station.
- Sauvegarde : `paname-v2` (reprend `metropop-save` et `paname-navigo` des anciennes parties).
- API conservée : `window.metropop.{start, menu, size, stop, isRunning}` + `state`, `teleport` (tests).

### 320
- Tempo à 120 BPM (boucle synthwave WebAudio, sans fichier) : retomber sur le temps = bonus « ON BEAT ».
- Petite touche rapide (ou ↓ / Espace) : plongeon. Ligne du record, sons, plateformes éphémères.
- Bug corrigé : les bonus (chats, gags) étaient effacés à la montée suivante (`score = climbed × 5`).
- Physique à pas fixe ; lueurs, ciel et Miku mis en cache (plus de `shadowBlur` par image).
- Musique coupée d'office si Spotify joue déjà (`data-spotify="1"`). Bouton Son mémorisé.

### Version iPad (ordinateur)
- `html.ipad` posé dans `<head>` si souris/trackpad + fenêtre ≥ 1000 px. Forçable : `?device=ipad`,
  `?device=iphone`, ou le sélecteur iPhone / iPad à côté de FR / EN (mémorisé : `selecta-device`).
- Tout le CSS iPad est sous `html.ipad` (bloc « iPAD (ordinateur) ») : la version iPhone n'est pas touchée.
- iPad Pro 11" à l'horizontale (1194 × 834) : barre d'état avec la date, widgets à gauche (Calendrier +
  note Selecta reprise de l'app Notes), grille 6 colonnes, dock flottant avec apps récentes.
- Les apps s'ouvrent en fenêtres (Stage Manager), poignée « ⋯ » : Plein écran, Split View, Fermer.
  Clic hors fenêtre ou Échap : retour à l'accueil. Script « iPADOS : dock, fenêtres, Split View ».

### Audit — corrections
- Ouverture des apps depuis leur icône et retour vers elle (et vers la fenêtre sur iPad).
- Raccourcis Lampe / Appareil photo sur l'écran verrouillé.
- Ombre de la bannière de notification qui dépassait en haut de l'écran.
- Invite « Touchez l'écran » invisible en thème sombre (blanc sur blanc).
- Préchargement des polices.

## 12 — Retouches (15 novembre 2026, soir)

- **Spotify** : `createController()` de l'API Spotify *remplace* l'élément qu'on lui donne. Il était
  appelé sans `uri` : le lecteur remplaçant n'avait plus la playlist. Il reçoit maintenant
  `spotify:playlist:7dMYV3uIkXFqOYZSfFBjk8` (lu dans le `src` de l'iframe d'origine) et prend toute la
  place de l'app. Le script de l'API est chargé *après* `onSpotifyIframeApiReady`. L'iframe reste
  dans la page : la musique continue quand on quitte l'app.
- **iPad** : logo du fond d'accueil et logo 3D du verrou au centre exact ; orientation portrait
  (834 × 1194) quand la fenêtre est plus haute que large (`html.ipad.portrait`).
- **Paname** : campagne d'affichage Filiz (`images/filiz/`, 3 visuels officiels, format d'origine,
  cadre alu, lumière de voûte, reflet de vitre ; écran numérique sur la ligne 14). Touches kawaii :
  barrette étoile rose, cœurs et étincelles, poussière rose discrète, autocollant holographique
  « Filiz ✿ edition », kaomoji dans les écrans de fin.
- **320** : quatre zones pendant l'ascension (Virtual Stage → Cyber Sky → Hyperpop Orbit → Glitch Void),
  formes chromées Y2K, planètes, polyèdre 3D, fenêtres d'erreur, égaliseur au tempo, bannières de
  zone, CD chromé bonus (+750), fantômes chromatiques, distorsion VHS en fin de partie, fenêtre
  « satine.exe » avec logo chromé animé, écran d'attente animé.

## 13 — Musique de 320 et classements en ligne (16 novembre 2026)
- **Musique 320** : `sounds/satine-320-loop.mp3`, jouée par WebAudio (`AudioBufferSourceNode`, `loop`)
  → aucune coupure. Boucle = 126 mesures à 164,77 BPM (`LOOP_END` = 183,53 s). Le tempo du jeu
  (anneau, ON BEAT) suit la musique à la blanche (82,4 BPM). Chargée à l'ouverture de 320 seulement.
  Pause en quittant le jeu, reprise au même endroit. Bouton ♪ (musique seule, mémorisé :
  `selecta-320-music`). Si Spotify joue (`data-spotify="1"`), la musique du jeu attend qu'on touche ♪.
  Si le fichier ne se charge pas, l'ancienne boucle synthé prend le relais.
- **Classements** : `leaderboard.js` (client), `leaderboard-config.js` (URL + clé publishable),
  `supabase/classements.sql` (base + fonctions sécurisées). Mode d'emploi : `CLASSEMENTS-SUPABASE.md`.
  Identifiant joueur anonyme : `selecta-player` ; pseudo : `selecta-pseudo`.

## 14. Classements en ligne — mise en service
- Projet Supabase « selecta-jeux » (organisation Selecta Agency, région Paris eu-west-3, offre gratuite).
- Base installée depuis supabase/classements.sql (durcie : search_path fixé, droits PUBLIC retirés).
- leaderboard-config.js rempli avec l'URL du projet et la clé publique (sb_publishable_…). Aucune clé secrète dans le site.
- Vérifié dans la base en rôle anonyme : lecture/écriture directe des tables refusée, faux score refusé, jeton réutilisé refusé, pseudo injurieux refusé, vrai score 320 et Paname acceptés, TOP 10 et rang corrects.

## 15. Audit de novembre 2026 — priorités 1, 2, 3 et 5 mises en œuvre
**Finitions**
- Barre d'état : un script pose `data-bar="dark|light"` sur le téléphone selon le haut de l'écran affiché (écrans forcés : lock, plan, cam, calc, game, metro ; ailleurs, couleur lue sous la barre). Règles CSS en fin de feuille, bloc « FINITIONS ».
- Instagram : plus de textes de travail (note, « légende à écrire », « commentaires à reprendre ») ; sans légende, lien « Légende et commentaires sur Instagram ». Onglets Reels / Identifié masquent la grille. Les ronds « à la une » ouvrent la fiche de l'artiste (NUMAH : le compte Instagram).
- Photos vide : « Pas encore de photos ».
- Calendrier : dates officielles toujours lues dans le code (non supprimables, bouton « Billets » → DICE) ; seuls les ajouts du visiteur sont gardés (`selecta-events-mine`, reprise automatique de l'ancien `selecta-events-v3`).
- Flèche retour fantôme : `render()` annonce désormais `app:screen` aussi pour les gestes.
- Données : Suzane, Bars en Trans, intitulés des fiches (`facts: [[intitulé, valeur]]`), prochaine date calculée depuis `SHOWS_DATA`. DICE : sans billetterie, bouton « Plan » (carte filtrée sur l'artiste) au lieu de « Bientôt ».
- YouTube : filtre actif lisible en clair, barre du bas toujours en bas.
- Calculatrice : priorité des opérations, pourcentage iOS, arrondi (0,1 + 0,2 = 0,3), « = » répété.
- Spotify : plus d'indicateur « lecture » inventé si le lecteur est bloqué ; carte « Écouter sur Spotify » à la place.
- 320 : quitter en pleine partie la met en pause ; au retour, décompte 3-2-1.
**Partage**
- Historique : chaque app ouverte = une étape ; retour du navigateur / Android = fermer l'app. Revenir à l'accueil replie l'historique.
- Liens directs : `#satine #filiz #mitty #320 #paname #concerts #contact #calendrier #plan #youtube #instagram #spotify #agence #messages`.
- Aperçu de partage : `og-image.jpg` (1200×630), balises Open Graph / Twitter, favicons `icons/favicon-32.png` et `-192.png`, URL canonique https://selecta.agency/.
**Fiche artiste carrefour** (artistes.js) : prochaine date + billets, bloc « Son univers dans le téléphone » : jeu, clips (YouTube filtré), concerts (Plan filtré), messages, booking (mail pré-rempli).
**Téléphone vivant** : de J-3 à J+1 d'un concert de `SHOWS_DATA`, l'artiste écrit (conversation simulée, signalée), avec le lien billets ; le bandeau ouvre la conversation. Test : `__liveCandidates(new Date('2026-11-19'))`.
