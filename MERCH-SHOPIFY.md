# App Merch — synchronisation avec les boutiques

## Comment l'app récupère les produits

La boutique de Satine (satine.shop) tourne sur **Shopify**. Shopify propose une API publique,
la *Storefront API*, faite exactement pour ça : afficher les produits d'une boutique sur un autre site.

L'app Merch l'interroge **à chaque ouverture** :
titres, photos, prix, tailles, disponibilités (épuisé ou non) et lien de chaque article.
Le dernier catalogue reçu est gardé dans le navigateur du visiteur : l'app s'affiche
instantanément, puis se met à jour.

Le bouton **Acheter** ouvre la page de l'article sur satine.shop, avec la taille choisie.
Le paiement et la livraison se font sur la boutique officielle : rien n'est vendu sur selecta.agency.

## Étape 1 — rien à faire (normalement)

Depuis 2025, Shopify autorise la lecture des produits **sans jeton** (accès « tokenless »).
`merch-config.js` contient déjà `domain: 'satine.shop'` : une fois le site en ligne,
ouvre l'app Merch. Si tu vois un petit point vert à côté de « Boutique officielle »,
la synchronisation fonctionne. Tu n'as plus jamais besoin de mettre les produits à jour à la main.

## Étape 2 — si le point vert n'apparaît pas : créer un jeton public (5 min, gratuit)

1. Dans l'admin Shopify de satine.shop, installe l'app gratuite **Headless** (Shopify App Store).
2. Clique **Create storefront**.
3. Dans **Storefront API**, vérifie que les autorisations de lecture des produits
   (*product listings*, *product inventory*) sont cochées.
4. Copie le **Public access token** (jamais le *private* !).
5. Dans `merch-config.js`, colle-le dans `token: ''` pour Satine.
6. Dans Shopify, vérifie que les produits sont **disponibles sur le canal Headless**
   (fiche produit → « Canaux de vente »).

Le jeton public ne donne accès qu'à ce que n'importe quel visiteur voit déjà sur la boutique :
ni commandes, ni clients, ni chiffre d'affaires.

## En cas de panne

Si la boutique ne répond pas (coupure, hors ligne), l'app affiche le **catalogue de secours**
écrit dans `merch-config.js` (2 articles relevés le 17/11/2026).
⚠ Vérifier les prix de ce catalogue : la page de satine.shop affiche « 10€ » et « 25€ »
sans préciser lequel va avec quel article.

## Ajouter Filiz ou Mitty

Le jour où une boutique ouvre, remplacer dans `merch-config.js` :

```js
filiz: { shop: null },
```
par
```js
filiz: { shop: 'https://boutique-de-filiz.fr/', shopLabel: 'boutique-de-filiz.fr', domain: 'boutique-de-filiz.fr', token: '', products: [] },
```
L'artiste passe automatiquement de « Collection à venir » à sa vraie boutique.
Pour une boutique qui n'est pas sur Shopify, laisser `domain` vide et remplir `products` à la main.
