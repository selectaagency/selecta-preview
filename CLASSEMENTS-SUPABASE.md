# Activer les classements en ligne (10 minutes, gratuit)

Les deux jeux (320 et Paname rend fou) ont leur classement mondial, prêt à fonctionner.
Il manque seulement une base de données à toi. Tant qu'elle n'est pas branchée, les jeux
affichent « Classement en ligne bientôt disponible » et n'inventent aucun score.

## 1. Créer le projet Supabase
1. Va sur https://supabase.com, crée un compte (gratuit), puis **New project**.
2. Nom : `selecta-jeux` · Région : **West EU (Paris)** · choisis un mot de passe de base
   (garde-le pour toi, le site n'en a pas besoin). Attends ~2 minutes que le projet soit prêt.

## 2. Installer la base des classements
1. Menu de gauche : **SQL Editor** → **New query**.
2. Ouvre le fichier `supabase/classements.sql` du site, copie **tout** son contenu, colle-le, clique **Run**.
3. Tu dois voir « Success. No rows returned ». (Tu peux le relancer sans risque : il ne casse rien.)

## 3. Brancher le site
1. **Project Settings** → **API Keys** : copie la clé **Publishable** (`sb_publishable_…`).
   S'il n'y en a pas, clique **Create new API keys**. (L'ancienne clé « anon » marche aussi.)
2. **Project Settings** → **Data API** (ou le bouton **Connect**) : copie la **Project URL**
   (`https://xxxxxxxx.supabase.co`).
3. Ouvre `leaderboard-config.js` et colle les deux valeurs :
   ```js
   window.SELECTA_LB = window.SELECTA_LB || {
     url: 'https://xxxxxxxx.supabase.co',
     key: 'sb_publishable_xxxxxxxx'
   };
   ```
4. Remets le site en ligne. C'est tout.

Ne mets **jamais** la clé *secret* (`sb_secret_…`) ni le mot de passe de la base dans le site.

## Vérifier
Joue une partie de 320, perds, tape un pseudo, **SAVE** : ton score apparaît dans HIGH SCORES.
Dans Supabase → **Table Editor** → `lb_scores`, tu vois la ligne.

## Modérer
- Supprimer un score : Table Editor → `lb_scores` → sélectionner la ligne → Delete.
- Tout remettre à zéro pour un jeu : SQL Editor →
  `delete from lb_scores where game = '320';` (ou `'paname'`).

## Ce qui protège le classement
- Les tables sont fermées : le site ne peut ni lire ni écrire dedans directement.
- Chaque partie reçoit un **jeton** du serveur au départ ; le serveur chronomètre la partie.
  Un score ne peut pas dépasser ce qu'il est possible de faire dans ce temps réel.
- 320 : le score doit correspondre exactement à la hauteur atteinte + bonus, avec des plafonds de vitesse.
- Paname : le serveur **recalcule** le score à partir des tickets, pass Navigo, temps et fraudes,
  avec les maxima de chaque station et un temps minimal par station.
- Un jeton ne sert qu'une fois ; 30 parties / 10 min par joueur, 120 / 10 min par adresse IP.
- Pseudos filtrés (2 à 14 caractères, liste de mots interdits).

Limite honnête : un jeu qui tourne dans le navigateur ne peut pas être rendu inviolable. Ces
contrôles empêchent les faux scores grossiers, les envois en rafale et les records impossibles ;
un tricheur très motivé pourrait encore produire un score « plausible ». La modération (ci-dessus)
couvre ce cas.

## Comment les scores sont comptés
- **320** : le meilleur score de chaque joueur (en streams).
- **Paname rend fou** : la somme des meilleurs scores de chaque station (5 stations).
  Score d'une station = tickets × 100 + pass Navigo × 500 + étoiles × 1 000
  + bonus de vitesse (20 points par seconde sous 1,5 × le temps objectif) − 200 par fraude.

## Mise à jour « Paname rend fou » v2 (13 stations, speedrun)

Exécuter **une fois** `supabase/paname_v2.sql` dans Supabase (SQL Editor → coller → Run),
après `classements.sql`. Il ne supprime rien : il ajoute les règles des 8 nouvelles stations,
le classement **SPEEDRUN** (niveau 100 = ligne complète, temps le plus court) et la fonction
`lb_top2` (TOP SCORES avec départage au temps, ou SPEEDRUN). Tant qu'il n'est pas exécuté,
le site reste fonctionnel : le tableau des scores s'affiche comme avant et le speedrun
indique « bientôt en ligne ».
