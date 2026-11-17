/* =====================================================================
   MERCH — boutiques officielles des artistes
   =====================================================================

   Deux façons d'alimenter l'app, par artiste :

   1. SYNCHRONISATION AUTOMATIQUE — boutiques Shopify
      Il suffit de renseigner `domain`. L'app lit en direct la boutique
      (Storefront API de Shopify, accès public aux produits, sans jeton) :
      produits, photos, prix, tailles et disponibilités, à chaque ouverture.
      Si la boutique refuse l'accès sans jeton, ajouter un jeton PUBLIC dans
      `token` (voir MERCH-SHOPIFY.md : 5 minutes, gratuit, lecture seule).

   2. CATALOGUE MANUEL (en attendant le jeton, ou boutique non Shopify)
      Les produits listés dans `products` s'affichent tels quels.
      ⚠ À tenir à jour à la main : prix, photos, disponibilité.

   Un artiste sans boutique (`shop: null`) s'affiche avec « Collection à venir » :
   aucun faux produit.
   ===================================================================== */
window.SELECTA_MERCH = window.SELECTA_MERCH || {
  apiVersion: '2026-10',
  artists: {
    satine: {
      shop: 'https://satine.shop/',
      shopLabel: 'satine.shop',
      /* synchronisation automatique (Shopify) ; jeton public facultatif */
      domain: 'satine.shop',
      token: '',
      /* Un seul poster dans la grille : l'article de la boutique qui fait doublon
         avec la fiche « Poster Anomalisa » est masqué. */
      exclude: ['poster du dernier clip'],
      /* Les deux articles en vente (fournis par l'agence le 17/11/2026) : textes, prix et photos
         OFFICIELS, affichés tels quels. La synchronisation Shopify n'y ajoute que le lien exact de
         l'article, les tailles et la disponibilité (épuisé ou non). Un nouvel article mis en vente
         sur la boutique apparaît automatiquement à la suite. */
      products: [
        {
          id: 'satine-barrettes-eclair',
          match: 'barrette',                 /* pour le relier à l'article de la boutique Shopify */
          title: 'Barrettes éclair',
          subtitle: 'Pack de 3',
          price: 25, currency: 'EUR', available: true,
          images: ['images/merch/satine-barrettes-eclair.webp'],
          look: 'object',                    /* photo détourée : posée sur un fond doux */
          category: 'Accessoires',
          description: 'Trois barrettes éclair : blanche au tracé rose, bleue et noire. Comme celles que je porte, mais pour TES cheveux.',
          credit: 'Collab w/ @arcane_etoile',
          url: 'https://satine.shop/'
        },
        {
          id: 'satine-poster-anomalisa',
          match: 'anomalisa',
          title: 'Poster Anomalisa',
          subtitle: 'Grand format',
          price: 10, currency: 'EUR', available: true,
          images: ['images/merch/satine-poster-anomalisa.webp'],
          look: 'print',                     /* présenté comme un tirage, avec sa marge blanche */
          category: 'Poster',
          description: 'L’artwork du clip Anomalisa en grand format, pour remplacer ce vieux poster que tu n’assumes plus. Impression de qualité, mur non fourni.',
          credit: 'Artwork by @pachiwisu',
          url: 'https://satine.shop/'
        }
      ]
    },
    filiz: { shop: null },
    mitty: { shop: null }
  }
};
