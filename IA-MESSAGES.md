# Messages : passer des réponses simulées à une vraie IA

## Ce qui marche aujourd'hui, sans rien installer

Dans l'app Messages, les fils **Satine**, **Camille Dumora**, **Axel Logan** et **Le voisin du
dessous** répondent quand on leur écrit. Ces réponses sont **simulées dans le navigateur** : chaque
contact a sa personnalité et ses répliques (objet `PERSONAS` dans `index.html`), rien n'est envoyé
nulle part. Un bandeau le dit dans chaque conversation.

C'est volontaire : une vraie IA ne peut pas être appelée depuis une page HTML seule sans y écrire la
clé API, qui serait alors lisible par n'importe quel visiteur.

## Brancher une vraie IA (30 minutes)

1. **Garder le dossier `netlify/functions/chat.js`** à la racine du site.
2. **Déployer sur Netlify** (le glisser-déposer d'un zip suffit, les fonctions sont détectées).
3. Dans Netlify → *Site settings* → *Environment variables*, créer :
   `ANTHROPIC_API_KEY` = la clé prise sur console.anthropic.com
   (facultatif) `SITE_ORIGIN` = `https://selecta.agency`, pour que seul le site puisse appeler la fonction.
4. Dans `index.html`, chercher `var AI_ENDPOINT = '';` et écrire :
   `var AI_ENDPOINT = '/.netlify/functions/chat';`
5. Recharger le site : les contacts répondent maintenant via le modèle.

En cas de problème (clé absente, quota, coupure réseau), la page **revient automatiquement aux
réponses simulées** : aucune conversation ne se bloque.

### Sur Vercel plutôt que Netlify
Déplacer le fichier dans `api/chat.js`, remplacer la dernière ligne `exports.handler = …` par un
`export default async function handler(req, res)` équivalent, et mettre
`var AI_ENDPOINT = '/api/chat';`.

## Modifier les personnalités

Dans `index.html`, objet `PERSONAS` :

- `persona` : la consigne envoyée au modèle (qui est le contact, son ton, ses sujets).
- `greet` / `rules` / `fall` : les répliques du mode simulé. `rules` est une liste
  `[expression régulière, réponses possibles]`, testée dans l'ordre.

Ajouter un contact : une entrée dans `CONVS` (le fil de départ) **et** une entrée du même `id` dans
`PERSONAS` (sans quoi la zone de saisie reste masquée pour ce contact).

## Garde-fous déjà en place

- Le bandeau « réponses simulées » s'affiche en haut de chaque conversation.
- La consigne serveur interdit au modèle d'inventer des informations personnelles réelles
  (numéros, adresses, montants, dates signées).
- L'historique reste dans le navigateur du visiteur (`localStorage`, clé `selecta-chat`) et n'est
  jamais envoyé ailleurs que vers la fonction, 12 derniers messages au maximum.
