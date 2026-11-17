# Selecta Agency — faux iPhone (reprise de projet)

Site vitrine de l'agence **Selecta** (management d'artistes, publishing, consulting — Paris),
présenté comme un **iPhone iOS interactif** : écran verrouillé, écran d'accueil, apps réelles,
centres de notification et de contrôle, dock, mode sombre.

## Lancer en local

```bash
cd selecta-last
python3 -m http.server 8782
# → http://localhost:8782/index.html
```

Ne pas servir avec un serveur mono-thread : la page charge ~40 médias d'un coup.
Un petit serveur multithread est fourni dans `/tmp/serve_selecta.py` (hors projet) —
le recréer si besoin : `ThreadingHTTPServer` + `request_queue_size = 256`.

## Structure

```
index.html        Tout le HTML + CSS + JS du téléphone (gros fichier, ~7 200 lignes)
photos.js         Visionneuse Photos (pellicule, boutons ronds, barre vidéo)
camera.js         Appareil photo
artistes.js       Fiches artistes
legal/            mentions-legales.html, confidentialite.html, cgv.html, legal.css
fonts/            Archivo + Inter en woff2, hébergées en local (RGPD)
vendor/           maplibre/ (carte du Plan), leaflet/ (legacy)
images/           fonds, sprites, icônes d'apps, miku-gag.png
icons/            logo-source.png (logo Selecta 900×900), icônes iOS
photos/           photos artistes (satine, filiz, mitty — + versions -hd)
ig/               visuels du feed Instagram simulé
gallery/          galerie Photos
sounds/           unlock.wav, paname-8bit.m4a (musique 8-bit du jeu métro)
```

## Conventions à respecter

- **Géométrie iPhone 15** : 393 × 852, coins 55, Dynamic Island 125 × 37, barre d'état 54 px,
  icônes 60 × 60 rayon 13,5, dock 82 px, home indicator 139 × 5.
- **Thème clair par défaut**, sombre `#0B0B0F`. Basculer : `window.theme.set('dark'|'light')`.
- **Polices et cartes hébergées en local** — aucune requête Google Fonts / unpkg (conformité RGPD).
- **Pas de faux chiffres** : les données affichées (dates, adresses de salles, liens) sont réelles.
- **Répondre en français**, ton simple, sans jargon.

## Apps et écrans (`data-screen`)

`lock, home, library, gallery, notes, cal, mgmt, plan, listen, msg/msgs, thread, ig, game,
yt, ytwatch, metro, cam, dice, calc, clock, meteo, wa`

Hook émis à chaque changement : `document.dispatchEvent(new CustomEvent('app:screen', {detail: screen}))`

Hooks de debug utiles : `window.__open(app)`, `window.__cal`, `window.__APPS`, `window.__gs`,
`window.__map`, `window.__spotifyCtrl`.

## Points déjà réglés (ne pas casser)

- **Logo 3D** : une géométrie extrudée par forme, décalée de 1,5 mm en Z, sans biseau
  (évite le liseré aux jonctions). Source : `icons/logo-source.png`.
- **Carte du Plan** : MapLibre GL + style OpenFreeMap « positron », recadrage auto sur les
  8 concerts (`fitTo` sur `load`, sur `app:screen === 'plan'` et sur `resize`).
- **Messages** : scénarios scriptés une seule fois par conversation, persistés dans
  `localStorage` (`selecta-chat`). Satine / Axel / Camille.
- **Clavier mobile** : `visualViewport` → variable CSS `--kb` sur `.screen[data-app="thread"]`.
- **Dynamic Island** : pastille verte pilotée par l'API de l'embed Spotify (`playback_update`).
- **Jeu 320 (Satine)** : plateformes one-way (tuile `2`), personnage aux cheveux bruns,
  bonus = mascottes FNAF + chat noir rare (« Ben ben !!! » seulement), **aucun autre texte**.
  Le sprite Miku est l'image fournie par l'utilisateur : `images/miku-gag.png`.
- **Jeu Paname** : rames MF77, plaques de station, carte Navigo, panneau d'attente ;
  musique `sounds/paname-8bit.m4a` (filtrée 8-bit, coupée en pause/menu).

## Ce qui reste à faire

1. **Mise en ligne publique stable** (domaine à brancher) — aujourd'hui seulement un tunnel
   temporaire + serveur local.
2. Sons iOS réels à brancher (`message recu.wav`, `deverouillage.mp3`, `message send.mp3`,
   `keyboard typing.mp3` sont dans ~/Downloads, non intégrés).
3. Pages légales : champs `[À COMPLÉTER]` (SIRET, adresse, hébergeur) avant publication.
